import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  ShieldCheck, 
  Download, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  Mail, 
  Fingerprint,
  Calendar,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCurrentGym } from '../hooks/useCurrentGym';
import { supabase } from '../lib/supabaseClient';
import { planService } from '../services/planService';
// ... imports
import { Plus, X as CloseIcon } from 'lucide-react';

const WA_PRESETS = [
  { label: 'Professional Reminder', text: 'Hello {{name}}, this is a friendly reminder that your {{plan}} plan expires on {{date}}. Please renew to avoid interruption.' },
  { label: 'Urgent Expiry', text: 'URGENT: {{name}}, your gym plan has expired on {{date}}. Please contact the front desk immediately.' },
  { label: 'Friendly Greeting', text: 'Hey {{name}}! Hope you are crushing your workouts. Your current plan expires on {{date}}.' }
];

/* ── Section wrapper ── */
function Section({ icon, title, description, children }) {
  return (
    <div className="bg-[#212121] border border-white/5 rounded-xl p-6 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-[#3390ec]">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ── Input field ── */
function Field({ label, id, ...props }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-gray-400 px-1">{label}</label>
      <input
        id={id}
        className="w-full bg-[#1c1c1c] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3390ec]/50 transition-all"
        {...props}
      />
    </div>
  );
}

/* ── Toast ── */
function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] min-w-[300px] animate-in slide-in-from-top-4">
      <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg shadow-xl border border-white/5 ${
        type === 'success' ? 'bg-[#212121] text-emerald-400' : 'bg-[#212121] text-red-400'
      }`}>
        <div className="flex items-center gap-3">
          {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-colors">
          <Trash2 className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, signIn, signOut, updatePassword, resetPasswordForEmail } = useAuth();
  const { gym, gymName, updateGymName, ownerEmail } = useCurrentGym();
  const navigate = useNavigate();

  // Gym profile state
  const [newGymName, setNewGymName] = useState(gymName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Danger zone modal state
  const [showDangerModal, setShowDangerModal] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Membership Plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', duration_days: 30, price: 0 });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const getObfuscatedEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // Update gymName field when prop changes
  const [prevName, setPrevName] = useState(gymName);
  if (gymName !== prevName) {
    setPrevName(gymName);
    setNewGymName(gymName || '');
  }

  // Load plans
  const fetchPlans = async () => {
    if (!gym?.id) return;
    setLoadingPlans(true);
    try {
      const data = await planService.getPlans(gym.id);
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Global Settings (Stored in LocalStorage)
  const getSavedSettings = () => {
    try {
      if (!gym?.id) return { currency: '₹', waTemplate: 'Hello {{name}}, your plan expires on {{date}}.' };
      const saved = localStorage.getItem(`gym_settings_${gym.id}`);
      return saved ? JSON.parse(saved) : { currency: '₹', waTemplate: 'Hello {{name}}, your plan expires on {{date}}.' };
    } catch {
      return { currency: '₹', waTemplate: 'Hello {{name}}, your plan expires on {{date}}.' };
    }
  };

  const [globalSettings, setGlobalSettings] = useState(getSavedSettings());
  const [savingSettings, setSavingSettings] = useState(false);

  useState(() => {
    fetchPlans();
    if (gym?.id) setGlobalSettings(getSavedSettings());
  }, [gym?.id]);

  const handleSaveGlobalSettings = () => {
    if (!gym?.id) return;
    setSavingSettings(true);
    try {
      localStorage.setItem(`gym_settings_${gym.id}`, JSON.stringify(globalSettings));
      showToast('Global settings updated successfully!');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.duration_days) return showToast('Please fill all fields', 'error');
    setLoadingPlans(true);
    try {
      await planService.createPlan(gym.id, newPlan);
      showToast('Plan added successfully!');
      setNewPlan({ name: '', duration_days: 30, price: 0 });
      setShowAddPlan(false);
      fetchPlans();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await planService.deletePlan(id);
      showToast('Plan deleted successfully!');
      fetchPlans();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!newGymName.trim()) return showToast('Gym name cannot be empty', 'error');
    if (newGymName.trim() === gymName) return showToast('No changes to save', 'error');
    setSavingProfile(true);
    try {
      await updateGymName(newGymName.trim());
      showToast('Gym profile updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return showToast('Please fill all password fields', 'error');
    if (newPw.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (newPw !== confirmPw) return showToast('Passwords do not match', 'error');
    setSavingPw(true);
    try {
      // Verify current password by attempting to sign in
      await signIn(user.email, currentPw);
      await updatePassword(newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password updated successfully!');
    } catch (err) {
      if (err.message.toLowerCase().includes('invalid login credentials')) {
        showToast('Current password is incorrect', 'error');
      } else {
        showToast(err.message || 'Failed to change password', 'error');
      }
    } finally {
      setSavingPw(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await resetPasswordForEmail(user.email);
      showToast('Password reset link sent to your email!');
    } catch (err) {
      showToast(err.message || 'Failed to send reset link', 'error');
    }
  };

  const handleExportCSV = async () => {
    if (!gym) return;
    setExporting(true);
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('full_name, phone_number, gender, join_date, membership_plan, expiry_date, status, notes')
        .eq('gym_id', gym.id)
        .order('full_name');
      if (error) throw error;
      if (!members || members.length === 0) return showToast('No members to export', 'error');

      const headers = ['Full Name', 'Phone', 'Gender', 'Join Date', 'Plan', 'Expiry Date', 'Status', 'Notes'];
      const rows = members.map(m => [
        m.full_name, m.phone_number || '', m.gender || '', m.join_date || '',
        m.membership_plan || '', m.expiry_date || '', m.status || '', (m.notes || '').replace(/,/g, ';')
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${gymName || 'gym'}_members_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${members.length} members successfully!`);
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllMembers = async () => {
    if (deleteConfirm !== 'DELETE') return showToast('Type DELETE to confirm', 'error');
    if (!gym) return;
    setDeleting(true);
    try {
      await supabase.from('payments').delete().eq('gym_id', gym.id);
      await supabase.from('subscriptions').delete().eq('gym_id', gym.id);
      await supabase.from('notifications').delete().eq('gym_id', gym.id);
      await supabase.from('members').delete().eq('gym_id', gym.id);
      setDeleteConfirm('');
      setShowDangerModal(false);
      showToast('All gym data has been deleted.');
    } catch (err) {
      showToast(err.message || 'Deletion failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-lg bg-[#212121] border border-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your gym account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Gym Identity */}
        <Section 
          icon={<Zap className="w-5 h-5" />}
          title="Gym Identity" 
          description="Operational parameters & branding"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gym Name" id="settings-gym-name" type="text" value={newGymName} onChange={e => setNewGymName(e.target.value)} placeholder="Enter gym name" />
            <Field label="Owner Email" id="settings-owner-email" type="email" value={getObfuscatedEmail(ownerEmail)} disabled readOnly />
            <Field label="Gym ID" id="settings-gym-id" type="text" value={gym?.id || ''} disabled readOnly />
            <Field label="Registry Date" id="settings-created-at" type="text" value={gym?.created_at ? new Date(gym.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled readOnly />
          </div>
          <div className="pt-2">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="px-6 py-2 bg-[#3390ec] hover:bg-[#2b7ad2] disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all">
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </Section>

        {/* Membership Plans */}
        <Section 
          icon={<Calendar className="w-5 h-5" />}
          title="Membership Plans" 
          description="Define your own subscription tiers and pricing"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold text-white">{plan.name}</p>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                      {plan.duration_days} Days • ₹{plan.price}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {!showAddPlan ? (
                <button 
                  onClick={() => setShowAddPlan(true)}
                  className="p-5 rounded-xl border-2 border-dashed border-white/10 hover:border-[#3390ec]/50 hover:bg-[#3390ec]/5 text-gray-500 hover:text-[#3390ec] transition-all flex flex-col items-center justify-center gap-2 h-full min-h-[100px]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Add New Plan</span>
                </button>
              ) : (
                <div className="p-5 rounded-xl bg-[#2a2a2a] border border-[#3390ec]/50 space-y-4 shadow-lg shadow-[#3390ec]/10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Plan Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Monthly Gold" 
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3390ec]"
                        value={newPlan.name}
                        onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="space-y-1 w-1/2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Duration (Days)</label>
                        <input 
                          type="number" 
                          placeholder="30" 
                          className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3390ec]"
                          value={newPlan.duration_days}
                          onChange={e => setNewPlan({...newPlan, duration_days: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1 w-1/2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Price</label>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3390ec]"
                          value={newPlan.price}
                          onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleAddPlan} className="flex-1 py-2.5 bg-[#3390ec] hover:bg-[#2b7ad2] text-white text-xs font-bold rounded-lg transition-colors">Save Plan</button>
                    <button onClick={() => setShowAddPlan(false)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Global Settings */}
        <Section 
          icon={<SettingsIcon className="w-5 h-5" />}
          title="Global Settings" 
          description="Platform preferences for your gym"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 px-1">Currency Symbol</label>
              <select
                value={globalSettings.currency}
                onChange={e => setGlobalSettings({...globalSettings, currency: e.target.value})}
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3390ec]/50 transition-all appearance-none"
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-medium text-gray-400">WhatsApp Template</label>
                <select
                  onChange={(e) => {
                    const template = WA_PRESETS.find(p => p.label === e.target.value)?.text;
                    if (template) setGlobalSettings({...globalSettings, waTemplate: template});
                  }}
                  className="bg-transparent border-none text-[10px] font-bold text-[#3390ec] uppercase tracking-wider cursor-pointer focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Load Preset</option>
                  {WA_PRESETS.map(preset => (
                    <option key={preset.label} value={preset.label} className="text-black">{preset.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                value={globalSettings.waTemplate}
                onChange={e => setGlobalSettings({...globalSettings, waTemplate: e.target.value})}
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#3390ec]/50 transition-all resize-none"
                placeholder="Hello {{name}}, your plan expires on {{date}}."
              />
              <p className="text-[10px] text-gray-500 px-1">Available variables: {'{{name}}'}, {'{{date}}'}, {'{{plan}}'}</p>
            </div>
          </div>
          <div className="pt-2">
            <button onClick={handleSaveGlobalSettings} disabled={savingSettings} className="px-6 py-2 bg-[#3390ec] hover:bg-[#2b7ad2] disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all">
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </Section>

        {/* Security */}
        <Section 
          icon={<ShieldCheck className="w-5 h-5" />}
          title="Security" 
          description="Manage your account password"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Current Password" id="settings-current-pw" type={showPasswords ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Required" />
            <Field label="New Password" id="settings-new-pw" type={showPasswords ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
            <Field label="Confirm Password" id="settings-confirm-pw" type={showPasswords ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowPasswords(!showPasswords)} 
                className="text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPasswords ? 'Hide Password' : 'Show Password'}
              </button>
              <button 
                onClick={handleForgotPassword}
                className="text-xs font-bold text-[#3390ec] hover:text-[#2b7ad2] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <button onClick={handleChangePassword} disabled={savingPw} className="px-6 py-2 bg-[#3390ec] hover:bg-[#2b7ad2] text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-[#3390ec]/20">
              {savingPw ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </Section>

        {/* Data Control */}
        <Section 
          icon={<Download className="w-5 h-5" />}
          title="Data Management" 
          description="Export your gym's data to CSV"
        >
          <button onClick={handleExportCSV} disabled={exporting} className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all border border-white/5">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Member Data'}
          </button>
        </Section>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-red-500 font-bold text-lg">Danger Zone</h3>
                <p className="text-red-400/70 text-xs mt-0.5">Irreversible actions for your gym data</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDangerModal(true)} 
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 whitespace-nowrap"
            >
              Wipe All Data
            </button>
          </div>
        </div>

        {/* Danger Modal */}
        {showDangerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1c1c1c] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
              
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Are you absolutely sure?</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This action <strong className="text-red-400 font-bold">cannot be undone</strong>. This will permanently delete all your athletes, subscriptions, payments, and notifications.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Type "DELETE" to confirm</label>
                  <input 
                    type="text" 
                    value={deleteConfirm} 
                    onChange={e => setDeleteConfirm(e.target.value)} 
                    placeholder="DELETE" 
                    className="w-full bg-[#121212] border border-red-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center tracking-[0.2em] font-bold" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => { setShowDangerModal(false); setDeleteConfirm(''); }}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAllMembers} 
                    disabled={deleting || deleteConfirm !== 'DELETE'} 
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-500/20"
                  >
                    {deleting ? 'Erasing...' : 'Wipe Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="bg-[#212121] border border-white/5 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1c1c1c] border border-white/5 flex items-center justify-center text-gray-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold">Signed in as</h4>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut} 
            disabled={signingOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white rounded-lg text-sm font-medium transition-all border border-white/5"
          >
            {signingOut ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <LogOut className="w-4 h-4" />}
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
