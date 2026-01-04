
import React, { useState, useMemo } from 'react';

interface SOPNode {
  id: string;
  category: 'CHECK-IN' | 'CLEANING' | 'EMERGENCY' | 'FINANCE';
  title: string;
  steps: string[];
  lastUpdated: string;
}

export const HelpSopHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | SOPNode['category']>('ALL');

  // 1. MOCK DATA: SOP REGISTRY
  const sopLibrary: SOPNode[] = [
    { 
      id: 'SOP-01', 
      category: 'CHECK-IN', 
      title: 'Protokol Validasi Identitas Fisik', 
      steps: [
        'Minta dokumen identitas asli (KTP/Paspor).',
        'Verifikasi kemiripan wajah dengan foto dokumen.',
        'Scan dokumen menggunakan terminal identitas.',
        'Pastikan nama di sistem sesuai dengan dokumen fisik.',
        'Berikan kunci akses node hanya setelah verifikasi selesai.'
      ],
      lastUpdated: '2024-11-10'
    },
    { 
      id: 'SOP-02', 
      category: 'EMERGENCY', 
      title: 'Penanganan Gangguan Listrik/Utility', 
      steps: [
        'Cek panel utama di zona teknis.',
        'Hubungi Maintenance Node melalui Signal Hub.',
        'Informasikan guest node yang terdampak via chat.',
        'Jika tidak selesai dalam 15 menit, hubungi Owner Overide.'
      ],
      lastUpdated: '2024-12-01'
    },
    { 
      id: 'SOP-03', 
      category: 'CLEANING', 
      title: 'Standar Sterilisasi Unit (Check-Out)', 
      steps: [
        'Buka semua ventilasi udara.',
        'Ganti seluruh linen (Sprei, Handuk) dengan stok baru.',
        'Sanitasi permukaan keras (Meja, Gagang Pintu, Remote).',
        'Cek kelengkapan minibar.',
        'Update status unit menjadi READY di Dashboard.'
      ],
      lastUpdated: '2024-10-20'
    }
  ];

  const filteredSop = useMemo(() => {
    return sopLibrary.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'ALL' || s.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Standard Operating Hub</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Pusat dokumentasi prosedur operasional dan standar layanan Seulanga.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1 overflow-x-auto scrollbar-hide">
          {['ALL', 'CHECK-IN', 'CLEANING', 'EMERGENCY', 'FINANCE'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: SOP REPOSITORY */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Cari prosedur atau kata kunci SOP..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[32px] py-5 pl-16 pr-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-6">
            {filteredSop.map(sop => (
              <div key={sop.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                        sop.category === 'EMERGENCY' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                         <i className={`fas ${sop.category === 'EMERGENCY' ? 'fa-triangle-exclamation' : 'fa-book-atlas'}`}></i>
                      </div>
                      <div>
                         <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{sop.title}</h4>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sop.id} • UPDATED: {sop.lastUpdated}</p>
                      </div>
                   </div>
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">Active Protocol</span>
                </div>
                <div className="p-10 space-y-6">
                   <div className="space-y-4">
                      {sop.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-6 items-start group/step">
                           <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0 group-hover/step:bg-indigo-600 group-hover/step:text-white transition-all">{idx + 1}</span>
                           <p className="text-sm font-medium text-slate-600 leading-relaxed pt-1.5">{step}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ESCALATION & EMERGENCY */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-rose-500 text-2xl shadow-inner">
                       <i className="fas fa-phone-volume"></i>
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">Escalation Hub</h3>
                       <p className="text-indigo-400/60 text-[9px] font-black uppercase tracking-widest">Emergency Owner Contacts</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <p className="text-xs font-medium text-white/40 leading-relaxed italic">"Gunakan jalur ini hanya untuk keadaan darurat atau permintaan override otoritas sistem."</p>
                    
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                       <div className="flex items-center gap-4">
                          <img src="https://i.pravatar.cc/150?u=u2" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/10" alt="owner" />
                          <div>
                             <p className="text-xs font-black uppercase text-indigo-100">John Proprietor</p>
                             <p className="text-[9px] font-black text-indigo-400 uppercase">Primary Owner Node</p>
                          </div>
                       </div>
                       <button onClick={() => window.open('tel:+6281277779999')} className="w-full py-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Call Authority</button>
                    </div>
                 </div>
              </div>
              <button onClick={() => alert('Dispatching emergency signal to all owners...')} className="relative z-10 w-full py-5 bg-rose-600 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-rose-500 transition-all">Broadcast Help Signal</button>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic border-b border-slate-50 pb-4">Service Excellence Guide</h4>
              <div className="space-y-6">
                 {[
                   { title: 'Hospitality Language', icon: 'fa-language', desc: 'Gunakan terminologi ramah & formal saat berkomunikasi.' },
                   { title: 'Complaint Handling', icon: 'fa-heart-circle-exclamation', desc: 'Dengarkan, Validasi, Selesaikan (LVE Node).' },
                   { title: 'Crisis Management', icon: 'fa-shield-heart', desc: 'Tetap tenang dan ikuti alur SOP Emergency.' }
                 ].map((guide, i) => (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                          <i className={`fas ${guide.icon}`}></i>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{guide.title}</p>
                          <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-0.5">{guide.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-6 group hover:bg-indigo-50 transition-all">
         <i className="fas fa-book-sparkles text-indigo-400 text-xl group-hover:scale-110 transition-transform"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">SEULANGA OPERATIONAL BIBLE v4.1 • PROTOCOL INTEGRITY VERIFIED</p>
      </div>
    </div>
  );
};
