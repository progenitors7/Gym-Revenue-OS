import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Filter,
  Search,
  ChevronRight,
  Send,
  MoreVertical,
  LifeBuoy
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Toast from '../UI/Toast';

export default function SupportCenter() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const data = await superAdminService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTicket(ticketId, updates) {
    try {
      const finalUpdates = { ...updates };
      if (updates.admin_response?.trim()) {
        finalUpdates.status = 'resolved';
      }

      await superAdminService.updateTicket(ticketId, finalUpdates);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...finalUpdates } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...finalUpdates });
      }
      if (updates.admin_response) {
        setAdminNote('');
        showToast('Response sent and ticket updated');
      } else {
        showToast('Ticket status updated');
      }
    } catch (err) {
      showToast('Update failed', 'error');
    }
  }


  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.gyms?.gym_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && tickets.length === 0) {
    return <div className="py-20 text-center text-gray-500 font-medium">Loading Tickets...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      {/* Ticket List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-gray-400">
            <LifeBuoy className="w-4 h-4" />
            <h3 className="font-bold text-xs uppercase tracking-widest">Active Tickets</h3>
          </div>
          <div className="relative">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
             <input 
              type="text" 
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#1c1c1c] border border-white/5 rounded-lg text-[10px] text-white focus:outline-none focus:border-[#3390ec]/50 w-32"
             />
          </div>
        </div>

        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedTicket?.id === ticket.id 
                  ? 'bg-[#3390ec]/10 border-[#3390ec]/30 shadow-lg' 
                  : 'bg-[#212121] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                  ticket.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                  ticket.priority === 'medium' ? 'bg-amber-400/10 text-amber-400' :
                  'bg-emerald-400/10 text-emerald-400'
                }`}>
                  {ticket.priority}
                </span>
                <span className="text-gray-600 text-[9px] font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="text-white font-bold text-sm truncate mb-1">{ticket.subject}</h4>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest mb-3">
                {ticket.gyms?.gym_name || 'System User'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${
                  ticket.status === 'open' ? 'text-amber-400' : 
                  ticket.status === 'resolved' ? 'text-emerald-400' : 
                  'text-gray-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    ticket.status === 'open' ? 'bg-amber-400 animate-pulse' : 
                    ticket.status === 'resolved' ? 'bg-emerald-400' : 
                    'bg-gray-500'
                  }`} />
                  {ticket.status.replace('_', ' ')}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedTicket?.id === ticket.id ? 'translate-x-1 text-[#3390ec]' : 'text-gray-800'}`} />
              </div>
            </button>
          ))}
          {filteredTickets.length === 0 && (
            <div className="py-20 text-center bg-[#212121] border border-white/5 rounded-2xl border-dashed">
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="lg:col-span-2">
        {selectedTicket ? (
          <div className="bg-[#212121] border border-white/5 rounded-3xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right-4">
            {/* Ticket Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#3390ec]">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      ID: {selectedTicket.id.slice(0, 8)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-800" />
                    <span className="text-[#3390ec] text-[10px] font-bold uppercase tracking-widest">
                      {selectedTicket.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateTicket(selectedTicket.id, { status: e.target.value })}
                  className="bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black text-white focus:outline-none uppercase tracking-widest"
                 >
                   <option value="open">Open</option>
                   <option value="in_progress">In Progress</option>
                   <option value="resolved">Resolved</option>
                   <option value="closed">Closed</option>
                 </select>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* User message */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-white/5 flex items-center justify-center text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-[#1c1c1c] p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <p className="text-gray-300 text-sm leading-relaxed">{selectedTicket.description}</p>
                  </div>
                  <span className="text-[9px] text-gray-700 font-medium mt-2 block">
                    Sent by {selectedTicket.gyms?.gym_name} • {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Admin response */}
              {selectedTicket.admin_response && (
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#3390ec]/20 border border-[#3390ec]/30 flex items-center justify-center text-[#3390ec]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="bg-[#3390ec]/10 p-4 rounded-2xl rounded-tr-none border border-[#3390ec]/20 inline-block text-left max-w-[80%]">
                      <p className="text-[#3390ec] text-sm leading-relaxed font-medium">{selectedTicket.admin_response}</p>
                    </div>
                    <span className="text-[9px] text-gray-700 font-medium mt-2 block">
                      Admin Response • {selectedTicket.resolved_at ? new Date(selectedTicket.resolved_at).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Response Form */}
            <div className="p-6 border-t border-white/5 bg-[#1c1c1c]/30">
               <div className="relative">
                 <textarea 
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Type your response to the gym owner..."
                  className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-4 pr-16 text-sm text-white focus:outline-none focus:border-[#3390ec]/50 transition-all resize-none"
                 />
                 <button 
                  onClick={() => handleUpdateTicket(selectedTicket.id, { 
                    admin_response: adminNote, 
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                  })}
                  disabled={!adminNote.trim()}
                  className="absolute right-3 bottom-3 p-3 bg-[#3390ec] text-white rounded-xl hover:bg-[#2b83d6] disabled:bg-gray-800 transition-all shadow-lg"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-[9px] text-gray-600 mt-2 font-medium uppercase tracking-widest text-center">
                 Resolving a ticket will automatically notify the gym owner.
               </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#212121] border border-white/5 rounded-3xl h-full flex flex-col items-center justify-center text-center p-12 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700 mb-6">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Select a ticket to respond</h3>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              Open support queries from gym owners will appear here. You can resolve technical issues or billing queries directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
