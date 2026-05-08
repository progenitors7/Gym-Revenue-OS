import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  /**
   * Syncs notifications by running the backend RPC.
   * This prevents duplicate processing by offloading logic to PostgreSQL.
   */
  async syncNotifications(gymId) {
    if (!gymId) return { error: 'No gym provided' };
    
    try {
      const { error } = await supabase.rpc('sync_gym_notifications', { p_gym_id: gymId });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error syncing notifications:', error);
      return { error };
    }
  },

  /**
   * Fetches all notifications for the current gym, ordered by newest first.
   */
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, type, title, message, related_member_id, is_read, created_at,
          members ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to recent 100

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { error };
    }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { error };
    }
  },

  /**
   * Marks all notifications as read for the current gym.
   */
  async markAllAsRead(gymId) {
    if (!gymId) return { error: 'No gym provided' };
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('gym_id', gymId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking all as read:', error);
      return { error };
    }
  }
};
