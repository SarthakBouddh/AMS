import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, User, Building, Trash2, Edit, Tag, Star } from 'lucide-react';
import { api } from '../api';

export default function VendorsPage({ currentUser, companyId }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Hardware Supplier',
    rating: 'Preferred',
    notes: ''
  });

  const categories = [
    'All',
    'Hardware Supplier',
    'Software Provider',
    'Maintenance & Repair',
    'Furniture Supplier',
    'Office Supplies',
    'General'
  ];

  const loadVendors = async () => {
    setLoading(true);
    const data = await api.getVendors(searchTerm, selectedCategory, companyId);
    setVendors(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadVendors();
  }, [searchTerm, selectedCategory, companyId]);

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Hardware Supplier',
      rating: 'Preferred',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v) => {
    setEditingVendor(v);
    setFormData({
      name: v.name || '',
      contactPerson: v.contactPerson || '',
      email: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      category: v.category || 'Hardware Supplier',
      rating: v.rating || 'Preferred',
      notes: v.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter vendor name');

    if (editingVendor) {
      await api.updateVendor(editingVendor.id, formData, currentUser?.name || 'Admin');
    } else {
      await api.createVendor(formData, currentUser?.name || 'Admin', companyId);
    }
    setIsModalOpen(false);
    loadVendors();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove vendor "${name}"?`)) {
      await api.deleteVendor(id, currentUser?.name || 'Admin');
      loadVendors();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            SUPPLIER MANAGEMENT
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Vendor Directory & Goods Categories
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Store supplier phone numbers, contact details, goods category, and maintenance contacts.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-sm font-bold shadow-md hover:bg-[#142a23] transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#82918c]" />
          <input
            type="text"
            placeholder="Search vendor name, contact, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e] bg-[#faf9f5]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1c372e] text-white shadow-sm'
                  : 'bg-[#f0eee6] text-[#556661] hover:bg-[#e4e1d3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-[#61716c]">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#eae7de] card-shadow space-y-3">
          <Building className="w-12 h-12 text-[#a3b2ac] mx-auto" />
          <h3 className="font-heading text-lg font-bold text-[#1c2826]">No Vendors Registered Yet</h3>
          <p className="text-xs text-[#61716c] max-w-md mx-auto">
            Add your hardware suppliers, IT vendors, and maintenance technicians to link them directly with asset purchases and repair reports.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#f4c453] text-[#1c372e] text-xs font-bold hover:bg-[#d9a920]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between space-y-4 hover:border-[#c5c0b0] transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#e3efe9] text-[#1c372e] uppercase">
                      {v.category || 'General'}
                    </span>
                    <h3 className="font-heading text-xl font-extrabold text-[#1c2826] mt-2">{v.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    v.rating === 'Preferred'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : v.rating === 'Under Review'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {v.rating || 'Standard'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#556661]">
                  {v.contactPerson && (
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-[#788883] shrink-0" />
                      <span>{v.contactPerson}</span>
                    </div>
                  )}

                  {v.phone && (
                    <div className="flex items-center space-x-2 font-mono font-bold text-[#1c372e]">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <a href={`tel:${v.phone}`} className="hover:underline text-emerald-800">
                        {v.phone}
                      </a>
                    </div>
                  )}

                  {v.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#788883] shrink-0" />
                      <a href={`mailto:${v.email}`} className="hover:underline">
                        {v.email}
                      </a>
                    </div>
                  )}

                  {v.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#788883] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{v.address}</span>
                    </div>
                  )}
                </div>

                {v.notes && (
                  <p className="mt-3 text-[11px] text-[#788883] italic border-t border-[#f0eee6] pt-2">
                    "{v.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#f0eee6]">
                <button
                  onClick={() => handleOpenEditModal(v)}
                  className="p-2 text-[#556661] hover:bg-[#f4f2ea] rounded-xl transition-colors"
                  title="Edit Vendor"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id, v.name)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Vendor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#eae7de]">
            <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3">
              <h2 className="font-heading text-xl font-extrabold text-[#1c2826]">
                {editingVendor ? 'Edit Vendor Details' : 'Add New Supplier / Vendor'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1c2826] mb-1">Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Authorized Enterprise, Dell Technologies, Reliance Digital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c2826] mb-1">Goods Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                  >
                    <option value="Hardware Supplier">Hardware Supplier</option>
                    <option value="Software Provider">Software Provider</option>
                    <option value="Maintenance & Repair">Maintenance & Repair</option>
                    <option value="Furniture Supplier">Furniture Supplier</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1c2826] mb-1">Quality Rating / Status</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                  >
                    <option value="Preferred">Preferred Vendor</option>
                    <option value="Standard">Standard</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1c2826] mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1c2826] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar (Key Account Manager)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1c2826] mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="support@vendor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c2826] mb-1">Address</label>
                <textarea
                  rows="2"
                  placeholder="Office address or service center location"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1c2826] mb-1">Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. SLA 24h repair turnaround, 3-year warranty included"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#d8d3c5] focus:outline-none focus:border-[#1c372e]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#f0eee6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f0eee6] text-[#556661] font-bold hover:bg-[#e4e1d3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1c372e] text-white font-bold hover:bg-[#142a23]"
                >
                  {editingVendor ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
