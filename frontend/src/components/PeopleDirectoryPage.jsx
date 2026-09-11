import React, { useState } from 'react';
import { Search, Plus, Mail, UserCheck, Edit3, Trash2, Box, Building2 } from 'lucide-react';

export default function PeopleDirectoryPage({
  employees,
  assets,
  searchTerm,
  setSearchTerm,
  onAddPersonClick,
  onEditPersonClick,
  onDeletePersonClick
}) {
  const getDepartmentBadgeClass = (dept) => {
    switch (dept?.toLowerCase()) {
      case 'engineering':
        return 'bg-[#e2e8f0] text-[#334155] border-[#cbd5e1]';
      case 'design':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'operations':
        return 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]';
      case 'sales':
        return 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAssignedAssetsForPerson = (personId) => {
    return assets.filter(a => a.ownerId === personId);
  };

  // Live real-time search & filtration fix
  const filteredEmployees = employees.filter(person => {
    const query = (searchTerm || '').toLowerCase().trim();
    if (!query) return true;
    return (
      (person.name && person.name.toLowerCase().includes(query)) ||
      (person.email && person.email.toLowerCase().includes(query)) ||
      (person.department && person.department.toLowerCase().includes(query)) ||
      (person.role && person.role.toLowerCase().includes(query)) ||
      (person.location && person.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            RESPONSIBILITY MAP
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            People directory
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Team list view for tracking handoffs, roles, and assigned company assets.
          </p>
        </div>

        <button
          onClick={onAddPersonClick}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Add person</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people by name, email, department, role or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] placeholder-[#8ba29a] focus:outline-none focus:ring-2 focus:ring-[#1c372e] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* People Table View List */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#f0eee6] flex items-center justify-between bg-[#fcfbf7]">
          <p className="text-xs font-bold text-[#1c2826]">
            <span className="font-heading text-base font-extrabold mr-1">{filteredEmployees.length}</span> team members matching your view
          </p>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#788883] uppercase px-2 py-0.5 rounded bg-[#f0eee6]">
            UPDATED LIVE
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold tracking-wider text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3.5 px-6">PERSON</th>
                <th className="py-3.5 px-4">DEPARTMENT</th>
                <th className="py-3.5 px-4">ROLE TITLE</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4">ASSIGNED ASSETS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-sm text-[#73827d]">
                    No team members matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((person) => {
                  const assignedAssets = getAssignedAssetsForPerson(person.id);

                  return (
                    <tr key={person.id} className="hover:bg-[#fcfbf7] transition-colors group">
                      {/* Name & Initials */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#cbdad5] text-[#1c372e] font-extrabold text-xs flex items-center justify-center shrink-0 uppercase border border-[#b2c8c0]">
                            {person.initials || person.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1c2826] leading-snug">{person.name}</p>
                            <p className="text-[11px] font-mono text-[#788883]">{person.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department Pill */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getDepartmentBadgeClass(person.department)}`}>
                          {person.department}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 text-xs font-semibold text-[#1c2826]">
                        {person.role || 'Team Member'}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs font-medium text-[#475752]">
                        {person.location || 'Mumbai office'}
                      </td>

                      {/* Assigned Assets */}
                      <td className="py-4 px-4">
                        {assignedAssets.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedAssets.map((ast) => (
                              <span
                                key={ast.id}
                                className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#f4f2ea] text-[#2c3d38] border border-[#e2ded2]"
                              >
                                <Box className="w-3 h-3 mr-1 text-[#1c372e]" />
                                {ast.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-[#8a9994]">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-xs font-medium text-[#5a6b66]">
                        <div className="flex items-center">
                          <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                          <span>{assignedAssets.length > 0 ? `${assignedAssets.length} asset(s) assigned` : 'Available'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditPersonClick(person)}
                            title="Edit person"
                            className="p-1.5 rounded-lg text-[#7c8f89] hover:text-[#1c2826] hover:bg-[#f0eee6] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeletePersonClick(person.id)}
                            title="Delete person"
                            className="p-1.5 rounded-lg text-[#7c8f89] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
