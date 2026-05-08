import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'payments', 'memberships'

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'payments') return n.type.includes('payment');
    if (filter === 'memberships') return n.type.includes('membership');
    return true;
  });

  const getIcon = (type) => {
    if (type === 'membership_expiring') return { icon: '⏳', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    if (type === 'membership_expired') return { icon: '❌', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    if (type === 'payment_due') return { icon: '💰', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    if (type === 'payment_overdue') return { icon: '🚨', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    return { icon: '🔔', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  };

  const getActionLink = (n) => {
    if (n.type.includes('payment')) return '/payments';
    return '/subscriptions';
  };

  if (loading) {
    return (
      <div className="p-5 sm:p-8 max-w-4xl mx-auto flex justify-center mt-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Operational alerts for your gym.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
        {['all', 'unread', 'payments', 'memberships'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4">🔔</div>
            <h3 className="text-white font-medium mb-1">No notifications found</h3>
            <p className="text-slate-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredNotifications.map(notification => {
              const { icon, color } = getIcon(notification.type);
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${notification.is_read ? 'opacity-70 hover:opacity-100' : 'bg-slate-800/60'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 text-xl ${color}`}>
                    {icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                      <h4 className={`font-semibold text-sm truncate ${notification.is_read ? 'text-slate-300' : 'text-white'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-medium text-slate-400 hover:text-white"
                        >
                          Mark as read
                        </button>
                      )}
                      <Link 
                        to={getActionLink(notification)} 
                        className="text-xs font-medium text-sky-400 hover:text-sky-300"
                      >
                        Take Action &rarr;
                      </Link>
                    </div>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-2 flex-shrink-0"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
