import React from 'react';
import { Plus, ArrowUpRight, Boxes, Gauge, DollarSign, AlertTriangle, Activity } from 'lucide-react';

export default function OverviewPage({ stats, onAddAssetClick, onViewInventoryClick }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  const totalAssets = stats?.totalAssets ?? 5;
  const availableAssets = stats?.availableAssets ?? 2;
  const utilizationRate = stats?.utilizationRate ?? 40;
  const assignedCount = stats?.assignedCount ?? 2;
  const portfolioValue = stats?.portfolioValue ?? 33778;
  const needsAttention = stats?.needsAttentionCount ?? 1;

  // Portfolio mix computation
  const hardwareVal = stats?.categoryValue?.['Hardware'] ?? 3998;
  const hardwareCount = stats?.categoryCount?.['Hardware'] ?? 3;
  
  const softwareVal = stats?.categoryValue?.['Software'] ?? 28500;
  const softwareCount = stats?.categoryCount?.['Software'] ?? 1;

  const furnitureVal = stats?.categoryValue?.['Furniture'] ?? 1240;
  const furnitureCount = stats?.categoryCount?.['Furniture'] ?? 1;

  const maxVal = Math.max(hardwareVal, softwareVal, furnitureVal, 1);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            OPERATIONS PULSE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Know what’s moving.
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            A calm read on the things your team depends on, from check-out to return.
          </p>
        </div>

        <button
          onClick={onAddAssetClick}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Add asset</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total assets */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow card-hover-shadow relative group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e3efe9] text-[#1c372e] flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#a3b2ac] group-hover:text-[#1c372e] transition-colors" />
          </div>
          <p className="text-xs font-semibold text-[#73827d] mt-4 uppercase tracking-wider">Total assets</p>
          <h3 className="font-heading text-3xl font-extrabold text-[#1c2826] mt-1">{totalAssets}</h3>
          <p className="text-xs text-[#73827d] mt-1 font-medium">{availableAssets} available now</p>
        </div>

        {/* Card 2: Utilization rate */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow card-hover-shadow relative group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fef5db] text-[#b88c1c] flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#a3b2ac] group-hover:text-[#1c372e] transition-colors" />
          </div>
          <p className="text-xs font-semibold text-[#73827d] mt-4 uppercase tracking-wider">Utilization rate</p>
          <h3 className="font-heading text-3xl font-extrabold text-[#1c2826] mt-1">{utilizationRate}%</h3>
          <p className="text-xs text-[#73827d] mt-1 font-medium">{assignedCount} currently assigned</p>
        </div>

        {/* Card 3: Portfolio value */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow card-hover-shadow relative group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e6f4f1] text-[#0e7490] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#a3b2ac] group-hover:text-[#1c372e] transition-colors" />
          </div>
          <p className="text-xs font-semibold text-[#73827d] mt-4 uppercase tracking-wider">Portfolio value</p>
          <h3 className="font-heading text-3xl font-extrabold text-[#1c2826] mt-1">{formatCurrency(portfolioValue)}</h3>
          <p className="text-xs text-[#73827d] mt-1 font-medium">Across active inventory</p>
        </div>

        {/* Card 4: Needs attention */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow card-hover-shadow relative group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#a3b2ac] group-hover:text-[#1c372e] transition-colors" />
          </div>
          <p className="text-xs font-semibold text-[#73827d] mt-4 uppercase tracking-wider">Needs attention</p>
          <h3 className="font-heading text-3xl font-extrabold text-[#1c2826] mt-1">{needsAttention}</h3>
          <p className="text-xs text-[#73827d] mt-1 font-medium">In maintenance queue</p>
        </div>
      </div>

      {/* Two Column Section: Portfolio Mix & Activity Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Portfolio Mix */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#f0eee6] pb-4 mb-6">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase">PORTFOLIO MIX</p>
                <h3 className="font-heading text-xl font-extrabold text-[#1c2826]">Where value sits</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#f0eee6] rounded-md text-[#50605b]">USD</span>
            </div>

            <div className="space-y-6">
              {/* Hardware */}
              <div>
                <div className="flex justify-between text-sm font-bold text-[#1c2826] mb-1.5">
                  <span>Hardware</span>
                  <span className="font-mono text-xs font-semibold text-[#61716c]">
                    {hardwareCount} · {formatCurrency(hardwareVal)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1c372e] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (hardwareVal / maxVal) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Software */}
              <div>
                <div className="flex justify-between text-sm font-bold text-[#1c2826] mb-1.5">
                  <span>Software</span>
                  <span className="font-mono text-xs font-semibold text-[#61716c]">
                    {softwareCount} · {formatCurrency(softwareVal)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0e7490] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (softwareVal / maxVal) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Furniture */}
              <div>
                <div className="flex justify-between text-sm font-bold text-[#1c2826] mb-1.5">
                  <span>Furniture</span>
                  <span className="font-mono text-xs font-semibold text-[#61716c]">
                    {furnitureCount} · {formatCurrency(furnitureVal)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f0eee6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f4c453] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (furnitureVal / maxVal) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Movement / Activity Trail */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#f0eee6] pb-4 mb-6">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase">LATEST MOVEMENT</p>
                <h3 className="font-heading text-xl font-extrabold text-[#1c2826]">Activity trail</h3>
              </div>
              <button
                onClick={onViewInventoryClick}
                className="text-xs font-bold text-[#1c372e] hover:underline flex items-center"
              >
                View inventory <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-[#fbfaf6] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#e3efe9] text-[#1c372e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      +
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#1c2826] leading-snug">{act.title}</p>
                      <p className="text-[11px] text-[#73827d] font-mono mt-0.5">
                        {act.assetTag} · {act.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#82918c]">
                  No recent activities recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
