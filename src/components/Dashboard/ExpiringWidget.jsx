import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function ExpiringWidget({ members }) {
  if (!members || members.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Expiring Soon</h3>
        <p className="text-slate-500 text-sm">No members are expiring in the next 3 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Expiring Soon
        </h3>
        <Link to="/members" className="text-xs font-medium text-sky-400 hover:text-sky-300">View All</Link>
      </div>
      
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">{member.full_name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{member.phone_number}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                {member.expiry_date ? format(new Date(member.expiry_date), 'MMM d, yyyy') : 'No date'}
              </span>
              <br/>
              <Link to="/subscriptions" className="text-xs text-sky-400 hover:text-sky-300">Renew &rarr;</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
