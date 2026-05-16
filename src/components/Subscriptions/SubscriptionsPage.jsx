import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Phone,
  ArrowRight,
  Receipt,
  User,
  Zap,
  Target,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import StatusBadge from '../UI/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { subscriptions, loading, error, fetchSubscriptions } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Consolidate subscriptions: keep only the latest (by expiry_date) per member
  const consolidatedSubscriptions = Object.values(
    subscriptions.reduce((acc, sub) => {
      const memberId = sub.member_id || sub.members?.id;
      if (!memberId) return acc;
      
      if (!acc[memberId]) {
        acc[memberId] = sub;
      } else {
        const currentExpiry = new Date(acc[memberId].expiry_date).getTime();
        const newExpiry = new Date(sub.expiry_date).getTime();
        if (newExpiry > currentExpiry) {
          acc[memberId] = sub;
        }
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredSubscriptions = consolidatedSubscriptions.filter(sub => {
    const matchesSearch = sub.members?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 sm:p-8 max-w-7xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#3390ec]/10 flex items-center justify-center border border-[#3390ec]/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3390ec]" />
            </div>
            <p className="text-[#3390ec] font-bold text-[10px] uppercase tracking-wider">Access Control</p>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Plans</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {loading ? 'Verifying plans…' : `${consolidatedSubscriptions.length} active plans tracking`}
          </p>
        </div>
        <button
          onClick={() => navigate('/subscriptions/new')}
          className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3390ec] hover:bg-[#2b5278] text-white font-bold text-sm transition-all shadow-lg shadow-[#3390ec]/10 active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-6">
        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#3390ec] transition-colors" />
          <input
            type="text"
            placeholder="Search athlete or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-[#3390ec]/50 focus:bg-[#3390ec]/[0.02] transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'active', 'expiring_soon', 'expired'].map((status) => {
            const isActive = statusFilter === status
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#3390ec] text-white shadow-lg shadow-[#3390ec]/10'
                    : 'bg-white/[0.02] border border-white/5 text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All Plans' : status.replace('_', ' ')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white/[0.03] border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card border border-rose-500/10 rounded-xl p-10 text-center relative overflow-hidden">
          <div className="relative w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-rose-400 text-sm font-bold mb-4">{error}</p>
          <button 
            onClick={fetchSubscriptions}
            className="px-6 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl text-xs font-bold transition-all border border-white/5"
          >
            Try Again
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-white/5 rounded-xl p-20 text-center relative overflow-hidden"
        >
          <div className="relative w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No results found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6 font-medium leading-relaxed">
            {searchTerm || statusFilter !== 'all' 
              ? "No subscriptions match your current search criteria."
              : "There are no active subscriptions in the system yet."}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="text-[#3390ec] hover:text-[#2b5278] font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              Reset Filters
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSubscriptions.map((sub) => (
            <motion.div 
              variants={itemVariants}
              key={sub.id} 
              onClick={() => navigate(`/members/${sub.member_id || sub.members?.id}/edit`)}
              className="glass-card bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-white text-[14px] font-bold shadow-sm">
                    {sub.members?.full_name?.slice(0, 1) || '?'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#3390ec] transition-colors line-clamp-1">
                      {sub.members?.full_name || 'Anonymous Athlete'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-2.5 h-2.5 text-slate-500" />
                      <p className="text-slate-500 text-[10px] font-bold tracking-wider">{sub.members?.phone_number || 'No Phone'}</p>
                    </div>
                  </div>
                </div>
                <StatusBadge status={sub.status} />
              </div>
              
              <div className="space-y-3 bg-slate-900/50 rounded-xl p-4 mb-5 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Plan</span>
                  <span className="text-white text-xs font-bold">{sub.plan_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Duration</span>
                  <span className="text-slate-300 text-xs font-bold">{sub.duration_type}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Amount</span>
                  <span className="text-[14px] font-bold text-emerald-400">₹{sub.amount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <p className="uppercase tracking-wider font-bold">Started</p>
                  </div>
                  <p className="text-slate-300 font-bold">{new Date(sub.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-[1px] bg-white/5" />
                </div>
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                    <Clock className="w-3 h-3" />
                    <p className="uppercase tracking-wider font-bold">Expires</p>
                  </div>
                  <p className={`font-bold ${sub.status === 'expired' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {new Date(sub.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
