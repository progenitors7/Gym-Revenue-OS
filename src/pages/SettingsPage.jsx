import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCurrentGym } from '../hooks/useCurrentGym';
import { supabase } from '../lib/supabaseClient';

/* ── Section wrapper ── */
function Section({ title, description, children }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 sm:p-6">
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-5">{description}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ── Input field ── */
function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        id={id}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
        {...props}
      />
    </div>
  );
}

/* ── Toast ── */
function Toast({ message, type, onClose }) {
  if (!message) return null;
  const colors = type === 'success'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border ${colors} shadow-2xl flex items-center gap-3 animate-fade-in`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 text-lg leading-none">&times;</button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut, updatePassword, resetPasswordForEmail } = useAuth();
  const { gym, gymName, updateGymName, ownerEmail } = useCurrentGym();

  // Gym profile state
  const [newGymName, setNewGymName] = useState(gymName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState('');
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

  /* ── Handlers ── */

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
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      await resetPasswordForEmail(user.email);
      showToast('Password reset email sent! Check your inbox.');
    } catch (err) {
      showToast(err.message || 'Failed to send reset email', 'error');
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
    <div className="p-5 sm:p-7 lg:p-8 max-w-3xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your gym profile, account security, and data.</p>
      </div>

      <div className="space-y-6">
        {/* ── 1. Gym Profile ── */}
        <Section title="Gym Profile" description="Update your gym's display name and information.">
          <Field label="Gym Name" id="settings-gym-name" type="text" value={newGymName} onChange={e => setNewGymName(e.target.value)} placeholder="Enter gym name" />
          <Field label="Owner Email" id="settings-owner-email" type="email" value={ownerEmail || ''} disabled readOnly />
          <Field label="Gym ID" id="settings-gym-id" type="text" value={gym?.id || ''} disabled readOnly />
          <Field label="Member Since" id="settings-created-at" type="text" value={gym?.created_at ? new Date(gym.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled readOnly />
          <div className="pt-2">
            <button id="settings-save-profile-btn" onClick={handleSaveProfile} disabled={savingProfile} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-500/20 transition-all">
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Section>

        {/* ── 2. Security ── */}
        <Section title="Account Security" description="Update your password to keep your account secure.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New Password" id="settings-new-pw" type={showPasswords ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" />
            <Field label="Confirm Password" id="settings-confirm-pw" type={showPasswords ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" autoComplete="new-password" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500" />
            <span className="text-sm text-slate-400">Show passwords</span>
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <button id="settings-change-pw-btn" onClick={handleChangePassword} disabled={savingPw} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-sky-500/20 transition-all">
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
            <button id="settings-reset-email-btn" onClick={handleSendResetEmail} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition-colors">
              Send Reset Email
            </button>
          </div>
        </Section>

        {/* ── 3. Data & Export ── */}
        <Section title="Data & Export" description="Download your gym's member data as a CSV file.">
          <div className="flex items-center gap-4">
            <button id="settings-export-btn" onClick={handleExportCSV} disabled={exporting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {exporting ? 'Exporting…' : 'Export Members CSV'}
            </button>
          </div>
        </Section>

        {/* ── 4. Danger Zone ── */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 sm:p-6">
          <h3 className="text-rose-400 font-semibold text-lg mb-1">Danger Zone</h3>
          <p className="text-slate-400 text-sm mb-5">Irreversible and destructive actions.</p>
          <div className="space-y-5">
            {/* Delete all data */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
              <h4 className="text-white text-sm font-semibold mb-1">Delete All Gym Data</h4>
              <p className="text-slate-400 text-xs mb-3">This will permanently delete all members, subscriptions, payments, and notifications. This action cannot be undone.</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input id="settings-delete-confirm" type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE" to confirm' className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 w-full sm:w-56" />
                <button id="settings-delete-btn" onClick={handleDeleteAllMembers} disabled={deleting || deleteConfirm !== 'DELETE'} className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap">
                  {deleting ? 'Deleting…' : 'Delete All Data'}
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
              <h4 className="text-white text-sm font-semibold mb-1">Sign Out</h4>
              <p className="text-slate-400 text-xs mb-3">Sign out of your account on this device.</p>
              <button id="settings-signout-btn" onClick={handleSignOut} disabled={signingOut} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {signingOut ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                )}
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
