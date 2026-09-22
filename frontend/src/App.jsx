import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import OverviewPage from './components/OverviewPage';
import AssetInventoryPage from './components/AssetInventoryPage';
import PeopleDirectoryPage from './components/PeopleDirectoryPage';
import ResourceBookingPage from './components/ResourceBookingPage';
import RequestsPage from './components/RequestsPage';
import MaintenancePage from './components/MaintenancePage';
import WarrantyPage from './components/WarrantyPage';
import AuditTrailPage from './components/AuditTrailPage';
import ReportsPage from './components/ReportsPage';
import SuperAdminPortal from './components/SuperAdminPortal';
import AddAssetModal from './components/AddAssetModal';
import AddPersonModal from './components/AddPersonModal';
import AssignModal from './components/AssignModal';

import { api } from './api';
import { INITIAL_ASSETS, INITIAL_EMPLOYEES, INITIAL_ACTIVITIES } from './initialData';

const TAB_TO_ROUTE = {
  overview: '/overview',
  assets: '/assets',
  people: '/people',
  resources: '/resources',
  requests: '/requests',
  maintenance: '/maintenance',
  warranty: '/warranty',
  audit: '/audit',
  reports: '/reports',
  superadmin: '/superadmin',
};

const ROUTE_ALIASES = {
  '/asset': '/assets',
};

