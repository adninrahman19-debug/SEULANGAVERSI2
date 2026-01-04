
import React, { useState, useMemo } from 'react';
import { Booking, Transaction, Business, BookingStatus, UserRole } from '../../types';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_TRANSACTIONS } from '../../constants';

interface BookingOversightProps {
  bookings: Booking[];
  transactions: Transaction[];
  businesses: Business[];
}

export const BookingOversight: React.FC<BookingOversightProps> = ({ 
  bookings, transactions, businesses 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

  // 1. ANOMALY DETECTION LOGIC (Heuristic)
  const anomalies = useMemo(() => {
    return bookings.map(bk => {
      const issues: string[] = [];
      const biz = businesses.find(b => b.id === bk.businessId);
      
      // High Value Threshold (e.g. > 10M)
      if (bk.totalPrice > 10000000) issues.push('High Economic Magnitude');
      
      // Manual/Walk-in detection
      if (bk.guestId === 'u-walkin') issues.push('Manual Bypass Node');

      // Rapid sequence (mocked: if ID is long, assume it's a recent manual entry)
      if (bk.id.includes('WALK')) issues.push('Non-Marketplace Registry');

      return issues.length > 0 ? { ...bk, issues, bizName: biz?.name } : null;
    }).filter(a => a !== null);
  }, [bookings, businesses]);

  // 2. FILTERED DATA
  const filteredBookings = useMemo(() => {
    return bookings.filter(bk => {
      const biz = businesses.find(b => b.id === bk.businessId);
      const matchesSearch = bk.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           biz?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBiz = selectedBizId === 'ALL' || bk.businessId === selectedBizId;
      const matchesStatus = statusFilter === 'ALL' || bk.status === statusFilter;
      const matchesDate = !dateFilter || bk.createdAt === dateFilter;
      
      return matchesSearch && matchesBiz && matchesStatus && matchesDate;
    });
  }, [bookings, businesses, searchQuery, selectedBizId, statusFilter, dateFilter]);

  const stats = useMemo(() => ({
    gtv: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    count: bookings.length,
    anomalies: anomalies.length,
    active: bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length
  }), [bookings, anomalies]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Global Platform GTV', value: `Rp ${(stats.gtv / 1000000).toFixed(1)}M`, icon: 'fa-vault', color: 'bg-slate-900 text-white' },
          { label: 'System Thread Count', value: stats.count, icon: 'fa-diagram-project', color: 'bg-white text-slate-900' },
          { label: 'In-House Nodes', value: stats.active, icon: 'fa-house-circle-check', color: 'bg-white text-slate-900' },
          { label: 'Risk Anomalies', value: stats.anomalies, icon: 'fa-radiation', color: 'bg-rose-50 text-rose-600', alert: stats.anomalies > 0 },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group`}>
            {stat.alert && <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>}
            <div className="relative z-10">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 border ${stat.color.includes('white') ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/10'}`}>
                  <i className={`fas ${stat.icon}`}></i>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. RISK RADAR (ANOMALY FEED) */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                 <i className="fas fa-microchip-ai text-xl"></i>
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Risk Radar</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Heuristic anomaly detection active</p>
              </div>
           </div>
           <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 animate-pulse">Scanning Live Threads</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {anomalies.slice(0, 3).map((an, i) => (
             <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4 hover:border-rose-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="flex justify-between items-start relative z-10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Anomaly Type</p>
                      <div className="flex flex-wrap gap-1">
                        {an?.issues.map(iss => (
                          <span key={iss} className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">{iss}</span>
                        ))}
                      </div>
                   </div>
                   <button className="text-slate-300 hover:text-rose-500 transition-colors"><i className="fas fa-eye"></i></button>
                </div>
                <div className="relative z-10 pt-2">
                   <p className="text-sm font-black text-slate-900 uppercase truncate">{an?.bizName}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Thread ID: {an?.id}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 relative z-10">
                   <span className="text-sm font-black text-rose-600">Rp {an?.totalPrice.toLocaleString()}</span>
                   <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Investigate Node</button>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* 3. GLOBAL MONITORING TERMINAL */}
      <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-10">
            <div>
               <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2 italic">Global Operational Ledger</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">Universal oversight of all marketplace transactions</p>
            </div>
            <div className="flex flex-wrap gap-4">
               <div className="relative">
                  <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-white/20"></i>
                  <input 
                    type="text" 
                    placeholder="Filter ID/Business..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-14 pr-6 text-[11px] font-bold text-white outline-none focus:bg-white/10 transition-all w-64"
                  />
               </div>
               <select 
                 value={selectedBizId}
                 onChange={(e) => setSelectedBizId(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[11px] font-black text-indigo-400 uppercase outline-none"
               >
                  <option value="ALL">All Cluster Nodes</option>
                  {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
               <button onClick={() => alert('Dispatching CSV thread to authorized email...')} className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl">
                  <i className="fas fa-file-export mr-2"></i> Export Audit
               </button>
            </div>
         </div>

         <div className="relative z-10 overflow-x-auto rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5">
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Transaction Node</th>
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Partner Hub</th>
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Timing Cycle</th>
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Economic Value</th>
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Status Hub</th>
                     <th className="px-8 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] text-right">Oversight</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredBookings.map(bk => {
                    const biz = businesses.find(b => b.id === bk.businessId);
                    return (
                      <tr key={bk.id} className="hover:bg-white/5 transition-colors group">
                         <td className="px-8 py-6">
                            <p className="font-black text-indigo-50 uppercase text-xs tracking-tight">{bk.id}</p>
                            <p className="text-[9px] font-bold text-white/30 uppercase mt-1">Ref ID Registry</p>
                         </td>
                         <td className="px-8 py-6">
                            <p className="font-black text-white/70 uppercase text-[11px] truncate max-w-[150px]">{biz?.name}</p>
                            <p className="text-[9px] font-bold text-indigo-400/50 uppercase">{biz?.category}</p>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-[10px] font-black text-white/60 uppercase">{bk.checkIn}</p>
                            <p className="text-[8px] font-bold text-white/20 uppercase">Arrival Protocol</p>
                         </td>
                         <td className="px-8 py-6">
                            <p className="font-black text-emerald-400 text-sm">Rp {bk.totalPrice.toLocaleString()}</p>
                            <p className="text-[8px] font-bold text-white/20 uppercase">Settlement Value</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               bk.status === BookingStatus.CONFIRMED ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 
                               bk.status === BookingStatus.CHECKED_IN ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                               'bg-white/5 text-white/30 border-white/10'
                            }`}>{bk.status}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button onClick={() => alert(`Master Audit Triggered for Node ${bk.id}`)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/30 hover:text-white hover:bg-indigo-600 transition-all">
                               <i className="fas fa-shield-virus text-[10px]"></i>
                            </button>
                         </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <i className="fas fa-database text-white/5 text-4xl mb-4"></i>
                        <p className="text-white/20 font-black uppercase text-[10px] tracking-widest italic">No operational data matches the current filter matrix</p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
         <p className="text-center text-[9px] font-black text-white/10 uppercase tracking-[0.4em] pt-4 italic">Platform Integrity Shield v2.4.0 Authorized Access Only</p>
      </div>
    </div>
  );
};
