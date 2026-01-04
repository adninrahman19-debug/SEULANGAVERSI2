
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { GuestHome } from './guest/GuestHome';
import { VoucherWallet } from './guest/VoucherWallet';
import { InquiryHub } from './guest/InquiryHub';
import { WishlistFavorites } from './guest/WishlistFavorites';
import { PropertyDiscovery } from './guest/PropertyDiscovery';
import { BookingProtocol } from './guest/BookingProtocol';
import { PaymentTreasury } from './guest/PaymentTreasury';
import { BookingHistory } from './guest/BookingHistory';
import { ProfileManager } from './guest/ProfileManager';
import { ReviewReputation } from './guest/ReviewReputation';
import { CommunicationHub } from './guest/CommunicationHub';
import { SupportCenter } from './guest/SupportCenter';

type GuestTab = 'overview' | 'discovery' | 'bookings' | 'history' | 'payments' | 'reviews' | 'messages' | 'inquiries' | 'wishlist' | 'rewards' | 'profile' | 'support';

interface GuestDashboardProps {
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ currentUser, onUpdateUser, onNavigate, language }) => {
  const [activeTab, setActiveTab] = useState<GuestTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const user = currentUser || MOCK_USERS.find(u => u.role === 'GUEST')!;

  const d = {
    id: {
      search_p: "Cari hotel, kost, atau rumah...",
      help_title: "Butuh Bantuan Layanan?",
      help_sub: "Tim Seulanga siap membantu navigasi reservasi dan kendala teknis Anda.",
      footer_legal: "Platform Properti & Hospitality Terpadu Sumatra",
      btn_help: "Pusat Bantuan",
      nav: {
        home: "Beranda",
        explore: "Eksplorasi",
        bookings: "Reservasi",
        history: "Riwayat",
        payments: "Keuangan",
        reviews: "Ulasan",
        messages: "Pesan",
        inquiries: "Inquiry",
        wishlist: "Wishlist",
        rewards: "Voucher",
        profile: "Profil",
        support: "Bantuan"
      }
    },
    en: {
      search_p: "Search hotels, boarding, or houses...",
      help_title: "Need Service Assistance?",
      help_sub: "Seulanga team is ready to help with your reservations and technical issues.",
      footer_legal: "Integrated Sumatra Property & Hospitality Platform",
      btn_help: "Help Center",
      nav: {
        home: "Home",
        explore: "Explore",
        bookings: "Bookings",
        history: "History",
        payments: "Payments",
        reviews: "Reviews",
        messages: "Messages",
        inquiries: "Inquiry",
        wishlist: "Saved",
        rewards: "Rewards",
        profile: "Identity",
        support: "Support"
      }
    }
  }[language];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return <GuestHome user={user} onNavigate={onNavigate} onSelectTab={(t) => setActiveTab(t as GuestTab)} />;
      case 'discovery': return <PropertyDiscovery onSelectProperty={(biz) => onNavigate('property-detail')} language={language} />;
      case 'bookings': return <BookingProtocol currentUser={user} language={language} />;
      case 'history': return <BookingHistory currentUser={user} language={language} />;
      case 'payments': return <PaymentTreasury currentUser={user} language={language} />;
      case 'reviews': return <ReviewReputation currentUser={user} language={language} />;
      case 'messages': return <CommunicationHub currentUser={user} language={language} />;
      case 'wishlist': return <WishlistFavorites user={user} onNavigate={onNavigate} language={language} />;
      case 'inquiries': return <InquiryHub />;
      case 'rewards': return <VoucherWallet language={language} />;
      case 'profile': return <ProfileManager user={user} onUpdate={onUpdateUser} language={language} />;
      case 'support': return <SupportCenter currentUser={user} language={language} />;
      default: return <GuestHome user={user} onNavigate={onNavigate} onSelectTab={(t) => setActiveTab(t as GuestTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 1. TOP NAVBAR: SEARCH, ACCOUNT, CATEGORIES */}
      <header className="sticky top-0 z-[110] bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm">
        {/* Top Row: Search & Profile */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-6 md:gap-12">
           <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => onNavigate('landing')}>
              <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform active:scale-95">
                 <i className="fas fa-layer-group text-sm md:text-lg"></i>
              </div>
              <span className="hidden lg:block text-lg md:text-xl font-black tracking-tighter text-slate-900 uppercase">SEULANGA<span className="text-indigo-600">.</span></span>
           </div>

           <div className="flex-1 max-w-2xl relative">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder={d.search_p}
                className="w-full bg-slate-50 border border-slate-200 rounded-[20px] py-3 md:py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setActiveTab('discovery')}
              />
           </div>

           <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <button 
                onClick={() => setActiveTab('messages')}
                className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all relative group"
              >
                 <i className="fas fa-comment-dots group-hover:scale-110 transition-transform"></i>
                 <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
              <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                 <img src={user.avatar} className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover border-2 border-white shadow-md" alt="profile" />
                 <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase mt-1 tracking-widest">{user.verificationStatus}</p>
                 </div>
              </button>
           </div>
        </div>

        {/* Bottom Row: Dynamic Category Scroller */}
        <div className="bg-white border-t border-slate-50 overflow-x-auto scrollbar-hide py-3 md:py-4">
           <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6 md:gap-10">
              {[
                { id: 'all', icon: 'fa-shapes', label: 'Semua Node' },
                { id: 'hotel', icon: 'fa-hotel', label: 'Hotel' },
                { id: 'homestay', icon: 'fa-house-chimney', label: 'Homestay' },
                { id: 'kost', icon: 'fa-bed', label: 'Kost' },
                { id: 'rental', icon: 'fa-key', label: 'Rental' },
                { id: 'property', icon: 'fa-building', label: 'Properti' },
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveTab('discovery')} 
                  className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all whitespace-nowrap group shrink-0"
                >
                   <div className="w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                      <i className={`fas ${cat.icon}`}></i>
                   </div>
                   <span>{cat.label}</span>
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA: LISTINGS & ACTIVITIES */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 space-y-10">
         {/* Sub-Navigation for Dashboard Modules (Desktop Only) */}
         <nav className="hidden md:flex items-center gap-2 border-b border-slate-100 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: d.nav.home, icon: 'fa-house' },
              { id: 'discovery', label: d.nav.explore, icon: 'fa-compass' },
              { id: 'bookings', label: d.nav.bookings, icon: 'fa-receipt' },
              { id: 'messages', label: d.nav.messages, icon: 'fa-comment-dots' },
              { id: 'wishlist', label: d.nav.wishlist, icon: 'fa-heart' },
              { id: 'payments', label: d.nav.payments, icon: 'fa-vault' },
              { id: 'rewards', label: d.nav.rewards, icon: 'fa-sparkles' },
              { id: 'support', label: d.nav.support, icon: 'fa-circle-question' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuestTab)}
                className={`px-8 py-5 border-b-2 transition-all flex items-center gap-3 text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${
                  activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className={`fas ${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
         </nav>

         {/* Content Render Node */}
         <section className="min-h-[60vh] animate-in fade-in duration-700">
            {renderTabContent()}
         </section>
      </main>

      {/* 3. BOTTOM SECTION: HELP & INFORMATION */}
      <section className="bg-white border-t border-slate-100 py-16 md:py-24 mt-12 pb-32 md:pb-24">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
               <div className="lg:col-span-8 bg-slate-50 p-10 md:p-14 rounded-[48px] md:rounded-[64px] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border border-slate-100">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-bl-[100px]"></div>
                  <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-4xl text-indigo-600 shadow-xl shadow-indigo-100 shrink-0 border border-indigo-50">
                     <i className="fas fa-headset"></i>
                  </div>
                  <div className="text-center md:text-left flex-1">
                     <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">{d.help_title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed max-w-lg">{d.help_sub}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('support')}
                    className="md:ml-auto w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
                  >
                     {d.btn_help}
                  </button>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="p-10 bg-indigo-900 rounded-[48px] text-white space-y-4 shadow-2xl relative overflow-hidden group">
                     <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                     <h4 className="font-black uppercase text-xs tracking-widest italic flex items-center gap-3">
                        <i className="fas fa-shield-check text-emerald-400"></i> 
                        Registry Guard
                     </h4>
                     <p className="text-xs text-indigo-100/60 font-medium leading-relaxed italic">"Setiap interaksi pada node properti Seulanga dilindungi oleh enkripsi TLS 1.3 dan protokol verifikasi identitas terpusat."</p>
                  </div>
               </div>
            </div>

            {/* Footer Legal Node */}
            <footer className="pt-16 md:pt-24 border-t border-slate-100 mt-16 md:mt-24 flex flex-col md:flex-row justify-between items-center gap-10">
               <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white text-sm">
                     <i className="fas fa-layer-group"></i>
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{d.footer_legal}</p>
               </div>
               <div className="flex gap-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <button className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
                  <button className="hover:text-indigo-600 transition-colors">Service Level Agreement</button>
                  <button className="hover:text-indigo-600 transition-colors">Cookies Protocol</button>
               </div>
            </footer>
         </div>
      </section>

      {/* 4. MOBILE-FIRST NAVIGATION: STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-[120] flex justify-around p-4 shadow-[0_-15px_50px_rgba(0,0,0,0.08)]">
         {[
           { id: 'overview', label: d.nav.home, icon: 'fa-house' },
           { id: 'discovery', label: d.nav.explore, icon: 'fa-compass' },
           { id: 'bookings', label: d.nav.bookings, icon: 'fa-receipt' },
           { id: 'support', label: d.nav.support, icon: 'fa-circle-question' },
           { id: 'profile', label: d.nav.profile, icon: 'fa-user-circle' },
         ].map(tab => (
            <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as GuestTab)} 
               className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === tab.id ? 'text-indigo-600 -translate-y-2' : 'text-slate-300'}`}
            >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-transparent'}`}>
                  <i className={`fas ${tab.icon} text-xl`}></i>
               </div>
               <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
         ))}
      </div>

    </div>
  );
};
