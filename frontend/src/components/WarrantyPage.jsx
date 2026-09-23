import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertOctagon, Clock, Search, Calendar, Building, Phone, Wrench, RefreshCw, BellRing } from 'lucide-react';

export default function WarrantyPage({ assets = [] }) {
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' or 'ALERTS'
  const [searchTerm, setSearchTerm] = useState('');

  const getDaysRemaining = (expiryStr) => {
    if (!expiryStr || expiryStr === 'N/A') return null;
    const expiry = new Date(expiryStr);
    if (isNaN(expiry.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formattedAssets = assets.map(a => {
    const days = getDaysRemaining(a.warrantyExpiryDate);
    let status = 'ACTIVE';
    if (days !== null) {
      if (days < 0) {
        status = 'EXPIRED';
      } else if (days <= 45) {
        status = 'EXPIRING_SOON';
      }
    }

    return {
      ...a,
      vendorName: a.vendorName || 'Standard Vendor',
      warrantyExpiryDate: a.warrantyExpiryDate || 'N/A',
      purchaseDate: a.purchaseDate || 'N/A',
      warrantyType: a.warrantyType || '1 Year Manufacturer',
      daysRemaining: days,
      warrantyStatus: status
    };
  });

  // Filter based on search term
  const searchedAssets = formattedAssets.filter(ast => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      (ast.name && ast.name.toLowerCase().includes(query)) ||
      (ast.assetTag && ast.assetTag.toLowerCase().includes(query)) ||
      (ast.vendorName && ast.vendorName.toLowerCase().includes(query)) ||
      (ast.warrantyType && ast.warrantyType.toLowerCase().includes(query))
    );
  });

  // Category 1: All Warranties
  // Category 2: Warranty Alerts (Expired or Expiring Soon)
  const alertAssets = searchedAssets.filter(ast => ast.warrantyStatus === 'EXPIRED' || ast.warrantyStatus === 'EXPIRING_SOON');
  const displayedAssets = activeCategory === 'ALERTS' ? alertAssets : searchedAssets;

  const expiredCount = formattedAssets.filter(a => a.warrantyStatus === 'EXPIRED').length;
  const expiringSoonCount = formattedAssets.filter(a => a.warrantyStatus === 'EXPIRING_SOON').length;
  const activeCount = formattedAssets.filter(a => a.warrantyStatus === 'ACTIVE').length;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            RISK AUDIT & CONTRACT MONITORING
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Warranty & Expiry Alerts Center
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Track manufacturer warranty expiration dates, active coverage, and receive timely replacement alerts.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold text-rose-900">{expiredCount} Expired</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900">{expiringSoonCount} Expiring Soon</span>
          </div>
        </div>
      </div>

      {/* Main Alert Notification Banner */}
      {(expiredCount > 0 || expiringSoonCount > 0) ? (
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl flex items-start space-x-4 text-amber-900 shadow-sm animate-pulse-subtle">
          <div className="p-2 bg-amber-200/60 rounded-xl shrink-0">
            <BellRing className="w-6 h-6 text-amber-800" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-extrabold text-amber-950 flex items-center space-x-2">
              <span>Warranty Expiry Alerts Triggered</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-300 text-amber-950 font-extrabold">
                {expiredCount + expiringSoonCount} ATTENTION REQUIRED
              </span>
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {expiredCount > 0 && `${expiredCount} asset(s) have expired warranties. `}
              {expiringSoonCount > 0 && `${expiringSoonCount} asset(s) will expire within 45 days. `}
              Contact assigned suppliers to renew coverage or log maintenance tickets before SLA expiration.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl flex items-start space-x-3 text-emerald-900 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading text-sm font-bold">All Hardware Assets Covered</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              All company inventory items have valid manufacturer warranties and active support contracts.
            </p>
          </div>
        </div>
      )}

      {/* Two Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeCategory === 'ALL'
                ? 'bg-[#1c372e] text-white shadow-md'
                : 'bg-[#f0eee6] text-[#556661] hover:bg-[#e4e1d3]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#f4c453]" />
            <span>All Warranties</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#e0dcd0] text-[#1c2826]'
            }`}>
              {formattedAssets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('ALERTS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeCategory === 'ALERTS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#f0eee6] text-[#556661] hover:bg-[#e4e1d3]'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeCategory === 'ALERTS' ? 'text-amber-200' : 'text-amber-600'}`} />
            <span>Warranty Alerts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeCategory === 'ALERTS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {formattedAssets.filter(a => a.warrantyStatus === 'EXPIRED' || a.warrantyStatus === 'EXPIRING_SOON').length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#82918c]" />
          <input
            type="text"
            placeholder="Search by asset, tag, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e] bg-[#faf9f5]"
          />
        </div>
      </div>

      {/* Warranty Assets Table */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading text-base font-extrabold text-[#1c2826]">
              {activeCategory === 'ALERTS' ? '⚠️ Active Expiry Alerts' : '📋 All Registered Assets & Expiry Dates'}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
            {displayedAssets.length} RECORDS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">ASSET / TAG</th>
                <th className="py-3.5 px-4">VENDOR</th>
                <th className="py-3.5 px-4">PURCHASE DATE</th>
                <th className="py-3.5 px-4">WARRANTY EXPIRY</th>
                <th className="py-3.5 px-4">DAYS REMAINING</th>
                <th className="py-3.5 px-4">COVERAGE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {displayedAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-[#61716c]">
                    {activeCategory === 'ALERTS' ? (
                      <div className="space-y-2">
                        <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="font-bold text-[#1c2826]">No Active Warranty Alerts</p>
                        <p className="text-xs text-[#889993]">All assets have active coverage or no impending expiries.</p>
                      </div>
                    ) : (
                      'No assets available in database.'
                    )}
                  </td>
                </tr>
              ) : (
                displayedAssets.map((ast) => {
                  return (
                    <tr key={ast.id} className="hover:bg-[#fcfbf7] transition-colors">
                      {/* Asset & Tag */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#1c2826] text-sm">{ast.name}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-[#889993] bg-[#f0eee6] px-1.5 py-0.5 rounded">
                            {ast.assetTag}
                          </span>
                          <span className="text-[10px] font-mono text-[#556661]">{ast.category}</span>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-4 px-4 font-semibold text-[#3d4f49]">
                        <div className="flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-[#788883]" />
                          <span>{ast.vendorName}</span>
                        </div>
                        <span className="text-[10px] text-[#788883] font-normal block mt-0.5">{ast.warrantyType}</span>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-4 px-4 font-mono text-[#556661]">
                        {ast.purchaseDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-4 font-mono font-bold text-[#1c2826]">
                        {ast.warrantyExpiryDate !== 'N/A' ? (
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#788883]" />
                            <span>{ast.warrantyExpiryDate}</span>
                          </div>
                        ) : (
                          <span className="text-[#98a7a2]">Not Set</span>
                        )}
                      </td>

                      {/* Days Remaining */}
                      <td className="py-4 px-4 font-mono font-bold">
                        {ast.daysRemaining !== null ? (
                          ast.daysRemaining < 0 ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                              Expired ({Math.abs(ast.daysRemaining)}d ago)
                            </span>
                          ) : ast.daysRemaining <= 45 ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                              {ast.daysRemaining} days left
                            </span>
                          ) : (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                              {ast.daysRemaining} days left
                            </span>
                          )
                        ) : (
                          <span className="text-[#889993]">N/A</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {ast.warrantyStatus === 'EXPIRED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
                            🚨 EXPIRED
                          </span>
                        )}
                        {ast.warrantyStatus === 'EXPIRING_SOON' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            ⚠️ EXPIRING SOON
                          </span>
                        )}
                        {ast.warrantyStatus === 'ACTIVE' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            🟢 ACTIVE COVERED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
