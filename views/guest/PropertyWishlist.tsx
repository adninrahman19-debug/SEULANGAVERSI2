
import React from 'react';
import { Business } from '../../types';
import { MOCK_BUSINESSES } from '../../constants';

interface PropertyWishlistProps {
  onSelect: (biz: Business) => void;
}

export const PropertyWishlist: React.FC<PropertyWishlistProps> = ({ onSelect }) => {
  const wishlist = MOCK_BUSINESSES.slice(0, 2); // Simulating saved nodes

  return (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Curated Planning Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Daftar properti yang telah Anda tandai untuk rencana masa depan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {wishlist.map(biz => (
           <div key={biz.id} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-700 group cursor-pointer shadow-sm flex flex-col">
              <div className="h-64 relative overflow-hidden" onClick={() => onSelect(biz)}>
                 <img src={biz.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={biz.name} />
                 <div className="absolute top-6 right-6">
                    <button className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                       <i className="fas fa-heart"></i>
                    </button>
                 </div>
                 <div className="absolute bottom-6 left-8">
                    <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-lg">{biz.category}</span>
                 </div>
              </div>
              <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                 <div onClick={() => onSelect(biz)}>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors leading-none">{biz.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                       <i className="fas fa-location-dot text-indigo-500"></i>
                       {biz.address}
                    </p>
                 </div>
                 <button onClick={() => onSelect(biz)} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                    Verifikasi Detail & Pesan
                 </button>
              </div>
           </div>
        ))}
        {wishlist.length === 0 && (
           <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-200 rounded-[56px] space-y-8">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 text-4xl">
                 <i className="fas fa-heart-crack"></i>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase">Belum Ada Wishlist</h3>
                 <p className="text-slate-400 font-medium max-w-xs mx-auto">Mulailah menandai properti favorit Anda saat menjelajahi Marketplace.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
