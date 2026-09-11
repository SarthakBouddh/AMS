import React, { useState } from 'react';
import { GitPullRequest, CheckCircle2, Clock, XCircle, ArrowRight, UserCheck, ShieldCheck, Plus, Filter, AlertCircle, FileText, Check } from 'lucide-react';

export default function RequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 'req-201',
      requestType: 'NEW_ASSET',
      requestedBy: 'Jon Bell',
      department: 'Engineering',
      targetAssetName: 'MacBook Pro 16-inch M3 Max',
      reasonNotes: 'Required for high-performance ML model compilation & containerization.',
      managerStatus: 'APPROVED',
      adminStatus: 'PENDING',
      createdAt: '2026-09-08 14:30'
    },
    {
      id: 'req-202',
      requestType: 'ASSET_TRANSFER',
      requestedBy: 'Maya Patel',
      department: 'Design',
      targetAssetName: 'Herman Miller Aeron (AST-1837)',
      reasonNotes: 'Transferring ergonomic chair from Mumbai studio to Remote workstation.',
      managerStatus: 'APPROVED',
      adminStatus: 'ALLOCATED',
      createdAt: '2026-09-07 09:15'
    },
    {
      id: 'req-203',
      requestType: 'MAINTENANCE',
      requestedBy: 'Priya Nair',
      department: 'Operations',
      targetAssetName: 'Dell UltraSharp 27 (AST-1826)',
      reasonNotes: 'Screen flickers when connected via USB-C DisplayPort.',
      managerStatus: 'APPROVED',
      adminStatus: 'ALLOCATED',
      createdAt: '2026-09-06 16:45'
    },
    {
      id: 'req-204',
      requestType: 'SOFTWARE_LICENSE',
      requestedBy: 'Jon Bell',
      department: 'Engineering',
      targetAssetName: 'JetBrains All Products Pack',
      reasonNotes: 'IDE seat allocation for Q4 software release sprint.',
      managerStatus: 'PENDING',
      adminStatus: 'PENDING',
      createdAt: '2026-09-09 11:00'
    }
  ]);

  const [filterType, setFilterType] = useState('ALL');

  const handleManagerApprove = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, managerStatus: 'APPROVED' } : r));
  };

  const handleAdminAllocate = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, adminStatus: 'ALLOCATED' } : r));
  };

  const filteredRequests = requests.filter(r => filterType === 'ALL' || r.requestType === filterType);

  const getStatusPill = (status) => {
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

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            WORKFLOW PIPELINE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Request & Approval Management
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Centralized approval workflow: Employee Request → Manager Approval → Admin Allocation → Complete.
          </p>
        </div>
      </div>

      {/* Workflow Visual Banner */}
      <div className="bg-[#1c372e] p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <GitPullRequest className="w-8 h-8 text-[#f4c453]" />
          <div>
            <h3 className="font-heading text-lg font-extrabold">Multi-Stage Request Pipeline Active</h3>
            <p className="text-xs text-[#b0c4bd]">Managers approve request feasibility, Admins allocate & hand off inventory.</p>
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

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {['ALL', 'NEW_ASSET', 'ASSET_TRANSFER', 'MAINTENANCE', 'SOFTWARE_LICENSE'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                filterType === t
                  ? 'bg-[#1c372e] text-white border-[#1c372e]'
                  : 'bg-[#fcfbf7] text-[#556661] border-[#e2ded2] hover:bg-[#f0eee6]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
                  {req.requestType.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-[#889993]">{req.createdAt}</span>
              </div>

              <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                {req.targetAssetName}
              </h3>

              <p className="text-xs text-[#556661]">
                <span className="font-bold text-[#1c2826]">Requested By:</span> {req.requestedBy} ({req.department})
              </p>

              <p className="text-xs text-[#788883] italic bg-[#fcfbf7] p-2.5 rounded-xl border border-[#f0eee6] mt-2">
                "{req.reasonNotes}"
              </p>
            </div>

            {/* Approval Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-[#f0eee6] pt-3 md:pt-0 md:pl-6">
              {/* Manager Status */}
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold text-[#788883] mb-1">MANAGER</p>
                {req.managerStatus === 'APPROVED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> Approved
                  </span>
                ) : (
                  <button
                    onClick={() => handleManagerApprove(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 shadow"
                  >
                    Approve Request
                  </button>
                )}
              </div>

              {/* Admin Status */}
              <div className="text-center">
                <p className="text-[10px] font-mono font-bold text-[#788883] mb-1">ADMIN ALLOCATION</p>
                {req.adminStatus === 'ALLOCATED' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Allocated
                  </span>
                ) : (
                  <button
                    onClick={() => handleAdminAllocate(req.id)}
                    disabled={req.managerStatus !== 'APPROVED'}
                    className="px-3 py-1.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow disabled:opacity-50"
                  >
                    Allocate Asset
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
