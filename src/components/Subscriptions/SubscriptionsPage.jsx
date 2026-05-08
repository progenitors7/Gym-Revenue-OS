import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, CreditCard, Filter } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { subscriptions, loading, error, fetchSubscriptions } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'expiring_soon': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">Manage member plans and renewals</p>
        </div>
        <button
          onClick={() => navigate('/subscriptions/new')}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by member or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {['all', 'active', 'expiring_soon', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {status === 'all' ? 'All Plans' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchSubscriptions}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No subscriptions found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by adding your first member subscription."}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-emerald-500 hover:text-emerald-400 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => (
            <div key={sub.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {sub.members?.full_name || 'Unknown Member'}
                  </h3>
                  <p className="text-slate-400 text-sm">{sub.members?.phone_number || 'No phone'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(sub.status)}`}>
                  {getStatusText(sub.status)}
                </span>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm font-medium">Plan</span>
                  <span className="text-white font-medium">{sub.plan_name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm font-medium">Duration</span>
                  <span className="text-white capitalize">{sub.duration_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-medium">Amount</span>
                  <span className="text-emerald-400 font-bold">₹{sub.amount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Start Date</span>
                  <span className="text-slate-300 mt-1">{new Date(sub.start_date).toLocaleDateString()}</span>
                </div>
                <div className="w-8 border-t-2 border-dashed border-slate-700"></div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Expiry Date</span>
                  <span className={`mt-1 font-medium ${sub.status === 'expired' ? 'text-red-400' : 'text-slate-300'}`}>
                    {new Date(sub.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
