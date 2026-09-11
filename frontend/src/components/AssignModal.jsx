import React, { useState } from 'react';
import { X, ArrowRightLeft, UserCheck, UserMinus } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, asset, employees, onAssignConfirm }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(asset?.ownerId || 'unassigned');

  if (!isOpen || !asset) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssignConfirm(asset.id, selectedEmployeeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-extrabold text-[#1c2826]">
                Handoff / Assign Asset
              </h3>
              <p className="text-[11px] font-mono text-[#788883] uppercase">{asset.assetTag}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#788883] hover:text-[#1c2826] hover:bg-[#f0eee6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#eae7de]">
            <p className="text-xs text-[#788883] font-semibold uppercase tracking-wider">Target Asset</p>
            <h4 className="font-heading text-lg font-bold text-[#1c2826] mt-0.5">{asset.name}</h4>
            <p className="text-xs text-[#62736e] mt-1">
              Currently: <span className="font-bold">{asset.ownerName || 'Unassigned'}</span> ({asset.status})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Assign to Team Member
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-3 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              <option value="unassigned">Mark as Unassigned (Available)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#62736e] bg-[#eae7de] hover:bg-[#e2ded2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#1c372e] bg-[#f4c453] hover:bg-[#e5b642] shadow-sm transition-all"
            >
              Confirm Handoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
