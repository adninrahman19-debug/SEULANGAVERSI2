
import React, { useState } from 'react';
import { User, CategoryModuleConfig, BusinessStatus } from '../../types';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_USERS } from '../../constants';
import { Overview } from './Overview';
import { TenantManager } from './TenantManager';
import { FlexEngine } from './FlexEngine';

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'tenants' | 'engine' | 'analytics' | 'finance' | 'security' | 'settings';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

const platformTrendData = [
  { name: 'Mon', bookings: 12, revenue: 18000000 },
  { name: 'Tue', bookings: 18, revenue: 24500000 },
  { name: 'Wed', bookings: 15, revenue: 19800000 },
  { name: 'Thu', bookings: 22, revenue: 32000000 },
  { name: 'Fri', bookings: 35, revenue: 48000000 },
  { name: 'Sat', bookings: 45, revenue: 62000000 },
  { name: 'Sun', bookings: 38, revenue: 55000000 },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  activeTab, 
  onNavigate, 
  moduleConfigs,
  onUpdateModuleConfigs,
  currentUser,
  onUpdateUser
}) => {
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);

  const handleUpdateStatus = (id: string, status: BusinessStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    alert(`Status ${id} updated to ${status}`);
  };

  const handleTerminate = (id: string) => {
    if (confirm("WARNING: Purge business node permanently?")) {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      alert(`Node ${id} terminated.`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{activeTab} Matrix</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Governance Tier: Master Alpha Node</p>
         </div>
      </div>

      {activeTab === 'overview' && <Overview businesses={businesses} users={MOCK_USERS} transactions={MOCK_TRANSACTIONS} platformTrendData={platformTrendData} />}
      {activeTab === 'tenants' && <TenantManager businesses={businesses} users={MOCK_USERS} transactions={MOCK_TRANSACTIONS} onUpdateStatus={handleUpdateStatus} onTerminate={handleTerminate} />}
      {activeTab === 'engine' && <FlexEngine moduleConfigs={moduleConfigs} onUpdateModuleConfigs={onUpdateModuleConfigs} />}
      
      {!['overview', 'tenants', 'engine'].includes(activeTab) && (
         <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center text-3xl mb-8"><i className="fas fa-layer-group"></i></div>
            <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">{activeTab} Node Online</h3>
            <p className="text-slate-400 font-medium max-w-md">Accessing governance protocols for {activeTab}.</p>
         </div>
      )}
    </div>
  );
};
