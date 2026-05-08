import { Link } from 'react-router-dom';

export default function PendingPaymentsWidget({ payments }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Pending Payments</h3>
        <p className="text-slate-500 text-sm">All payments are up to date.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Pending & Overdue
        </h3>
        <Link to="/payments" className="text-xs font-medium text-sky-400 hover:text-sky-300">View All</Link>
      </div>
      
      <div className="space-y-3">
        {payments.map(payment => (
          <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">{payment.members?.full_name || 'Unknown'}</p>
              <p className="text-xs text-rose-400 mt-0.5">{payment.payment_status === 'overdue' ? 'Overdue' : 'Pending'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">₹{payment.amount_paid}</p>
              <Link to="/payments" className="text-[10px] text-sky-400 hover:text-sky-300">Settle &rarr;</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
