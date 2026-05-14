import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Receipt, CreditCard, Calendar, FileText } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import DatePicker from '../UI/DatePicker';

export default function PaymentForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const navigate = useNavigate();
  const { members, fetchMembers } = useMembers();
  const { subscriptions, fetchSubscriptions } = useSubscriptions();

  const [formData, setFormData] = useState({
    member_id: initialData?.member_id || '',
    subscription_id: initialData?.subscription_id || '',
    amount_paid: initialData?.amount_paid || '',
    payment_date: initialData?.payment_date || new Date().toISOString().split('T')[0],
    payment_method: initialData?.payment_method || 'cash',
    payment_status: initialData?.payment_status || 'paid',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    fetchMembers();
    fetchSubscriptions();
  }, [fetchMembers, fetchSubscriptions]);

  // Filter subscriptions to only those belonging to the selected member
  const memberSubscriptions = subscriptions.filter(sub => sub.member_id === formData.member_id);

  // Auto-fill amount if a subscription is selected
  const handleSubscriptionChange = (e) => {
    const subId = e.target.value;
    const selectedSub = memberSubscriptions.find(s => s.id === subId);
    
    setFormData(prev => ({
      ...prev,
      subscription_id: subId,
      amount_paid: selectedSub ? selectedSub.amount : prev.amount_paid
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Member Selection */}
        <div className="space-y-3 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Select Athlete</label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              required
              disabled={!!initialData}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium appearance-none focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all disabled:opacity-50"
            >
              <option value="" disabled>Choose an athlete...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.phone_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subscription Selection (Optional) */}
        <div className="space-y-3 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Connect Subscription (Optional)</label>
          <div className="relative group">
            <Receipt className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <select
              name="subscription_id"
              value={formData.subscription_id}
              onChange={handleSubscriptionChange}
              disabled={!formData.member_id || !!initialData}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium appearance-none focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all disabled:opacity-50"
            >
              <option value="">Direct Payment / General Deposit</option>
              {memberSubscriptions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.plan_name} • ₹{sub.amount} ({sub.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Payment Received (₹)</label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs group-focus-within:text-emerald-400 transition-colors">₹</div>
            <input
              type="number"
              name="amount_paid"
              required
              min="0"
              step="0.01"
              value={formData.amount_paid}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Payment Date */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Transaction Date</label>
          <DatePicker
            value={formData.payment_date}
            onChange={(val) => setFormData(prev => ({ ...prev, payment_date: val }))}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Transfer Gateway</label>
          <div className="relative group">
            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium appearance-none focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all"
            >
              <option value="cash">Physical Cash</option>
              <option value="upi">UPI Interface</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Direct Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Ledger Status</label>
          <div className="relative group">
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-medium appearance-none focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all"
            >
              <option value="paid">Verified Paid</option>
              <option value="pending">Pending Verification</option>
              <option value="overdue">Overdue / Failed</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 md:col-span-2">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Internal Reference (Optional)</label>
          <div className="relative group">
            <FileText className="absolute left-5 top-5 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Record transaction ID or specific notes..."
              rows={3}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
        <button
          type="button"
          onClick={() => navigate('/payments')}
          className="order-2 sm:order-1 flex-1 py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="order-1 sm:order-2 flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing…
            </span>
          ) : (
            <span>{initialData ? 'Update Ledger' : 'Authorize Payment'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
