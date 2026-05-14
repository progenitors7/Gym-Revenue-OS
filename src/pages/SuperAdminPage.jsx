import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Building2, 
  IndianRupee, 
  TrendingUp, 
  ArrowLeft, 
  RefreshCw,
  Zap,
  ChevronRight,
  ShieldCheck,
  LayoutGrid,
  Settings2,
  Megaphone,
  CreditCard,
  LifeBuoy,
  Activity,
  Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStats } from '../hooks/useSuperAdminStats';
import GymManagement from '../components/SuperAdmin/GymManagement';
import BroadcastSystem from '../components/SuperAdmin/BroadcastSystem';
import PlanManager from '../components/SuperAdmin/PlanManager';
import SupportCenter from '../components/SuperAdmin/SupportCenter';
import SystemHealth from '../components/SuperAdmin/SystemHealth';
import PromoCodeManager from '../components/SuperAdmin/PromoCodeManager';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function StatCard({ title, value, icon, trend, subtext }) {
  return (
    <motion.div 
      variants={itemVariants}
      className="glass-card bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all hover:bg-white/[0.04] hover:border-white/10 group shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-[#3390ec] group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      {subtext && <p className="text-slate-600 text-[10px] mt-2 font-bold uppercase tracking-wider">{subtext}</p>}
    </motion.div>
  );
}

export default function SuperAdminPage() {
  const { stats, loading, error, refresh } = useSuperAdminStats();
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#3390ec]/20 border-t-[#3390ec] rounded-full animate-spin" />
          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Loading Core OS...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'gyms', label: 'Directory', icon: <Building2 className="w-4 h-4" /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'plans', label: 'Plans', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'promo', label: 'Promo', icon: <Ticket className="w-4 h-4" /> },
    { id: 'support', label: 'Support', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'health', label: 'Health', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 sm:p-8 max-w-7xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95 glass-card"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-[#3390ec]" />
              <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">SUPER ADMIN OS</h1>
            </div>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Enterprise Management Layer</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar glass-card">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#3390ec] text-white shadow-lg shadow-[#3390ec]/10' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-400 text-sm font-bold flex items-center gap-3 glass-card"
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {error}
        </motion.div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {/* Platform Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Registered Gyms"
                  value={stats?.totalGyms || 0}
                  icon={<Building2 className="w-5 h-5" />}
                  trend="+12%"
                  subtext="Total gym accounts"
                />
                <StatCard 
                  title="Active Members"
                  value={stats?.totalMembers || 0}
                  icon={<Users className="w-5 h-5" />}
                  trend="+8%"
                  subtext="Aggregated across platform"
                />
                <StatCard 
                  title="Aggregated Revenue"
                  value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                  icon={<IndianRupee className="w-5 h-5" />}
                  trend="+15%"
                  subtext="Monthly platform volume"
                />
                <StatCard 
                  title="System Growth"
                  value={`${stats?.growthRate || 0}%`}
                  icon={<BarChart3 className="w-5 h-5" />}
                  trend="+5%"
                  subtext="Month-over-month increase"
                />
              </div>

              {/* Quick Actions */}
              <motion.div 
                variants={itemVariants}
                className="glass-card bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 text-white/[0.02] group-hover:text-[#3390ec]/5 transition-colors duration-500">
                  <Zap className="w-64 h-64 -mr-16 -mt-16 transform rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-[#3390ec]" />
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Platform Integrity</h2>
                  </div>
                  <p className="text-slate-500 text-sm max-w-lg mb-8 leading-relaxed font-medium">
                    You are currently in the Super Admin interface. All actions here affect the global SaaS state. Please handle moderation and broadcasts with care.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={refresh}
                      className="flex items-center gap-2 bg-[#3390ec] text-white px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-[#2b5278] transition-all active:scale-95 shadow-lg shadow-[#3390ec]/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Force Sync Data
                    </button>
                    <button className="flex items-center gap-2 bg-white/[0.03] text-slate-400 px-6 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:text-white hover:bg-white/[0.05] transition-all active:scale-95 border border-white/5">
                      <Settings2 className="w-4 h-4" />
                      Global Config
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'gyms' && <GymManagement />}
          {activeTab === 'broadcast' && <BroadcastSystem />}
          {activeTab === 'plans' && <PlanManager />}
          {activeTab === 'promo' && <PromoCodeManager />}
          {activeTab === 'support' && <SupportCenter />}
          {activeTab === 'health' && <SystemHealth />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
