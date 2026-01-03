
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_UNITS, MOCK_USERS, MOCK_PROMOTIONS, MOCK_REVIEWS } from '../constants';
import { BookingStatus, VerificationStatus, Booking, Inquiry, User, Promotion, Business, Review, MaintenanceTicket, Complaint } from '../types';

type GuestTab = 'overview' | 'bookings' | 'wishlist' | 'payments' | 'messages' | 'support' | 'activity-hub' | 'profile';
type ProfileSubTab = 'personal' | 'verification' | 'preferences' | 'security';

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachment?: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  businessId: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface UserActivity {
  id: string;
  action: string;
  target: string;
  time: string;
  icon: string;
  color: string;
}

interface GuestDashboardProps {
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
  initialTab?: GuestTab;
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
}

const MOCK_INQUIRIES: Inquiry[] = [
  { id: 'inq1', guestId: 'u4', businessId: 'b1', type: 'visit', status: 'responded', message: 'I would like to visit the unit tomorrow at 10 AM.', createdAt: '2024-12-28' },
];

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ currentUser, onUpdateUser, initialTab = 'overview', onNavigate, language }) => {
  const [activeTab, setActiveTab] = useState<GuestTab>(initialTab);
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('personal');
  const [quickSearch, setQuickSearch] = useState('');
  
  // Local state for interactive status updates in demo
  const user = currentUser || MOCK_USERS.find(u => u.id === 'u4')!;
  const [userBookings, setUserBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.guestId === user.id));

  // --- Translation Dictionary ---
  const d = {
    id: {
      activity: "Pusat Aktivitas",
      welcome: "Selamat datang kembali",
      search_p: "Cari hotel, villa, atau homestay...",
      stat_upcoming: "Mendatang",
      stat_messages: "Pesan",
      stat_saved: "Disimpan",
      stat_inquiries: "Inkuiri Aktif",
      section_payments: "Status Transaksi Real-time",
      btn_all_payments: "Semua Pembayaran",
      checkin_card_title: "Smart Check-In",
      checkin_card_desc: "Pastikan pembayaran settled untuk akses node unit.",
      wishlist_title: "Simpanan Asset (Planning Hub)",
      wishlist_desc: "Kurasi properti dan bandingkan spesifikasi.",
      btn_compare: "Bandingkan",
      btn_back_grid: "Kembali Ke Grid",
      comparison_matrix: "Comparison Matrix",
      reset_compare: "Reset Perbandingan",
      price_pulse: "Price Pulse",
      support_title: "Support & Help Center",
      support_desc: "Temukan bantuan dan panduan operasional.",
      faq_title: "Knowledge Hub (FAQ)",
      guide_title: "Panduan Pengguna",
      contact_title: "Kontak Bantuan",
      contact_desc: "Pusat kendali operasional siap membantu 24/7.",
      complaint_list: "Daftar Pengaduan",
      btn_new_complaint: "Lapor Baru",
      modal_complaint_title: "Layanan Pengaduan Formal",
      modal_complaint_desc: "Sampaikan keluhan terkait kualitas layanan.",
      form_subject: "Subjek Masalah",
      form_detail: "Detail Kronologis",
      form_object: "Pilih Objek Pengaduan",
      maintenance_title: "Tiket Maintenance",
      review_history: "Riwayat Ulasan",
      btn_lodge: "Kirim Pengaduan Ke Admin",
      empty_complaints: "Tidak ada pengaduan aktif"
    },
    en: {
      activity: "Activity Hub",
      welcome: "Welcome back",
      search_p: "Search hotels, villas, or homestays...",
      stat_upcoming: "Upcoming",
      stat_messages: "Messages",
      stat_saved: "Saved Items",
      stat_inquiries: "Active Inquiries",
      section_payments: "Real-time Transactions",
      btn_all_payments: "All Payments",
      checkin_card_title: "Smart Check-In",
      checkin_card_desc: "Ensure payment is settled to receive unit node access.",
      wishlist_title: "Asset Curation (Planning Hub)",
      wishlist_desc: "Curate properties and compare technical specs.",
      btn_compare: "Compare",
      btn_back_grid: "Back to Grid",
      comparison_matrix: "Comparison Matrix",
      reset_compare: "Reset Comparison",
      price_pulse: "Price Pulse",
      support_title: "Support & Help Center",
      support_desc: "Find assistance and operational guides.",
      faq_title: "Knowledge Hub (FAQ)",
      guide_title: "User Guides",
      contact_title: "Contact Support",
      contact_desc: "Our operational control center is live 24/7.",
      complaint_list: "Complaint Registry",
      btn_new_complaint: "Lodge New",
      modal_complaint_title: "Formal Complaint Service",
      modal_complaint_desc: "Lodge complaints regarding service quality.",
      form_subject: "Issue Subject",
      form_detail: "Chronological Detail",
      form_object: "Select Complaint Object",
      maintenance_title: "Maintenance Tickets",
      review_history: "Review History",
      btn_lodge: "Dispatch to Admin Node",
      empty_complaints: "No active complaints found"
    }
  }[language];

  // Support & Help Center States
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([
    { id: 'cmp-101', guestId: user.id, businessId: 'b1', subject: language === 'id' ? 'Keterlambatan Pengembalian Deposit' : 'Deposit Refund Delay', message: language === 'id' ? 'Sudah 3 hari sejak check-out namun deposit belum kembali.' : 'It has been 3 days since check-out but deposit not received.', status: 'pending', createdAt: '2024-12-28' }
  ]);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const faqData = useMemo(() => [
    { 
      id: 'q1', 
      q: language === 'id' ? 'Bagaimana cara melakukan pembatalan?' : 'How do I perform a cancellation?', 
      a: language === 'id' ? 'Anda dapat membatalkan pesanan melalui menu "Daftar Reservasi".' : 'You can cancel your order via the "My Bookings" menu.' 
    },
    { 
      id: 'q2', 
      q: language === 'id' ? 'Kapan saya mendapatkan kode akses unit?' : 'When will I get the unit access code?', 
      a: language === 'id' ? 'Kode akses akan aktif setelah pembayaran diverifikasi.' : 'The access code will be activated once payment is verified.' 
    },
  ], [language]);

  const guideData = useMemo(() => [
    { title: language === 'id' ? 'Check-in Digital' : 'Digital Check-in', icon: 'fa-mobile-screen-button', desc: language === 'id' ? 'Panduan verifikasi ID.' : 'ID verification guide.' },
    { title: language === 'id' ? 'Keamanan' : 'Security', icon: 'fa-shield-halved', desc: language === 'id' ? 'Protokol transaksi aman.' : 'Secure transaction protocol.' },
  ], [language]);

  // Wishlist & Planning States
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<Set<string>>(new Set(['b1']));
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Messaging Hub State
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c1',
      businessId: 'b1',
      lastMessage: language === 'id' ? 'Tentu, handuk tambahan akan segera dikirim.' : 'Sure, extra towels are on the way.',
      time: '10:45 AM',
      unreadCount: 1,
      messages: [
        { id: 'm1', senderId: 'u4', text: 'Halo, apakah saya bisa minta handuk tambahan?', timestamp: '10:30 AM', isRead: true },
        { id: 'm2', senderId: 'b1', text: 'Tentu, handuk tambahan akan segera dikirim.', timestamp: '10:45 AM', isRead: false },
      ]
    }
  ]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(conversations[0].id);
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Control State for Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isTransDetailOpen, setIsTransDetailOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userReviews, setUserReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.guestId === user.id));
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Issue Reporting (Tickets) State
  const [userTickets, setUserTickets] = useState<MaintenanceTicket[]>([
    { id: 't-1', unitId: 'un1', issue: 'Wifi Signal Weak in Bedroom', priority: 'medium', status: 'resolved', reportedBy: user.id, createdAt: '2024-12-25' },
  ]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Identity States
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'Chrome on MacOS (This device)', location: 'Banda Aceh', status: 'Active Now', current: true },
  ]);

  // Activity State
  const [activities, setActivities] = useState<UserActivity[]>([
    { id: 'a1', action: language === 'id' ? 'Daftar Reservasi Dibuat' : 'Reservation Created', target: 'Grand Seulanga Hotel', time: '2h ago', icon: 'fa-calendar-plus', color: 'text-indigo-600' },
  ]);

  // Profile Form States
  const [profileName, setProfileName] = useState(user.name || '');
  const [profilePhone, setProfilePhone] = useState(user.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatId, conversations]);

  const wishlistItems = MOCK_BUSINESSES.filter(b => user.wishlist?.includes(b.id));
  const myInquiries = MOCK_INQUIRIES.filter(i => i.guestId === user.id);
  
  // Split Bookings for Control Hub
  const activeBookings = useMemo(() => userBookings.filter(b => 
    b.status === BookingStatus.PENDING || 
    b.status === BookingStatus.CONFIRMED || 
    b.status === BookingStatus.CHECKED_IN
  ), [userBookings]);

  const totalUnreadMessages = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  // Handlers
  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      guestId: user.id,
      businessId: formData.get('businessId') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUserComplaints(prev => [newComplaint, ...prev]);
    setIsComplaintModalOpen(false);
    alert(language === 'id' ? 'Pengaduan diajukan ke governance node.' : 'Complaint lodged to governance node.');
  };

  const toggleCompare = (id: string) => {
    setComparingIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;
    const newMessage: ChatMessage = { id: `m-${Date.now()}`, senderId: user.id, text: messageInput, timestamp: 'Just now', isRead: true };
    setConversations(prev => prev.map(conv => conv.id === selectedChatId ? { ...conv, lastMessage: messageInput, messages: [...conv.messages, newMessage] } : conv));
    setMessageInput('');
  };

  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newTicket: MaintenanceTicket = {
      id: `tk-${Date.now()}`,
      unitId: formData.get('unitId') as string,
      issue: formData.get('issue') as string,
      priority: 'medium',
      status: 'open',
      reportedBy: user.id,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUserTickets(prev => [newTicket, ...prev]);
    setIsTicketModalOpen(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName, phoneNumber: profilePhone });
    setIsSaving(false);
  };

  const renderOverview = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{d.activity}</h2>
                <p className="text-slate-400 text-sm font-medium">{d.welcome}, {user.name}.</p>
             </div>
             <div className="relative w-full md:w-[400px]">
                <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400"></i>
                <input 
                  type="text" 
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder={d.search_p} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
                />
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: d.stat_upcoming, value: userBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, icon: 'fa-calendar-check', color: 'text-indigo-600' },
            { label: d.stat_messages, value: totalUnreadMessages, icon: 'fa-comment-dots', color: 'text-amber-600' },
            { label: d.stat_saved, value: wishlistItems.length, icon: 'fa-heart', color: 'text-rose-600' },
            { label: d.stat_inquiries, value: myInquiries.filter(i => i.status !== 'closed').length, icon: 'fa-message', color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${stat.icon} text-xl`}></i>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          ))}
       </div>

       <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{d.section_payments}</h3>
                   <button onClick={() => setActiveTab('payments')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">{d.btn_all_payments}</button>
                </div>
                <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
                   {userBookings.slice(0, 3).map(bk => {
                     const biz = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
                     return (
                       <div key={bk.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-6">
                             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">
                                <i className="fas fa-file-invoice-dollar"></i>
                             </div>
                             <div>
                                <p className="font-black text-slate-900 mb-1 uppercase text-sm">{biz?.name}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rp {bk.totalPrice.toLocaleString()}</p>
                                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                   <p className="text-[10px] font-black text-indigo-600">REF: {bk.id}</p>
                                </div>
                             </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             bk.verifiedPayment ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>{bk.verifiedPayment ? 'SETTLED' : 'PENDING'}</span>
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl mb-8">
                      <i className="fas fa-ticket-simple"></i>
                   </div>
                   <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase leading-none">{d.checkin_card_title}</h3>
                   <p className="text-indigo-200/60 font-medium mb-10 text-sm leading-relaxed">{d.checkin_card_desc}</p>
                   <div className="p-8 bg-white rounded-[40px] flex items-center justify-center shadow-2xl">
                      <i className="fas fa-qrcode text-7xl text-slate-900"></i>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{d.faq_title}</h3>
                   <p className="text-slate-400 text-sm font-medium">{language === 'id' ? 'Solusi cepat untuk kendala Anda.' : 'Quick solutions for your concerns.'}</p>
                </div>
                <div className="space-y-4">
                   {faqData.map(faq => (
                     <div key={faq.id} className="border border-slate-100 rounded-[32px] overflow-hidden">
                        <button 
                           onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                           className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all text-left"
                        >
                           <span className="font-black text-slate-800 text-sm uppercase">{faq.q}</span>
                           <i className={`fas fa-chevron-down text-xs transition-transform ${activeFaq === faq.id ? 'rotate-180' : ''}`}></i>
                        </button>
                        {activeFaq === faq.id && (
                           <div className="p-6 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                              <p className="text-slate-600 text-sm font-medium leading-relaxed">{faq.a}</p>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase px-2">{d.guide_title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {guideData.map(guide => (
                      <div key={guide.title} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                         <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <i className={`fas ${guide.icon}`}></i>
                         </div>
                         <h4 className="font-black text-slate-900 uppercase text-sm mb-2">{guide.title}</h4>
                         <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{guide.desc}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h4 className="font-black text-slate-900 uppercase text-sm px-2">{d.maintenance_title}</h4>
                   <div className="space-y-4">
                      {userTickets.map(tk => (
                        <div key={tk.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between">
                           <div>
                              <p className="text-xs font-black text-slate-800 uppercase truncate max-w-[150px]">{tk.issue}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">#{tk.id} • {tk.status}</p>
                           </div>
                           <span className={`w-2 h-2 rounded-full ${tk.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <h4 className="font-black text-slate-900 uppercase text-sm px-2">{d.review_history}</h4>
                   <div className="space-y-4">
                      {userReviews.slice(0, 2).map(rv => (
                        <div key={rv.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                           <div className="flex text-amber-400 text-[10px] mb-2">
                              {[...Array(rv.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                           </div>
                           <p className="text-[10px] text-slate-600 font-medium italic truncate">"{rv.comment}"</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-10">
             <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl mb-8">
                      <i className="fas fa-headset"></i>
                   </div>
                   <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase leading-none">{d.contact_title}</h3>
                   <p className="text-indigo-200/60 font-medium mb-12 text-sm leading-relaxed">{d.contact_desc}</p>
                   <div className="space-y-4">
                      <button onClick={() => window.open('https://wa.me/6281234567890')} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-4 transition-all">
                         <i className="fab fa-whatsapp text-emerald-400"></i>
                         <span className="text-[11px] font-black uppercase tracking-widest">WhatsApp</span>
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-xl font-black text-slate-900 uppercase">{d.complaint_list}</h4>
                   <button onClick={() => setIsComplaintModalOpen(true)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><i className="fas fa-plus"></i></button>
                </div>
                <div className="space-y-4">
                   {userComplaints.map(cmp => (
                      <div key={cmp.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-3 group hover:border-rose-200 transition-all">
                         <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               cmp.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>{cmp.status}</span>
                            <span className="text-[9px] font-bold text-slate-300">{cmp.createdAt}</span>
                         </div>
                         <p className="font-black text-slate-800 text-xs uppercase truncate">{cmp.subject}</p>
                         <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{cmp.message}</p>
                      </div>
                   ))}
                   {userComplaints.length === 0 && (
                      <p className="text-center py-10 text-slate-300 font-bold uppercase text-[9px] tracking-widest italic">{d.empty_complaints}</p>
                   )}
                </div>
             </div>
          </div>
       </div>

       {isComplaintModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsComplaintModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{d.modal_complaint_title}</h3>
                   <p className="text-slate-400 text-sm font-medium">{d.modal_complaint_desc}</p>
                </div>
                <form onSubmit={handleLodgeComplaint} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{d.form_object}</label>
                      <select name="businessId" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none">
                         {MOCK_BUSINESSES.map(b => ( <option key={b.id} value={b.id}>{b.name}</option> ))}
                         <option value="platform">Platform Seulanga</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{d.form_subject}</label>
                      <input name="subject" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 ring-rose-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{d.form_detail}</label>
                      <textarea name="message" required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold outline-none resize-none focus:ring-4 ring-rose-50" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all">{d.btn_lodge}</button>
                </form>
             </div>
          </div>
       )}
    </div>
  );

  const renderWishlist = () => {
    const compareItems = MOCK_BUSINESSES.filter(b => comparingIds.includes(b.id));

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{d.wishlist_title}</h2>
            <p className="text-slate-400 text-sm font-medium">{d.wishlist_desc}</p>
          </div>
          <div className="flex gap-4">
             {comparingIds.length > 0 && (
               <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 ${
                  isCompareMode ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
               >
                 <i className={`fas ${isCompareMode ? 'fa-table-list' : 'fa-code-compare'}`}></i>
                 {isCompareMode ? d.btn_back_grid : `${d.btn_compare} (${comparingIds.length}) Node`}
               </button>
             )}
          </div>
        </div>

        {isCompareMode ? (
          <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-900 uppercase">{d.comparison_matrix}</h3>
                <button onClick={() => setComparingIds([])} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">{d.reset_compare}</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter</th>
                         {compareItems.map(item => (
                           <th key={item.id} className="px-12 py-8 text-center min-w-[300px]">
                              <img src={item.images[0]} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border-4 border-white shadow-md" />
                              <p className="font-black text-slate-900 uppercase text-sm">{item.name}</p>
                           </th>
                         ))}
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      <tr>
                         <td className="px-12 py-6 text-xs font-black text-slate-400 uppercase">Category Hub</td>
                         {compareItems.map(item => <td key={item.id} className="px-12 py-6 text-center font-bold text-indigo-600 text-sm">{item.category}</td>)}
                      </tr>
                      <tr>
                         <td className="px-12 py-8"></td>
                         {compareItems.map(item => (
                           <td key={item.id} className="px-12 py-8 text-center">
                              <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Lihat Detail Node</button>
                           </td>
                         ))}
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {wishlistItems.map(item => {
               const hasAlert = priceAlerts.has(item.id);
               return (
                 <div key={item.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700">
                    <div className="h-64 relative overflow-hidden">
                       <img src={item.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                       <div className="absolute top-6 left-6">
                          <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-lg">{item.category}</span>
                       </div>
                       <div className="absolute top-6 right-6">
                          <button 
                            onClick={() => toggleCompare(item.id)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                              comparingIds.includes(item.id) ? 'bg-indigo-600 text-white' : 'bg-white/40 backdrop-blur-md text-white hover:bg-white hover:text-indigo-600'
                            }`}
                          >
                             <i className="fas fa-code-compare"></i>
                          </button>
                       </div>
                    </div>
                    <div className="p-10 space-y-8">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">★ {item.rating}</div>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Price Node</span>
                             <span className="text-lg font-black text-slate-900">Rp 1.5M</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{d.price_pulse}</span>
                             <button onClick={() => setPriceAlerts(p => { const n = new Set(p); if(n.has(item.id)) n.delete(item.id); else n.add(item.id); return n; })} className={`w-10 h-5 rounded-full relative transition-all ${hasAlert ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasAlert ? 'right-0.5' : 'left-0.5'}`}></div></button>
                          </div>
                       </div>
                       <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Check Availability</button>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    const activeConv = conversations.find(c => c.id === selectedChatId);
    const activeBiz = MOCK_BUSINESSES.find(b => b.id === activeConv?.businessId);
    return (
      <div className="h-[calc(100vh-200px)] flex gap-8 animate-fade-up">
        <div className="w-96 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{d.stat_messages}</h3>
              <i className="fas fa-message text-indigo-200 text-xl"></i>
           </div>
           <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
              {conversations.map(conv => {
                 const biz = MOCK_BUSINESSES.find(b => b.id === conv.businessId);
                 return (
                    <button key={conv.id} onClick={() => setSelectedChatId(conv.id)} className={`w-full p-6 rounded-[32px] transition-all text-left flex gap-5 items-center relative ${selectedChatId === conv.id ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-900'}`}>
                       <img src={biz?.images[0]} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/10" />
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-sm uppercase truncate">{biz?.name}</p>
                          <p className={`text-[11px] truncate font-medium ${selectedChatId === conv.id ? 'text-indigo-100' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                       </div>
                    </button>
                 );
              })}
           </div>
        </div>
        <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
           {activeConv && activeBiz ? (
              <>
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center gap-5">
                       <img src={activeBiz.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                       <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{activeBiz.name}</h4>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                    {activeConv.messages.map(msg => (
                       <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-6 rounded-[32px] text-sm font-medium ${msg.senderId === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>
                 <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                       <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold outline-none" />
                       <button type="submit" className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all"><i className="fas fa-paper-plane"></i></button>
                    </form>
                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center"><i className="fas fa-comments text-4xl text-slate-200 mb-4"></i><h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{language === 'id' ? 'Pusat Komunikasi' : 'Comm Hub'}</h4></div>
           )}
        </div>
      </div>
    );
  };

  const renderBookings = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{language === 'id' ? 'Daftar Reservasi' : 'Booking List'}</h3>
          <div className="grid grid-cols-1 gap-6">
             {activeBookings.map(bk => {
                const biz = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
                return (
                  <div key={bk.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row group hover:shadow-xl transition-all">
                     <div className="lg:w-72 h-64 lg:h-auto overflow-hidden relative">
                        <img src={biz?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     </div>
                     <div className="flex-1 p-10 flex flex-col justify-between space-y-8">
                        <div>
                           <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">{biz?.name}</h4>
                           <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase border border-indigo-100">{bk.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Check-In</p><p className="text-sm font-black text-slate-800">{bk.checkIn}</p></div>
                           <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total</p><p className="text-sm font-black text-indigo-600">Rp {bk.totalPrice.toLocaleString()}</p></div>
                        </div>
                        <button onClick={() => { setSelectedBooking(bk); setIsTransDetailOpen(true); }} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Detail Transaksi</button>
                     </div>
                  </div>
                );
             })}
          </div>
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center pb-12 border-b border-slate-50">
             <img src={user.avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 shadow-2xl mb-6" />
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{user.name}</h3>
             <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">Identity {user.verificationStatus}</span>
          </div>
          <form onSubmit={handleUpdateProfile} className="mt-12 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{language === 'id' ? 'Nama Identitas' : 'Identity Name'}</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[32px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
             </div>
             <button disabled={isSaving} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">
                {isSaving ? '...' : (language === 'id' ? 'Simpan Perubahan' : 'Save Changes')}
             </button>
          </form>
       </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'bookings': return renderBookings();
      case 'messages': return renderMessages();
      case 'wishlist': return renderWishlist();
      case 'support': return renderSupport();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
       <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
          <div className="h-24 flex items-center px-10 border-b border-slate-50">
             <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100"><i className="fas fa-fingerprint"></i></div>
                <div>
                   <span className="font-black text-lg tracking-tight text-slate-900 block leading-none uppercase">Guest Hub</span>
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Ecosystem Member</span>
                </div>
             </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
             {[
               { id: 'overview', label: language === 'id' ? 'Pusat Aktivitas' : 'Activity Hub', icon: 'fa-gauge-high' },
               { id: 'bookings', label: language === 'id' ? 'Daftar Reservasi' : 'Bookings', icon: 'fa-calendar-check' },
               { id: 'messages', label: language === 'id' ? 'Pusat Komunikasi' : 'Messaging', icon: 'fa-comment-dots', count: totalUnreadMessages },
               { id: 'wishlist', label: language === 'id' ? 'Wishlist & Planning' : 'Planning Hub', icon: 'fa-heart' },
               { id: 'support', label: language === 'id' ? 'Pusat Bantuan' : 'Support Hub', icon: 'fa-circle-question' },
               { id: 'profile', label: language === 'id' ? 'Profil Identitas' : 'Identity Hub', icon: 'fa-user-shield' },
             ].map(item => (
               <button key={item.id} onClick={() => setActiveTab(item.id as GuestTab)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <i className={`fas ${item.icon} text-lg w-6`}></i>
                  {item.label}
               </button>
             ))}
          </nav>
       </aside>

       <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
          <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-40">
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeTab} Matrix</h1>
          </header>

          <div className="p-12 max-w-[1400px] mx-auto">
             {renderTabContent()}
          </div>
       </main>

       {isTransDetailOpen && selectedBooking && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-2xl relative overflow-hidden">
               <button onClick={() => setIsTransDetailOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12">Detail Transaksi</h3>
               <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase">Total Settlement</span>
                  <span className="text-3xl font-black text-indigo-600">Rp {selectedBooking.totalPrice.toLocaleString()}</span>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
