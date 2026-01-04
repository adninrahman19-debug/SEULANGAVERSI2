
import React, { useState, useMemo } from 'react';
import { User, Complaint } from '../../types';

interface SupportCenterProps {
  currentUser: User;
  language: 'id' | 'en';
}

type SupportTab = 'faq' | 'guides' | 'contact' | 'complaint';

export const SupportCenter: React.FC<SupportCenterProps> = ({ currentUser, language }) => {
  const [activeTab, setActiveTab] = useState<SupportTab>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  // Complaint Form State
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    { id: 'f1', q: 'Bagaimana cara melakukan check-in digital?', a: 'Gunakan QR Code yang tersedia pada tab "Reservasi" Anda di terminal check-in properti untuk otorisasi instan.' },
    { id: 'f2', q: 'Kebijakan pembatalan unit node?', a: 'Pembatalan dalam 48 jam akan mendapatkan pengembalian payload 100%. Melewati batas tersebut akan dikenakan terminasi biaya operasional.' },
    { id: 'f3', q: 'Metode pembayaran yang didukung?', a: 'Kami mendukung transfer antar bank, kartu kredit global, dan dompet digital terverifikasi melalui Seulanga Treasury Hub.' },
    { id: 'f4', q: 'Cara melaporkan kerusakan unit?', a: 'Anda dapat menggunakan fitur "Report Issue" pada detail reservasi atau melalui tab "Komplain" di pusat bantuan ini.' }
  ];

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Conflict Resolution Protocol Initialized: Keluhan Anda telah dicatat dalam ledger keamanan dengan ID: CMP-' + Date.now());
      setComplaintSubject('');
      setComplaintMessage('');
      setIsSubmitting(false);
      setActiveTab('faq');
    }, 1500);
  };

  const d = {
    id: {
      title: 'Assistance & Help Hub',
      sub: 'Pusat navigasi bantuan dan resolusi konflik operasional.',
      tab_faq: 'FAQ Hub',
      tab_guides: 'Panduan Node',
      tab_contact: 'Kontak Support',
      tab_complaint: 'Ajukan Komplain',
      btn_send: 'Inisialisasi Protokol Komplain',
      search_p: 'Cari solusi atau prosedur...',
      contact_title: 'Koneksi Langsung',
      contact_sub: 'Hubungi operator pusat Seulanga untuk bantuan teknis 24/7.'
    },
    en: {
      title: 'Assistance & Help Hub',
      sub: 'Navigation center for support and operational conflict resolution.',
      tab_faq: 'FAQ Hub',
      tab_guides: 'Knowledge Shards',
      tab_contact: 'Support Contact',
      tab_complaint: 'Conflict Protocol',
      btn_send: 'Initialize Complaint Protocol',
      search_p: 'Search solutions or procedures...',
      contact_title: 'Direct Connection',
      contact_sub: 'Reach out to Seulanga central operators for 24/7 technical help.'
    }
  }[language];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. HEADER & SUB-NAVIGATION */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{d.title}</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">{d.sub}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[32px] border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
           {[
             { id: 'faq', label: d.tab_faq, icon: 'fa-circle-question' },
             { id: 'guides', label: d.tab_guides, icon: 'fa-book-bookmark' },
             { id: 'contact', label: d.tab_contact, icon: 'fa-headset' },
             { id: 'complaint', label: d.tab_complaint, icon: 'fa-shield-heart' },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as SupportTab)}
               className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
                 activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="min-h-[500px]">
        
        {/* FAQ HUB */}
        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="relative mb-12">
                <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  placeholder={d.search_p}
                  className="w-full bg-white border border-slate-200 rounded-[32px] py-5 pl-16 pr-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-sm"
                />
             </div>
             <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                     <button 
                       onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                       className="w-full p-8 text-left flex justify-between items-center group"
                     >
                        <span className="font-black text-slate-800 uppercase text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{faq.q}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedFaq === faq.id ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                           <i className="fas fa-chevron-down text-[10px]"></i>
                        </div>
                     </button>
                     {expandedFaq === faq.id && (
                       <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                             {faq.a}
                          </p>
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* KNOWLEDGE SHARDS / GUIDES */}
        {activeTab === 'guides' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Check-In Protocol', desc: 'Langkah-langkah validasi identitas fisik dan aktivasi kunci digital.', icon: 'fa-id-card', color: 'bg-indigo-50 text-indigo-600' },
                { title: 'Payment Ledger', desc: 'Panduan navigasi transaksi, invoice, dan treasury settlement.', icon: 'fa-vault', color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Guest Ethics', desc: 'Standar perilaku komunitas di dalam ekosistem properti Seulanga.', icon: 'fa-gavel', color: 'bg-amber-50 text-amber-600' },
                { title: 'Unit Maintenance', desc: 'Cara melaporkan kendala teknis pada infrastruktur unit.', icon: 'fa-tools', color: 'bg-rose-50 text-rose-600' },
              ].map((guide, i) => (
                <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer">
                   <div className={`w-14 h-14 rounded-2xl ${guide.color} flex items-center justify-center text-2xl mb-8 shadow-inner border border-white`}>
                      <i className={`fas ${guide.icon}`}></i>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{guide.title}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{guide.desc}</p>
                   <div className="pt-8 mt-8 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      Buka Prosedur <i className="fas fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* SUPPORT CONTACT */}
        {activeTab === 'contact' && (
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">{d.contact_title}</h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">{d.contact_sub}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => window.open('https://wa.me/6281234567890')} className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex items-center justify-between group hover:bg-emerald-600 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                             <i className="fab fa-whatsapp"></i>
                          </div>
                          <div className="text-left">
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:text-emerald-50">Instant Signal</p>
                             <p className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-white">WhatsApp Proxy</p>
                          </div>
                       </div>
                       <i className="fas fa-chevron-right text-emerald-200 group-hover:text-white"></i>
                    </button>
                    
                    <button onClick={() => window.location.href='mailto:support@seulanga.com'} className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center justify-between group hover:bg-indigo-600 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 text-2xl shadow-sm">
                             <i className="far fa-envelope-open"></i>
                          </div>
                          <div className="text-left">
                             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:text-indigo-50">Official Thread</p>
                             <p className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-white">Email Support Node</p>
                          </div>
                       </div>
                       <i className="fas fa-chevron-right text-indigo-200 group-hover:text-white"></i>
                    </button>
                 </div>
              </div>
              <div className="bg-slate-950 p-12 rounded-[64px] shadow-2xl relative overflow-hidden text-center space-y-8">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                 <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-4xl text-indigo-400 mx-auto shadow-inner border border-white/10 relative z-10">
                    <i className="fas fa-tower-broadcast animate-pulse"></i>
                 </div>
                 <div className="relative z-10 space-y-4">
                    <h4 className="text-2xl font-black text-white uppercase italic">Live Operator Proxy</h4>
                    <p className="text-indigo-200/40 text-sm font-medium leading-relaxed">Hubungkan transmisi langsung dengan tim bantuan ekosistem Seulanga melalui terminal chat internal.</p>
                 </div>
                 <button onClick={() => alert('Opening encrypted live channel...')} className="relative z-10 w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40">
                    Initialize Live Chat Node
                 </button>
              </div>
           </div>
        )}

        {/* CONFLICT PROTOCOL (COMPLAINT FORM) */}
        {activeTab === 'complaint' && (
           <div className="max-w-3xl mx-auto bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm space-y-12">
              <div className="text-center">
                 <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-100">
                    <i className="fas fa-shield-virus text-3xl"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Conflict Protocol</h3>
                 <p className="text-slate-400 text-sm font-medium">Gunakan formulir ini untuk eskalasi masalah serius atau kegagalan layanan pada node properti.</p>
              </div>

              <form onSubmit={handleComplaintSubmit} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Protokol</label>
                    <input 
                      required 
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      placeholder="E.g Kegagalan Akses Unit #201" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-rose-50 transition-all"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detail Kronologi (Payload)</label>
                    <textarea 
                      required 
                      rows={6}
                      value={complaintMessage}
                      onChange={(e) => setComplaintMessage(e.target.value)}
                      placeholder="Jelaskan secara presisi kendala yang Anda alami..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-900 outline-none focus:ring-4 ring-rose-50 transition-all resize-none"
                    />
                 </div>
                 <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100 flex items-start gap-4">
                    <i className="fas fa-info-circle text-rose-600 mt-1"></i>
                    <p className="text-[10px] font-bold text-rose-800 leading-relaxed uppercase tracking-tight">
                       Laporan ini bersifat resmi dan akan dipantau langsung oleh Tim Governance Seulanga. Identitas Anda akan tetap terenkripsi selama proses resolusi.
                    </p>
                 </div>
                 <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-600'}`}
                 >
                    {isSubmitting ? 'Syncing Complaint Node...' : d.btn_send}
                 </button>
              </form>
           </div>
        )}
      </div>

      {/* 3. SYSTEM INFOTIP */}
      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <i className="fas fa-shield-halved text-indigo-400 text-2xl"></i>
            <div>
               <p className="text-sm font-black text-slate-900 uppercase italic">Sovereign Protection Node</p>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Ekosistem Seulanga menjamin perlindungan konsumen dan keamanan data Anda di setiap transaksi.</p>
            </div>
         </div>
         <button className="relative z-10 px-10 py-4 bg-white border border-slate-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Buka Kebijakan Privasi</button>
      </div>
    </div>
  );
};
