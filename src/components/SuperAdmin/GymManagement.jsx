import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Toast from '../UI/Toast';

export default function GymManagement() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  async function fetchGyms() {
    try {
      setLoading(true);
      const data = await superAdminService.getAllGyms();
      setGyms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(gymId, newStatus) {
    try {
      setUpdatingId(gymId);
      await superAdminService.updateGymStatus(gymId, newStatus);
      setGyms(prev => prev.map(g => g.id === gymId ? { ...g, status: newStatus } : g));
      showToast(`Gym ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredGyms = gyms.filter(g => 
    g.gym_name.toLowerCase().includes(search.toLowerCase()) || 
    g.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && gyms.length === 0) {
    return <div className="py-20 text-center text-gray-500 font-medium">Loading Gym Directory...</div>;
  }

  return (
    <div className="space-y-6">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Gym Name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1c] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#3390ec]/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#212121] border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">
            <Filter className="w-3.5 h-3.5" />
            Filter Status
          </button>
        </div>
      </div>

      {/* Gym Table */}
      <div className="bg-[#212121] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1c1c1c]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Gym Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Registry Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGyms.map((gym) => (
                <tr key={gym.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#3390ec] font-bold text-xs">
                        {gym.gym_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{gym.gym_name}</p>
                        <p className="text-gray-600 text-[10px] font-medium font-mono">{gym.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                    {new Date(gym.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      gym.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 
                      gym.status === 'blocked' ? 'bg-red-400/10 text-red-400' : 
                      'bg-amber-400/10 text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        gym.status === 'active' ? 'bg-emerald-400' : 
                        gym.status === 'blocked' ? 'bg-red-400' : 
                        'bg-amber-400'
                      }`} />
                      {gym.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {gym.status !== 'active' && (
                        <button 
                          onClick={() => handleStatusChange(gym.id, 'active')}
                          disabled={updatingId === gym.id}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Activate Gym"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      {gym.status !== 'blocked' && (
                        <button 
                          onClick={() => handleStatusChange(gym.id, 'blocked')}
                          disabled={updatingId === gym.id}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Block Gym"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGyms.length === 0 && (
            <div className="py-20 text-center">
              <AlertCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No gyms match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
