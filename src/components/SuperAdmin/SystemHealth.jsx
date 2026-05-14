import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  Zap, 
  HardDrive, 
  Cpu, 
  RefreshCw,
  Power,
  Lock,
  Globe,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Toast from '../UI/Toast';

export default function SystemHealth() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings(isManual = false) {
    try {
      if (isManual) setIsRefreshing(true);
      setLoading(true);
      
      // Simulate real-time probe
      if (isManual) await new Promise(r => setTimeout(r, 800));

      const data = await superAdminService.getSystemSettings();
      const settingsMap = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  async function toggleSetting(key) {
    try {
      setUpdating(key);
      const newValue = !settings[key];
      await superAdminService.updateSystemSetting(key, newValue);
      setSettings(prev => ({ ...prev, [key]: newValue }));
      showToast(`${key.replace(/_/g, ' ')} updated successfully`);
    } catch (err) {
      showToast('Failed to update setting', 'error');
    } finally {
      setUpdating(null);
    }
  }

  const systemMetrics = [
    { label: 'Database Status', value: 'Connected', icon: <Database className="w-4 h-4" />, color: 'text-emerald-400' },
    { label: 'API Latency', value: '42ms', icon: <Activity className="w-4 h-4" />, color: 'text-emerald-400' },
    { label: 'Server Load', value: '12%', icon: <Cpu className="w-4 h-4" />, color: 'text-[#3390ec]' },
    { label: 'Storage Used', value: '2.4 GB', icon: <HardDrive className="w-4 h-4" />, color: 'text-[#3390ec]' },
  ];

  if (loading && Object.keys(settings).length === 0) {
    return <div className="py-20 text-center text-gray-500 font-medium italic">Scanning System Health...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((m, i) => (
          <div key={i} className="bg-[#212121] border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
              {m.icon}
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{m.label}</p>
              <p className="text-white font-black text-lg">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Maintenance Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#212121] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3390ec]/10 flex items-center justify-center text-[#3390ec]">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Maintenance & Security</h3>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Global platform switches</p>
                </div>
              </div>
              <button 
                onClick={() => fetchSettings(true)}
                disabled={isRefreshing}
                className={`p-2.5 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all disabled:opacity-50 ${isRefreshing ? 'rotate-180 opacity-50' : 'active:rotate-180 duration-500'}`}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maintenance Mode Toggle */}
              <div className={`p-6 rounded-2xl border transition-all ${
                settings.maintenance_mode 
                  ? 'bg-amber-400/5 border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.05)]' 
                  : 'bg-[#1c1c1c] border-white/5'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    settings.maintenance_mode ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-400'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => toggleSetting('maintenance_mode')}
                    disabled={updating === 'maintenance_mode'}
                    className={`w-12 h-6 rounded-full relative transition-all ${
                      settings.maintenance_mode ? 'bg-amber-400' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      settings.maintenance_mode ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-wide">Maintenance Mode</h4>
                <p className="text-gray-500 text-[10px] mt-1 font-medium leading-relaxed">
                  When enabled, all gym owners will see a maintenance message and platform access will be restricted.
                </p>
              </div>

              {/* New Registrations Toggle */}
              <div className={`p-6 rounded-2xl border transition-all ${
                !settings.allow_new_registrations 
                  ? 'bg-red-400/5 border-red-400/20' 
                  : 'bg-[#1c1c1c] border-white/5'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    settings.allow_new_registrations ? 'bg-emerald-400 text-black' : 'bg-red-400 text-black'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => toggleSetting('allow_new_registrations')}
                    disabled={updating === 'allow_new_registrations'}
                    className={`w-12 h-6 rounded-full relative transition-all ${
                      settings.allow_new_registrations ? 'bg-emerald-400' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      settings.allow_new_registrations ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-wide">New Registrations</h4>
                <p className="text-gray-500 text-[10px] mt-1 font-medium leading-relaxed">
                  Toggle platform onboarding. If disabled, new gym owners cannot sign up.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#212121] border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-[#3390ec]" />
              <h3 className="text-white font-bold text-lg tracking-tight">System Logs Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { time: '10:42 AM', event: 'Backup successful', status: 'success' },
                { time: '09:15 AM', event: 'Database migration applied', status: 'info' },
                { time: 'Yesterday', event: 'New plan "Enterprise" created', status: 'info' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#1c1c1c] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 text-[10px] font-mono">{log.time}</span>
                    <span className="text-gray-400 text-[11px] font-medium">{log.event}</span>
                  </div>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
           <div className="bg-[#3390ec] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 transform rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Platform <br/>Health: 100%</h4>
                <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                  All microservices are performing optimally. No significant latency or errors detected in the last 24 hours.
                </p>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Next Backup</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">04:00 AM</span>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-[#212121] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <h4 className="text-white font-bold text-sm tracking-tight uppercase tracking-widest">Active Alerts</h4>
              </div>
              <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-amber-400 text-xs font-medium">
                No active critical alerts. Your infrastructure is secure.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
