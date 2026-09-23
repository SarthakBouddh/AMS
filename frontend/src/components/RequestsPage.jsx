import React, { useState, useMemo, useEffect } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Filter,
  AlertCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  NotebookText,
  Sparkles,
} from 'lucide-react';
import { api } from '../api';

const REQUEST_TYPES = ['ALL', 'NEW_ASSET', 'REPLACEMENT', 'TRANSFER', 'RESOURCE_BOOKING', 'MAINTENANCE', 'SOFTWARE_LICENSE'];
const REQUEST_CATEGORIES = ['Hardware', 'Software', 'Furniture', 'Accessories'];
const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'ALLOCATED', 'REJECTED'];
const PRIORITY_OPTIONS = ['ALL', 'Low', 'Medium', 'High', 'Critical'];
const ORIGIN_OPTIONS = ['ALL', 'EMPLOYEE', 'MANAGER', 'ADMIN_DIRECT'];

const emptyForm = {
  requestType: 'NEW_ASSET',
  requestCategory: 'Hardware',
  targetAssetId: '',
  targetAssetName: '',
  managerName: '',
  managerEmail: '',
  priority: 'Medium',
  quantity: '1',
  location: '',
  justification: '',
};

export default function RequestsPage({ currentUser, assets = [] }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [allocationModalRequest, setAllocationModalRequest] = useState(null);
  const [allocationForm, setAllocationForm] = useState({
    serialNo: '',
    assetTag: '',
    condition: 'NEW',
    allocationDate: new Date().toISOString().split('T')[0],
    adminNotes: '',
    targetAssetId: '',
    targetAssetName: '',
  });
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadRequests = async () => {
      setIsLoading(true);
      const fetched = await api.getRequests(currentUser.companyId || '', currentUser);
      setRequests(fetched || []);
      setIsLoading(false);
    };

    loadRequests();
  }, [currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, priorityFilter, pageSize]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const [companyManagers, setCompanyManagers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchManagers = async () => {
      try {
        const users = await api.getCompanyUsers(currentUser.companyId || '');
        if (users && users.length > 0) {
          const mgrs = users.filter(u => !u.revoked && u.role !== 'REVOKED');
          setCompanyManagers(mgrs);
        }
      } catch (e) {
        console.warn('Failed to load company managers:', e);
      }
    };
    fetchManagers();
  }, [currentUser]);

  const getRoleBucket = (role = '') => {
    const normalizedRole = (role || '').toLowerCase();
    if (normalizedRole.includes('super admin') || normalizedRole.includes('super_admin') || role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    if (normalizedRole === 'admin' || normalizedRole.includes('company admin') || normalizedRole.includes('system admin') || normalizedRole.includes('director')) return 'ADMIN';
    if (normalizedRole.includes('manager') || normalizedRole.includes('supervisor') || normalizedRole.includes('head') || normalizedRole.includes('lead') || normalizedRole.includes('operations')) return 'MANAGER';
    return 'EMPLOYEE';
  };

  const visibleRequests = useMemo(() => {
    if (!currentUser) return [];

    const normalizedUserRole = (currentUser.role || '').toLowerCase();
    if (normalizedUserRole.includes('super admin') || normalizedUserRole.includes('super_admin') || currentUser.role === 'SUPER_ADMIN' || currentUser.superAdmin) {
      return requests;
    }

    const roleBucket = getRoleBucket(currentUser.role || '');

    if (roleBucket === 'ADMIN') {
      return requests;
    }

    if (roleBucket === 'MANAGER') {
      const userEmail = (currentUser.email || '').toLowerCase().trim();
      const userName = (currentUser.name || '').toLowerCase().trim();
      const userId = currentUser.id;

      return requests.filter((request) => {
        const reqManagerEmail = (request.managerEmail || '').toLowerCase().trim();
        const reqManagerName = (request.managerName || '').toLowerCase().trim();
        const reqManagerId = request.managerId;

        const requestManagerMatch =
          (reqManagerEmail && reqManagerEmail === userEmail) ||
          (reqManagerName && reqManagerName === userName) ||
          (reqManagerId && reqManagerId === userId);

        const reqEmployeeName = (request.employeeName || '').toLowerCase().trim();
        const reqRequestedBy = (request.requestedBy || '').toLowerCase().trim();
        const reqEmployeeId = request.employeeId;

        const isCreator =
          (reqEmployeeName && reqEmployeeName === userName) ||
          (reqRequestedBy && reqRequestedBy === userEmail) ||
          (reqEmployeeId && reqEmployeeId === userId);

        return requestManagerMatch || isCreator;
      }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    // Standard Employee: ONLY see their own requests
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userName = (currentUser.name || '').toLowerCase().trim();
    const userId = currentUser.id;

    return requests.filter((request) => {
      const reqEmployeeName = (request.employeeName || '').toLowerCase().trim();
      const reqRequestedBy = (request.requestedBy || '').toLowerCase().trim();
      const reqEmployeeId = request.employeeId;

      return (
        (reqEmployeeName && reqEmployeeName === userName) ||
        (reqRequestedBy && reqRequestedBy === userEmail) ||
        (reqEmployeeId && reqEmployeeId === userId)
      );
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [currentUser, requests]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return visibleRequests.filter((request) => {
      const requestType = request.requestType || 'NEW_ASSET';
      const managerStatus = request.managerStatus || 'PENDING';
      const adminStatus = request.adminStatus || 'PENDING';
      const overallStatus = adminStatus === 'ALLOCATED' ? 'ALLOCATED' : managerStatus;
      const originCategory = request.originCategory || (request.requestedBy?.toLowerCase().includes('admin') ? 'ADMIN_DIRECT' : 'EMPLOYEE');

      const matchesSearch =
        !query ||
        (request.targetAssetName && request.targetAssetName.toLowerCase().includes(query)) ||
        (request.requestedBy && request.requestedBy.toLowerCase().includes(query)) ||
        (request.employeeName && request.employeeName.toLowerCase().includes(query)) ||
        (request.managerName && request.managerName.toLowerCase().includes(query)) ||
        (request.reasonNotes && request.reasonNotes.toLowerCase().includes(query));

      const matchesType = typeFilter === 'ALL' || requestType === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || overallStatus === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || (request.priority || 'Medium') === priorityFilter;
      const matchesOrigin = originFilter === 'ALL' || originCategory === originFilter;

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesOrigin;
    });
  }, [visibleRequests, searchTerm, typeFilter, statusFilter, priorityFilter, originFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const submitRequest = async (event) => {
    event.preventDefault();

    if (!currentUser) return;

    const trimmedAssetName = formData.targetAssetName?.trim();

    if (!trimmedAssetName) {
      setNotice({ type: 'error', message: 'Please enter the asset name or choose one from the inventory.' });
      return;
    }

    const payload = {
      ...formData,
      requestedBy: currentUser.email || currentUser.name,
      employeeName: currentUser.name,
      department: currentUser.department || 'Operations',
      companyId: currentUser.companyId,
      managerStatus: 'PENDING',
      adminStatus: 'PENDING',
      reasonNotes: formData.justification || formData.reasonNotes || '',
      justification: formData.justification || formData.reasonNotes || '',
      targetAssetName: trimmedAssetName,
      targetAssetId: formData.targetAssetId || '',
    };

    setIsLoading(true);
    const created = await api.createRequest(payload, currentUser, currentUser.companyId || '');
    setIsLoading(false);

    if (created) {
      setRequests((prev) => [created, ...prev]);
      setIsFormOpen(false);
      setFormData({
        ...emptyForm,
        managerName: currentUser.managerName || '',
        managerEmail: currentUser.managerEmail || '',
      });
    } else {
      setNotice({ type: 'error', message: 'Unable to submit the request right now. Please try again.' });
    }
  };

  const roleBucket = getRoleBucket(currentUser?.role || '');
  const canApproveRequests = roleBucket === 'MANAGER' || roleBucket === 'ADMIN' || roleBucket === 'SUPER_ADMIN';
  const canRejectRequests = canApproveRequests;
  const canAllocateAssets = roleBucket === 'ADMIN' || roleBucket === 'SUPER_ADMIN';

  const handleManagerApprove = async (requestId) => {
    if (!canApproveRequests) return;
    const updated = await api.approveManager(requestId, currentUser);
    if (updated && !updated.error) {
      setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, ...updated } : request));
      setNotice({ type: 'success', message: 'Request approved successfully.' });
      return;
    }
    if (updated?.error) setNotice({ type: 'error', message: updated.message || 'Approval failed.' });
  };

  const handleManagerReject = async (requestId) => {
    if (!canRejectRequests) return;
    const updated = await api.rejectManager(requestId, currentUser);
    if (updated && !updated.error) {
      setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, ...updated } : request));
      setNotice({ type: 'success', message: 'Request rejected successfully.' });
      return;
    }
    if (updated?.error) setNotice({ type: 'error', message: updated.message || 'Rejection failed.' });
  };

  const openAllocationModal = (request) => {
    setAllocationModalRequest(request);
    setAllocationForm({
      serialNo: request.serialNo || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      assetTag: request.assetTag || `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
      condition: request.condition || 'NEW',
      allocationDate: request.allocationDate || new Date().toISOString().split('T')[0],
      adminNotes: request.adminNotes || '',
      targetAssetId: request.targetAssetId || '',
      targetAssetName: request.targetAssetName || '',
    });
  };

  const handleAdminAllocateConfirm = async () => {
    if (!canAllocateAssets || !allocationModalRequest) return;
    setIsLoading(true);
    const updated = await api.allocateAdmin(allocationModalRequest.id, currentUser, allocationForm);
    setIsLoading(false);
    if (updated && !updated.error) {
      setRequests((prev) => prev.map((req) => req.id === allocationModalRequest.id ? { ...req, ...updated } : req));
      setNotice({
        type: 'success',
        message: `Asset "${allocationForm.targetAssetName || allocationModalRequest.targetAssetName}" allocated to ${allocationModalRequest.employeeName || allocationModalRequest.requestedBy}!`,
      });
      setAllocationModalRequest(null);
    } else {
      setNotice({ type: 'error', message: updated?.message || 'Allocation failed.' });
    }
  };

  const handleAssetSelection = (assetId) => {
    const selectedAsset = assets.find((asset) => asset.id === assetId);
    setFormData((prev) => ({
      ...prev,
      targetAssetId: assetId,
      targetAssetName: selectedAsset?.name || prev.targetAssetName,
      requestCategory: selectedAsset?.category || prev.requestCategory,
      location: selectedAsset?.location || prev.location,
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'ALLOCATED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getOverallStatus = (request) => {
    if (request.adminStatus === 'ALLOCATED') return 'ALLOCATED';
    if (request.managerStatus === 'APPROVED') return 'APPROVED';
    if (request.managerStatus === 'REJECTED' || request.adminStatus === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            WORKFLOW PIPELINE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Request & Approval Management
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Employees can submit detailed asset requests, managers review them, and admins allocate inventory.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          {isFormOpen ? 'Close form' : 'New request'}
        </button>
      </div>

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="bg-[#1c372e] p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <GitPullRequest className="w-8 h-8 text-[#f4c453]" />
          <div>
            <h3 className="font-heading text-lg font-extrabold">Multi-stage request workflow is active</h3>
            <p className="text-xs text-[#b0c4bd]">From employee request to manager approval to final allocation.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-[#2b4c41] text-[#f4c453]">1. Request</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#889993]" />
          <span className="px-3 py-1 rounded-xl bg-[#2b4c41] text-[#f4c453]">2. Manager</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#889993]" />
          <span className="px-3 py-1 rounded-xl bg-[#2b4c41] text-[#f4c453]">3. Admin Allocation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4">
          <p className="text-[10px] font-mono font-bold uppercase text-[#788883]">Total requests</p>
          <p className="font-heading text-2xl font-extrabold mt-2">{visibleRequests.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4">
          <p className="text-[10px] font-mono font-bold uppercase text-[#788883]">Pending manager review</p>
          <p className="font-heading text-2xl font-extrabold mt-2">{visibleRequests.filter((r) => (r.managerStatus || 'PENDING') === 'PENDING').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4">
          <p className="text-[10px] font-mono font-bold uppercase text-[#788883]">Approved by manager</p>
          <p className="font-heading text-2xl font-extrabold mt-2">{visibleRequests.filter((r) => (r.managerStatus || 'PENDING') === 'APPROVED').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4">
          <p className="text-[10px] font-mono font-bold uppercase text-[#788883]">Allocated</p>
          <p className="font-heading text-2xl font-extrabold mt-2">{visibleRequests.filter((r) => (r.adminStatus || 'PENDING') === 'ALLOCATED').length}</p>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <NotebookText className="w-5 h-5 text-[#1c372e]" />
            <h2 className="font-heading text-xl font-extrabold text-[#1c2826]">
              {formData.requestCategory === 'Software' ? 'Request Software Licenses' : 'Request New Asset / Hardware'}
            </h2>
          </div>

          <form onSubmit={submitRequest} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">Category *</span>
                <select
                  value={formData.requestCategory}
                  onChange={(e) => setFormData({
                    ...formData,
                    requestCategory: e.target.value,
                    requestType: e.target.value === 'Software' ? 'SOFTWARE_LICENSE' : 'NEW_ASSET'
                  })}
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                >
                  <option value="Hardware">Hardware (Laptop, Monitor, Devices)</option>
                  <option value="Software">Software (Apps & Software Licenses)</option>
                  <option value="Furniture">Furniture & Office Setup</option>
                  <option value="Accessories">Accessories & Peripherals</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">Priority</span>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                >
                  {PRIORITY_OPTIONS.filter((priority) => priority !== 'ALL').map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">
                  {formData.requestCategory === 'Software'
                    ? 'Mention All Softwares Needed *'
                    : 'Required Asset / Item Name *'}
                </span>
                <textarea
                  rows={formData.requestCategory === 'Software' ? 3 : 2}
                  required
                  value={formData.targetAssetName}
                  onChange={(e) => setFormData({ ...formData, targetAssetName: e.target.value })}
                  placeholder={
                    formData.requestCategory === 'Software'
                      ? 'List all required softwares (e.g. IntelliJ IDEA Ultimate, Slack Pro, Figma, Docker Pro, PyCharm)'
                      : 'Enter required asset name (e.g. MacBook Pro 16-inch M3, 32GB RAM, 4K Monitor)'
                  }
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm font-medium text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              {companyManagers.length > 0 && (
                <div className="md:col-span-2 space-y-1.5 bg-[#f5f3ec] p-3 rounded-xl border border-[#e2ded2]">
                  <span className="text-xs font-bold text-[#1c372e] uppercase tracking-wider block">
                    ⚡ Select Manager / Approval Lead from Directory
                  </span>
                  <select
                    value={formData.managerEmail || ''}
                    onChange={(e) => {
                      const selectedEmail = e.target.value;
                      const selected = companyManagers.find(m => m.email === selectedEmail);
                      if (selected) {
                        setFormData({
                          ...formData,
                          managerName: selected.name,
                          managerEmail: selected.email,
                          managerId: selected.id
                        });
                      } else {
                        setFormData({ ...formData, managerEmail: selectedEmail });
                      }
                    }}
                    className="w-full rounded-xl border border-[#d8d2c6] bg-white px-3 py-2 text-xs font-bold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  >
                    <option value="">-- Choose Manager from Company Directory --</option>
                    {companyManagers.map(m => (
                      <option key={m.id} value={m.email}>
                        {m.name} ({m.role || 'Manager'}) - {m.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">Manager Name *</span>
                <input
                  type="text"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="e.g. Mara Singh"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">Manager Email *</span>
                <input
                  type="email"
                  required
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  placeholder="manager@quantwork.com"
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold text-[#475752] uppercase tracking-wider">Justification / Notes</span>
                <textarea
                  rows="2"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Describe why this asset or software package is required for your project."
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2.5 text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#d8d2c6] bg-white text-sm font-bold text-[#475752] hover:bg-[#f0eee6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] disabled:opacity-60"
              >
                {isLoading ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests, employees, managers, or asset names..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center space-x-1 text-xs font-semibold text-[#667772]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              {REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>{type === 'ALL' ? 'All request types' : type.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'All statuses' : status}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>{priority === 'ALL' ? 'All priorities' : priority}</option>
              ))}
            </select>

            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              <option value="ALL">All Request Categories</option>
              <option value="EMPLOYEE">Employee Requests</option>
              <option value="MANAGER">Manager Requests</option>
              <option value="ADMIN_DIRECT">Admin Direct Allocations</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-10 text-center text-sm text-[#61716c]">
            Loading requests...
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-10 text-center text-sm text-[#61716c]">
            No requests match the current filters.
          </div>
        ) : (
          paginatedRequests.map((request) => {
            const overallStatus = getOverallStatus(request);

            return (
              <div
                key={request.id}
                className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow hover:shadow-md transition-all"
              >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
                        {request.requestType || 'NEW_ASSET'}
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
                        {request.requestCategory || 'Hardware'}
                      </span>
                      {request.originCategory === 'ADMIN_DIRECT' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Admin Direct
                        </span>
                      ) : request.originCategory === 'MANAGER' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          Manager Request
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Employee Request
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(request.priority || 'Medium')}`}>
                        {request.priority || 'Medium'} priority
                      </span>
                      <span className="text-xs font-mono text-[#889993]">{request.createdAt}</span>
                    </div>

                    <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                      {request.targetAssetName}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#556661]">
                      <p>
                        <span className="font-bold text-[#1c2826]">Employee:</span> {request.employeeName || request.requestedBy}
                      </p>
                      <p>
                        <span className="font-bold text-[#1c2826]">Department:</span> {request.department || 'Operations'}
                      </p>
                      <p>
                        <span className="font-bold text-[#1c2826]">Location:</span> {request.location || 'N/A'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#556661]">
                      <p>
                        <span className="font-bold text-[#1c2826]">Manager:</span> {request.managerName || 'Not specified'}
                      </p>
                      <p>
                        <span className="font-bold text-[#1c2826]">Requested by:</span> {request.requestedBy || request.employeeName}
                      </p>
                    </div>

                    <div className="bg-[#fcfbf7] border border-[#f0eee6] rounded-xl p-3 text-xs text-[#556661] italic">
                      “{request.justification || request.reasonNotes || 'No justification provided yet.'}”
                    </div>

                    {(request.adminStatus === 'ALLOCATED' || request.assetTag || request.serialNo) && (
                      <div className="bg-[#f0f9f6] border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Allocated Asset Details
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900">
                            {request.condition || 'NEW'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          <div><span className="text-emerald-700 font-sans font-bold">Tag ID:</span> {request.assetTag || 'TAG-PENDING'}</div>
                          <div><span className="text-emerald-700 font-sans font-bold">Serial No:</span> {request.serialNo || 'SN-PENDING'}</div>
                        </div>
                        {request.adminNotes && (
                          <p className="text-[11px] font-sans text-emerald-800 italic pt-1 border-t border-emerald-200/60">
                            Notes: {request.adminNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:min-w-[260px]">
                    <div className="flex flex-col items-start sm:items-center xl:items-start gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#1c372e]" />
                        <span className="text-[10px] font-mono font-bold text-[#788883] uppercase">Manager status</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(request.managerStatus || 'PENDING')}`}>
                        {request.managerStatus === 'APPROVED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        ) : request.managerStatus === 'REJECTED' ? (
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 mr-1" />
                        )}
                        {request.managerStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="flex flex-col items-start sm:items-center xl:items-start gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1c372e]" />
                        <span className="text-[10px] font-mono font-bold text-[#788883] uppercase">Admin allocation</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(request.adminStatus || 'PENDING')}`}>
                        {request.adminStatus === 'ALLOCATED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        ) : request.adminStatus === 'REJECTED' ? (
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 mr-1" />
                        )}
                        {request.adminStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col gap-2 pt-1">
                      {canApproveRequests && (
                        request.managerStatus !== 'APPROVED' && request.managerStatus !== 'REJECTED' ? (
                          <>
                            <button
                              onClick={() => handleManagerApprove(request.id)}
                              className="px-3 py-2 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow transition-all"
                            >
                              Approve request
                            </button>
                            <button
                              onClick={() => handleManagerReject(request.id)}
                              className="px-3 py-2 rounded-xl border border-[#d8d2c6] bg-white text-[#1c2826] text-xs font-bold hover:bg-[#f7f4ee] shadow transition-all"
                            >
                              Reject request
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                          >
                            {request.managerStatus === 'REJECTED' ? 'Request rejected' : 'Manager approved'}
                          </button>
                        )
                      )}

                      {canAllocateAssets && (
                        request.adminStatus !== 'ALLOCATED' ? (
                          <button
                            onClick={() => openAllocationModal(request)}
                            disabled={request.managerStatus !== 'APPROVED' && request.originCategory !== 'ADMIN_DIRECT'}
                            className="px-3 py-2 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow disabled:opacity-50"
                          >
                            Allocate asset
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                          >
                            Asset allocated
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredRequests.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#61716c]">
            Showing <span className="font-bold text-[#1c2826]">{(currentPage - 1) * pageSize + 1}</span> -{' '}
            <span className="font-bold text-[#1c2826]">{Math.min(currentPage * pageSize, filteredRequests.length)}</span> of{' '}
            <span className="font-bold text-[#1c2826]">{filteredRequests.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 rounded-xl border border-[#d8d2c6] bg-white text-xs font-bold text-[#475752] disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </button>
            <span className="text-xs font-bold text-[#475752]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center px-3 py-2 rounded-xl border border-[#d8d2c6] bg-white text-xs font-bold text-[#475752] disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Allocation Modal Dialog */}
      {allocationModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#eae7de] card-shadow w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1c372e] p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#a3b8b0] uppercase">
                  Admin Asset Allocation
                </span>
                <h2 className="font-heading text-xl font-extrabold">
                  Assign Asset & Generate Details
                </h2>
              </div>
              <button
                onClick={() => setAllocationModalRequest(null)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#fcfbf7] border border-[#f0eee6] rounded-2xl p-4 space-y-1 text-xs text-[#556661]">
                <p><span className="font-bold text-[#1c2826]">Assignee:</span> {allocationModalRequest.employeeName || allocationModalRequest.requestedBy}</p>
                <p><span className="font-bold text-[#1c2826]">Requested Item:</span> {allocationModalRequest.targetAssetName}</p>
                <p><span className="font-bold text-[#1c2826]">Category / Type:</span> {allocationModalRequest.requestCategory || 'Hardware'} ({allocationModalRequest.requestType})</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Target Asset Name</span>
                  <input
                    type="text"
                    value={allocationForm.targetAssetName}
                    onChange={(e) => setAllocationForm({ ...allocationForm, targetAssetName: e.target.value })}
                    placeholder="e.g. MacBook Pro 16 M3 Max"
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  />
                </label>

                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Inventory Tag ID</span>
                  <input
                    type="text"
                    value={allocationForm.assetTag}
                    onChange={(e) => setAllocationForm({ ...allocationForm, assetTag: e.target.value })}
                    placeholder="e.g. TAG-2026-8891"
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Serial Number</span>
                  <input
                    type="text"
                    value={allocationForm.serialNo}
                    onChange={(e) => setAllocationForm({ ...allocationForm, serialNo: e.target.value })}
                    placeholder="e.g. C02G7819MD6R"
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  />
                </label>

                <label className="block text-xs font-bold text-[#475752] space-y-1">
                  <span>Asset Condition</span>
                  <select
                    value={allocationForm.condition}
                    onChange={(e) => setAllocationForm({ ...allocationForm, condition: e.target.value })}
                    className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                  >
                    <option value="NEW">NEW - Unopened / Brand New</option>
                    <option value="EXCELLENT">EXCELLENT - Like New</option>
                    <option value="GOOD">GOOD - Minor Wear</option>
                    <option value="REFURBISHED">REFURBISHED - Checked</option>
                  </select>
                </label>
              </div>

              <label className="block text-xs font-bold text-[#475752] space-y-1">
                <span>Allocation Notes / Key Credentials / License</span>
                <textarea
                  rows={3}
                  value={allocationForm.adminNotes}
                  onChange={(e) => setAllocationForm({ ...allocationForm, adminNotes: e.target.value })}
                  placeholder="Enter software keys, setup details, or custom allocation notes..."
                  className="w-full rounded-xl border border-[#d8d2c6] bg-[#fcfbf7] px-3 py-2 text-xs text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocationModalRequest(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#d8d2c6] bg-white text-xs font-bold text-[#475752] hover:bg-[#f0eee6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminAllocateConfirm}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold shadow-md hover:bg-[#142a23] disabled:opacity-60"
                >
                  {isLoading ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
