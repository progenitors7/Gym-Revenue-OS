import { supabase } from '../lib/supabaseClient';

export const planService = {
  async getPlans(gymId) {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createPlan(gymId, planData) {
    const { data, error } = await supabase
      .from('membership_plans')
      .insert([{ ...planData, gym_id: gymId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlan(id, planData) {
    const { data, error } = await supabase
      .from('membership_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlan(id) {
    const { error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
