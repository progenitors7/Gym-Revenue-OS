import { supabase } from '../lib/supabaseClient';
import { subscriptionService } from './subscriptionService';
import { paymentService } from './paymentService';
import { updateMember } from './memberService';

/**
 * Unified service for handling "Smart Actions" that involve multiple tables.
 */
export const unifiedService = {
  /**
   * Smart Renew: Creates a subscription and a payment record in one go.
   * This triggers the DB to update the member's status and expiry.
   */
  async smartRenew(gymId, memberId, planData, paymentData) {
    try {
      // 1. Create Subscription
      // The DB trigger 'update_member_from_sub_trigger' will automatically 
      // update members.expiry_date and members.membership_plan.
      const subscription = await subscriptionService.createSubscription(gymId, {
        member_id: memberId,
        plan_name: planData.plan_name,
        duration_type: planData.duration_type,
        amount: planData.amount,
        start_date: planData.start_date || new Date().toISOString().split('T')[0],
        expiry_date: planData.expiry_date // Will be calculated by service if not provided
      });

      // 2. Create Payment (linked to the new subscription)
      if (paymentData && paymentData.amount_paid > 0) {
        await paymentService.createPayment(gymId, {
          member_id: memberId,
          subscription_id: subscription.id,
          amount_paid: paymentData.amount_paid,
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          payment_method: paymentData.payment_method || 'cash',
          payment_status: paymentData.payment_status || 'paid',
          notes: paymentData.notes || `Smart renewal for ${planData.plan_name}`
        });
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error in smartRenew:', error);
      throw error;
    }
  },

  /**
   * Backfill: When a new member is created, ensure they have a subscription record
   * so that the history and analytics are accurate.
   */
  async recordInitialMemberSetup(gymId, member) {
    if (!member.membership_plan) return;

    try {
      // Create a subscription record to match the member's initial plan
      const subscription = await subscriptionService.createSubscription(gymId, {
        member_id: member.id,
        plan_name: member.membership_plan,
        duration_type: 'monthly', // Default or guess based on plan name
        amount: 0, // We don't know the amount here, but we record the intent
        start_date: member.join_date,
        expiry_date: member.expiry_date
      });

      return subscription;
    } catch (error) {
      console.error('Error recording initial setup:', error);
      // Don't throw, we don't want to break member creation if backfill fails
    }
  }
};
