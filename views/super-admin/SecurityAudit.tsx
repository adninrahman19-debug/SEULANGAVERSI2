
import React, { useState, useMemo } from 'react';
import { LoginLog, IPRestriction, SystemBackup, SecurityIncident, AuditLog, UserRole } from '../../types';
import { MOCK_AUDIT_LOGS } from '../../constants';

export const SecurityAudit: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'logins' | 'activity' | 'firewall' | 'backups' | 'incidents'>('logins');

  // 1. MOCK DATA: Login Threads
  const [loginLogs] = useState<LoginLog[]>([
    { id: 'l1', userId: 'u1', userName: 'Zian Ali', ipAddress: '182.1.22.90', device: 'Chrome / MacOS', status: 'success', timestamp: '2024-12-30 08:30:12' },
    { id: 'l2', userId: 'u2', userName: 'John Doe', ipAddress: '110.32.11.4', device: 'Safari / iOS', status: 'success', timestamp: '2024-12-30 08:15:45' },
    { id: 'l3', userId: 'unknown', userName: 'Attempted Auth', ipAddress: '45.112.33.1', device: 'Unknown Browser', status: 'failed', timestamp: '2024-12-30 07:55:00' },
  ]);

  // 2. MOCK DATA: IP Restrictions
  const [ipList, setIpList] = useState<IPRestriction[]>([
    { id: 'ip1', ip: '192.168.1.1', type: 'allow', description: 'HQ Office VPN', createdAt: '2024-01-01' },
    { id: 'ip2', ip: '45.112.0.0/16', type: 'block', description: 'Suspicious Botnet Range', createdAt: '2024-12-28' },
  ]);

  // 3. MOCK DATA: System Backups
  const [backups] = useState<SystemBackup[]>([
    { id: 'b1', name: 'Snapshot_Global_Alpha_20241229', size: '1.2 GB', status: 'completed', createdAt: '2024-12-29 03:00' },
    { id: 'b2', name: 'Snapshot_Global_Alpha_20241228', size: '1.18 GB', status: 'completed', createdAt: '2024-12-28 03:00' },
  ]);

  // 4. MOCK DATA: Security Incidents
  const [incidents] = useState<SecurityIncident[]>([
    { id: 'inc-1', type: 'brute_force', severity: 'high', status: 'investigating', description: '150+ failed login attempts from IP 45.112.33.1 targeting Master Node.', createdAt: '2024-12-30 07:56' },
    { id: 'inc-2', type: 'anomaly', severity: 'medium', status: 'resolved', description: 'Unusual GTV spike in Homestay cluster detected and verified.', createdAt: '2024-12-29 14:20' },
  ]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. SECURITY NAVIGATION */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm w-fit gap-2 overflow-x-auto scrollbar-hide max-w-full">
        {[
          { id: 'logins', label: 'Surveillance (Logins)', icon: 'fa-user-shield' },
          { id: 'activity', label: 'Forensic Audit', icon: 'fa-fingerprint' },
          { id: 'firewall', label: 'Firewall Matrix', icon: 'fa-shield-halved' },
          { id: 'backups', label: 'Data Custodian', icon: 'fa-cloud-arrow-up' },
          { id: 'incidents', label: 'Incident Command', icon: 'fa-triangle-exclamation', count: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
              activeSubTab === tab.id ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
            {tab.count ? <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px]">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {/* 2. LOGIN LOGS */}
        {activeSubTab === 'logins' && (
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Authentication Surveillance</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Real-time monitoring of identity synchronization</p>
               </div>
               <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-all">Export Session Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity node</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal node</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Geospatial IP</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Payload</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Auth Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                  {loginLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-900 uppercase">{log.userName}</p>
                        <p className="text-[9px] text-slate-400">UID: {log.userId}</p>
                      </td>
                      <td className="px-10 py-6 text-slate-500 font-bold">{log.timestamp}</td>
                      <td className="px-10 py-6">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg font-black text-indigo-600 tracking-tighter">{log.ipAddress}</span>
                      </td>
                      <td className="px-10 py-6 text-slate-400">{log.device}</td>
                      <td className="px-10 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-full font-black uppercase tracking-widest border ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                        }`}>{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ACTIVITY LOGS */}
        {activeSubTab === 'activity' && (
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Immutable Forensic Audit</h3>
                <i className="fas fa-fingerprint text-indigo-200 text-3xl"></i>
             </div>
             <div className="overflow-x-auto font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/30">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Actor Node</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Action Description</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Target Entity</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[11px]">
                    {MOCK_AUDIT_LOGS.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-6">
                           <p className="font-black text-indigo-600 uppercase">{log.actorName}</p>
                           <p className="text-[9px] text-slate-300 font-bold">{log.actorRole}</p>
                        </td>
                        <td className="px-10 py-6 text-slate-700 font-bold uppercase">{log.action}</td>
                        <td className="px-10 py-6 text-slate-400 font-bold italic">/{log.target}</td>
                        <td className="px-10 py-6 text-right text-slate-300">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* 4. FIREWALL (IP RESTRICTION) */}
        {activeSubTab === 'firewall' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8">
               <h3 className="text-xl font-black uppercase tracking-tight italic">Inject Restriction</h3>
               <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Geospatial IP Node</label>
                     <input placeholder="0.0.0.0 or CIDR" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-mono text-sm text-indigo-200 outline-none focus:ring-2 ring-indigo-500/50" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Protocol Type</label>
                     <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none">
                        <option value="allow">White List (Authorize)</option>
                        <option value="block">Black List (Reject)</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Operational Context</label>
                     <textarea rows={3} placeholder="Reason for this node status..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none resize-none" />
                  </div>
                  <button className="w-full py-5 bg-indigo-600 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all">Authorize Restriction</button>
               </form>
            </div>
            <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
               <h3 className="text-xl font-black text-slate-900 uppercase">Active Firewall Policies</h3>
               <div className="space-y-4">
                  {ipList.map(item => (
                    <div key={item.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] flex items-center justify-between group hover:border-indigo-300 transition-all">
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${item.type === 'allow' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             <i className={`fas ${item.type === 'allow' ? 'fa-shield-check' : 'fa-hand'}`}></i>
                          </div>
                          <div>
                             <p className="font-mono text-sm font-black text-slate-900">{item.ip}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.description}</p>
                          </div>
                       </div>
                       <button className="p-3.5 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><i className="fas fa-trash-can text-xs"></i></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* 5. BACKUPS */}
        {activeSubTab === 'backups' && (
          <div className="space-y-12">
            <div className="bg-indigo-600 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="relative z-10 flex items-center gap-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-[32px] flex items-center justify-center text-4xl shadow-inner border border-white/30">
                     <i className="fas fa-database"></i>
                  </div>
                  <div>
                     <h3 className="text-4xl font-black tracking-tighter uppercase leading-none mb-3">Master Snapshot Hub</h3>
                     <p className="text-indigo-100/60 font-medium text-sm max-w-md leading-relaxed uppercase tracking-widest text-[10px]">Generate immutable platform-wide data shards for disaster recovery.</p>
                  </div>
               </div>
               <button className="relative z-10 px-12 py-6 bg-white text-indigo-600 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:scale-[1.05] transition-all">Initialize Platform Snapshot</button>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
               <h3 className="text-xl font-black text-slate-900 uppercase">Historical Snapshot Shards</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {backups.map(b => (
                    <div key={b.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] flex items-center justify-between group hover:border-indigo-600 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-600 group-hover:border-indigo-100">
                             <i className="fas fa-file-zipper text-xl"></i>
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-sm uppercase truncate max-w-[250px]">{b.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{b.createdAt} • Payload: {b.size}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-3 bg-white text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Restore Data"><i className="fas fa-rotate-left"></i></button>
                          <button className="p-3 bg-white text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm" title="Download Offline"><i className="fas fa-download"></i></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* 6. INCIDENTS */}
        {activeSubTab === 'incidents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
                {incidents.map(inc => (
                  <div key={inc.id} className={`p-10 rounded-[56px] border-l-[24px] shadow-2xl space-y-8 relative overflow-hidden bg-white ${
                    inc.severity === 'high' ? 'border-rose-600' : 'border-amber-400'
                  }`}>
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-4 mb-4">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                inc.status === 'investigating' ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                              }`}>{inc.status}</span>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{inc.createdAt}</span>
                           </div>
                           <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none italic">{inc.type.replace('_', ' ')} Detected</h4>
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Anomaly Serial: {inc.id}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl ${
                          inc.severity === 'high' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-amber-500'
                        }`}>
                           <i className="fas fa-biohazard"></i>
                        </div>
                     </div>
                     <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 font-bold text-slate-700 leading-relaxed text-sm">
                        {inc.description}
                     </div>
                     <div className="flex gap-4 pt-4 border-t border-slate-50">
                        <button className="flex-1 py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Assign Response Node</button>
                        <button className="px-10 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Mark as Neutralized</button>
                     </div>
                  </div>
                ))}
             </div>
             <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white space-y-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                   <h3 className="text-xl font-black tracking-tight uppercase leading-none italic">Threat Statistics</h3>
                   <div className="space-y-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Attacks</span>
                         <span className="text-2xl font-black text-rose-500">0</span>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Blocked IPs</span>
                         <span className="text-2xl font-black text-indigo-400">1,209</span>
                      </div>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Uptime integrity</span>
                         <span className="text-2xl font-black text-emerald-400">99.99%</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic border-b border-slate-50 pb-4">Incident Log Hub</h4>
                   <div className="space-y-6">
                      {[
                        { title: 'Brute Force at Node-G', time: '12h ago', level: 'high' },
                        { title: 'API Key Leakage (Test)', time: '2d ago', level: 'medium' },
                        { title: 'Data Export (Large)', time: '3d ago', level: 'low' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                           <div className={`w-2 h-2 rounded-full ${item.level === 'high' ? 'bg-rose-500' : item.level === 'medium' ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
                           <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{item.title}</p>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{item.time}</p>
                           </div>
                           <i className="fas fa-chevron-right text-slate-200 text-[10px]"></i>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-4">
         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">SEULANGA ALPHA SHIELD V2.40 ENCRYPTED & OPERATIONAL</p>
      </div>
    </div>
  );
};