const ROUTE_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_ROUTE).map(([tab, route]) => [route, tab])
);

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ams_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isEmployeeRole = (role = '') => {
    const normalizedRole = (role || '').toLowerCase();
    return normalizedRole.includes('employee')
      || normalizedRole.includes('engineer')
      || normalizedRole.includes('developer')
      || normalizedRole.includes('support')
      || normalizedRole.includes('operations');
  };

  const location = useLocation();
  const navigate = useNavigate();
  const normalizedPath = ROUTE_ALIASES[location.pathname] || location.pathname;

  // Navigation tab state: 'superadmin' | 'overview' | 'assets' | 'people' | 'resources' | 'requests' | 'maintenance' | 'warranty' | 'audit' | 'reports'
  const activeTab = ROUTE_TO_TAB[normalizedPath] || 'overview';

  const setActiveTab = (tab) => {
    const route = TAB_TO_ROUTE[tab] || '/overview';
    navigate(route);
  };

  // Core Data
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [peopleSearch, setPeopleSearch] = useState('');

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState(null);

  // Load backend data scoped to logged-in user's tenant company
  const loadData = async () => {
    if (!currentUser || currentUser.superAdmin) return;
    const tenantId = currentUser.companyId || 'comp-northstar';

    try {
      const assetsData = await api.getAssets(searchTerm, statusFilter, categoryFilter, tenantId);
      if (assetsData) setAssets(assetsData);

      const empData = await api.getEmployees(peopleSearch, tenantId);
      if (empData) setEmployees(empData);

      const statsData = await api.getDashboardStats(tenantId);
      if (statsData) setDashboardStats(statsData);
    } catch (e) {
      console.warn('API sync issue, using local state fallback');
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    if (location.pathname === '/asset') {
      navigate('/assets', { replace: true });
      return;
    }

    if (currentUser.superAdmin) {
      if (location.pathname !== '/superadmin') {
        navigate('/superadmin', { replace: true });
      }
      return;
    }

    const protectedEmployeeRoutes = ['/assets', '/people', '/resources', '/maintenance', '/warranty', '/audit', '/reports'];
    if (isEmployeeRole(currentUser.role) && protectedEmployeeRoutes.includes(location.pathname)) {
      navigate('/overview', { replace: true });
      return;
    }

    if (!location.pathname || location.pathname === '/' || location.pathname === '/login') {
      navigate('/overview', { replace: true });
      return;
    }

    loadData();
  }, [currentUser, location.pathname, searchTerm, statusFilter, categoryFilter, peopleSearch]);

  const handleLoginSuccess = (userResponse) => {
    const userData = {
      id: userResponse.id,
      name: userResponse.name,
      email: userResponse.email,
      role: userResponse.role || 'Operations lead',
      department: userResponse.department || 'Operations',
      initials: userResponse.initials || 'MS',
      companyId: userResponse.companyId || 'comp-northstar',
      companyName: userResponse.companyName || 'Northstar Studio',
      superAdmin: userResponse.superAdmin || false
    };
    setCurrentUser(userData);
    localStorage.setItem('ams_user', JSON.stringify(userData));

    if (userData.superAdmin) {
      navigate('/superadmin', { replace: true });
    } else {
      navigate('/overview', { replace: true });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ams_user');
    navigate('/');
  };

  // Asset Handlers
  const handleSaveAsset = async (assetData) => {
    const userName = currentUser?.name || 'Mara Singh';
    const tenantId = currentUser?.companyId || 'comp-northstar';
    const userId = currentUser?.id || null;

    if (editingAsset) {
      const updated = await api.updateAsset(editingAsset.id, { ...assetData, companyId: tenantId }, userName, userId);
      if (updated) {
        setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...assetData } : a));
      }
    } else {
      const created = await api.createAsset({ ...assetData, companyId: tenantId }, userName, tenantId, userId);
      if (created) {
        setAssets(prev => [created, ...prev]);
      } else {
        const newAsset = {
          id: 'ast-' + Date.now(),
          companyId: tenantId,
          ...assetData
        };
        setAssets(prev => [newAsset, ...prev]);
      }
    }
    setEditingAsset(null);
    loadData();
  };

  const handleAssignAssetConfirm = async (assetId, employeeId) => {
    const userName = currentUser?.name || 'Mara Singh';
    const userId = currentUser?.id || null;
    const updated = await api.assignAsset(assetId, employeeId, userName, userId);

    let empName = 'Unassigned';
    let newStatus = 'Available';

    if (employeeId && employeeId !== 'unassigned') {
      const emp = employees.find(e => e.id === employeeId);
      if (emp) {
        empName = emp.name;
        newStatus = 'Assigned';
      }
    }

    if (updated) {
      setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
    } else {
      setAssets(prev => prev.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            ownerId: employeeId === 'unassigned' ? null : employeeId,
            ownerName: empName,
            status: newStatus
          };
        }
        return a;
      }));
    }
    loadData();
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to remove this asset?')) return;
    const userName = currentUser?.name || 'Mara Singh';
    const userId = currentUser?.id || null;
    await api.deleteAsset(assetId, userName, userId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    loadData();
  };

  // Person Handlers
  const handleSavePerson = async (personData) => {
    const userName = currentUser?.name || 'Mara Singh';
    const tenantId = currentUser?.companyId || 'comp-northstar';

    if (editingPerson) {
      const updated = await api.updateEmployee(editingPerson.id, { ...personData, companyId: tenantId });
      if (updated) {
        setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        setEmployees(prev => prev.map(e => e.id === editingPerson.id ? { ...e, ...personData } : e));
      }
    } else {
      const created = await api.createEmployee({ ...personData, companyId: tenantId }, userName, tenantId);
      if (created) {
        setEmployees(prev => [created, ...prev]);
      } else {
        const newPerson = {
          id: 'emp-' + Date.now(),
          companyId: tenantId,
          ...personData
        };
        setEmployees(prev => [newPerson, ...prev]);
      }
    }
    setEditingPerson(null);
    loadData();
  };

  const handleDeletePerson = async (personId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    await api.deleteEmployee(personId);
    setEmployees(prev => prev.filter(e => e.id !== personId));
    loadData();
  };

  const computedStats = () => {
    if (dashboardStats) return dashboardStats;

    const total = assets.length;
    const available = assets.filter(a => a.status === 'Available' || a.status === 'AVAILABLE').length;
    const assigned = assets.filter(a => a.status === 'Assigned' || a.status === 'ASSIGNED' || a.status === 'IN_USE').length;
    const maintenance = assets.filter(a => a.status === 'Maintenance' || a.status === 'UNDER_MAINTENANCE').length;
    const utilRate = total > 0 ? Math.round((assigned / total) * 100) : 0;
    const portfolioVal = assets.reduce((acc, a) => acc + (a.value || 0), 0);

    const catVal = {};
    const catCount = {};
    assets.forEach(a => {
      catVal[a.category] = (catVal[a.category] || 0) + (a.value || 0);
      catCount[a.category] = (catCount[a.category] || 0) + 1;
    });

    return {
      totalAssets: total,
      availableAssets: available,
      utilizationRate: utilRate,
      assignedCount: assigned,
      portfolioValue: portfolioVal,
      needsAttentionCount: maintenance,
      categoryCount: catCount,
      categoryValue: catVal,
      recentActivities: activities
    };
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f9f8f3] text-[#1c2826] font-sans antialiased">
      <div className="h-screen flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <Navbar user={currentUser} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/superadmin" element={<SuperAdminPortal />} />
            <Route path="/overview" element={
              <OverviewPage
                stats={computedStats()}
                currentUser={currentUser}
                onAddAssetClick={() => {
                  setEditingAsset(null);
                  setIsAssetModalOpen(true);
                }}
                onAddRequestClick={() => setActiveTab('requests')}
                onViewInventoryClick={() => setActiveTab('assets')}
              />
            } />
            <Route path="/asset" element={<Navigate to="/assets" replace />} />
            <Route path="/assets" element={
              <AssetInventoryPage
                assets={assets}
                employees={employees}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                onAddAssetClick={() => {
                  setEditingAsset(null);
                  setIsAssetModalOpen(true);
                }}
                onEditAssetClick={(asset) => {
                  setEditingAsset(asset);
                  setIsAssetModalOpen(true);
                }}
                onAssignAssetClick={(asset) => {
                  setAssigningAsset(asset);
                  setIsAssignModalOpen(true);
                }}
                onDeleteAssetClick={handleDeleteAsset}
              />
            } />
            <Route path="/people" element={
              <PeopleDirectoryPage
                employees={employees}
                assets={assets}
                searchTerm={peopleSearch}
                setSearchTerm={setPeopleSearch}
                onAddPersonClick={() => {
                  setEditingPerson(null);
                  setIsPersonModalOpen(true);
                }}
                onEditPersonClick={(person) => {
                  setEditingPerson(person);
                  setIsPersonModalOpen(true);
                }}
                onDeletePersonClick={handleDeletePerson}
              />
            } />
            <Route path="/resources" element={<ResourceBookingPage />} />
            <Route path="/requests" element={<RequestsPage currentUser={currentUser} assets={assets} />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/warranty" element={<WarrantyPage assets={assets} />} />
            <Route path="/audit" element={<AuditTrailPage currentUser={currentUser} />} />
            <Route path="/reports" element={<ReportsPage assets={assets} stats={computedStats()} />} />
            <Route path="*" element={<Navigate to={currentUser?.superAdmin ? '/superadmin' : '/overview'} replace />} />
          </Routes>
        </main>
      </div>

      <AddAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        employees={employees}
      />

      <AddPersonModal
        isOpen={isPersonModalOpen}
        onClose={() => {
          setIsPersonModalOpen(false);
          setEditingPerson(null);
        }}
        onSave={handleSavePerson}
        editingPerson={editingPerson}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssigningAsset(null);
        }}
        asset={assigningAsset}
        employees={employees}
        onAssignConfirm={handleAssignAssetConfirm}
      />
    </div>
  );
}
