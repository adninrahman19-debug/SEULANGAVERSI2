
import React, { useState } from 'react';
import { Business, BusinessStatus } from '../../types';

interface BusinessProfileProps {
  business: Business;
  onUpdate: (data: Partial<Business>) => void;
}

type ProfileTab = 'identity' | 'location' | 'contact' | 'hours' | 'seo';

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ business, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('identity');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    // Construct nested objects for socials, hours, and seo
    const updatedData: any = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      status: formData.get('status') as BusinessStatus,
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      socials: {
        instagram: formData.get('instagram'),
        website: formData.get('website'),
        facebook: formData.get('facebook'),
      },
      operatingHours: {
        open: formData.get('openTime'),
        close: formData.get('closeTime'),
        days: formData.get('days'),
      },
      seoMetadata: {
        title: formData.get('seoTitle'),
        description: formData.get('seoDesc'),
        keywords: formData.get('seoKeywords'),
      }
    };

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    onUpdate(updatedData);
    setIsSaving(false);
    alert('Protokol Identitas Berhasil Disinkronisasi.');
  };

  const tabs = [
    { id: 'identity', label: 'Identitas Dasar', icon: 'fa-id-card' },
    { id: 'location', label: 'Geo Node (Lokasi)', icon: 'fa-map-location-dot' },
    { id: 'contact', label: 'Konektivitas & Sosmed', icon: 'fa-share-nodes' },
    { id: 'hours', label: 'Temporal Node (Jam)', icon: 'fa-clock' },
    { id: 'seo', label: 'Search Index (SEO)', icon: 'fa-magnifying-glass-chart' },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Identity Governance</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Kelola representasi publik dan konfigurasi teknis bisnis Anda.</p>
        </div>
        <div className={`px-5 py-2 rounded-2xl border flex items-center gap-3 transition-all ${
           business.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
        }`}>
           <div className={`w-2 h-2 rounded-full ${business.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Marketplace: {business.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as ProfileTab)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab.id ? 'bg-slate-950 text-white shadow-xl translate-x-2' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
               }`}
             >
               <i className={`fas ${tab.icon} text-sm`}></i>
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
            
            {activeTab === 'identity' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-[40px] bg-slate-50 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden group-hover:opacity-80 transition-all">
                        {business.images[0] ? (
                          <img src={business.images[0]} className="w-full h-full object-cover" alt="logo" />
                        ) : <i className="fas fa-camera text-2xl text-slate-300"></i>}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                        <i className="fas fa-pen-nib text-xs"></i>
                      </button>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 uppercase">Logo & Branding</h4>
                      <p className="text-xs text-slate-400 font-medium">Gunakan gambar resolusi tinggi untuk kredibilitas node.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bisnis (Publik)</label>
                    <input name="name" defaultValue={business.name} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Topology</label>
                    <input value={business.category} disabled className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-400 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Narasi Bisnis</label>
                  <textarea name="description" rows={6} defaultValue={business.description} className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none" placeholder="Ceritakan keunggulan bisnis Anda..." />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Visibilitas</label>
                  <select name="status" defaultValue={business.status} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none">
                     <option value="active">PUBLISHED (Live on Marketplace)</option>
                     <option value="suspended">SUSPENDED (Internal Maintenance)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Fisik Lengkap</label>
                  <input name="address" defaultValue={business.address} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
                </div>
                
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peta Koordinat Node (Google Maps)</p>
                   <div className="h-80 w-full bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center space-y-4">
                            <i className="fas fa-location-crosshairs text-4xl text-indigo-200 animate-pulse"></i>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Map Engine Proxy Active</p>
                         </div>
                      </div>
                      <iframe 
                        title="Geo Coordinate Picker"
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.0!2d${business.location.lng}!3d${business.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v123456789`}
                        className="w-full h-full opacity-60 grayscale-[0.5]"
                        loading="lazy"
                      ></iframe>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Latitude</label>
                        <input name="lat" defaultValue={business.location.lat} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-indigo-600" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Longitude</label>
                        <input name="lng" defaultValue={business.location.lng} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-indigo-600" />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <h4 className="text-sm font-black text-slate-900 uppercase italic">Primary Channels</h4>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kontak</label>
                          <input name="contactEmail" type="email" defaultValue={business.contactEmail} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon/WhatsApp</label>
                          <input name="contactPhone" defaultValue={business.contactPhone} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                        </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <h4 className="text-sm font-black text-slate-900 uppercase italic">Social Connectivity</h4>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram handle</label>
                          <div className="relative">
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">@</span>
                             <input name="instagram" defaultValue={business.socials?.instagram?.replace('@', '')} className="w-full bg-slate-50 border border-slate-200 rounded-3xl pl-12 pr-8 py-4 font-bold" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                          <input name="website" defaultValue={business.socials?.website} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" placeholder="https://..." />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-10">
                    <div className="flex items-center gap-4">
                       <i className="fas fa-calendar-clock text-indigo-600 text-xl"></i>
                       <h4 className="font-black text-slate-900 uppercase tracking-tight">Protokol Waktu Layanan</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Buka Node</label>
                          <input name="openTime" type="time" defaultValue={business.operatingHours?.open || "08:00"} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Tutup Node</label>
                          <input name="closeTime" type="time" defaultValue={business.operatingHours?.close || "22:00"} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari Operasional</label>
                       <input name="days" defaultValue={business.operatingHours?.days || "Setiap Hari (Senin - Minggu)"} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold" />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-10 bg-indigo-600 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                         <i className="fas fa-search-dollar text-2xl"></i>
                         <h4 className="text-xl font-black uppercase tracking-tight leading-none">Marketplace SEO Engine</h4>
                      </div>
                      <p className="text-xs font-medium text-indigo-100 leading-relaxed max-w-xl">Optimalkan bagaimana bisnis Anda muncul di pencarian internal dan Google untuk meningkatkan traffic node.</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Title (SEO)</label>
                      <input name="seoTitle" defaultValue={business.seoMetadata?.title || business.name} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description (SEO)</label>
                      <textarea name="seoDesc" rows={4} defaultValue={business.seoMetadata?.description || business.description.substring(0, 160)} className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold outline-none focus:ring-4 ring-indigo-50 resize-none" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keywords (Comma separated)</label>
                      <input name="seoKeywords" defaultValue={business.seoMetadata?.keywords} placeholder="hotel aceh, penginapan mewah, liburan..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-50 flex justify-end">
               <button 
                 type="submit" 
                 disabled={isSaving}
                 className="px-12 py-5 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all flex items-center gap-4 active:scale-95"
               >
                  {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shield-check"></i>}
                  Authorize Profile Sync
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
