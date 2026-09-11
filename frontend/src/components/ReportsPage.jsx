import React from 'react';
import { BarChart3, Download, PieChart, FileSpreadsheet, DollarSign, TrendingUp, Layers, Building } from 'lucide-react';

export default function ReportsPage({ assets, stats }) {
  const totalValue = assets.reduce((acc, a) => acc + (a.value || 0), 0);
  const hardwareVal = assets.filter(a => a.category === 'Hardware').reduce((acc, a) => acc + (a.value || 0), 0);
  const softwareVal = assets.filter(a => a.category === 'Software').reduce((acc, a) => acc + (a.value || 0), 0);
  const furnitureVal = assets.filter(a => a.category === 'Furniture').reduce((acc, a) => acc + (a.value || 0), 0);

  const exportReportCSV = (reportTitle) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Asset Tag,Asset Name,Category,Status,Location,Owner,Value ($),Warranty Expiry"]
      .concat(assets.map(a => `"${a.assetTag}","${a.name}","${a.category}","${a.status}","${a.location}","${a.ownerName || 'Unassigned'}","${a.value}","${a.warrantyExpiryDate || 'N/A'}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            EXECUTIVE ANALYTICS
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Reports & export center
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Generate employee asset reports, category breakdown, maintenance costs, and asset lifecycle depreciation.
          </p>
        </div>
      </div>

      {/* Valuation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <p className="text-xs font-bold text-[#788883] uppercase tracking-wider">Total Portfolio Valuation</p>
          <p className="font-heading text-3xl font-extrabold text-[#1c372e] mt-1">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Audited Asset Base</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <p className="text-xs font-bold text-[#788883] uppercase tracking-wider">Hardware Assets</p>
          <p className="font-heading text-2xl font-extrabold text-[#1c2826] mt-1">${hardwareVal.toLocaleString()}</p>
          <p className="text-xs text-[#61716c] mt-1">Laptops, Monitors & Workstations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <p className="text-xs font-bold text-[#788883] uppercase tracking-wider">Software Licenses</p>
          <p className="font-heading text-2xl font-extrabold text-[#1c2826] mt-1">${softwareVal.toLocaleString()}</p>
          <p className="text-xs text-[#61716c] mt-1">SaaS & Enterprise Suites</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#eae7de] card-shadow">
          <p className="text-xs font-bold text-[#788883] uppercase tracking-wider">Furniture & Fixtures</p>
          <p className="font-heading text-2xl font-extrabold text-[#1c2826] mt-1">${furnitureVal.toLocaleString()}</p>
          <p className="text-xs text-[#61716c] mt-1">Ergonomic seating & desks</p>
        </div>
      </div>

      {/* Exportable Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 inline-block mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Master Asset Inventory Report</h3>
            <p className="text-xs text-[#61716c] mt-1">Complete register of all company assets, tags, serial numbers, locations, and costs.</p>
          </div>
          <button
            onClick={() => exportReportCSV('Master_Asset_Inventory_Report')}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23]"
          >
            <Download className="w-4 h-4 mr-2 text-[#f4c453]" />
            <span>Export CSV / Excel</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 inline-block mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Employee Asset Allocation Report</h3>
            <p className="text-xs text-[#61716c] mt-1">Detailed report mapping which employee holds which asset, assigned dates, and location.</p>
          </div>
          <button
            onClick={() => exportReportCSV('Employee_Asset_Allocation_Report')}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23]"
          >
            <Download className="w-4 h-4 mr-2 text-[#f4c453]" />
            <span>Export CSV / Excel</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 inline-block mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Maintenance & Warranty Expiry Audit</h3>
            <p className="text-xs text-[#61716c] mt-1">Audit log of repair expenses, technician downtime, and upcoming warranty expiries.</p>
          </div>
          <button
            onClick={() => exportReportCSV('Maintenance_And_Warranty_Report')}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23]"
          >
            <Download className="w-4 h-4 mr-2 text-[#f4c453]" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
