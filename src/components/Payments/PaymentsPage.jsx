import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Receipt, Filter } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { payments, loading, error, fetchPayments } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.subscriptions?.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'upi': return 'UPI';
      case 'card': return 'Card';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">Track revenue and payment statuses</p>
        </div>
        <button
          onClick={() => navigate('/payments/new')}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Record Payment</span>
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
          {['all', 'paid', 'pending', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 min-h-[44px] flex items-center justify-center rounded-xl text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {status === 'all' ? 'All Payments' : status}
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
            onClick={fetchPayments}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No payments found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Record your first payment to start tracking revenue."}
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
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap">Member</th>
                  <th className="p-4 font-medium whitespace-nowrap">Plan</th>
                  <th className="p-4 font-medium whitespace-nowrap">Amount</th>
                  <th className="p-4 font-medium whitespace-nowrap">Date</th>
                  <th className="p-4 font-medium whitespace-nowrap">Method</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{payment.members?.full_name}</div>
                      <div className="text-slate-400 text-sm">{payment.members?.phone_number}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {payment.subscriptions?.plan_name || 'No Plan'}
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 font-bold">₹{payment.amount_paid}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-300">
                      {getMethodText(payment.payment_method)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
