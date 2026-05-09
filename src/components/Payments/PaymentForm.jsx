import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Receipt, CreditCard, Calendar, FileText } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { useSubscriptions } from '../../hooks/useSubscriptions';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Member Selection */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Select Member</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              required
              disabled={!!initialData}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            >
              <option value="" disabled>Choose a member...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.phone_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subscription Selection (Optional) */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Related Subscription (Optional)</label>
          <div className="relative">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              name="subscription_id"
              value={formData.subscription_id}
              onChange={handleSubscriptionChange}
              disabled={!formData.member_id || !!initialData}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            >
              <option value="">No specific subscription / General payment</option>
              {memberSubscriptions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.plan_name} - ₹{sub.amount} ({sub.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Amount Paid (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
            <input
              type="number"
              name="amount_paid"
              required
              min="0"
              step="0.01"
              value={formData.amount_paid}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Payment Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Payment Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="date"
              name="payment_date"
              required
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Payment Method</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Payment Status</label>
          <div className="relative">
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Notes (Optional)</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>
        </div>

      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/payments')}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Payment' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}
