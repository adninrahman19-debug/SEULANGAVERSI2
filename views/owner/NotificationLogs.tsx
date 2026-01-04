
import React, { useState, useMemo } from 'react';
import { AuditLog, AppNotification, User } from '../../types';
import { MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS, MOCK_USERS } from '../../constants';

interface NotificationLogsProps {
  businessId: string;
}

export const NotificationLogs: React.FC<NotificationLogsProps> = ({ businessId }) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'audit'>('signals');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. DATA PROCESSING
  const signals = useMemo(() => {
    return MOCK_NOTIFICATIONS.sort((a, b) => b.id.localeCompare(a.id));
  }, []);

  const auditLogs = useMemo(() => {
    // Filter logs matching the search or business context
    return MOCK_AUDIT_LOGS.filter(log => 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [searchQuery]);

  const stats = useMemo(() => ({
    unread: signals.filter(n => !n.isRead).length,
    totalLogs: auditLogs.length,
    securityEvents: auditLogs.filter(l => l.type === 'security').length
  }), [signals, auditLogs]);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Activity Control Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Monitoring aliran sinyal sistem dan jejak audit digital properti.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm">
           <button 
             onClick={() => setActiveTab('signals')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
               activeTab === 'signals' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
              <i className="fas fa-tower-broadcast"></i> Signal Center
           </button>
           <button 
             onClick={() => setActiveTab('audit')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
               activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
              <i className="fas fa-fingerprint"></i> Forensic Audit
           </button>
        </div>
      </div>

      {/* 1. SURVEILLANCE MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center text-2xl shadow-inner border border-indigo-100">
               <i className="fas fa-bell"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Signals</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.unread} <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Unread</span></h3>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center text-2xl shadow-inner border border-emerald-100">
               <i className="fas fa-clock-rotate-left"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Audit Nodes</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.totalLogs} <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Events</span></h3>
            </div>
         </div>
         <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden flex items-center gap-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[20px] flex items-center justify-center text-2xl text-indigo-400 shadow-inner relative z-10">
               <i className="fas fa-shield-halved"></i>
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Integrity Status</p>
               <h3 className="text-3xl font-black text-emerald-400 tracking-tighter uppercase italic">Hardened</h3>
            </div>
         </div>
      </div>

      {/* 2. MAIN LOG CONTENT */}
      <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm min-h-[600px] space-y-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 pb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase">
                  {activeTab === 'signals' ? 'Notification Stream' : 'Forensic Audit Trail'}
               </h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {activeTab === 'signals' ? 'Umpan sinyal real-time dari seluruh marketplace node.' : 'Catatan kronologis perubahan data dan otorisasi operator.'}
               </p>
            </div>
            <div className="relative w-full md:w-96">
               <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
               <input 
                 type="text" 
                 placeholder="Filter log berdasarkan keyword..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
               />
            </div>
         </div>

         {activeTab === 'signals' ? (
           <div className="grid grid-cols-1 gap-4">
              {signals.map(signal => (
                <div key={signal.id} className={`p-8 rounded-[40px] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-xl ${signal.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100 shadow-lg shadow-indigo-100/20'}`}>
                   <div className="flex items-center gap-8 flex-1">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-sm ${
                        signal.type === 'booking' ? 'bg-emerald-50 text-emerald-600' :
                        signal.type === 'payment' ? 'bg-amber-50 text-amber-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                         <i className={`fas ${
                           signal.type === 'booking' ? 'fa-calendar-check' :
                           signal.type === 'payment' ? 'fa-money-bill-transfer' :
                           'fa-satellite-dish'
                         }`}></i>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{signal.title}</h4>
                            {!signal.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>}
                         </div>
                         <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">{signal.message}</p>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{signal.createdAt}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Dismiss</button>
                      <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">Resolve Node</button>
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
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Action</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
                       <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Temporal Axis</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">ID</div>
                               <div>
                                  <p className="font-black text-indigo-600 uppercase group-hover:underline cursor-pointer">{log.actorName}</p>
                                  <p className="text-[9px] text-slate-300 uppercase">{log.actorRole}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="px-3 py-1 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic">{log.action}</span>
                         </td>
                         <td className="px-10 py-8">
                            <p className="text-slate-500 font-bold uppercase tracking-tighter">/{log.target}</p>
                            <p className="text-[8px] text-slate-300 uppercase">System Object Node</p>
                         </td>
                         <td className="px-10 py-8 text-right text-slate-400 font-black">
                            {log.timestamp}
                         </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                         <td colSpan={4} className="py-40 text-center">
                            <i className="fas fa-file-circle-xmark text-slate-100 text-6xl mb-6"></i>
                            <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Pencarian tidak menemukan log aktivitas yang relevan.</p>
                         </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
         )}
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <i className="fas fa-shield-check text-indigo-600 text-2xl"></i>
            <div>
               <p className="text-sm font-black text-indigo-900 uppercase">Immutable Data Logging Active</p>
               <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-[0.2em] mt-1">Platform-wide activity tracking enabled for governance.</p>
            </div>
         </div>
         <button 
           onClick={() => alert('Dispatching global audit summary to registered owner email node...')}
           className="px-10 py-4 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm relative z-10"
         >
            Export Comprehensive Log
         </button>
      </div>
    </div>
  );
};
