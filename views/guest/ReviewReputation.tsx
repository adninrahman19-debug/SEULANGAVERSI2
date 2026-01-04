
import React, { useState, useMemo } from 'react';
import { Booking, Review, BookingStatus, Business } from '../../types';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_REVIEWS } from '../../constants';

interface ReviewReputationProps {
  currentUser: { id: string, name: string };
  language: 'id' | 'en';
}

export const ReviewReputation: React.FC<ReviewReputationProps> = ({ currentUser, language }) => {
  const [activeSubTab, setActiveSubTab] = useState<'awaiting' | 'published'>('awaiting');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // 1. DATA AGGREGATION
  const awaitingReview = useMemo(() => {
    const reviewedBookingIds = MOCK_REVIEWS.filter(r => r.guestId === currentUser.id).map(r => r.id); // Mock logic: in real app, link by bookingId
    return MOCK_BOOKINGS.filter(b => 
      b.guestId === currentUser.id && 
      b.status === BookingStatus.COMPLETED &&
      !reviewedBookingIds.includes(b.id)
    );
  }, [currentUser.id]);

  const publishedReviews = useMemo(() => {
    return MOCK_REVIEWS.filter(r => r.guestId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser.id]);

  const getBiz = (id: string) => MOCK_BUSINESSES.find(b => b.id === id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingReviewId ? 'Re-configured' : 'Published';
    alert(`Reputation Node ${action}: Data Anda telah disinkronkan ke feed publik properti.`);
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
    setEditingReviewId(null);
    setComment('');
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Conflict Node Initialized: Laporan insiden telah dikirim ke tim keamanan Seulanga.');
    setIsIncidentModalOpen(false);
    setSelectedBooking(null);
  };

  const d = {
    id: {
      title: 'Reputasi & Insiden',
      sub: 'Bangun ekosistem yang lebih baik melalui ulasan jujur dan pelaporan masalah.',
      tab_pending: 'Menunggu Ulasan',
      tab_published: 'Ulasan Saya',
      btn_review: 'Beri Rating',
      btn_report: 'Laporkan Masalah',
      btn_edit: 'Re-Konfigurasi',
      lock_msg: 'Registry Terkunci (Melebihi 24 Jam)',
      empty_pending: 'Semua node properti telah diulas.',
      empty_published: 'Belum ada ulasan yang diterbitkan.'
    },
    en: {
      title: 'Reputation & Incidents',
      sub: 'Build a better ecosystem through honest reviews and incident reporting.',
      tab_pending: 'Awaiting Review',
      tab_published: 'My Feed',
      btn_review: 'Submit Rating',
      btn_report: 'Report Problem',
      btn_edit: 'Re-Configure',
      lock_msg: 'Registry Locked (Past 24h)',
      empty_pending: 'All property nodes have been reviewed.',
      empty_published: 'No reviews published yet.'
    }
  }[language];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. HEADER & SUB-NAV */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{d.title}</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">{d.sub}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[32px] border border-slate-100 shadow-sm">
           <button 
             onClick={() => setActiveSubTab('awaiting')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'awaiting' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_pending} ({awaitingReview.length})
           </button>
           <button 
             onClick={() => setActiveSubTab('published')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'published' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_published}
           </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="min-h-[500px]">
        {activeSubTab === 'awaiting' && (
           <div className="grid grid-cols-1 gap-6">
              {awaitingReview.map(bk => {
                const biz = getBiz(bk.businessId);
                return (
                  <div key={bk.id} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-10">
                     <div className="flex items-center gap-10 flex-1">
                        <img src={biz?.images[0]} className="w-24 h-24 rounded-[32px] object-cover ring-4 ring-slate-50 shadow-lg" />
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{biz?.name}</h4>
                              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase">Ref: {bk.id}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Node: {bk.checkIn} — {bk.checkOut}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button 
                          onClick={() => { setSelectedBooking(bk); setIsIncidentModalOpen(true); }}
                          className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                        >
                           {d.btn_report}
                        </button>
                        <button 
                          onClick={() => { setSelectedBooking(bk); setIsReviewModalOpen(true); }}
                          className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
                        >
                           {d.btn_review}
                        </button>
                     </div>
                  </div>
                );
              })}
              {awaitingReview.length === 0 && (
                <div className="py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px] space-y-6">
                   <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto text-4xl shadow-inner border border-white">
                      <i className="fas fa-check-double"></i>
                   </div>
                   <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em] italic">{d.empty_pending}</p>
                </div>
              )}
           </div>
        )}

        {activeSubTab === 'published' && (
           <div className="grid grid-cols-1 gap-8">
              {publishedReviews.map(rev => {
                const biz = getBiz(rev.businessId);
                const canEdit = true; // Mock: check timestamp < 24h
                return (
                  <div key={rev.id} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group hover:border-indigo-200 transition-all">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px]"></div>
                     
                     <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                        <div className="flex items-center gap-6">
                           <img src={biz?.images[0]} className="w-20 h-20 rounded-[32px] object-cover ring-8 ring-slate-50 shadow-lg" />
                           <div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{biz?.name}</h4>
                              <div className="flex text-amber-400 gap-1 mt-2">
                                 {[...Array(5)].map((_, i) => <i key={i} className={`${i < rev.rating ? 'fas' : 'far'} fa-star text-[10px]`}></i>)}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">{rev.createdAt}</p>
                           {canEdit ? (
                             <button 
                               onClick={() => { setEditingReviewId(rev.id); setComment(rev.comment); setRating(rev.rating); setIsReviewModalOpen(true); }}
                               className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                             >
                                <i className="fas fa-pen-nib mr-2"></i> {d.btn_edit}
                             </button>
                           ) : (
                             <span className="text-[8px] font-black text-slate-300 uppercase italic bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{d.lock_msg}</span>
                           )}
                        </div>
                     </div>

                     <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 relative">
                        <i className="fas fa-quote-left text-slate-200 text-4xl absolute top-6 left-6 opacity-40"></i>
                        <p className="text-lg text-slate-600 font-medium italic leading-relaxed px-10 relative z-10">"{rev.comment}"</p>
                     </div>

                     {rev.ownerReply && (
                       <div className="ml-10 lg:ml-20 p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-4 animate-in slide-in-from-left-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] shadow-lg">
                                <i className="fas fa-building-circle-check"></i>
                             </div>
                             <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Management Response</span>
                          </div>
                          <p className="text-sm text-indigo-700 font-bold leading-relaxed">{rev.ownerReply}</p>
                       </div>
                     )}
                  </div>
                );
              })}
           </div>
        )}
      </div>

      {/* 3. MODAL: SUBMIT REVIEW */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 space-y-12 relative overflow-hidden flex flex-col">
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="text-center">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-indigo-100">
                    <i className="fas fa-star-half-stroke"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Reputation Node</h3>
                 <p className="text-slate-500 font-medium">Berikan otoritas ulasan Anda untuk meningkatkan transparansi ekosistem.</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-10">
                 <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${rating >= star ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-300'}`}
                      >
                         <i className="fas fa-star"></i>
                      </button>
                    ))}
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Narasi Pengalaman</label>
                    <textarea 
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      placeholder="Apa yang paling Anda sukai atau butuh diperbaiki?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none shadow-inner"
                    />
                 </div>

                 <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Publish Reputation Data</button>
              </form>
           </div>
        </div>
      )}

      {/* 4. MODAL: REPORT INCIDENT */}
      {isIncidentModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setIsIncidentModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="text-center">
                 <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-rose-100">
                    <i className="fas fa-biohazard"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Incident Protocol</h3>
                 <p className="text-slate-500 font-medium">Laporkan masalah serius yang terjadi di node <strong>{getBiz(selectedBooking.businessId)?.name}</strong>.</p>
              </div>

              <form onSubmit={handleReportIncident} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Masalah</label>
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none">
                       <option>Fasilitas Tidak Berfungsi</option>
                       <option>Masalah Kebersihan Serius</option>
                       <option>Kendala Akses Digital Key</option>
                       <option>Layanan Operator Tidak Pantas</option>
                       <option>Lainnya</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kronologi Kejadian</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Jelaskan secara detail insiden yang terjadi..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-700 outline-none focus:ring-4 ring-rose-50 transition-all resize-none shadow-inner"
                    />
                 </div>
                 <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase tracking-tight flex items-center gap-3">
                       <i className="fas fa-shield-halved"></i>
                       Laporan ini akan ditinjau secara independen oleh Tim Governance Seulanga.
                    </p>
                 </div>
                 <button type="submit" className="w-full py-6 bg-rose-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-700 transition-all">Authorize Incident Report</button>
              </form>
           </div>
        </div>
      )}

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-6 group hover:bg-indigo-50 transition-all">
         <i className="fas fa-award text-indigo-400 text-xl group-hover:scale-110 transition-transform"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">SEULANGA GLOBAL REPUTATION PROTOCOL v4.1 • AUTHENTIC FEEDBACK ONLY</p>
      </div>
    </div>
  );
};
