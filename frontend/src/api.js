const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/api'
  : 'http://localhost:8080/api';

export const api = {
  // Auth
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend API offline, using fallback login auth');
    }

    // Super Admin Fallback
    if (credentials.email === 'superadmin@quantworks.com' && credentials.password === 'superadmin123') {
      return {
        success: true,
        message: 'Super Admin Login Successful',
        token: 'superadmin-token-999',
        id: 'user-superadmin',
        companyId: 'SYSTEM',
        companyName: 'System Governance',
        name: 'Super Admin',
        email: 'superadmin@quantworks.com',
        role: 'SUPER_ADMIN',
        department: 'Executive',
        initials: 'SA',
        superAdmin: true
      };
    }

    return { success: false, message: 'Invalid credentials' };
  },

  // Multi-Tenant Company Management (Super Admin)
  getCompanies: async (search = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE_URL}/companies?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using demo companies fallback');
    }
    return null;
  },

  createCompany: async (companyData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateCompany: async (id, companyData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteCompany: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  // Company Credentials / Users Management (Super Admin)
  getCompanyUsers: async (companyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createCompanyUser: async (companyId, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateCompanyUser: async (companyId, userId, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteCompanyUser: async (companyId, userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  // Assets (Tenant Aware)
  getAssets: async (search = '', status = 'All', category = 'All', companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'All') params.append('status', status);
      if (category && category !== 'All') params.append('category', category);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/assets?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createAsset: async (assetData, currentUser, companyId, userId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);
      if (userId) params.append('userId', userId);

      const res = await fetch(`${API_BASE_URL}/assets?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateAsset: async (id, assetData, currentUser, userId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (userId) params.append('userId', userId);
      const res = await fetch(`${API_BASE_URL}/assets/${id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  assignAsset: async (id, employeeId, currentUser, userId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (userId) params.append('userId', userId);
      const res = await fetch(`${API_BASE_URL}/assets/${id}/assign?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  collectAsset: async (id, currentUser = 'Mara Singh', userId = null, returnDetails = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (userId) params.append('userId', userId);
      const res = await fetch(`${API_BASE_URL}/assets/${id}/collect?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnDetails),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteAsset: async (id, currentUser, userId = null) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (userId) params.append('userId', userId);
      const res = await fetch(`${API_BASE_URL}/assets/${id}?${params.toString()}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  getAssetAuditLogs: async (assetId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assets/${assetId}/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return [];
  },

  getAuditLogs: async (companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      const res = await fetch(`${API_BASE_URL}/audit-logs?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return [];
  },

  // Employees (Tenant Aware)
  getEmployees: async (search = '', companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/employees?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createEmployee: async (employeeData, currentUser, companyId) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateEmployee: async (id, employeeData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteEmployee: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  // Requests & Approvals
  getRequests: async (companyId = '', currentUser = null) => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      if (currentUser && typeof currentUser === 'object') {
        if (currentUser.id) params.append('userId', currentUser.id);
        if (currentUser.role) params.append('role', currentUser.role);
      }
      const res = await fetch(`${API_BASE_URL}/requests?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createRequest: async (requestData, currentUser, companyId) => {
    try {
      const userName = typeof currentUser === 'object' ? currentUser.name : (currentUser || 'Employee');
      const userId = typeof currentUser === 'object' ? currentUser.id : '';
      const userRole = typeof currentUser === 'object' ? currentUser.role : '';

      const params = new URLSearchParams();
      params.append('currentUser', userName || 'Employee');
      if (companyId) params.append('companyId', companyId);
      if (userId) params.append('userId', userId);
      if (userRole) params.append('currentUserRole', userRole);

      const res = await fetch(`${API_BASE_URL}/requests?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  approveManager: async (id, currentUser) => {
    try {
      const user = typeof currentUser === 'object' ? currentUser : { name: currentUser || 'Manager', role: 'Manager', id: '' };
      const params = new URLSearchParams();
      params.append('currentUser', user.name || 'Manager');
      if (user.id) params.append('userId', user.id);
      if (user.role) params.append('currentUserRole', user.role);

      const res = await fetch(`${API_BASE_URL}/requests/${id}/approve-manager?${params.toString()}`, {
        method: 'PUT',
      });

      if (res.ok) return await res.json();

      const errorText = await res.text();
      return { error: true, message: errorText || 'You are not allowed to approve this request.' };
    } catch (e) {
      console.error('API Error:', e);
      return { error: true, message: 'Approval request failed. Please try again.' };
    }
  },

  rejectManager: async (id, currentUser) => {
    try {
      const user = typeof currentUser === 'object' ? currentUser : { name: currentUser || 'Manager', role: 'Manager', id: '' };
      const params = new URLSearchParams();
      params.append('currentUser', user.name || 'Manager');
      if (user.id) params.append('userId', user.id);
      if (user.role) params.append('currentUserRole', user.role);

      const res = await fetch(`${API_BASE_URL}/requests/${id}/reject-manager?${params.toString()}`, {
        method: 'PUT',
      });

      if (res.ok) return await res.json();

      const errorText = await res.text();
      return { error: true, message: errorText || 'You are not allowed to reject this request.' };
    } catch (e) {
      console.error('API Error:', e);
      return { error: true, message: 'Rejection request failed. Please try again.' };
    }
  },

  allocateAdmin: async (id, currentUser, allocationDetails = null) => {
    try {
      const user = typeof currentUser === 'object' ? currentUser : { name: currentUser || 'Admin', role: 'Admin', id: '' };
      const params = new URLSearchParams();
      params.append('currentUser', user.name || 'Admin');
      if (user.id) params.append('userId', user.id);
      if (user.role) params.append('currentUserRole', user.role);

      const res = await fetch(`${API_BASE_URL}/requests/${id}/allocate-admin?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocationDetails || {}),
      });

      if (res.ok) return await res.json();

      const errorText = await res.text();
      return { error: true, message: errorText || 'You are not allowed to allocate this request.' };
    } catch (e) {
      console.error('API Error:', e);
      return { error: true, message: 'Allocation request failed. Please try again.' };
    }
  },

  // Dashboard Stats (Tenant Aware)
  getDashboardStats: async (companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      const res = await fetch(`${API_BASE_URL}/dashboard/stats?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  // Shared Resources & Bookings
  getResources: async (type = 'ALL', search = '', companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (type && type !== 'ALL') params.append('type', type);
      if (search) params.append('search', search);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/resources?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createResource: async (resourceData, currentUser = 'Admin', companyId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/resources?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteResource: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/resources/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  updateResource: async (id, resourceData, currentUser = 'Admin') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);

      const res = await fetch(`${API_BASE_URL}/resources/${id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  bulkCreateAssets: async (assetList, currentUser = 'Mara Singh', companyId = '', userId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);
      if (userId) params.append('userId', userId);

      const res = await fetch(`${API_BASE_URL}/assets/bulk?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetList),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  bulkCreateEmployees: async (employeeList, currentUser = 'Mara Singh', companyId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/employees/bulk?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeList),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  getBookings: async (companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      const res = await fetch(`${API_BASE_URL}/resources/bookings?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createBooking: async (bookingData, currentUser = 'Employee', companyId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/resources/bookings?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  freeBooking: async (bookingId, currentUser = 'Employee') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      const res = await fetch(`${API_BASE_URL}/resources/bookings/${bookingId}/free?${params.toString()}`, {
        method: 'PUT',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  // Maintenance Tickets
  getMaintenanceTickets: async (maintenanceType = '', status = '', search = '', companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (maintenanceType) params.append('maintenanceType', maintenanceType);
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/maintenance?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return null;
  },

  createMaintenanceTicket: async (ticketData, currentUser = 'Admin', companyId = '', userId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);
      if (userId) params.append('userId', userId);

      const res = await fetch(`${API_BASE_URL}/maintenance?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  resolveMaintenanceTicket: async (id, details = {}, currentUser = 'Admin', userId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (userId) params.append('userId', userId);

      const res = await fetch(`${API_BASE_URL}/maintenance/${id}/resolve?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteMaintenanceTicket: async (id, currentUser = 'Admin') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);

      const res = await fetch(`${API_BASE_URL}/maintenance/${id}?${params.toString()}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  // Vendor Management Endpoints
  getVendors: async (search = '', category = '', companyId = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/vendors?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline');
    }
    return [];
  },

  createVendor: async (vendorData, currentUser = 'Admin', companyId = '') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

      const res = await fetch(`${API_BASE_URL}/vendors?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateVendor: async (id, vendorData, currentUser = 'Admin') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);

      const res = await fetch(`${API_BASE_URL}/vendors/${id}?${params.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteVendor: async (id, currentUser = 'Admin') => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);

      const res = await fetch(`${API_BASE_URL}/vendors/${id}?${params.toString()}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  // Company Credentials API
  getCompanyUsers: async (companyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline getting company users');
    }
    return [];
  },

  createCompanyCredential: async (companyId, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  updateCompanyCredential: async (companyId, userId, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  resetCompanyUserPassword: async (companyId, userId, newPassword = '') => {
    try {
      const params = new URLSearchParams();
      if (newPassword) params.append('newPassword', newPassword);
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}/reset-password?${params.toString()}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  deleteCompanyCredential: async (companyId, userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  },

  restoreCompanyUser: async (companyId, userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}/restore`, {
        method: 'PUT',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API Error:', e);
    }
    return null;
  },

  permanentDeleteCompanyCredential: async (companyId, userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/${companyId}/users/${userId}/permanent`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
  }
};

export default api;
