import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Search, DollarSign, UserCheck, X } from 'lucide-react';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([
    {
      id: 'tkt-301',
      assetId: 'ast-3',
      assetName: 'Dell UltraSharp 27 (AST-1826)',
      reportedBy: 'Jon Bell',
      problemDescription: 'Display flickering and losing power when connected via USB-C DisplayPort.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      technicianAssigned: 'Vikram Mehta (Hardware Tech)',
      repairCost: 140.00,
      resolutionNotes: 'Replacing internal power logic board under Dell Extended Warranty.',
      createdAt: '2026-09-07'
    },
    {
      id: 'tkt-302',
      assetId: 'ast-1',
      assetName: 'MacBook Pro 14-inch (AST-1842)',
      reportedBy: 'Maya Patel',
      problemDescription: 'Trackpad haptic feedback occasionally un-responsive.',
      priority: 'MEDIUM',
      status: 'OPEN',
      technicianAssigned: 'Apple Authorized Service',
      repairCost: 0.00,
      resolutionNotes: 'Scheduled diagnostic checkup.',
      createdAt: '2026-09-09'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    assetName: '',
    problemDescription: '',
    priority: 'HIGH'
  });

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

  const handleResolveTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const created = {
      id: 'tkt-' + Date.now(),
      assetId: 'ast-custom',
      assetName: newTicket.assetName,
      reportedBy: 'Mara Singh',
      problemDescription: newTicket.problemDescription,
      priority: newTicket.priority,
      status: 'OPEN',
      technicianAssigned: 'IT Support Helpdesk',
      repairCost: 0.00,
      resolutionNotes: 'Ticket logged.',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTickets([created, ...tickets]);
    setIsAddModalOpen(false);
    setNewTicket({ assetName: '', problemDescription: '', priority: 'HIGH' });
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
            Maintenance management
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Log equipment issues, assign technicians, track downtime, and record repair expenses.
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
        {tickets.map((tkt) => (
          <div key={tkt.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadge(tkt.priority)}`}>
                  {tkt.priority} PRIORITY
                </span>
                <span className="text-xs font-mono text-[#889993]">TICKET ID: {tkt.id}</span>
                <span className="text-xs font-mono text-[#889993]">· {tkt.createdAt}</span>
              </div>

              <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                {tkt.assetName}
              </h3>

              <p className="text-xs font-semibold text-[#c2410c] bg-[#ffedd5] p-2.5 rounded-xl border border-[#fed7aa]">
                "{tkt.problemDescription}"
              </p>

              <div className="flex items-center space-x-4 text-xs font-mono text-[#556661] pt-1">
                <span>Reporter: <strong className="text-[#1c2826]">{tkt.reportedBy}</strong></span>
                <span>Technician: <strong className="text-[#1c372e]">{tkt.technicianAssigned}</strong></span>
                <span>Repair Cost: <strong className="text-emerald-800">${tkt.repairCost}</strong></span>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${tkt.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                {tkt.status}
              </span>

              {tkt.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleResolveTicket(tkt.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Report Ticket */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">Log Maintenance Issue</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Asset Name / Tag *</label>
                <input
                  type="text"
                  value={newTicket.assetName}
                  onChange={(e) => setNewTicket({ ...newTicket, assetName: e.target.value })}
                  placeholder="e.g. Dell UltraSharp 27"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Problem Description *</label>
                <textarea
                  value={newTicket.problemDescription}
                  onChange={(e) => setNewTicket({ ...newTicket, problemDescription: e.target.value })}
                  placeholder="e.g. Laptop is not charging or screen flickers"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold"
                >
                  <option value="URGENT">URGENT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
