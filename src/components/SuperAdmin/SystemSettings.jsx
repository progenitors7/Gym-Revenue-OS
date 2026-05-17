import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Power, 
  UserPlus, 
  MessageCircle, 
  Save,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Toast from '../UI/Toast';

export default function SystemSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // Key being saved
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings(quiet = false) {
    try {
      if (!quiet) setLoading(true);
      const data = await superAdminService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load settings', 'error');
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  async function handleUpdate(key, value) {
    try {
      setSaving(key);
      await superAdminService.updateSystemSetting(key, value);
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      showToast(`${key.replace(/_/g, ' ')} updated successfully`);
    } catch (err) {
      await fetchSettings(true); // Revert on error quietly
      showToast('Failed to update setting', 'error');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-[#3390ec] animate-spin" />
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Accessing core configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#3390ec]/10 flex items-center justify-center text-[#3390ec]">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight">Global System Configuration</h3>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Universal platform switches & controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {settings.map((setting) => (
          <div 
            key={setting.key}
            className="bg-[#212121] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-[#3390ec]/30 transition-all"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                setting.key === 'maintenance_mode' ? 'bg-rose-500/10 text-rose-500' :
                setting.key === 'allow_new_registrations' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-amber-500/10 text-amber-500'
              }`}>
                {setting.key === 'maintenance_mode' ? <Power className="w-6 h-6" /> :
                 setting.key === 'allow_new_registrations' ? <UserPlus className="w-6 h-6" /> :
                 <MessageCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-tight">
                  {setting.key.replace(/_/g, ' ')}
                </h4>
                <p className="text-gray-500 text-[10px] font-medium leading-tight max-w-md mt-1">
                  {setting.key === 'maintenance_mode' ? 'Lock the entire platform for maintenance. Only super admins can bypass.' :
                   setting.key === 'allow_new_registrations' ? 'Control if new gym owners can register on the platform.' :
                   'Set a global announcement visible to all gym owners on their dashboard.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {typeof setting.value === 'boolean' ? (
                <button
                  onClick={() => handleUpdate(setting.key, !setting.value)}
                  disabled={saving === setting.key}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    setting.value ? 'bg-[#3390ec]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  {saving === setting.key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </div>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                   <input 
                    type="text"
                    value={setting.value}
                    onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                    className="bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#3390ec]/50 w-64"
                   />
                   <button 
                    onClick={() => handleUpdate(setting.key, setting.value)}
                    disabled={saving === setting.key}
                    className="p-2 bg-[#3390ec] text-white rounded-xl hover:bg-[#2b83d6] transition-all disabled:opacity-50"
                   >
                     {saving === setting.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h5 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Warning Zone</h5>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            Changing these settings affects the production environment immediately. Maintenance mode will log out all current gym owners and prevent any operations until disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
