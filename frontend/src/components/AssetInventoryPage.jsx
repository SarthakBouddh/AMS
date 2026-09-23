import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Laptop, Armchair, Monitor, ShieldCheck, UserPlus, Trash2, Edit3, ArrowRightLeft, History, Upload, RotateCcw, PackageCheck } from 'lucide-react';
import { api } from '../api';

export default function AssetInventoryPage({
  assets,
  employees,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onAddAssetClick,
  onEditAssetClick,
  onAssignAssetClick,
  onCollectAssetClick,
  onDeleteAssetClick,
  onBulkUploadClick
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [assetAuditLogs, setAssetAuditLogs] = useState([]);

  const safeAssets = Array.isArray(assets) ? assets : [];

  const filteredAssets = safeAssets.filter(asset => {
    const query = (searchTerm || '').toLowerCase().trim();
    const matchesSearch = !query ||
      (asset.name && asset.name.toLowerCase().includes(query)) ||
      (asset.assetTag && asset.assetTag.toLowerCase().includes(query)) ||
      (asset.location && asset.location.toLowerCase().includes(query)) ||
      (asset.ownerName && asset.ownerName.toLowerCase().includes(query)) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(query));

    const matchesStatus = !statusFilter || statusFilter === 'All' ||
      (asset.status && asset.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesCategory = !categoryFilter || categoryFilter === 'All' ||
      (asset.category && asset.category.toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const selectedAsset = filteredAssets.find((asset) => asset.id === selectedAssetId) || null;

  useEffect(() => {
    if (!selectedAssetId) {
      setAssetAuditLogs([]);
      return;
    }

    const loadAuditLogs = async () => {
      const logs = await api.getAssetAuditLogs(selectedAssetId);
      setAssetAuditLogs(logs || []);
    };

    loadAuditLogs();
  }, [selectedAssetId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'available':
        return 'bg-[#ccfbf1] text-[#0f766e] border-[#99f6e4]';
      case 'maintenance':
        return 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getConditionColor = (cond) => {
    switch (cond?.toLowerCase()) {
      case 'excellent':
        return 'text-emerald-700 font-bold';
      case 'good':
        return 'text-green-600 font-bold';
      case 'fair':
        return 'text-amber-700 font-bold';
      case 'poor':
        return 'text-rose-700 font-bold';
      default:
        return 'text-slate-600 font-medium';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'furniture':
        return <Armchair className="w-4 h-4 text-amber-700" />;
      case 'software':
        return <ShieldCheck className="w-4 h-4 text-cyan-700" />;
      default:
        return <Laptop className="w-4 h-4 text-emerald-800" />;
    }
  };

  const getCategoryBg = (category) => {
    switch (category?.toLowerCase()) {
      case 'furniture':
        return 'bg-amber-100';
      case 'software':
        return 'bg-cyan-100';
      default:
        return 'bg-emerald-100';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            COMPANY INVENTORY
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Asset inventory
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Search the shelf, then make the next handoff obvious.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onBulkUploadClick && (
            <button
              onClick={onBulkUploadClick}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#e3efe9] text-[#1c372e] text-sm font-bold hover:bg-[#d5e7df] transition-all shrink-0"
            >
              <Upload className="w-4 h-4 mr-2 text-[#1c372e]" />
              <span>Bulk Upload</span>
            </button>
          )}

          <button
            onClick={onAddAssetClick}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
            <span>Add asset</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, tag, serial or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center space-x-1 text-xs font-semibold text-[#667772]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          >
            <option value="All">All statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#fcfbf7] border border-[#e2ded2] rounded-xl px-3 py-2 text-xs font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          >
            <option value="All">All categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Furniture">Furniture</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Asset Table Container */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-6 py-4 border-b border-[#f0eee6] flex items-center justify-between bg-[#fcfbf7]">
          <p className="text-xs font-bold text-[#1c2826]">
            <span className="font-heading text-base font-extrabold mr-1">{filteredAssets.length}</span> records matching your view
          </p>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
            UPDATED LIVE
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold tracking-wider text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">ASSET</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4">OWNER</th>
                <th className="py-3.5 px-4">VALUE</th>
                <th className="py-3.5 px-4">CONDITION</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-sm text-[#73827d]">
                    No assets matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#fcfbf7] transition-colors group">
                    {/* Asset Name & Tag */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl ${getCategoryBg(asset.category)} flex items-center justify-center shrink-0`}>
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1c2826] leading-snug">{asset.name}</p>
                          <p className="text-[11px] font-mono font-semibold text-[#80918b] uppercase">{asset.assetTag}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(asset.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {asset.status}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-xs font-semibold text-[#475752]">
                      {asset.location || 'N/A'}
                    </td>

                    {/* Owner */}
                    <td className="py-4 px-4">
                      {asset.ownerId && asset.ownerName && asset.ownerName !== 'Unassigned' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#cbdad5] text-[#1c372e] text-[10px] font-extrabold flex items-center justify-center uppercase">
                            {asset.ownerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-[#1c2826]">{asset.ownerName}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-[#8a9994]">Unassigned</span>
                      )}
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4 text-xs font-mono font-bold text-[#1c2826]">
                      {formatCurrency(asset.value)}
                    </td>

                    {/* Condition */}
                    <td className="py-4 px-4 text-xs">
                      <span className={getConditionColor(asset.condition)}>{asset.condition || 'Good'}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                          className="p-1.5 rounded-lg text-[#889993] hover:text-[#1c2826] hover:bg-[#eae7de] transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === asset.id && (
                          <div className="origin-top-right absolute right-4 mt-2 w-44 rounded-xl shadow-xl bg-white border border-[#e2ded2] ring-1 ring-black ring-opacity-5 z-20 divide-y divide-[#f0eee6] animate-scaleIn">
                            <div className="py-1">
                              {asset.status === 'Assigned' && onCollectAssetClick && (
                                <button
                                  onClick={() => {
                                    onCollectAssetClick(asset);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 flex items-center"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                                  Collect / Return Asset
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  onAssignAssetClick(asset);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#1c372e] hover:bg-[#f5f3ec] flex items-center"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 mr-2 text-[#b88c1c]" />
                                Assign / Return
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedAssetId(asset.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#1c372e] hover:bg-[#f5f3ec] flex items-center"
                              >
                                <History className="w-3.5 h-3.5 mr-2 text-[#0e7490]" />
                                View Audit History
                              </button>

                              <button
                                onClick={() => {
                                  onEditAssetClick(asset);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#1c372e] hover:bg-[#f5f3ec] flex items-center"
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-2 text-[#0e7490]" />
                                Edit Asset
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onDeleteAssetClick(asset.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Asset
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAssetId && (
        <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">ASSET HISTORY</p>
              <h3 className="font-heading text-lg font-extrabold text-[#1c2826] mt-1">
                Audit Logs for {selectedAsset?.assetTag || 'selected asset'}
              </h3>
            </div>
            <button
              onClick={() => setSelectedAssetId(null)}
              className="text-xs font-bold text-[#1c372e] hover:text-[#0f1d1a]"
            >
              Close
            </button>
          </div>

          {selectedAsset && (
            <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#f9f8f3] grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#788883]">Asset</p>
                <p className="mt-1 text-sm font-bold text-[#1c2826]">{selectedAsset.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#788883]">Tag</p>
                <p className="mt-1 text-sm font-bold text-[#1c2826]">{selectedAsset.assetTag}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#788883]">Status</p>
                <p className="mt-1 text-sm font-bold text-[#1c2826]">{selectedAsset.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#788883]">Location</p>
                <p className="mt-1 text-sm font-bold text-[#1c2826]">{selectedAsset.location || 'N/A'}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold tracking-wider text-[#73827d] uppercase bg-[#faf9f4]">
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f3eb]">
                {assetAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-10 px-6 text-center text-sm text-[#61716c]">
                      No audit history available for this asset.
                    </td>
                  </tr>
                ) : (
                  assetAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#fcfbf7] transition-colors">
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#1c372e] text-[#f4c453]">
                          {log.actionType || 'ASSET_EVENT'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#475752]">{log.description || 'Asset event recorded.'}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#1c2826]">{log.performedBy || 'System'}</td>
                      <td className="py-4 px-4 font-mono text-[11px] text-[#61716c]">{log.createdAt || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
