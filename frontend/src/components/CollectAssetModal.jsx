import React, { useState, useEffect } from 'react';
import { X, RotateCcw, PackageCheck, AlertCircle } from 'lucide-react';

export default function CollectAssetModal({ isOpen, onClose, asset, person, onCollectConfirm }) {
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (asset) {
      setCondition(asset.condition || 'Good');
      setNotes('');
    }
  }, [asset]);

  if (!isOpen || (!asset && !person)) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (asset) {
      onCollectConfirm(asset.id, { condition, notes });
    }
    onClose();
  };

  const ownerDisplayName = asset?.ownerName || person?.name || 'Assigned User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-extrabold text-[#1c2826]">
                Collect Asset Back to Inventory
              </h3>
              <p className="text-[11px] font-mono text-[#788883] uppercase">
                {asset ? asset.assetTag : 'MULTIPLE ASSETS'}
              </p>
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
            <p className="text-xs text-[#788883] font-semibold uppercase tracking-wider">Asset Handoff Target</p>
            <h4 className="font-heading text-lg font-bold text-[#1c2826] mt-0.5">{asset?.name}</h4>
            <p className="text-xs text-[#62736e] mt-1">
              Currently assigned to: <span className="font-bold text-[#1c2826]">{ownerDisplayName}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Condition Upon Return
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor (Needs Maintenance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Collection / Return Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Returned during user offboarding, verified power adapter and accessories..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-xs text-[#1c2826] placeholder-[#94a5a0] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Collecting this asset will release it from <strong>{ownerDisplayName}</strong> and mark its status as <strong>Available</strong> in company inventory.
            </span>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1c372e] hover:bg-[#142a23] shadow-sm transition-all flex items-center space-x-1.5"
            >
              <PackageCheck className="w-4 h-4 text-[#f4c453]" />
              <span>Confirm Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
