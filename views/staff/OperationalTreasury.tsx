
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit } from '../../types';

interface OperationalTreasuryProps {
  bookings: Booking[];
  units: Unit[];
  onConfirmPayment: (bookingId: string, proofUrl?: string) => void;
}

export const OperationalTreasury: React.FC<OperationalTreasuryProps> = ({ 
  bookings, units, onConfirmPayment 
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'cleared'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingBooking, setInspectingBooking] = useState<Booking | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // 1. DATA FILTERING
  const filteredList = useMemo(() => {
    return bookings.filter(b => {
      const isSettled = b.verifiedPayment;
      const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'pending' ? !isSettled : isSettled;
      return matchesSearch && matchesTab && b.status !== BookingStatus.CANCELLED;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, activeTab, searchQuery]);

  // 2. HANDLERS
  const handleVerify = (id: string) => {
    onConfirmPayment(id);
    setInspectingBooking(null);
    alert(`Treasury Authorization: Settlement node ${id} verified and cleared.`);
  };

  const openReceipt = (bk: Booking) => {
    setInspectingBooking(bk);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER & CONTROL HUB */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Operational Treasury</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Kliring transaksi harian dan verifikasi bukti bayar fisik.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Awaiting Auth ({bookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).length})
          </button>
          <button 
            onClick={() => setActiveTab('cleared')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cleared' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Cleared Ledger
          </button>
        </div>
      </div>

      {/* SEARCH HUB */}
      <div className="relative w-full md:w-96">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
        <input 
          type="text" 
          placeholder="Search Transaction ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50"
        />
      </div>

      {/* TRANSACTION MATRIX */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Context</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Economic Value</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map(bk => {
                const unit = units.find(u => u.id === bk.unitId);
                return (
                  <tr key={bk.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-black text-slate-900 uppercase text-xs">#{bk.id}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ref: {unit?.name}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-black text-slate-700 uppercase">G-ID-{bk.guestId.substring(0,8).toUpperCase()}</p>
                      <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Validated Chain</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-lg font-black text-slate-900 tracking-tighter">Rp {bk.totalPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        bk.verifiedPayment ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>{bk.verifiedPayment ? 'Settled' : 'Pending'}</span>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      {!bk.verifiedPayment ? (
                        <button onClick={() => setInspectingBooking(bk)} className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">Verify Evidence</button>
                      ) : (
                        <button onClick={() => openReceipt(bk)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><i className="fas fa-print text-xs"></i></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VERIFICATION PROTOCOL */}
      {inspectingBooking && !isReceiptOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
            <button onClick={() => setInspectingBooking(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
            
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3 italic">Verify Settlement</h3>
              <p className="text-slate-400 text-sm font-medium">Inspecting evidence for Node #{inspectingBooking.id}</p>
            </div>

            <div className="space-y-8">
               <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Payload</p>
                    <p className="text-3xl font-black text-slate-900">Rp {inspectingBooking.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <i className="fas fa-shield-check"></i>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence Node (Proof of Payment)</p>
                  <div className="w-full h-64 bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all">
                     {inspectingBooking.paymentProof ? (
                       <img src={inspectingBooking.paymentProof} className="w-full h-full object-cover" alt="Proof" />
                     ) : (
                       <>
                         <i className="fas fa-cloud-arrow-up text-4xl text-slate-300 group-hover:text-indigo-400 transition-colors mb-4"></i>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Upload Required</p>
                       </>
                     )}
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={() => setInspectingBooking(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest">Reject Node</button>
                  <button onClick={() => handleVerify(inspectingBooking.id)} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">Authorize Clearance</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE RECEIPT */}
      {isReceiptOpen && inspectingBooking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setIsReceiptOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              {/* Receipt Visual */}
              <div className="border-2 border-slate-950 p-10 rounded-2xl space-y-10 relative">
                 <div className="flex justify-between items-start border-b-2 border-slate-950 pb-8">
                    <div>
                       <h4 className="text-2xl font-black uppercase tracking-tighter">Official Receipt</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {inspectingBooking.id}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-xl leading-none">SEULANGA.</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Operational Node Verified</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase">
                    <div>
                       <p className="text-slate-300 mb-2">Guest Identity</p>
                       <p className="text-slate-900">G-NODE-#{inspectingBooking.guestId.substring(0,6)}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-300 mb-2">Date</p>
                       <p className="text-slate-900">{new Date().toISOString().split('T')[0]}</p>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                    <div className="flex justify-between text-xs font-black uppercase">
                       <span>Operational Settlement</span>
                       <span>Rp {inspectingBooking.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-slate-200 w-full"></div>
                    <div className="flex justify-between text-lg font-black uppercase">
                       <span>Total PAID</span>
                       <span className="text-indigo-600">Rp {inspectingBooking.totalPrice.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-end pt-4">
                    <i className="fas fa-qrcode text-5xl text-slate-200"></i>
                    <div className="text-center border-t border-slate-200 pt-2 w-32">
                       <p className="text-[8px] font-black uppercase">Authorized Staff</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => window.print()} className="py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    <i className="fas fa-print"></i> Print Receipt
                 </button>
                 <button onClick={() => alert('Receipt dispatched to Guest Node Email.')} className="py-5 bg-white border border-slate-200 text-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-widest">Send to Guest</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
