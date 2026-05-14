// @ts-nocheck — This file runs on Supabase Edge Runtime (Deno), not Node.js.
// URL imports and Deno globals are valid in that environment.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, amount, durationMonths, paymentData, promoId } = body
    
    console.log(`EDGE_FUNCTION_LOG: Received action=${action}`, { amount, durationMonths, promoId })

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_SECRET = Deno.env.get('RAZORPAY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
      console.error('EDGE_FUNCTION_ERROR: MISSING_SECRETS', { 
        hasKeyId: !!RAZORPAY_KEY_ID, 
        hasSecret: !!RAZORPAY_SECRET 
      })
      return new Response(JSON.stringify({ 
        error: 'Razorpay keys not configured in Supabase. Please add RAZORPAY_KEY_ID and RAZORPAY_SECRET to Function Secrets.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`EDGE_FUNCTION_LOG: Keys detected. ID starts with ${RAZORPAY_KEY_ID.substring(0, 4)}... and Secret starts with ${RAZORPAY_SECRET.substring(0, 4)}...`)

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Action: Create Order
    if (action === 'create-order') {
      console.log('EDGE_FUNCTION_LOG: Creating Razorpay order...')
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(RAZORPAY_KEY_ID + ':' + RAZORPAY_SECRET)
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Razorpay expects paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            durationMonths,
            promoId
          }
        })
      })

      const order = await response.json()
      if (order.error) {
        console.error('EDGE_FUNCTION_ERROR: Razorpay API Error', order.error)
        return new Response(JSON.stringify({ 
          error: `Razorpay Error: ${order.error.description || 'Order Creation Failed'}`,
          details: order.error
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      console.log('EDGE_FUNCTION_LOG: Order created successfully', { orderId: order.id })
      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Action: Verify Payment
    if (action === 'verify-payment') {
      console.log('EDGE_FUNCTION_LOG: Verifying payment...')
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData
      
      const signBody = razorpay_order_id + "|" + razorpay_payment_id;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(RAZORPAY_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signBody)
      );
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature !== razorpay_signature) {
        console.error('EDGE_FUNCTION_ERROR: Signature mismatch')
        throw new Error('Invalid payment signature')
      }

      console.log('EDGE_FUNCTION_LOG: Signature verified. Updating database...')

      // Get Order details from Razorpay to confirm amount and gym
      const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
        headers: {
          'Authorization': 'Basic ' + btoa(RAZORPAY_KEY_ID + ':' + RAZORPAY_SECRET)
        }
      })
      const orderDetails = await orderRes.json()

      // Update Gym and Create Subscription record
      const authHeader = req.headers.get('Authorization')!
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
      
      if (userError || !user) {
        console.error('EDGE_FUNCTION_ERROR: Auth failed', userError)
        throw new Error('User not authenticated')
      }

      const { data: gym, error: gymFetchError } = await supabaseClient
        .from('gyms')
        .select('id')
        .eq('owner_email', user.email)
        .single()

      if (gymFetchError) {
        console.error('EDGE_FUNCTION_ERROR: Gym not found', gymFetchError)
        throw new Error('Gym not found for this user')
      }

      // Update Gym Status
      const { error: updateError } = await supabaseClient
        .from('gyms')
        .update({ 
          status: 'active',
          saas_plan_id: '770f855a-535c-44f1-9604-0ba7a74c6f59' // Professional
        })
        .eq('id', gym.id)

      if (updateError) {
        console.error('EDGE_FUNCTION_ERROR: Update gym failed', updateError)
        throw new Error('Failed to update gym status')
      }

      // Log Subscription
      const { error: insertError } = await supabaseClient
        .from('saas_subscriptions')
        .insert([{
          gym_id: gym.id,
          plan_id: '770f855a-535c-44f1-9604-0ba7a74c6f59',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount: orderDetails.amount / 100,
          currency: 'INR',
          status: 'active',
          payment_status: 'captured',
          duration_months: orderDetails.notes?.durationMonths,
          promo_id: orderDetails.notes?.promoId
        }])

      if (insertError) {
        console.error('EDGE_FUNCTION_ERROR: Insert subscription failed', insertError)
        throw new Error('Failed to log subscription')
      }

      // Increment Promo Usage if applicable
      if (orderDetails.notes?.promoId) {
        await supabaseClient.rpc('increment_promo_usage', { promo_id: orderDetails.notes.promoId })
      }

      console.log('EDGE_FUNCTION_LOG: Subscription finalized successfully')
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('EDGE_FUNCTION_CATCH_ERROR:', message)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
