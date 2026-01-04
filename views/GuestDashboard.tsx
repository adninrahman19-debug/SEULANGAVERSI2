
import React, { useState } from 'react';
import { User, Booking, BookingStatus } from '../types';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_USERS } from '../constants';
import { GuestHome } from './guest/GuestHome';
import { IdentityHub } from './guest/IdentityHub';
import { VoucherWallet } from './guest/VoucherWallet';
import { InquiryHub } from './guest/InquiryHub';
import { PropertyWishlist } from './guest/PropertyWishlist';
import { PropertyDiscovery } from './guest/PropertyDiscovery';
import { BookingProtocol } from './guest/BookingProtocol';
import { PaymentTreasury } from './guest/PaymentTreasury';

type GuestTab = 'overview' | 'discovery' | 'bookings' | 'payments' | 'inquiries' | 'wishlist' | 'rewards' | 'profile';

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
      tab_overview: "Beranda",
      tab_discovery: "Eksplorasi",
      tab_bookings: "Reservasi",
      tab_payments: "Treasury",
      tab_inquiries: "Inquiry",
      tab_wishlist: "Simpan",
      tab_rewards: "Voucher",
      tab_profile: "Akun"
    },
    en: {
      search_p: "Search hotels, boarding, or houses...",
      help_title: "Need Service Assistance?",
      help_sub: "Seulanga team is ready to help with your reservations and technical issues.",
      footer_legal: "Integrated Sumatra Property & Hospitality Platform",
      tab_overview: "Home",
      tab_discovery: "Explore",
      tab_bookings: "Bookings",
      tab_payments: "Payments",
      tab_inquiries: "Inquiry",
      tab_wishlist: "Saved",
      tab_rewards: "Rewards",
      tab_profile: "Account"
    }
  }[language];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return <GuestHome user={user} onNavigate={onNavigate} onSelectTab={(t) => setActiveTab(t as GuestTab)} />;
      case 'discovery': return <PropertyDiscovery onSelectProperty={(biz) => onNavigate('property-detail')} language={language} />;
      case 'bookings': return <BookingProtocol currentUser={user} language={language} />;
      case 'payments': return <PaymentTreasury currentUser={user} language={language} />;
      case 'wishlist': return <PropertyWishlist onSelect={() => onNavigate('property-detail')} />;
      case 'inquiries': return <InquiryHub />;
      case 'rewards': return <VoucherWallet language={language} />;
      case 'profile': return <IdentityHub user={user} onUpdate={onUpdateUser} />;
      default: return <GuestHome user={user} onNavigate={onNavigate} onSelectTab={(t) => setActiveTab(t as GuestTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-4 md:gap-10">
           <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => onNavigate('landing')}>
              <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <i className="fas fa-layer-group text-sm md:text-lg"></i>
              </div>
              <span className="hidden sm:block text-lg md:text-xl font-black tracking-tighter text-slate-900 uppercase">SEULANGA<span className="text-indigo-600">.</span></span>
           </div>

           <div className="flex-1 max-w-xl relative hidden md:block">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder={d.search_p}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <button className="w-10 h-10 md:w-11 md:h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all relative">
                 <i className="fas fa-bell"></i>
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-px h-6 md:h-8 bg-slate-200 mx-1"></div>
              <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 md:gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all">
                 <img src={user.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border-2 border-white shadow-md" alt="profile" />
                 <div className="hidden lg:block text-left">
                    <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase mt-1 tracking-widest">{user.verificationStatus}</p>
                 </div>
              </button>
           </div>
        </div>

        {/* Quick Category Node */}
        <div className="bg-white border-t border-slate-50 overflow-x-auto scrollbar-hide py-3 md:py-4">
           <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-6 md:gap-10">
              {[
                { icon: 'fa-hotel', label: 'Hotel' },
                { icon: 'fa-house-chimney', label: 'Homestay' },
                { icon: 'fa-bed', label: 'Kost' },
                { icon: 'fa-key', label: 'Rental' },
                { icon: 'fa-building', label: 'Properti' },
              ].map(cat => (
                <button key={cat.label} onClick={() => { setActiveTab('discovery'); }} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all whitespace-nowrap group">
                   <div className="w-6 h-6 rounded-lg bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                      <i className={`fas ${cat.icon}`}></i>
                   </div>
                   <span>{cat.label}</span>
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 md:space-y-12">
         {/* Internal Navigation Tabs (Desktop/Tablet Only) */}
         <div className="hidden md:flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: d.tab_overview, icon: 'fa-house' },
              { id: 'discovery', label: d.tab_discovery, icon: 'fa-compass' },
              { id: 'bookings', label: d.tab_bookings, icon: 'fa-receipt' },
              { id: 'payments', label: d.tab_payments, icon: 'fa-vault' },
              { id: 'inquiries', label: d.tab_inquiries, icon: 'fa-comment-dots' },
              { id: 'wishlist', label: d.tab_wishlist, icon: 'fa-heart' },
              { id: 'rewards', label: d.tab_rewards, icon: 'fa-sparkles' },
              { id: 'profile', label: d.tab_profile, icon: 'fa-user-circle' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuestTab)}
                className={`px-8 py-5 border-b-2 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                  activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
         </div>

         {/* Render Active View */}
         <div className="min-h-[60vh]">
            {renderTabContent()}
         </div>
      </main>

      {/* 3. BOTTOM SECTION */}
      <section className="bg-white border-t border-slate-100 py-16 md:py-24 mt-12 pb-32 md:pb-24">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
               <div className="lg:col-span-8 bg-slate-50 p-10 md:p-14 rounded-[48px] md:rounded-[56px] flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border border-slate-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
                  <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center text-4xl text-indigo-600 shadow-xl shadow-indigo-100 shrink-0">
                     <i className="fas fa-headset"></i>
                  </div>
                  <div className="text-center md:text-left">
                     <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">{d.help_title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed max-w-lg">{d.help_sub}</p>
                  </div>
                  <button className="md:ml-auto w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100">
                     Pusat Bantuan
                  </button>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <div className="p-8 bg-indigo-900 rounded-[40px] text-white space-y-4 shadow-2xl relative overflow-hidden">
                     <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                     <h4 className="font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                        <i className="fas fa-shield-check text-emerald-400"></i> 
                        Identity Guard
                     </h4>
                     <p className="text-xs text-indigo-100/60 font-medium leading-relaxed italic">"Setiap reservasi Anda dienkripsi dan dilindungi oleh protokol keamanan finansial Seulanga."</p>
                  </div>
               </div>
            </div>

            <footer className="pt-16 md:pt-24 border-t border-slate-50 mt-16 md:mt-24 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-white text-xs">
                     <i className="fas fa-layer-group"></i>
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{d.footer_legal}</p>
               </div>
            </footer>
         </div>
      </section>

      {/* 4. MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 z-[110] flex justify-around p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         {[
           { id: 'overview', label: d.tab_overview, icon: 'fa-house' },
           { id: 'discovery', label: d.tab_discovery, icon: 'fa-compass' },
           { id: 'bookings', label: d.tab_bookings, icon: 'fa-receipt' },
           { id: 'payments', label: d.tab_payments, icon: 'fa-vault' },
           { id: 'profile', label: d.tab_profile, icon: 'fa-user-circle' },
         ].map(tab => (
            <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as GuestTab)} 
               className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === tab.id ? 'text-indigo-600 -translate-y-1' : 'text-slate-300'}`}
            >
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-indigo-50 shadow-inner' : ''}`}>
                  <i className={`fas ${tab.icon} text-lg`}></i>
               </div>
               <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
         ))}
      </div>

    </div>
  );
};
