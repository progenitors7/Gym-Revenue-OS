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
  const { user, signOut, updatePassword } = useAuth();
  const { gym, gymName, updateGymName, ownerEmail } = useCurrentGym();
  const navigate = useNavigate();

  // Gym profile state
  const [newGymName, setNewGymName] = useState(gymName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  // Update gymName field when prop changes
  const [prevName, setPrevName] = useState(gymName);
  if (gymName !== prevName) {
    setPrevName(gymName);
    setNewGymName(gymName || '');
  }

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
    if (!newPw || !confirmPw) return showToast('Please fill all password fields', 'error');
    if (newPw.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (newPw !== confirmPw) return showToast('Passwords do not match', 'error');
    setSavingPw(true);
    try {
      await updatePassword(newPw);
      setNewPw(''); setConfirmPw('');
      showToast('Password updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
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
            <Field label="Owner Email" id="settings-owner-email" type="email" value={ownerEmail || ''} disabled readOnly />
            <Field label="Gym ID" id="settings-gym-id" type="text" value={gym?.id || ''} disabled readOnly />
            <Field label="Registry Date" id="settings-created-at" type="text" value={gym?.created_at ? new Date(gym.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled readOnly />
          </div>
          <div className="pt-2">
            <button onClick={handleSaveProfile} disabled={savingProfile} className="px-6 py-2 bg-[#3390ec] hover:bg-[#2b7ad2] disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all">
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </Section>

        {/* Security */}
        <Section 
          icon={<ShieldCheck className="w-5 h-5" />}
          title="Security" 
          description="Manage your account password"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="New Password" id="settings-new-pw" type={showPasswords ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
            <Field label="Confirm Password" id="settings-confirm-pw" type={showPasswords ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button 
              onClick={() => setShowPasswords(!showPasswords)} 
              className="text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? 'Hide Password' : 'Show Password'}
            </button>
            <button onClick={handleChangePassword} disabled={savingPw} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg text-sm transition-all border border-white/5">
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
        <div className="bg-[#212121] border border-red-500/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Danger Zone</h3>
              <p className="text-gray-500 text-xs mt-0.5">Irreversible actions for your gym data</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-medium text-gray-400 px-1">Type "DELETE" to confirm data wipe</label>
              <input 
                type="text" 
                value={deleteConfirm} 
                onChange={e => setDeleteConfirm(e.target.value)} 
                placeholder='Type DELETE' 
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50" 
              />
            </div>
            <button 
              onClick={handleDeleteAllMembers} 
              disabled={deleting || deleteConfirm !== 'DELETE'} 
              className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white disabled:opacity-20 font-medium rounded-lg text-sm transition-all border border-red-500/20"
            >
              {deleting ? 'Erasing...' : 'Wipe All Data'}
            </button>
          </div>
        </div>

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
