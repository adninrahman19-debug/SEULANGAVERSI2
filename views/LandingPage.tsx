
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
        title: 'Mengatasi Hambatan Industri Properti',
        sub: 'Mengapa pengelolaan aset dan pencarian hunian seringkali terasa sulit?',
        business: {
          label: 'Dilema Pemilik Bisnis',
          list: [
            { q: 'Operasional Manual & Fragmen', a: 'Catatan tercecer di buku atau spreadsheet manual menyebabkan kebocoran finansial dan risiko human-error.' },
            { q: 'Manajemen Staf yang Lemah', a: 'Sulit memantau kinerja resepsionis dan kebersihan unit secara real-time tanpa sistem pengawasan terpadu.' },
            { q: 'Kesulitan Ekspansi Pasar', a: 'Ketergantungan pada channel luar dengan komisi tinggi tanpa memiliki database tamu sendiri.' }
          ]
        },
        guest: {
          label: 'Frustrasi Calon Tamu',
          list: [
            { q: 'Informasi Tidak Akurat', a: 'Banyak listing properti yang tidak terupdate atau memiliki foto yang berbeda dengan kondisi fisik asli.' },
            { q: 'Proses Pesan yang Rumit', a: 'Kurangnya sistem pembayaran instan dan konfirmasi manual yang memakan waktu lama.' },
            { q: 'Keamanan Transaksi Rendah', a: 'Kekhawatiran akan penipuan pada transaksi langsung tanpa adanya jaminan dari platform tepercaya.' }
          ]
        },
        solution: {
          label: 'The Seulanga Integrated Hub',
          h: 'Ekosistem Digital End-to-End',
          p: 'Seulanga menyatukan seluruh mata rantai hospitality. Automasi untuk Owner, efisiensi untuk Staf, dan kenyamanan mutlak untuk Tamu dalam satu node teknologi yang solid.',
          btn: 'Solusi Seulanga'
        }
      },
      how: {
        title: 'Langkah Operasional Strategis',
        sub: 'Mulai digitalisasi bisnis properti Anda dalam hitungan menit melalui alur kerja yang terintegrasi.',
        steps: [
          { n: '01', title: 'Register', desc: 'Buat identitas digital dan verifikasi akun Anda dalam ekosistem Seulanga.', icon: 'fa-user-plus' },
          { n: '02', title: 'Setup Business', desc: 'Lengkapi data legalitas, lokasi, dan profil entitas properti Anda.', icon: 'fa-building-shield' },
          { n: '03', title: 'List Units', desc: 'Input spesifikasi, fasilitas, foto high-res, dan aturan harga unit Anda.', icon: 'fa-door-open' },
          { n: '04', title: 'Receive Bookings', desc: 'Terima reservasi otomatis 24/7 dengan sinkronisasi kalender real-time.', icon: 'fa-calendar-check' },
          { n: '05', title: 'Get Paid', desc: 'Verifikasi settlement dan tarik pendapatan ke treasury bisnis Anda.', icon: 'fa-sack-dollar' }
        ]
      },
      features: {
        title: 'Nilai Jual Utama Platform',
        list: [
          { title: 'Multi-business Management', desc: 'Kelola Hotel, Kost, hingga Homestay dalam satu akun pusat yang terpadu.', icon: 'fa-layer-group', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Online Booking & Reservation', desc: 'Sistem reservasi real-time dengan sinkronisasi kalender instan untuk mencegah double-booking.', icon: 'fa-calendar-check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Tenant-based Dashboard', desc: 'Dasbor khusus untuk Owner dan Staf dengan metrik performa bisnis yang akurat.', icon: 'fa-chart-pie', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Payment & Invoicing', desc: 'Invoicing otomatis dan verifikasi pembayaran manual melalui platform treasury.', icon: 'fa-file-invoice-dollar', color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Promo & Pricing Tools', desc: 'Optimasi pendapatan dengan aturan harga dinamis dan manajemen voucher promo.', icon: 'fa-tags', color: 'text-rose-600', bg: 'bg-rose-50' },
          { title: 'Review & Rating System', desc: 'Bangun kepercayaan melalui sistem ulasan transparan dari tamu terverifikasi.', icon: 'fa-star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Secure Role-Based Access', desc: 'Kontrol akses ketat (RBAC) untuk melindungi integritas data bisnis Anda.', icon: 'fa-shield-halved', color: 'text-slate-600', bg: 'bg-slate-100' }
        ]
      },
      business_types: {
        title: 'Otoritas Bisnis Universal',
        sub: 'Platform Seulanga beradaptasi secara cerdas dengan berbagai topology properti Anda.',
        list: [
          { name: 'Hotel', desc: 'Manajemen kamar kompleks, housekeeping, and sistem resepsionis terpadu.', icon: 'fa-hotel', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200' },
          { name: 'Homestay', desc: 'Solusi praktis untuk hunian harian dengan manajemen mandiri yang mudah.', icon: 'fa-house-chimney-window', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200' },
          { name: 'Guesthouse', desc: 'Kontrol penuh atas layanan tamu dan ketersediaan unit dalam skala menengah.', icon: 'fa-house-user', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200' },
          { name: 'Kost', desc: 'Automasi tagihan bulanan, manajemen penghuni, dan kontrol utilitas.', icon: 'fa-bed', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200' },
          { name: 'Rental House', desc: 'Kelola penyewaan rumah harian atau tahunan dengan kontrak digital.', icon: 'fa-key', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200' },
          { name: 'Property Sales', desc: 'Showcase unit jual, manajemen database calon pembeli, dan marketing kit.', icon: 'fa-building-circle-check', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200' },
          { name: 'Housing Complex', desc: 'Manajemen estate, keamanan, dan iuran lingkungan dalam satu dashboard.', icon: 'fa-city', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200' }
        ]
      },
      pricing: {
        title: 'Investasi Masa Depan Aset Anda',
        sub: 'Pilih tier infrastruktur yang sesuai dengan skala dan ambisi pertumbuhan bisnis Anda.',
        commission: {
          title: 'Commission Node Model',
          desc: 'Biaya layanan per transaksi marketplace yang telah diverifikasi.',
          label: 'Biaya Admin'
        },
        matrix: {
           title: 'Perbandingan Fitur Teknis',
           headers: ['Fitur Platform', 'Basic', 'Pro', 'Premium'],
           rows: [
             ['Unit Kapasitas', 'Hingga 5', 'Hingga 50', 'Tanpa Batas'],
             ['Staf Operator', '1 Akun', '5 Akun', 'Tanpa Batas'],
             ['AI Intelligence', 'No', 'Standard', 'Advanced'],
             ['WhatsApp Billing', 'No', 'Yes', 'Yes'],
             ['Channel Manager', 'No', 'No', 'Yes'],
             ['Priority Search', 'No', 'No', 'Yes'],
             ['API Access', 'No', 'No', 'Full'],
           ]
        },
        addons: {
          title: 'Add-on Hub',
          list: [
            { name: 'AI Business Intelligence', price: '99K/bln', desc: 'Laporan prediktif okupansi harian.' },
            { name: 'Custom Domain Node', price: '149K/thn', desc: 'Domain khusus untuk booking direct.' },
            { name: 'Extra Staff Pack (+10)', price: '199K/bln', desc: 'Tambah slot akun operasional.' }
          ]
        },
        packages: [
          { name: "Basic Node", price: "0", comm: "15%", feat: ["Hingga 5 Unit Aset", "Laporan Harian Standar", "Marketplace Dasar", "1 Akun Operator"], btn: "Mulai Gratis", color: "bg-white text-slate-900", icon: "fa-leaf" },
          { name: "Pro Cluster", price: "499K", comm: "10%", feat: ["Hingga 50 Unit Aset", "Laba Rugi Real-time", "WhatsApp Billing", "5 Akun Staf", "Voucher Management"], btn: "Coba Pro Gratis", color: "bg-indigo-600 text-white scale-105 shadow-3xl shadow-indigo-100", popular: true, icon: "fa-rocket" },
          { name: "Premium Alpha", price: "1.2M", comm: "5%", feat: ["Unit Tanpa Batas", "Audit Keuangan Mendalam", "API Integrasi Penuh", "Channel Manager Sync", "White Label Node"], btn: "Hubungi Sales", color: "bg-slate-900 text-white", icon: "fa-crown" },
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
        title: 'Solving Property Industry Friction',
        sub: 'Why is asset management and house hunting often so difficult?',
        business: {
          label: 'Business Owner Dilemmas',
          list: [
            { q: 'Manual & Fragmented Ops', a: 'Scattered records in manual books or spreadsheets cause financial leaks and human-error risks.' },
            { q: 'Weak Staff Oversight', a: 'Hard to monitor receptionist performance and unit cleanliness in real-time without integrated supervision.' },
            { q: 'Marketing Expansion Hurdles', a: 'Reliance on high-commission external channels without owning your guest database.' }
          ]
        },
        guest: {
          label: 'Guest Frustrations',
          list: [
            { q: 'Inaccurate Listing Info', a: 'Many property listings are outdated or have photos that don’t match physical conditions.' },
            { q: 'Complicated Booking Flow', a: 'Lack of instant payment systems and time-consuming manual confirmations.' },
            { q: 'Low Transaction Security', a: 'Concerns about direct transaction fraud without a trusted platform guarantee.' }
          ]
        },
        solution: {
          label: 'The Seulanga Integrated Hub',
          h: 'End-to-End Digital Ecosystem',
          p: 'Seulanga unifies the entire hospitality chain. Automation for Owners, efficiency for Staff, and absolute comfort for Guests in one solid tech node.',
          btn: 'Explore Solution'
        }
      },
      how: {
        title: 'Strategic Operational Roadmap',
        sub: 'Digitize your property business in minutes through an integrated educational workflow.',
        steps: [
          { n: '01', title: 'Register', desc: 'Create your digital identity and verify your account in the Seulanga ecosystem.', icon: 'fa-user-plus' },
          { n: '02', title: 'Setup Business', desc: 'Complete legality data, location, and your property entity profile.', icon: 'fa-building-shield' },
          { n: '03', title: 'List Units', desc: 'Input specifications, facilities, high-res photos, and your unit pricing rules.', icon: 'fa-door-open' },
          { n: '04', title: 'Receive Bookings', desc: 'Accept automatic 24/7 reservations with real-time calendar synchronization.', icon: 'fa-calendar-check' },
          { n: '05', title: 'Get Paid', desc: 'Verify settlements and withdraw earnings to your business treasury.', icon: 'fa-sack-dollar' }
        ]
      },
      features: {
        title: 'Core Platform Features',
        list: [
          { title: 'Multi-business Management', desc: 'Manage Hotels, Boarding Houses, and stays from one central account.', icon: 'fa-layer-group', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Online Booking & Reservation', desc: 'Real-time reservations with instant sync to prevent overbooking.', icon: 'fa-calendar-check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Tenant-based Dashboard', desc: 'Dedicated control nodes for Owners and Staff with precise metrics.', icon: 'fa-chart-pie', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Payment & Invoicing', desc: 'Automated invoicing and manual payment verification through treasury.', icon: 'fa-file-invoice-dollar', color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'Promo & Pricing Tools', desc: 'Maximize revenue with dynamic pricing rules and voucher management.', icon: 'fa-tags', color: 'text-rose-600', bg: 'bg-rose-50' },
          { title: 'Review & Rating System', desc: 'Build trust with transparent feedback from verified guests.', icon: 'fa-star', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Secure Role-Based Access', desc: 'Hardened RBAC to protect your business data and operational integrity.', icon: 'fa-shield-halved', color: 'text-slate-600', bg: 'bg-slate-100' }
        ]
      },
      business_types: {
        title: 'Universal Business Authority',
        sub: 'Seulanga platform intelligently adapts to your various property topologies.',
        list: [
          { name: 'Hotel', desc: 'Complex room management, housekeeping, and integrated front-desk systems.', icon: 'fa-hotel', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200' },
          { name: 'Homestay', desc: 'Practical solution for daily housing with easy self-management.', icon: 'fa-house-chimney-window', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200' },
          { name: 'Guesthouse', desc: 'Full control over guest services and unit availability in medium scale.', icon: 'fa-house-user', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200' },
          { name: 'Kost', desc: 'Monthly billing automation, resident management, and utility control.', icon: 'fa-bed', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200' },
          { name: 'Rental House', desc: 'Manage daily or yearly house rentals with digital contracts.', icon: 'fa-key', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200' },
          { name: 'Property Sales', desc: 'Showcase units for sale, lead management, and marketing kits.', icon: 'fa-building-circle-check', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200' },
          { name: 'Housing Complex', desc: 'Estate management, security, and community dues in one dashboard.', icon: 'fa-city', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200' }
        ]
      },
      pricing: {
        title: 'Future Investment for Your Assets',
        sub: 'Choose an infrastructure tier that matches your scale and growth ambition.',
        commission: {
          title: 'Commission Node Model',
          desc: 'Service fees per verified marketplace transaction.',
          label: 'Admin Fee'
        },
        matrix: {
           title: 'Technical Feature Matrix',
           headers: ['Platform Feature', 'Basic', 'Pro', 'Premium'],
           rows: [
             ['Unit Capacity', 'Up to 5', 'Up to 50', 'Unlimited'],
             ['Staff Operators', '1 Account', '5 Accounts', 'Unlimited'],
             ['AI Intelligence', 'No', 'Standard', 'Advanced'],
             ['WhatsApp Billing', 'No', 'Yes', 'Yes'],
             ['Channel Manager', 'No', 'No', 'Yes'],
             ['Priority Search', 'No', 'No', 'Yes'],
             ['API Access', 'No', 'No', 'Full'],
           ]
        },
        addons: {
          title: 'Add-on Hub',
          list: [
            { name: 'AI Business Intelligence', price: '99K/mo', desc: 'Daily predictive occupancy reports.' },
            { name: 'Custom Domain Node', price: '149K/yr', desc: 'Branded domain for direct bookings.' },
            { name: 'Extra Staff Pack (+10)', price: '199K/mo', desc: 'Expand operational account slots.' }
          ]
        },
        packages: [
          { name: "Basic Node", price: "0", comm: "15%", feat: ["Up to 5 Unit Assets", "Standard Daily Reports", "Basic Marketplace", "1 Staff Operator"], btn: "Start Free", color: "bg-white text-slate-900", icon: "fa-leaf" },
          { name: "Pro Cluster", price: "499K", comm: "10%", feat: ["Up to 50 Unit Assets", "Real-time P&L", "WhatsApp Billing", "5 Staff Accounts", "Voucher Management"], btn: "Try Pro Free", color: "bg-indigo-600 text-white scale-105 shadow-3xl shadow-indigo-100", popular: true, icon: "fa-rocket" },
          { name: "Premium Alpha", price: "1.2M", comm: "5%", feat: ["Unlimited Units", "Deep Financial Audit", "Full API Integration", "Channel Manager Sync", "White Label Node"], btn: "Contact Sales", color: "bg-slate-900 text-white", icon: "fa-crown" },
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

      {/* 3. PROBLEM & SOLUTION SECTION */}
      <section id="problem-solution" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
              <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Validation Node</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.problem.title}</h3>
              <p className="text-lg text-slate-500 font-medium">{d.problem.sub}</p>
           </div>

           <div className="grid lg:grid-cols-2 gap-10 items-stretch">
              {/* Pain Point Matrix */}
              <div className="space-y-6">
                 {/* Business Owner Side */}
                 <div className="p-10 bg-slate-50 rounded-[56px] border border-slate-100 space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                          <i className="fas fa-building-circle-exclamation"></i>
                       </div>
                       <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{d.problem.business.label}</h4>
                    </div>
                    <div className="space-y-4">
                       {d.problem.business.list.map((item, i) => (
                          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 group hover:border-rose-200 transition-all shadow-sm">
                             <h5 className="text-sm font-black text-slate-900 uppercase mb-2 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                {item.q}
                             </h5>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.a}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Guest Side */}
                 <div className="p-10 bg-slate-50 rounded-[56px] border border-slate-100 space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-slate-100">
                          <i className="fas fa-user-large-slash"></i>
                       </div>
                       <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{d.problem.guest.label}</h4>
                    </div>
                    <div className="space-y-4">
                       {d.problem.guest.list.map((item, i) => (
                          <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-100 group hover:border-amber-200 transition-all shadow-sm">
                             <h5 className="text-sm font-black text-slate-900 uppercase mb-2 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                {item.q}
                             </h5>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.a}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Integrated Solution (Callout) */}
              <div className="relative">
                 <div className="bg-slate-950 p-12 md:p-20 rounded-[64px] text-white h-full flex flex-col justify-between relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                    
                    <div className="relative z-10 space-y-12">
                       <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-[40px] flex items-center justify-center text-indigo-400 text-5xl shadow-inner mb-16 animate-float">
                          <i className="fas fa-microchip"></i>
                       </div>
                       <div className="space-y-6">
                          <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] italic">{d.problem.solution.label}</p>
                          <h4 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.95]">{d.problem.solution.h}</h4>
                          <p className="text-indigo-100/40 text-xl font-medium leading-relaxed max-w-md">
                             {d.problem.solution.p}
                          </p>
                       </div>
                    </div>

                    <div className="relative z-10 pt-16 flex flex-col sm:flex-row gap-6">
                       <button onClick={() => scrollTo('features')} className="px-10 py-5 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-900/40">{d.problem.solution.btn} →</button>
                       <div className="flex items-center gap-4 px-2">
                          <div className="flex -space-x-3">
                             {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-10 h-10 rounded-full border-4 border-slate-950 shadow-lg" />)}
                          </div>
                          <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Join 1.2K+ Owners</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. FEATURES OVERVIEW (HIGHLIGHT) */}
      <section id="features" className="py-32 bg-[#fcfdfe]">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
              <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Ecosystem Modules</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.features.title}</h3>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Authorized Node</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. BUSINESS TYPES SECTION */}
      <section id="business-types" className="py-32 bg-slate-950 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
               <div className="max-w-2xl space-y-6">
                  <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Market Segmentation</h2>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">{d.business_types.title}</h3>
                  <p className="text-xl text-slate-400 font-medium">{d.business_types.sub}</p>
               </div>
               <button onClick={() => onNavigate('register')} className="px-10 py-5 bg-white text-slate-900 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl whitespace-nowrap">Daftarkan Bisnis Anda</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {d.business_types.list.map((v, i) => (
                 <div key={i} className="group relative h-[480px] rounded-[56px] overflow-hidden cursor-pointer">
                    <img src={v.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" alt={v.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                    <div className="absolute bottom-12 left-10 right-10 space-y-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:bg-indigo-600 transition-all duration-500">
                          <i className={`fas ${v.icon} text-xl`}></i>
                       </div>
                       <h4 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{v.name}</h4>
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

      {/* 6. HOW IT WORKS (ROADMAP) */}
      <section id="how-it-works" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
              <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Simplified Education</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{d.how.title}</h3>
              <p className="text-lg text-slate-500 font-medium">{d.how.sub}</p>
           </div>

           <div className="relative">
              {/* Connector line for desktop */}
              <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-px bg-slate-100 z-0"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
                 {d.how.steps.map((step, i) => (
                   <div key={i} className="space-y-8 text-center group">
                      <div className="relative">
                         <div className="w-24 h-24 bg-white border border-slate-100 rounded-[32px] flex items-center justify-center text-3xl font-black text-indigo-600 mx-auto shadow-2xl transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3">
                            <i className={`fas ${step.icon}`}></i>
                         </div>
                         <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-xs font-black border-4 border-white shadow-xl">
                            {step.n}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                         <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">{step.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="mt-24 text-center">
              <button onClick={() => onNavigate('register')} className="px-12 py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1">
                 Mulai Eksplorasi Sekarang
              </button>
           </div>
        </div>
      </section>

      {/* 7. PRICING & MONETIZATION SECTION */}
      <section id="pricing" className="py-32 bg-[#f8fafc] overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
               <h2 className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px] italic">Monetization Shards</h2>
               <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{d.pricing.title}</h3>
               <p className="text-slate-400 font-medium text-lg">{d.pricing.sub}</p>
            </div>

            {/* Packages Grid */}
            <div className="grid md:grid-cols-3 gap-10 mb-32">
               {d.pricing.packages.map((p: any, i: number) => (
                 <div key={i} className={`p-12 rounded-[56px] flex flex-col justify-between relative transition-all duration-500 hover:-translate-y-2 ${p.color} ${p.popular ? 'z-10' : 'z-0 border border-slate-100 shadow-sm'}`}>
                    {p.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Best Value Node</span>}
                    <div>
                       <div className="flex justify-between items-start mb-10">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${p.popular ? 'bg-white/10 text-white' : 'bg-slate-50 text-indigo-600'}`}>
                             <i className={`fas ${p.icon}`}></i>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{d.pricing.commission.label}</p>
                             <p className={`text-xl font-black ${p.popular ? 'text-indigo-200' : 'text-indigo-600'}`}>{p.comm}</p>
                          </div>
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">{p.name}</p>
                       <div className="flex items-baseline gap-2 mb-12">
                         {p.price !== '0' && <span className="text-xs font-bold uppercase opacity-60">Rp</span>}
                         <span className="text-6xl font-black tracking-tighter">{p.price}</span>
                         {p.price !== '0' && <span className="text-[10px] font-bold uppercase opacity-60">/ bulan</span>}
                       </div>
                       <div className="space-y-6 mb-16">
                          {p.feat.map((f: string) => (
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

            {/* Feature Comparison Matrix */}
            <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden mb-32 hidden lg:block">
               <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{d.pricing.matrix.title}</h4>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr>
                           {d.pricing.matrix.headers.map((h: string, i: number) => (
                              <th key={i} className={`px-12 py-8 text-[11px] font-black uppercase tracking-widest text-slate-400 ${i === 0 ? '' : 'text-center'}`}>{h}</th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {d.pricing.matrix.rows.map((row: string[], idx: number) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {row.map((cell: string, cidx: number) => (
                                 <td key={cidx} className={`px-12 py-7 ${cidx === 0 ? 'text-xs font-black text-slate-900' : 'text-center text-sm font-bold text-slate-500'} uppercase`}>
                                    {cell === 'Yes' ? <i className="fas fa-check-circle text-emerald-500"></i> : 
                                     cell === 'No' ? <i className="fas fa-times-circle text-slate-200"></i> : cell}
                                 </td>
                              ))}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Add-ons & Commission Explanation */}
            <div className="grid lg:grid-cols-2 gap-10">
               <div className="bg-slate-950 p-12 rounded-[56px] text-white space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                  <div className="relative z-10 space-y-6">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                        <i className="fas fa-percent"></i>
                     </div>
                     <h4 className="text-2xl font-black uppercase tracking-tight">{d.pricing.commission.title}</h4>
                     <p className="text-indigo-100/40 text-sm leading-relaxed">{d.pricing.commission.desc}</p>
                     <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl">
                           <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Basic Payout Cycle</span>
                           <span className="text-sm font-black text-indigo-400">H+3 Verification</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl">
                           <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Premium Express</span>
                           <span className="text-sm font-black text-emerald-400">Instant Settlement</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic leading-none">{d.pricing.addons.title}</h4>
                  <div className="space-y-4">
                     {d.pricing.addons.list.map((addon: any, i: number) => (
                       <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex justify-between items-center group hover:border-indigo-200 transition-all cursor-pointer">
                          <div className="space-y-1">
                             <p className="text-xs font-black text-slate-900 uppercase">{addon.name}</p>
                             <p className="text-[10px] font-medium text-slate-400">{addon.desc}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-indigo-600">Rp {addon.price}</p>
                             <button className="text-[8px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-600 transition-colors">Add to Shard</button>
                          </div>
                       </div>
                     ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">"Custom node configuration available for multi-city entities."</p>
               </div>
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
                       <span className="font-black text-slate-800 uppercase text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{item.q}</span>
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
