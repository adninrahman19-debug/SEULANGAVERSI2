
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_UNITS } from '../constants';
import { BusinessCategory, Business, UnitStatus } from '../types';

interface MarketplaceProps {
  onSelectProperty: (property: Business) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onSelectProperty }) => {
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'All'>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [radius, setRadius] = useState(10); // in KM
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  
  // Sorting State
  const [sortBy, setSortBy] = useState<'Recommended' | 'Price: Low' | 'Price: High' | 'Rating'>('Recommended');

  const ALL_AMENITIES = ['WiFi', 'AC', 'Breakfast', 'Pool Access', 'Mini Bar', 'City View', 'Gym', 'Parking'];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredProperties = useMemo(() => {
    let result = MOCK_BUSINESSES.filter(b => {
      // 1. Search Query
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.address.toLowerCase().includes(search.toLowerCase());
      
      // 2. Business Category
      const matchCategory = selectedCategory === 'All' || b.category === selectedCategory;
      
      // 3. Radius (Mocked: properties with ID ending in '1' are closer)
      const mockDistance = b.id.endsWith('1') ? 5 : 15;
      const matchRadius = mockDistance <= radius;

      // 4. Amenities (Must contain all selected)
      // Check if any unit in the business has the requested amenities
      const bizUnits = MOCK_UNITS.filter(u => u.businessId === b.id);
      const allUnitAmenities = Array.from(new Set(bizUnits.flatMap(u => u.amenities)));
      const matchAmenities = selectedAmenities.every(a => allUnitAmenities.includes(a));

      // 5. Availability (Mocked: check if any unit is Ready)
      const hasReadyUnits = bizUnits.some(u => u.status === UnitStatus.READY && u.available);

      return matchSearch && matchCategory && matchRadius && matchAmenities && hasReadyUnits;
    });

    // 6. Price Range Filtering & Sorting
    // For this mock, we use a fixed starting price or derive from first unit
    const getBizPrice = (bizId: string) => MOCK_UNITS.find(u => u.businessId === bizId)?.price || 0;

    result = result.filter(b => {
      const price = getBizPrice(b.id);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting Logic
    return result.sort((a, b) => {
      if (sortBy === 'Price: Low') return getBizPrice(a.id) - getBizPrice(b.id);
      if (sortBy === 'Price: High') return getBizPrice(b.id) - getBizPrice(a.id);
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0; // Recommended / Relevance
    });
  }, [search, selectedCategory, priceRange, radius, selectedAmenities, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-up">
      {/* Comprehensive discovery Sidebar */}
      <aside className="w-full lg:w-96 space-y-8 shrink-0">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10 sticky top-24 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                   <i className="fas fa-sliders"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Filter Matrix</h3>
             </div>
             <button 
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setPriceRange([0, 10000000]);
                setRadius(10);
                setSelectedAmenities([]);
              }}
              className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
             >
              Reset
             </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Search Node</p>
            <div className="relative">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                placeholder="Property name or city..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
          </div>

          {/* Topology Filter */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Topology</p>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>Universal Hub</span>
                {selectedCategory === 'All' && <i className="fas fa-check-circle"></i>}
              </button>
              {Object.values(BusinessCategory).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <i className="fas fa-check-circle"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Filter */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Discovery Radius</p>
              <span className="text-[11px] font-black text-indigo-600">{radius} KM</span>
            </div>
            <input 
              type="range" min="1" max="50" value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Economic Capacity</p>
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

          {/* Amenities Filter */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Amenities</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    selectedAmenities.includes(amenity) 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Date */}
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Node (Availability)</p>
             <div className="space-y-2">
                <div className="relative">
                   <i className="far fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                    type="date" value={availableFrom} 
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none" 
                   />
                </div>
                <div className="relative">
                   <i className="far fa-calendar-check absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                   <input 
                    type="date" value={availableTo} 
                    onChange={(e) => setAvailableTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none" 
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between min-h-[240px]">
            <div>
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-8">
                  <i className="fas fa-headset text-indigo-400 text-xl"></i>
               </div>
               <h4 className="font-black text-2xl tracking-tighter mb-2">Concierge Support</h4>
               <p className="text-indigo-200/60 font-medium text-xs leading-relaxed">Need help choosing a property node? Our team is live 24/7.</p>
            </div>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] transition-transform">
              Open Channel
            </button>
          </div>
        </div>
      </aside>

      {/* Main Exploration Grid */}
      <div className="flex-1 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
           <div>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Marketplace Explorer</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Verified Ecosystem Nodes<span className="text-indigo-600">.</span></h2>
           </div>
           <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Parameters:</span>
              <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent font-black text-xs text-indigo-600 outline-none cursor-pointer"
              >
                 <option>Recommended</option>
                 <option>Price: Low</option>
                 <option>Price: High</option>
                 <option>Rating</option>
              </select>
           </div>
        </div>

        {/* Results Info */}
        <div className="px-6 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl inline-block ml-4">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Found {filteredProperties.length} Properties Matching Hierarchy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
           {filteredProperties.map(b => {
             const startPrice = MOCK_UNITS.find(u => u.businessId === b.id)?.price || 0;
             return (
               <div key={b.id} onClick={() => onSelectProperty(b)} className="group bg-white rounded-[48px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col shadow-sm">
                  <div className="h-80 relative overflow-hidden shadow-inner">
                     <img src={b.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="absolute top-8 left-8 flex gap-3">
                        <span className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] border border-white shadow-xl">{b.category}</span>
                        {b.id.endsWith('1') && (
                          <span className="bg-emerald-500 px-5 py-2 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-xl">Nearby</span>
                        )}
                     </div>
                     <div className="absolute top-8 right-8 w-12 h-12 bg-white/40 backdrop-blur-md hover:bg-white text-white hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all shadow-xl">
                        <i className="far fa-heart text-xl"></i>
                     </div>
                     <div className="absolute bottom-8 left-8 right-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white shadow-2xl">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Price</span>
                              <span className="text-lg font-black text-slate-900">Rp {(startPrice/1000).toLocaleString()}K<span className="text-xs font-medium text-slate-400">/nt</span></span>
                           </div>
                           <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Verify Assets</button>
                        </div>
                     </div>
                  </div>
                  <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase">{b.name}</h3>
                              <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                 <i className="fas fa-location-dot text-indigo-400"></i>
                                 {b.address}
                              </p>
                           </div>
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-sm border border-emerald-100">
                              <i className="fas fa-star text-xs"></i> {b.rating}
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {b.tags?.map(t => (
                             <span key={t} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-100">{t}</span>
                           ))}
                        </div>
                     </div>
                     <div className="pt-8 border-t border-slate-50 flex items-center justify-between group-hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-bolt text-amber-500 text-xs"></i>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Infrastructure</span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Node Logic →</span>
                     </div>
                  </div>
               </div>
             );
           })}
           {filteredProperties.length === 0 && (
             <div className="col-span-full py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                   <i className="fas fa-search-minus text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">No Nodes Found</h3>
                <p className="text-slate-400 font-medium max-w-md mx-auto">The ecosystem could not resolve properties matching your specific filter matrix. Please broaden your discovery parameters.</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 10000000]);
                    setSelectedAmenities([]);
                    setRadius(50);
                  }}
                  className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  Broaden Discovery Node
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
