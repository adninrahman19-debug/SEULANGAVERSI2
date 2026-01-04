
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, ChatThread, ChatMessage, UserRole } from '../../types';
import { MOCK_CHAT_THREADS, MOCK_BUSINESSES } from '../../constants';

interface CommunicationHubProps {
  currentUser: User;
  language: 'id' | 'en';
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({ currentUser, language }) => {
  const [threads, setThreads] = useState<ChatThread[]>(MOCK_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threads[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThreadId, threads]);

  const activeThread = useMemo(() => 
    threads.find(t => t.id === activeThreadId), 
  [threads, activeThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter(t => 
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId) return;

    const msg: ChatMessage = {
      id: `m-new-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: UserRole.GUEST,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: true
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: newMessage,
          lastTimestamp: msg.timestamp,
          messages: [...t.messages, msg]
        };
      }
      return t;
    }));

    setNewMessage('');
    
    // Simulated Automated Entity Reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `m-rep-${Date.now()}`,
        senderId: 'staff-node',
        senderName: 'Entity Support',
        senderRole: UserRole.ADMIN_STAFF,
        content: 'Signal Received. Node operator akan segera menanggapi permintaan Anda.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isRead: false
      };
      
      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: reply.content,
            lastTimestamp: reply.timestamp,
            messages: [...t.messages, reply]
          };
        }
        return t;
      }));
    }, 2000);
  };

  const handleFileUpload = () => {
    alert('Payload Selector Active: Silakan pilih file identitas atau bukti pendukung untuk diunggah ke node chat.');
  };

  const d = {
    id: {
      title: 'Sinyal Komunikasi',
      sub: 'Dialog terenkripsi dengan unit operasional dan manajemen properti.',
      search_p: 'Cari node bisnis...',
      input_p: 'Kirim pesan ke node...',
      empty_threads: 'Tidak ada sinyal percakapan.',
      no_active: 'Pilih thread untuk memulai sinkronisasi pesan.',
      status_online: 'Node Online',
      status_away: 'Node Standby'
    },
    en: {
      title: 'Signal Communication',
      sub: 'Encrypted dialogue with operational units and property management.',
      search_p: 'Search business node...',
      input_p: 'Transmit message to node...',
      empty_threads: 'No conversation signals found.',
      no_active: 'Select a thread to initialize message sync.',
      status_online: 'Node Online',
      status_away: 'Node Standby'
    }
  }[language];

  return (
    <div className="h-[calc(100vh-280px)] flex flex-col lg:flex-row gap-8 animate-fade-up">
      
      {/* 1. THREAD SIDEBAR */}
      <aside className="w-full lg:w-96 flex flex-col space-y-6 bg-white rounded-[48px] border border-slate-100 shadow-sm p-8 shrink-0">
        <div className="space-y-6">
           <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{d.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Access Active</p>
           </div>
           <div className="relative">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder={d.search_p}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
           {filteredThreads.map(t => (
             <button
               key={t.id}
               onClick={() => setActiveThreadId(t.id)}
               className={`w-full p-6 rounded-[32px] border text-left transition-all relative overflow-hidden group flex items-center gap-4 ${
                 activeThreadId === t.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-indigo-200'
               }`}
             >
                <div className="relative">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shadow-sm border-2 border-white/20 flex items-center justify-center">
                      <i className={`fas fa-building ${activeThreadId === t.id ? 'text-white' : 'text-slate-400'}`}></i>
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${activeThreadId === t.id ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-sm uppercase truncate pr-4">{t.businessName}</h4>
                      <span className={`text-[8px] font-black uppercase ${activeThreadId === t.id ? 'text-indigo-200' : 'text-slate-300'}`}>{t.lastTimestamp}</span>
                   </div>
                   <p className={`text-[10px] truncate ${activeThreadId === t.id ? 'text-indigo-100/60' : 'text-slate-400'}`}>{t.lastMessage}</p>
                </div>
                {t.unreadCount > 0 && !activeThreadId?.includes(t.id) && (
                   <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg">
                      {t.unreadCount}
                   </div>
                )}
             </button>
           ))}
           {filteredThreads.length === 0 && (
              <div className="py-20 text-center opacity-20 italic font-black uppercase text-[10px] tracking-widest">{d.empty_threads}</div>
           )}
        </div>
      </aside>

      {/* 2. CHAT MAIN INTERFACE */}
      <main className="flex-1 bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
        {activeThread ? (
           <>
              {/* Chat Header */}
              <header className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                       <i className="fas fa-hotel"></i>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeThread.businessName}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{d.status_online}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-phone"></i></button>
                    <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><i className="fas fa-ellipsis-v"></i></button>
                 </div>
              </header>

              {/* Message Stream */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth"
              >
                 <div className="text-center py-4">
                    <span className="bg-slate-50 text-slate-300 px-6 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encryption Shard Active</span>
                 </div>

                 {activeThread.messages.map(msg => {
                    const isMe = msg.senderRole === UserRole.GUEST;
                    return (
                       <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[70%] space-y-2 ${isMe ? 'items-end' : 'items-start'}`}>
                             <div className={`p-6 rounded-[32px] text-sm font-medium leading-relaxed ${
                               isMe ? 'bg-slate-950 text-white rounded-tr-none shadow-2xl' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                             }`}>
                                {msg.content}
                             </div>
                             <div className={`flex items-center gap-3 text-[8px] font-black uppercase tracking-widest px-2 ${isMe ? 'flex-row-reverse text-slate-300' : 'text-slate-400'}`}>
                                <span>{msg.timestamp}</span>
                                {isMe && <i className="fas fa-check-double text-indigo-500"></i>}
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>

              {/* Input Control */}
              <footer className="p-8 bg-white border-t border-slate-50 shrink-0">
                 <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-2 rounded-[32px] border border-slate-200 focus-within:ring-4 ring-indigo-50 transition-all">
                    <button 
                      type="button" 
                      onClick={handleFileUpload}
                      className="w-12 h-12 bg-white text-slate-400 hover:text-indigo-600 rounded-full flex items-center justify-center transition-all shadow-sm border border-slate-100"
                    >
                       <i className="fas fa-paperclip"></i>
                    </button>
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={d.input_p}
                      className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-bold text-slate-700 text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
                        newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                       <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                 </form>
              </footer>
           </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-10">
              <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center text-5xl text-slate-200 shadow-inner border border-white">
                 <i className="fas fa-comment-dots"></i>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase">{d.no_active}</h3>
                 <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">{d.sub}</p>
              </div>
           </div>
        )}
      </main>

      {/* 3. MOBILE FLOATING SIGNAL INDICATOR (Visual Only) */}
      <div className="fixed bottom-32 right-10 z-[200] lg:hidden">
         <button className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl shadow-indigo-900/40 animate-bounce">
            <i className="fas fa-message"></i>
            <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 rounded-full border-4 border-white"></span>
         </button>
      </div>

    </div>
  );
};
