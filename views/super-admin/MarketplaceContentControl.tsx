
import React, { useState, useMemo } from 'react';
import { Business, BusinessStatus, HomepageBanner, SEOMetadata } from '../../types';

interface MarketplaceContentControlProps {
  businesses: Business[];
  onUpdateBusiness: (id: string, data: Partial<Business>) => void;
}

export const MarketplaceContentControl: React.FC<MarketplaceContentControlProps> = ({ businesses, onUpdateBusiness }) => {
  const [activeSubTab, setActiveSubTab] = useState<'moderation' | 'featured' | 'banners' | 'seo'>('moderation');
  
  // Mock State for Banners
  const [banners, setBanners] = useState<HomepageBanner[]>([
    { id: 'b1', title: 'Discover Luxury Nodes', subtitle: 'Elite stays in the heart of Sumatra', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200', isActive: true, order: 1 },
    { id: 'b2', title: 'Partner with Seulanga', subtitle: 'Monetize your property with ease', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', isActive: true, order: 2 },
  ]);

  // Mock State for SEO
  const [globalSEO, setGlobalSEO] = useState<SEOMetadata>({
    title: 'SEULANGA | Integrated Property & Hospitality Platform',
    description: 'The premier multi-tenant SaaS platform for Sumatra hospitality management.',
    keywords: ['SaaS', 'Hospitality', 'Property Management', 'Sumatra', 'Booking Engine']
  });

  // Derived Data
  const pendingModeration = useMemo(() => businesses.filter(b => b.status === 'pending' || b.status === 'info_requested'), [businesses]);
  const featuredRequests = useMemo(() => businesses.filter(b => b.isFeaturedRequested && !b.isFeatured), [businesses]);

  // Handlers
  const handleToggleBanner = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const handleUpdateSEO = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Global SEO Metadata Nodes updated successfully.');
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. CONTROL HUB NAVIGATION */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm w-fit gap-2">
        {[
          { id: 'moderation', label: 'Listing Moderation', icon: 'fa-clipboard-check', count: pendingModeration.length },
          { id: 'featured', label: 'Featured Boosts', icon: 'fa-fire-flame-curved', count: featuredRequests.length },
          { id: 'banners', label: 'Homepage Banners', icon: 'fa-images', count: banners.length },
          { id: 'seo', label: 'Global SEO Node', icon: 'fa-magnifying-glass-chart', count: null },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
              activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
            {tab.count !== null && <span className={`px-2 py-0.5 rounded-md text-[8px] ${activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* 2. MODERATION QUEUE */}
      {activeSubTab === 'moderation' && (
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Moderation Pipeline</h3>
            <p className="text-slate-400 text-sm font-medium">Verify legal identity and asset quality of new marketplace applicants.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {pendingModeration.map(biz => (
              <div key={biz.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-8 flex-1">
                  <img src={biz.images[0]} className="w-24 h-24 rounded-[32px] object-cover shadow-xl ring-4 ring-white" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{biz.name}</h4>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-lg border border-amber-100 tracking-widest">{biz.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium max-w-xl leading-relaxed">{biz.description}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{biz.category} • Registry Date: {biz.registrationDate || '2024-12-28'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => alert('Opening full asset audit node...')} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Audit Asset</button>
                  {/* Fix: Line 88 error - Use onUpdateBusiness instead of non-existent onUpdateStatus */}
                  <button onClick={() => onUpdateBusiness(biz.id, { status: 'active' })} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Authorize Node</button>
                </div>
              </div>
            ))}
            {pendingModeration.length === 0 && (
              <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">Moderation pipeline is clear</div>
            )}
          </div>
        </div>
      )}

      {/* 3. FEATURED BOOST APPROVAL */}
      {activeSubTab === 'featured' && (
        <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-3 italic">Featured Index Queue</h3>
            <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">Authorize marketplace visibility boosters for premium entities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {featuredRequests.map(biz => (
              <div key={biz.id} className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6 group hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <img src={biz.images[0]} className="w-16 h-16 rounded-[24px] object-cover shadow-lg" />
                    <div>
                      <p className="font-black text-sm uppercase text-indigo-50">{biz.name}</p>
                      <p className="text-[9px] font-bold text-white/30 uppercase mt-1">Requested: 2h ago</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <i className="fas fa-fire-flame-curved text-xs text-white"></i>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                   <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                      <span>Plan Node:</span>
                      <span className="text-indigo-400">{biz.subscription}</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase text-white/40">
                      <span>Monetization Status:</span>
                      <span className="text-emerald-400">Payment Verified</span>
                   </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onUpdateBusiness(biz.id, { isFeatured: true, isFeaturedRequested: false })} className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">Authorize Boost</button>
                  <button onClick={() => onUpdateBusiness(biz.id, { isFeaturedRequested: false })} className="py-4 px-6 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-black text-[9px] uppercase hover:text-rose-400 transition-all">Deny</button>
                </div>
              </div>
            ))}
            {featuredRequests.length === 0 && (
              <div className="col-span-full py-20 text-center text-white/10 font-black uppercase text-[10px] tracking-widest italic border-2 border-dashed border-white/5 rounded-[40px]">No pending featured index requests</div>
            )}
          </div>
        </div>
      )}

      {/* 4. BANNER MANAGEMENT */}
      {activeSubTab === 'banners' && (
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase">Homepage Content Matrix</h3>
              <p className="text-slate-400 text-sm font-medium">Manage primary marketing hero nodes and promotional banners.</p>
            </div>
            <button onClick={() => alert('Redirecting to Creative Asset Hub...')} className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3">
              <i className="fas fa-file-circle-plus"></i> Upload Media Asset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map(banner => (
              <div key={banner.id} className={`rounded-[40px] border transition-all overflow-hidden group ${banner.isActive ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
                <div className="h-56 relative overflow-hidden">
                  <img src={banner.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-8">
                    <h4 className="text-xl font-black text-white uppercase leading-none mb-1">{banner.title}</h4>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{banner.subtitle}</p>
                  </div>
                </div>
                <div className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order: {banner.order}</span>
                    <div className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-[9px] font-black text-slate-700 uppercase">{banner.isActive ? 'Active Node' : 'Suspended'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"><i className="fas fa-pen text-xs"></i></button>
                    <button onClick={() => handleToggleBanner(banner.id)} className={`p-3 rounded-xl transition-all shadow-sm ${banner.isActive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      <i className={`fas ${banner.isActive ? 'fa-ban' : 'fa-check'} text-xs`}></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GLOBAL SEO CONFIGURATION */}
      {activeSubTab === 'seo' && (
        <div className="max-w-4xl mx-auto bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-indigo-100">
               <i className="fas fa-magnifying-glass-chart text-3xl"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Global SEO Strategy Node</h3>
            <p className="text-slate-400 text-sm font-medium">Control how SEULANGA appears on global search indexers (Google, Bing, etc.)</p>
          </div>

          <form onSubmit={handleUpdateSEO} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Title Format</label>
              <input 
                value={globalSEO.title}
                onChange={(e) => setGlobalSEO({...globalSEO, title: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description (Global)</label>
              <textarea 
                rows={4}
                value={globalSEO.description}
                onChange={(e) => setGlobalSEO({...globalSEO, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Semantic Keywords</label>
              <input 
                value={globalSEO.keywords.join(', ')}
                onChange={(e) => setGlobalSEO({...globalSEO, keywords: e.target.value.split(', ')})}
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-5 font-mono text-[11px] font-bold text-indigo-600 outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
            <div className="p-8 bg-slate-950 rounded-[40px] text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Search Console Token</p>
                <p className="font-mono text-[10px] opacity-40">node_auth_k3y_9921_xX_alpha</p>
              </div>
              <button type="button" className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase">Refresh Node</button>
            </div>
            <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all">Authorize SEO Sync</button>
          </form>
        </div>
      )}
    </div>
  );
};
