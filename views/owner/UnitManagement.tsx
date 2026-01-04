
import React, { useState } from 'react';
import { Unit, UnitStatus, Business } from '../../types';
import { MOCK_UNITS } from '../../constants';

interface UnitManagementProps {
  business: Business;
  units: Unit[];
  onUpdateUnits: (updatedUnits: Unit[]) => void;
}

type UnitTab = 'inventory' | 'calendar' | 'pricing';

export const UnitManagement: React.FC<UnitManagementProps> = ({ business, units, onUpdateUnits }) => {
  const [activeTab, setActiveTab] = useState<UnitTab>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const handleToggleStatus = (unitId: string) => {
    const updated = units.map(u => {
      if (u.id === unitId) {
        const nextStatus = u.status === UnitStatus.READY ? UnitStatus.BLOCKED : UnitStatus.READY;
        return { ...u, status: nextStatus, available: nextStatus === UnitStatus.READY };
      }
      return u;
    });
    onUpdateUnits(updated);
  };

  const handleSaveUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitData: any = {
      id: editingUnit?.id || `un-${Date.now()}`,
      businessId: business.id,
      name: formData.get('name'),
      type: formData.get('type'),
      price: Number(formData.get('price')),
      capacity: Number(formData.get('capacity')),
      status: editingUnit?.status || UnitStatus.READY,
      available: true,
      amenities: (formData.get('amenities') as string).split(','),
      images: [editingUnit?.images[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200'],
      description: formData.get('description'),
      policies: {
        checkIn: formData.get('checkInRule'),
        cancellation: formData.get('cancelRule')
      }
    };

    if (editingUnit) {
      onUpdateUnits(units.map(u => u.id === editingUnit.id ? unitData : u));
    } else {
      onUpdateUnits([...units, unitData]);
    }
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. HEADER & NAVIGATION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Asset Management Matrix</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Kelola ketersediaan, harga, dan spesifikasi unit operasional Anda.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Inventory
              </button>
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Calendar
              </button>
           </div>
           <button 
             onClick={() => { setEditingUnit(null); setIsModalOpen(true); }}
             className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
           >
              <i className="fas fa-plus"></i> Tambah Unit
           </button>
        </div>
      </div>

      {/* 2. INVENTORY GRID */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {units.map(unit => (
             <div key={unit.id} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                   <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                   <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md text-white ${
                        unit.status === UnitStatus.READY ? 'bg-emerald-500/80' : 
                        unit.status === UnitStatus.MAINTENANCE ? 'bg-rose-500/80' : 'bg-slate-800/80'
                      }`}>
                        {unit.status}
                      </span>
                   </div>
                   <div className="absolute bottom-6 left-8">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{unit.name}</h4>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-2">{unit.type} • {unit.capacity} Pax</p>
                   </div>
                </div>
                
                <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                   <div className="space-y-6">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Price</p>
                            <h5 className="text-2xl font-black text-slate-900 tracking-tighter">Rp {unit.price.toLocaleString()}</h5>
                         </div>
                         <button 
                           onClick={() => { setEditingUnit(unit); setIsModalOpen(true); }}
                           className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                         >
                            <i className="fas fa-pen-nib text-xs"></i>
                         </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                         {unit.amenities.slice(0, 4).map(a => (
                           <span key={a} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[8px] font-black uppercase border border-slate-100">{a}</span>
                         ))}
                         {unit.amenities.length > 4 && <span className="text-[8px] font-black text-slate-300 uppercase">+{unit.amenities.length - 4} More</span>}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-2.5 h-2.5 rounded-full ${unit.available ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></div>
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{unit.available ? 'Live Marketplace' : 'Disabled'}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleStatus(unit.id)}
                        className={`text-[10px] font-black uppercase tracking-widest hover:underline transition-all ${unit.available ? 'text-rose-500' : 'text-indigo-600'}`}
                      >
                         {unit.available ? 'Deactivate Node' : 'Activate Node'}
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* 3. CALENDAR VIEW (SIMULATED) */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 uppercase">Availability Timeline</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black text-slate-400 uppercase">Ready</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div><span className="text-[10px] font-black text-slate-400 uppercase">Booked</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-full"></div><span className="text-[10px] font-black text-slate-400 uppercase">Blocked</span></div>
              </div>
           </div>
           
           <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 sticky left-0 bg-slate-50">Unit Node</th>
                       {[...Array(14)].map((_, i) => (
                         <th key={i} className="px-4 py-5 text-center min-w-[60px]">
                            <p className="text-[10px] font-black text-slate-900 uppercase">{24 + i} Dec</p>
                         </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {units.map(unit => (
                      <tr key={unit.id}>
                         <td className="px-8 py-6 sticky left-0 bg-white border-r border-slate-100 z-10">
                            <p className="font-black text-slate-900 uppercase text-xs">{unit.name}</p>
                         </td>
                         {[...Array(14)].map((_, i) => {
                           const isBooked = (i % 5 === 0);
                           const isMaintenance = (unit.status === UnitStatus.MAINTENANCE && i < 3);
                           return (
                             <td key={i} className="p-1">
                                <div className={`h-10 rounded-xl transition-all cursor-pointer ${
                                  isMaintenance ? 'bg-rose-500' :
                                  isBooked ? 'bg-indigo-500' : 'bg-emerald-500 hover:scale-95 hover:opacity-80'
                                }`}></div>
                             </td>
                           );
                         })}
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* 4. ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{editingUnit ? 'Konfigurasi Unit' : 'Registrasi Unit Baru'}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Definisikan spesifikasi aset properti Anda.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
              </div>

              <form onSubmit={handleSaveUnit} className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Core Info */}
                    <div className="space-y-8">
                       <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                          <i className="fas fa-info-circle"></i> Identitas & Type
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Unit (E.g Deluxe 201)</label>
                             <input name="name" defaultValue={editingUnit?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Aset</label>
                                <select name="type" defaultValue={editingUnit?.type} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold outline-none">
                                   <option>Room</option>
                                   <option>Studio</option>
                                   <option>Villa</option>
                                   <option>Apartment</option>
                                   <option>House</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kapasitas (Pax)</label>
                                <input name="capacity" type="number" defaultValue={editingUnit?.capacity} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                             </div>
                          </div>
                       </div>

                       <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2 mt-10">
                          <i className="fas fa-tag"></i> Ekonomi & Pricing
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Dasar (Per Malam)</label>
                             <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Rp</span>
                                <input name="price" type="number" defaultValue={editingUnit?.price} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl pl-14 pr-8 py-4 font-bold" />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Spec & Rules */}
                    <div className="space-y-8">
                       <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                          <i className="fas fa-list-check"></i> Fasilitas & Narasi
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fasilitas (Pisahkan Koma)</label>
                             <input name="amenities" defaultValue={editingUnit?.amenities.join(', ')} placeholder="WiFi, AC, TV, Breakfast..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Singkat Unit</label>
                             <textarea name="description" rows={4} defaultValue={editingUnit?.description} className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 font-bold outline-none resize-none" />
                          </div>
                       </div>

                       <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2 mt-10">
                          <i className="fas fa-gavel"></i> Protokol & Aturan
                       </h4>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aturan Check-In (E.g Syarat ID)</label>
                             <input name="checkInRule" defaultValue={editingUnit?.policies?.checkIn} placeholder="E.g KTP Wajib, Deposit Rp 100k..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kebijakan Pembatalan</label>
                             <select name="cancelRule" defaultValue={editingUnit?.policies?.cancellation} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold outline-none">
                                <option>Flexible (Refund 100%)</option>
                                <option>Moderate (Refund 50% within 48h)</option>
                                <option>Strict (No Refund)</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all">Batalkan</button>
                    <button type="submit" className="px-12 py-4 bg-slate-950 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-4">
                       <i className="fas fa-shield-check"></i> Authorize Unit Node
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
