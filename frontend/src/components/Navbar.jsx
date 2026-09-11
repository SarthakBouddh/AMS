import React from 'react';
import { Bell, Building2, ShieldCheck } from 'lucide-react';

export default function Navbar({ user }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).toUpperCase();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good evening';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <header className="bg-[#f9f8f3] border-b border-[#eae7de] px-8 py-5 flex items-center justify-between font-sans">
      {/* Date & Greeting */}
      <div>
        <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
          {currentDate}
        </p>
        <h2 className="font-heading text-xl font-extrabold text-[#1c2826] tracking-tight mt-0.5">
          {getGreeting()}, {firstName}
        </h2>
      </div>

      {/* Tenant Indicator & System Status */}
      <div className="flex items-center space-x-4">
        {/* Tenant Company Badge */}
        {user?.superAdmin ? (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-200 shadow-sm text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold font-mono">System Governance</span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#eae7de] shadow-sm">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-[#1c2826]">
              {user?.companyName || 'Northstar Studio'}
            </span>
          </div>
        )}

        {/* Backend Connectivity Status */}
        {/* <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#e3efe9] border border-[#cbdad5] text-xs font-semibold text-[#1c372e]">
          <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
          <span>MongoDB Backend Connected</span>
        </div> */}

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-white border border-[#eae7de] text-[#556661] hover:text-[#1c2826] hover:bg-[#f2efe4] transition-colors card-shadow">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f4c453]" />
        </button>

        {/* Department Info Pill */}
        <div className="text-right pl-2 border-l border-[#eae7de]">
          <p className="text-xs font-bold text-[#1c2826] leading-tight">
            {user?.superAdmin ? 'Super Admin' : (user?.role || 'Operations')}
          </p>
          <p className="text-[10px] font-mono text-[#788883]">
            {user?.superAdmin ? 'System Governance' : (user?.companyName || 'Company Name')}
          </p>
        </div>
      </div>
    </header>
  );
}
