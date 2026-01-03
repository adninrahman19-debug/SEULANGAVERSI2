import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, 
  MOCK_USERS, MOCK_REVIEWS, MOCK_PROMOTIONS, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS
} from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { 
  BookingStatus, UserRole, Unit, Business, User, 
  Booking, VerificationStatus, Transaction, Promotion, 
  AuditLog, Review, SubscriptionPlan, SystemModule, CategoryModuleConfig, UnitStatus, PricingRule 
} from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const revenueData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78, bookings: 42 },
  { name: 'Aug', revenue: 52000000, occupancy: 82, bookings: 48 },
  { name: 'Sep', revenue: 48000000, occupancy: 75, bookings: 39 },
  { name: 'Oct', revenue: 61000000, occupancy: 88, bookings: 55 },
  { name: 'Nov', revenue: 55000000, occupancy: 80, bookings: 50 },
  { name: 'Dec', revenue: 78000000, occupancy: 95, bookings: 72 },
];

const unitPerformanceData = [
  { name: 'Deluxe Suite 201', revenue: 24500000, bookings: 18, rate: 92 },
  { name: 'Executive Room 305', revenue: 32000000, bookings: 12, rate: 85 },
  { name: 'Standard Twin 102', revenue: 15400000, bookings: 22, rate: 95 },
  { name: 'Ocean View Penthouse', revenue: 12000000, bookings: 4, rate: 60 },
];

type ModuleType = 'overview' | 'inventory' | 'bookings' | 'finance' | 'team' | 'profile' | 'marketing' | 'reviews' | 'analytics' | 'activity' | 'subscription';

interface OwnerDashboardProps {
  businessId: string;
  moduleConfigs: CategoryModuleConfig;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ businessId, moduleConfigs, currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [insights, setInsights] = useState<string>('Analyzing market data for your properties...');
  
