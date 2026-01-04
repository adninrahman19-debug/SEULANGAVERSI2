
import React, { useState, useMemo } from 'react';
import { Transaction, User, Booking, BookingStatus } from '../../types';
import { MOCK_TRANSACTIONS, MOCK_BOOKINGS, MOCK_BUSINESSES } from '../../constants';

interface PaymentTreasuryProps {
  currentUser: User;
  language: 'id' | 'en';
}

export const PaymentTreasury: React.FC<PaymentTreasuryProps> = ({ currentUser, language }) => {
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // 1. DATA AGGREGATION
  const userTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => tx.guestId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser.id]);

  const filteredTx = useMemo(() => {
    return userTransactions.filter(tx => {
      if (filter === 'pending') return tx.status === 'pending';
      if (filter === 'completed') return tx.status === 'completed';
      return true;
    });
  }, [userTransactions, filter]);

  const stats = useMemo(() => {
    const totalSpent = userTransactions.filter(tx => tx.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalPending = userTransactions.filter(tx => tx.status === 'pending').reduce((s, t) => s + t.amount, 0);
    return { totalSpent, totalPending };
  }, [userTransactions]);

  const selectedTx = useMemo(() => userTransactions.find(t => t.id === selectedTxId), [userTransactions, selectedTxId]);
  const relatedBiz = useMemo(() => MOCK_BUSINESSES.find(b => b.id === selectedTx?.businessId), [selectedTx]);

  const d = {
    id: {
      title: 'Treasury & Invoicing',
      sub: 'Monitor aliran dana, unduh invoice digital, dan otorisasi pembayaran manual.',
      spent_label: 'Total Pengeluaran Terverifikasi',
      pending_label: 'Payload Menunggu Kliring',
      history_title: 'Ledger Transaksi Universal',
      invoice_title: 'Invoice Digital Resmi',
      btn_confirm: 'Konfirmasi Manual',
      btn_download: 'Unduh Dokumen',
      status_cleared: 'Terverifikasi',
      status_pending: 'Proses Kliring'
    },
    en: {
      title: 'Treasury & Invoicing',
      sub: 'Monitor fund flows, download digital invoices, and authorize manual settlements.',
      spent_label: 'Total Verified Expenditure',
      pending_label: 'Payload Awaiting Clearing',
      history_title: 'Universal Transaction Ledger',
      invoice_title: 'Official Digital Invoice',
      btn_confirm: 'Manual Auth',
      btn_download: 'Download Doc',
      status_cleared: 'Settled',
      status_pending: 'Processing'
    }
  }[language];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. FINANCIAL SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/40 transition-all"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">{d.spent_label}</p>
               <h3 className="text-5xl font-black tracking-tighter">Rp {stats.totalSpent.toLocaleString()}</h3>
               <div className="mt-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest italic">Verified by Seulanga Treasury Hub</span>
               </div>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-all">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{d.pending_label}</p>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Rp {stats.totalPending.toLocaleString()}</h3>
            </div>
            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">Action Required for Activation</span>
               <i className="fas fa-clock-rotate-left text-amber-400"></i>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
         {/* 2. TRANSACTION LEDGER */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
               <h3 className="text-2xl font-black text-slate-900 uppercase italic">{d.history_title}</h3>
               <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1">
                  {['all', 'pending', 'completed'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setFilter(f as any)}
                      className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Economic Value</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protokol</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredTx.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50/30 transition-all group">
                             <td className="px-8 py-6">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none mb-1">{tx.createdAt}</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">TX_REF_#{tx.id.toUpperCase()}</p>
                             </td>
                             <td className="px-8 py-6">
                                <p className="text-sm font-black text-slate-700 uppercase">{MOCK_BUSINESSES.find(b => b.id === tx.businessId)?.name || 'Platform Fee'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.status === 'completed' ? d.status_cleared : d.status_pending}</span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <p className="text-lg font-black text-slate-900 tracking-tighter">Rp {tx.amount.toLocaleString()}</p>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   {tx.status === 'pending' && (
                                     <button onClick={() => alert('Redirecting to Manual Authorization Protocol...')} className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">
                                        {d.btn_confirm}
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => setSelectedTxId(tx.id)}
                                     className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                                   >
                                      <i className="fas fa-file-invoice text-xs"></i>
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* 3. SIDEBAR: PAYMENT METHODS & TRUST */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
               <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">Stored Nodes</h4>
                  <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Add Card</button>
               </div>
               
               <div className="space-y-4">
                  {[
                    { type: 'Visa', last4: '9901', expiry: '12/26', color: 'from-slate-900 to-slate-800' },
                    { type: 'Mastercard', last4: '4422', expiry: '08/25', color: 'from-indigo-900 to-indigo-800' }
                  ].map((card, i) => (
                    <div key={i} className={`p-8 rounded-[32px] bg-gradient-to-br ${card.color} text-white space-y-8 relative overflow-hidden group cursor-pointer shadow-lg hover:scale-[1.02] transition-transform`}>
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                       <div className="flex justify-between items-start relative z-10">
                          <i className={`fab fa-cc-${card.type.toLowerCase()} text-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></i>
                          <span className="text-[10px] font-black tracking-widest opacity-40 uppercase">Ecosystem Credit</span>
                       </div>
                       <div className="space-y-2 relative z-10">
                          <p className="text-xl font-mono tracking-[0.3em] font-black">•••• •••• •••• {card.last4}</p>
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                             <span>Digital Identity Holder</span>
                             <span>Exp {card.expiry}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100 space-y-6 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-tl-[100px]"></div>
               <div className="flex items-center gap-4 text-indigo-600">
                  <i className="fas fa-shield-check text-2xl"></i>
                  <h4 className="text-sm font-black uppercase tracking-widest">Fraud Guard Active</h4>
               </div>
               <p className="text-xs text-indigo-900/60 font-medium leading-relaxed italic">"Seluruh transmisi finansial dienkripsi dengan protokol AES-256 dan diawasi oleh Seulanga Unified Treasury."</p>
               <button className="w-full py-4 bg-white border border-indigo-200 text-indigo-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Audit Policy Node</button>
            </div>
         </div>
      </div>

      {/* 4. DIGITAL INVOICE MODAL */}
      {selectedTxId && selectedTx && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[64px] shadow-2xl p-16 relative overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={() => setSelectedTxId(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600"></div>

              <header className="flex justify-between items-start mb-16 border-b border-slate-50 pb-12">
                 <div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">{d.invoice_title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Payload Node: {selectedTx.id}</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-2xl text-slate-900 uppercase leading-none">SEULANGA<span className="text-indigo-600">.</span></p>
                    <p className="text-[9px] font-bold text-indigo-600 uppercase mt-2 tracking-widest">Verified Digital Hub</p>
                 </div>
              </header>

              <main className="flex-1 overflow-y-auto space-y-12 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Inbound Entity (Bill To)</p>
                       <p className="text-lg font-black text-slate-900 uppercase">{currentUser.name}</p>
                       <p className="text-xs font-bold text-slate-500">{currentUser.email}</p>
                    </div>
                    <div className="text-right space-y-4">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Settlement Hub (From)</p>
                       <p className="text-lg font-black text-slate-900 uppercase">{relatedBiz?.name || 'Seulanga Platform'}</p>
                       <p className="text-xs font-bold text-slate-500 italic">Temporal Date: {selectedTx.createdAt}</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-widest">
                       <span>Marketplace Node Access / Subscription</span>
                       <span className="text-slate-900">Rp {selectedTx.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-widest">
                       <span>Ecosystem Treasury Fee</span>
                       <span className="text-slate-900">Rp 0</span>
                    </div>
                    <div className="pt-8 border-t border-slate-200 flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Cleared Payload</span>
                       <span className="text-4xl font-black text-indigo-600">Rp {selectedTx.amount.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-end pt-8 border-t border-slate-50">
                    <div className="space-y-4">
                       <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                          <i className="fas fa-qrcode text-4xl text-slate-200"></i>
                       </div>
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Digital Shard Verified</p>
                    </div>
                    <div className="text-center w-64">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Authorized Treasury Officer</p>
                          <div className="h-px bg-slate-200 w-full mb-3"></div>
                          <p className="text-xs font-black text-slate-900 uppercase italic">Digital Protocol Signature</p>
                       </div>
                    </div>
                 </div>
              </main>

              <div className="pt-10 border-t border-slate-100 mt-8 flex gap-4">
                 <button onClick={() => window.print()} className="flex-1 py-6 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                    <i className="fas fa-print"></i> {d.btn_download}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
