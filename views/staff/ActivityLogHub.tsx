
import React, { useState, useMemo } from 'react';
import { AppNotification, AuditLog, BookingStatus } from '../../types';
import { MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS } from '../../constants';

interface ActivityLogHubProps {
  businessId: string;
}

export const ActivityLogHub: React.FC<ActivityLogHubProps> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'audit'>('signals');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. SIGNALS FEED (Bookings & Payments)
  const signals = useMemo(() => {
    return MOCK_NOTIFICATIONS.filter(n => n.type === 'booking' || n.type === 'payment')
      .sort((a, b) => b.id.localeCompare(a.id));
  }, []);

  // 2. AUDIT TRAIL (Activity & Data Changes)
  const logs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(l => 
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.target.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Activity Control Node</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Monitoring sinyal sistem dan audit trail operasional real-time.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm">
           <button 
             onClick={() => setActiveTab('signals')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
               activeTab === 'signals' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
              <i className="fas fa-tower-broadcast"></i> Live Signals
           </button>
           <button 
             onClick={() => setActiveTab('audit')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
               activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
              <i className="fas fa-fingerprint"></i> Ops Audit
           </button>
        </div>
      </div>

      {/* 1. STATUS MONITORING TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
               <i className="fas fa-satellite-dish"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unread Signals</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {signals.filter(s => !s.isRead).length}
               </h3>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
               <i className="fas fa-check-double"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions Logged Today</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">128</h3>
            </div>
         </div>
         <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl text-indigo-400 shadow-inner">
                  <i className="fas fa-shield-halved"></i>
               </div>
               <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">System Integrity</p>
                  <h3 className="text-2xl font-black text-emerald-400 tracking-tighter uppercase italic leading-none">Hardened</h3>
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN FEED AREA */}
      <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm min-h-[600px] space-y-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className="text-2xl font-black text-slate-900 uppercase">
               {activeTab === 'signals' ? 'Notification Stream' : 'Forensic Activity Audit'}
            </h3>
            <div className="relative w-full md:w-96">
               <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
               <input 
                 type="text" 
                 placeholder="Search logs or signal ID..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
               />
            </div>
         </div>

         {activeTab === 'signals' ? (
           <div className="grid grid-cols-1 gap-4">
              {signals.map(s => (
                <div key={s.id} className={`p-8 rounded-[36px] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-xl ${s.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/40 border-indigo-100 shadow-lg shadow-indigo-100/20'}`}>
                   <div className="flex items-center gap-8 flex-1">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-sm ${
                        s.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                         <i className={`fas ${s.type === 'booking' ? 'fa-calendar-plus' : 'fa-receipt'}`}></i>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{s.title}</h4>
                            {!s.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></span>}
                         </div>
                         <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">{s.message}</p>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{s.createdAt}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Dismiss</button>
                      <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">Authorize Response</button>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Node</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Performed</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">ID</div>
                               <div>
                                  <p className="font-black text-indigo-600 uppercase group-hover:underline cursor-pointer">{log.actorName}</p>
                                  <p className="text-[9px] text-slate-300 uppercase font-black">{log.actorRole}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="px-3 py-1 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic">{log.action}</span>
                         </td>
                         <td className="px-10 py-8">
                            <p className="text-slate-500 font-bold uppercase tracking-tighter">/{log.target}</p>
                            <p className="text-[8px] text-slate-300 uppercase">Registry Node</p>
                         </td>
                         <td className="px-10 py-8 text-right text-slate-400 font-black italic">
                            {log.timestamp}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <i className="fas fa-clipboard-check text-indigo-600 text-2xl"></i>
            <div>
               <p className="text-sm font-black text-indigo-900 uppercase">Immutable Change Tracking Active</p>
               <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-widest mt-1">Sistem mencatat setiap perubahan data untuk audit kepatuhan.</p>
            </div>
         </div>
         <button className="px-8 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm relative z-10">Report Anomaly</button>
      </div>
    </div>
  );
};
