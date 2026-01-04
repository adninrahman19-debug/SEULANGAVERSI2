
import React, { useState, useMemo } from 'react';
import { Business, BusinessCategory, UnitStatus, SubscriptionPlan } from '../../types';
import { MOCK_BUSINESSES, MOCK_UNITS } from '../../constants';

interface PropertyDiscoveryProps {
  onSelectProperty: (property: Business) => void;
  language: 'id' | 'en';
}

export const PropertyDiscovery: React.FC<PropertyDiscoveryProps> = ({ onSelectProperty, language }) => {
  // 1. FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'ALL'>('ALL');
  const [radius, setRadius] = useState(15);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');

  const ALL_AMENITIES = ['WiFi', 'AC', 'Breakfast', 'Pool Access', 'Mini Bar', 'Gym', 'Parking'];

  // 2. FILTERING LOGIC
  const filteredProperties = useMemo(() => {
    let result = MOCK_BUSINESSES.filter(biz => {
      const matchSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          biz.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || biz.category === selectedCategory;
      
      // Simulated Radius Logic (Properties ending in '1' are closer)
      const mockDistance = biz.id.endsWith('1') ? 5 : 20;
      const matchRadius = mockDistance <= radius;

      // Price & Amenity Logic from Units
      const bizUnits = MOCK_UNITS.filter(u => u.businessId === biz.id);
      const minPrice = Math.min(...bizUnits.map(u => u.price), Infinity);
      const matchPrice = minPrice >= priceRange[0] && (priceRange[1] === 5000000 ? true : minPrice <= priceRange[1]);
      
      const allUnitAmenities = Array.from(new Set(bizUnits.flatMap(u => u.amenities)));
      const matchAmenities = selectedAmenities.every(a => allUnitAmenities.includes(a));

      const hasAvailable = !onlyAvailable || bizUnits.some(u => u.status === UnitStatus.READY && u.available);

      return matchSearch && matchCategory && matchRadius && matchPrice && matchAmenities && hasAvailable;
    });

    // 3. SORTING LOGIC
    return result.sort((a, b) => {
      const priceA = Math.min(...MOCK_UNITS.filter(u => u.businessId === a.id).map(u => u.price), 0);
      const priceB = Math.min(...MOCK_UNITS.filter(u => u.businessId === b.id).map(u => u.price), 0);

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // relevance
    });
  }, [searchQuery, selectedCategory, radius, priceRange, selectedAmenities, onlyAvailable, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const d = {
    id: {
      title: 'Discovery Engine',
      sub: 'Temukan node properti terbaik di Sumatra dengan filter presisi.',
      search_p: 'Cari nama properti atau lokasi...',
      filter_title: 'Filter Matrix',
      radius_label: 'Radius Discovery',
      price_label: 'Kapasitas Ekonomi',
      amenity_label: 'Fasilitas Utama',
      sort_label: 'Urutkan:',
      results_found: 'Properti Ditemukan',
      btn_view: 'Verifikasi Asset'
    },
    en: {
      title: 'Discovery Engine',
      sub: 'Find the best property nodes in Sumatra with precision filters.',
      search_p: 'Search property name or location...',
      filter_title: 'Filter Matrix',
      radius_label: 'Discovery Radius',
      price_label: 'Economic Capacity',
      amenity_label: 'Core Amenities',
      sort_label: 'Sort By:',
      results_found: 'Properties Found',
      btn_view: 'Verify Asset'
    }
  }[language];

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-up">
      {/* --- SIDEBAR: FILTER MATRIX --- */}
      <aside className="w-full lg:w-96 space-y-8 shrink-0">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10 sticky top-32">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                    <i className="fas fa-sliders-h"></i>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{d.filter_title}</h3>
              </div>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setRadius(15); setPriceRange([0, 5000000]); setSelectedAmenities([]); setOnlyAvailable(true); }}
                className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
              >
                Reset
              </button>
           </div>

           {/* Radius Filter */}
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.radius_label}</p>
                 <span className="text-[10px] font-black text-indigo-600">{radius} KM</span>
              </div>
              <input 
                type="range" min="1" max="50" value={radius} 
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
           </div>

           {/* Price Filter */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.price_label}</p>
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Min (Rp)</p>
                    <input 
                      type="number" value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" 
                    />
                 </div>
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Max (Rp)</p>
                    <input 
                      type="number" value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                      className="bg-transparent border-none outline-none w-full text-xs font-black text-slate-800" 
                    />
                 </div>
              </div>
           </div>

           {/* Amenity Filter */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.amenity_label}</p>
              <div className="flex flex-wrap gap-2">
                 {ALL_AMENITIES.map(amenity => (
                   <button
                     key={amenity}
                     onClick={() => toggleAmenity(amenity)}
                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                       selectedAmenities.includes(amenity) 
                         ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                         : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                     }`}
                   >
                     {amenity}
                   </button>
                 ))}
              </div>
           </div>

           {/* Availability Toggle */}
           <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer group">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ketersediaan Instan</span>
              <button 
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`w-12 h-6 rounded-full relative transition-all ${onlyAvailable ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300'}`}
              >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${onlyAvailable ? 'right-1' : 'left-1'}`}></div>
              </button>
           </label>
        </div>
      </aside>

      {/* --- MAIN AREA: SEARCH & RESULTS --- */}
      <div className="flex-1 space-y-12">
         {/* Top Search & Sort Hub */}
         <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
               <div className="flex-1 relative w-full">
                  <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    placeholder={d.search_p}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[32px] py-5 pl-16 pr-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-sm"
                  />
               </div>
               <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.sort_label}</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-black text-xs text-indigo-600 outline-none cursor-pointer"
                  >
                     <option value="relevance">Recommended</option>
                     <option value="price_low">Price: Low to High</option>
                     <option value="price_high">Price: High to Low</option>
                     <option value="rating">Top Rated</option>
                  </select>
               </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
               <button 
                onClick={() => setSelectedCategory('ALL')}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === 'ALL' ? 'bg-slate-950 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
               >
                 Semua Tipe
               </button>
               {Object.values(BusinessCategory).map(cat => (
                 <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-950 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
         </div>

         {/* Results Info */}
         <div className="flex items-center justify-between px-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{filteredProperties.length} {d.results_found}</h4>
            <div className="h-px bg-slate-100 flex-1 mx-10"></div>
         </div>

         {/* Property Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredProperties.map(biz => {
              const startPrice = MOCK_UNITS.find(u => u.businessId === biz.id)?.price || 0;
              return (
                <div key={biz.id} onClick={() => onSelectProperty(biz)} className="group bg-white rounded-[56px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col shadow-sm">
                   <div className="h-72 relative overflow-hidden">
                      <img src={biz.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={biz.name} />
                      <div className="absolute top-8 left-8 flex gap-3">
                         <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-xl">{biz.category}</span>
                         {biz.subscription === SubscriptionPlan.PREMIUM && (
                            <span className="bg-amber-400 px-4 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl">Priority Node</span>
                         )}
                      </div>
                      <div className="absolute bottom-8 right-8">
                         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-slate-900 border border-white shadow-2xl flex items-center gap-2">
                            <i className="fas fa-star text-amber-400 text-xs"></i>
                            <span className="text-sm">{biz.rating}</span>
                         </div>
                      </div>
                   </div>
                   <div className="p-10 space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none">{biz.name}</h3>
                         <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest truncate">
                            <i className="fas fa-location-dot text-indigo-500"></i>
                            {biz.address}
                         </p>
                         <div className="flex flex-wrap gap-2 pt-2">
                            {biz.tags?.slice(0, 3).map(tag => (
                               <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100">{tag}</span>
                            ))}
                         </div>
                      </div>
                      <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Starting Node</p>
                            <p className="text-xl font-black text-slate-900">Rp {(startPrice / 1000).toLocaleString()}K<span className="text-[10px] text-slate-400 font-medium">/nt</span></p>
                         </div>
                         <button className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                            {d.btn_view}
                         </button>
                      </div>
                   </div>
                </div>
              );
            })}

            {filteredProperties.length === 0 && (
              <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px] space-y-8">
                 <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto text-slate-200 text-5xl">
                    <i className="fas fa-search-location"></i>
                 </div>
                 <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Node Tidak Ditemukan</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">Ekosistem tidak menemukan properti yang sesuai dengan filter Matrix Anda. Cobalah untuk memperluas radius atau rentang harga.</p>
                    <button 
                      onClick={() => setSelectedCategory('ALL')}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      Buka Semua Node Properti
                    </button>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
