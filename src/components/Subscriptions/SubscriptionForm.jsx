import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';

export default function SubscriptionForm({ onSubmit, initialData = null, isSubmitting = false }) {
  const navigate = useNavigate();
  const { members, fetchMembers } = useMembers();

  const [formData, setFormData] = useState({
    member_id: initialData?.member_id || '',
    plan_name: initialData?.plan_name || '',
    duration_type: initialData?.duration_type || 'monthly',
    amount: initialData?.amount || '',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    expiry_date: initialData?.expiry_date || '', // Only shown/used if duration_type is 'custom'
  });

  useEffect(() => {
    if (members.length === 0) {
      fetchMembers();
    }
  }, [fetchMembers, members.length]);

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
              disabled={!!initialData} // Cannot change member when editing
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

        {/* Plan Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Plan Name</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              name="plan_name"
              required
              value={formData.plan_name}
              onChange={handleChange}
              placeholder="e.g. Pro Membership"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Duration Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Duration Type</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              name="duration_type"
              value={formData.duration_type}
              onChange={handleChange}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="monthly">Monthly (+30 Days)</option>
              <option value="quarterly">Quarterly (+90 Days)</option>
              <option value="yearly">Yearly (+365 Days)</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="date"
              name="start_date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Custom Expiry Date */}
        {formData.duration_type === 'custom' && (
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Custom Expiry Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="date"
                name="expiry_date"
                required={formData.duration_type === 'custom'}
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors [color-scheme:dark]"
              />
            </div>
            <p className="text-xs text-slate-500 ml-1 mt-1">
              For standard durations (Monthly, Quarterly, Yearly), the expiry date is calculated automatically.
            </p>
          </div>
        )}

      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/subscriptions')}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Subscription' : 'Create Subscription'}
        </button>
      </div>
    </form>
  );
}
