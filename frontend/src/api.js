const API_BASE_URL = 'http://localhost:8080/api';

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

  createAsset: async (assetData, currentUser, companyId) => {
    try {
      const params = new URLSearchParams();
      params.append('currentUser', currentUser);
      if (companyId) params.append('companyId', companyId);

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

  updateAsset: async (id, assetData, currentUser) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assets/${id}?currentUser=${encodeURIComponent(currentUser)}`, {
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

  assignAsset: async (id, employeeId, currentUser) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assets/${id}/assign?currentUser=${encodeURIComponent(currentUser)}`, {
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

  deleteAsset: async (id, currentUser) => {
    try {
      const res = await fetch(`${API_BASE_URL}/assets/${id}?currentUser=${encodeURIComponent(currentUser)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API Error:', e);
    }
    return false;
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
  }
};
