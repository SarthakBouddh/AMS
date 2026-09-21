import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, CheckCircle2, AlertCircle, Car, Monitor, Video, ShieldCheck, Laptop, Building, X } from 'lucide-react';

export default function ResourceBookingPage() {
  const [resources, setResources] = useState([
    {
      id: 'res-1',
      name: 'Conference Room Alpha',
      type: 'MEETING_ROOM',
      location: 'Mumbai - 3rd Floor',
      capacityInfo: '12 Seats · 4K Display · Video Con',
      status: 'AVAILABLE',
      specifications: 'Polycom VC, Whiteboard, HDMI/USB-C'
    },
    {
      id: 'res-2',
      name: 'Projector 4K Portable',
      type: 'PROJECTOR',
      location: 'Mumbai - IT Desk',
      capacityInfo: '3000 Lumens · Wireless Cast',
      status: 'RESERVED',
      specifications: 'Epson Pro Cinema, Battery Backup 3h'
    },
    {
      id: 'res-3',
      name: 'Company EV Vehicle #04',
      type: 'VEHICLE',
      location: 'Mumbai Parking Slot B-12',
      capacityInfo: '5 Seater SUV · 420km Range',
      status: 'AVAILABLE',
      specifications: 'Tesla Model Y Long Range'
    },
    {
      id: 'res-4',
      name: 'iOS Testing Device Rig (iPhone 15 Pro)',
      type: 'DEV_DEVICE',
      location: 'Bengaluru QA Lab',
      capacityInfo: 'iOS 17.4 · 256GB',
      status: 'AVAILABLE',
      specifications: 'Unlocked QA Device Pool'
    },
    {
      id: 'res-5',
      name: 'JetBrains All Products License Pool',
      type: 'SOFTWARE_LICENSE',
      location: 'Cloud Floating License',
      capacityInfo: '15 Active Seats Pool',
      status: 'AVAILABLE',
      specifications: 'IntelliJ, PyCharm, WebStorm Enterprise'
    }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 'bk-101',
      resourceId: 'res-1',
      resourceName: 'Conference Room Alpha',
      employeeName: 'Rahul Sharma',
      date: '2026-09-09',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      purpose: 'Sprint Planning & Architecture Sync',
      status: 'CONFIRMED'
    },
    {
      id: 'bk-102',
      resourceId: 'res-2',
      resourceName: 'Projector 4K Portable',
      employeeName: 'Priya Nair',
      date: '2026-09-09',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      purpose: 'Client All-Hands Presentation',
      status: 'CONFIRMED'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    purpose: ''
  });

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
    const matchesSearch = !query || res.name.toLowerCase().includes(query) || res.location.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'ALL' || res.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!selectedResource) return;

    const bookingEntry = {
      id: 'bk-' + Date.now(),
      resourceId: selectedResource.id,
      resourceName: selectedResource.name,
      employeeName: 'Mara Singh',
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      purpose: newBooking.purpose || 'Company Business Meeting',
      status: 'CONFIRMED'
    };

    setBookings([bookingEntry, ...bookings]);
    setIsBookModalOpen(false);
    setSelectedResource(null);
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
            Resource booking & availability
          </h1>
          <p className="text-sm text-[#61716c] mt-1">
            Reserve meeting rooms, company vehicles, projectors, dev test devices, and software licenses.
          </p>
        </div>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${selectedCategory === cat
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
        {filteredResources.map((res) => (
          <div key={res.id} className="bg-white p-6 rounded-2xl border border-[#eae7de] card-shadow flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-[#f4f2ea] border border-[#e2ded2]">
                  {getCategoryIcon(res.type)}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${res.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                  {res.status}
                </span>
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

            <div className="mt-6 pt-4 border-t border-[#f0eee6]">
              <button
                onClick={() => {
                  setSelectedResource(res);
                  setIsBookModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1c372e] text-white text-xs font-bold hover:bg-[#142a23] shadow transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 mr-2 text-[#f4c453]" />
                <span>Reserve / Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Schedule Timeline Table */}
      <div className="bg-white rounded-2xl border border-[#eae7de] card-shadow overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-[#f0eee6] bg-[#fcfbf7] flex items-center justify-between">
          <h3 className="font-heading text-base font-extrabold text-[#1c2826]">Active Bookings & Schedule</h3>
          <span className="text-xs font-mono font-bold text-[#788883] uppercase">PREVENTS OVERLAPPING SLOTS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f0eee6] text-[11px] font-mono font-bold text-[#73827d] uppercase bg-[#faf9f4]">
                <th className="py-3 px-6">RESOURCE</th>
                <th className="py-3 px-4">RESERVED BY</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">TIME SLOT</th>
                <th className="py-3 px-4">PURPOSE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f3eb]">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#fcfbf7]">
                  <td className="py-3.5 px-6 font-bold text-[#1c2826]">{b.resourceName}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#3d4f49]">{b.employeeName}</td>
                  <td className="py-3.5 px-4 font-mono">{b.date}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1c372e]">{b.startTime} - {b.endTime}</td>
                  <td className="py-3.5 px-4 text-[#61716c]">{b.purpose}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Book Resource Slot */}
      {isBookModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#788883]">RESERVE RESOURCE</span>
                <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">{selectedResource.name}</h3>
              </div>
              <button onClick={() => setIsBookModalOpen(false)} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Booking Date</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#475752] mb-1">Purpose / Notes</label>
                <textarea
                  value={newBooking.purpose}
                  onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                  placeholder="e.g. Client presentation meeting"
                  className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-sm h-20"
                  required
                />
              </div>

              <div className="pt-4 border-t border-[#eae7de] flex justify-end space-x-3">
                <button type="button" onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eae7de]">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f4c453] text-[#1c372e]">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
