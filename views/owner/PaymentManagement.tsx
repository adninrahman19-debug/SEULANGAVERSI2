
import React, { useState, useMemo } from 'react';
import { Transaction, Booking, BookingStatus, Business, Unit } from '../../types';

interface PaymentManagementProps {
  business: Business;
  transactions: Transaction[];
  bookings: Booking[];
  units: Unit[];
  onConfirmPayment: (bookingId: string) => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({ 
  business, transactions, bookings, units, onConfirmPayment 
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'cleared'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);

  // Derived Stats
  const stats = useMemo(() => {
    const totalGTV = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const settled = bookings.filter(b => b.verifiedPayment).reduce((sum, b) => sum + b.totalPrice, 0);
    const pending = bookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).reduce((sum, b) => sum + b.totalPrice, 0);
    return { totalGTV, settled, pending };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (filter === 'pending') return !b.verifiedPayment && b.status !== BookingStatus.CANCELLED;
      if (filter === 'cleared') return b.verifiedPayment;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, filter]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TREASURY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Total Gross Volume</p>
              <h3 className="text-5xl font-black tracking-tighter mb-4">Rp {stats.totalGTV.toLocaleString()}</h3>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest italic">Lifetime marketplace contribution</p>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
           <div className="flex justify-between items-start">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Settled Funds</p>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><i className="fas fa-vault"></i></div>
           </div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {stats.settled.toLocaleString()}</h3>
           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(stats.settled / (stats.totalGTV || 1)) * 100}%` }}></div>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
           <div className="flex justify-between items-start">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Pending Settlement</p>
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner"><i className="fas fa-clock-rotate-left"></i></div>
           </div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {stats.pending.toLocaleString()}</h3>
           <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">Awaiting Owner Verification</p>
        </div>
      </div>

      {/* 2. TRANSACTION LEDGER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Financial Ledger</h2>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Log audit seluruh aliran dana dan otorisasi pembayaran manual.</p>
         </div>
         <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1">
            {[
              { id: 'all', label: 'Universal' },
              { id: 'pending', label: 'Unverified' },
              { id: 'cleared', label: 'Settled' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* 3. TRANSACTION TABLE */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal node</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Identity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Unit</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Economic Value</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protokol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map(bk => (
                    <tr key={bk.id} className="hover:bg-slate-50/30 transition-all group">
                       <td className="px-10 py-8">
                          <p className="text-xs font-black text-slate-900 uppercase">{bk.createdAt}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Date</p>
                       </td>
                       <td className="px-10 py-8">
                          <p className="text-sm font-black text-slate-800 uppercase">#{bk.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`w-1.5 h-1.5 rounded-full ${bk.verifiedPayment ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{bk.verifiedPayment ? 'Settled' : 'Awaiting Auth'}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <p className="text-xs font-black text-slate-700 uppercase">{units.find(u => u.id === bk.unitId)?.name}</p>
                          <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Operational Node</p>
                       </td>
                       <td className="px-10 py-8">
                          <p className="text-lg font-black text-slate-900 tracking-tighter">Rp {bk.totalPrice.toLocaleString()}</p>
                       </td>
                       <td className="px-10 py-8 text-right space-x-2">
                          {!bk.verifiedPayment && bk.status !== BookingStatus.CANCELLED ? (
                            <button 
                              onClick={() => onConfirmPayment(bk.id)}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                            >
                               Verify Funds
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedReceipt(bk)}
                              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                            >
                               <i className="fas fa-file-invoice text-xs"></i>
                            </button>
                          )}
                       </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-32 text-center">
                          <i className="fas fa-receipt text-slate-100 text-6xl mb-6"></i>
                          <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic">Tidak ada sirkulasi finansial pada node ini.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* 4. RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={() => setSelectedReceipt(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600"></div>

              <div className="flex justify-between items-start mb-12 border-b border-slate-50 pb-12">
                 <div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Official Receipt</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Treasury Node Verified • Ref: {selectedReceipt.id}</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-2xl text-slate-900 uppercase leading-none">SEULANGA.</p>
                    <p className="text-[9px] font-bold text-indigo-600 uppercase mt-2 tracking-widest">{business.name}</p>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-12 scrollbar-hide">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Guest Node</p>
                       <p className="text-lg font-black text-slate-900 uppercase">G-IDENTITY-#{selectedReceipt.guestId.toUpperCase()}</p>
                    </div>
                    <div className="text-right space-y-4">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Operational Period</p>
                       <p className="text-sm font-black text-slate-700 uppercase">{selectedReceipt.checkIn} — {selectedReceipt.checkOut}</p>
                    </div>
                 </div>

                 <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span>Unit Rental ({units.find(u => u.id === selectedReceipt.unitId)?.name})</span>
                       <span className="text-slate-900 font-black">Rp {selectedReceipt.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span>Platform Service Node</span>
                       <span className="text-slate-900 font-black">Rp 0</span>
                    </div>
                    <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Settlement Total</span>
                       <span className="text-4xl font-black text-indigo-600">Rp {selectedReceipt.totalPrice.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-end pt-8">
                    <div className="space-y-4">
                       <div className="w-32 h-32 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                          <i className="fas fa-qrcode text-6xl text-slate-200"></i>
                       </div>
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Digital Signatory Active</p>
                    </div>
                    <div className="text-center w-64">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Authorized Representative</p>
                          <div className="h-px bg-slate-200 w-full mb-3"></div>
                          <p className="text-xs font-black text-slate-900 uppercase italic">Digital Signature</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-100 mt-8 grid grid-cols-2 gap-4">
                 <button onClick={() => window.print()} className="py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all">
                    <i className="fas fa-print"></i> Print Document
                 </button>
                 <button onClick={() => alert('Dispatching digital receipt to guest node email...')} className="py-5 bg-white border border-indigo-200 text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all">
                    <i className="fas fa-paper-plane"></i> Send to Guest
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
