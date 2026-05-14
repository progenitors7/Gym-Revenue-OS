import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Check, 
  X, 
  Crown, 
  Shield, 
  Star,
  Users,
  CheckCircle2,
  Settings,
  MoreVertical
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Toast from '../UI/Toast';

export default function PlanManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: 0,
    max_members: 100,
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const data = await superAdminService.getSaaSPlans();
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPlan(e) {
    e.preventDefault();
    try {
      await superAdminService.createSaaSPlan(newPlan);
      setShowAddForm(false);
      setNewPlan({ name: '', price: 0, max_members: 100, features: [] });
      fetchPlans();
      showToast('New SaaS plan created successfully');
    } catch (err) {
      showToast('Failed to create plan', 'error');
    }
  }

  function addFeature() {
    if (!featureInput.trim()) return;
    setNewPlan({ ...newPlan, features: [...newPlan.features, featureInput.trim()] });
    setFeatureInput('');
  }

  if (loading && plans.length === 0) {
    return <div className="py-20 text-center text-gray-500 font-medium">Loading SaaS Plans...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight">SaaS Subscription Tiers</h3>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Control monetization and feature access</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3390ec] hover:bg-[#2b83d6] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#3390ec]/20 active:scale-95"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Create New Tier'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[#212121] border border-[#3390ec]/30 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-4">
          <form onSubmit={handleAddPlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-1">Tier Name</label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#3390ec]/50"
                  placeholder="e.g. Platinum"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-1">Price (₹ / Month)</label>
                  <input
                    type="number"
                    required
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#3390ec]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-1">Max Members</label>
                  <input
                    type="number"
                    required
                    value={newPlan.max_members}
                    onChange={(e) => setNewPlan({ ...newPlan, max_members: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#1c1c1c] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#3390ec]/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest px-1">Features</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-2.5 bg-[#1c1c1c] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#3390ec]/50"
                    placeholder="Add a feature..."
                  />
                  <button 
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPlan.features.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-[#3390ec]/10 text-[#3390ec] text-[10px] font-bold rounded-lg flex items-center gap-1">
                      {f}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setNewPlan({ ...newPlan, features: newPlan.features.filter((_, idx) => idx !== i) })} />
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#3390ec] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Save Membership Tier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="relative group bg-[#212121] border border-white/5 rounded-3xl p-8 hover:border-[#3390ec]/30 transition-all shadow-xl overflow-hidden">
            {/* Background Icon */}
            <div className="absolute -right-4 -top-4 text-white/[0.02] transform rotate-12 group-hover:scale-110 transition-transform">
              <CreditCard className="w-40 h-40" />
            </div>

            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${
                  plan.name === 'Enterprise' ? 'bg-amber-400/10 text-amber-400' :
                  plan.name === 'Professional' ? 'bg-[#3390ec]/10 text-[#3390ec]' :
                  'bg-emerald-400/10 text-emerald-400'
                }`}>
                  {plan.name === 'Enterprise' ? <Crown className="w-6 h-6" /> :
                   plan.name === 'Professional' ? <Star className="w-6 h-6" /> :
                   <Shield className="w-6 h-6" />}
                </div>
                <button className="p-2 rounded-xl hover:bg-white/5 text-gray-700 hover:text-white transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-white font-black text-2xl tracking-tight uppercase italic">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-[#3390ec]">₹{plan.price}</span>
                  <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">/ Month</span>
                </div>
              </div>

              <div className="space-y-3 py-6 border-y border-white/5">
                <div className="flex items-center gap-3 text-white">
                  <Users className="w-4 h-4 text-[#3390ec]" />
                  <span className="text-sm font-bold">Up to {plan.max_members.toLocaleString()} Members</span>
                </div>
                {plan.features?.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-medium leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Platform Tier</span>
                <span className="bg-white/5 text-gray-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Plans Overview */}
      <div className="bg-[#212121] border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg tracking-tight">Active Gym Subscriptions</h3>
          <button className="text-[#3390ec] text-xs font-black uppercase tracking-widest hover:underline">View Billing History</button>
        </div>
        <p className="text-gray-500 text-xs italic">Use the Gym Directory tab to change individual gym subscription levels.</p>
      </div>
    </div>
  );
}
