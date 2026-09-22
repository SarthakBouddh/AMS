import React, { useEffect, useState } from 'react';
import { Search, Download } from 'lucide-react';
import { api } from '../api';

export default function AuditTrailPage({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      const companyId = currentUser?.companyId || '';
      const data = await api.getAuditLogs(companyId);
      setLogs(data || []);
    };

    loadLogs();
  }, [currentUser]);

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const actor = log.performedBy || 'System';
    const assetTag = log.assetTag || '';
    const action = log.actionType || '';
    const description = log.description || '';
    return !q || actor.toLowerCase().includes(q) || assetTag.toLowerCase().includes(q) || action.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  });

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Actor,Action,Asset Tag,Description,Timestamp"]
      .concat(filteredLogs.map((log) => `"${log.id}","${log.performedBy || 'System'}","${log.actionType}","${log.assetTag}","${(log.description || '').replace(/"/g, '""')}","${log.createdAt}"`))
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            IMMUTABLE SYSTEM LINEAGE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Enterprise audit trail
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Complete lifecycle history for assets, assignments, updates, and maintenance events.
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

      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, action, asset tag, or description..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <h3 className="font-heading text-base font-extrabold text-[#1c2826]">
            {filteredLogs.length} Audit Records Found
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            ASSET HISTORY LOG
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">TIMESTAMP</th>
                <th className="py-3.5 px-4">ACTOR</th>
                <th className="py-3.5 px-4">ACTION</th>
                <th className="py-3.5 px-4">ASSET TAG</th>
                <th className="py-3.5 px-4">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#61716c] text-sm">
                    No audit records available for this company yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#fcfbf7]">
                    <td className="py-4 px-6 font-mono font-bold text-[#1c2826]">{log.createdAt}</td>
                    <td className="py-4 px-4 font-semibold text-[#3d4f49]">{log.performedBy || 'System'}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#1c372e] text-[#f4c453]">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[#1c2826]">{log.assetTag}</td>
                    <td className="py-4 px-4 text-[#61716c]">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
