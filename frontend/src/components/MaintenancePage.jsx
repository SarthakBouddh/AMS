import React, { useState, useEffect, useRef } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Search, DollarSign, UserCheck, X, Laptop, Box, Tag, Building, Video, Phone, Mail, User, MapPin } from 'lucide-react';
import { api } from '../api';

export default function MaintenancePage({ currentUser, companyId }) {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [resources, setResources] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    assetId: '',
    assetName: '',
    vendorId: '',
    vendorName: '',
    vendorPhone: '',
    vendorContactPerson: '',
    vendorEmail: '',
    vendorAddress: '',
    problemDescription: '',
    priority: 'HIGH'
  });

  // Auto-suggestion state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const loadData = async () => {
    // Load tickets from API
    const fetchedTickets = await api.getMaintenanceTickets('', '', '', companyId);
    setTickets(fetchedTickets || []);

    // Load assets for suggestions
    const fetchedAssets = await api.getAssets('', 'All', 'All', companyId);
    setAssets(fetchedAssets || []);

    // Load shared resources for suggestions
    const fetchedResources = await api.getResources('ALL', '', companyId);
    setResources(fetchedResources || []);

    // Load vendors
    const fetchedVendors = await api.getVendors('', '', companyId);
    setVendors(fetchedVendors || []);
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Click outside to close auto-suggestion list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewTicket(prev => ({ ...prev, assetName: value, assetId: '' }));

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = value.toLowerCase().trim();

    // Search matching assets
    const matchedAssets = assets.filter(a =>
      (a.name && a.name.toLowerCase().includes(query)) ||
      (a.assetTag && a.assetTag.toLowerCase().includes(query)) ||
      (a.category && a.category.toLowerCase().includes(query))
    ).map(a => ({
      id: a.id,
      name: a.name,
      subtext: `Tag: ${a.assetTag || 'N/A'} · ${a.category || 'Hardware'}`,
      type: 'ASSET',
      rawAsset: a
    }));

    // Search matching resources
    const matchedResources = resources.filter(r =>
      (r.name && r.name.toLowerCase().includes(query)) ||
      (r.type && r.type.toLowerCase().includes(query)) ||
      (r.specifications && r.specifications.toLowerCase().includes(query))
    ).map(r => ({
      id: r.id,
      name: r.name,
      subtext: `Shared Resource · ${r.specifications || r.type}`,
      type: 'RESOURCE',
      rawResource: r
    }));

    const combined = [...matchedAssets, ...matchedResources].slice(0, 7);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
  };

  const handleSelectSuggestion = (item) => {
    let matchedVendor = null;
    
    if (item.type === 'ASSET' && item.rawAsset) {
      const ast = item.rawAsset;
      if (ast.vendorId) {
        matchedVendor = vendors.find(v => v.id === ast.vendorId);
      } else if (ast.vendorName) {
        matchedVendor = vendors.find(v => v.name.toLowerCase() === ast.vendorName.toLowerCase());
      }
    }

    setNewTicket(prev => ({
      ...prev,
      assetName: item.name,
      assetId: item.id,
      vendorId: matchedVendor ? matchedVendor.id : (item.rawAsset?.vendorId || prev.vendorId),
      vendorName: matchedVendor ? matchedVendor.name : (item.rawAsset?.vendorName || prev.vendorName),
      vendorPhone: matchedVendor ? matchedVendor.phone : prev.vendorPhone,
      vendorContactPerson: matchedVendor ? matchedVendor.contactPerson : prev.vendorContactPerson,
      vendorEmail: matchedVendor ? matchedVendor.email : prev.vendorEmail,
      vendorAddress: matchedVendor ? matchedVendor.address : prev.vendorAddress
    }));
    setShowSuggestions(false);
  };

  const handleVendorSelect = (vendorId) => {
    if (!vendorId) {
      setNewTicket(prev => ({
        ...prev,
        vendorId: '',
        vendorName: '',
        vendorPhone: '',
        vendorContactPerson: '',
        vendorEmail: '',
        vendorAddress: ''
      }));
      return;
    }
    const v = vendors.find(item => item.id === vendorId);
    if (v) {
      setNewTicket(prev => ({
        ...prev,
        vendorId: v.id,
        vendorName: v.name,
        vendorPhone: v.phone || '',
        vendorContactPerson: v.contactPerson || '',
        vendorEmail: v.email || '',
        vendorAddress: v.address || ''
      }));
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleResolveTicket = async (id) => {
    await api.resolveMaintenanceTicket(id, {}, currentUser?.name || 'Admin');
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.assetName.trim()) return;

    const payload = {
      assetId: newTicket.assetId || 'ast-custom',
      assetName: newTicket.assetName,
      vendorId: newTicket.vendorId,
      vendorName: newTicket.vendorName,
      vendorPhone: newTicket.vendorPhone,
      vendorContactPerson: newTicket.vendorContactPerson,
      vendorEmail: newTicket.vendorEmail,
      vendorAddress: newTicket.vendorAddress,
      reportedBy: currentUser?.name || 'Mara Singh',
      problemDescription: newTicket.problemDescription,
      priority: newTicket.priority,
      status: 'OPEN',
      technicianAssigned: newTicket.vendorName ? `${newTicket.vendorName} Support` : 'IT Support Helpdesk',
      repairCost: 0.00,
      resolutionNotes: 'Maintenance ticket created.'
    };

    const res = await api.createMaintenanceTicket(payload, currentUser?.name || 'Admin', companyId);

    const created = res || {
      id: 'tkt-' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTickets([created, ...tickets]);
    setIsAddModalOpen(false);
    setNewTicket({
      assetId: '',
      assetName: '',
      vendorId: '',
      vendorName: '',
      vendorPhone: '',
      vendorContactPerson: '',
      vendorEmail: '',
      vendorAddress: '',
      problemDescription: '',
      priority: 'HIGH'
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            HELPDESK & REPAIR TRACKER
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Maintenance & Vendor Repair Reports
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Log equipment issues, view vendor repair contact numbers, and assign support technicians.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#eae7de] card-shadow space-y-3">
            <Wrench className="w-12 h-12 text-[#a3b2ac] mx-auto" />
            <h3 className="font-heading text-lg font-bold text-[#1c2826]">No Active Maintenance Tickets</h3>
            <p className="text-xs text-[#61716c] max-w-md mx-auto">
              When equipment breaks or requires repair, log a report here to automatically fetch vendor phone numbers and track technician SLA.
            </p>
          </div>
        ) : (
          tickets.map((tkt) => {
            // Find vendor phone if missing in ticket object
            const vMatch = vendors.find(v => (tkt.vendorId && v.id === tkt.vendorId) || (tkt.vendorName && v.name.toLowerCase() === tkt.vendorName.toLowerCase()));
            const displayVendorPhone = tkt.vendorPhone || vMatch?.phone;
            const displayVendorContact = tkt.vendorContactPerson || vMatch?.contactPerson;
            const displayVendorName = tkt.vendorName || vMatch?.name;
            const displayVendorEmail = tkt.vendorEmail || vMatch?.email;

            return (
              <div key={tkt.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadge(tkt.priority)}`}>
                        {tkt.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-[#889993]">TICKET ID: {tkt.id}</span>
                      {tkt.createdAt && <span className="text-xs font-mono text-[#889993]">· {tkt.createdAt}</span>}
                    </div>

                    <h3 className="font-heading text-xl font-extrabold text-[#1c2826]">
                      {tkt.assetName}
                    </h3>

                    <p className="text-xs font-semibold text-[#c2410c] bg-[#ffedd5] p-3 rounded-xl border border-[#fed7aa]">
                      "{tkt.problemDescription}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#556661] pt-1">
                      <span>Reporter: <strong className="text-[#1c2826]">{tkt.reportedBy || 'Staff'}</strong></span>
                      <span>Technician: <strong className="text-[#1c372e]">{tkt.technicianAssigned || 'IT Helpdesk'}</strong></span>
                      <span>Repair Cost: <strong className="text-emerald-800">${tkt.repairCost || 0}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {tkt.status}
                    </span>

                    {tkt.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveTicket(tkt.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Prominent Vendor Contact Box on Report */}
                {(displayVendorName || displayVendorPhone) && (
                  <div className="bg-[#f7f9f8] p-4 rounded-xl border border-[#d2e3dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1c372e] text-[#f4c453] flex items-center justify-center font-bold shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#1c2826] text-sm">{displayVendorName || 'Vendor Support'}</span>
                          {displayVendorContact && (
                            <span className="text-[11px] text-[#61716c] font-medium">({displayVendorContact})</span>
                          )}
                        </div>
                        {displayVendorEmail && (
                          <p className="text-[11px] text-[#61716c] font-mono mt-0.5">{displayVendorEmail}</p>
                        )}
                      </div>
                    </div>

                    {displayVendorPhone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-[#788883] uppercase">VENDOR REPAIR HOTLINE:</span>
                        <a
                          href={`tel:${displayVendorPhone}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono font-extrabold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-white" />
                          <span>{displayVendorPhone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Report Ticket */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Log Maintenance Issue Report</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Asset / Model / Resource Auto-Suggestion Field */}
              <div className="relative" ref={suggestionRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                  Asset / Model / Resource Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newTicket.assetName}
                    onChange={handleInputChange}
                    onFocus={handleInputChange}
                    placeholder="Type model or asset name (e.g. Dell, MacBook, Room Alpha)..."
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d8d4c7] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-[#f0eee6]">
                      <div className="px-3 py-1.5 bg-[#faf9f4] text-[10px] font-mono font-bold text-[#788883] uppercase flex justify-between">
                        <span>Matching Suggestions</span>
                        <span>{suggestions.length} Found</span>
                      </div>
                      {suggestions.map((item) => (
                        <div
                          key={item.id + item.name}
                          onClick={() => handleSelectSuggestion(item)}
                          className="p-2.5 hover:bg-[#f4f2ea] cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="p-1.5 rounded-lg bg-[#eae7de] text-[#1c372e]">
                              {item.type === 'RESOURCE' ? <Building className="w-4 h-4 text-emerald-800" /> : <Laptop className="w-4 h-4 text-amber-800" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1c2826]">{item.name}</p>
                              <p className="text-[11px] font-mono text-[#61716c]">{item.subtext}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#1c372e] uppercase px-2 py-0.5 rounded bg-[#e3efe9]">
                            {item.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Selection & Phone Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                  Vendor / Repair Supplier
                </label>
                <select
                  value={newTicket.vendorId || ''}
                  onChange={(e) => handleVendorSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                >
                  <option value="">-- Select Vendor / Supplier --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category || 'General'}) {v.phone ? `· Phone: ${v.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Vendor Phone & Info Preview Box */}
              {(newTicket.vendorName || newTicket.vendorPhone) && (
                <div className="bg-[#e3efe9] p-3 rounded-xl border border-[#c3d9cf] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1c372e]">{newTicket.vendorName || 'Selected Vendor'}</span>
                    {newTicket.vendorPhone && (
                      <span className="font-mono font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        📞 {newTicket.vendorPhone}
                      </span>
                    )}
                  </div>
                  {newTicket.vendorContactPerson && (
                    <p className="text-[11px] text-[#475752]">Contact Person: {newTicket.vendorContactPerson}</p>
                  )}
                  {newTicket.vendorEmail && (
                    <p className="text-[11px] text-[#475752] font-mono">{newTicket.vendorEmail}</p>
                  )}
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent SLA</option>
                </select>
              </div>

              {/* Issue Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                  Problem Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={newTicket.problemDescription}
                  onChange={(e) => setNewTicket({ ...newTicket, problemDescription: e.target.value })}
                  placeholder="Describe the defect, damage, error message or service needed..."
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#eae7de] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#62736e] bg-[#eae7de] hover:bg-[#e2ded2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#1c372e] bg-[#f4c453] hover:bg-[#e5b642] shadow-sm"
                >
                  Submit Report & Notify Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
