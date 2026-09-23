import React, { useState, useEffect } from 'react';
import { X, Box, Tag, DollarSign, MapPin, User, FileText } from 'lucide-react';

export default function AddAssetModal({ isOpen, onClose, onSave, editingAsset, employees = [], vendors = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    category: 'Hardware',
    status: 'Available',
    location: 'Mumbai office',
    ownerId: '',
    ownerName: 'Unassigned',
    vendorId: '',
    vendorName: '',
    value: '',
    condition: 'Good',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiryDate: '',
    warrantyType: '1 Year Manufacturer',
    notes: ''
  });

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name || '',
        assetTag: editingAsset.assetTag || '',
        category: editingAsset.category || 'Hardware',
        status: editingAsset.status || 'Available',
        location: editingAsset.location || 'Mumbai office',
        ownerId: editingAsset.ownerId || '',
        ownerName: editingAsset.ownerName || 'Unassigned',
        vendorId: editingAsset.vendorId || '',
        vendorName: editingAsset.vendorName || '',
        value: editingAsset.value ? String(editingAsset.value) : '',
        condition: editingAsset.condition || 'Good',
        serialNumber: editingAsset.serialNumber || '',
        purchaseDate: editingAsset.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiryDate: editingAsset.warrantyExpiryDate || '',
        warrantyType: editingAsset.warrantyType || '1 Year Manufacturer',
        notes: editingAsset.notes || ''
      });
    } else {
      const randomTag = 'AST-' + Math.floor(1000 + Math.random() * 9000);
      const today = new Date();
      const defaultExpiry = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
      setFormData({
        name: '',
        assetTag: randomTag,
        category: 'Hardware',
        status: 'Available',
        location: 'Mumbai office',
        ownerId: '',
        ownerName: 'Unassigned',
        vendorId: '',
        vendorName: '',
        value: '',
        condition: 'Good',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiryDate: defaultExpiry,
        warrantyType: '1 Year Manufacturer',
        notes: ''
      });
    }
  }, [editingAsset, isOpen]);

  if (!isOpen) return null;

  const handleOwnerChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === 'unassigned') {
      setFormData(prev => ({ ...prev, ownerId: '', ownerName: 'Unassigned', status: prev.status === 'Assigned' ? 'Available' : prev.status }));
    } else {
      const emp = employees.find(e => e.id === selectedId);
      if (emp) {
        setFormData(prev => ({ ...prev, ownerId: emp.id, ownerName: emp.name, status: 'Assigned' }));
      }
    }
  };

  const handleVendorChange = (e) => {
    const vId = e.target.value;
    if (!vId) {
      setFormData(prev => ({ ...prev, vendorId: '', vendorName: '' }));
    } else {
      const v = vendors.find(item => item.id === vId);
      if (v) {
        setFormData(prev => ({ ...prev, vendorId: v.id, vendorName: v.name }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: parseFloat(formData.value) || 0.0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#e3efe9] text-[#1c372e] flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#788883] hover:text-[#1c2826] hover:bg-[#f0eee6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Asset Name & Tag */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. MacBook Pro 14-inch"
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Asset Tag
              </label>
              <input
                type="text"
                value={formData.assetTag}
                onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                placeholder="AST-1842"
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
                required
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Furniture">Furniture</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          {/* Location & Owner Assignment */}
          <div className="grid grid-cols-2 gap-3">
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
                <option value="Cloud">Cloud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Assign to Owner
              </label>
              <select
                value={formData.ownerId || 'unassigned'}
                onChange={handleOwnerChange}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="unassigned">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchased From Vendor / Supplier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Purchased From Vendor / Supplier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={formData.vendorId || ''}
                onChange={handleVendorChange}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="">-- Select Registered Vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category || 'General'}) {v.phone ? `· ${v.phone}` : ''}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                placeholder="Or type custom vendor name"
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              />
            </div>
          </div>

          {/* Value & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Value ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="1899.00"
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Serial Number & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="SN-892401"
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              />
            </div>
          </div>

          {/* Warranty Expiry Date & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Warranty Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.warrantyExpiryDate}
                onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
                Warranty Coverage Type
              </label>
              <select
                value={formData.warrantyType}
                onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
              >
                <option value="1 Year Manufacturer">1 Year Manufacturer</option>
                <option value="2 Year Extended">2 Year Extended</option>
                <option value="3 Year AppleCare+">3 Year AppleCare+</option>
                <option value="Lifetime Warranty">Lifetime Warranty</option>
                <option value="Third-Party AMC">Third-Party AMC</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Primary workstation details or remarks..."
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
              {editingAsset ? 'Save Changes' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
