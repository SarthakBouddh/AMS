import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddPersonModal({ isOpen, onClose, onSave, editingPerson }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    role: 'Software Engineer',
    location: 'Mumbai office',
    status: 'Available for assignment'
  });

  useEffect(() => {
    if (editingPerson) {
      setFormData({
        name: editingPerson.name || '',
        email: editingPerson.email || '',
        department: editingPerson.department || 'Engineering',
        role: editingPerson.role || 'Software Engineer',
        location: editingPerson.location || 'Mumbai office',
        status: editingPerson.status || 'Available for assignment'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Engineering',
        role: 'Software Engineer',
        location: 'Mumbai office',
        status: 'Available for assignment'
      });
    }
  }, [editingPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const initials = formData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'EM';

    onSave({
      ...formData,
      initials
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
              {editingPerson ? 'Edit Person' : 'Add Person'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#788883] hover:text-[#1c2826] hover:bg-[#f0eee6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Maya Patel"
              className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. maya.patel@northstar.co"
              className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="Mumbai office">Mumbai office</option>
                <option value="Bengaluru office">Bengaluru office</option>
                <option value="Delhi office">Delhi office</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Role Title
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Lead Product Designer"
              className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            />
          </div>

          {/* Action Buttons */}
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
              {editingPerson ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
