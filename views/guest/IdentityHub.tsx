
import React, { useState } from 'react';
import { User, VerificationStatus } from '../../types';

interface IdentityHubProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const IdentityHub: React.FC<IdentityHubProps> = ({ user, onUpdate }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyIdentity = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onUpdate({ verificationStatus: VerificationStatus.VERIFIED });
      setIsVerifying(false);
      alert('Identity Node Alpha: Verifikasi identitas berhasil disinkronkan dengan database pusat.');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-up">
      {/* PROFILE HEADER CARD */}
      <div className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group hover:border-indigo-200 transition-all duration-700">
         <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-[100px] group-hover:scale-110 transition-transform"></div>
         <div className="relative">
            <img src={user.avatar} className="w-48 h-48 rounded-[56px] object-cover ring-8 ring-slate-50 shadow-2xl border-4 border-white transition-all group-hover:rotate-3" alt="profile" />
            <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-2xl border-4 border-white">
               <i className="fas fa-camera-retro"></i>
            </div>
         </div>
         <div className="text-center md:text-left flex-1 space-y-6 relative z-10">
            <div>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{user.name}</h3>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    user.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                  }`}>
                    {user.verificationStatus} Hub
                  </span>
               </div>
               <p className="text-slate-400 font-bold text-sm tracking-widest uppercase italic leading-none">Global Member Node ID: {user.id}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <div className="px-5 py-2.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
                  <i className="fas fa-envelope text-indigo-400 text-xs"></i>
                  <span className="text-[11px] font-black text-slate-600">{user.email}</span>
               </div>
               <div className="px-5 py-2.5 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
                  <i className="fas fa-phone text-indigo-400 text-xs"></i>
                  <span className="text-[11px] font-black text-slate-600">{user.phoneNumber || 'Link Mobile Required'}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* 1. KYC / VERIFICATION PROTOCOL */}
         <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl shadow-inner">
                     <i className="fas fa-id-card-clip"></i>
                  </div>
                  <div>
                     <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 italic">Identity Verification</h4>
                     <p className="text-indigo-400/60 text-[9px] font-black uppercase tracking-widest">KYC Protocol Node</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <p className="text-xs font-medium text-white/40 leading-relaxed italic">"Verifikasi identitas Anda untuk membuka akses 'Instant Check-In' dan fitur pembayaran pascabayar di seluruh jaringan properti Seulanga."</p>
                  
                  <div className="space-y-4 pt-6">
                     {[
                       { step: 'Step 1', label: 'Upload Government Issued ID', status: 'completed' },
                       { step: 'Step 2', label: 'Facial Recognition Sync', status: 'pending' },
                       { step: 'Step 3', label: 'Authorized Background Hash', status: 'pending' }
                     ].map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-[32px] border border-white/5">
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${s.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-white/20'}`}>
                                {s.status === 'completed' ? <i className="fas fa-check"></i> : i + 1}
                             </div>
                             <span className={`text-[11px] font-black uppercase tracking-tight ${s.status === 'completed' ? 'text-white' : 'text-white/20'}`}>{s.label}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${s.status === 'completed' ? 'text-emerald-400' : 'text-indigo-400/30'}`}>{s.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <button 
              onClick={handleVerifyIdentity}
              disabled={user.verificationStatus === VerificationStatus.VERIFIED || isVerifying}
              className={`relative z-10 w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
                user.verificationStatus === VerificationStatus.VERIFIED 
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' 
                : isVerifying ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
              }`}
            >
               {isVerifying ? 'Synchronizing Node...' : user.verificationStatus === VerificationStatus.VERIFIED ? 'Identity Protocol Cleared' : 'Authorize Final Sync'}
            </button>
         </div>

         {/* 2. SECURITY & SESSION CONTROL */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Security & Session Matrix</h4>
               <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-inner"><i className="fas fa-lock"></i></div>
            </div>

            <div className="space-y-8">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credential Security</p>
                  <button onClick={() => alert('Dispatching security reset payload to node email...')} className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all group">
                     <div className="flex items-center gap-4">
                        <i className="fas fa-key text-indigo-400"></i>
                        <span className="text-xs font-black text-slate-900 uppercase">Modify Master Password</span>
                     </div>
                     <i className="fas fa-chevron-right text-slate-200 group-hover:translate-x-1 transition-all"></i>
                  </button>
                  <button className="w-full flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all group">
                     <div className="flex items-center gap-4">
                        <i className="fas fa-fingerprint text-indigo-400"></i>
                        <span className="text-xs font-black text-slate-900 uppercase">Biometric Auth (FaceID/NodeID)</span>
                     </div>
                     <div className="w-10 h-5 bg-indigo-600 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                  </button>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Browser Instances</p>
                  <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[32px] flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <i className="fas fa-display text-emerald-600"></i>
                        <div>
                           <p className="text-xs font-black text-emerald-900 uppercase">Chrome on MacOS Node</p>
                           <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">CURRENT SESSION • BANDA ACEH</p>
                        </div>
                     </div>
                     <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase">Live</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="p-12 bg-slate-50 rounded-[64px] border border-slate-100 flex items-center justify-center gap-8 group hover:bg-indigo-50 transition-all">
         <i className="fas fa-shield-halved text-indigo-400 text-2xl group-hover:scale-110 transition-transform"></i>
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] italic text-center leading-relaxed">SEULANGA GLOBAL IDENTITY SHIELD v4.1 • END-TO-END ENCRYPTED NODE</p>
      </div>
    </div>
  );
};
