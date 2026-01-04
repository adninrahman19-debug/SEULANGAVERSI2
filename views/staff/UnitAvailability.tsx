
import React, { useState, useMemo } from 'react';
import { Unit, UnitStatus, Business } from '../../types';

interface UnitAvailabilityProps {
  units: Unit[];
  onUpdateUnitStatus: (unitId: string, status: UnitStatus, available: boolean) => void;
}

export const UnitAvailability: React.FC<UnitAvailabilityProps> = ({ units, onUpdateUnitStatus }) => {
  const [filter, setFilter] = useState<UnitStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'ALL' || u.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [units, searchQuery, filter]);

  const stats = useMemo(() => ({
    ready: units.filter(u => u.status === UnitStatus.READY).length,
    dirty: units.filter(u => u.status === UnitStatus.DIRTY).length,
    maint: units.filter(u => u.status === UnitStatus.MAINTENANCE).length,
    blocked: units.filter(u => u.status === UnitStatus.BLOCKED).length,
  }), [units]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. STATUS COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ready Node', value: stats.ready, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'fa-check-circle' },
          { label: 'Dirty / Cleaning', value: stats.dirty, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'fa-broom' },
          { label: 'Maintenance', value: stats.maint, color: 'text-rose-600', bg: 'bg-rose-50', icon: 'fa-tools' },
          { label: 'Blocked Nodes', value: stats.blocked, color: 'text-slate-600', bg: 'bg-slate-100', icon: 'fa-ban' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-xl shadow-inner`}>
              <i className={`fas ${s.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* 2. CONTROL HUB */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1 overflow-x-auto scrollbar-hide">
          {['ALL', UnitStatus.READY, UnitStatus.DIRTY, UnitStatus.MAINTENANCE, UnitStatus.BLOCKED].map(st => (
            <button 
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === st ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Search unit node..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
          />
        </div>
      </div>

      {/* 3. ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUnits.map(unit => (
          <div key={unit.id} className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{unit.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unit.type}</p>
               </div>
               <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                 unit.status === UnitStatus.READY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                 unit.status === UnitStatus.MAINTENANCE ? 'bg-rose-50 text-rose-600 border-rose-100' :
                 unit.status === UnitStatus.DIRTY ? 'bg-amber-50 text-amber-600 border-amber-100' :
                 'bg-slate-100 text-slate-500 border-slate-200'
               }`}>
                 {unit.status}
               </span>
            </div>

            <div className="p-8 space-y-8">
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdateUnitStatus(unit.id, UnitStatus.READY, true)}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${unit.status === UnitStatus.READY ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100'}`}
                  >
                    Set Ready
                  </button>
                  <button 
                    onClick={() => onUpdateUnitStatus(unit.id, UnitStatus.DIRTY, false)}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${unit.status === UnitStatus.DIRTY ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 border border-slate-100'}`}
                  >
                    Mark Dirty
                  </button>
                  <button 
                    onClick={() => onUpdateUnitStatus(unit.id, UnitStatus.MAINTENANCE, false)}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${unit.status === UnitStatus.MAINTENANCE ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-slate-100'}`}
                  >
                    Maintenance
                  </button>
                  <button 
                    onClick={() => onUpdateUnitStatus(unit.id, UnitStatus.BLOCKED, false)}
                    className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${unit.status === UnitStatus.BLOCKED ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-900 border border-slate-100'}`}
                  >
                    Block Unit
                  </button>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${unit.available ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marketplace Visibility</span>
                  </div>
                  <button onClick={() => alert('Opening calendar sync node...')} className="text-indigo-600 hover:text-indigo-700 transition-all">
                     <i className="fas fa-calendar-alt"></i>
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. CALENDAR SYNC PROXY */}
      <div className="p-10 bg-slate-950 rounded-[56px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl text-indigo-400 border border-white/5 shadow-inner">
               <i className="fas fa-cloud-arrow-up"></i>
            </div>
            <div>
               <h3 className="text-2xl font-black tracking-tighter uppercase leading-none mb-2 italic">Global Inventory Sync</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-md">Sinkronisasi status unit dengan OTA eksternal dan sistem kalender pusat.</p>
            </div>
         </div>
         <button onClick={() => alert('Broadcast system update initialized...')} className="relative z-10 px-10 py-5 bg-white text-slate-950 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-400 hover:text-white transition-all">
            Authorize Global Sync
         </button>
      </div>
    </div>
  );
};