  const [business, setBusiness] = useState<Business>(() => {
    const biz = MOCK_BUSINESSES.find(b => b.id === businessId) || MOCK_BUSINESSES[0];
    return {
      ...biz,
      operatingHours: biz.operatingHours || { open: '08:00', close: '22:00', days: 'Setiap Hari' },
      seoMetadata: biz.seoMetadata || { title: biz.name, description: biz.description, keywords: biz.category },
      logo: biz.logo || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=200',
      subscriptionExpiry: '2025-12-31'
    };
  });

  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === business.id));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === business.id));
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.filter(t => t.businessId === business.id));
  const [localAuditLogs, setLocalAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  
  // Reputation (Reviews) State
  const [localReviews, setLocalReviews] = useState<Review[]>(MOCK_REVIEWS.filter(r => r.businessId === business.id));
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Team Management State
  const [staffList, setStaffList] = useState<User[]>(MOCK_USERS.filter(u => u.businessId === business.id && u.role === UserRole.ADMIN_STAFF));
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [suspendedStaffIds, setSuspendedStaffIds] = useState<Set<string>>(new Set());
  const AVAILABLE_PERMISSIONS = ['manage_bookings', 'inventory_ops', 'financial_view', 'maintenance_ops', 'marketing_access'];

  // Inventory Management State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Booking Management State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'ALL'>('ALL');

  // Finance Module State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Marketing Module State
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS.filter(p => p.businessId === business.id));
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    { id: 'pr-1', businessId: business.id, name: 'Weekend Markup', type: 'weekend', adjustmentType: 'percentage', value: 15, isActive: true },
    { id: 'pr-2', businessId: business.id, name: 'Ramadan Low Season', type: 'seasonal', adjustmentType: 'percentage', value: -20, startDate: '2025-03-01', endDate: '2025-03-31', isActive: false }
  ]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [business.category]);

  const fetchInsights = async () => {
    setInsights("Connecting to Gemini AI Engine...");
    const text = await getBusinessInsights({
      revenue: revenueData[revenueData.length-1].revenue,
      occupancy: `${revenueData[revenueData.length-1].occupancy}%`,
      unitCount: units.length,
      category: business.category,
      name: business.name
    });
    setInsights(text || "AI Insights currently unavailable.");
  };

  const logActivity = (action: string, target: string, type: AuditLog['type'] = 'management') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: currentUser?.id || 'unknown',
      actorName: currentUser?.name || 'Unknown',
      actorRole: currentUser?.role || UserRole.BUSINESS_OWNER,
      action,
      target,
      type,
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
    setLocalAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    onUpdateUser({ name: profileName, phoneNumber: profilePhone });
    logActivity('Updated Personal Profile', 'User Profile Node');
    setIsSaving(false);
    alert('Identitas Node Terupdate. Sinkronisasi Berhasil.');
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    logActivity('Updated Business Identity', business.name);
    setIsSaving(false);
    alert('Identitas Bisnis Berhasil Disimpan.');
  };

  // Unit CRUD Logic
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const unitData: Partial<Unit> = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')),
      description: formData.get('description') as string,
      available: formData.get('available') === 'on',
      status: formData.get('status') as UnitStatus,
      amenities: (formData.get('amenities') as string).split(',').map(a => a.trim()),
      policies: {
        checkIn: formData.get('checkIn') as string,
        checkOut: formData.get('checkOut') as string,
        cancellation: formData.get('cancellation') as string,
      }
    };

    if (editingUnit) {
      setUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...unitData } : u));
      logActivity(`Updated Unit Node: ${unitData.name}`, 'Asset Matrix');
      alert('Produk Bisnis Berhasil Diperbarui.');
    } else {
      const newUnit: Unit = {
        id: `un-${Date.now()}`,
        businessId: business.id,
        name: unitData.name!,
        type: unitData.type!,
        price: unitData.price!,
        capacity: unitData.capacity!,
        available: unitData.available!,
        status: unitData.status!,
        amenities: unitData.amenities!,
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600'],
        description: unitData.description,
        policies: unitData.policies as any
      };
      setUnits(prev => [...prev, newUnit]);
      logActivity(`Deployed New Unit Node: ${unitData.name}`, 'Asset Matrix');
      alert('Produk Bisnis Baru Berhasil Ditambahkan.');
    }
    setIsUnitModalOpen(false);
    setEditingUnit(null);
  };

  const handleToggleUnitAvailability = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, available: !u.available } : u));
    logActivity(`Toggled Availability for ${unit?.name}`, 'Asset Matrix');
  };

  const handleDeleteUnit = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (confirm('Hapus produk/unit ini secara permanen?')) {
      setUnits(prev => prev.filter(u => u.id !== unitId));
      logActivity(`Purged Unit Node: ${unit?.name}`, 'Asset Matrix');
    }
  };

  // Marketing Logic
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newPromo: Promotion = {
      id: `pr-${Date.now()}`,
      businessId: business.id,
      code: formData.get('code') as string,
      discountValue: Number(formData.get('discountValue')),
      type: formData.get('type') as 'percentage' | 'fixed',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      isActive: true,
      description: formData.get('description') as string
    };
    setPromotions(prev => [newPromo, ...prev]);
    logActivity(`Created Promo Node: ${newPromo.code}`, 'Growth Hub');
    setIsPromoModalOpen(false);
    alert('Strategi Promosi Baru Diaktifkan.');
  };

  const handleTogglePromo = (id: string) => {
    const promo = promotions.find(p => p.id === id);
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    logActivity(`Toggled Promo Status: ${promo?.code}`, 'Growth Hub');
  };

  const handleTogglePricingRule = (id: string) => {
    const rule = pricingRules.find(r => r.id === id);
    setPricingRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    logActivity(`Toggled Pricing Protocol: ${rule?.name}`, 'Growth Hub');
  };

  const handleRequestFeatured = () => {
    setBusiness(prev => ({ ...prev, isFeaturedRequested: true }));
    logActivity('Requested Featured Boost', 'Marketplace Governance');
    alert('Permintaan Featured Listing telah dikirim ke Pusat Tata Kelola.');
  };

  // Team Management Handlers
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newStaff: User = {
      id: `st-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: UserRole.ADMIN_STAFF,
      businessId: business.id,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: ['manage_bookings'] 
    };
    setStaffList(prev => [...prev, newStaff]);
    logActivity(`Enrolled Operator Node: ${newStaff.name}`, 'Operations Team');
    setIsAddStaffModalOpen(false);
    alert(`Node Operator ${newStaff.name} berhasil dideploy.`);
  };

  const handleToggleStaffPermission = (staffId: string, permission: string) => {
    const staff = staffList.find(s => s.id === staffId);
    setStaffList(prev => prev.map(s => {
      if (s.id !== staffId) return s;
      const current = s.permissions || [];
      const updated = current.includes(permission) 
        ? current.filter(p => p !== permission)
        : [...current, permission];
      return { ...s, permissions: updated };
    }));
    logActivity(`Modified Authority Matrix for ${staff?.name}`, 'Operations Team');
  };

  const handleToggleStaffStatus = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    const isSuspending = !suspendedStaffIds.has(staffId);
    setSuspendedStaffIds(prev => {
      const next = new Set(prev);
      if (next.has(staffId)) next.delete(staffId);
      else next.add(staffId);
      return next;
    });
    logActivity(`${isSuspending ? 'Suspended' : 'Restored'} Operator Node: ${staff?.name}`, 'Operations Team');
  };

  const handleResetStaffPassword = (name: string) => {
    logActivity(`Dispatched Password Reset for ${name}`, 'Security Control');
    alert(`Reset link telah dikirim ke email ${name}.`);
  };

  // Reputation Handlers
  const handleSubmitReviewReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setLocalReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: replyText } : r));
    logActivity(`Responded to Guest Feedback: ${reviewId}`, 'Guest Hub');
    setReplyingTo(null);
    setReplyText('');
    alert('Balasan berhasil dipublikasikan.');
  };

  const handleReportReview = (reviewId: string) => {
    logActivity(`Flagged Review Node for Moderation: ${reviewId}`, 'Guest Hub', 'security');
    alert(`Review ${reviewId} telah dilaporkan untuk moderasi keamanan.`);
  };

  // Booking Actions
  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    logActivity(`Transitioned Reservation ${id} to ${status}`, 'Booking Node');
    alert(`Status reservasi ${id} diperbarui menjadi ${status}.`);
  };

  const handleConfirmPayment = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, verifiedPayment: true } : b));
    logActivity(`Verified Payment Node: ${bookingId}`, 'Treasury Hub', 'financial');
    alert('Pembayaran diverifikasi secara manual. Treasury Node diperbarui.');
  };

  const handleManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const unitId = formData.get('unitId') as string;
    const unit = units.find(u => u.id === unitId);
    
    const newBooking: Booking = {
      id: `BK-WALK-${Date.now()}`,
      businessId: business.id,
      unitId: unitId,
      guestId: 'u-walkin',
      checkIn: formData.get('checkIn') as string,
      checkOut: formData.get('checkOut') as string,
      totalPrice: Number(formData.get('totalPrice')) || (unit?.price || 0),
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Walk-in Manual Booking',
      verifiedPayment: true
    };
    
    setBookings(prev => [newBooking, ...prev]);
    logActivity(`Authorized Manual Walk-In: ${newBooking.id}`, 'Booking Node');
    setIsWalkInModalOpen(false);
    alert('Booking Manual Berhasil Didaftarkan.');
  };

  const navItems = useMemo(() => {
    const activeModules = moduleConfigs[business.category] || [];
    const items = [
      { id: 'overview', label: 'Dashboard', icon: 'fa-chess-king', module: null },
      { id: 'bookings', label: 'Reservations', icon: 'fa-calendar-check', module: SystemModule.BOOKING },
      { id: 'inventory', label: 'Asset Matrix', icon: 'fa-door-open', module: SystemModule.INVENTORY },
      { id: 'finance', label: 'Treasury', icon: 'fa-receipt', module: SystemModule.PAYMENT },
      { id: 'analytics', label: 'Evaluation Matrix', icon: 'fa-chart-mixed', module: null },
      { id: 'team', label: 'Operations Team', icon: 'fa-users-gear', module: SystemModule.TEAM },
      { id: 'marketing', label: 'Growth & Ads', icon: 'fa-rocket', module: SystemModule.MARKETING },
      { id: 'profile', label: 'Brand Identity', icon: 'fa-id-card', module: null },
      { id: 'reviews', label: 'Guest Feedback', icon: 'fa-comment-dots', module: SystemModule.REVIEWS },
      { id: 'activity', label: 'Activity Control', icon: 'fa-clock-rotate-left', module: null },
      { id: 'subscription', label: 'Plan & Billing', icon: 'fa-gem', module: null },
    ];
    return items.filter(item => !item.module || activeModules.includes(item.module));
  }, [business.category, moduleConfigs]);

  const renderOverview = () => {
    const bookingsToday = bookings.filter(b => b.createdAt === new Date().toISOString().split('T')[0]).length;
    const bookingsMonth = revenueData[5].bookings;
    const unitLimit = business.subscription === SubscriptionPlan.PREMIUM ? 'Unlimited' : business.subscription === SubscriptionPlan.PRO ? '50' : '10';

    return (
      <div className="space-y-10 animate-fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <i className="fas fa-sack-dollar text-xl"></i>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendapatan (Bulan Ini)</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {(revenueData[5].revenue / 1000000).toFixed(1)}M</h3>
          </div>

          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                   <i className="fas fa-calendar-check text-xl"></i>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-indigo-600 uppercase">{bookingsToday} Today</p>
                </div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ringkasan Booking</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{bookingsMonth} <span className="text-sm text-slate-400 font-bold">Reservasi</span></h3>
          </div>

          <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                   <i className="fas fa-door-open text-xl"></i>
                </div>
                <span className="text-[10px] font-black text-violet-500 bg-violet-50 px-2 py-1 rounded-lg">High Demand</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tingkat Okupansi</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{revenueData[5].occupancy}% <span className="text-sm text-slate-400 font-bold">Terisi</span></h3>
          </div>

          <div className="bg-slate-950 p-8 rounded-[36px] shadow-xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${business.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-50 text-rose-400 border border-rose-500/30'}`}>
                      {business.status === 'active' ? 'Operational' : 'Suspended'}
                   </span>
                   <i className="fas fa-shield-check text-indigo-400"></i>
                </div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">{business.subscription} Plan</p>
                <h3 className="text-xl font-black mb-4">Quota: {units.length} / {unitLimit} Units</h3>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(units.length / (parseInt(unitLimit) || 100)) * 100}%` }}></div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Tren Reservasi & Revenue</h3>
                  <p className="text-slate-400 text-sm font-medium">Visualisasi performa operasional 6 bulan terakhir</p>
               </div>
               <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase text-indigo-600">Monthly</button>
                  <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Weekly</button>
               </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <Tooltip 
                     contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}}
                     itemStyle={{fontWeight: 800, fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={4} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Peringatan Sistem</h4>
                   <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                </div>
                <div className="space-y-4">
                   {[
                      { title: 'Pembayaran Tertunda', desc: '3 reservasi menunggu verifikasi manual.', type: 'payment', icon: 'fa-clock' },
                      { title: 'Limit Hampir Tercapai', desc: 'Anda telah menggunakan 90% kuota unit.', type: 'system', icon: 'fa-triangle-exclamation' }
                   ].map((notif, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 hover:border-indigo-200 transition-colors cursor-pointer">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <i className={`fas ${notif.icon} text-xs`}></i>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{notif.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{notif.desc}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                         <i className="fas fa-wand-magic-sparkles"></i>
                      </div>
                      <h4 className="font-black text-sm uppercase tracking-tighter">AI Strategist</h4>
                   </div>
                   <p className="text-xs leading-relaxed font-medium italic opacity-90 mb-8">
                      "{insights}"
                   </p>
                   <button onClick={fetchInsights} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
                      Sync AI Logic
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Asset Matrix (Produk Utama)</h3>
           <p className="text-slate-400 text-sm font-medium">Kelola tipe unit, kapasitas, harga dasar, dan status ketersediaan global.</p>
        </div>
        <button 
          onClick={() => { setEditingUnit(null); setIsUnitModalOpen(true); }}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          Tambah Tipe Unit Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {units.map(unit => (
          <div key={unit.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="relative h-64">
              <img src={unit.images[0]} className="w-full h-full object-cover" alt={unit.name} />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  unit.available ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {unit.available ? 'Ready' : 'Blocked'}
                </span>
                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-widest border border-slate-100 shadow-sm">
                  {unit.type}
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => handleToggleUnitAvailability(unit.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                    unit.available ? 'bg-white text-rose-500 hover:bg-rose-50' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                  title={unit.available ? "Block Unit" : "Unblock Unit"}
                >
                  <i className={`fas ${unit.available ? 'fa-ban' : 'fa-check'}`}></i>
                </button>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                   <h4 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{unit.name}</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                     Kapasitas: {unit.capacity} Orang • {unit.status}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</p>
                   <p className="text-xl font-black text-indigo-600">Rp {unit.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {unit.amenities.slice(0, 4).map(a => (
                  <span key={a} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-100">{a}</span>
                ))}
                {unit.amenities.length > 4 && <span className="text-[9px] font-black text-slate-300">+{unit.amenities.length - 4} More</span>}
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100"
                  >
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                  Lihat Kalender <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unit Modal (Add/Edit) */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[56px] shadow-2xl overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{editingUnit ? 'Update Unit Node' : 'Deploy New Unit Node'}</h3>
                 <button onClick={() => { setIsUnitModalOpen(false); setEditingUnit(null); }} className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>
              
              <form onSubmit={handleSaveUnit} className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: General Info */}
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identitas Produk/Unit</label>
                          <input required name="name" defaultValue={editingUnit?.name} placeholder="e.g. Deluxe Ocean Suite" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topology (Type)</label>
                             <input required name="type" defaultValue={editingUnit?.type} placeholder="Room, Villa, etc" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900" />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kapasitas (Pax)</label>
                             <input required name="capacity" type="number" defaultValue={editingUnit?.capacity} placeholder="2" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Dasar (Rp)</label>
                             <input required name="price" type="number" defaultValue={editingUnit?.price} placeholder="1.500.000" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900" />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
                             <select name="status" defaultValue={editingUnit?.status || UnitStatus.READY} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none">
                                {Object.values(UnitStatus).map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Narrative Description</label>
                          <textarea name="description" rows={5} defaultValue={editingUnit?.description} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none resize-none" placeholder="Deskripsikan fitur unik unit ini..."></textarea>
                       </div>
                    </div>

                    {/* Right Side: Features & Policies */}
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fasilitas (Amenities) - Pisahkan dengan koma</label>
                          <textarea name="amenities" rows={3} defaultValue={editingUnit?.amenities.join(', ')} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none resize-none" placeholder="WiFi, AC, Smart TV, Mini Bar, Bathtub"></textarea>
                       </div>
                       
                       <div className="p-8 bg-slate-950 rounded-[40px] text-white space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Unit Protocol (Check-in/out)</h4>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">Check-In Rules</label>
                                <input name="checkIn" defaultValue={editingUnit?.policies?.checkIn} placeholder="14:00 - 20:00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-bold" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">Check-Out Rules</label>
                                <input name="checkOut" defaultValue={editingUnit?.policies?.checkOut} placeholder="By 12:00 PM" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-bold" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-white/40 uppercase tracking-widest">Cancellation Policy</label>
                             <input name="cancellation" defaultValue={editingUnit?.policies?.cancellation} placeholder="Refundable up to 48h before arrival" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-bold" />
                          </div>
                          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                             <input type="checkbox" name="available" defaultChecked={editingUnit?.available ?? true} className="w-6 h-6 rounded-lg accent-indigo-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Aktifkan Ketersediaan Publik</span>
                          </div>
                       </div>

                       <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Galeri & Media Assets</h4>
                          <div className="grid grid-cols-4 gap-4">
                             {[...Array(4)].map((_, i) => (
                               <div key={i} className="aspect-square bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-600 transition-all cursor-pointer group">
                                  {editingUnit?.images[i] ? (
                                     <img src={editingUnit.images[i]} className="w-full h-full object-cover rounded-2xl" />
                                  ) : (
                                     <i className="fas fa-plus text-xl group-hover:scale-110 transition-transform"></i>
                                  )}
                               </div>
                             ))}
                          </div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase text-center">Drag and drop photos or click to upload</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 flex gap-6 sticky bottom-0 bg-white">
                    <button type="button" onClick={() => setIsUnitModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                       Abort Configuration
                    </button>
                    <button type="submit" className="flex-1 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
                       Save Asset Matrix Node
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );

  const renderBookings = () => {
    const filteredBookings = bookings.filter(b => bookingFilter === 'ALL' || b.status === bookingFilter);
    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Reservation Management</h3>
              <p className="text-slate-400 text-sm font-medium">Monitoring guest arrivals, checking-in guests, and manual walk-in registry.</p>
           </div>
           <button 
             onClick={() => setIsWalkInModalOpen(true)}
             className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
           >
             <i className="fas fa-person-walking-luggage"></i>
             Manual Walk-In
           </button>
        </div>

        {/* Booking Filter Tabs */}
        <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm w-fit gap-2">
           {[
             { id: 'ALL', label: 'All Cycles' },
             { id: BookingStatus.PENDING, label: `Pending Approval (${pendingCount})` },
             { id: BookingStatus.CONFIRMED, label: 'Upcoming' },
             { id: BookingStatus.CHECKED_IN, label: 'In-House' },
             { id: BookingStatus.COMPLETED, label: 'Archive' },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setBookingFilter(tab.id as any)}
               className={`px-8 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingFilter === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {/* Bookings Ledger */}
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                 <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Node</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit & Timing</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Treasury</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Protocol</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredBookings.map(bk => {
                   const unit = units.find(u => u.id === bk.unitId);
                   const guest = MOCK_USERS.find(u => u.id === bk.guestId);
                   return (
                     <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <img src={guest?.avatar || 'https://i.pravatar.cc/150?u=walk'} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                              <div>
                                 <p className="font-black text-slate-900 text-sm uppercase">{guest?.name || 'Walk-In Guest'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">{bk.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-black text-slate-700">{unit?.name}</p>
                           <p className="text-[10px] font-bold text-indigo-500 uppercase">{bk.checkIn} → {bk.checkOut}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</p>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${bk.verifiedPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {bk.verifiedPayment ? 'Settled' : 'Pending Payment'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                             bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                             'bg-slate-100 text-slate-400 border-slate-200'
                           }`}>{bk.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                           {bk.status === BookingStatus.PENDING && (
                             <>
                               <button 
                                 onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.CONFIRMED)}
                                 className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                                 title="Approve"
                               >
                                  <i className="fas fa-check"></i>
                               </button>
                               <button 
                                 onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.CANCELLED)}
                                 className="p-3 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                 title="Reject"
                               >
                                  <i className="fas fa-times"></i>
                               </button>
                             </>
                           )}
                           {bk.status === BookingStatus.CONFIRMED && (
                             <button 
                               onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.CHECKED_IN)}
                               className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                             >
                               Initiate Check-In
                             </button>
                           )}
                           {bk.status === BookingStatus.CHECKED_IN && (
                             <button 
                               onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.COMPLETED)}
                               className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"
                             >
                               Finalize Check-Out
                             </button>
                           )}
                           {bk.status === BookingStatus.COMPLETED && (
                             <button className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                               <i className="fas fa-file-invoice"></i>
                             </button>
                           )}
                        </td>
                     </tr>
                   );
                 })}
                 {filteredBookings.length === 0 && (
                   <tr>
                     <td colSpan={5} className="py-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No active reservation threads found</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Walk-in Modal */}
        {isWalkInModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl p-12 space-y-10 relative">
                <button onClick={() => setIsWalkInModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                  <i className="fas fa-times"></i>
                </button>
                
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Manual Walk-In Registry</h3>
                   <p className="text-slate-400 text-sm font-medium">Bypass digital marketplace to register on-site guests.</p>
                </div>

                <form onSubmit={handleManualBooking} className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Unit Node</label>
                      <select name="unitId" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none">
                         {units.filter(u => u.available).map(u => (
                           <option key={u.id} value={u.id}>{u.name} (Rp {u.price.toLocaleString()} /nt)</option>
                         ))}
                      </select>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Protocol</label>
                         <input type="date" name="checkIn" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Protocol</label>
                         <input type="date" name="checkOut" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Treasury Overide (Price)</label>
                      <input type="number" name="totalPrice" placeholder="Defaults to unit price..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none" />
                   </div>

                   <div className="pt-6 flex gap-4">
                      <button type="button" onClick={() => setIsWalkInModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest">Abort</button>
                      <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Authorize Booking</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinance = () => {
    const pendingManualPayments = bookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED);
    const totalGTV = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const platformComm = localTransactions.filter(t => t.type === 'commission').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalGTV - platformComm;

    return (
      <div className="space-y-12 animate-fade-up">
        {/* Finance Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-vault text-xl"></i>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Net Revenue</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {netBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-chart-line-up text-xl"></i>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Booking Value</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {totalGTV.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-hand-holding-dollar text-xl"></i>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Deductions</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {platformComm.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-950 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                   <i className="fas fa-piggy-bank text-indigo-400"></i>
                </div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Payout Balance</p>
                <h3 className="text-2xl font-black">Rp 12.500.000</h3>
                <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">Request Withdrawal →</button>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             {/* Transaction History */}
             <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Audit & Transaction Ledger</h3>
                   <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Export PDF</button>
                   </div>
                </div>
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Detail</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {localTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <p className="font-black text-slate-700 uppercase text-xs">{tx.description}</p>
                              <p className="text-[10px] font-bold text-slate-400">{tx.createdAt}</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                                tx.type === 'subscription' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>{tx.type}</span>
                           </td>
                           <td className="px-8 py-6 text-right font-black text-slate-900">
                              Rp {tx.amount.toLocaleString()}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => { setSelectedInvoice(tx); setIsInvoiceModalOpen(true); }}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                              >
                                 <i className="fas fa-file-invoice"></i>
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-8">
             {/* Manual Confirmations */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manual Payments</h3>
                   <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded font-black">{pendingManualPayments.length} REQ</span>
                </div>
                <div className="space-y-4">
                   {pendingManualPayments.map(p => (
                     <div key={p.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4 hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry #{p.id}</p>
                              <p className="font-black text-slate-900">Rp {p.totalPrice.toLocaleString()}</p>
                           </div>
                           <button className="text-[10px] font-black text-indigo-600 hover:underline">Proof of Pay</button>
                        </div>
                        <button 
                          onClick={() => handleConfirmPayment(p.id)}
                          className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                           Confirm Receipt
                        </button>
                     </div>
                   ))}
                   {pendingManualPayments.length === 0 && (
                     <div className="py-10 text-center text-slate-300 font-black text-[9px] uppercase tracking-widest">All settlements verified</div>
                   )}
                </div>
             </div>

             <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest">Payout Matrix Summary</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-bold opacity-80">
                      <span>Last Payout:</span>
                      <span>Dec 15, 2024</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold opacity-80">
                      <span>Platform Fee (Avg):</span>
                      <span>12.5%</span>
                   </div>
                   <button className="w-full py-4 bg-white/10 backdrop-blur rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Full Treasury Report</button>
                </div>
             </div>
          </div>
        </div>

        {/* Invoice Modal Simulation */}
        {isInvoiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px]"></div>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10">
                  <i className="fas fa-times"></i>
                </button>

                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Invoice</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase">Serial: {selectedInvoice?.id?.toUpperCase() || 'INV-0001'}</p>
                   </div>
                   <div className="text-right pt-2">
                      <p className="font-black text-slate-900 uppercase">{business.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{business.address}</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-12 border-y border-slate-50 py-10">
                      <div>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Node Origin (Platform)</p>
                         <p className="text-sm font-black text-slate-900 uppercase">SEULANGA Enterprise Core</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Banda Aceh, Aceh - IDN</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Temporal node</p>
                         <p className="text-sm font-black text-slate-900 uppercase">{selectedInvoice?.createdAt || 'Dec 30, 2024'}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Financial Payload</p>
                      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl">
                         <span className="font-black text-slate-700 uppercase text-xs">{selectedInvoice?.description || 'General Service Transaction'}</span>
                         <span className="font-black text-slate-900 text-lg">Rp {selectedInvoice?.amount?.toLocaleString() || '0'}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-10 flex gap-4">
                   <button onClick={() => window.print()} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                      <i className="fas fa-print"></i> Download Receipt
                   </button>
                   <button onClick={() => setIsInvoiceModalOpen(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest">Close</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderMarketing = () => (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Growth & Sales Strategy</h3>
           <p className="text-slate-400 text-sm font-medium">Orchestrate promotional campaigns and dynamic pricing protocols.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsPromoModalOpen(true)}
             className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
           >
             Create New Voucher
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Active Vouchers */}
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Promo & Voucher Engine</h3>
                 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Active Nodes</span>
              </div>
              <div className="p-8 space-y-4">
                 {promotions.map(promo => (
                   <div key={promo.id} className={`p-6 border rounded-[32px] flex items-center justify-between transition-all ${promo.isActive ? 'bg-white border-indigo-100 shadow-md' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
                            <span className="text-[10px] font-black uppercase leading-none">Code</span>
                            <span className="text-sm font-black mt-1">{promo.code}</span>
                         </div>
                         <div>
                            <p className="font-black text-slate-900 uppercase">{promo.discountValue}{promo.type === 'percentage' ? '%' : 'K'} Discount</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{promo.startDate} → {promo.endDate}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${promo.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                               {promo.isActive ? 'Live' : 'Paused'}
                            </span>
                         </div>
                         <button 
                           onClick={() => handleTogglePromo(promo.id)}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${promo.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                         >
                            <i className={`fas ${promo.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Dynamic Pricing Matrix */}
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Dynamic Pricing Matrix</h3>
                 <i className="fas fa-chart-line text-indigo-300"></i>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {pricingRules.map(rule => (
                   <div key={rule.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                      <div className="flex justify-between items-start">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                            <i className={`fas ${rule.type === 'weekend' ? 'fa-calendar-day' : 'fa-umbrella-beach'}`}></i>
                         </div>
                         <button 
                           onClick={() => handleTogglePricingRule(rule.id)}
                           className={`w-12 h-6 rounded-full transition-all relative ${rule.isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                         >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${rule.isActive ? 'right-0.5' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                      <div>
                         <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{rule.name}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{rule.type} Adjustment</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                         <span className={`text-xl font-black ${rule.value > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {rule.value > 0 ? '+' : ''}{rule.value}%
                         </span>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                      </div>
                   </div>
                 ))}
                 <button className="p-6 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all gap-2">
                    <i className="fas fa-plus-circle text-2xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Pricing Node</span>
                 </button>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* Featured Listing Card */}
           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="relative z-10">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-8">
                    <i className="fas fa-fire-flame-curved text-2xl"></i>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase">Marketplace Boost</h3>
                 <p className="text-indigo-200/60 font-medium text-sm leading-relaxed mb-10">
                    Propel your entity to the primary indexing slot. Increase GTV thread volume by up to 250% through elite featured status.
                 </p>
                 
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-10">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-indigo-400 uppercase">Status Node:</span>
                       <span className={`text-[10px] font-black uppercase ${business.isFeatured ? 'text-emerald-400' : business.isFeaturedRequested ? 'text-amber-400' : 'text-white/40'}`}>
                          {business.isFeatured ? 'Verified Featured' : business.isFeaturedRequested ? 'Protocol Pending' : 'Standard Node'}
                       </span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${business.isFeatured ? 'w-full bg-emerald-500' : business.isFeaturedRequested ? 'w-1/2 bg-amber-500' : 'w-0'}`}></div>
                    </div>
                 </div>

                 {!business.isFeatured && !business.isFeaturedRequested && (
                   <button 
                    onClick={handleRequestFeatured}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40"
                   >
                     Initialize Boost Strategy
                   </button>
                 )}
                 {business.isFeaturedRequested && !business.isFeatured && (
                   <div className="text-center text-[10px] font-black text-amber-400 uppercase tracking-widest animate-pulse">
                      Authorizing Payment Flow...
                   </div>
                 )}
              </div>
           </div>

           {/* Sales Logic Context */}
           <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest">Growth Intelligence</h4>
              <p className="text-xs leading-relaxed font-medium opacity-80">
                 "Our heuristic analysis suggests activating a 'Stay 3, Pay 2' special promo to capitalize on current regional demand patterns."
              </p>
              <button className="w-full py-4 bg-white/10 backdrop-blur rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Sync AI Advice</button>
           </div>
        </div>
      </div>

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-12 space-y-10 relative">
              <button onClick={() => setIsPromoModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                <i className="fas fa-times"></i>
              </button>
              
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Promo Deployment</h3>
                 <p className="text-slate-400 text-sm font-medium">Inject a new voucher node into the marketplace ecosystem.</p>
              </div>

              <form onSubmit={handleSavePromo} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Voucher Code</label>
                       <input name="code" required placeholder="E.G. RAMADAN20" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50 uppercase" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topology</label>
                       <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50">
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Value (Rp)</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Magnitude</label>
                    <input name="discountValue" required type="number" placeholder="20" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Genesis Date</label>
                       <input name="startDate" required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                       <input name="endDate" required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900" />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setIsPromoModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest">Abort</button>
                    <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">Authorize Promo</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operations Team Matrix</h3>
             <p className="text-slate-400 text-sm font-medium">Manage operator nodes, assign authority levels, and monitor user lifecycle.</p>
          </div>
          <button 
            onClick={() => setIsAddStaffModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Deploy Staff Node
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Identity</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Matrix</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</th>
                         <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {staffList.map(staff => (
                        <tr key={staff.id} className={`hover:bg-slate-50/50 transition-colors ${suspendedStaffIds.has(staff.id) ? 'opacity-50' : ''}`}>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <img src={staff.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" />
                                 <div>
                                    <p className="font-black text-slate-900 uppercase text-xs">{staff.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{staff.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-wrap gap-1">
                                 {staff.permissions?.map(p => (
                                    <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase border border-indigo-100">
                                       {p.replace('_', ' ')}
                                    </span>
                                 ))}
                                 <button className="text-[8px] font-black text-indigo-600 hover:underline ml-1">Edit</button>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                suspendedStaffIds.has(staff.id) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                 {suspendedStaffIds.has(staff.id) ? 'Suspended' : 'Operational'}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button 
                                   onClick={() => handleResetStaffPassword(staff.name)}
                                   className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                   title="Reset Password"
                                 >
                                    <i className="fas fa-key text-xs"></i>
                                 </button>
                                 <button 
                                   onClick={() => handleToggleStaffStatus(staff.id)}
                                   className={`p-2 rounded-lg transition-all ${
                                      suspendedStaffIds.has(staff.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                   }`}
                                   title={suspendedStaffIds.has(staff.id) ? 'Activate' : 'Suspend'}
                                 >
                                    <i className={`fas ${suspendedStaffIds.has(staff.id) ? 'fa-bolt' : 'fa-ban'} text-xs`}></i>
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Authority Level Mapping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {AVAILABLE_PERMISSIONS.map(p => (
                      <div key={p} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="font-black text-slate-900 text-xs uppercase">{p.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Grant access to {p.split('_')[0]} system nodes.</p>
                         </div>
                         <i className="fas fa-shield-halved text-indigo-200"></i>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <h4 className="text-xl font-black tracking-tight uppercase">Live Activity Trace</h4>
                <div className="space-y-6">
                   {[
                      { actor: 'Sarah Staff', action: 'Verified Payment BK-1022', time: '12m ago' },
                      { actor: 'Budi Santoso', action: 'Updated Unit DELUXE-3', time: '45m ago' },
                      { actor: 'Sarah Staff', action: 'Guest Check-in: G-Node-99', time: '2h ago' }
                   ].map((log, i) => (
                      <div key={i} className="flex gap-4 items-start">
                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                         <div>
                            <p className="text-xs font-black text-indigo-300 uppercase">{log.actor}</p>
                            <p className="text-[10px] text-white/60 font-medium">{log.action}</p>
                            <p className="text-[8px] text-white/20 font-bold mt-1">{log.time}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-indigo-600 p-10 rounded-[48px] shadow-xl text-white space-y-6">
                <h4 className="text-lg font-black tracking-tight uppercase">Operational Security</h4>
                <p className="text-xs font-medium opacity-80 leading-relaxed">Ensure all staff nodes have individual identity credentials. Sharing security keys is a violation of platform protocols.</p>
                <button className="w-full py-4 bg-white/10 backdrop-blur rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Audit Security Matrix</button>
             </div>
          </div>
       </div>

       {/* Add Staff Modal */}
       {isAddStaffModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-12 space-y-10 relative">
                <button onClick={() => setIsAddStaffModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all">
                  <i className="fas fa-times"></i>
                </button>
                
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Enroll Operator Node</h3>
                   <p className="text-slate-400 text-sm font-medium">Inject a new staff identity into the business ecosystem.</p>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                      <input name="name" required placeholder="Full name" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Node (Email)</label>
                      <input name="email" type="email" required placeholder="staff@business.com" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Initial Authorization Key</p>
                      <p className="text-center font-mono text-xs font-bold text-slate-400 italic">Temporal password will be dispatched to staff email.</p>
                   </div>
                   <div className="pt-6 flex gap-4">
                      <button type="button" onClick={() => setIsAddStaffModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest">Abort Cycle</button>
                      <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">Deploy Node</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );

  const renderReviews = () => {
    const avgRating = localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length;
    const ratingDist = [
      { stars: 5, count: localReviews.filter(r => r.rating === 5).length },
      { stars: 4, count: localReviews.filter(r => r.rating === 4).length },
      { stars: 3, count: localReviews.filter(r => r.rating === 3).length },
      { stars: 2, count: localReviews.filter(r => r.rating === 2).length },
      { stars: 1, count: localReviews.filter(r => r.rating === 1).length },
    ];

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Guest Feedback Hub</h3>
             <p className="text-slate-400 text-sm font-medium">Protect and monitor your business reputation within the SEULANGA ecosystem.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             {/* Feedback List */}
             <div className="space-y-6">
                {localReviews.map(review => (
                   <div key={review.id} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-8 hover:shadow-xl transition-all duration-500 group">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-5">
                            <img src={`https://i.pravatar.cc/150?u=${review.guestId}`} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 shadow-sm" />
                            <div>
                               <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{review.guestName}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">{review.createdAt}</p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-3">
                            <div className="flex text-amber-400 text-sm">
                               {[...Array(5)].map((_, i) => (
                                 <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star`}></i>
                               ))}
                            </div>
                            <button onClick={() => handleReportReview(review.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Report Issue">
                               <i className="fas fa-flag-checkered text-xs"></i>
                            </button>
                         </div>
                      </div>

                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                         <p className="text-slate-600 leading-relaxed font-medium italic">"{review.comment}"</p>
                      </div>

                      {review.ownerReply ? (
                        <div className="ml-10 p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-4 relative">
                           <div className="absolute top-4 left-[-15px] w-6 h-6 bg-indigo-50 rotate-45 border-l border-b border-indigo-100"></div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                 <i className="fas fa-reply text-[10px]"></i>
                              </div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Business Reply</p>
                           </div>
                           <p className="text-sm font-bold text-slate-700 leading-relaxed">{review.ownerReply}</p>
                           <button onClick={() => setReplyingTo(review.id)} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Edit Reply</button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                           {replyingTo === review.id ? (
                             <div className="w-full space-y-4 animate-in slide-in-from-top-2">
                                <textarea 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Tulis balasan profesional Anda..."
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:ring-4 ring-indigo-50 outline-none resize-none"
                                  rows={4}
                                ></textarea>
                                <div className="flex justify-end gap-3">
                                   <button onClick={() => setReplyingTo(null)} className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Batal</button>
                                   <button onClick={() => handleSubmitReviewReply(review.id)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">Submit Reply</button>
                                </div>
                             </div>
                           ) : (
                             <button 
                               onClick={() => setReplyingTo(review.id)}
                               className="px-8 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                             >
                               Balas Review
                             </button>
                           )}
                        </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

          <div className="space-y-8">
             {/* Rating Analytics Card */}
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                <div className="text-center">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Trust Score</h4>
                   <div className="text-6xl font-black text-slate-900 tracking-tighter mb-4">{avgRating.toFixed(1)}</div>
                   <div className="flex justify-center text-amber-400 gap-1 text-lg mb-4">
                      {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                   </div>
                   <p className="text-xs font-bold text-slate-500">Based on {localReviews.length} guest logs</p>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Star Distribution Matrix</h5>
                   {ratingDist.map(d => (
                      <div key={d.stars} className="flex items-center gap-4">
                         <span className="text-[10px] font-black text-slate-400 w-4">{d.stars}</span>
                         <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                              style={{ width: `${(d.count / localReviews.length) * 100}%` }}
                            ></div>
                         </div>
                         <span className="text-[10px] font-black text-slate-900 w-8 text-right">{d.count}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* AI Reputation Insights */}
             <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <i className="fas fa-brain text-sm"></i>
                   </div>
                   <h4 className="font-black text-sm uppercase tracking-tighter">AI Sentiment Pulse</h4>
                </div>
                <p className="text-xs font-medium text-indigo-100/60 leading-relaxed italic relative z-10">
                   "Guests are highly satisfied with the cleanliness protocols but suggested minor improvements to the evening room service speed."
                </p>
                <div className="pt-6 border-t border-white/5 relative z-10">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sentiment Index</span>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Positive (92%)</span>
                   </div>
                   <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Business Evaluation Matrix</h3>
             <p className="text-slate-400 text-sm font-medium">Deep telemetry analysis of revenue, occupancy, and asset productivity.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => alert('Exporting evaluation thread to Excel... Protocol Authorized.')} className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
                <i className="fas fa-file-excel text-emerald-600"></i> Export Excel
             </button>
             <button onClick={() => alert('Generating cryptographic PDF evaluation report...')} className="px-6 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl">
                <i className="fas fa-file-pdf text-rose-500"></i> Generate PDF
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Revenue Analytics (Monthly)</h4>
                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Growth +18.4%</div>
             </div>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                         {revenueData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase text-center">Occupancy Velocity</h4>
             <div className="flex justify-center py-6">
                <div className="relative w-48 h-48">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-slate-100 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                      <circle className="text-indigo-600 stroke-current" strokeWidth="10" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" 
                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.88)} />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-900">88%</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Average rate</span>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-3xl flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Available Nodes</span>
                   <span className="text-sm font-black text-slate-900">2 Units</span>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Booked Nodes</span>
                   <span className="text-sm font-black text-slate-900">10 Units</span>
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
             <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Asset Productivity Ranking</h4>
             <div className="space-y-6">
                {unitPerformanceData.map((unit, idx) => (
                   <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-sm font-black text-slate-900 uppercase">{unit.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{unit.bookings} Bookings • Rp {unit.revenue.toLocaleString()}</p>
                         </div>
                         <span className="text-xs font-black text-indigo-600">{unit.rate}% Eff.</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${unit.rate}%` }}></div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
             <h4 className="text-2xl font-black tracking-tighter uppercase">Evaluative Booking Report</h4>
             <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                {bookings.map(bk => (
                   <div key={bk.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer">
                      <div>
                         <p className="text-xs font-black uppercase text-indigo-400">Node: {bk.id.toUpperCase()}</p>
                         <p className="text-[10px] font-bold text-white/40">{bk.createdAt} | {bk.status}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-emerald-400">Rp {bk.totalPrice.toLocaleString()}</p>
                         <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Net Thread Clear</p>
                      </div>
                   </div>
                ))}
             </div>
             <button className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Audit Full Lifecycle History</button>
          </div>
       </div>
    </div>
  );

  const renderActivity = () => {
    const recentActivity = [
      { id: '1', title: 'New Reservation', detail: 'Alice Guest booked Deluxe Suite 201', time: '2m ago', type: 'booking', icon: 'fa-calendar-plus', color: 'text-emerald-500' },
      { id: '2', title: 'Payment Received', detail: 'Verification success for #BK-WALK-17355', time: '15m ago', type: 'payment', icon: 'fa-money-bill-transfer', color: 'text-indigo-500' },
      { id: '3', title: 'Staff Check-In', detail: 'Sarah Staff authorized guest G-NODE-99', time: '1h ago', type: 'system', icon: 'fa-user-check', color: 'text-violet-500' },
    ];

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Activity Control Node</h3>
             <p className="text-slate-400 text-sm font-medium">Real-time surveillance of ecosystem events, notifications, and audit trails.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Live Activity Pulse</h4>
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                </div>
                <div className="space-y-6">
                   {recentActivity.map(act => (
                      <div key={act.id} className="flex gap-5 group cursor-pointer">
                         <div className={`w-12 h-12 rounded-2xl bg-slate-50 ${act.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                            <i className={`fas ${act.icon}`}></i>
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                               <p className="text-xs font-black text-slate-900 uppercase truncate">{act.title}</p>
                               <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{act.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">{act.detail}</p>
                         </div>
                      </div>
                   ))}
                </div>
                <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Mark All Read</button>
             </div>

             <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <h4 className="text-xl font-black tracking-tight uppercase relative z-10">Security Compliance</h4>
                <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400">
                         <i className="fas fa-shield-halved"></i>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-indigo-300">Identity Integrity</p>
                         <p className="text-xs font-bold">100% Operational</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-white/40 leading-relaxed">System logs all administrative overrides and credential access for forensic verification.</p>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                   <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Forensic Audit Ledger</h4>
                      <p className="text-slate-400 text-xs font-medium">Immutable trace of all data modifications and internal ops.</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 transition-all shadow-sm">
                         <i className="fas fa-filter text-xs"></i>
                      </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Action</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor Node</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-mono">
                         {localAuditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-8 py-5">
                                  <p className="text-[11px] font-black text-slate-700 uppercase">{log.action}</p>
                                  <p className="text-[9px] text-slate-400 uppercase font-bold">{log.target}</p>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                     <span className="text-[11px] font-black text-indigo-600 uppercase">{log.actorName}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-5 text-[10px] text-slate-400 font-bold">{log.timestamp}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="p-8 border-t border-slate-50 text-center">
                   <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View full forensic report history</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubscription = () => {
    const plans = [
      { id: 'BASIC', name: 'Basic Access', price: 'Free', commission: '15%', units: '10 Units', features: ['Standard Support', 'Core Modules', 'Manual Payouts'], color: 'text-slate-400', bg: 'bg-slate-50' },
      { id: 'PRO', name: 'Growth Pro', price: 'Rp 499K/mo', commission: '10%', units: '50 Units', features: ['Priority Support', 'Advanced Analytics', 'SMS Alerts'], color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: 'PREMIUM', name: 'Elite Premium', price: 'Rp 1.2M/mo', commission: '5%', units: 'Unlimited', features: ['Dedicated Manager', 'AI Intelligence', 'Cryptographic Exports'], color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Plan & Subscription Node</h3>
                  <p className="text-slate-400 text-sm font-medium">Orchestrate your business economic scale.</p>
               </div>
               <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl shadow-inner border border-indigo-100">
                  <i className="fas fa-gem"></i>
               </div>
            </div>

            <div className="p-10 bg-slate-950 rounded-[48px] text-white space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Current Active Protocol</p>
                     <h4 className="text-5xl font-black tracking-tighter uppercase mb-2">{business.subscription} Plan</h4>
                     <p className="text-indigo-200/60 font-medium italic">Your node access is verified and operational.</p>
                  </div>
                  <div className="text-center md:text-right">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Registry Lifecycle</p>
                     <p className="text-2xl font-black text-emerald-400">Expires: {business.subscriptionExpiry || '2025-12-31'}</p>
                     <p className="text-[9px] font-bold text-white/20 uppercase mt-2">Auto-renewal enabled</p>
                  </div>
               </div>
               
               <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Commission Node</p>
                     <p className="text-lg font-black text-indigo-400">{business.subscription === 'Premium' ? '5%' : business.subscription === 'Pro' ? '10%' : '15%'}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Asset Limit</p>
                     <p className="text-lg font-black text-indigo-400">{business.subscription === 'Premium' ? 'Unlimited' : business.subscription === 'Pro' ? '50 Units' : '10 Units'}</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Service Level</p>
                     <p className="text-lg font-black text-indigo-400">99.9% Up</p>
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Governance</p>
                     <p className="text-lg font-black text-indigo-400">Verified</p>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Upgrade / Transition Node</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(p => (
                    <div key={p.id} className={`p-8 rounded-[40px] border transition-all flex flex-col justify-between group ${business.subscription.toUpperCase() === p.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-xl'}`}>
                       <div>
                          <div className="flex justify-between items-start mb-6">
                             <div className={`w-10 h-10 ${p.bg} ${p.color} rounded-xl flex items-center justify-center border border-current opacity-60`}>
                                <i className={`fas ${p.id === 'BASIC' ? 'fa-leaf' : p.id === 'PRO' ? 'fa-rocket' : 'fa-gem'}`}></i>
                             </div>
                             {business.subscription.toUpperCase() === p.id && (
                               <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-1 rounded-md uppercase">Current</span>
                             )}
                          </div>
                          <h5 className="font-black text-slate-900 uppercase text-sm mb-1">{p.name}</h5>
                          <p className="text-lg font-black text-indigo-600 mb-6">{p.price}</p>
                          <ul className="space-y-3 mb-8">
                             <li className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><i className="fas fa-check text-emerald-500"></i> {p.commission} Com.</li>
                             <li className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase"><i className="fas fa-check text-emerald-500"></i> {p.units} Limit</li>
                             {p.features.map(f => (
                               <li key={f} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><i className="fas fa-plus text-indigo-300"></i> {f}</li>
                             ))}
                          </ul>
                       </div>
                       {business.subscription.toUpperCase() !== p.id && (
                         <button onClick={() => alert(`Initiating transition protocol to ${p.id}. Redirecting to Treasury Checkout.`)} className="w-full py-3 bg-slate-950 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Authorize Plan</button>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Invoice History</h4>
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center"><i className="fas fa-file-invoice"></i></div>
             </div>
             
             <div className="space-y-4">
                {localTransactions.filter(t => t.type === 'subscription').map(tx => (
                   <div key={tx.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group">
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase mb-1">Invoice #{tx.id.toUpperCase()}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.createdAt}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-slate-900">Rp {tx.amount.toLocaleString()}</p>
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{tx.status}</span>
                      </div>
                      <button className="ml-4 p-2 bg-white text-slate-300 rounded-lg group-hover:text-indigo-600 group-hover:border-indigo-600 border border-transparent transition-all">
                         <i className="fas fa-download text-xs"></i>
                      </button>
                   </div>
                ))}
             </div>

             <div className="p-8 bg-indigo-600 rounded-[40px] shadow-xl text-white space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest">Platform Support Node</h4>
                <p className="text-xs leading-relaxed font-medium opacity-80">Having trouble with billing cycles or plan authorizations? Open a high-priority ticket with our governance team.</p>
                <button className="w-full py-4 bg-white/10 backdrop-blur rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Contact Billing Node</button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up pb-20">
      {/* Header Profile Section */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl -mr-40 -mt-40"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 pb-12 border-b border-slate-50">
          <div className="relative group">
            <img 
              src={business.logo} 
              className="w-40 h-40 rounded-[48px] object-cover ring-[12px] ring-slate-50 shadow-2xl transition-transform duration-500 group-hover:scale-105" 
              alt="Business Logo"
            />
            <button className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center shadow-xl border-4 border-white hover:bg-indigo-700 transition-colors">
              <i className="fas fa-camera"></i>
            </button>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">{business.name}</h3>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-indigo-100">{business.category} Hub</span>
              <span className={`px-6 py-2 text-[10px] font-black uppercase rounded-full border ${
                business.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                Status: {business.status}
              </span>
              <span className="px-6 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-100">Partner ID: {business.id}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Business Core Info Form */}
          <form onSubmit={handleUpdateBusiness} className="space-y-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-id-card"></i>
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Core Identity & Narratives</h4>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bisnis</label>
                <input 
                  type="text" 
                  value={business.name}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Profesional</label>
                <textarea 
                  rows={4} 
                  value={business.description}
                  onChange={(e) => setBusiness({...business, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kontak</label>
                    <input type="email" value={business.contactEmail || ''} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon Bisnis</label>
                    <input type="text" value={business.contactPhone || ''} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900" />
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-map-location-dot"></i>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Geospatial & Hours</h4>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap & Peta Lokasi</label>
                  <input 
                    type="text" 
                    value={business.address}
                    onChange={(e) => setBusiness({...business, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Buka</label>
                      <input type="time" value={business.operatingHours?.open} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Jam Tutup</label>
                      <input type="time" value={business.operatingHours?.close} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hari Operasional</label>
                      <input type="text" value={business.operatingHours?.days} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900" />
                   </div>
                </div>
              </div>
            </div>
          </form>

          {/* Secondary Info Form */}
          <div className="space-y-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-share-nodes"></i>
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Digital Presence & Socials</h4>
            </div>
            
            <div className="space-y-6">
               <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                  <div className="flex items-center gap-4">
                     <i className="fab fa-instagram text-xl text-rose-500"></i>
                     <input type="text" placeholder="@username" value={business.socials?.instagram} className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold" />
                  </div>
                  <div className="flex items-center gap-4">
                     <i className="fas fa-globe text-xl text-indigo-500"></i>
                     <input type="text" placeholder="https://website.com" value={business.socials?.website} className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold" />
                  </div>
                  <div className="flex items-center gap-4">
                     <i className="fab fa-facebook text-xl text-blue-600"></i>
                     <input type="text" placeholder="facebook.com/page" className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-3 text-xs font-bold" />
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-magnifying-glass-chart"></i>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">SEO & Discovery Matrix</h4>
              </div>
              <div className="p-8 bg-slate-950 rounded-[40px] text-white space-y-6 shadow-2xl">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Global SEO Title</label>
                    <input type="text" value={business.seoMetadata?.title} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-bold focus:ring-2 ring-indigo-50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Discovery Description (Meta)</label>
                    <textarea value={business.seoMetadata?.description} rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-bold focus:ring-2 ring-indigo-50 resize-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Master Keywords</label>
                    <input type="text" value={business.seoMetadata?.keywords} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-mono" />
                 </div>
              </div>
            </div>

            <div className="pt-10 space-y-6">
               <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between">
                  <div>
                     <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">Status Publikasi</h4>
                     <p className="text-[10px] text-slate-400 font-bold">Menentukan visibilitas di Marketplace</p>
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
                     <button className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${business.status === 'active' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>Public</button>
                     <button className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${business.status === 'suspended' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-slate-600'}`}>Private</button>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <button onClick={handleUpdateBusiness} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
                    Simpan Identitas Bisnis
                  </button>
                  <button onClick={() => setActiveModule('overview')} className="w-full py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Kembali Ke Dasbor
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* User Personal Profile Section */}
        <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -ml-40 -mt-40 opacity-40"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-shield"></i>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Governing Partner Account</h4>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-10 mb-12 pb-12 border-b border-slate-50">
                <div className="relative group">
                   <img src={currentUser?.avatar} className="w-24 h-24 rounded-[32px] object-cover ring-8 ring-slate-50 shadow-xl group-hover:scale-105 transition-transform" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{currentUser?.name}</h3>
                   <div className="flex gap-4">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{currentUser?.role}</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">• Identity Verified</span>
                   </div>
                </div>
             </div>

             <form onSubmit={handleUpdateProfile} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity Name</label>
                   <div className="relative">
                      <i className="fas fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                         type="text" 
                         value={profileName}
                         onChange={(e) => setProfileName(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                      />
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Protocol (Phone)</label>
                   <div className="relative">
                      <i className="fas fa-phone absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                      <input 
                         type="text" 
                         value={profilePhone}
                         onChange={(e) => setProfilePhone(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50 transition-all" 
                      />
                   </div>
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                   <button 
                     disabled={isSaving}
                     className="px-12 py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                   >
                      {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>}
                      Update Personal Node
                   </button>
                </div>
             </form>
          </div>
       </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                <i className="fas fa-hotel"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900">Partner Node</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md self-start">{business.category} Hub</span>
             </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
           {navItems.map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide">
         <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{activeModule} Matrix</h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-slate-900 uppercase">Operational</span>
                    </div>
                </div>
            </div>
         </header>

         <div className="p-12 max-w-[1600px] mx-auto">
            {activeModule === 'overview' && renderOverview()}
            {activeModule === 'inventory' && renderInventory()}
            {activeModule === 'bookings' && renderBookings()}
            {activeModule === 'finance' && renderFinance()}
            {activeModule === 'marketing' && renderMarketing()}
            {activeModule === 'team' && renderTeam()}
            {activeModule === 'reviews' && renderReviews()}
            {activeModule === 'analytics' && renderAnalytics()}
            {activeModule === 'activity' && renderActivity()}
            {activeModule === 'subscription' && renderSubscription()}
            {activeModule === 'profile' && renderProfile()}
         </div>
      </main>
    </div>
  );
};
