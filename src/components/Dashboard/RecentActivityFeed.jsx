import { formatDistanceToNow } from 'date-fns';

export default function RecentActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl">
        <p className="text-slate-400 text-sm">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          // Icons based on type
          let icon = null;
          let iconColor = "";
          
          if (activity.type === 'member_joined') {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            );
            iconColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          } else if (activity.type === 'payment_received') {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
            iconColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
          } else {
            icon = (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
            iconColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
          }

          return (
            <div key={`${activity.type}-${activity.id}-${index}`} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  {icon}
                </div>
                {index !== activities.length - 1 && (
                  <div className="w-px h-full bg-slate-700/50 mt-2 mb-1"></div>
                )}
              </div>
              
              {/* Content */}
              <div className="pb-4">
                <p className="text-sm font-medium text-white">{activity.title}</p>
                <p className="text-sm text-slate-400 mt-0.5">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
