
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
}

const MOCK_INQUIRIES: Inquiry[] = [
  { id: 'inq1', guestId: 'u4', businessId: 'b1', type: 'visit', status: 'responded', message: 'I would like to visit the unit tomorrow at 10 AM.', createdAt: '2024-12-28' },
];

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ currentUser, onUpdateUser, initialTab = 'overview', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<GuestTab>(initialTab);
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('personal');
  const [quickSearch, setQuickSearch] = useState('');
  
  // Local state for interactive status updates in demo
  const user = currentUser || MOCK_USERS.find(u => u.id === 'u4')!;
  const [userBookings, setUserBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.guestId === user.id));

  // Support & Help Center States
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([
    { id: 'cmp-101', guestId: user.id, businessId: 'b1', subject: 'Keterlambatan Pengembalian Deposit', message: 'Sudah 3 hari sejak check-out namun deposit belum kembali.', status: 'pending', createdAt: '2024-12-28' }
  ]);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const faqData = [
    { id: 'q1', q: 'Bagaimana cara melakukan pembatalan?', a: 'Anda dapat membatalkan pesanan melalui menu "Daftar Reservasi". Pastikan melakukan pembatalan minimal 48 jam sebelum check-in untuk pengembalian dana penuh.' },
    { id: 'q2', q: 'Kapan saya mendapatkan kode akses unit?', a: 'Kode akses atau Smart Key akan aktif secara otomatis di Dashboard Anda setelah status pembayaran diverifikasi (Settled) oleh pihak treasury.' },
    { id: 'q3', q: 'Metode pembayaran apa saja yang didukung?', a: 'Saat ini kami mendukung Transfer Bank manual, Virtual Account, dan saldo internal Seulanga.' },
  ];

  const guideData = [
    { title: 'Check-in Digital', icon: 'fa-mobile-screen-button', desc: 'Panduan lengkap verifikasi ID hingga masuk unit.' },
    { title: 'Keamanan Transaksi', icon: 'fa-shield-halved', desc: 'Cara memastikan pembayaran Anda aman dan terverifikasi.' },
    { title: 'Fitur Perbandingan', icon: 'fa-code-compare', desc: 'Gunakan matrix untuk memilih properti terbaik.' },
  ];

  // Wishlist & Planning States
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<Set<string>>(new Set(['b1']));
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Messaging Hub State
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c1',
      businessId: 'b1',
      lastMessage: 'Tentu, handuk tambahan akan segera dikirim.',
      time: '10:45 AM',
      unreadCount: 1,
      messages: [
        { id: 'm1', senderId: 'u4', text: 'Halo, apakah saya bisa minta handuk tambahan?', timestamp: '10:30 AM', isRead: true },
        { id: 'm2', senderId: 'b1', text: 'Tentu, handuk tambahan akan segera dikirim.', timestamp: '10:45 AM', isRead: false },
      ]
    },
    {
      id: 'c2',
      businessId: 'b2',
      lastMessage: 'Terima kasih atas reservasi Anda.',
      time: 'Yesterday',
      unreadCount: 0,
      messages: [
        { id: 'm3', senderId: 'b2', text: 'Terima kasih atas reservasi Anda. Kami menunggu kedatangan Anda.', timestamp: 'Yesterday', isRead: true },
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

  // Payment States
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // Identity States
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'Chrome on MacOS (This device)', location: 'Banda Aceh', status: 'Active Now', current: true },
    { id: 's2', device: 'Safari on iPhone 15', location: 'Jakarta', status: 'Active 2h ago', current: false },
    { id: 's3', device: 'Edge on Windows 11', location: 'Medan', status: 'Active yesterday', current: false },
  ]);

  // Activity State
  const [activities, setActivities] = useState<UserActivity[]>([
    { id: 'a1', action: 'Daftar Reservasi Dibuat', target: 'Grand Seulanga Hotel', time: '2 jam yang lalu', icon: 'fa-calendar-plus', color: 'text-indigo-600' },
    { id: 'a2', action: 'Wishlist Diperbarui', target: 'Pine Hill Guesthouse', time: '5 jam yang lalu', icon: 'fa-heart', color: 'text-rose-500' },
    { id: 'a3', action: 'Profil Diperbarui', target: 'Identitas Digital', time: 'Kemarin', icon: 'fa-user-pen', color: 'text-emerald-500' },
    { id: 'a4', action: 'Pencarian Properti', target: 'Kategori: Hotel', time: '2 hari yang lalu', icon: 'fa-magnifying-glass', color: 'text-slate-400' },
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

  // Support Actions
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
    alert('Pengaduan formal telah diajukan ke governance node. Kami akan meninjau laporan Anda maksimal dalam 24 jam.');
  };

  // Wishlist Actions
  const toggleCompare = (id: string) => {
    setComparingIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) {
        alert("Batas maksimal komparasi adalah 3 properti.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const togglePriceAlert = (id: string) => {
    setPriceAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        alert(`Price Pulse diaktifkan untuk ${MOCK_BUSINESSES.find(b => b.id === id)?.name}. Kami akan memberitahu Anda jika ada perubahan harga signifikan.`);
      }
      return next;
    });
  };

  // Messaging Actions
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      text: messageInput,
      timestamp: 'Just now',
      isRead: true
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedChatId 
        ? { ...conv, lastMessage: messageInput, time: 'Just now', messages: [...conv.messages, newMessage] } 
        : conv
    ));
    setMessageInput('');
  };

  const handleAttachFile = () => {
    const fakeAttachment = "image_reference_01.jpg";
    const newMessage: ChatMessage = {
      id: `m-file-${Date.now()}`,
      senderId: user.id,
      text: 'Mengirim lampiran...',
      attachment: fakeAttachment,
      timestamp: 'Just now',
      isRead: true
    };
    if (!selectedChatId) return;
    setConversations(prev => prev.map(conv => 
      conv.id === selectedChatId 
        ? { ...conv, lastMessage: 'Sent an attachment', time: 'Just now', messages: [...conv.messages, newMessage] } 
        : conv
    ));
  };

  // Control Actions
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    setUserBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: BookingStatus.CANCELLED } : b));
    setActivities(prev => [{ id: `act-${Date.now()}`, action: 'Permintaan Pembatalan', target: selectedBooking.id, time: 'Baru saja', icon: 'fa-ban', color: 'text-rose-500' }, ...prev]);
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
    alert('Permintaan pembatalan telah diproses oleh treasury node.');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
       setUserReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, rating, comment } : r));
       alert('Ulasan telah diperbarui.');
       setEditingReview(null);
    } else if (selectedBooking) {
       const newReview: Review = {
         id: `rv-${Date.now()}`,
         businessId: selectedBooking.businessId,
         guestId: user.id,
         guestName: user.name,
         rating,
         comment,
         status: 'pending',
         createdAt: new Date().toISOString().split('T')[0]
       };
       setUserReviews(prev => [newReview, ...prev]);
       alert('Ulasan Anda telah dipublikasikan. Terima kasih telah berkontribusi pada reputasi ekosistem.');
    }
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
    setComment('');
    setRating(5);
  };

  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newTicket: MaintenanceTicket = {
      id: `tk-${Date.now()}`,
      unitId: formData.get('unitId') as string,
      issue: formData.get('issue') as string,
      priority: formData.get('priority') as any,
      status: 'open',
      reportedBy: user.id,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUserTickets(prev => [newTicket, ...prev]);
    setIsTicketModalOpen(false);
    alert('Laporan masalah telah dikirim. Staf operasional akan segera merespons.');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName, phoneNumber: profilePhone });
    setIsSaving(false);
    alert('Identity Hub updated successfully.');
  };

  const handleLogoutOtherDevices = () => {
    if (confirm("Keluarkan akun dari seluruh perangkat lain?")) {
      setSessions(prev => prev.filter(s => s.current));
      alert("Protokol logout global berhasil dieksekusi.");
    }
  };

  const handleUploadIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsVerifying(false);
    onUpdateUser({ verificationStatus: VerificationStatus.PENDING });
    alert("Dokumen Identitas diunggah. Node verifikasi akan segera melakukan audit.");
  };

  const renderOverview = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Pusat Aktivitas</h2>
                <p className="text-slate-400 text-sm font-medium">Selamat datang kembali, {user.name}. Apa yang ingin Anda cari hari ini?</p>
             </div>
             <div className="relative w-full md:w-[400px]">
                <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400"></i>
                <input 
                  type="text" 
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Cari hotel, villa, atau homestay..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
                />
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Upcoming Stays', value: userBookings.filter(b => b.status === BookingStatus.CONFIRMED).length, icon: 'fa-calendar-check', color: 'text-indigo-600' },
            { label: 'Messages', value: totalUnreadMessages, icon: 'fa-comment-dots', color: 'text-amber-600' },
            { label: 'Saved Items', value: wishlistItems.length, icon: 'fa-heart', color: 'text-rose-600' },
            { label: 'Active Inquiries', value: myInquiries.filter(i => i.status !== 'closed').length, icon: 'fa-message', color: 'text-emerald-600' },
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
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-12 animate-fade-up">
       {/* Support Matrix Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* FAQ & Knowledge Hub */}
          <div className="lg:col-span-2 space-y-10">
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Knowledge Hub (FAQ)</h3>
                   <p className="text-slate-400 text-sm font-medium">Temukan solusi cepat untuk kendala umum Anda.</p>
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase px-2">Panduan Pengguna</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

             {/* Existing Maintenance Tickets & Reviews Sections preserved here */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                      <h4 className="font-black text-slate-900 uppercase text-sm">Tiket Maintenance</h4>
                      <button onClick={() => setIsTicketModalOpen(true)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Lapor Unit</button>
                   </div>
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
                   <div className="flex justify-between items-center px-2">
                      <h4 className="font-black text-slate-900 uppercase text-sm">Riwayat Ulasan</h4>
                   </div>
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

          {/* Contact & Complaints Column */}
          <div className="space-y-10">
             <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                   <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl mb-8 shadow-xl">
                      <i className="fas fa-headset"></i>
                   </div>
                   <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase leading-none">Kontak <br/> Bantuan</h3>
                   <p className="text-indigo-200/60 font-medium mb-12 text-sm leading-relaxed">Pusat kendali operasional kami siap membantu Anda 24/7 melalui berbagai jalur.</p>
                   
                   <div className="space-y-4">
                      <button onClick={() => window.open('https://wa.me/6281234567890')} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-4 transition-all">
                         <i className="fab fa-whatsapp text-emerald-400"></i>
                         <span className="text-[11px] font-black uppercase tracking-widest">WhatsApp Support</span>
                      </button>
                      <button onClick={() => window.location.href = 'mailto:support@seulanga.com'} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-4 transition-all">
                         <i className="far fa-envelope text-indigo-400"></i>
                         <span className="text-[11px] font-black uppercase tracking-widest">Email Ticketing</span>
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-xl font-black text-slate-900 uppercase">Daftar Pengaduan</h4>
                   <button onClick={() => setIsComplaintModalOpen(true)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><i className="fas fa-plus"></i></button>
                </div>
                <div className="space-y-4">
                   {userComplaints.map(cmp => (
                      <div key={cmp.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-3 hover:border-rose-200 transition-all group">
                         <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                               cmp.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>{cmp.status}</span>
                            <span className="text-[9px] font-bold text-slate-300">{cmp.createdAt}</span>
                         </div>
                         <p className="font-black text-slate-800 text-xs uppercase truncate">{cmp.subject}</p>
                         <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{cmp.message}</p>
                         <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Cek Detail →</button>
                      </div>
                   ))}
                   {userComplaints.length === 0 && (
                      <p className="text-center py-10 text-slate-300 font-bold uppercase text-[9px] tracking-widest italic">Tidak ada pengaduan aktif</p>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Complaint Submission Modal */}
       {isComplaintModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsComplaintModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Layanan Pengaduan Formal</h3>
                   <p className="text-slate-400 text-sm font-medium">Sampaikan keluhan terkait kualitas layanan atau sengketa lainnya.</p>
                </div>
                <form onSubmit={handleLodgeComplaint} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Objek Pengaduan</label>
                      <select name="businessId" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none">
                         {MOCK_BUSINESSES.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                         ))}
                         <option value="platform">Platform Seulanga (Layanan Pusat)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjek Masalah</label>
                      <input name="subject" required placeholder="Contoh: Masalah Kebersihan, Masalah Billing..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 ring-rose-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detail Kronologis</label>
                      <textarea name="message" required rows={4} placeholder="Jelaskan secara detail apa yang terjadi..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold text-slate-900 outline-none resize-none focus:ring-4 ring-rose-50" />
                   </div>
                   <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                      <p className="text-[9px] font-bold text-rose-700 leading-relaxed italic">Catatan: Setiap pengaduan akan direkam secara permanen dalam audit trail demi menjamin transparansi penyelesaian.</p>
                   </div>
                   <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">Kirim Pengaduan Ke Admin</button>
                </form>
             </div>
          </div>
       )}

       {/* Preservation of existing Maintenance Modal */}
       {isTicketModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsTicketModalOpen(false)} className="absolute top-10 right-10 w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Lapor Masalah Unit</h3>
                   <p className="text-slate-400 text-sm font-medium">Beri tahu staf kami jika ada kendala teknis di unit Anda.</p>
                </div>
                <form onSubmit={handleReportProblem} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Unit Terkait</label>
                      <select name="unitId" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none">
                         {userBookings.filter(b => b.status === BookingStatus.CHECKED_IN).map(b => (
                            <option key={b.unitId} value={b.unitId}>{MOCK_UNITS.find(u => u.id === b.unitId)?.name}</option>
                         ))}
                         <option value="general">Lainnya (Masalah Umum)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Kendala</label>
                      <textarea required name="issue" rows={4} placeholder="Jelaskan kendala teknis (Contoh: Lampu mati, AC tidak dingin)..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none resize-none" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Maintenance Request</button>
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Simpanan Asset (Planning Hub)</h2>
            <p className="text-slate-400 text-sm font-medium">Kurasi properti pilihan dan bandingkan spesifikasi sebelum reservasi.</p>
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
                 {isCompareMode ? 'Kembali Ke Grid' : `Bandingkan (${comparingIds.length}) Node`}
               </button>
             )}
          </div>
        </div>

        {isCompareMode ? (
          <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
             <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Comparison Matrix</h3>
                <button onClick={() => setComparingIds([])} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Reset Perbandingan</button>
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
                         <td className="px-12 py-6 text-xs font-black text-slate-400 uppercase">Trust Rating</td>
                         {compareItems.map(item => <td key={item.id} className="px-12 py-6 text-center"><span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-black text-xs">★ {item.rating}</span></td>)}
                      </tr>
                      <tr>
                         <td className="px-12 py-6 text-xs font-black text-slate-400 uppercase">Asset Tags</td>
                         {compareItems.map(item => <td key={item.id} className="px-12 py-6 text-center text-xs text-slate-500 font-medium">{item.tags?.join(', ')}</td>)}
                      </tr>
                      <tr>
                         <td className="px-12 py-6 text-xs font-black text-slate-400 uppercase">Location Node</td>
                         {compareItems.map(item => <td key={item.id} className="px-12 py-6 text-center text-xs font-bold text-slate-700">{item.address}</td>)}
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
                       <div>
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                             <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">★ {item.rating}</div>
                          </div>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase">
                             <i className="fas fa-location-dot text-indigo-400"></i>
                             {item.address.split(',')[0]}
                          </p>
                       </div>

                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                          <div className="flex justify-between items-center">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Entry Price Node</span>
                                <div className="flex items-center gap-2">
                                   <span className="text-lg font-black text-slate-900">Rp 1.5M</span>
                                   <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><i className="fas fa-caret-down"></i> -5%</span>
                                </div>
                             </div>
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Price Pulse</span>
                                <button 
                                  onClick={() => togglePriceAlert(item.id)}
                                  className={`w-10 h-5 rounded-full relative transition-all ${hasAlert ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                   <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasAlert ? 'right-0.5' : 'left-0.5'}`}></div>
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-3">
                          <button className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Check Availability</button>
                          <button className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><i className="fas fa-trash-can"></i></button>
                       </div>
                    </div>
                 </div>
               );
             })}
             {wishlistItems.length === 0 && (
               <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px]">
                  <i className="fas fa-heart-crack text-slate-100 text-6xl mb-6"></i>
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Belum ada aset yang Anda simpan</p>
                  <button onClick={() => onNavigate('explore')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Eksplorasi Properti</button>
               </div>
             )}
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
        {/* Conversation List preserved here */}
        <div className="w-96 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Messages</h3>
              <i className="fas fa-message text-indigo-200 text-xl"></i>
           </div>
           <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
              {conversations.map(conv => {
                 const biz = MOCK_BUSINESSES.find(b => b.id === conv.businessId);
                 return (
                    <button 
                       key={conv.id}
                       onClick={() => {
                          setSelectedChatId(conv.id);
                          setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                       }}
                       className={`w-full p-6 rounded-[32px] transition-all text-left flex gap-5 items-center relative ${
                          selectedChatId === conv.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-900'
                       }`}
                    >
                       <img src={biz?.images[0]} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/10" />
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                             <p className="font-black text-sm uppercase truncate">{biz?.name}</p>
                             <span className={`text-[8px] font-bold uppercase ${selectedChatId === conv.id ? 'text-indigo-200' : 'text-slate-300'}`}>{conv.time}</span>
                          </div>
                          <p className={`text-[11px] truncate font-medium ${selectedChatId === conv.id ? 'text-indigo-100' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                       </div>
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Chat Window preserved here */}
        <div className="flex-1 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
           {activeConv && activeBiz ? (
              <>
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center gap-5">
                       <img src={activeBiz.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                       <div>
                          <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{activeBiz.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Online</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                    {activeConv.messages.map(msg => (
                       <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] space-y-2 ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                             <div className={`p-6 rounded-[32px] text-sm font-medium shadow-sm ${
                                msg.senderId === user.id 
                                   ? 'bg-indigo-600 text-white rounded-tr-none' 
                                   : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                             }`}>
                                {msg.attachment && (
                                   <div className="mb-4 rounded-2xl overflow-hidden border border-white/20">
                                      <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400" className="w-full h-auto" />
                                      <div className="bg-black/20 p-2 text-center text-[10px] font-black uppercase tracking-widest">Attached Visual Node</div>
                                   </div>
                                )}
                                {msg.text}
                             </div>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">{msg.timestamp}</p>
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>

                 <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                       <button 
                          type="button" 
                          onClick={handleAttachFile}
                          className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                       >
                          <i className="fas fa-plus"></i>
                       </button>
                       <input 
                          type="text" 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type your message..." 
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none transition-all"
                       />
                       <button 
                          type="submit"
                          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                       >
                          <i className="fas fa-paper-plane"></i>
                       </button>
                    </form>
                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-4xl shadow-inner">
                    <i className="fas fa-comments"></i>
                 </div>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Pusat Komunikasi</h4>
              </div>
           )}
        </div>
      </div>
    );
  };

  const renderBookings = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
             <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Pemesanan Aktif</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Upcoming & Active Stays</p>
             </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
             {activeBookings.length > 0 ? activeBookings.map(bk => {
                const biz = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
                const unit = MOCK_UNITS.find(u => u.id === bk.unitId);
                return (
                  <div key={bk.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row group hover:shadow-xl transition-all duration-500">
                     <div className="lg:w-72 h-64 lg:h-auto overflow-hidden relative">
                        <img src={biz?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     </div>
                     <div className="flex-1 p-10 flex flex-col justify-between space-y-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                           <div>
                              <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 group-hover:text-indigo-600 transition-colors">{biz?.name}</h4>
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                 <i className="fas fa-location-dot text-indigo-400"></i>
                                 {biz?.address}
                              </p>
                           </div>
                           <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">{bk.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-50">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Asset</p>
                              <p className="text-sm font-black text-slate-800 uppercase">{unit?.name}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Settlement</p>
                              <p className="text-sm font-black text-indigo-600 uppercase">Rp {bk.totalPrice.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-4">
                           <button onClick={() => { setSelectedBooking(bk); setIsTransDetailOpen(true); }} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Detail Transaksi</button>
                           {(bk.status === BookingStatus.CONFIRMED || bk.status === BookingStatus.PENDING) && (
                             <button onClick={() => { setSelectedBooking(bk); setIsCancelModalOpen(true); }} className="px-8 py-3.5 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">Batalkan Pesanan</button>
                           )}
                        </div>
                     </div>
                  </div>
                );
             }) : (
               <div className="py-20 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                  <i className="far fa-calendar-xmark text-4xl text-slate-200 mb-4"></i>
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Tidak ada pesanan aktif</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up">
       <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -mr-60 -mt-60"></div>
          
          <div className="relative z-10">
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16 pb-12 border-b border-slate-50">
                <div className="flex items-center gap-10">
                   <div className="relative">
                      <img src={user.avatar} className="w-32 h-32 rounded-[40px] object-cover border-8 border-slate-50 shadow-2xl" />
                      <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white"><i className="fas fa-camera"></i></button>
                   </div>
                   <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{user.name}</h3>
                      <div className="flex flex-wrap gap-4 items-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           user.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                         }`}>
                           Identity {user.verificationStatus}
                         </span>
                      </div>
                   </div>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-[28px] border border-slate-200/40 gap-1">
                   {[
                     { id: 'personal', label: 'Data Personal', icon: 'fa-user' },
                     { id: 'verification', label: 'KYC', icon: 'fa-id-card' },
                     { id: 'preferences', label: 'Preferensi', icon: 'fa-sliders' },
                     { id: 'security', label: 'Keamanan', icon: 'fa-shield-halved' }
                   ].map(sub => (
                     <button 
                       key={sub.id}
                       onClick={() => setProfileSubTab(sub.id as ProfileSubTab)}
                       className={`px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                         profileSubTab === sub.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
                       }`}
                     >
                       <i className={`fas ${sub.icon}`}></i>
                       {sub.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="min-h-[500px]">
                {profileSubTab === 'personal' && (
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Display Name</label>
                        <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[32px] px-8 py-5 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none transition-all" />
                     </div>
                     <div className="lg:col-span-2 pt-10 flex justify-end">
                        <button disabled={isSaving} className="px-12 py-5 bg-slate-950 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                           {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                           Save Changes
                        </button>
                     </div>
                  </form>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                <i className="fas fa-wallet"></i>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Rp {userBookings.filter(b => b.verifiedPayment).reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}</h3>
          </div>
       </div>
    </div>
  );

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
               { id: 'overview', label: 'Pusat Aktivitas', icon: 'fa-gauge-high' },
               { id: 'bookings', label: 'Daftar Reservasi', icon: 'fa-calendar-check' },
               { id: 'messages', label: 'Communication Hub', icon: 'fa-comment-dots', count: totalUnreadMessages },
               { id: 'payments', label: 'Keuangan & Bayar', icon: 'fa-money-bill-transfer' },
               { id: 'wishlist', label: 'Wishlist & Planning', icon: 'fa-heart' },
               { id: 'support', label: 'Support & Help Center', icon: 'fa-circle-question' },
               { id: 'profile', label: 'Identity Hub', icon: 'fa-user-shield' },
             ].map(item => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as GuestTab)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
               >
                  <i className={`fas ${item.icon} text-lg w-6`}></i>
                  {item.label}
                  {item.count && item.count > 0 && activeTab !== item.id && (
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{item.count}</span>
                  )}
               </button>
             ))}
          </nav>
       </aside>

       <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
          <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-40">
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{activeTab.replace('-', ' ')} Matrix</h1>
          </header>

          <div className="p-12 max-w-[1400px] mx-auto">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'bookings' && renderBookings()}
             {activeTab === 'wishlist' && renderWishlist()}
             {activeTab === 'messages' && renderMessages()}
             {activeTab === 'payments' && renderPayments()}
             {activeTab === 'support' && renderSupport()}
             {activeTab === 'profile' && renderProfile()}
          </div>
       </main>

       {/* Shared Review Modal */}
       {isReviewModalOpen && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 relative">
               <button onClick={() => { setIsReviewModalOpen(false); setEditingReview(null); }} className="absolute top-10 right-10 w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Kontribusi Reputasi</h3>
               </div>
               <form onSubmit={handleSubmitReview} className="space-y-8">
                  <div className="flex justify-center gap-4 text-3xl">
                     {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setRating(star)} className={`transition-all duration-300 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}>
                           <i className="fas fa-star"></i>
                        </button>
                     ))}
                  </div>
                  <textarea required value={comment} onChange={(e) => setComment(e.target.value)} rows={5} placeholder="Bagikan pengalaman Anda..." className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-6 text-sm font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none" />
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all">Submit Feedback</button>
               </form>
            </div>
         </div>
       )}

       {/* Shared Transaction Detail Modal */}
       {isTransDetailOpen && selectedBooking && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-2xl relative overflow-hidden">
               <button onClick={() => setIsTransDetailOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-12">Detail Transaksi</h3>
               <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                     <span>Layanan Dasar Node</span>
                     <span className="text-slate-900">Rp {selectedBooking.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                     <span className="text-lg font-black text-slate-900 uppercase">Total Settlement</span>
                     <span className="text-3xl font-black text-indigo-600">Rp {selectedBooking.totalPrice.toLocaleString()}</span>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
