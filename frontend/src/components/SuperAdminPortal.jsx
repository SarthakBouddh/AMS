import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, ShieldCheck, Key, Trash2, Users, CheckCircle2, X, Edit, Pencil } from 'lucide-react';
import { api } from '../api';

export default function SuperAdminPortal() {
  const [companies, setCompanies] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompanyForCredentials, setSelectedCompanyForCredentials] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);

  // Add/Edit Company Form
  const [newCompany, setNewCompany] = useState({
    name: '',
    code: '',
    domain: '',
    subscriptionPlan: 'Enterprise',
    contactEmail: ''
  });

  // New Credential Form inside Manage Credentials Modal
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [newCredential, setNewCredential] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Company Admin',
    department: 'Management'
  });

  const loadCompanies = async () => {
    const data = await api.getCompanies(searchTerm);
    if (data !== null && Array.isArray(data)) {
      setCompanies(data);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [searchTerm]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    const created = await api.createCompany(newCompany);
    await loadCompanies();
    setNewCompany({ name: '', code: '', domain: '', subscriptionPlan: 'Enterprise', contactEmail: '' });
    setIsAddCompanyOpen(false);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;
    await api.updateCompany(editingCompany.id, editingCompany);
    await loadCompanies();
    setEditingCompany(null);
  };

  const handleDeleteCompany = async (companyId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this company tenant? All user credentials, employees, and assets for this company will be deleted, but historical audit data will be preserved.')) return;
    
    await api.deleteCompany(companyId);
    await loadCompanies();
  };

  const handleOpenCredentialsModal = async (company) => {
    setSelectedCompanyForCredentials(company);
    setIsAddingCredential(false);
    await loadCompanyUsers(company.id);
  };

  const loadCompanyUsers = async (companyId) => {
    const users = await api.getCompanyUsers(companyId);
    setCompanyUsers(users || []);
  };

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    if (!selectedCompanyForCredentials) return;

    await api.createCompanyUser(selectedCompanyForCredentials.id, newCredential);
    await loadCompanyUsers(selectedCompanyForCredentials.id);

    setNewCredential({ name: '', email: '', password: '', role: 'Company Admin', department: 'Management' });
    setIsAddingCredential(false);
  };

  const handleDeleteCredential = async (userId) => {
    if (!selectedCompanyForCredentials) return;
    if (!window.confirm('Are you sure you want to delete this user credential?')) return;
    await api.deleteCompanyUser(selectedCompanyForCredentials.id, userId);
    await loadCompanyUsers(selectedCompanyForCredentials.id);
  };

  const getPlanBadge = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  // Instant real-time company filtration fix
  const filteredCompanies = companies.filter(c => {
    const query = (searchTerm || '').toLowerCase().trim();
    if (!query) return true;
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.code && c.code.toLowerCase().includes(query)) ||
      (c.domain && c.domain.toLowerCase().includes(query)) ||
      (c.contactEmail && c.contactEmail.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Super Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-amber-800 uppercase px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200">
              SUPER ADMIN GOVERNANCE PORTAL
            </span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-2">
            Company Control & Credential Provisioning
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Create tenant companies and provision user access credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddCompanyOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Create Company</span>
        </button>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <div className="flex items-center justify-between text-[#788883] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Client Companies</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-[#1c2826]">{companies.length}</p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Active tenant accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <div className="flex items-center justify-between text-[#788883] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tenant Isolation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-emerald-800">Enforced</p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Independent databases & users</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <div className="flex items-center justify-between text-[#788883] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Governance Scope</span>
            <Key className="w-4 h-4 text-amber-700" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-[#1c2826]">Restricted</p>
          <p className="text-xs text-[#61716c] mt-1">Company Creation & Credential Provisioning</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company by name, code or domain..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] transition-all"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Bar */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
                    {company.code || 'TENANT'}
                  </span>
                  <h3 className="font-heading text-xl font-extrabold text-[#1c2826] mt-1">
                    {company.name}
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getPlanBadge(company.subscriptionPlan)}`}>
                  {company.subscriptionPlan || 'Enterprise'}
                </span>
              </div>

              {/* Info Details */}
              <div className="space-y-2 mt-4 text-xs text-[#52635e] font-mono">
                <div className="flex items-center justify-between py-1 border-b border-[#f0eee6]">
                  <span className="text-[#889993]">Domain:</span>
                  <span className="font-bold text-[#1c2826]">{company.domain}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#f0eee6]">
                  <span className="text-[#889993]">Contact Email:</span>
                  <span className="font-bold text-[#1c2826]">{company.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#f0eee6]">
                  <span className="text-[#889993]">Created:</span>
                  <span>{company.createdAt || '2024-01-10'}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#889993]">Status:</span>
                  <span className="inline-flex items-center font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {company.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-[#f0eee6] flex items-center space-x-2">
              <button
                onClick={() => handleOpenCredentialsModal(company)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] transition-colors"
              >
                <Key className="w-4 h-4 mr-2 text-[#f4c453]" />
                <span>Manage Credentials</span>
              </button>

              <button
                onClick={() => setEditingCompany(company)}
                title="Edit Company Details"
                className="p-2.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleDeleteCompany(company.id, e)}
                title="Delete Company Tenant"
                className="p-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Edit Company */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#1c372e]" />
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Edit Tenant Company</h3>
              </div>
              <button onClick={() => setEditingCompany(null)} className="p-1 rounded-lg text-[#788883] hover:bg-[#f0eee6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Company Name *</label>
                <input
                  type="text"
                  value={editingCompany.name || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Company Code *</label>
                  <input
                    type="text"
                    value={editingCompany.code || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono uppercase text-[#1c2826]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Domain</label>
                  <input
                    type="text"
                    value={editingCompany.domain || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, domain: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Subscription Plan</label>
                  <select
                    value={editingCompany.subscriptionPlan || 'Enterprise'}
                    onChange={(e) => setEditingCompany({ ...editingCompany, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826]"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Pro">Pro</option>
                    <option value="Starter">Starter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editingCompany.contactEmail || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingCompany(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Company */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#1c372e]" />
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Create New Tenant Company</h3>
              </div>
              <button onClick={() => setIsAddCompanyOpen(false)} className="p-1 rounded-lg text-[#788883] hover:bg-[#f0eee6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="e.g. Cyberdyne Systems"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Company Code *</label>
                  <input
                    type="text"
                    value={newCompany.code}
                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value.toUpperCase() })}
                    placeholder="CYBER"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono uppercase text-[#1c2826]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Domain</label>
                  <input
                    type="text"
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    placeholder="cyberdyne.io"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Subscription Plan</label>
                  <select
                    value={newCompany.subscriptionPlan}
                    onChange={(e) => setNewCompany({ ...newCompany, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826]"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Pro">Pro</option>
                    <option value="Starter">Starter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newCompany.contactEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, contactEmail: e.target.value })}
                    placeholder="admin@cyberdyne.io"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddCompanyOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Create Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Manage Credentials for Company */}
      {selectedCompanyForCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase">COMPANY CREDENTIAL MANAGER</span>
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                  {selectedCompanyForCredentials.name} Credentials
                </h3>
              </div>
              <button onClick={() => setSelectedCompanyForCredentials(null)} className="p-1 rounded-lg text-[#788883] hover:bg-[#f0eee6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!isAddingCredential ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-[#62736e]">User Login Accounts for {selectedCompanyForCredentials.name}</p>
                    <button
                      onClick={() => setIsAddingCredential(true)}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-[#f4c453]" />
                      <span>Create New Credential</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#eae7de] border border-[#eae7de] rounded-xl overflow-hidden bg-white">
                    {companyUsers.map((usr, i) => (
                      <div key={usr.id || i} className="p-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#1c2826]">{usr.name}</p>
                          <p className="text-xs font-mono text-[#61716c]">{usr.email}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {usr.role || 'Company Admin'}
                            </span>
                            <p className="text-[11px] font-mono text-gray-500 mt-1">Pass: {usr.password || 'admin123'}</p>
                          </div>
                          {!usr.superAdmin && (
                            <button
                              onClick={() => handleDeleteCredential(usr.id)}
                              title="Delete Credential"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Form: Create Credential */
                <form onSubmit={handleCreateCredential} className="space-y-3">
                  <h4 className="font-heading text-sm font-bold text-[#1c2826] border-b pb-2">
                    Create New Credential for {selectedCompanyForCredentials.name}
                  </h4>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">User Full Name *</label>
                    <input
                      type="text"
                      value={newCredential.name}
                      onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={newCredential.email}
                      onChange={(e) => setNewCredential({ ...newCredential, email: e.target.value })}
                      placeholder={`alex@${selectedCompanyForCredentials.domain || 'company.com'}`}
                      className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Password *</label>
                      <input
                        type="text"
                        value={newCredential.password}
                        onChange={(e) => setNewCredential({ ...newCredential, password: e.target.value })}
                        placeholder="Secret123"
                        className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Role</label>
                      <select
                        value={newCredential.role}
                        onChange={(e) => setNewCredential({ ...newCredential, role: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                      >
                        <option value="Company Admin">Company Admin</option>
                        <option value="Operations Lead">Operations Lead</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#eae7de] flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsAddingCredential(false)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Save Credential</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
