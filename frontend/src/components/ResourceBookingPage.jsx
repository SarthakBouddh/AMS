import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, CheckCircle2, AlertCircle, Car, Monitor, Video, ShieldCheck, Laptop, Building, X, Unlock, Edit3, Trash2, Sliders, Check } from 'lucide-react';
import { api } from '../api';

export default function ResourceBookingPage({ currentUser, companyId }) {
  const userRole = (currentUser?.role || '').toLowerCase();
  const isAdmin = currentUser?.superAdmin || 
                  userRole.includes('admin') || 
                  userRole.includes('director') || 
                  userRole.includes('head') || 
                  userRole.includes('operations');

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  
  const [selectedResource, setSelectedResource] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  // Form states for Resource creation / edit
  const [resourceFormData, setResourceFormData] = useState({
    name: '',
    type: 'MEETING_ROOM',
    location: 'Floor 2, Mumbai office',
    capacityInfo: 'Seats 10 people',
    specifications: 'High-speed Wi-Fi, 4K Screen, Polycom Audio',
    status: 'AVAILABLE'
  });

  // Form state for Booking
  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    purpose: '',
    employeeName: currentUser?.name || 'Mara Singh'
  });

  const loadData = async () => {
    const fetchedRes = await api.getResources('ALL', '', companyId);
    setResources(fetchedRes || []);

    const fetchedBookings = await api.getBookings(companyId);
    setBookings(fetchedBookings || []);
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'MEETING_ROOM': return <Building className="w-5 h-5 text-emerald-800" />;
      case 'PROJECTOR': return <Video className="w-5 h-5 text-amber-800" />;
      case 'VEHICLE': return <Car className="w-5 h-5 text-blue-800" />;
      case 'DEV_DEVICE': return <Laptop className="w-5 h-5 text-purple-800" />;
      default: return <ShieldCheck className="w-5 h-5 text-cyan-800" />;
    }
  };

  const filteredResources = resources.filter(res => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || res.name.toLowerCase().includes(query) || res.location.toLowerCase().includes(query) || (res.specifications && res.specifications.toLowerCase().includes(query));
    const matchesCategory = selectedCategory === 'ALL' || res.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Add Resource Modal
  const handleOpenAddResource = () => {
    setEditingResource(null);
    setResourceFormData({
      name: '',
      type: 'MEETING_ROOM',
      location: 'Floor 2, Mumbai office',
      capacityInfo: 'Seats 10 people',
      specifications: 'High-speed Wi-Fi, 4K Display',
      status: 'AVAILABLE'
    });
    setIsResourceModalOpen(true);
  };

  // Open Edit Resource Modal
  const handleOpenEditResource = (res) => {
    setEditingResource(res);
    setResourceFormData({
      name: res.name || '',
      type: res.type || 'MEETING_ROOM',
      location: res.location || '',
      capacityInfo: res.capacityInfo || '',
      specifications: res.specifications || '',
      status: res.status || 'AVAILABLE'
    });
    setIsResourceModalOpen(true);
  };

  // Save (Create or Update) Resource
  const handleSaveResource = async (e) => {
    e.preventDefault();

    if (editingResource) {
      // Update existing resource
      const updated = await api.updateResource(editingResource.id, resourceFormData, currentUser?.name || 'Admin');
      if (updated) {
        setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
      } else {
        setResources(prev => prev.map(r => r.id === editingResource.id ? { ...r, ...resourceFormData } : r));
      }
    } else {
      // Create new resource
      const created = await api.createResource(resourceFormData, currentUser?.name || 'Admin', companyId);
      if (created) {
        setResources(prev => [created, ...prev]);
      } else {
        const newRes = {
          id: 'res-' + Date.now(),
          companyId,
          ...resourceFormData
        };
        setResources(prev => [newRes, ...prev]);
      }
    }

    setIsResourceModalOpen(false);
    setEditingResource(null);
    loadData();
  };

  // Delete Resource
  const handleDeleteResource = async (resourceId, resourceName) => {
    if (!window.confirm(`Are you sure you want to delete shared resource "${resourceName}"?`)) return;

    await api.deleteResource(resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
    loadData();
  };

  // Create Booking / Allocation
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedResource) return;

    const bookingPayload = {
      resourceId: selectedResource.id,
      resourceName: selectedResource.name,
      employeeName: newBooking.employeeName || currentUser?.name || 'Mara Singh',
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      purpose: newBooking.purpose || 'Company Business Meeting',
      status: 'CONFIRMED'
    };

    const result = await api.createBooking(bookingPayload, currentUser?.name || 'Employee', companyId);

    const bookingEntry = result || {
      id: 'bk-' + Date.now(),
      ...bookingPayload
    };

    setBookings([bookingEntry, ...bookings]);
    setResources(prev => prev.map(r => r.id === selectedResource.id ? { ...r, status: 'RESERVED' } : r));
    setIsBookModalOpen(false);
    setSelectedResource(null);
    loadData();
  };

  // Deallocate / Free Booking
  const handleFreeBooking = async (bookingId, resourceId, resourceName) => {
    if (!window.confirm(`Are you sure you want to free the booked resource "${resourceName || 'Resource'}"? This will return the slot to AVAILABLE.`)) return;

    await api.freeBooking(bookingId, currentUser?.name || 'Employee');

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'RELEASED' } : b));
    setResources(prev => prev.map(r => (r.id === resourceId || r.name === resourceName) ? { ...r, status: 'AVAILABLE' } : r));
    loadData();
  };

  const handleFreeResourceDirect = async (resource) => {
    const activeBooking = bookings.find(b => (b.resourceId === resource.id || b.resourceName === resource.name) && b.status === 'CONFIRMED');
    const bookingId = activeBooking ? activeBooking.id : 'temp-free';

    if (!window.confirm(`Are you sure you want to free "${resource.name}" and release its booking?`)) return;

    if (activeBooking) {
      await api.freeBooking(bookingId, currentUser?.name || 'Employee');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'RELEASED' } : b));
    }
    setResources(prev => prev.map(r => r.id === resource.id ? { ...r, status: 'AVAILABLE' } : r));
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold tracking-widest text-[#788883] uppercase">
            SHARED COMPANY INFRASTRUCTURE
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-[#1c2826] tracking-tight mt-1">
            Resource Booking & Lifecycle Manager
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Create, modify, allocate, and release meeting rooms, company vehicles, test hardware, and shared tools.
          </p>
        </div>

        {/* Add Resource Action Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={handleOpenAddResource}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow-md transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2 text-[#f4c453]" />
            <span>Add New Shared Resource</span>
          </button>
        )}
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#eae7de] card-shadow flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#869590]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by name, location or specs..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf7] border border-[#e2ded2] rounded-xl text-sm text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'MEETING_ROOM', 'PROJECTOR', 'VEHICLE', 'DEV_DEVICE', 'SOFTWARE_LICENSE'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1c372e] text-white border-[#1c372e]'
                  : 'bg-[#fcfbf7] text-[#556661] border-[#e2ded2] hover:bg-[#f0eee6]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Shared Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#eae7de]">
            <Building className="w-10 h-10 text-[#889993] mx-auto mb-2" />
            <p className="font-bold text-[#1c2826]">No shared resources found</p>
            <p className="text-xs text-[#61716c] mt-1">Click "Add New Shared Resource" to register company assets.</p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#f4f2ea] border border-[#e2ded2]">
                    {getCategoryIcon(res.type)}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditResource(res)}
                          title="Edit / Modify Resource"
                          className="p-1.5 text-[#556661] hover:text-[#1c372e] hover:bg-[#f0eee6] rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.name)}
                          title="Delete Resource"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      res.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">{res.name}</h3>
                <p className="text-xs font-mono text-[#61716c] mt-0.5">{res.location}</p>
                <p className="text-xs font-semibold text-[#1c372e] bg-[#f4f2ea] px-2.5 py-1 rounded-lg mt-3 inline-block">
                  {res.capacityInfo}
                </p>

                <p className="text-xs text-[#788883] mt-3 pt-3 border-t border-[#f0eee6]">
                  <span className="font-bold text-[#1c2826]">Specs:</span> {res.specifications}
                </p>
              </div>

              {/* Action Buttons: Allocate / Deallocate */}
              <div className="mt-6 pt-4 border-t border-[#f0eee6] flex items-center space-x-2">
                {res.status === 'RESERVED' ? (
                  <button
                    onClick={() => handleFreeResourceDirect(res)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm"
                  >
                    <Unlock className="w-3.5 h-3.5 mr-2 text-amber-700" />
                    <span>Deallocate / Free Resource</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedResource(res);
                      setNewBooking({
                        date: new Date().toISOString().split('T')[0],
                        startTime: '11:00 AM',
                        endTime: '12:00 PM',
                        purpose: '',
                        employeeName: currentUser?.name || 'Mara Singh'
                      });
                      setIsBookModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-2 text-[#f4c453]" />
                    <span>Allocate / Book Slot</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Schedule & Allocation Table */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <h3 className="font-heading text-base font-extrabold text-[#1c2826]">Resource Allocations & Bookings</h3>
          <span className="text-xs font-mono font-bold text-[#788883] uppercase">PREVENTS CONFLICTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3 px-6">RESOURCE</th>
                <th className="py-3 px-4">ALLOCATED TO</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">TIME SLOT</th>
                <th className="py-3 px-4">PURPOSE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">DEALLOCATION ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-[#61716c]">
                    No active resource bookings or allocations found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#fcfbf7]">
                    <td className="py-3.5 px-6 font-bold text-[#1c2826]">{b.resourceName}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#3d4f49]">{b.employeeName}</td>
                    <td className="py-3.5 px-4 font-mono">{b.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1c372e]">{b.startTime} - {b.endTime}</td>
                    <td className="py-3.5 px-4 text-[#61716c]">{b.purpose}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => handleFreeBooking(b.id, b.resourceId, b.resourceName)}
                          title="Free this resource booking"
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 text-xs font-bold transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1.5 text-amber-800" />
                          <span>Deallocate / Free</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-gray-400">Released / Available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create / Edit Shared Resource */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#788883]">
                  {editingResource ? 'EDIT SHARED RESOURCE' : 'CREATE NEW SHARED RESOURCE'}
                </span>
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                  {editingResource ? editingResource.name : 'Add Infrastructure Resource'}
                </h3>
              </div>
              <button onClick={() => setIsResourceModalOpen(false)} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={resourceFormData.name}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, name: e.target.value })}
                  placeholder="e.g. Executive Boardroom 402"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Resource Category</label>
                  <select
                    value={resourceFormData.type}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                  >
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="PROJECTOR">Projector / Screen</option>
                    <option value="VEHICLE">Company Vehicle</option>
                    <option value="DEV_DEVICE">Dev Test Device</option>
                    <option value="SOFTWARE_LICENSE">Software License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Location / Zone</label>
                  <input
                    type="text"
                    required
                    value={resourceFormData.location}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, location: e.target.value })}
                    placeholder="e.g. Floor 2, Mumbai HQ"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Capacity / Specs Info</label>
                  <input
                    type="text"
                    value={resourceFormData.capacityInfo}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, capacityInfo: e.target.value })}
                    placeholder="e.g. Seats 12 people"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Initial Status</label>
                  <select
                    value={resourceFormData.status}
                    onChange={(e) => setResourceFormData({ ...resourceFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-medium"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Detailed Specifications</label>
                <textarea
                  rows="3"
                  value={resourceFormData.specifications}
                  onChange={(e) => setResourceFormData({ ...resourceFormData, specifications: e.target.value })}
                  placeholder="e.g. Polycom Video Conferencing, Wireless Presenter, Whiteboard"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setIsResourceModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de] hover:bg-[#dedacb]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e] hover:bg-[#e5b642]">
                  {editingResource ? 'Update Resource' : 'Save Shared Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Allocate / Book Resource Slot */}
      {isBookModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#788883]">ALLOCATE RESOURCE</span>
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">{selectedResource.name}</h3>
              </div>
              <button onClick={() => setIsBookModalOpen(false)} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Allocate To Employee *</label>
                <input
                  type="text"
                  required
                  value={newBooking.employeeName}
                  onChange={(e) => setNewBooking({ ...newBooking, employeeName: e.target.value })}
                  placeholder="Employee Name"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Booking Date *</label>
                <input
                  type="date"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">End Time</label>
                  <input
                    type="text"
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                    placeholder="11:30 AM"
                    className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Purpose / Allocation Note</label>
                <textarea
                  value={newBooking.purpose}
                  onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                  placeholder="e.g. Executive Board Meeting"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm h-20"
                  required
                />
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
