import { supabase } from '../lib/supabaseClient';

export const notificationService = {
  /**
   * Syncs notifications by checking member statuses and creating alerts.
   * Replaced RPC with JS logic for "Trial Ending Today", "Plan Expired", "Plan Expiring Soon".
   */
  async syncNotifications(gymId) {
    if (!gymId) return { error: 'No gym provided' };
    
    try {
      // 1. Fetch active, expiring, and trial members
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, full_name, status, expiry_date, membership_plan')
        .eq('gym_id', gymId);
        
      if (membersError) throw membersError;

      // 2. Fetch recent notifications to avoid duplicates (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentNotifs, error: notifsError } = await supabase
        .from('notifications')
        .select('type, related_member_id')
        .eq('gym_id', gymId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (notifsError) throw notifsError;

      const existingSet = new Set(
        recentNotifs.map(n => `${n.type}_${n.related_member_id}`)
      );

      const newNotifications = [];

      // 3. Evaluate each member
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      members.forEach(m => {
        if (!m.expiry_date) return;
        
        const expiry = new Date(m.expiry_date);
        expiry.setHours(0, 0, 0, 0);
        
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        // --- Trial logic ---
        if (m.status === 'trial') {
          if (diffDays === 0) {
            const key = `trial_ending_${m.id}`;
            if (!existingSet.has(key)) {
              newNotifications.push({
                gym_id: gymId,
                related_member_id: m.id,
                type: 'trial_ending',
                title: 'Trial Ending Today',
                message: `${m.full_name}'s trial ends today. Reach out to convert them!`,
                is_read: false
              });
              existingSet.add(key); // prevent multiple in same run
            }
          } else if (diffDays < 0) {
            const key = `trial_expired_${m.id}`;
            if (!existingSet.has(key)) {
              newNotifications.push({
                gym_id: gymId,
                related_member_id: m.id,
                type: 'trial_expired',
                title: 'Trial Expired',
                message: `${m.full_name}'s trial has expired.`,
                is_read: false
              });
              existingSet.add(key);
            }
          }
        }
        
        // --- Active/Expired logic ---
        if (m.status === 'expired' || diffDays < 0) {
          const key = `membership_expired_${m.id}`;
          if (!existingSet.has(key) && m.status !== 'trial') {
            newNotifications.push({
              gym_id: gymId,
              related_member_id: m.id,
              type: 'membership_expired',
              title: 'Plan Expired',
              message: `${m.full_name}'s ${m.membership_plan || 'plan'} has expired.`,
              is_read: false
            });
            existingSet.add(key);
          }
        } else if (m.status === 'expiring_soon' || (diffDays >= 0 && diffDays <= 3 && m.status !== 'trial')) {
          const key = `membership_expiring_${m.id}`;
          if (!existingSet.has(key)) {
            newNotifications.push({
              gym_id: gymId,
              related_member_id: m.id,
              type: 'membership_expiring',
              title: 'Plan Expiring Soon',
              message: `${m.full_name}'s ${m.membership_plan || 'plan'} expires in ${diffDays} days.`,
              is_read: false
            });
            existingSet.add(key);
          }
        }
      });

      // 4. Insert new notifications
      if (newNotifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(newNotifications);
          
        if (insertError) throw insertError;
      }

      return { success: true, count: newNotifications.length };
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
