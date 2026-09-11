import React from 'react';
import { LayoutDashboard, Box, Users, LogOut, Globe, Calendar, GitPullRequest, Wrench, ShieldAlert, History, BarChart3 } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const isSuperAdmin = user?.superAdmin;

  return (
    <aside className="w-64 bg-[#1c372e] text-white flex flex-col justify-between border-r border-[#142a23] shrink-0 min-h-screen">
      {/* Top Header & Logo */}
      <div>
        <div className="p-6 border-b border-[#28493e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#2a4d41] flex items-center justify-center border border-[#396254]">
              <Box className="w-5 h-5 text-[#f4c453]" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-lg tracking-tight text-white flex items-center space-x-1.5">
                <span>inventory/room</span>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-[#a8b8b3] uppercase">
                {isSuperAdmin ? 'SUPER ADMIN PORTAL' : (user?.companyName || 'ENTERPRISE AMS')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold tracking-widest text-[#6d8a80] uppercase mb-2">
              {isSuperAdmin ? 'SUPER ADMIN GOVERNANCE' : 'ENTERPRISE MODULES'}
            </p>
            
            <nav className="space-y-1">
              {isSuperAdmin ? (
                /* Super Admin Scope ONLY */
                <button
                  onClick={() => setActiveTab('superadmin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'superadmin'
                      ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                      : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4" />
                    <span>Company Control</span>
                  </div>
                  {activeTab === 'superadmin' && <div className="w-1.5 h-1.5 rounded-full bg-[#1c372e]" />}
                </button>
              ) : (
                /* Company Tenant Workspace Scope */
                <>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'overview'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Overview</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('assets')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'assets'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Box className="w-4 h-4" />
                      <span>Asset inventory</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('people')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'people'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4" />
                      <span>People Directory</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'resources'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4" />
                      <span>Resource Booking</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'requests'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <GitPullRequest className="w-4 h-4" />
                      <span>Requests & Approvals</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'maintenance'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Wrench className="w-4 h-4" />
                      <span>Maintenance</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('warranty')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'warranty'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Warranty & Alerts</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'audit'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <History className="w-4 h-4" />
                      <span>Audit Trail</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'reports'
                        ? 'bg-[#f4c453] text-[#1c372e] shadow-md'
                        : 'text-[#c2d3cd] hover:bg-[#254439] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>Reports & Export</span>
                    </div>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-[#28493e] space-y-3">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#24453a]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#f4c453] text-[#1c372e] font-extrabold text-xs flex items-center justify-center shrink-0">
              {user?.initials || 'MS'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Mara Singh'}</p>
              <p className="text-[10px] font-mono text-[#a8b8b3] truncate">{isSuperAdmin ? 'SUPER ADMIN' : (user?.role || 'User')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 text-[#a8b8b3] hover:text-white hover:bg-[#2e5648] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
