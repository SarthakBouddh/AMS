import React, { useState } from 'react';
import { History, Search, Download, ShieldCheck, User, Tag, Calendar, ArrowRight } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([
    {
      id: 'aud-901',
      actor: 'Mara Singh (Admin)',
      action: 'ASSIGNED_ASSET',
      assetTag: 'AST-1904',
      assetName: 'ThinkPad X1 Carbon',
      from: 'Inventory Pool (Mumbai)',
      to: 'Jon Bell (Engineering)',
      timestamp: '09-Sep-2026 10:30',
      notes: 'Provisioned for remote engineering work.'
    },
    {
      id: 'aud-902',
      actor: 'Rahul Sharma',
      action: 'TRANSFERRED_ASSET',
      assetTag: 'AST-1024',
      assetName: 'MacBook Pro 16-inch',
      from: 'Rahul Sharma (IT)',
      to: 'Priya Nair (Engineering)',
      timestamp: '08-Sep-2026 15:45',
      notes: 'Transferred from Pune office to Bangalore office.'
    },
    {
      id: 'aud-903',
      actor: 'Jon Bell',
      action: 'REPORTED_MAINTENANCE',
      assetTag: 'AST-1826',
      assetName: 'Dell UltraSharp 27',
      from: 'Jon Bell',
      to: 'IT Service Helpdesk',
      timestamp: '07-Sep-2026 16:45',
      notes: 'Display port power flickering.'
    },
    {
      id: 'aud-904',
      actor: 'System Admin',
      action: 'PURCHASED_ASSET',
      assetTag: 'AST-2100',
      assetName: 'Enterprise Figma Suite',
      from: 'Vendor (Figma Inc)',
      to: 'Company License Vault',
      timestamp: '01-Jan-2024 09:00',
      notes: 'Annual license procurement.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => {
    const q = searchTerm.toLowerCase();
    return !q || l.actor.toLowerCase().includes(q) || l.assetName.toLowerCase().includes(q) || l.assetTag.toLowerCase().includes(q) || l.action.toLowerCase().includes(q);
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Actor,Action,Asset Tag,Asset Name,From,To,Timestamp,Notes"]
      .concat(filteredLogs.map(l => `"${l.id}","${l.actor}","${l.action}","${l.assetTag}","${l.assetName}","${l.from}","${l.to}","${l.timestamp}","${l.notes}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ams_audit_trail_${Date.now()}.csv`);
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
            IMMUTABLE SYSTEM LINEAGE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Enterprise audit trail
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Complete lifecycle history: Who had this laptop last year? Who transferred it? When was it purchased?
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow hover:bg-[#142a23] transition-all shrink-0"
        >
          <Download className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, asset ID (LAP-1024), serial, or action type..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <h3 className="font-heading text-base font-extrabold text-[#1c2826]">
            {filteredLogs.length} Audit Records Found
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            CRYPTOGRAPHIC TIMESTAMP LOG
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">TIMESTAMP</th>
                <th className="py-3.5 px-4">ACTOR / ADMIN</th>
                <th className="py-3.5 px-4">ACTION</th>
                <th className="py-3.5 px-4">ASSET (TAG)</th>
                <th className="py-3.5 px-4">FROM</th>
                <th className="py-3.5 px-4">TO</th>
                <th className="py-3.5 px-4">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fcfbf7]">
                  <td className="py-4 px-6 font-mono font-bold text-[#1c2826]">{log.timestamp}</td>
                  <td className="py-4 px-4 font-semibold text-[#3d4f49]">{log.actor}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#1c372e] text-[#f4c453]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#1c2826]">{log.assetName}</p>
                    <p className="text-[10px] font-mono text-[#889993]">{log.assetTag}</p>
                  </td>
                  <td className="py-4 px-4 text-[#61716c]">{log.from}</td>
                  <td className="py-4 px-4 font-semibold text-[#1c372e]">{log.to}</td>
                  <td className="py-4 px-4 text-[#788883] italic">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
