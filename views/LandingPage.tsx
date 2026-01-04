
import React, { useState, useEffect, useMemo } from 'react';
import { BusinessCategory, Business, SubscriptionPlan } from '../types';
import { MOCK_BUSINESSES } from '../constants';

interface LandingPageProps {
  onNavigate: (view: string, subView?: string) => void;
  onSelectProperty: (property: Business) => void;
  language: 'id' | 'en';
  onLanguageChange: (lang: 'id' | 'en') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectProperty, language, onLanguageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const translations = {
    id: {
      nav: { 
        home: 'Beranda', 
        features: 'Fitur', 
        types: 'Tipe Bisnis', 
        pricing: 'Harga', 
        how: 'Cara Kerja', 
        contact: 'Kontak',
        login: 'Masuk', 
        register: 'Daftar Bisnis' 
      },
      hero: { 
        badge: 'Platform Properti Terintegrasi #1 di Sumatra', 
        h1: 'Satu Platform untuk Kelola, Pesan, dan Kembangkan Bisnis Properti & Hospitality',
        p: 'Hotel, Homestay, Kost, Rental, dan Penjualan Properti — Semua dalam Satu Platform SaaS', 
        btn_register: 'Daftarkan Bisnis Anda', 
        btn_find: 'Temukan Properti' 
      },
      problem: {
        title: 'Masalah Klasik Pengusaha Properti',
        list: [
          { q: 'Pembukuan Berantakan?', a: 'Catatan manual seringkali hilang atau salah hitung, membuat laporan laba rugi tidak akurat.' },
          { q: 'Double Booking?', a: 'Sinkronisasi antar channel (OTA) yang lambat berisiko mengecewakan tamu Anda.' },
          { q: 'Kontrol Staf Lemah?', a: 'Tanpa sistem, sulit memantau performa resepsionis dan kebersihan unit secara real-time.' }
        ],
        solution: 'Seulanga hadir sebagai solusi digital end-to-end yang menghilangkan segala hambatan operasional tersebut.'
      },
      how: {
        title: 'Bagaimana Seulanga Bekerja?',
        steps: [
          { n: '01', title: 'Daftarkan Bisnis', desc: 'Input identitas legal dan kategori properti Anda ke dalam jaringan Seulanga.' },
          { n: '02', title: 'Konfigurasi Node', desc: 'Atur unit, harga dinamis, dan beri hak akses untuk tim operasional Anda.' },
          { n: '03', title: 'Terima Keuntungan', desc: 'Terima booking otomatis 24/7 dan pantau arus kas masuk secara transparan.' }
        ]
      },
      features: {
        title: 'Fitur Unggulan Ekosistem',
        list: [
          { title: 'Auto-Reservation', desc: 'Sinkronisasi kalender booking otomatis dari berbagai channel secara real-time.', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Treasury Dashboard', desc: 'Pantau laba bersih, pengeluaran operasional, dan saldo payout secara akurat.', icon: 'fa-chart-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Identity Verification', desc: 'Verifikasi identitas tamu (KYC) untuk menjamin keamanan di setiap node properti.', icon: 'fa-user-shield', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Smart Invoicing', desc: 'Kirim nota digital profesional otomatis via WhatsApp atau Email tanpa ribet.', icon: 'fa-file-invoice-dollar', color: 'text-amber-600', bg: 'bg-amber-50' }
        ]
      }
    },
    en: {
      nav: { 
        home: 'Home', 
        features: 'Features', 
        types: 'Business Types', 
        pricing: 'Pricing', 
        how: 'How It Works', 
        contact: 'Contact',
        login: 'Login', 
        register: 'Business Sign Up' 
      },
      hero: { 
        badge: '#1 Integrated Property Platform in Sumatra', 
        h1: 'One Platform to Manage, Book, and Grow Property & Hospitality Businesses', 
        p: 'Hotels, Homestays, Kost, Rentals, and Property Sales — All in One SaaS Platform', 
        btn_register: 'Register Your Business', 
        btn_find: 'Find a Place' 
      },
      problem: {
        title: 'Classic Property Management Pain',
        list: [
          { q: 'Messy Bookkeeping?', a: 'Manual records are often lost or incorrect, leading to inaccurate financial reports.' },
          { q: 'Double Booking?', a: 'Slow sync between OTAs risks disappointing your guests and losing revenue.' },
          { q: 'Weak Staff Control?', a: 'Without a system, it is hard to monitor receptionist and cleaning performance in real-time.' }
        ],
        solution: 'Seulanga is the end-to-end digital solution that eliminates these operational bottlenecks.'
      },
      how: {
        title: 'How Seulanga Works?',
        steps: [
          { n: '01', title: 'Register Business', desc: 'Input your legal identity and property category into the Seulanga network.' },
          { n: '02', title: 'Configure Node', desc: 'Set units, dynamic pricing, and assign access rights to your ops team.' },
          { n: '03', title: 'Gain Profit', desc: 'Receive automated 24/7 bookings and monitor cash flow transparently.' }
        ]
      },
      features: {
        title: 'Core Ecosystem Features',
        list: [
          { title: 'Auto-Reservation', desc: 'Real-time calendar synchronization across multiple booking channels.', icon: 'fa-calendar-check', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Treasury Dashboard', desc: 'Monitor net profit, operational costs, and payout balances accurately.', icon: 'fa-chart-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Identity Verification', desc: 'Verify guest identities (KYC) to ensure security at every property node.', icon: 'fa-user-shield', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Smart Invoicing', desc: 'Automatically send professional digital receipts via WhatsApp or Email.', icon: 'fa-file-invoice-dollar', color: 'text-amber-600', bg: 'bg-amber-50' }
        ]
      }
    }
  };

