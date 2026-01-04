
import React, { useState, useMemo } from 'react';
import { User } from '../../types';

interface Task {
  id: string;
  title: string;
  category: 'Front Desk' | 'Housekeeping' | 'Maintenance';
  status: 'todo' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedAt: string;
}

interface Activity {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  type: 'auth' | 'transaction' | 'ops';
}

interface TaskActivityHubProps {
  currentUser: User | null;
}

export const TaskActivityHub: React.FC<TaskActivityHubProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [shiftNote, setShiftNote] = useState('');
  
  // 1. MOCK DATA: TASKS
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'tk-1', title: 'Verify IDs for Inbound Guest #BK29', category: 'Front Desk', status: 'todo', priority: 'high', assignedAt: '08:00 AM' },
    { id: 'tk-2', title: 'Coordinate laundry pickup for Complex B', category: 'Housekeeping', status: 'progress', priority: 'medium', assignedAt: '09:15 AM' },
    { id: 'tk-3', title: 'Check minibar inventory Unit 305', category: 'Front Desk', status: 'done', priority: 'low', assignedAt: '07:30 AM' },
    { id: 'tk-4', title: 'Replace faulty card reader Unit 102', category: 'Maintenance', status: 'todo', priority: 'high', assignedAt: '10:00 AM' },
  ]);

  // 2. MOCK DATA: PERSONAL ACTIVITY LOG
  const activities: Activity[] = [
    { id: 'act-1', timestamp: '10:45:12', action: 'Authorized Check-In', target: 'Node #BK102', type: 'ops' },
    { id: 'act-2', timestamp: '10:30:05', action: 'Verified Payment', target: 'Node #BK99', type: 'transaction' },
    { id: 'act-3', timestamp: '09:00:00', action: 'Shift Start', target: 'Terminal A-1', type: 'auth' },
    { id: 'act-4', timestamp: 'Yesterday', action: 'Shift Closed', target: 'Terminal A-1', type: 'auth' },
  ];

  // 3. HANDLERS
  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: Task['status'] = t.status === 'todo' ? 'progress' : t.status === 'progress' ? 'done' : 'todo';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleCommitShiftNote = () => {
    if (!shiftNote.trim()) return;
    alert('Shift Handover Protocol: Note committed to the internal ledger.');
    setShiftNote('');
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER & TOP NAVIGATION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Task & Accountability Hub</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Sinkronisasi tugas personal dan rekaman aktivitas operasional.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-50' + 'text-slate-500 hover:bg-slate-50'}`}
          >
            Duty Matrix ({tasks.filter(t => t.status !== 'done').length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Personal Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT/MAIN: CONTENT AREA */}
        <div className="lg:col-span-2 space-y-10">
          {activeTab === 'tasks' ? (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight ml-2">Assigned Protocols</h3>
              <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => (
                  <div key={task.id} className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:border-indigo-200 ${task.status === 'done' ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-center gap-8">
                       <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all border-2 ${
                          task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' :
                          task.status === 'progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' :
                          'bg-white border-slate-100 text-slate-200 hover:border-indigo-300'
                        }`}
                       >
                         <i className={`fas ${task.status === 'done' ? 'fa-check-double' : 'fa-circle-dot'}`}></i>
                       </button>
                       <div>
                          <p className="font-black text-slate-900 uppercase text-sm group-hover:text-indigo-600 transition-colors">{task.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{task.category}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${
                               task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                             }`}>{task.priority} Priority</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{task.assignedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Forensic Activity Audit</h3>
                  <i className="fas fa-fingerprint text-indigo-200 text-xl"></i>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/30">
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Action</th>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entity Node</th>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Temporal Axis</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                        {activities.map(act => (
                           <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] ${
                                      act.type === 'ops' ? 'bg-emerald-50 text-emerald-600' :
                                      act.type === 'transaction' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                       <i className={`fas ${act.type === 'ops' ? 'fa-bolt' : act.type === 'transaction' ? 'fa-dollar-sign' : 'fa-key'}`}></i>
                                    </div>
                                    <span className="font-black text-slate-900 uppercase">{act.action}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-6 text-center text-indigo-600 font-bold uppercase">{act.target}</td>
                              <td className="px-10 py-6 text-right text-slate-400 font-black uppercase tracking-tighter">{act.timestamp}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>

        {/* RIGHT: SHIFT HANDOVER & STATUS */}
        <div className="space-y-10">
           <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 text-2xl shadow-inner">
                       <i className="fas fa-handshake-angle"></i>
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">Shift Ledger</h3>
                       <p className="text-indigo-400/60 text-[9px] font-black uppercase tracking-widest">Inbound Handover Protocol</p>
                    </div>
                 </div>

                 <textarea 
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="Record observations for next operator node... (e.g. Broken AC in 201, Guest in 105 requested 4AM taxi, laundry delay)"
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-sm font-medium text-indigo-100 outline-none focus:ring-4 ring-indigo-500/10 transition-all resize-none h-48 placeholder:text-white/20"
                 />
              </div>
              
              <button 
                onClick={handleCommitShiftNote}
                className="relative z-10 w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95"
              >
                 Commit Shift Note
              </button>
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest italic">Performance Axis</h4>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              </div>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 mb-2">
                       <span>Protocol Completion</span>
                       <span className="text-indigo-600">75%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 w-[75%]"></div>
                    </div>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-900 uppercase mb-1 leading-none italic">SOP Reminder</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">"Pastikan setiap verifikasi identitas fisik dicatat secara kronologis dalam terminal."</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-6 group hover:bg-indigo-50 transition-all">
         <i className="fas fa-shield-halved text-indigo-400 text-xl group-hover:scale-110 transition-transform"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">SEULANGA ACCOUNTABILITY ENGINE v4.1 ACTIVE • NODE SURVEILLANCE ENABLED</p>
      </div>
    </div>
  );
};
