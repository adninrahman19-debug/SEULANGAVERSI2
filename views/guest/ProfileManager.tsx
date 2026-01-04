
import React, { useState } from 'react';
import { User, VerificationStatus } from '../../types';

interface ProfileManagerProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
  language: 'id' | 'en';
}

type ActiveSection = 'account' | 'identity' | 'preferences' | 'security' | 'sessions';

export const ProfileManager: React.FC<ProfileManagerProps> = ({ user, onUpdate, language }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    { id: 'dev-1', name: 'Chrome on MacOS (Banda Aceh)', current: true, lastActive: 'Now' },
    { id: 'dev-2', name: 'Seulanga App on iPhone 15', current: false, lastActive: '2h ago' },
    { id: 'dev-3', name: 'Safari on iPad Air', current: false, lastActive: 'Yesterday' }
  ]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      alert('Identity Node Synced: Profil Anda telah diperbarui dalam sistem pusat.');
      setIsSaving(false);
    }, 1000);
  };

  const terminateSession = (id: string) => {
    setActiveDevices(prev => prev.filter(d => d.id !== id));
    alert('Security Protocol: Sesi pada perangkat tersebut telah diterminasi.');
  };

  const d = {
    id: {
      title: 'Manajemen Identitas',
      sub: 'Kontrol pusat data personal, otentikasi, dan preferensi ekosistem Anda.',
      nav_acc: 'Akun Dasar',
      nav_id: 'Verifikasi ID',
      nav_pref: 'Preferensi',
      nav_sec: 'Keamanan',
      nav_sess: 'Sesi Aktif',
      btn_save: 'Simpan Perubahan',
      btn_logout_all: 'Logout Semua Perangkat',
      status_verified: 'Terverifikasi',
      status_unverified: 'Butuh Verifikasi'
    },
    en: {
      title: 'Identity Management',
      sub: 'Central control of your personal data, authentication, and ecosystem preferences.',
      nav_acc: 'Basic Account',
      nav_id: 'ID Verification',
      nav_pref: 'Preferences',
      nav_sec: 'Security',
      nav_sess: 'Active Sessions',
      btn_save: 'Save Changes',
      btn_logout_all: 'Logout All Devices',
      status_verified: 'Verified',
      status_unverified: 'Verification Needed'
    }
  }[language];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-up">
      {/* 1. MASTER IDENTITY HEADER */}
      <div className="bg-slate-950 p-12 rounded-[64px] text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
         <div className="relative group">
            <img src={user.avatar} className="w-44 h-44 rounded-[48px] object-cover ring-8 ring-white/5 border-4 border-white shadow-2xl transition-all group-hover:scale-105" alt="avatar" />
            <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-xl">
               <i className="fas fa-camera text-sm"></i>
            </button>
         </div>
         <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <h2 className="text-4xl font-black tracking-tighter uppercase">{user.name}</h2>
               <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                 user.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
               }`}>
                 {user.verificationStatus === VerificationStatus.VERIFIED ? d.status_verified : d.status_unverified}
               </span>
            </div>
            <p className="text-indigo-200/40 text-sm font-bold uppercase tracking-widest">{user.email}</p>
            <div className="flex gap-4 justify-center md:justify-start pt-2">
               <div className="text-center bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-indigo-400">Node ID</p>
                  <p className="text-xs font-mono">{user.id.substring(0,8).toUpperCase()}</p>
               </div>
               <div className="text-center bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-indigo-400">Member Since</p>
                  <p className="text-xs font-mono">2024</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2. NAVIGATION SIDEBAR */}
        <div className="lg:col-span-3 space-y-2">
           {[
             { id: 'account', label: d.nav_acc, icon: 'fa-user-circle' },
             { id: 'identity', label: d.nav_id, icon: 'fa-id-card' },
             { id: 'preferences', label: d.nav_pref, icon: 'fa-sliders' },
             { id: 'security', label: d.nav_sec, icon: 'fa-shield-halved' },
             { id: 'sessions', label: d.nav_sess, icon: 'fa-display' },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveSection(tab.id as ActiveSection)}
               className={`w-full flex items-center gap-4 px-8 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${
                 activeSection === tab.id ? 'bg-white text-indigo-600 shadow-xl translate-x-2' : 'bg-transparent text-slate-400 hover:bg-white/50'
               }`}
             >
               <i className={`fas ${tab.icon} text-lg`}></i>
               {tab.label}
             </button>
           ))}
        </div>

        {/* 3. CONTENT AREA */}
        <div className="lg:col-span-9 bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm min-h-[500px]">
           
           {/* SECTION: BASIC ACCOUNT */}
           {activeSection === 'account' && (
             <form onSubmit={handleProfileSubmit} className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic">Basic Registry</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Informasi dasar identitas publik Anda.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                      <input required defaultValue={user.name} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Endpoint</label>
                      <input disabled defaultValue={user.email} className="w-full bg-slate-100 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-400 cursor-not-allowed" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon/WA</label>
                      <input defaultValue={user.phoneNumber} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none transition-all" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Dasar</label>
                      <input placeholder="E.g Jakarta, Indonesia" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none transition-all" />
                   </div>
                </div>
                <button type="submit" disabled={isSaving} className="px-10 py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                   {isSaving ? 'Syncing...' : d.btn_save}
                </button>
             </form>
           )}

           {/* SECTION: ID VERIFICATION */}
           {activeSection === 'identity' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic">KYC Vault</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Unggah dokumen legal untuk otorisasi "Verified Status".</p>
                </div>
                <div className="p-10 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
                         <i className="fas fa-cloud-arrow-up"></i>
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-slate-900 uppercase">Upload Identity Shard</h4>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">Format: JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                   </div>
                   <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-200 rounded-[32px] cursor-pointer hover:bg-white transition-all group">
                      <i className="fas fa-id-card text-4xl text-indigo-300 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seret KTP/Paspor atau <span className="text-indigo-600">Klik di sini</span></p>
                      <input type="file" className="hidden" />
                   </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification Progress</h5>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-black text-slate-700">Level 1: Basic Identity</span>
                         <span className="text-emerald-500 font-black text-xs uppercase">Cleared</span>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Trust Score</h5>
                      <div className="flex items-center justify-between">
                         <span className="text-sm font-black text-slate-700">850 / 1000</span>
                         <span className="text-indigo-600 font-black text-xs uppercase">Excellent</span>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* SECTION: PREFERENCES */}
           {activeSection === 'preferences' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic">Residency Preferences</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Personalisasi standar kenyamanan Anda.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bed Configuration</p>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none">
                         <option>King Size Node</option>
                         <option>Twin Shards (2 Beds)</option>
                         <option>Single Executive</option>
                      </select>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Smoking Policy</p>
                      <div className="flex gap-4">
                         <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Non-Smoking</button>
                         <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase border border-slate-200">Smoking Allowed</button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lantai Properti</p>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none">
                         <option>Lantai Rendah (Akses Cepat)</option>
                         <option>Lantai Tinggi (City View)</option>
                         <option>Bebas</option>
                      </select>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notifikasi Kedatangan</p>
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer border border-slate-200">
                         <span className="text-[10px] font-black text-slate-600 uppercase">Kirim Pengingat 24J</span>
                         <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                      </label>
                   </div>
                </div>
                <button className="px-10 py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">Simpan Preferensi</button>
             </div>
           )}

           {/* SECTION: SECURITY */}
           {activeSection === 'security' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic">Security Matrix</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Enkripsi kunci akses dan perlindungan identitas.</p>
                </div>
                <div className="p-10 bg-slate-50 border border-slate-100 rounded-[40px] space-y-8">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Saat Ini</label>
                         <input type="password" placeholder="••••••••••••" className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
                            <input type="password" placeholder="••••••••••••" className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                            <input type="password" placeholder="••••••••••••" className="w-full bg-white border border-slate-200 rounded-2xl px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                         </div>
                      </div>
                   </div>
                   <button className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Update Secret Key</button>
                </div>
                <div className="p-8 border-2 border-rose-100 bg-rose-50/30 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i className="fas fa-trash-can"></i></div>
                      <div>
                         <h4 className="text-sm font-black text-rose-900 uppercase">Self-Termination Zone</h4>
                         <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Hapus identitas node secara permanen.</p>
                      </div>
                   </div>
                   <button className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-700 transition-all">Deactivate ID</button>
                </div>
             </div>
           )}

           {/* SECTION: ACTIVE SESSIONS */}
           {activeSection === 'sessions' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-end">
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic">Session Surveillance</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pantau dan terminasi akses perangkat aktif.</p>
                   </div>
                   <button onClick={() => alert('Security Override: Semua perangkat telah dipaksa keluar.')} className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline">{d.btn_logout_all}</button>
                </div>
                
                <div className="space-y-4">
                   {activeDevices.map(device => (
                      <div key={device.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] flex items-center justify-between group hover:border-indigo-200 transition-all">
                         <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${device.current ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-300'}`}>
                               <i className={`fas ${device.name.includes('iPhone') ? 'fa-mobile-screen' : device.name.includes('iPad') ? 'fa-tablet-screen' : 'fa-laptop'}`}></i>
                            </div>
                            <div>
                               <div className="flex items-center gap-3">
                                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{device.name}</h4>
                                  {device.current && <span className="px-3 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">Current Session</span>}
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Last Sync: {device.lastActive}</p>
                            </div>
                         </div>
                         {!device.current && (
                           <button onClick={() => terminateSession(device.id)} className="p-4 bg-white border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><i className="fas fa-power-off"></i></button>
                         )}
                      </div>
                   ))}
                </div>
                <div className="p-8 bg-slate-950 rounded-[40px] text-white flex items-center gap-8 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                   <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 text-xl shrink-0">
                      <i className="fas fa-shield-virus"></i>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Identity Guard</p>
                      <p className="text-xs font-medium text-white/40 leading-relaxed max-w-xl italic">"Jika Anda mendeteksi aktivitas mencurigakan dari lokasi yang tidak dikenal, segera terminasi sesi tersebut dan ubah Secret Key Anda."</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-6">
         <i className="fas fa-fingerprint text-indigo-600 text-xl animate-pulse"></i>
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.4em] italic leading-none">SEULANGA GLOBAL IDENTITY MATRIX v4.1 • AUTHENTICATED ACCESS ONLY</p>
      </div>
    </div>
  );
};
