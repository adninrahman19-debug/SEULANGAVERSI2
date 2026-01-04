
import React, { useState } from 'react';
import { User, CategoryModuleConfig, BusinessStatus, Business } from '../../types';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_USERS, MOCK_BOOKINGS } from '../../constants';
import { GlobalOverview } from './GlobalOverview';
import { TenantGovernance } from './TenantGovernance';
import { FlexEngine } from './FlexEngine';
import { IdentityMatrix } from './IdentityMatrix';
import { BookingOversight } from './BookingOversight';
import { MonetizationCenter } from './MonetizationCenter';
import { BillingMatrix } from './BillingMatrix';
import { MarketplaceContentControl } from './MarketplaceContentControl';
import { TrustCenter } from './TrustCenter';
import { PlatformAnalytics } from './PlatformAnalytics';
import { SystemConfiguration } from './SystemConfiguration';

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'tenants' | 'engine' | 'analytics' | 'finance' | 'security' | 'settings' | 'oversight' | 'monetization' | 'quality' | 'accounts' | 'trust';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

const platformTrendData = [
  { name: 'Mon', bookings: 12, revenue: 18000000, commission: 2160000 },
  { name: 'Tue', bookings: 18, revenue: 24500000, commission: 2940000 },
  { name: 'Wed', bookings: 15, revenue: 19800000, commission: 2376000 },
  { name: 'Thu', bookings: 22, revenue: 32000000, commission: 3840000 },
  { name: 'Fri', bookings: 35, revenue: 48000000, commission: 5760000 },
  { name: 'Sat', bookings: 45, revenue: 62000000, commission: 7440000 },
  { name: 'Sun', bookings: 38, revenue: 55000000, commission: 6600000 },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  activeTab, 
  onNavigate, 
  moduleConfigs,
  onUpdateModuleConfigs,
  currentUser,
  onUpdateUser
}) => {
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES.map(b => ({
    ...b,
    subscriptionExpiry: '2025-12-31',
    isTrial: false,
    registrationDate: '2024-01-15',
    penaltyCount: 0
  })));

  const handleUpdateStatus = (id: string, status: BusinessStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    alert(`Protocol Update: Node ${id} transitioned to ${status.toUpperCase()}. Ecosystem status updated.`);
  };

  const handleTerminate = (id: string) => {
    if (confirm("CRITICAL WARNING: This will permanently purge the business entity and all its marketplace threads from the SEULANGA ecosystem. This action is immutable. Proceed?")) {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      alert(`Node ${id} has been strategically terminated.`);
    }
  };

  const handleUpdateCategory = (id: string, category: string) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, category } : b));
    alert(`Topology update successful for Node ${id}.`);
  };

  const handleUpdateBusiness = (id: string, data: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header Context (Internal to Main Content) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <p className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
               Authorized Matrix Control
            </p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
               {activeTab === 'overview' ? 'Ecosystem Monitor' : 
                activeTab === 'accounts' ? 'ID Matrix' : 
                activeTab === 'oversight' ? 'Risk & Oversight' :
                activeTab === 'monetization' ? 'Treasury & Revenue' :
                activeTab === 'finance' ? 'Subscription Hub' :
                activeTab === 'quality' ? 'Marketplace Hub' :
                activeTab === 'trust' ? 'Trust & Disputes' :
                activeTab === 'analytics' ? 'Strategic Intelligence' :
                activeTab === 'settings' ? 'System Cockpit' :
                activeTab.replace('-', ' ')}
            </h1>
         </div>
         <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="text-right">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Version</p>
               <p className="text-xs font-black text-slate-900">v2.4.0-Stable</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
               <i className="fas fa-shield-halved"></i>
            </div>
         </div>
      </div>

      <div className="min-h-[70vh]">
        {activeTab === 'overview' && (
          <GlobalOverview 
            businesses={businesses} 
            users={MOCK_USERS} 
            transactions={MOCK_TRANSACTIONS} 
            platformTrendData={platformTrendData} 
          />
        )}
        {activeTab === 'tenants' && (
          <TenantGovernance 
            businesses={businesses} 
            onUpdateStatus={handleUpdateStatus} 
            onTerminate={handleTerminate} 
            onUpdateCategory={handleUpdateCategory}
            onAddBusiness={(data) => console.log('Add business', data)}
          />
        )}
        {activeTab === 'engine' && (
          <FlexEngine 
            moduleConfigs={moduleConfigs} 
            onUpdateModuleConfigs={onUpdateModuleConfigs} 
          />
        )}
        {activeTab === 'accounts' && (
          <IdentityMatrix 
            onUpdateUser={(id, data) => console.log('Update user', id, data)}
            onResetPassword={(id) => alert(`Password reset token dispatched for Node: ${id}`)}
          />
        )}
        {activeTab === 'oversight' && (
          <BookingOversight 
            bookings={MOCK_BOOKINGS}
            transactions={MOCK_TRANSACTIONS}
            businesses={businesses}
          />
        )}
        {activeTab === 'monetization' && (
          <MonetizationCenter 
            transactions={MOCK_TRANSACTIONS}
            businesses={businesses}
          />
        )}
        {activeTab === 'finance' && (
          <BillingMatrix 
            businesses={businesses}
            onUpdateBusiness={handleUpdateBusiness}
          />
        )}
        {activeTab === 'quality' && (
          <MarketplaceContentControl 
            businesses={businesses}
            onUpdateBusiness={handleUpdateBusiness}
          />
        )}
        {activeTab === 'trust' && (
          <TrustCenter 
            businesses={businesses}
            onUpdateBusiness={handleUpdateBusiness}
          />
        )}
        {activeTab === 'analytics' && (
          <PlatformAnalytics 
            businesses={businesses}
            users={MOCK_USERS}
            transactions={MOCK_TRANSACTIONS}
          />
        )}
        {activeTab === 'settings' && (
          <SystemConfiguration />
        )}
        
        {!['overview', 'tenants', 'engine', 'accounts', 'oversight', 'monetization', 'finance', 'quality', 'trust', 'analytics', 'settings'].includes(activeTab) && (
           <div className="bg-white p-20 rounded-[64px] border border-slate-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-32 h-32 bg-slate-50 text-slate-300 rounded-[40px] flex items-center justify-center text-5xl shadow-inner border border-slate-100">
                 <i className="fas fa-layer-group"></i>
              </div>
              <div>
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">{activeTab} Hub Synchronized</h3>
                 <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                    Governance console for <strong>"{activeTab}"</strong> is currently in monitor mode. Strategic data threads are operational.
                 </p>
              </div>
              <button onClick={() => onNavigate('super-admin', 'overview')} className="px-10 py-4 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Kembali Ke Pintu Utama</button>
           </div>
        )}
      </div>
    </div>
  );
};
