
import React, { useState, useEffect, useMemo } from 'react';
import { Business, Unit, User, Review, BookingStatus, SubscriptionPlan } from '../types';
import { MOCK_UNITS, MOCK_REVIEWS, MOCK_USERS } from '../constants';

interface PropertyDetailProps {
  property: Business;
  onBack: () => void;
  currentUser: User | null;
  onLoginRequired: () => void;
}

type BookingStep = 'details' | 'payment' | 'processing';

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, currentUser, onLoginRequired }) => {
  const propertyUnits = MOCK_UNITS.filter(u => u.businessId === property.id);
  const host = MOCK_USERS.find(u => u.id === property.ownerId);
  
  const [selectedUnit, setSelectedUnit] = useState<Unit>(propertyUnits[0] || MOCK_UNITS[0]);
  const [checkIn, setCheckIn] = useState('2024-12-28');
  const [checkOut, setCheckOut] = useState('2024-12-30');
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const priceEstimation = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const roomTotal = selectedUnit.price * nights;
    const serviceFee = property.serviceFee || 25000;
    return { nights, roomTotal, serviceFee, grandTotal: roomTotal + serviceFee };
  }, [checkIn, checkOut, selectedUnit, property.serviceFee]);

  const propertyReviews = MOCK_REVIEWS.filter(r => r.businessId === property.id && r.status === 'approved');

  const handleInitiateBooking = () => {
    if (!currentUser) { setShowAuthAlert(true); return; }
    setBookingStep('payment');
  };

  const handleFinalizeTransaction = () => {
    setBookingStep('processing');
    setTimeout(() => {
      alert('Node Transaction Dispatched: Reservasi Anda telah masuk ke antrean verifikasi treasury.');
      onBack();
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-up pb-32 px-4 md:px-8">
      {/* --- TOP ACTIONS --- */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-all group">
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Kembali ke Eksplorasi
        </button>
        <div className="flex gap-4">
           <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-all"><i className="far fa-heart"></i></button>
           <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><i className="fas fa-share-nodes"></i></button>
        </div>
      </div>

      {/* --- 1. MEDIA GALLERY MATRIX --- */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px] md:h-[600px]">
        <div 
          onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
          className="md:col-span-2 rounded-[48px] overflow-hidden shadow-2xl relative cursor-pointer group"
        >
          <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Main" />
          <div className="absolute top-8 left-8 flex gap-3">
             <span className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-xl">{property.category}</span>
             <span className="bg-slate-950 px-5 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl border border-white/10">Verified Node</span>
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl border border-white/30"><i className="fas fa-expand"></i></div>
          </div>
        </div>
        <div className="hidden md:block md:col-span-1 rounded-[48px] overflow-hidden shadow-xl cursor-pointer group relative">
           <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="hidden md:flex md:col-span-1 flex-col gap-4">
           <div className="flex-1 rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer bg-slate-950">
              <img src={property.images[0]} className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                 <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl shadow-2xl border border-white/30 group-hover:scale-110 transition-transform animate-pulse">
                    <i className="fas fa-play"></i>
                 </div>
                 <span className="text-white font-black uppercase tracking-[0.3em] text-[8px]">Virtual Tour Node</span>
              </div>
           </div>
           <div 
             onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
             className="flex-1 rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer"
           >
              <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-slate-950/20 transition-all">
                 <span className="text-white font-black uppercase tracking-widest text-[10px]">View All {property.images.length}+ Gallery</span>
              </div>
           </div>
        </div>
      </section>

      {/* --- 2. CORE CONTENT & TRANSACTION SPLIT --- */}
      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-16">
          
          {/* Headline & Identity */}
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4">
                   <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{property.name}</h1>
                   <p className="flex items-center gap-3 text-slate-500 font-bold text-lg">
                      <i className="fas fa-location-dot text-indigo-500"></i>
                      {property.address}
                   </p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-center min-w-[140px]">
                   <div className="flex items-center justify-center gap-2 text-amber-400 text-2xl mb-1">
                      <i className="fas fa-star"></i>
                      <span className="font-black text-slate-900 tracking-tighter">{property.rating}</span>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{propertyReviews.length} Verified Reviews</p>
                </div>
             </div>
             <div className="flex flex-wrap gap-2">
                {property.tags?.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">#{tag}</span>
                ))}
             </div>
          </div>

          {/* Description Node */}
          <div className="space-y-6">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Narasi Properti</h3>
             <div className="p-10 bg-white rounded-[56px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[64px]"></div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">{property.description}</p>
             </div>
          </div>

          {/* Infrastructure Matrix (Amenities) */}
          <div className="space-y-8">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Fasilitas & Infrastruktur</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Fiber WiFi', icon: 'fa-wifi', desc: 'High speed Node' },
                  { name: 'Parking Hub', icon: 'fa-car-side', desc: 'Secure Zone' },
                  { name: 'Laundry Sync', icon: 'fa-shirt', desc: 'Next-day service' },
                  { name: 'Kitchen Node', icon: 'fa-utensils', desc: 'Fully equipped' },
                ].map(a => (
                  <div key={a.name} className="p-8 bg-white border border-slate-100 rounded-[48px] flex flex-col items-center justify-center text-center gap-4 group hover:border-indigo-600 transition-all hover:shadow-xl shadow-sm">
                    <div className="w-14 h-14 bg-slate-50 text-indigo-400 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                       <i className={`fas ${a.icon}`}></i>
                    </div>
                    <div>
                       <p className="text-[11px] font-black uppercase text-slate-900 tracking-widest leading-none mb-1">{a.name}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{a.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Geospatial Map Section */}
          <div className="space-y-8">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Geospatial Validation</h3>
             <div className="h-96 w-full bg-slate-50 rounded-[56px] border-8 border-white shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-indigo-900/5 group-hover:bg-transparent transition-all"></div>
                <iframe 
                  title="Property Location"
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.0!2d${property.location.lng}!3d${property.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v123456789`}
                  className="w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                ></iframe>
                <div className="absolute bottom-8 left-8">
                   <div className="bg-slate-950 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/10">
                      <i className="fas fa-location-crosshairs text-indigo-400"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Verify Precise Location</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Rules & Policy Ledger */}
          <div className="space-y-8">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Protokol & Kebijakan</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-10 bg-white border border-slate-100 rounded-[48px] space-y-6 shadow-sm">
                   <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3">
                      <i className="fas fa-clock"></i> Temporal Schedule
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-bold uppercase">
                         <span className="text-slate-400">Check-In Protocol:</span>
                         <span className="text-slate-900">14:00 WIB</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold uppercase">
                         <span className="text-slate-400">Check-Out Protocol:</span>
                         <span className="text-slate-900">12:00 WIB</span>
                      </div>
                   </div>
                </div>
                <div className="p-10 bg-white border border-slate-100 rounded-[48px] space-y-6 shadow-sm">
                   <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3">
                      <i className="fas fa-ban"></i> Access Restrictions
                   </h4>
                   <div className="space-y-4">
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Tidak diperkenankan membawa hewan peliharaan. Area bebas asap rokok di seluruh unit node.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Meet the Business / Host */}
          <div className="bg-slate-950 p-12 rounded-[64px] shadow-2xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <img src={host?.avatar} className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-white/10 shadow-2xl" />
                <div className="flex-1 text-center md:text-left space-y-6">
                   <div>
                      <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mb-3">Verified Entity Host</p>
                      <h4 className="text-3xl font-black uppercase tracking-tight italic">{property.name} Management</h4>
                   </div>
                   <p className="text-indigo-100/40 text-sm font-medium leading-relaxed max-w-lg">Entitas ini telah menjadi bagian dari ekosistem Seulanga sejak {property.registrationDate || 'awal 2024'} dengan performa layanan node grade A.</p>
                   <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl">Kunjungi Profil</button>
                      <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Hubungi Node</button>
                   </div>
                </div>
             </div>
          </div>

          {/* Reputation Hub (Reviews) */}
          <div className="space-y-10 pb-12">
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Reputation Feed</h3>
             <div className="grid grid-cols-1 gap-8">
                {propertyReviews.map(review => (
                   <div key={review.id} className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm space-y-6 hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-6">
                            <img src={`https://i.pravatar.cc/150?u=${review.guestId}`} className="w-16 h-16 rounded-[24px] object-cover ring-4 ring-slate-50 shadow-sm" />
                            <div>
                               <p className="font-black text-slate-900 uppercase text-sm">{review.guestName}</p>
                               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verified Residency Node</p>
                            </div>
                         </div>
                         <div className="flex text-amber-400 gap-1.5 text-sm bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                            <i className="fas fa-star"></i>
                            <span className="font-black text-slate-900">{review.rating}</span>
                         </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium italic text-lg relative z-10">"{review.comment}"</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">{review.createdAt}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* --- 3. STICKY TRANSACTION WIDGET --- */}
        <aside className="lg:col-span-4">
           <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-2xl space-y-10 sticky top-32 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              
              {bookingStep === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">Rp {selectedUnit.price.toLocaleString()}</span>
                            <span className="text-sm font-bold text-slate-400 mb-2">/ nt</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Instant Booking Active</span>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 p-2">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 focus-within:ring-2 ring-indigo-100 transition-all">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Inbound Axis</label>
                        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 focus-within:ring-2 ring-indigo-100 transition-all">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Outbound Axis</label>
                        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" />
                      </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Unit Configuration</p>
                      <select 
                        value={selectedUnit.id}
                        onChange={(e) => setSelectedUnit(propertyUnits.find(u => u.id === e.target.value)!)}
                        className="w-full bg-transparent font-black text-sm text-slate-900 outline-none cursor-pointer"
                      >
                        {propertyUnits.map(u => (
                          <option key={u.id} value={u.id}>{u.name.toUpperCase()} ({u.capacity} PAX)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6 py-8 border-y border-slate-50">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Cycle Total ({priceEstimation.nights} Nt)</span>
                       <span className="text-slate-900">Rp {priceEstimation.roomTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Platform Treasury Fee</span>
                       <span className="text-slate-900">Rp {priceEstimation.serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Settlement Payload</span>
                       <span className="text-3xl font-black text-indigo-600">Rp {priceEstimation.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleInitiateBooking}
                    className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-100 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Lanjutkan Protokol Bayar
                  </button>
                </div>
              )}

              {bookingStep === 'payment' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                  <button onClick={() => setBookingStep('details')} className="text-[10px] font-black text-slate-400 uppercase hover:text-indigo-600 flex items-center gap-2"><i className="fas fa-arrow-left"></i> Edit Order Details</button>
                  <div className="p-8 bg-slate-950 rounded-[40px] text-white space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-white/5 pb-4">
                          <span className="text-[9px] font-black text-indigo-300 uppercase">Treasury Node</span>
                          <span className="text-xs font-black">BCA SEULANGA HUB</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-4">
                          <span className="text-[9px] font-black text-indigo-300 uppercase">Account Endpoint</span>
                          <span className="text-lg font-black tracking-widest">8823 0011 2299</span>
                       </div>
                    </div>
                    <div className="text-center pt-2">
                       <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Total Transmission</p>
                       <p className="text-4xl font-black text-emerald-400">Rp {priceEstimation.grandTotal.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Digital Evidence</p>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:border-indigo-400 transition-all group bg-slate-50/50">
                       <i className={`fas ${paymentProof ? 'fa-check-circle text-emerald-500' : 'fa-cloud-arrow-up text-slate-300'} text-3xl mb-4 group-hover:scale-110 transition-transform`}></i>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{paymentProof ? paymentProof.name : 'Select Transfer Proof Shard'}</p>
                       <input type="file" className="hidden" onChange={(e) => e.target.files && setPaymentProof(e.target.files[0])} />
                    </label>
                  </div>
                  <button 
                    disabled={!paymentProof}
                    onClick={handleFinalizeTransaction}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all ${paymentProof ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Selesaikan Transaksi
                  </button>
                </div>
              )}

              {bookingStep === 'processing' && (
                <div className="py-24 text-center space-y-8 animate-in zoom-in-95">
                   <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-microchip text-indigo-600 text-2xl animate-pulse"></i></div>
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Syncing Protocol</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[200px] mx-auto">Menghubungkan payload transaksi dengan unit properti...</p>
                   </div>
                   <div className="flex flex-col gap-2 px-10">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress"></div>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Authorized alpha-v4 active</span>
                   </div>
                </div>
              )}

              <div className="p-6 bg-slate-50 rounded-3xl text-center flex items-center justify-center gap-4 group hover:bg-indigo-50 transition-all">
                 <i className="fas fa-shield-halved text-indigo-300 group-hover:text-indigo-600 transition-colors"></i>
                 <p className="text-[9px] font-black text-slate-400 group-hover:text-indigo-900 transition-colors uppercase tracking-widest italic">Secured by Seulanga Unified Treasury Hub</p>
              </div>
           </div>
        </aside>
      </div>

      {/* --- AUTH REQUIRED MODAL --- */}
      {showAuthAlert && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[56px] shadow-2xl p-12 text-center space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto text-4xl shadow-inner border border-indigo-100"><i className="fas fa-fingerprint"></i></div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Identity Sync Required</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">Silakan sinkronisasi identitas Anda (Login) untuk melakukan transaksi pada node properti ini.</p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={onLoginRequired} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Authorize Login</button>
                 <button onClick={() => setShowAuthAlert(false)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-slate-600 transition-all">Cancel Synchronization</button>
              </div>
           </div>
        </div>
      )}

      {/* --- GALLERY MODAL --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-500">
           <button onClick={() => setIsGalleryOpen(false)} className="absolute top-10 right-10 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-3xl transition-all z-[410] border border-white/10 shadow-2xl"><i className="fas fa-times"></i></button>
           <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((prev) => (prev - 1 + property.images.length) % property.images.length); }} className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-[32px] flex items-center justify-center text-white text-4xl z-[410] border border-white/5 transition-all"><i className="fas fa-chevron-left"></i></button>
           <button onClick={(e) => { e.stopPropagation(); setActivePhotoIndex((prev) => (prev + 1) % property.images.length); }} className="absolute right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-[32px] flex items-center justify-center text-white text-4xl z-[410] border border-white/5 transition-all"><i className="fas fa-chevron-right"></i></button>
           <div className="relative w-full max-w-7xl h-[75vh] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
              <img src={property.images[activePhotoIndex]} className="w-full h-full object-contain rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8 border-white/10" />
              <div className="absolute bottom-12 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full text-white font-black uppercase text-[10px] tracking-widest border border-white/10 shadow-2xl">
                 Node Frame {activePhotoIndex + 1} / {property.images.length}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
