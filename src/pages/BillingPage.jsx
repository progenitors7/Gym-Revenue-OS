import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  Star,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Ticket,
  Clock,
  Gift
} from 'lucide-react';
import { useCurrentGym } from '../hooks/useCurrentGym';
import { superAdminService } from '../services/superAdminService';
import { supabase } from '../lib/supabaseClient';
import { razorpayService } from '../services/razorpayService';

const DURATIONS = [
  { months: 1, label: '1 Month', price: 499, discount: 0 },
  { months: 3, label: '3 Months', price: 1349, discount: 10, popular: true },
  { months: 6, label: '6 Months', price: 2399, discount: 20 },
  { months: 12, label: '12 Months', price: 4199, discount: 30 },
];

export default function BillingPage() {
  const { gym, isReady } = useCurrentGym();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Selection State
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [verifyingPromo, setVerifyingPromo] = useState(false);

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [isReady, gym?.saas_plan_id]);

  async function fetchData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gyms')
        .select('*, saas_plans(*)')
        .eq('id', gym?.id)
        .single();
      
      if (error) throw error;
      if (data?.saas_plans) {
        setCurrentPlan(data.saas_plans);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyPromo = async () => {
    if (!promoCode) return;
    try {
      setVerifyingPromo(true);
      setPromoError('');
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setPromoError('Invalid or expired code');
        setAppliedPromo(null);
        return;
      }

      // Check usage limits
      if (data.used_count >= data.max_uses) {
        setPromoError('This code has reached its usage limit');
        return;
      }

      // Check expiry
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        setPromoError('This code has expired');
        return;
      }

      setAppliedPromo(data);
      setPromoError('');
    } catch (err) {
      setPromoError('Error verifying code');
    } finally {
      setVerifyingPromo(false);
    }
  };

  const calculateFinalAmount = () => {
    let amount = selectedDuration.price;
    if (appliedPromo) {
      if (appliedPromo.discount_type === 'full_free') {
        return 0;
      } else if (appliedPromo.discount_type === 'percentage') {
        amount = amount * (1 - appliedPromo.discount_value / 100);
      } else if (appliedPromo.discount_type === 'fixed') {
        amount = Math.max(0, amount - appliedPromo.discount_value);
      }
    }
    return Math.round(amount);
  };

  const handleSubscribe = async () => {
    const finalAmount = calculateFinalAmount();
    
    try {
      setProcessing(true);

      // Handle 100% Discount / Offline Payment logic
      if (finalAmount === 0) {
        const { error: gymUpdateError } = await supabase
          .from('gyms')
          .update({ 
            status: 'active',
            saas_plan_id: '770f855a-535c-44f1-9604-0ba7a74c6f59' // Professional Plan
          })
          .eq('id', gym.id);
        
        if (gymUpdateError) throw gymUpdateError;

        // Create a record in saas_subscriptions for tracking
        await supabase
          .from('saas_subscriptions')
          .insert([{
            gym_id: gym.id,
            plan_id: '770f855a-535c-44f1-9604-0ba7a74c6f59',
            amount: 0,
            status: 'active',
            payment_status: 'captured',
            duration_months: selectedDuration.months,
            promo_id: appliedPromo?.id
          }]);

        // If promo code used, increment used_count
        if (appliedPromo) {
          await supabase.rpc('increment_promo_usage', { promo_id: appliedPromo.id });
        }

        alert('Subscription activated successfully via Promo Code!');
        window.location.reload();
        return;
      }
      
      // Standard Razorpay Flow
      const isLoaded = await razorpayService.loadScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      // Create Order
      const { data, error } = await supabase.functions.invoke('razorpay-subscription-v2', {
        body: { 
          action: 'create-order', 
          amount: finalAmount,
          durationMonths: selectedDuration.months 
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        // Try to get the detailed error message from the response if possible
        const errorMsg = error.message || 'Failed to create payment order';
        alert(`Billing Error: ${errorMsg}`);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Gym Revenue OS',
        description: `Pro Plan - ${selectedDuration.label}`,
        order_id: data.id,
        prefill: {
          email: gym?.owner_email || '',
        },
        handler: async (response) => {
          // Verify Payment
          const { error: verifyErr } = await supabase.functions.invoke('razorpay-subscription-v2', {
            body: { 
              action: 'verify-payment', 
              paymentData: response,
              promoId: appliedPromo?.id
            }
          });

          if (verifyErr) throw verifyErr;
          alert('Payment successful! Subscription active.');
          window.location.reload();
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert(err.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#3390ec] animate-spin" />
          <p className="text-gray-500 font-medium">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const finalAmount = calculateFinalAmount();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3390ec]/10 text-[#3390ec] rounded-full text-[10px] font-black uppercase tracking-widest">
          Premium Access
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Gym OS <span className="text-[#3390ec]">Pro Plan</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
          Unlock unlimited potential. One plan, everything included. 
          Choose a duration and start growing your fitness empire.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Duration Selection & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#212121] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-[#3390ec]" />
            </div>

            <h3 className="text-white font-black uppercase italic tracking-tight mb-8 flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-[#3390ec]" />
              Select Duration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DURATIONS.map((dur) => (
                <button
                  key={dur.months}
                  onClick={() => setSelectedDuration(dur)}
                  className={`relative p-6 rounded-3xl border-2 transition-all text-left group ${
                    selectedDuration.months === dur.months
                      ? 'bg-[#3390ec]/5 border-[#3390ec] shadow-xl shadow-[#3390ec]/10'
                      : 'bg-[#1c1c1c] border-white/5 hover:border-white/10'
                  }`}
                >
                  {dur.popular && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-400 text-black text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-black uppercase tracking-widest ${
                      selectedDuration.months === dur.months ? 'text-[#3390ec]' : 'text-gray-500'
                    }`}>
                      {dur.label}
                    </span>
                    {dur.discount > 0 && (
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        {dur.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹{dur.price}</span>
                    <span className="text-gray-600 text-[10px] font-bold">/ total</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {[
               "Unlimited Member Management",
               "Real-time Attendance Tracking",
               "Automated Payment Reminders",
               "SaaS Subscription Tools",
               "Super Admin Controls",
               "Premium 24/7 Support"
             ].map((feature, i) => (
               <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                   <CheckCircle2 className="w-4 h-4" />
                 </div>
                 <span className="text-gray-300 text-xs font-bold">{feature}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Right: Summary & Checkout */}
        <div className="space-y-6">
          <div className="bg-[#212121] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl sticky top-8">
            <h3 className="text-white font-black uppercase italic tracking-tight mb-8 text-xl">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Pro Plan ({selectedDuration.label})</span>
                <span className="text-white font-bold">₹{selectedDuration.price}</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-sm animate-in slide-in-from-top-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Ticket className="w-3 h-3" />
                    Promo: {appliedPromo.code}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    -{appliedPromo.discount_type === 'full_free' ? '₹' + selectedDuration.price : 
                      appliedPromo.discount_type === 'percentage' ? appliedPromo.discount_value + '%' : 
                      '₹' + appliedPromo.discount_value}
                  </span>
                </div>
              )}
              
              <div className="h-px bg-white/5 my-4" />
              
              <div className="flex justify-between items-baseline">
                <span className="text-white font-black uppercase italic text-lg">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#3390ec]">₹{finalAmount}</span>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-3 mb-8">
              <div className="relative">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="HAVE A PROMO CODE?"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={appliedPromo || verifyingPromo}
                  className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl pl-11 pr-4 py-4 text-xs font-black tracking-widest text-white focus:outline-none focus:border-[#3390ec]/50 transition-all uppercase disabled:opacity-50"
                />
                {appliedPromo ? (
                  <button 
                    onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 text-[10px] font-black uppercase hover:underline"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    onClick={handleVerifyPromo}
                    disabled={!promoCode || verifyingPromo}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3390ec] text-[10px] font-black uppercase hover:underline disabled:opacity-50"
                  >
                    {verifyingPromo ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {promoError && <p className="text-rose-500 text-[10px] font-bold ml-2">{promoError}</p>}
            </div>

            <button
              disabled={processing}
              onClick={handleSubscribe}
              className="w-full py-5 bg-[#3390ec] hover:bg-[#2b83d6] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#3390ec]/20 active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : finalAmount === 0 ? (
                <>
                  <Gift className="w-5 h-5" />
                  Redeem Now
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay & Subscribe
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[2.5rem]">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase italic text-lg tracking-tight">Need help choosing?</h4>
            <p className="text-gray-500 text-sm font-medium">Contact our support team for any billing related queries.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
}
