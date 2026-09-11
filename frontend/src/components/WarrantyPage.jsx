import React from 'react';
import { AlertOctagon, ShieldAlert, ShieldCheck, Clock, Building, Calendar, CheckCircle2 } from 'lucide-react';

export default function WarrantyPage({ assets }) {
  const warrantyAssets = assets.map(a => ({
    ...a,
    vendorName: a.vendorName || 'Apple Enterprise',
    warrantyExpiryDate: a.warrantyExpiryDate || '2026-10-15',
    warrantyType: a.warrantyType || 'Manufacturer 3-Year Extended'
  }));

  const getDaysRemaining = (expiryStr) => {
    if (!expiryStr) return 30;
    const expiry = new Date(expiryStr);
    const today = new Date('2026-09-09');
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            RISK & VENDOR AUDIT
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Warranty & vendor alert center
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Track manufacturer warranty expiries, vendor support contracts, and upcoming renewal alerts.
          </p>
        </div>
      </div>

      {/* Alert Warning Box */}
      <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-sm">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-heading text-sm font-bold">Upcoming Warranty Expiries Detected</h3>
          <p className="text-xs text-amber-800 mt-0.5">
            ⚠️ <strong>Dell UltraSharp 27 (AST-1826)</strong> warranty expires in <strong>21 days</strong> (Sep 30, 2026). Initiate vendor renewal or replacement plan.
          </p>
        </div>
      </div>

      {/* Warranty Assets Table */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <h3 className="font-heading text-base font-extrabold text-[#1c2826]">Hardware Warranty Status</h3>
          <span className="text-xs font-mono font-bold text-[#788883] uppercase">AUTOMATED ALERTS ACTIVE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">ASSET / TAG</th>
                <th className="py-3.5 px-4">VENDOR</th>
                <th className="py-3.5 px-4">WARRANTY TYPE</th>
                <th className="py-3.5 px-4">EXPIRY DATE</th>
                <th className="py-3.5 px-4">DAYS REMAINING</th>
                <th className="py-3.5 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {warrantyAssets.map((ast) => {
                const days = getDaysRemaining(ast.warrantyExpiryDate);
                const isExpiringSoon = days <= 45;

                return (
                  <tr key={ast.id} className="hover:bg-[#fcfbf7]">
                    <td className="py-4 px-6">
                      <p className="font-bold text-[#1c2826]">{ast.name}</p>
                      <p className="text-[11px] font-mono text-[#889993]">{ast.assetTag}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#3d4f49]">{ast.vendorName}</td>
                    <td className="py-4 px-4 text-[#556661]">{ast.warrantyType}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#1c2826]">{ast.warrantyExpiryDate}</td>
                    <td className="py-4 px-4 font-mono font-bold">
                      <span className={isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'}>
                        {days} days
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {isExpiringSoon ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠️ Expiring Soon
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Covered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
