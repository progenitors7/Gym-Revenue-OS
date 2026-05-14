import { supabase } from '../lib/supabaseClient';

export const superAdminService = {
  /**
   * Fetch platform-wide statistics for the Super Admin Dashboard.
   * NOTE: This requires RLS policies that allow the user to read all rows
   * or a service role key (which we avoid on client-side).
   */
  async getPlatformStats() {
    try {
      // 1. Total Gyms
      const { count: gymCount, error: gymError } = await supabase
        .from('gyms')
        .select('*', { count: 'exact', head: true });
      
      if (gymError) throw gymError;

      // 2. Total Members (across all gyms)
      const { count: memberCount, error: memberError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      
      if (memberError) throw memberError;

      // 3. Total Revenue (sum of all payments)
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('amount_paid')
        .not('amount_paid', 'is', null);
      
      if (paymentError) throw paymentError;

      const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);


      // 4. Monthly Gym Signups (Simple grouping for now)
      const { data: gymData, error: growthError } = await supabase
        .from('gyms')
        .select('created_at');
      
      if (growthError) throw growthError;

      // Basic growth calculation (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentGyms = gymData?.filter(g => new Date(g.created_at) >= thirtyDaysAgo).length || 0;

      return {
        totalGyms: gymCount || 0,
        totalMembers: memberCount || 0,
        totalRevenue,
        recentGyms,
        allGyms: gymData || []
      };
    } catch (error) {
      console.error('SuperAdmin Stats Error:', error);
      throw error;
    }
  },

  /**
   * Fetch all registered gyms with their status and metadata.
   */
  async getAllGyms() {
    const { data, error } = await supabase
      .from('gyms')
      .select('*, saas_plans(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a gym's operational status (active, blocked, etc.)
   */
  async updateGymStatus(gymId, status) {
    const { data, error } = await supabase
      .from('gyms')
      .update({ status })
      .eq('id', gymId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new platform-wide broadcast announcement.
   */
  async createBroadcast(broadcast) {
    const { data, error } = await supabase
      .from('broadcasts')
      .insert([broadcast])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Fetch all past broadcasts.
   */
  async getBroadcasts() {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Fetch all SaaS subscription tiers.
   */
  async getSaaSPlans() {
    const { data, error } = await supabase
      .from('saas_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new SaaS plan tier.
   */
  async createSaaSPlan(plan) {
    const { data, error } = await supabase
      .from('saas_plans')
      .insert([plan])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a gym's SaaS subscription level.
   */
  async updateGymSaaSPlan(gymId, planId) {
    const { data, error } = await supabase
      .from('gyms')
      .update({ saas_plan_id: planId })
      .eq('id', gymId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Fetch all support tickets with gym details.
   */
  async getTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, gyms(gym_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Update ticket status or add admin response.
   */
  async updateTicket(ticketId, updates) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Fetch global system configuration.
   */
  async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a global system setting (e.g. maintenance mode).
   */
  async updateSystemSetting(key, value) {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a broadcast announcement.
   */
  async deleteBroadcast(id) {
    const { error } = await supabase
      .from('broadcasts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Fetch active broadcasts for users (e.g., last 24-48 hours).
   */
  async getActiveBroadcasts() {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3); // Only show the most recent 3
    
    if (error) throw error;
    return data;
  }
};
