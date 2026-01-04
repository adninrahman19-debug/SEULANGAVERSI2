
import React, { useState, useMemo } from 'react';
import { Business, Unit, User } from '../../types';
import { MOCK_BUSINESSES, MOCK_UNITS } from '../../constants';

interface WishlistFavoritesProps {
  user: User;
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
}

export const WishlistFavorites: React.FC<WishlistFavoritesProps> = ({ user, onNavigate, language }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [priceAlertNodes, setPriceAlertNodes] = useState<Set<string>>(new Set(['b1']));

  // 1. DATA AGGREGATION
  // Mocking more wishlist items if user has few
  const wishlistItems = useMemo(() => {
    const savedIds = user.wishlist || ['b1'];
    return MOCK_BUSINESSES.filter(b => savedIds.includes(b.id) || b.id === 'b2');
  }, [user.wishlist]);

  const compareList = useMemo(() => 
    MOCK_BUSINESSES.filter(b => compareIds.includes(b.id)),
  [compareIds]);

  // 2. HANDLERS
  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3) // Max 3 for comparison
    );
  };

  const togglePriceAlert = (id: string) => {
    const newAlerts = new Set(priceAlertNodes);
    if (newAlerts.has(id)) newAlerts.delete(id);
    else newAlerts.add(id);
    setPriceAlertNodes(newAlerts);
    alert(`Price Guard ${newAlerts.has(id) ? 'Activated' : 'Deactivated'} for this node.`);
  };

  const d = {
    id: {
      title: 'Planning Hub',
      sub: 'Simpan, pantau harga, dan bandingkan node properti impian Anda.',
      tab_grid: 'Koleksi Saya',
      tab_compare: 'Matrix Perbandingan',
      btn_detail: 'Detail Unit',
      btn_remove: 'Hapus Shard',
      price_alert: 'Price Watch',
      compare_label: 'Bandingkan',
      empty: 'Wishlist Anda kosong.',
      compare_hint: 'Pilih hingga 3 properti untuk dibandingkan secara teknis.'
    },
    en: {
      title: 'Planning Hub',
      sub: 'Save, watch prices, and compare your dream property nodes.',
      tab_grid: 'My Collection',
      tab_compare: 'Comparison Matrix',
      btn_detail: 'Unit Details',
      btn_remove: 'Remove Shard',
      price_alert: 'Price Watch',
      compare_label: 'Compare',
      empty: 'Your wishlist is currently empty.',
      compare_hint: 'Select up to 3 properties for technical comparison.'
    }
  }[language];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. HEADER & MODE SWITCHER */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{d.title}</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">{d.sub}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[32px] border border-slate-100 shadow-sm">
           <button 
             onClick={() => setViewMode('grid')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_grid} ({wishlistItems.length})
           </button>
           <button 
             onClick={() => setViewMode('compare')}
             className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'compare' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_compare} ({compareIds.length})
           </button>
        </div>
      </div>

      {/* 2. GRID VIEW: WISHLIST CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {wishlistItems.map(biz => {
             const startPrice = MOCK_UNITS.find(u => u.businessId === biz.id)?.price || 0;
             const isWatching = priceAlertNodes.has(biz.id);
             const isComparing = compareIds.includes(biz.id);

             return (
               <div key={biz.id} className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-700 flex flex-col">
                  <div className="h-64 relative overflow-hidden">
                     <img src={biz.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                     
                     <div className="absolute top-6 left-6 flex gap-2">
                        <button 
                          onClick={() => togglePriceAlert(biz.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${isWatching ? 'bg-amber-400 text-white animate-pulse' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-amber-500'}`}
                          title={d.price_alert}
                        >
                           <i className={`fas fa-bell${isWatching ? '' : '-slash'} text-xs`}></i>
                        </button>
                        <button 
                          onClick={() => toggleCompare(biz.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${isComparing ? 'bg-indigo-600 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-indigo-600'}`}
                          title={d.compare_label}
                        >
                           <i className="fas fa-columns text-xs"></i>
                        </button>
                     </div>
                     
                     <div className="absolute top-6 right-6">
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md text-white hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all shadow-xl">
                           <i className="fas fa-heart text-xs"></i>
                        </button>
                     </div>

                     <div className="absolute bottom-6 left-8">
                        <span className="bg-white/95 backdrop-blur-md px-4 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest border border-white">{biz.category}</span>
                     </div>
                  </div>

                  <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                     <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none truncate">{biz.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate flex items-center gap-2">
                           <i className="fas fa-location-dot text-indigo-500"></i>
                           {biz.address}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry:</span>
                           <span className="text-lg font-black text-indigo-600">Rp {(startPrice/1000).toLocaleString()}K<span className="text-xs font-medium text-slate-300">/nt</span></span>
                        </div>
                     </div>

                     <button onClick={() => onNavigate('property-detail')} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                        {d.btn_detail}
                     </button>
                  </div>
               </div>
             );
           })}
           {wishlistItems.length === 0 && (
             <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px] space-y-6">
                <i className="fas fa-heart-crack text-slate-100 text-6xl"></i>
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">{d.empty}</p>
             </div>
           )}
        </div>
      )}

      {/* 3. COMPARE VIEW: TECHNICAL MATRIX */}
      {viewMode === 'compare' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {compareList.length > 1 ? (
             <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="p-12 border-r border-slate-100 min-w-[250px]">
                               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Technical Specification</h4>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Matrix Comparison Logic v1.2</p>
                            </th>
                            {compareList.map(biz => (
                               <th key={biz.id} className="p-12 min-w-[300px] border-r border-slate-100 last:border-none">
                                  <div className="space-y-6">
                                     <img src={biz.images[0]} className="w-full h-40 object-cover rounded-[32px] shadow-lg" />
                                     <div className="flex justify-between items-start">
                                        <h5 className="font-black text-slate-900 uppercase text-lg leading-tight">{biz.name}</h5>
                                        <button onClick={() => toggleCompare(biz.id)} className="text-slate-300 hover:text-rose-500"><i className="fas fa-times"></i></button>
                                     </div>
                                  </div>
                               </th>
                            ))}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {/* Pricing Matrix */}
                         <tr>
                            <td className="p-12 bg-slate-50/30 border-r border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Protocol</p>
                               <p className="text-xs font-bold text-slate-500 mt-1">Starting daily payload</p>
                            </td>
                            {compareList.map(biz => (
                               <td key={biz.id} className="p-12 border-r border-slate-100 last:border-none">
                                  <p className="text-2xl font-black text-indigo-600 tracking-tighter">Rp {(MOCK_UNITS.find(u => u.businessId === biz.id)?.price || 0).toLocaleString()}</p>
                               </td>
                            ))}
                         </tr>
                         {/* Reputation Matrix */}
                         <tr>
                            <td className="p-12 bg-slate-50/30 border-r border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reputation Rank</p>
                               <p className="text-xs font-bold text-slate-500 mt-1">Verified sentiment score</p>
                            </td>
                            {compareList.map(biz => (
                               <td key={biz.id} className="p-12 border-r border-slate-100 last:border-none">
                                  <div className="flex items-center gap-2">
                                     <span className="text-2xl font-black text-slate-900">{biz.rating}</span>
                                     <i className="fas fa-star text-amber-400 text-sm"></i>
                                  </div>
                               </td>
                            ))}
                         </tr>
                         {/* Infrastructure Matrix */}
                         <tr>
                            <td className="p-12 bg-slate-50/30 border-r border-slate-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Infrastructure Node</p>
                               <p className="text-xs font-bold text-slate-500 mt-1">Core amenities matrix</p>
                            </td>
                            {compareList.map(biz => {
                               const units = MOCK_UNITS.filter(u => u.businessId === biz.id);
                               const allAm = Array.from(new Set(units.flatMap(u => u.amenities)));
                               return (
                                 <td key={biz.id} className="p-12 border-r border-slate-100 last:border-none">
                                    <div className="flex flex-wrap gap-2">
                                       {allAm.slice(0, 5).map(a => (
                                          <span key={a} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200">{a}</span>
                                       ))}
                                    </div>
                                 </td>
                               );
                            })}
                         </tr>
                         {/* Action Matrix */}
                         <tr>
                            <td className="p-12 bg-slate-50/30 border-r border-slate-100"></td>
                            {compareList.map(biz => (
                               <td key={biz.id} className="p-12 border-r border-slate-100 last:border-none">
                                  <button onClick={() => onNavigate('property-detail')} className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Select Node</button>
                               </td>
                            ))}
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <div className="py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px] space-y-8">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto text-slate-200 text-4xl shadow-inner border border-white">
                   <i className="fas fa-columns"></i>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase">Matrix Mode Offline</h3>
                   <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2 leading-relaxed">{d.compare_hint}</p>
                </div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                >
                   Return to Grid Selection
                </button>
             </div>
           )}
        </div>
      )}

      {/* 4. SYSTEM INFOTIP */}
      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <i className="fas fa-microchip text-indigo-400 text-2xl animate-pulse"></i>
            <div>
               <p className="text-sm font-black text-slate-900 uppercase italic">Smart Price Guard Protocol</p>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Sistem akan mengirimkan sinyal instan jika terdapat fluktuasi harga pada node yang Anda pantau.</p>
            </div>
         </div>
         <button className="relative z-10 px-10 py-4 bg-white border border-slate-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Enable Global Alerts</button>
      </div>
    </div>
  );
};
