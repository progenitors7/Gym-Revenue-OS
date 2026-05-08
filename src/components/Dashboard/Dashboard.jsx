import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentGym } from '../../hooks/useCurrentGym';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import DashboardSkeleton from './DashboardSkeleton';
import GymNameEditor from './GymNameEditor';
import StatCard from './StatCard';
import LightweightChart from './LightweightChart';
import RecentActivityFeed from './RecentActivityFeed';
import ExpiringWidget from './ExpiringWidget';
import PendingPaymentsWidget from './PendingPaymentsWidget';

/* ── Icons ── */
const UsersIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CheckCircleIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CurrencyIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { gym, gymLoading, gymError, gymName, ownerEmail, updateGymName } = useCurrentGym()
  const { stats, loading: statsLoading, error: statsError, fetchStats } = useDashboardStats();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/members?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  if (gymLoading || statsLoading) return <DashboardSkeleton />
  
  if (!gym && !gymLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 text-xl">!</div>
        <p className="text-white font-semibold">Gym account not found</p>
        <p className="text-slate-400 text-sm max-w-sm">We couldn't retrieve your gym record. Try logging out and back in, or contact support.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">Retry</button>
      </div>
    )
  }

  if (gymError || statsError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-xl">⚠</div>
        <p className="text-white font-semibold">Could not load your dashboard</p>
        <p className="text-slate-400 text-sm max-w-sm">{gymError || statsError}</p>
      </div>
    )
  }

  // Handle completely empty state
  if (stats && stats.membership.total === 0) {
    return (
      <div className="p-5 sm:p-7 lg:p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Welcome to Gym Revenue OS</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Your dashboard is currently empty. Start by adding your first member to unlock powerful analytics and revenue tracking.
        </p>
        <Link to="/members" className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/20 transition-all">
          Add Your First Member
        </Link>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto">
      
      {/* ── Top Bar (Search & Actions) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-gradient">{greeting},</span>
            <GymNameEditor gymName={gymName} onSave={updateGymName} />
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search members... (Press Enter)" 
              onKeyDown={handleSearch}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/members" title="Add Member" className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </Link>
            <Link to="/subscriptions" title="Add Subscription" className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </Link>
            <Link to="/payments" title="Add Payment" className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue.total.toLocaleString()}`} 
          subtitle={`₹${stats.revenue.monthly.toLocaleString()} this month`}
          icon={CurrencyIcon} 
          colorClass="indigo" 
        />
        <StatCard 
          title="Active Members" 
          value={stats.membership.active} 
          subtitle={`Out of ${stats.membership.total} total`}
          icon={CheckCircleIcon} 
          colorClass="emerald" 
        />
        <StatCard 
          title="Pending Payments" 
          value={`₹${stats.revenue.pending.toLocaleString()}`} 
          icon={ClockIcon} 
          colorClass="amber" 
        />
        <StatCard 
          title="Total Members" 
          value={stats.membership.total} 
          icon={UsersIcon} 
          colorClass="sky" 
        />
      </div>

      {/* ── Main Content Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Charts & Activity) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Widget */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Revenue Trend (Last 7 Days)</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span className="text-xs text-slate-400">₹{stats.revenue.today.toLocaleString()} Today</span>
              </div>
            </div>
            <div className="h-[300px]">
              <LightweightChart data={stats.revenueChartData} />
            </div>
          </div>

          {/* Activity Feed Widget */}
          <RecentActivityFeed activities={stats.recentActivity} />
        </div>

        {/* Right Column (Actionable Widgets) */}
        <div className="space-y-8">
          <ExpiringWidget members={stats.expiringMembers} />
          <PendingPaymentsWidget payments={stats.pendingPayments} />
        </div>

      </div>

    </div>
  )
}
