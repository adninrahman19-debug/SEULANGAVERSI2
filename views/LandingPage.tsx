
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
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const d = useMemo(() => ({
    id: {
      nav: { home: 'Beranda', features: 'Fitur', pricing: 'Harga', how: 'Cara Kerja', contact: 'Kontak', login: 'Masuk', register: 'Daftar Bisnis' },
      hero: { badge: 'Sistem Operasi Hospitality Masa Depan', h1_1: 'REDEFINISI', h1_italic: 'SISTEMIK', h1_2: 'PROPERTI.', p: 'Ekosistem multi-tenant absolut yang dirancang untuk mengorkestrasi hotel, homestay, dan penyewaan properti elit dengan presisi tingkat militer.', btn_trial: 'Mulai Uji Coba 14 Hari', btn_explore: 'Eksplorasi Pasar' },
      problem: { title: 'Kekacauan Operasional', title_span: 'Berhenti di Sini.', sub: '"Manajemen properti seharusnya tidak terasa seperti memadamkan api."', q1: 'Data Terfragmentasi?', a1: 'Sentralisasikan hotel, unit, dan log staf Anda dalam satu node yang tidak dapat diubah.', q2: 'Sengketa Pembayaran?', a2: 'Invoicing digital otomatis dengan verifikasi kriptografi untuk setiap transaksi.', q3: 'Pemasaran Tak Terlihat?', a3: 'Mesin pasar tertanam meningkatkan visibilitas Anda ke ribuan tamu terverifikasi.' },
      pricing: { title: 'Node Langganan', h3: 'Skala dengan Ambisi Anda.', p: 'Pilih paket yang sesuai dengan skala operasional Anda saat ini. Tanpa biaya payload tersembunyi.' },
      contact_hub: { 
        title: 'Hub Kontak & Kantor Pusat', 
        sub: 'Hubungi tim ahli kami untuk konsultasi integrasi aset dan bantuan teknis 24/7.',
        office: 'Alamat Kantor Pusat',
        office_detail: 'Gedung Seulanga Tech, Lantai 4, Jl. Teuku Umar No. 122, Banda Aceh, Aceh - 23122',
        call_center: 'Pusat Panggilan (24 Jam)',
        email: 'Surel Dukungan Resmi',
        hours: 'Jam Operasional Kantor',
        hours_detail: 'Senin - Jumat: 08:00 - 18:00 WIB',
        btn_wa: 'Chat WhatsApp Sekarang',
        map_title: 'Lokasi Strategis Kami'
      }
    },
    en: {
      nav: { home: 'Home', features: 'Features', pricing: 'Pricing', how: 'How It Works', contact: 'Contact', login: 'Login', register: 'Register Business' },
      hero: { badge: 'Next-Gen Hospitality OS', h1_1: 'REDEFINING', h1_italic: 'SYSTEMIC', h1_2: 'PROPERTY.', p: 'The absolute multi-tenant ecosystem designed to orchestrate hotels, homestays, and elite property rentals with military-grade precision.', btn_trial: 'Start 14-Day Free Trial', btn_explore: 'Explore Marketplace' },
      problem: { title: 'Operational Chaos', title_span: 'Stops Here.', sub: '"Property management shouldn\'t feel like fire-fighting."', q1: 'Fragmented Data?', a1: 'Centralize your hotels, units, and staff logs in a single immutable node.', q2: 'Payment Disputes?', a2: 'Automated digital invoicing with cryptographic verification for every transaction.', q3: 'Invisible Marketing?', a3: 'Embedded marketplace engine boosts your visibility to thousands of verified guests.' },
      pricing: { title: 'Subscription Nodes', h3: 'Scale with Your Ambition.', p: 'Choose a plan that fits your current operational scale. No hidden payload fees.' },
      contact_hub: { 
        title: 'Contact Hub & Headquarters', 
        sub: 'Reach out to our experts for asset integration consultation and 24/7 technical support.',
        office: 'Headquarters Address',
        office_detail: 'Seulanga Tech Building, 4th Floor, Jl. Teuku Umar No. 122, Banda Aceh, Aceh - 23122',
        call_center: 'Call Center (24 Hours)',
        email: 'Official Support Email',
        hours: 'Office Operating Hours',
        hours_detail: 'Monday - Friday: 08:00 - 18:00 WIB',
        btn_wa: 'Chat WhatsApp Now',
        map_title: 'Our Strategic Location'
      }
    }
  }[language]), [language]);

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-700 font-['Plus_Jakarta_Sans']">
      {/* 1. Production-Grade Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('landing')}>
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3 transition-transform group-hover:rotate-0">
                <i className="fas fa-layer-group text-lg"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">SEULANGA<span className="text-indigo-600">.</span></span>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              {['Home', 'Features', 'Pricing', 'How It Works', 'Contact'].map((link) => (
                <button 
                  key={link} 
                  onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                  className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  {link === 'Home' ? d.nav.home : link === 'Features' ? d.nav.features : link === 'Pricing' ? d.nav.pricing : link === 'How It Works' ? d.nav.how : d.nav.contact}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-sm"
              >
                <img src={language === 'id' ? "https://flagcdn.com/w40/id.png" : "https://flagcdn.com/w40/us.png"} className="w-5 h-3.5 object-cover rounded shadow-sm" alt="flag" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{language}</span>
                <i className={`fas fa-chevron-down text-[8px] transition-transform ${showLangDropdown ? 'rotate-180' : ''}`}></i>
              </button>
              {showLangDropdown && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in zoom-in-95 fade-in duration-200 z-[110]">
                  <button onClick={() => { onLanguageChange('id'); setShowLangDropdown(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${language === 'id' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <img src="https://flagcdn.com/w40/id.png" className="w-5 h-3.5 object-cover rounded shadow-sm" alt="id" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bahasa</span>
                  </button>
                  <button onClick={() => { onLanguageChange('en'); setShowLangDropdown(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${language === 'en' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <img src="https://flagcdn.com/w40/us.png" className="w-5 h-3.5 object-cover rounded shadow-sm" alt="en" />
                    <span className="text-[10px] font-black uppercase tracking-widest">English</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('login')} className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors px-6 py-3">{d.nav.login}</button>
            <button onClick={() => onNavigate('register')} className="bg-slate-950 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95">{d.nav.register}</button>
            <button className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-8 shadow-2xl animate-in slide-in-from-top-4 z-50">
            <div className="flex flex-col gap-6">
              {['Home', 'Features', 'Pricing', 'How It Works', 'Marketplace', 'Contact'].map((link) => (
                <button 
                  key={link} 
                  onClick={() => link === 'Marketplace' ? onNavigate('explore') : scrollTo(link.toLowerCase().replace(/ /g, '-'))} 
                  className="text-left font-black uppercase text-sm tracking-widest text-slate-900"
                >
                  {link === 'Home' ? d.nav.home : link === 'Features' ? d.nav.features : link === 'Pricing' ? d.nav.pricing : link === 'How It Works' ? d.nav.how : link === 'Marketplace' ? 'Marketplace' : d.nav.contact}
                </button>
              ))}
              <hr className="border-slate-100" />
              <button onClick={() => onNavigate('login')} className="text-left font-black uppercase text-sm tracking-widest text-indigo-600">{d.nav.login} to Dashboard</button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[100px] -ml-48 -mb-48 opacity-60"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-full text-indigo-600">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{d.hero.badge}</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                {d.hero.h1_1} <br/> <span className="text-indigo-600 italic">{d.hero.h1_italic}</span> <br/> {d.hero.h1_2}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                {d.hero.p}
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => onNavigate('register')} className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all">{d.hero.btn_trial}</button>
                <button onClick={() => onNavigate('explore')} className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-indigo-600 transition-all flex items-center justify-center gap-3">
                  <i className="fas fa-compass"></i> {d.hero.btn_explore}
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=saas${i}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="user" />)}
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trusted by 500+ Property Owners</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] rounded-full scale-150"></div>
              <div className="relative bg-white p-4 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                  className="rounded-[36px] w-full h-auto shadow-inner" 
                  alt="Dashboard Preview"
                />
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-50 space-y-3 animate-float hidden md:block">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-check"></i></div>
                      <span className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">Verified Payout</span>
                   </div>
                   <p className="text-2xl font-black text-slate-900">Rp 452.1M</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem & Solution Section */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
             <div className="space-y-12">
                <div>
                   <h2 className="text-4xl font-black tracking-tighter uppercase mb-6">{d.problem.title} <br/><span className="text-indigo-500">{d.problem.title_span}</span></h2>
                   <p className="text-slate-400 text-lg font-medium leading-relaxed italic">{d.problem.sub}</p>
                </div>
                <div className="space-y-8">
                   {[
                     { q: d.problem.q1, a: d.problem.a1, icon: "fa-database" },
                     { q: d.problem.q2, a: d.problem.a2, icon: "fa-receipt" },
                     { q: d.problem.q3, a: d.problem.a3, icon: "fa-bullseye" },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 group">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                           <i className={`fas ${item.icon} text-xl`}></i>
                        </div>
                        <div>
                           <h4 className="text-lg font-black uppercase tracking-tight text-white mb-1">{item.q}</h4>
                           <p className="text-slate-500 text-sm font-medium">{item.a}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 relative">
                <div className="space-y-6 pt-12">
                   <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur text-center space-y-4">
                      <i className="fas fa-microchip text-3xl text-indigo-500"></i>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Smart Core</p>
                   </div>
                   <div className="p-8 bg-indigo-600 rounded-[40px] text-center space-y-4 shadow-2xl shadow-indigo-500/20">
                      <i className="fas fa-shield-halved text-3xl text-white"></i>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Security Node</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur text-center space-y-4">
                      <i className="fas fa-chart-line text-3xl text-emerald-500"></i>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Growth Engine</p>
                   </div>
                   <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur text-center space-y-4">
                      <i className="fas fa-users-gear text-3xl text-violet-500"></i>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Multi-Tenant</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Overview */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Core Infrastructure</h2>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Comprehensive Feature Stack.</h3>
            <p className="text-lg text-slate-500 font-medium">Enterprise-grade capabilities distilled into a clean, modern interface.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Booking Logic", desc: "Advanced reservation engine with calendar conflict resolution.", icon: "fa-calendar-check" },
              { title: "Treasury Hub", desc: "Automated payouts, tax tracking, and verifiable invoices.", icon: "fa-vault" },
              { title: "Role Management", desc: "Granular access for Owners, Staff, and Central Admins.", icon: "fa-users-cog" },
              { title: "Asset Matrix", desc: "Inventory management for rooms, units, or whole complexes.", icon: "fa-sitemap" },
              { title: "Reputation Hub", desc: "Verified review system with deep sentiment analytics.", icon: "fa-star-half-stroke" },
              { title: "Growth Analytics", desc: "Visualize revenue trajectory and occupancy velocities.", icon: "fa-chart-pie" },
              { title: "Unified Comms", desc: "Direct messaging channels between property and guest.", icon: "fa-comment-dots" },
              { title: "Flex Pricing", desc: "Dynamic rules for seasonal, weekend, or bulk adjustments.", icon: "fa-tags" },
            ].map((f, i) => (
              <div key={i} className="p-10 bg-white border border-slate-100 rounded-[48px] hover:shadow-2xl hover:border-indigo-100 transition-all group duration-500">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-xl mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">{f.title}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Business Verticals Section */}
      <section id="business-types" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-20">
              <div className="max-w-2xl space-y-6">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Ecosystem Topology.</h2>
                 <p className="text-lg text-slate-500 font-medium">SEULANGA is architected to scale across various hospitality and property niches.</p>
              </div>
              <button onClick={() => onNavigate('explore')} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Explore Marketplace →</button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Hotels", icon: "fa-building", count: 120, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
                { name: "Homestays", icon: "fa-house-chimney", count: 450, img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400" },
                { name: "Kost & Dorms", icon: "fa-bed", count: 890, img: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400" },
                { name: "Rentals", icon: "fa-key", count: 320, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
                { name: "Property Sales", icon: "fa-city", count: 150, img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
                { name: "Guesthouses", icon: "fa-hotel", count: 210, img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
                { name: "Housing complexes", icon: "fa-house-flag", count: 85, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400" },
                { name: "Resorts", icon: "fa-umbrella-beach", count: 45, img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400" },
              ].map((cat, i) => (
                <div key={i} className="group relative h-80 rounded-[40px] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700">
                   <img src={cat.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                   <div className="absolute bottom-8 left-8 right-8 space-y-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
                         <i className={`fas ${cat.icon}`}></i>
                      </div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">{cat.name}</h4>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{cat.count} Active Nodes</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-24">
              <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">The Workflow</h2>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">From Enrollment to Payout.</h3>
           </div>

           <div className="grid md:grid-cols-3 gap-16 relative">
              <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-px border-t-2 border-dashed border-slate-100 -z-0"></div>
              {[
                { step: "01", title: "Identity Enrollment", desc: "Register your business entity and verify your governing credentials.", icon: "fa-user-shield" },
                { step: "02", title: "Asset Mapping", desc: "Configure your units, pricing protocols, and operational staff nodes.", icon: "fa-cubes" },
                { step: "03", title: "Marketplace Live", desc: "Receive automated reservations and verified treasury settlements.", icon: "fa-rocket" },
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center space-y-8 animate-fade-up">
                   <div className="w-24 h-24 bg-white border-4 border-slate-50 rounded-[40px] flex items-center justify-center text-3xl text-indigo-600 shadow-xl shadow-indigo-100/50 z-10">
                      <i className={`fas ${step.icon}`}></i>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Protocol {step.step}</p>
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 7. Pricing & Monetization Section */}
      <section id="pricing" className="py-32 bg-slate-950 overflow-hidden relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
               <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{d.pricing.title}</h2>
               <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{d.pricing.h3}</h3>
               <p className="text-lg text-slate-400 font-medium leading-relaxed">{d.pricing.p}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
               {[
                 { 
                   name: "Basic Access", 
                   price: "0", 
                   commission: "15%", 
                   units: "Up to 10 Units", 
                   features: ["Community Support", "Standard Listing", "Basic Analytics"],
                   color: "border-slate-800 bg-white/5",
                   btn: "bg-white/10 text-white hover:bg-white/20"
                 },
                 { 
                   name: "Growth Pro", 
                   price: "499K", 
                   commission: "10%", 
                   units: "Up to 50 Units", 
                   popular: true,
                   features: ["Priority Search Indexing", "Staff Accounts (Max 10)", "Advanced Evaluation Matrix", "SMS & Email Alerts"],
                   color: "border-indigo-600 bg-indigo-600/10 scale-110 z-20",
                   btn: "bg-indigo-600 text-white shadow-2xl shadow-indigo-900/50 hover:bg-indigo-500"
                 },
                 { 
                   name: "Elite Premium", 
                   price: "1.2M", 
                   commission: "5%", 
                   units: "Unlimited Assets", 
                   features: ["24/7 Dedicated Concierge", "AI Business Intelligence", "Cryptographic Custom Reports", "Marketplace Ad Credits"],
                   color: "border-slate-800 bg-white/5",
                   btn: "bg-white/10 text-white hover:bg-white/20"
                 },
               ].map((p, i) => (
                 <div key={i} className={`p-12 rounded-[56px] border flex flex-col justify-between transition-all duration-500 ${p.color} relative overflow-hidden group`}>
                   {p.popular && (
                     <div className="absolute top-8 right-[-35px] bg-indigo-600 text-white py-1.5 px-12 rotate-45 text-[8px] font-black uppercase tracking-widest shadow-xl">Best Value</div>
                   )}
                   <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">{p.name}</p>
                     <div className="flex items-baseline gap-2 mb-10">
                       <span className="text-xs font-black text-slate-500 uppercase opacity-40">Rp</span>
                       <span className="text-6xl font-black text-white tracking-tighter">{p.price}</span>
                       <span className="text-xs font-bold text-slate-500 uppercase">/mo</span>
                     </div>
                     <div className="space-y-6 mb-12">
                        <div className="flex items-center gap-4">
                           <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px]"><i className="fas fa-check"></i></div>
                           <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{p.commission} Commission Node</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px]"><i className="fas fa-check"></i></div>
                           <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{p.units}</span>
                        </div>
                        {p.features.map(f => (
                           <div key={f} className="flex items-center gap-4 opacity-60">
                              <div className="w-6 h-6 rounded-lg bg-white/5 text-slate-500 flex items-center justify-center text-[10px]"><i className="fas fa-plus"></i></div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{f}</span>
                           </div>
                        ))}
                     </div>
                   </div>
                   <button onClick={() => onNavigate('register')} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${p.btn}`}>Authorize Protocol</button>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- NEW: CONTACT HUB SECTION --- */}
      <section id="contact" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-24">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">{d.nav.contact} Node</h2>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">{d.contact_hub.title}</h3>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">{d.contact_hub.sub}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 group hover:border-indigo-200 transition-all">
                       <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <i className="fas fa-map-location-dot"></i>
                       </div>
                       <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">{d.contact_hub.office}</h5>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">{d.contact_hub.office_detail}</p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 group hover:border-emerald-200 transition-all">
                       <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <i className="fas fa-phone-volume"></i>
                       </div>
                       <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">{d.contact_hub.call_center}</h5>
                       <p className="text-lg font-black text-slate-900 tracking-tighter">+62 (231) 555-0199</p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 group hover:border-indigo-200 transition-all">
                       <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <i className="fas fa-envelope-open-text"></i>
                       </div>
                       <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">{d.contact_hub.email}</h5>
                       <p className="text-xs text-indigo-600 font-black tracking-widest uppercase">support@seulanga.com</p>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4 group hover:border-amber-200 transition-all">
                       <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <i className="fas fa-clock"></i>
                       </div>
                       <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">{d.contact_hub.hours}</h5>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">{d.contact_hub.hours_detail}</p>
                    </div>
                 </div>

                 <button onClick={() => window.open('https://wa.me/6281234567890')} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 active:scale-95">
                    <i className="fab fa-whatsapp text-2xl"></i>
                    {d.contact_hub.btn_wa}
                 </button>
              </div>

              <div className="relative group">
                 <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full -z-10 group-hover:bg-indigo-600/10 transition-all"></div>
                 <div className="bg-white p-4 rounded-[56px] border border-slate-100 shadow-2xl h-full min-h-[500px] overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                       <h4 className="font-black text-slate-900 uppercase tracking-tighter text-sm">{d.contact_hub.map_title}</h4>
                       <i className="fas fa-earth-asia text-indigo-400"></i>
                    </div>
                    {/* Google Maps Iframe showing Banda Aceh area for context */}
                    <iframe 
                      title="Seulanga HQ Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15883.670390230232!2d95.311749!3d5.558253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304037146598c19b%3A0xc3b839b8979e2764!2sBanda%20Aceh%2C%20Aceh!5e0!3m2!1sen!2sid!4v1703914442145!5m2!1sen!2sid" 
                      className="w-full h-full border-none opacity-90 group-hover:opacity-100 transition-opacity grayscale-[0.2] group-hover:grayscale-0"
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 8. Trust & Credibility Section */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Secured and Verified <br/> <span className="text-indigo-600 italic">By Seulanga Governance.</span></h3>
                 <div className="grid grid-cols-2 gap-10">
                    {[
                      { title: "99.9% Uptime", desc: "Military-grade cloud server distribution.", icon: "fa-cloud-arrow-up" },
                      { title: "AES-256", desc: "Bank-level encryption for all user logs.", icon: "fa-lock-open" },
                      { title: "24/7 Monitoring", desc: "Automated threat detection logic.", icon: "fa-eye" },
                      { title: "Audit Trail", desc: "Immutable transaction history nodes.", icon: "fa-fingerprint" },
                    ].map((s, i) => (
                      <div key={i} className="space-y-3">
                         <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                            <i className={`fas ${s.icon}`}></i>
                         </div>
                         <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">{s.title}</h5>
                         <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-12 rounded-[64px] border border-slate-100 relative shadow-xl">
                 <i className="fas fa-quote-left absolute top-12 left-12 text-slate-50 text-8xl -z-0"></i>
                 <div className="relative z-10 space-y-10">
                    <p className="text-2xl text-slate-800 font-bold italic leading-relaxed">
                       "SEULANGA has unified our homestay operations across 12 locations. The automated payout protocol and staff check-in features are absolute game-changers for our growth."
                    </p>
                    <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
                       <img src="https://i.pravatar.cc/150?u=saas_owner" className="w-16 h-16 rounded-[24px] object-cover shadow-lg border-4 border-white" alt="avatar" />
                       <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight">John Proprietor</p>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Founder, Grand Vista Resort Node</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 9. Final CTA Section */}
      <section className="py-20 px-6">
         <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[64px] p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
            <div className="absolute inset-0 bg-slate-950 opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
            <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-black/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-12">
               <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">Ready to Orchestrate <br/> Your Assets?</h3>
               <p className="text-xl text-indigo-100/80 font-medium leading-relaxed">Join the elite network of property owners transforming their operations today. No credit card required for enrollment.</p>
               <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button onClick={() => onNavigate('register')} className="px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:scale-[1.05] transition-all">Register Your Business Now</button>
                  <button onClick={() => onNavigate('explore')} className="px-12 py-6 bg-indigo-500/20 text-white border border-white/30 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">Explore Marketplace</button>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Secured by SEULANGA Enterprise Intelligence</p>
            </div>
         </div>
      </section>

      {/* 10. Master Footer Section */}
      <footer className="pt-32 pb-20 bg-white border-t border-slate-50 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 mb-32">
               <div className="col-span-2 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><i className="fas fa-layer-group"></i></div>
                     <span className="font-black text-2xl tracking-tighter text-slate-900">SEULANGA<span className="text-indigo-600">.</span></span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs uppercase tracking-widest opacity-80">Integrated Property & Hospitality Ecosystem Architecture.</p>
                  <div className="flex gap-4">
                     {['facebook', 'instagram', 'linkedin', 'twitter'].map(s => (
                        <button key={s} className="w-11 h-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                           <i className={`fab fa-${s}`}></i>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Topology Hub</h5>
                  <ul className="space-y-4">
                     {['Hotel OS', 'Homestay Sync', 'Kost Ledger', 'Rental Pro', 'Housing Sales'].map(i => (
                        <li key={i}><button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase">{i}</button></li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Platform Core</h5>
                  <ul className="space-y-4">
                     {['Pricing Engine', 'Security Node', 'Analytics Hub', 'Governance', 'Mobile SDK'].map(i => (
                        <li key={i}><button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase">{i}</button></li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Resources</h5>
                  <ul className="space-y-4">
                     {['Support Hub', 'API Docs', 'Legal Node', 'Privacy Protocol', 'Service Status'].map(i => (
                        <li key={i}><button className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase">{i}</button></li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Contact Node</h5>
                  <div className="space-y-4">
                     <p className="text-xs font-black text-indigo-600 uppercase">support@seulanga.com</p>
                     <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Banda Aceh, Sumatra <br/> Indonesia - 23122</p>
                  </div>
               </div>
            </div>

            <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2024 SEULANGA ENTERPRISE CORE SYSTEM</p>
               <div className="flex gap-8 items-center">
                  <div className="flex items-center gap-2">
                     <i className="fas fa-shield-check text-emerald-500"></i>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ISO 27001 Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <i className="fas fa-credit-card text-indigo-500"></i>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PCI-DSS Verified Node</span>
                  </div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
