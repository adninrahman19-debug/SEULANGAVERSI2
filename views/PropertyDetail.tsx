import React, { useState, useEffect, useMemo } from 'react';
import { Business, Unit, User, Review, BookingStatus } from '../types';
import { MOCK_UNITS, MOCK_REVIEWS } from '../constants';

interface PropertyDetailProps {
  property: Business;
  onBack: () => void;
  currentUser: User | null;
  onLoginRequired: () => void;
}

type BookingStep = 'details' | 'payment' | 'processing';

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, currentUser, onLoginRequired }) => {
  const propertyUnits = MOCK_UNITS.filter(u => u.businessId === property.id);
  
  // Transaction States
  const [selectedUnit, setSelectedUnit] = useState<Unit>(propertyUnits[0] || MOCK_UNITS[0]);
  const [checkIn, setCheckIn] = useState('2024-12-24');
  const [checkOut, setCheckOut] = useState('2024-12-26');
  const [bookingStep, setBookingStep] = useState<BookingStep>('details');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  // Price Calculation Logic
  const priceEstimation = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const roomTotal = selectedUnit.price * nights;
    const serviceFee = property.serviceFee || 25000;
    return {
      nights,
      roomTotal,
      serviceFee,
      grandTotal: roomTotal + serviceFee
    };
  }, [checkIn, checkOut, selectedUnit, property.serviceFee]);

  const propertyReviews = MOCK_REVIEWS.filter(r => r.businessId === property.id && r.status === 'approved');

  const handleInitiateBooking = () => {
    if (!currentUser) {
      setShowAuthAlert(true);
      return;
    }
    setBookingStep('payment');
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleFinalizeTransaction = () => {
    setBookingStep('processing');
    setTimeout(() => {
      alert('Transaksi Berhasil! Reservasi Anda sedang diverifikasi oleh treasury node.');
      onBack();
    }, 3000);
  };

  const nextPhoto = () => setActivePhotoIndex((prev) => (prev + 1) % property.images.length);
  const prevPhoto = () => setActivePhotoIndex((prev) => (prev - 1 + property.images.length) % property.images.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-up pb-20 px-4 md:px-8">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-colors">
        <i className="fas fa-arrow-left"></i> Back to Marketplace
      </button>

      {/* Hero Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
        <div 
          onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
          className="md:col-span-2 rounded-[40px] overflow-hidden shadow-2xl relative cursor-pointer group"
        >
          <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main property" />
          <div className="absolute top-8 left-8 flex gap-3">
             <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">{property.category}</span>
             <span className="bg-emerald-600 px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">Elite Verified</span>
          </div>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <i className="fas fa-expand text-white text-3xl"></i>
          </div>
        </div>
        <div className="md:col-span-1 rounded-[40px] overflow-hidden shadow-xl cursor-pointer group relative">
           <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery image 1" />
           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <i className="fas fa-expand text-white text-2xl"></i>
           </div>
        </div>
        <div className="md:col-span-1 flex flex-col gap-4">
           <div className="flex-1 rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer bg-slate-950">
              <img src={property.images[0]} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" alt="Gallery image 2" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-xl shadow-2xl border border-white/30 group-hover:scale-110 transition-transform">
                    <i className="fas fa-play"></i>
                 </div>
                 <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Video Tour</span>
              </div>
           </div>
           <div 
             onClick={() => { setActivePhotoIndex(0); setIsGalleryOpen(true); }}
             className="flex-1 rounded-[40px] overflow-hidden shadow-xl relative group cursor-pointer"
           >
              <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="More photos" />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-slate-950/20">
                 <span className="text-white font-black uppercase tracking-[0.2em] text-xs">View {property.images.length}+ Photos</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none uppercase">{property.name}</h1>
                <p className="flex items-center gap-3 text-slate-500 font-bold text-lg">
                  <i className="fas fa-location-dot text-indigo-500"></i>
                  {property.address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-xl border border-emerald-100 shadow-sm">
                   <i className="fas fa-star text-sm"></i> {property.rating}
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{propertyReviews.length} Guest Reviews</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
               {property.tags?.map(tag => (
                 <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">#{tag}</span>
               ))}
            </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Narrative Description</h3>
             <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm space-y-6">
                <p className="text-slate-600 leading-relaxed text-lg font-medium">{property.description}</p>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Infrastructure & Amenities</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Fiber WiFi', icon: 'fa-wifi' },
                  { name: 'Climate Control', icon: 'fa-snowflake' },
                  { name: 'Smart Access', icon: 'fa-key' },
                  { name: 'Infinity Pool', icon: 'fa-water-ladder' },
                ].map(a => (
                  <div key={a.name} className="p-8 bg-white border border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 group hover:border-indigo-600 transition-all hover:shadow-xl shadow-sm">
                    <div className="w-14 h-14 bg-slate-50 text-indigo-400 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       <i className={`fas ${a.icon}`}></i>
                    </div>
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest group-hover:text-slate-900">{a.name}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-10">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Reputation Hub</h3>
             <div className="grid grid-cols-1 gap-6">
                {propertyReviews.map(review => (
                   <div key={review.id} className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-5">
                            <img src={`https://i.pravatar.cc/150?u=${review.guestId}`} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50" />
                            <div>
                               <p className="font-black text-slate-900 uppercase text-sm">{review.guestName}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Stay</p>
                            </div>
                         </div>
                         <div className="flex text-amber-400 gap-1 text-sm">
                            {[...Array(5)].map((_, i) => <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star`}></i>)}
                         </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium italic text-lg">"{review.comment}"</p>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Transaction Widget */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-2xl space-y-10 sticky top-32">
              {bookingStep === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">Rp {selectedUnit.price.toLocaleString()}</span>
                        <span className="text-sm font-bold text-slate-400 mb-2">/ nt</span>
                    </div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-bolt"></i> Real-time Availability Node
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 p-2">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Check-In</label>
                        <input 
                          type="date" value={checkIn} 
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" 
                        />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-200">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Check-Out</label>
                        <input 
                          type="date" value={checkOut} 
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" 
                        />
                      </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Unit Asset</p>
                      <select 
                        value={selectedUnit.id}
                        onChange={(e) => {
                          const unit = propertyUnits.find(u => u.id === e.target.value);
                          if (unit) setSelectedUnit(unit);
                        }}
                        className="w-full bg-transparent font-black text-sm text-slate-800 outline-none cursor-pointer"
                      >
                        {propertyUnits.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.capacity} Pax)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-5 py-8 border-y border-slate-50">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span>Cycle Total ({priceEstimation.nights} Nt)</span>
                       <span className="text-slate-900 font-black">Rp {priceEstimation.roomTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span>Treasury Fee</span>
                       <span className="text-slate-900">Rp {priceEstimation.serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Est. Settlement</span>
                       <span className="text-3xl font-black text-indigo-600">Rp {priceEstimation.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleInitiateBooking}
                    className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] shadow-indigo-200 transition-all"
                  >
                    Lanjutkan Pembayaran
                  </button>
                </div>
              )}

              {bookingStep === 'payment' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                  <button onClick={() => setBookingStep('details')} className="text-xs font-black text-slate-400 uppercase hover:text-indigo-600">
                    <i className="fas fa-arrow-left mr-2"></i> Edit Details
                  </button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Authorized Payment</h3>
                    <p className="text-slate-400 text-sm font-medium">Please transfer the total amount to the account below.</p>
                  </div>
                  <div className="p-8 bg-slate-950 rounded-[40px] text-white space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Bank Node</span>
                      <span className="font-black">BCA SEULANGA HUB</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Account Number</span>
                      <span className="font-black text-xl tracking-widest">8823 0011 2299</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Total Amount</span>
                      <span className="font-black text-emerald-400 text-2xl">Rp {priceEstimation.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Bukti Pembayaran</p>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:border-indigo-400 transition-all group">
                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <i className={`fas ${paymentProof ? 'fa-check-circle text-emerald-500' : 'fa-cloud-arrow-up text-slate-300'} text-3xl mb-4 group-hover:scale-110 transition-transform`}></i>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {paymentProof ? paymentProof.name : 'Pilih File Bukti Transfer'}
                          </p>
                       </div>
                       <input type="file" className="hidden" onChange={handleUploadProof} />
                    </label>
                  </div>
                  <button 
                    disabled={!paymentProof}
                    onClick={handleFinalizeTransaction}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all ${
                      paymentProof ? 'bg-emerald-600 text-white hover:scale-[1.02]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Selesaikan Transaksi
                  </button>
                </div>
              )}

              {bookingStep === 'processing' && (
                <div className="py-20 text-center space-y-8 animate-in zoom-in-95">
                   <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute inset-0 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <i className="fas fa-microchip text-indigo-600 text-2xl animate-pulse"></i>
                      </div>
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Syncing with Treasury</h3>
                      <p className="text-slate-500 font-medium text-sm">Authorizing transaction sequence and notifying property node...</p>
                   </div>
                   <div className="flex flex-col gap-2">
                      <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress"></div>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Digital Audit active</span>
                   </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Secured by Seulanga Unified Treasury</p>
              </div>
           </div>

           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <h4 className="font-black text-xl tracking-tight uppercase">Protocol & Rules</h4>
              <div className="space-y-6">
                 <div className="flex gap-5 items-start">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
                       <i className="fas fa-ban"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Cancellation</p>
                       <p className="text-xs font-medium text-white/60 leading-relaxed">Full refund if cancelled within 48h.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Auth Alert Modal */}
      {showAuthAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl">
                 <i className="fas fa-user-lock"></i>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Sync Required</h3>
                 <p className="text-slate-500 font-medium">Please login as a verified guest to authorize transactions.</p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={onLoginRequired} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Authorize Login</button>
                 <button onClick={() => setShowAuthAlert(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest">Abort</button>
              </div>
           </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
           <button onClick={() => setIsGalleryOpen(false)} className="absolute top-10 right-10 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl transition-all z-[110]"><i className="fas fa-times"></i></button>
           <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl z-[110]"><i className="fas fa-chevron-left"></i></button>
           <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white text-3xl z-[110]"><i className="fas fa-chevron-right"></i></button>
           <div className="relative w-full max-w-7xl h-[70vh] flex items-center justify-center p-6">
              <img src={property.images[activePhotoIndex]} className="w-full h-full object-contain rounded-[40px] shadow-2xl" />
           </div>
        </div>
      )}
    </div>
  );
};