  const d = useMemo(() => translations[language], [language]);

  const navMenuItems = [
    { label: d.nav.home, id: 'home' },
    { label: d.nav.features, id: 'features' },
    { label: d.nav.types, id: 'business-types' },
    { label: d.nav.pricing, id: 'pricing' },
    { label: d.nav.how, id: 'how-it-works' },
    { label: d.nav.contact, id: 'contact' },
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-700 font-['Plus_Jakarta_Sans']">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('home')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 transition-transform group-hover:rotate-0">
                <i className="fas fa-layer-group"></i>
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">SEULANGA<span className="text-indigo-600">.</span></span>
            </div>
            
            <div className="hidden xl:flex items-center gap-6">
              {navMenuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => scrollTo(item.id)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl mr-2">
               <button onClick={() => onLanguageChange('id')} className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all ${language === 'id' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>ID</button>
               <button onClick={() => onLanguageChange('en')} className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>EN</button>
            </div>
            
            <button onClick={() => onNavigate('login')} className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 px-4">{d.nav.login}</button>
            <button onClick={() => onNavigate('register')} className="bg-slate-950 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">{d.nav.register}</button>
            
            <button className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'}`}></i>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {navMenuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-100 flex gap-4">
              <button onClick={() => onNavigate('login')} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{d.nav.login}</button>
              <button onClick={() => onNavigate('register')} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{d.nav.register}</button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative pt-44 pb-32 overflow-hidden bg-[#fbfcfd]">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 animate-fade-up">
              <div className="inline-flex items-center gap-3 bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{d.hero.badge}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter uppercase">
                {d.hero.h1}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                {d.hero.p}
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => onNavigate('register')} className="px-12 py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-1">
                  {d.hero.btn_register}
                </button>
                <button onClick={() => onNavigate('explore')} className="px-12 py-6 bg-white border border-slate-200 text-slate-900 rounded-[32px] font-black text-xs uppercase tracking-widest hover:border-indigo-600 transition-all flex items-center justify-center gap-4 group">
                  <i className="fas fa-compass text-indigo-600 group-hover:rotate-45 transition-transform"></i> 
                  {d.hero.btn_find}
                </button>
              </div>
            </div>

            <div className="relative">
               {/* Dashboard Preview Visual */}
               <div className="relative z-20 rounded-[64px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white animate-float">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200" className="w-full h-[550px] object-cover" alt="Dashboard Preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
               </div>
               
               {/* Property Showcase Visual (Floating Card) */}
               <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[40px] shadow-2xl space-y-4 z-30 border border-slate-50 animate-bounce-slow max-w-[280px]">
                  <div className="relative h-32 rounded-3xl overflow-hidden mb-4">
                     <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" className="w-full h-full object-cover" alt="Featured Property" />
                     <div className="absolute top-3 left-3">
                        <span className="bg-white/90 px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                     </div>
                  </div>
                  <div className="px-2">
                     <h4 className="text-sm font-black text-slate-900 uppercase">Grand Seulanga Hotel</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-widest">
                        <i className="fas fa-location-dot text-indigo-500"></i> Banda Aceh
                     </p>
                  </div>
               </div>

               {/* Activity Node Visual */}
               <div className="absolute -top-10 -right-5 bg-slate-950 p-6 rounded-[40px] shadow-2xl space-y-3 z-30 border border-white/10">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-check"></i></div>
                     <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Real-time Occupancy</span>
                  </div>
                  <p className="text-3xl font-black text-white">92% <span className="text-xs text-emerald-500 font-bold tracking-normal">+5%</span></p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM & SOLUTION */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Problem Solving</h2>
                    <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.problem.title}</h3>
                 </div>
                 <div className="space-y-6">
                    {d.problem.list.map((item, i) => (
                      <div key={i} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:border-indigo-200 transition-all">
                        <h4 className="text-lg font-black text-slate-900 uppercase mb-2 italic">{item.q}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="relative">
                 <div className="bg-slate-950 p-12 rounded-[64px] text-white space-y-8 relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                    <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center text-indigo-400 text-4xl shadow-inner border border-white/5">
                       <i className="fas fa-lightbulb"></i>
                    </div>
                    <h4 className="text-3xl font-black tracking-tight uppercase italic leading-tight">Solusi Digital <br/> Sumatra Pride.</h4>
                    <p className="text-indigo-100/60 text-lg font-medium leading-relaxed">
                       {d.problem.solution}
                    </p>
                    <button onClick={() => scrollTo('how-it-works')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all">Pelajari Cara Kerjanya →</button>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. FEATURES OVERVIEW (BENTO GRID) */}
      <section id="features" className="py-32 bg-[#fcfdfe]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
              <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Ecosystem Modules</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.features.title}</h3>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {d.features.list.map((f, i) => (
                <div key={i} className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between min-h-[380px]">
                   <div>
                      <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center text-3xl mb-10 group-hover:scale-110 transition-transform shadow-inner`}>
                         <i className={`fas ${f.icon}`}></i>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">{f.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                   </div>
                   <div className="pt-10 border-t border-slate-50 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Authorized Module</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. BUSINESS TYPES */}
      <section id="business-types" className="py-32 bg-slate-950 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
               <div className="max-w-2xl space-y-6">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">Beradaptasi Untuk <br/> Segala Topology.</h2>
                  <p className="text-xl text-slate-400 font-medium">Platform fleksibel yang dirancang khusus untuk berbagai kebutuhan aset penginapan.</p>
               </div>
               <button onClick={() => onNavigate('register')} className="px-10 py-5 bg-white text-slate-900 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl whitespace-nowrap">Daftarkan Bisnis Anda</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { name: "Hotel & Resort", desc: "Manajemen kamar kompleks, layanan tamu, dan integrasi channel manager.", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
                 { name: "Kost & Dormitory", desc: "Sistem sewa bulanan, tagihan air/listrik otomatis, dan database penghuni.", img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800" },
                 { name: "Homestay & Villa", desc: "Check-in mandiri praktis, manajemen kunci, dan kalender harian akurat.", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800" },
                 { name: "Rental Kantor", desc: "Kontrak jangka panjang, pemeliharaan aset, dan penagihan berkala otomatis.", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800" },
               ].map((v, i) => (
                 <div key={i} className="group relative h-[480px] rounded-[56px] overflow-hidden cursor-pointer">
                    <img src={v.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" alt={v.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <div className="absolute bottom-12 left-10 right-10 space-y-4">
                       <h4 className="text-3xl font-black uppercase tracking-tighter italic">{v.name}</h4>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">{v.desc}</p>
                       <div className="pt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-xl"><i className="fas fa-arrow-right"></i></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all">Lihat Detail Solusi</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto space-y-6 mb-24">
              <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Seamless Integration</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.how.title}</h3>
           </div>

           <div className="grid md:grid-cols-3 gap-16 relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-0"></div>
              {d.how.steps.map((step, i) => (
                <div key={i} className="relative z-10 space-y-8 text-center px-8">
                   <div className="w-24 h-24 bg-white border border-slate-100 rounded-[32px] flex items-center justify-center text-4xl font-black text-indigo-600 mx-auto shadow-2xl group hover:bg-indigo-600 hover:text-white transition-all duration-500">
                      {step.n}
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 7. PRICING & MONETIZATION */}
      <section id="pricing" className="py-32 bg-[#f8fafc]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto space-y-6 mb-24">
               <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Rencana Pricing</h3>
               <p className="text-slate-400 font-medium text-lg">Pilih paket sesuai skala bisnis Anda. Tanpa biaya tersembunyi.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
               {[
                 { name: "Starter Node", price: "Gratis", feat: ["Hingga 5 Unit Aset", "Laporan Harian Standar", "Marketplace Dasar", "1 Akun Operator"], btn: "Gunakan Gratis", color: "bg-white text-slate-900" },
                 { name: "Pro Cluster", price: "499K", feat: ["Hingga 50 Unit Aset", "Laba Rugi Real-time", "Marketplace Prioritas", "5 Akun Staf", "WhatsApp Billing"], btn: "Coba Pro Gratis", color: "bg-indigo-600 text-white scale-105 shadow-3xl shadow-indigo-100", popular: true },
                 { name: "Enterprise Alpha", price: "1.2M", feat: ["Unit Tanpa Batas", "Audit Keuangan Mendalam", "API Integrasi Penuh", "Staf Tanpa Batas", "Custom Domain"], btn: "Hubungi Sales", color: "bg-slate-900 text-white" },
               ].map((p, i) => (
                 <div key={i} className={`p-12 rounded-[56px] flex flex-col justify-between relative transition-all duration-500 hover:-translate-y-2 ${p.color} ${p.popular ? 'z-10' : 'z-0 border border-slate-100'}`}>
                    {p.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Paling Banyak Dipilih</span>}
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-60">{p.name}</p>
                       <div className="flex items-baseline gap-2 mb-12">
                         {p.price !== 'Gratis' && <span className="text-xs font-bold uppercase opacity-60">Rp</span>}
                         <span className="text-6xl font-black tracking-tighter">{p.price}</span>
                         {p.price !== 'Gratis' && <span className="text-[10px] font-bold uppercase opacity-60">/ bulan</span>}
                       </div>
                       <div className="space-y-6 mb-16">
                          {p.feat.map(f => (
                            <div key={f} className="flex items-center gap-4">
                              <i className={`fas fa-check-circle text-sm ${p.popular ? 'text-indigo-200' : 'text-indigo-500'}`}></i>
                              <span className="text-xs font-black uppercase tracking-widest">{f}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <button onClick={() => onNavigate('register')} className={`w-full py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all ${p.popular ? 'bg-white text-indigo-600 hover:bg-slate-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl'}`}>{p.btn}</button>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. TRUST & CREDIBILITY (FAQ) */}
      <section className="py-32 bg-white">
         <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-24 space-y-6">
               <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Pertanyaan Umum</h3>
               <p className="text-slate-400 font-medium">Transparansi adalah prioritas kami.</p>
            </div>
            <div className="space-y-4">
               {[
                 { q: "Apakah data properti saya aman?", a: "Sangat aman. Kami menggunakan enkripsi SSL tingkat tinggi dan cadangan data otomatis setiap hari di server cloud terjamin." },
                 { q: "Bisakah saya membatalkan langganan kapan saja?", a: "Tentu. Tidak ada kontrak mengikat. Anda dapat menghentikan atau mengubah paket kapanpun melalui dashboard owner." },
                 { q: "Apakah Seulanga mendukung pembayaran e-wallet?", a: "Ya, sistem kami terintegrasi dengan QRIS, transfer bank, serta dompet digital populer di Indonesia." },
                 { q: "Bagaimana jika saya memiliki lebih dari satu properti?", a: "Seulanga mendukung fitur multi-property. Anda bisa memantau seluruh aset dari satu akun pusat dengan mudah." }
               ].map((item, i) => (
                 <div key={i} className="bg-slate-50 border border-slate-100 rounded-[32px] overflow-hidden group hover:border-indigo-200 transition-all">
                    <button 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className="w-full p-8 text-left flex justify-between items-center"
                    >
                       <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{item.q}</span>
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeFaq === i ? 'bg-indigo-600 text-white rotate-180' : 'bg-white text-slate-300 shadow-sm'}`}>
                          <i className="fas fa-chevron-down text-[10px]"></i>
                       </div>
                    </button>
                    {activeFaq === i && (
                      <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                         <p className="text-slate-600 font-medium leading-relaxed bg-white p-8 rounded-3xl border border-slate-100">
                            {item.a}
                         </p>
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. CALL TO ACTION */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto bg-slate-950 rounded-[72px] p-16 md:p-24 text-white relative overflow-hidden shadow-3xl text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
            
            <div className="relative z-10 space-y-12 max-w-4xl">
               <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-[40px] flex items-center justify-center text-indigo-400 text-4xl mx-auto shadow-inner mb-10">
                  <i className="fas fa-rocket"></i>
               </div>
               <h3 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Ready to scale your <br/> <span className="text-indigo-500">Business Node?</span></h3>
               <p className="text-indigo-100/40 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                  Bergabunglah dengan ratusan pengusaha properti modern di Sumatra yang telah mendigitalkan operasional mereka.
               </p>
               <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                  <button onClick={() => onNavigate('register')} className="px-12 py-6 bg-white text-slate-950 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-400 hover:text-white transition-all transform hover:scale-105 active:scale-95">Mulai Sekarang — Gratis</button>
                  <button onClick={() => scrollTo('contact')} className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">Hubungi Tim Konsultan</button>
               </div>
            </div>
         </div>
      </section>

      {/* 10. FOOTER SECTION */}
      <footer id="contact" className="pt-32 pb-16 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-16 mb-32">
               <div className="col-span-2 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white text-xl shadow-2xl"><i className="fas fa-layer-group"></i></div>
                     <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">SEULANGA<span className="text-indigo-600">.</span></span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">Platform manajemen properti terpadu untuk pengusaha hospitality modern di Sumatra. Memberdayakan bisnis lokal dengan teknologi standar global.</p>
                  <div className="flex gap-6">
                     {['facebook-f', 'instagram', 'twitter', 'linkedin-in'].map(s => (
                        <div key={s} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white cursor-pointer transition-all shadow-sm border border-slate-100">
                           <i className={`fab fa-${s} text-sm`}></i>
                        </div>
                     ))}
                  </div>
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 italic">Produk</h5>
                  <ul className="space-y-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Sistem Hotel</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Manajemen Kost</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Dashboard Tamu</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Marketplace Hub</li>
                  </ul>
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 italic">Perusahaan</h5>
                  <ul className="space-y-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Tentang Kami</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Karir</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Berita Platform</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Kontak Kami</li>
                  </ul>
               </div>
               <div>
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10 italic">Legal</h5>
                  <ul className="space-y-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privasi Data</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Syarat Layanan</li>
                     <li className="hover:text-indigo-600 cursor-pointer transition-colors">Kebijakan Refund</li>
                  </ul>
               </div>
            </div>
            <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2024 SEULANGA TECHNOLOGY CORE</span>
               <div className="flex items-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  <span>Crafted in Sumatra</span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  <span>V2.4.0 STABLE</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
