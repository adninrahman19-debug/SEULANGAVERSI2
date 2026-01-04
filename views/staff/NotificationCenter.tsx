
import React, { useState, useMemo } from 'react';
import { AppNotification, UserRole } from '../../types';

interface Signal extends AppNotification {
  priority: 'high' | 'medium' | 'low';
  sender?: string;
  actionRequired: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'booking' | 'payment' | 'message' | 'maintenance'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  // 1. MOCK DATA: SIGNAL STREAM
  const [signals, setSignals] = useState<Signal[]>([
    { id: 'sig-1', title: 'New Reservation Node', message: 'Alice Guest just reserved Deluxe Suite 201 for tomorrow.', type: 'booking', isRead: false, createdAt: '2 mins ago', priority: 'high', actionRequired: true },
    { id: 'sig-2', title: 'Incoming Settlement', message: 'Transaction #TX-9918 (Rp 1.500.000) confirmed by bank proxy.', type: 'payment', isRead: false, createdAt: '15 mins ago', priority: 'medium', actionRequired: false },
    { id: 'sig-3', title: 'Guest Comm Signal', message: 'Unit 102: "Could we have 2 extra towels delivered?"', type: 'message', isRead: true, createdAt: '1h ago', priority: 'medium', sender: 'Budi Santoso', actionRequired: true },
    { id: 'sig-4', title: 'Operational Reminder', message: 'Node #BK29 (John Doe) is scheduled for Check-Out in 30 mins.', type: 'system', isRead: false, createdAt: 'Just now', priority: 'high', actionRequired: true },
    { id: 'sig-5', title: 'Maintenance Alert', message: 'Unit 305: Reported AC cooling inefficiency.', type: 'maintenance', isRead: true, createdAt: '3h ago', priority: 'low', actionRequired: true },
  ]);

  // 2. FILTERING LOGIC
  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const matchesType = activeFilter === 'ALL' || s.type === activeFilter;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
  }, [signals, activeFilter, searchQuery]);

  // 3. HANDLERS
  const handleAcknowledge = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s));
    alert('Signal Acknowledged: Entry marked as verified in the local node.');
  };

  const markAllRead = () => {
    setSignals(prev => prev.map(s => ({ ...s, isRead: true })));
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Signal Command Center</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Pusat aliran informasi real-time dan orkestrasi respon operasional.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={markAllRead}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            Mark All Verified
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: SIGNAL STREAM */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
             <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1 overflow-x-auto scrollbar-hide max-w-full">
                {['ALL', 'booking', 'payment', 'message', 'maintenance'].map(type => (
                   <button 
                    key={type}
                    onClick={() => setActiveFilter(type as any)}
                    className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeFilter === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                   >
                     {type}
                   </button>
                ))}
             </div>
             <div className="relative w-full md:w-64">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  placeholder="Filter signal..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
                />
             </div>
          </div>

          <div className="space-y-4">
            {filteredSignals.map(sig => (
              <div 
                key={sig.id} 
                className={`p-8 rounded-[40px] border transition-all flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden ${
                  !sig.isRead ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/20' : 'bg-slate-50/50 border-slate-100'
                }`}
              >
                {!sig.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                )}
                
                <div className="flex items-center gap-8 flex-1">
                   <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-inner border ${
                     sig.type === 'booking' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     sig.type === 'payment' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                     sig.type === 'message' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                     'bg-rose-50 text-rose-600 border-rose-100'
                   }`}>
                      <i className={`fas ${
                        sig.type === 'booking' ? 'fa-calendar-plus' :
                        sig.type === 'payment' ? 'fa-receipt' :
                        sig.type === 'message' ? 'fa-comment-dots' :
                        'fa-bell-exclamation'
                      }`}></i>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{sig.title}</h4>
                         <span className="text-[10px] font-black text-slate-300 uppercase">{sig.createdAt}</span>
                         {!sig.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
                      </div>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-2 max-w-xl">{sig.message}</p>
                   </div>
                </div>

                <div className="flex gap-3 shrink-0">
                  {sig.type === 'message' && (
                    <button onClick={() => alert('Opening Comm Interface...')} className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Reply</button>
                  )}
                  <button 
                    onClick={() => handleAcknowledge(sig.id)}
                    className={`p-3 rounded-xl transition-all ${
                      sig.isRead ? 'bg-white border border-slate-200 text-slate-300' : 'bg-white border border-indigo-100 text-indigo-600 shadow-sm hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-check text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PRIORITY RADAR */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-rose-500 text-2xl shadow-inner">
                       <i className="fas fa-bolt-lightning"></i>
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">Priority Pulse</h3>
                       <p className="text-indigo-400/60 text-[9px] font-black uppercase tracking-widest">Urgent Operational Signals</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {signals.filter(s => s.priority === 'high' && !s.isRead).map(sig => (
                      <div key={sig.id} className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-3 group hover:bg-white/10 transition-all">
                         <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black uppercase tracking-widest">CRITICAL</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">{sig.createdAt}</span>
                         </div>
                         <p className="text-xs font-black uppercase text-indigo-100">{sig.title}</p>
                         <p className="text-[10px] text-white/40 leading-relaxed italic line-clamp-2">"{sig.message}"</p>
                      </div>
                    ))}
                    {signals.filter(s => s.priority === 'high' && !s.isRead).length === 0 && (
                      <div className="py-12 text-center space-y-4 opacity-20">
                         <i className="fas fa-shield-check text-4xl"></i>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero critical alerts</p>
                      </div>
                    )}
                 </div>
              </div>
              <button onClick={() => alert('Opening Emergency Log...')} className="relative z-10 w-full py-5 bg-white/5 border border-white/10 rounded-[28px] font-black text-[10px] uppercase tracking-widest text-indigo-300">View Full Thread</button>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic border-b border-slate-50 pb-4">Operational Status</h4>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-sm shadow-inner"><i className="fas fa-paper-plane"></i></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase leading-none">Response Rate</p>
                       <p className="text-2xl font-black text-indigo-600 mt-1">94%</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm shadow-inner"><i className="fas fa-check-double"></i></div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase leading-none">Signals Cleared</p>
                       <p className="text-2xl font-black text-emerald-600 mt-1">1.2K</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-6 group hover:bg-indigo-50 transition-all">
         <i className="fas fa-tower-broadcast text-indigo-400 text-xl group-hover:scale-110 transition-transform animate-pulse"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">SEULANGA REAL-TIME SIGNAL HUB v4.1 • AUTHENTICATED ACCESS ONLY</p>
      </div>
    </div>
  );
};
