
import React, { useState, useMemo } from 'react';
import { Review, Complaint, Dispute, Business, BusinessStatus } from '../../types';
import { MOCK_REVIEWS, MOCK_BUSINESSES } from '../../constants';

interface TrustCenterProps {
  businesses: Business[];
  onUpdateBusiness: (id: string, data: Partial<Business>) => void;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({ businesses, onUpdateBusiness }) => {
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'complaints' | 'disputes'>('reviews');
  
  // Mock State for Complaints (Integrating from constants if available, or local)
  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: 'cmp-1', guestId: 'u4', businessId: 'b1', subject: 'Kamar Tidak Sesuai Foto', message: 'Kamar yang diberikan jauh lebih kecil dan tidak ada balkon seperti di deskripsi.', status: 'pending', createdAt: '2024-12-28' },
    { id: 'cmp-2', guestId: 'u5', businessId: 'b2', subject: 'Pelayanan Buruk', message: 'Staf tidak ramah saat check-in dini hari.', status: 'investigating', createdAt: '2024-12-27' }
  ]);

  // Mock State for Disputes
  const [disputes, setDisputes] = useState<Dispute[]>([
    { id: 'dsp-1', bookingId: 'bk1', businessId: 'b1', guestId: 'u4', claimAmount: 500000, reason: 'Double charged service fee', status: 'open', createdAt: '2024-12-29' }
  ]);

  const [localReviews, setLocalReviews] = useState<Review[]>(MOCK_REVIEWS);

  // Derived Stats
  const stats = useMemo(() => ({
    pendingReviews: localReviews.filter(r => r.status === 'pending').length,
    openComplaints: complaints.filter(c => c.status !== 'resolved').length,
    activeDisputes: disputes.filter(d => d.status === 'open').length,
  }), [localReviews, complaints, disputes]);

  // Handlers
  const handleReviewStatus = (id: string, status: 'approved' | 'rejected') => {
    setLocalReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    alert(`Review Node ${id} transition to ${status.toUpperCase()} authorized.`);
  };

  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
    alert(`Complaint ${id} marked as RESOLVED in the platform ledger.`);
  };

  const handleIssuePenalty = (bizId: string) => {
    const biz = businesses.find(b => b.id === bizId);
    const currentPenalties = biz?.penaltyCount || 0;
    onUpdateBusiness(bizId, { penaltyCount: currentPenalties + 1 });
    alert(`Penalty issued to ${biz?.name}. Current Score: ${currentPenalties + 1}.`);
  };

  const handleResolveDispute = (disputeId: string, resolution: 'resolved_guest' | 'resolved_business') => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: resolution } : d));
    alert(`Dispute ${disputeId} closed. Settlement dispatched to ${resolution.split('_')[1]}.`);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TRUST METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Review Nodes', value: stats.pendingReviews, icon: 'fa-star', color: 'bg-indigo-50 text-indigo-600', alert: stats.pendingReviews > 0 },
          { label: 'Unresolved Complaints', value: stats.openComplaints, icon: 'fa-circle-exclamation', color: 'bg-amber-50 text-amber-600', alert: stats.openComplaints > 2 },
          { label: 'Active Escrow Disputes', value: stats.activeDisputes, icon: 'fa-scale-balanced', color: 'bg-rose-50 text-rose-600', alert: stats.activeDisputes > 0 },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            {stat.alert && <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none"></div>}
            <div className="relative z-10 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
               </div>
               <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl shadow-inner`}>
                  <i className={`fas ${stat.icon}`}></i>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. SUB-TAB NAVIGATION */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm w-fit gap-2">
        {[
          { id: 'reviews', label: 'Review Moderation', icon: 'fa-comments-check' },
          { id: 'complaints', label: 'Complaint Hub', icon: 'fa-headset' },
          { id: 'disputes', label: 'Financial Disputes', icon: 'fa-hand-holding-dollar' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              activeSubTab === tab.id ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="min-h-[500px]">
        {activeSubTab === 'reviews' && (
          <div className="grid grid-cols-1 gap-6">
            {localReviews.filter(r => r.status === 'pending').map(rev => {
              const biz = businesses.find(b => b.id === rev.businessId);
              return (
                <div key={rev.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6 group hover:border-indigo-200 transition-all">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex items-center gap-6">
                       <img src={`https://i.pravatar.cc/150?u=${rev.guestId}`} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 shadow-sm" />
                       <div>
                          <div className="flex items-center gap-3">
                             <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{rev.guestName}</h4>
                             <div className="flex text-amber-400 text-[10px]">
                                {[...Array(5)].map((_, i) => <i key={i} className={`${i < rev.rating ? 'fas' : 'far'} fa-star`}></i>)}
                             </div>
                          </div>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">Review for: {biz?.name}</p>
                       </div>
                    </div>
                    <div className="flex gap-3 h-fit">
                       <button onClick={() => handleReviewStatus(rev.id, 'approved')} className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">Authorize</button>
                       <button onClick={() => handleReviewStatus(rev.id, 'rejected')} className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Purge</button>
                       <button onClick={() => handleIssuePenalty(rev.businessId)} className="p-2.5 bg-slate-950 text-white rounded-xl shadow-lg" title="Flag & Penalty"><i className="fas fa-gavel text-xs"></i></button>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 text-sm font-medium leading-relaxed">
                    "{rev.comment}"
                  </div>
                </div>
              );
            })}
            {localReviews.filter(r => r.status === 'pending').length === 0 && (
              <div className="py-32 text-center space-y-4 opacity-30">
                 <i className="fas fa-check-double text-5xl"></i>
                 <p className="font-black uppercase text-xs tracking-widest">Review moderation queue is clear.</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'complaints' && (
          <div className="grid grid-cols-1 gap-6">
            {complaints.filter(c => c.status !== 'resolved').map(cmp => {
              const biz = businesses.find(b => b.id === cmp.businessId);
              return (
                <div key={cmp.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[100px]"></div>
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                     <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${cmp.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{cmp.status}</span>
                           <span className="text-[10px] font-bold text-slate-300">{cmp.createdAt}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{cmp.subject}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity under report: <span className="text-indigo-600">{biz?.name}</span></p>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => setComplaints(prev => prev.map(c => c.id === cmp.id ? {...c, status: 'investigating'} : c))} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Start Investigation</button>
                        <button onClick={() => handleResolveComplaint(cmp.id)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Finalize & Resolve</button>
                     </div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 leading-relaxed font-medium text-slate-700">
                    {cmp.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeSubTab === 'disputes' && (
          <div className="space-y-10">
            {disputes.filter(d => d.status === 'open').map(dsp => {
              const biz = businesses.find(b => b.id === dsp.businessId);
              return (
                <div key={dsp.id} className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                   
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-8">
                      <div>
                         <h3 className="text-2xl font-black tracking-tighter uppercase leading-none italic mb-2">Escrow Dispute: {dsp.id}</h3>
                         <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">Mediation required for financial settlement</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Claim Value</p>
                         <p className="text-3xl font-black text-white">Rp {dsp.claimAmount.toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Transaction Trace</h5>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs p-5 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-white/40">Booking Ref:</span>
                               <span className="font-black uppercase">{dsp.bookingId}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs p-5 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-white/40">Business Hub:</span>
                               <span className="font-black uppercase">{biz?.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs p-5 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-white/40">Dispute Reason:</span>
                               <span className="font-black uppercase text-indigo-300">{dsp.reason}</span>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8 flex flex-col justify-end">
                         <p className="text-[10px] font-bold text-white/30 italic leading-relaxed">System Recommendation: Review the chat logs between guest and business node. Check verified payment status from treasury logs before deciding.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => handleResolveDispute(dsp.id, 'resolved_guest')} className="py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl">Refund Guest Identity</button>
                            <button onClick={() => handleResolveDispute(dsp.id, 'resolved_business')} className="py-5 bg-white text-slate-950 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">Release to Business</button>
                         </div>
                      </div>
                   </div>
                </div>
              );
            })}
            
            {/* Penalty Ledger Overview */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8 mt-12">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 uppercase">Entity Penalty Ledger</h3>
                  <i className="fas fa-shield-virus text-rose-500"></i>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.filter(b => (b.penaltyCount || 0) > 0).sort((a,b) => (b.penaltyCount || 0) - (a.penaltyCount || 0)).map(b => (
                    <div key={b.id} className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] flex justify-between items-center">
                       <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{b.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penalties Accumulated</p>
                       </div>
                       <div className="text-right">
                          <span className={`text-2xl font-black ${(b.penaltyCount || 0) > 3 ? 'text-rose-600' : 'text-amber-600'}`}>{b.penaltyCount}</span>
                          {(b.penaltyCount || 0) >= 5 && (
                            <div className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase mt-1 animate-pulse">Suspend Alert</div>
                          )}
                       </div>
                    </div>
                  ))}
                  {businesses.filter(b => (b.penaltyCount || 0) > 0).length === 0 && (
                    <p className="col-span-full py-10 text-center text-slate-300 font-bold uppercase text-[9px] tracking-widest italic italic">Ecosystem integrity at 100%. No active penalties.</p>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-center gap-4">
         <i className="fas fa-circle-check text-emerald-500 text-sm"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">SEULANGA TRUST PROTOCOL v1.2 ACTIVE</p>
      </div>
    </div>
  );
};
