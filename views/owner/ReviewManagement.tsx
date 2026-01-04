
import React, { useState, useMemo } from 'react';
import { Review, Business } from '../../types';
import { MOCK_REVIEWS } from '../../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

interface ReviewManagementProps {
  businessId: string;
}

export const ReviewManagement: React.FC<ReviewManagementProps> = ({ businessId }) => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.businessId === businessId));
  const [filter, setFilter] = useState<'all' | 'unreplied' | 'reported'>('all');
  const [replyText, setReplyText] = useState('');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // 1. ANALYTICS LOGIC
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : '0.0';
    const replied = reviews.filter(r => r.ownerReply).length;
    
    // Distribution for chart
    const dist = [1, 2, 3, 4, 5].map(star => ({
      name: `${star} Star`,
      count: reviews.filter(r => r.rating === star).length,
      star
    })).reverse();

    return { total, avg, replied, dist, responseRate: total > 0 ? Math.round((replied / total) * 100) : 0 };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (filter === 'unreplied') return !r.ownerReply;
      if (filter === 'reported') return r.status === 'rejected';
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, filter]);

  // 2. HANDLERS
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewId || !replyText.trim()) return;

    setReviews(prev => prev.map(r => 
      r.id === activeReviewId ? { ...r, ownerReply: replyText } : r
    ));
    
    alert("Response Authorized: Balasan Anda telah disinkronkan ke feed publik tamu.");
    setReplyText('');
    setActiveReviewId(null);
  };

  const handleReport = (id: string) => {
    if (confirm("Kirim permintaan moderasi ke Super Admin? Konten ini akan ditinjau ulang atas pelanggaran kebijakan.")) {
       alert("Security Alert Dispatched: Tim moderasi pusat akan meninjau ulasan ini dalam 24 jam.");
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Reputation Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Monitor sentimen guest node dan kelola otoritas ulasan publik.</p>
        </div>
      </div>

      {/* 1. ANALYTICS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Aggregate Rating Score</p>
                 <h3 className="text-8xl font-black tracking-tighter mb-4">{stats.avg}</h3>
                 <div className="flex text-amber-400 text-xl gap-2 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`${i < Math.round(Number(stats.avg)) ? 'fas' : 'far'} fa-star`}></i>
                    ))}
                 </div>
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">Berdasarkan {stats.total} total ulasan guest node yang terverifikasi.</p>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Response Strategy</p>
                 <span className="text-emerald-600 font-black text-xs">{stats.responseRate}%</span>
              </div>
              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Coverage</h4>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${stats.responseRate}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">"Kecepatan merespon meningkatkan kepercayaan guest node hingga 3.2x."</p>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Sentiment Distribution</h3>
              <div className="w-10 h-10 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100"><i className="fas fa-chart-simple"></i></div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.dist} layout="vertical" margin={{ left: 20, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                       {stats.dist.map((entry, index) => (
                         <Cell key={index} fill={entry.star >= 4 ? '#4f46e5' : entry.star === 3 ? '#f59e0b' : '#f43f5e'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 2. REVIEWS FEED CONTROL */}
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            <h3 className="text-2xl font-black text-slate-900 uppercase">Review Ledger</h3>
            <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'Universal', icon: 'fa-list-ul' },
                { id: 'unreplied', label: 'Awaiting Response', icon: 'fa-reply-all' },
                { id: 'reported', label: 'Reported Node', icon: 'fa-flag' },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
                    filter === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${tab.icon} text-[10px]`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
         </div>

         <div className="grid grid-cols-1 gap-8">
            {filteredReviews.map(rev => (
               <div key={rev.id} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group hover:border-indigo-200 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -z-0"></div>
                  
                  <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                     <div className="flex items-center gap-8">
                        <img src={`https://i.pravatar.cc/150?u=${rev.guestId}`} className="w-20 h-20 rounded-[32px] object-cover ring-8 ring-slate-50 shadow-lg" />
                        <div>
                           <div className="flex items-center gap-4 mb-2">
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{rev.guestName}</h4>
                              <div className="flex text-amber-400 gap-1">
                                 {[...Array(5)].map((_, i) => <i key={i} className={`${i < rev.rating ? 'fas' : 'far'} fa-star text-[10px]`}></i>)}
                              </div>
                           </div>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{rev.createdAt} • Verified Stay Node</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        {!rev.ownerReply && (
                           <button 
                             onClick={() => setActiveReviewId(rev.id)}
                             className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                           >
                              <i className="fas fa-reply mr-2"></i> Respond
                           </button>
                        )}
                        <button 
                          onClick={() => handleReport(rev.id)}
                          className="p-3.5 bg-white border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                           <i className="fas fa-flag text-xs"></i>
                        </button>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 relative z-10">
                     <i className="fas fa-quote-left text-slate-200 text-4xl absolute top-6 left-6 -z-0 opacity-40"></i>
                     <p className="text-lg text-slate-700 font-medium italic relative z-10 leading-relaxed px-10">"{rev.comment}"</p>
                  </div>

                  {rev.ownerReply && (
                     <div className="ml-10 lg:ml-20 p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-4 animate-in slide-in-from-left-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] shadow-lg shadow-indigo-200">
                              <i className="fas fa-building-circle-check"></i>
                           </div>
                           <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Official Management Response</span>
                        </div>
                        <p className="text-sm text-indigo-700 font-bold leading-relaxed">{rev.ownerReply}</p>
                     </div>
                  )}

                  {/* Reply Input Area */}
                  {activeReviewId === rev.id && (
                     <form onSubmit={handleReplySubmit} className="ml-10 lg:ml-20 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="relative group">
                           <textarea 
                             autoFocus
                             rows={4}
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             placeholder="Tulis balasan profesional untuk tamu Anda..."
                             className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all resize-none shadow-inner"
                           />
                           <div className="absolute bottom-6 right-8 flex gap-3">
                              <button type="button" onClick={() => setActiveReviewId(null)} className="px-6 py-2.5 bg-white text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 transition-all">Cancel</button>
                              <button type="submit" className="px-8 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">Authorize Broadcast</button>
                           </div>
                        </div>
                     </form>
                  )}
               </div>
            ))}

            {filteredReviews.length === 0 && (
               <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[64px]">
                  <i className="fas fa-star-half-stroke text-slate-100 text-7xl mb-8"></i>
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Tidak ada record ulasan pada node ini.</p>
               </div>
            )}
         </div>
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex items-center justify-center gap-6 group hover:bg-indigo-100 transition-colors">
         <i className="fas fa-certificate text-indigo-600 text-xl group-hover:scale-110 transition-transform"></i>
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.4em] italic">SEULANGA REPUTATION SHIELD ACTIVE • AUTHENTIC FEEDBACK ONLY</p>
      </div>
    </div>
  );
};
