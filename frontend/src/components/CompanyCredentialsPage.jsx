import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Building2, 
  Lock, 
  Mail, 
  Briefcase, 
  Eye, 
  EyeOff,
  Sparkles,
  UserX,
  RotateCcw
} from 'lucide-react';
import api from '../api';

export default function CompanyCredentialsPage({ currentUser, currentCompanyId }) {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId || '');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [showPasswordMap, setShowPasswordMap] = useState({});

  // Add Credential Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: 'Operations',
    password: ''
  });

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState(null);
  const [customResetPassword, setCustomResetPassword] = useState('');

  const targetCompanyId = selectedCompanyId || currentUser?.companyId || 'comp-northstar';

  useEffect(() => {
    fetchInitialData();
  }, [selectedCompanyId, currentUser]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      if (currentUser?.superAdmin) {
        const comps = await api.getCompanies();
        setCompanies(comps || []);
        if (!selectedCompanyId && comps && comps.length > 0) {
          setSelectedCompanyId(comps[0].id);
          setSelectedCompany(comps[0]);
        } else if (selectedCompanyId && comps) {
          const match = comps.find(c => c.id === selectedCompanyId);
          setSelectedCompany(match || null);
        }
      }

      const compUsers = await api.getCompanyUsers(targetCompanyId);
      setUsers(compUsers || []);
    } catch (e) {
      console.error('Error loading company users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyChange = (e) => {
    const compId = e.target.value;
    setSelectedCompanyId(compId);
    const match = companies.find(c => c.id === compId);
    setSelectedCompany(match || null);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) return;

    setIsLoading(true);
    const result = await api.createCompanyCredential(targetCompanyId, {
      ...addForm,
      companyId: targetCompanyId,
      companyName: selectedCompany?.name || currentUser?.companyName || 'Company'
    });

    if (result && !result.error) {
      setShowAddModal(false);
      setAddForm({ name: '', email: '', role: 'Employee', department: 'Operations', password: '' });
      fetchInitialData();
    } else {
      alert('Failed to create user credential.');
    }
    setIsLoading(false);
  };

  const handleResetPasswordConfirm = async () => {
    if (!resetModalUser) return;
    setIsLoading(true);

    const updated = await api.resetCompanyUserPassword(targetCompanyId, resetModalUser.id, customResetPassword);
    if (updated) {
      setResetModalUser(null);
      setCustomResetPassword('');
      fetchInitialData();
    } else {
      alert('Failed to reset password.');
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to revoke credentials and delete access for ${userEmail}?`)) return;
    
    setIsLoading(true);
    const success = await api.deleteCompanyCredential(targetCompanyId, userId);
    if (success) {
      fetchInitialData();
    } else {
      alert('Failed to delete user credential.');
    }
    setIsLoading(false);
  };

  const handleRestoreUser = async (userId, userEmail) => {
    setIsLoading(true);
    const restored = await api.restoreCompanyUser(targetCompanyId, userId);
    if (restored) {
      fetchInitialData();
    } else {
      alert('Failed to restore user credentials.');
    }
    setIsLoading(false);
  };

  const handlePermanentDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`PERMANENT ACTION: Are you sure you want to permanently purge credential record for ${userEmail}? This cannot be undone.`)) return;
    setIsLoading(true);
    const deleted = await api.permanentDeleteCompanyCredential(targetCompanyId, userId);
    if (deleted) {
      fetchInitialData();
    } else {
      alert('Failed to permanently delete user.');
    }
    setIsLoading(false);
  };

  // Role & Revocation Category Normalization
  const getNormalizedCategory = (user) => {
    if (!user) return 'EMPLOYEE';
    if (user.revoked || user.role === 'REVOKED' || user.status === 'REVOKED') return 'REVOKED';
    const roleStr = user.role || '';
    const r = roleStr.toLowerCase();
    if (r.includes('admin') || r.includes('director')) return 'ADMIN';
    if (r.includes('head') || r.includes('lead') || r.includes('operations')) return 'OPERATIONAL_HEAD';
    if (r.includes('manager') || r.includes('supervisor')) return 'MANAGER';
    return 'EMPLOYEE';
  };

  const filteredUsers = users.filter(user => {
    const category = getNormalizedCategory(user);
    let matchesTab = false;
    if (activeTab === 'ALL') {
      matchesTab = category !== 'REVOKED';
    } else {
      matchesTab = category === activeTab;
    }

    const matchesSearch = !searchQuery || 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const countByRole = {
    ADMIN: users.filter(u => getNormalizedCategory(u) === 'ADMIN').length,
    OPERATIONAL_HEAD: users.filter(u => getNormalizedCategory(u) === 'OPERATIONAL_HEAD').length,
    MANAGER: users.filter(u => getNormalizedCategory(u) === 'MANAGER').length,
    EMPLOYEE: users.filter(u => getNormalizedCategory(u) === 'EMPLOYEE').length,
    REVOKED: users.filter(u => getNormalizedCategory(u) === 'REVOKED').length,
  };

  const activeUsersCount = users.filter(u => !u.revoked && u.role !== 'REVOKED').length;

  const getRoleBadgeStyle = (user) => {
    const category = getNormalizedCategory(user);
    switch (category) {
      case 'REVOKED':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'ADMIN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'OPERATIONAL_HEAD':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'MANAGER':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-[#eae7de] card-shadow p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#788883] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#1c372e]" />
            <span>Company Account & Credential Governance</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-[#1c2826] tracking-tight">
            {selectedCompany ? selectedCompany.name : (currentUser?.companyName || 'Company Directory')} Credentials
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {currentUser?.superAdmin && companies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#475752]">Select Company:</span>
              <select
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                className="rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs font-bold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-[#1c372e] text-white text-xs font-bold shadow-md hover:bg-[#142a23] transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add User Credential
          </button>
        </div>
      </div>

      {/* Category Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => setActiveTab('ADMIN')}
          className={`cursor-pointer bg-white rounded-2xl border p-4 transition-all card-shadow ${activeTab === 'ADMIN' ? 'border-[#1c372e] ring-2 ring-[#1c372e]/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-700 uppercase">Admin Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-extrabold text-[#1c2826]">{countByRole.ADMIN}</span>
            <span className="text-[11px] text-[#788883] block">Full System Access</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('OPERATIONAL_HEAD')}
          className={`cursor-pointer bg-white rounded-2xl border p-4 transition-all card-shadow ${activeTab === 'OPERATIONAL_HEAD' ? 'border-[#1c372e] ring-2 ring-[#1c372e]/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Operational Heads</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-extrabold text-[#1c2826]">{countByRole.OPERATIONAL_HEAD}</span>
            <span className="text-[11px] text-[#788883] block">Dept Leads & Operations</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('MANAGER')}
          className={`cursor-pointer bg-white rounded-2xl border p-4 transition-all card-shadow ${activeTab === 'MANAGER' ? 'border-[#1c372e] ring-2 ring-[#1c372e]/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-700 uppercase">Managers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-extrabold text-[#1c2826]">{countByRole.MANAGER}</span>
            <span className="text-[11px] text-[#788883] block">Approval & Requests</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('EMPLOYEE')}
          className={`cursor-pointer bg-white rounded-2xl border p-4 transition-all card-shadow ${activeTab === 'EMPLOYEE' ? 'border-[#1c372e] ring-2 ring-[#1c372e]/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase">Employees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-extrabold text-[#1c2826]">{countByRole.EMPLOYEE}</span>
            <span className="text-[11px] text-[#788883] block">Request Only Access</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('REVOKED')}
          className={`cursor-pointer bg-white rounded-2xl border p-4 transition-all card-shadow ${activeTab === 'REVOKED' ? 'border-rose-700 ring-2 ring-rose-700/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-700 uppercase">Deleted / Revoked</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-xs">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-extrabold text-[#1c2826]">{countByRole.REVOKED}</span>
            <span className="text-[11px] text-rose-600 font-semibold block">Revoked Credentials</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'ALL' ? 'bg-[#1c372e] text-white shadow' : 'bg-[#f0eee6] text-[#475752] hover:bg-[#e2decb]'}`}
          >
            Active Accounts ({activeUsersCount})
          </button>
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'ADMIN' ? 'bg-amber-700 text-white shadow' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'}`}
          >
            👑 Admins ({countByRole.ADMIN})
          </button>
          <button
            onClick={() => setActiveTab('OPERATIONAL_HEAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'OPERATIONAL_HEAD' ? 'bg-emerald-700 text-white shadow' : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'}`}
          >
            ⚡ Operational Heads ({countByRole.OPERATIONAL_HEAD})
          </button>
          <button
            onClick={() => setActiveTab('MANAGER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'MANAGER' ? 'bg-purple-700 text-white shadow' : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'}`}
          >
            👔 Managers ({countByRole.MANAGER})
          </button>
          <button
            onClick={() => setActiveTab('EMPLOYEE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'EMPLOYEE' ? 'bg-blue-700 text-white shadow' : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'}`}
          >
            👥 Employees ({countByRole.EMPLOYEE})
          </button>
          <button
            onClick={() => setActiveTab('REVOKED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'REVOKED' ? 'bg-rose-700 text-white shadow' : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'}`}
          >
            🔴 Deleted / Revoked ({countByRole.REVOKED})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#889993] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, department..."
            className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] pl-9 pr-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          />
        </div>
      </div>

      {/* Credentials User Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#eae7de] p-12 text-center text-xs text-[#788883]">
          Loading company credentials...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eae7de] p-12 text-center space-y-2">
          <Key className="w-8 h-8 text-[#889993] mx-auto opacity-50" />
          <h3 className="font-heading text-base font-bold text-[#1c2826]">
            {activeTab === 'REVOKED' ? 'No revoked or deleted credentials found' : 'No credentials found'}
          </h3>
          <p className="text-xs text-[#788883]">
            {searchQuery ? 'Try adjusting your search criteria.' : activeTab === 'REVOKED' ? 'Deleted user accounts and revoked access credentials will be listed under this category.' : 'Click "Add User Credential" above to generate credentials for this company.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map(user => {
            const isCopied = copiedId === user.id;
            const isRevoked = user.revoked || user.role === 'REVOKED';

            return (
              <div 
                key={user.id} 
                className={`bg-white rounded-2xl border card-shadow p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${isRevoked ? 'border-rose-200 bg-rose-50/20' : 'border-[#eae7de] hover:border-[#d8d2c6]'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl ${isRevoked ? 'bg-rose-700' : 'bg-[#1c372e]'} text-white flex items-center justify-center font-heading font-extrabold text-sm shadow shrink-0`}>
                        {user.initials || (user.name ? user.name.substring(0, 2).toUpperCase() : 'US')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-[#1c2826] text-sm leading-tight truncate">
                          {user.name}
                        </h3>
                        <span className="text-[11px] text-[#788883] font-medium flex items-center gap-1 mt-0.5 truncate">
                          <Briefcase className="w-3 h-3 text-[#1c372e] shrink-0" />
                          {user.department || 'Operations'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getRoleBadgeStyle(user)}`}>
                      {isRevoked ? 'Revoked Access' : user.role}
                    </span>
                  </div>

                  {/* Credentials Display Box */}
                  <div className="bg-[#fcfbf7] border border-[#f0eee6] rounded-xl p-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#788883] uppercase flex items-center gap-1 shrink-0">
                        <Mail className="w-3 h-3 text-[#1c372e]" /> Email
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[#1c2826] text-[11px] select-all truncate">
                          {user.email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(user.email, user.id)}
                          className="text-[#1c372e] hover:text-[#142a23] p-1 rounded hover:bg-[#e2decb] transition-colors shrink-0"
                          title="Copy Email"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isRevoked && (
                      <div className="pt-1 border-t border-rose-200 text-[10px] text-rose-800 font-semibold flex items-center gap-1">
                        <UserX className="w-3 h-3 text-rose-600" />
                        <span>Account deleted / login access revoked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f0eee6] mt-auto">
                  {isRevoked ? (
                    <>
                      <button
                        onClick={() => handleRestoreUser(user.id, user.email)}
                        className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-900 gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reactivate Access
                      </button>

                      <button
                        onClick={() => handlePermanentDeleteUser(user.id, user.email)}
                        className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-800 gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Purge Record
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setResetModalUser(user);
                          setCustomResetPassword('');
                        }}
                        className="inline-flex items-center text-xs font-bold text-[#1c372e] hover:text-[#142a23] gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#f0eee6] transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Password
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-800 gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke Access
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#eae7de] card-shadow w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1c372e] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#a3b8b0] uppercase">
                  Credential Generator
                </span>
                <h2 className="font-heading text-lg font-extrabold">
                  Create User Account Credential
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCredential} className="p-6 space-y-4">
              <label className="block text-xs font-bold text-[#475752] space-y-1">
                <span>Full Name *</span>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <label className="block text-xs font-bold text-[#475752] space-y-1">
                <span>Email Address *</span>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. rahul@company.com"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Role Category</span>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs font-bold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  >
                    {currentUser?.superAdmin && <option value="Admin">Admin</option>}
                    <option value="Operational Head">Operational Head</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </label>

                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Department</span>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold text-[#475752] space-y-1">
                <span>Default Password (Optional - Auto generated if left blank)</span>
                <input
                  type="text"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="e.g. rahul123"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#d8d2c6] bg-white text-xs font-bold text-[#475752] hover:bg-[#f0eee6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#1c372e] text-white text-xs font-bold shadow-md hover:bg-[#142a23] disabled:opacity-60"
                >
                  {isLoading ? 'Creating...' : 'Create Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#eae7de] card-shadow w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1c372e] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#a3b8b0] uppercase">
                  Password Reset
                </span>
                <h2 className="font-heading text-lg font-extrabold">
                  Reset User Password
                </h2>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#fcfbf7] border border-[#f0eee6] rounded-xl p-3 text-xs text-[#556661]">
                <p><span className="font-bold text-[#1c2826]">User:</span> {resetModalUser.name}</p>
                <p><span className="font-bold text-[#1c2826]">Email:</span> {resetModalUser.email}</p>
              </div>

              <label className="block text-xs font-bold text-[#475752] space-y-1">
                <span>New Password</span>
                <input
                  type="text"
                  value={customResetPassword}
                  onChange={(e) => setCustomResetPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#d8d2c6] bg-white text-xs font-bold text-[#475752] hover:bg-[#f0eee6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPasswordConfirm}
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-[#1c372e] text-white text-xs font-bold shadow-md hover:bg-[#142a23] disabled:opacity-60"
                >
                  {isLoading ? 'Resetting...' : 'Save New Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
