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

      // 3. Total SaaS Revenue (sum of all SaaS subscriptions)
      const { data: saasPayments, error: saasError } = await supabase
        .from('saas_subscriptions')
        .select('amount')
        .not('amount', 'is', null);
      
      if (saasError) throw saasError;

      const totalRevenue = saasPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);


      // 4. Monthly Gym Signups & Growth Rate
      const { data: gymData, error: growthError } = await supabase
        .from('gyms')
        .select('created_at');
      
      if (growthError) throw growthError;

      // Basic growth calculation (last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      const recentGymsCount = gymData?.filter(g => new Date(g.created_at) >= thirtyDaysAgo).length || 0;
      const previousGymsCount = gymData?.filter(g => {
        const d = new Date(g.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      }).length || 0;

      // Calculate growth rate percentage
      let growthRate = 0;
      if (previousGymsCount === 0) {
        growthRate = recentGymsCount > 0 ? 100 : 0;
      } else {
        growthRate = Math.round(((recentGymsCount - previousGymsCount) / previousGymsCount) * 100);
      }

      return {
        totalGyms: gymCount || 0,
        totalMembers: memberCount || 0,
        totalRevenue,
        recentGyms: recentGymsCount,
        growthRate,
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
   * Send a direct system message to a specific gym owner.
   */
  async sendDirectMessage(gymId, messageData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        gym_id: gymId,
        type: 'system_message',
        title: messageData.title,
        message: messageData.message,
        is_read: false
      })
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
   * Update an existing SaaS plan tier.
   */
  async updateSaaSPlan(planId, updates) {
    const { data, error } = await supabase
      .from('saas_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a SaaS plan tier.
   */
  async deleteSaaSPlan(planId) {
    const { error } = await supabase
      .from('saas_plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    return true;
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
  },

  /**
   * Permanently delete a gym and all its associated data.
   */
  async deleteGym(gymId) {
    // Manually delete dependent records to avoid foreign key constraints
    await supabase.from('payments').delete().eq('gym_id', gymId);
    await supabase.from('subscriptions').delete().eq('gym_id', gymId);
    await supabase.from('notifications').delete().eq('gym_id', gymId);
    await supabase.from('members').delete().eq('gym_id', gymId);
    await supabase.from('membership_plans').delete().eq('gym_id', gymId);
    await supabase.from('saas_subscriptions').delete().eq('gym_id', gymId);
    await supabase.from('support_tickets').delete().eq('gym_id', gymId);
    
    const { error } = await supabase
      .from('gyms')
      .delete()
      .eq('id', gymId);
    
    if (error) throw error;
    return true;
  },

  /**
   * Fetch all SaaS subscriptions for all gyms (Billing History).
   */
  async getAllSaaSSubscriptions() {
    const { data, error } = await supabase
      .from('saas_subscriptions')
      .select('*, gyms(gym_name), saas_plans(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
