
import React, { useState } from 'react';
import { EmailTemplate, NotificationRule, PaymentGateway, UserRole } from '../../types';

export const SystemConfiguration: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'regional' | 'email' | 'notifications' | 'gateway'>('regional');

  // 1. MOCK STATE: Regional Settings
  const [regional, setRegional] = useState({
    currency: 'IDR',
    language: ['id', 'en'],
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY'
  });

  // 2. MOCK STATE: Email Templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    { id: 'et1', name: 'Welcome Node', subject: 'Welcome to SEULANGA Ecosystem', body: 'Greetings {{name}}, your identity has been verified...' },
    { id: 'et2', name: 'Settlement Authorized', subject: 'Payout Dispatched: {{payout_id}}', body: 'The treasury node has authorized your payout of {{amount}}...' },
  ]);

  // 3. MOCK STATE: Notification Rules
  const [notifRules, setNotifRules] = useState<NotificationRule[]>([
    { id: 'nr1', event: 'New Reservation', target: UserRole.BUSINESS_OWNER, channels: ['email', 'push'], isEnabled: true },
    { id: 'nr2', event: 'KYC Verification', target: UserRole.SUPER_ADMIN, channels: ['push'], isEnabled: true },
    { id: 'nr3', event: 'Maintenance Alert', target: UserRole.ADMIN_STAFF, channels: ['push', 'sms'], isEnabled: false },
  ]);

  // 4. MOCK STATE: Payment Gateways
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    { id: 'pg1', name: 'Midtrans Hub', isActive: true, apiKey: 'mid_auth_7721_xx', merchantId: 'M102992', environment: 'sandbox' },
    { id: 'pg2', name: 'Xendit Node', isActive: false, apiKey: 'xnd_live_9901_aa', merchantId: 'X002118', environment: 'production' },
  ]);

  const handleSaveRegional = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System Regional Node Synchronized.');
  };

  const handleToggleRule = (id: string) => {
    setNotifRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* GLOBAL TAB NAV */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm w-fit gap-2 overflow-x-auto scrollbar-hide max-w-full">
        {[
          { id: 'regional', label: 'Regional Node', icon: 'fa-globe' },
          { id: 'email', label: 'Email Ledger', icon: 'fa-envelope-open-text' },
          { id: 'notifications', label: 'Event Matrix', icon: 'fa-tower-broadcast' },
          { id: 'gateway', label: 'Treasury Gateways', icon: 'fa-bridge-lock' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
              activeSubTab === tab.id ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {/* 1. REGIONAL CONFIGURATION */}
        {activeSubTab === 'regional' && (
          <div className="max-w-4xl bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
            <div>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Global Localization</h3>
               <p className="text-slate-400 text-sm font-medium">Define regional standards for data representation across the ecosystem.</p>
            </div>

            <form onSubmit={handleSaveRegional} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Currency</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50">
                        <option value="IDR">Indonesian Rupiah (IDR)</option>
                        <option value="USD">US Dollar (USD)</option>
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Timezone</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50">
                        <option value="Asia/Jakarta">WIB (Jakarta/Sumatra)</option>
                        <option value="Asia/Makassar">WITA (Bali/Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Papua)</option>
                     </select>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enabled Linguistic Protocols</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['Bahasa Indonesia', 'English', 'Arabic', 'Mandarin'].map(lang => (
                        <div key={lang} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
                           <span className="text-xs font-bold text-slate-700">{lang}</span>
                           <div className={`w-5 h-5 rounded-full border-4 ${lang === 'Bahasa Indonesia' || lang === 'English' ? 'bg-indigo-600 border-indigo-100' : 'bg-white border-slate-200'}`}></div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-8">
                  <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Authorize Regional Sync</button>
               </div>
            </form>
          </div>
        )}

        {/* 2. EMAIL TEMPLATES */}
        {activeSubTab === 'email' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase">Template Ledger</h3>
                  <div className="space-y-3">
                     {emailTemplates.map(template => (
                        <button key={template.id} className="w-full p-6 bg-slate-50 rounded-[32px] text-left border border-slate-100 hover:border-indigo-600 hover:bg-white transition-all group">
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{template.id}</p>
                           <p className="font-black text-slate-900 text-sm uppercase">{template.name}</p>
                        </button>
                     ))}
                     <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[32px] text-[10px] font-black uppercase text-slate-400 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                        + New Template Node
                     </button>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
               <div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase">Template Editor</h4>
                  <p className="text-slate-400 text-sm font-medium">Modify transactional email payloads with dynamic variables.</p>
               </div>
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Protocol</label>
                     <input value={emailTemplates[0].subject} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-4 font-bold text-slate-900" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Body Architecture</label>
                     <textarea rows={10} className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 font-mono text-xs text-slate-700 leading-relaxed outline-none focus:ring-4 ring-indigo-50" value={emailTemplates[0].body} />
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Available Data Pipes (Variables)</p>
                     <div className="flex flex-wrap gap-2">
                        {['{{name}}', '{{business_name}}', '{{amount}}', '{{check_in_date}}', '{{auth_token}}'].map(v => (
                           <span key={v} className="px-3 py-1 bg-white border border-indigo-100 rounded-lg font-mono text-[10px] text-indigo-600">{v}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* 3. NOTIFICATION RULES */}
        {activeSubTab === 'notifications' && (
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Platform Event Matrix</h3>
                 <p className="text-slate-400 text-sm font-medium">Control the dispatch of signals across system channels.</p>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Event</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channels</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Node Switch</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {notifRules.map(rule => (
                          <tr key={rule.id} className={`hover:bg-slate-50/50 transition-colors ${!rule.isEnabled ? 'opacity-50' : ''}`}>
                             <td className="px-10 py-8">
                                <p className="font-black text-slate-900 text-sm uppercase">{rule.event}</p>
                             </td>
                             <td className="px-10 py-8">
                                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">{rule.target.replace('_', ' ')}</span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex gap-2">
                                   {rule.channels.map(c => (
                                      <span key={c} className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] border border-indigo-100"><i className={`fas fa-${c === 'email' ? 'envelope' : c === 'push' ? 'bell' : 'comment-sms'}`}></i></span>
                                   ))}
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <button 
                                 onClick={() => handleToggleRule(rule.id)}
                                 className={`w-14 h-7 rounded-full relative transition-all ${rule.isEnabled ? 'bg-indigo-600 shadow-lg' : 'bg-slate-200'}`}
                                >
                                   <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${rule.isEnabled ? 'right-1' : 'left-1'}`}></div>
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* 4. PAYMENT GATEWAY */}
        {activeSubTab === 'gateway' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {gateways.map(gw => (
                 <div key={gw.id} className={`p-12 rounded-[56px] border transition-all relative overflow-hidden flex flex-col justify-between ${gw.isActive ? 'bg-slate-950 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 opacity-60'}`}>
                    {gw.isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>}
                    
                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-12">
                          <div className="flex items-center gap-5">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${gw.isActive ? 'bg-indigo-600 shadow-xl shadow-indigo-900/40' : 'bg-slate-100 text-slate-400'}`}>
                                <i className="fas fa-credit-card"></i>
                             </div>
                             <div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter">{gw.name}</h4>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${gw.isActive ? 'text-indigo-400' : 'text-slate-400'}`}>Infrastructure Provider</p>
                             </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${gw.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                             {gw.isActive ? 'Active Engine' : 'Standby'}
                          </span>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${gw.isActive ? 'text-white/40' : 'text-slate-400'}`}>Merchant Server ID</label>
                             <input value={gw.merchantId} readOnly className={`w-full rounded-2xl px-6 py-4 font-mono text-xs ${gw.isActive ? 'bg-white/5 border border-white/10 text-indigo-200' : 'bg-slate-50 border border-slate-200'}`} />
                          </div>
                          <div className="space-y-2">
                             <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${gw.isActive ? 'text-white/40' : 'text-slate-400'}`}>Secret API Key Node</label>
                             <div className="relative">
                                <input value={gw.apiKey} type="password" readOnly className={`w-full rounded-2xl px-6 py-4 font-mono text-xs ${gw.isActive ? 'bg-white/5 border border-white/10 text-indigo-200' : 'bg-slate-50 border border-slate-200'}`} />
                                <i className="fas fa-eye-slash absolute right-6 top-1/2 -translate-y-1/2 opacity-30 cursor-pointer"></i>
                             </div>
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/10">
                             <div className="flex items-center gap-3">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${gw.isActive ? 'text-white/30' : 'text-slate-400'}`}>Protocol Environment:</p>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${gw.environment === 'production' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'}`}>{gw.environment}</span>
                             </div>
                             <button className={`text-[10px] font-black uppercase tracking-widest ${gw.isActive ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-400'}`}>Change Credentials</button>
                          </div>
                       </div>
                    </div>

                    {!gw.isActive && (
                      <button className="mt-12 w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest">Authorize Node Activation</button>
                    )}
                 </div>
              ))}
           </div>
        )}
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-4">
         <i className="fas fa-lock text-slate-400 text-sm"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">SEULANGA SYSTEM CORE V2.40 ENCRYPTED & SECURE</p>
      </div>
    </div>
  );
};
