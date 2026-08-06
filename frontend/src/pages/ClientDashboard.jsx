import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoleLabel, normalizeRole } from '../utils/roles';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './ClientManagement.css';
import axios from 'axios';
import { SERVER_URL } from '../utils/config';


// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


// Alert/Notification data
const mockAlerts = [
  { id: 1, type: 'success', message: 'Successfully processed 125 claims today', time: '2 hours ago' },
  { id: 2, type: 'warning', message: 'Upcoming deadline for appeal submissions', time: '5 hours ago' },
  { id: 3, type: 'info', message: 'New denial pattern detected in cardiology claims', time: '1 day ago' },
  { id: 4, type: 'error', message: 'Failed to connect to payer portal', time: '2 days ago' }
];

const ClientDashboard = () => {

  const { clientId } = useParams();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === 'dark';
  const pageClass = `profile-page w-full overflow-x-hidden ${isDark ? 'theme-dark text-white' : 'theme-light text-slate-900'}`;
  const portalMenuClass = isDark
    ? 'z-50 rounded-md border bg-[#1f232a] border-[#ffffff20] shadow-lg'
    : 'z-50 rounded-md border bg-white border-slate-200 shadow-lg';
  const portalMenuItemClass = isDark
    ? 'w-full text-left px-3 py-2 text-sm whitespace-normal text-gray-200 hover:bg-[#2a2f38]'
    : 'w-full text-left px-3 py-2 text-sm whitespace-normal text-slate-900 hover:bg-slate-100';
  const resolvedApiUrl = `${SERVER_URL}/api`;
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('client-management');
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedMetric, setSelectedMetric] = useState('denials');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isTenantDetailsOpen, setIsTenantDetailsOpen] = useState(false);
  const [tenantDetailsStartInEdit, setTenantDetailsStartInEdit] = useState(false);

  // Add these state variables at the main component level
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Move fetchUsersForClient function to the main component level
  const fetchUsersForClient = async () => {
    if (!clientId) return;

    try {
      setUsersLoading(true);
      const res = await axios.get(`${resolvedApiUrl}/clients/${clientId}/users`, { withCredentials: true });
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Move the useEffect here to fetch users
  useEffect(() => {
    if (activeTab === 'users' && client) {
      fetchUsersForClient();
    }
  }, [client, activeTab]);

  // Move all user-related functions to the main component level
  const handleUserSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const filteredUsers = searchKeyword.trim() === ''
    ? users
    : users.filter(user =>
      user.firstname?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchKeyword.toLowerCase())
    );

  const getUserInitials = (firstname, lastname) => {
    return `${firstname?.[0] || ''}${lastname?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (role) => {
    switch (normalizeRole(role)) {
      case 'internal-admin':
        return 'bg-purple-600';
      case 'manager':
        return 'bg-green-600';
      case 'executive':
        return 'bg-sky-600';
      case 'standard-user':
      default:
        return 'bg-gray-600';
    }
  };

  const formatLastLoginTime = (timestamp) => {
    if (!timestamp) return 'Never';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const handleDeleteUser = (userId) => {
    // Implement user deletion logic here
    console.log(`Delete user with ID: ${userId}`);
  };

  const handleEditUser = (user) => {
    // Implement user editing logic here
    console.log(`Edit user:`, user);
  };

  const CLIENT_TYPE_OPTIONS = [
    'Service Provider',
    'Hospital System',
    'Ambulatory Provider'
  ];
  const FACILITY_TYPE_OPTIONS = [
    'Hospital',
    'Clinic',
    'Specialty Center',
    'Rehabilitation Center',
    'Long-term Care',
    'Ambulatory Surgery Center',
    'Other'
  ];

  const [newTenant, setNewTenant] = useState({
    name: '',
    clientType: '',
    address: '',
    contact: '',
    email: '',
    status: 'Active'
  });
  const [isNewTenantTypeOpen, setIsNewTenantTypeOpen] = useState(false);
  const [isNewTenantStatusOpen, setIsNewTenantStatusOpen] = useState(false);
  const newTenantTypeButtonRef = useRef(null);
  const newTenantTypeMenuRef = useRef(null);
  const newTenantStatusButtonRef = useRef(null);
  const newTenantStatusMenuRef = useRef(null);
  const [newTenantTypeMenuStyle, setNewTenantTypeMenuStyle] = useState(null);
  const [newTenantStatusMenuStyle, setNewTenantStatusMenuStyle] = useState(null);

  useLayoutEffect(() => {
    if (!isNewTenantTypeOpen) {
      setNewTenantTypeMenuStyle(null);
      return;
    }
    const updateMenuPosition = () => {
      const button = newTenantTypeButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setNewTenantTypeMenuStyle({
        position: 'fixed',
        top: `${Math.round(rect.bottom + 6)}px`,
        left: `${Math.round(rect.left)}px`,
        width: `${Math.round(rect.width)}px`,
        maxWidth: '320px',
        minWidth: '220px'
      });
    };
    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isNewTenantTypeOpen]);

  useLayoutEffect(() => {
    if (!isNewTenantStatusOpen) {
      setNewTenantStatusMenuStyle(null);
      return;
    }
    const updateMenuPosition = () => {
      const button = newTenantStatusButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setNewTenantStatusMenuStyle({
        position: 'fixed',
        top: `${Math.round(rect.bottom + 6)}px`,
        left: `${Math.round(rect.left)}px`,
        width: `${Math.round(rect.width)}px`,
        maxWidth: '320px',
        minWidth: '180px'
      });
    };
    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [isNewTenantStatusOpen]);

  useEffect(() => {
    if (!isNewTenantTypeOpen && !isNewTenantStatusOpen) return;
    const handleOutsideClick = (event) => {
      const target = event.target;
      if (
        newTenantTypeButtonRef.current?.contains(target) ||
        newTenantTypeMenuRef.current?.contains(target) ||
        newTenantStatusButtonRef.current?.contains(target) ||
        newTenantStatusMenuRef.current?.contains(target)
      ) {
        return;
      }
      setIsNewTenantTypeOpen(false);
      setIsNewTenantStatusOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNewTenantTypeOpen, isNewTenantStatusOpen]);

  useEffect(() => {
    // Set loading state
    setLoading(true);

    const fetchClientData = async () => {
      try {
        const res = await axios.get(`${resolvedApiUrl}/clients/${clientId}`, { withCredentials: true });
        setClient(res.data);
      } catch (error) {
        console.error("Error fetching client data:", error);
        navigate('/clientmanagement', { replace: true });
      } finally {
        // Always turn off loading state when done
        setLoading(false);
      }
    };

    // Call the function
    fetchClientData();
  }, [clientId, navigate]);

  // Add this function to handle opening tenant details
  const openTenantDetails = (tenant, options = {}) => {
    navigate(`/client/${clientId}/tenant/${tenant.id}`, {
      state: { edit: Boolean(options.edit) }
    });
  };

  // Add this component at the end of your file, right before the final return
  const TenantDetailsModal = () => {
    const handleClose = () => {
      setIsTenantDetailsOpen(false);
    };
    const [facilityTab, setFacilityTab] = useState('facilities');
    const [isEditingTenant, setIsEditingTenant] = useState(tenantDetailsStartInEdit);
    const [isEditTenantTypeOpen, setIsEditTenantTypeOpen] = useState(false);
    const [isEditTenantStatusOpen, setIsEditTenantStatusOpen] = useState(false);
    const [editTenantForm, setEditTenantForm] = useState({
      name: '',
      clientType: '',
      address: '',
      contact: '',
      email: '',
      status: 'Active'
    });
    const [editingFacilityId, setEditingFacilityId] = useState(null);
    const [facilityEditForm, setFacilityEditForm] = useState({
      name: '',
      facilityType: '',
      address: '',
      taxId: '',
      npi: '',
      taxonomyCode: '',
      contact: '',
      email: ''
    });
    const [newFacility, setNewFacility] = useState({
      name: '',
      facilityType: '',
      address: '',
      taxId: '',
      npi: '',
      taxonomyCode: '',
      contact: '',
      email: ''
    });
    const prevTenantIdRef = useRef(null);
    const editTenantTypeButtonRef = useRef(null);
    const editTenantTypeMenuRef = useRef(null);
    const editTenantStatusButtonRef = useRef(null);
    const editTenantStatusMenuRef = useRef(null);
    const [editTenantTypeMenuStyle, setEditTenantTypeMenuStyle] = useState(null);
    const [editTenantStatusMenuStyle, setEditTenantStatusMenuStyle] = useState(null);
    const editInputClass = "w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]";
    const rowInputClass = editInputClass;
    const STATUS_OPTIONS = ['Active', 'Pending', 'On Hold'];

    useEffect(() => {
      if (!selectedTenant) return;
      const tenantId = selectedTenant.id;

      if (prevTenantIdRef.current !== tenantId) {
        setEditTenantForm({
          name: selectedTenant.name || '',
          clientType: selectedTenant.clientType || '',
          address: selectedTenant.address || '',
          contact: selectedTenant.contact || '',
          email: selectedTenant.email || '',
          status: selectedTenant.status || 'Active'
        });
        setEditingFacilityId(null);
        setFacilityEditForm({
          name: '',
          facilityType: '',
          address: '',
          taxId: '',
          npi: '',
          taxonomyCode: '',
          contact: '',
          email: ''
        });
        prevTenantIdRef.current = tenantId;
      }

      setIsEditingTenant(tenantDetailsStartInEdit);
    }, [selectedTenant?.id, tenantDetailsStartInEdit]);

    useLayoutEffect(() => {
      if (!isEditTenantTypeOpen) {
        setEditTenantTypeMenuStyle(null);
        return;
      }
      const updateMenuPosition = () => {
        const button = editTenantTypeButtonRef.current;
        if (!button) return;
        const rect = button.getBoundingClientRect();
        setEditTenantTypeMenuStyle({
          position: 'fixed',
          top: `${Math.round(rect.bottom + 6)}px`,
          left: `${Math.round(rect.left)}px`,
          width: `${Math.round(rect.width)}px`,
          maxWidth: '320px',
          minWidth: '220px'
        });
      };
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition, true);
      };
    }, [isEditTenantTypeOpen]);

    useLayoutEffect(() => {
      if (!isEditTenantStatusOpen) {
        setEditTenantStatusMenuStyle(null);
        return;
      }
      const updateMenuPosition = () => {
        const button = editTenantStatusButtonRef.current;
        if (!button) return;
        const rect = button.getBoundingClientRect();
        setEditTenantStatusMenuStyle({
          position: 'fixed',
          top: `${Math.round(rect.bottom + 6)}px`,
          left: `${Math.round(rect.left)}px`,
          width: `${Math.round(rect.width)}px`,
          maxWidth: '320px',
          minWidth: '180px'
        });
      };
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition, true);
      };
    }, [isEditTenantStatusOpen]);

    useEffect(() => {
      if (!isEditTenantTypeOpen && !isEditTenantStatusOpen) return;
      const handleOutsideClick = (event) => {
        const target = event.target;
        if (
          editTenantTypeButtonRef.current?.contains(target) ||
          editTenantTypeMenuRef.current?.contains(target) ||
          editTenantStatusButtonRef.current?.contains(target) ||
          editTenantStatusMenuRef.current?.contains(target)
        ) {
          return;
        }
        setIsEditTenantTypeOpen(false);
        setIsEditTenantStatusOpen(false);
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isEditTenantTypeOpen, isEditTenantStatusOpen]);

    useEffect(() => {
      if (!selectedTenant) return;
      setNewFacility({
        name: '',
        facilityType: '',
        address: '',
        taxId: '',
        npi: '',
        taxonomyCode: '',
        contact: '',
        email: ''
      });
    }, [selectedTenant?.id]);

    const beginFacilityEdit = (facility) => {
      setEditingFacilityId(facility.id);
      setFacilityEditForm({
        name: facility.name || '',
        facilityType: facility.facilityType || '',
        address: facility.address || '',
        taxId: facility.taxId || '',
        npi: facility.npi || '',
        taxonomyCode: facility.taxonomyCode || '',
        contact: facility.contact || '',
        email: facility.email || ''
      });
    };

    const cancelFacilityEdit = () => {
      setEditingFacilityId(null);
      setFacilityEditForm({
        name: '',
        facilityType: '',
        address: '',
        taxId: '',
        npi: '',
        taxonomyCode: '',
        contact: '',
        email: ''
      });
    };

    const handleNewFacilityChange = (e) => {
      const { name, value } = e.target;
      setNewFacility(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleNewFacilityClear = () => {
      setNewFacility({
        name: '',
        facilityType: '',
        address: '',
        taxId: '',
        npi: '',
        taxonomyCode: '',
        contact: '',
        email: ''
      });
    };

    const handleNewFacilitySubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleFacilitySubmit(newFacility);
      setNewFacility({
        name: '',
        facilityType: '',
        address: '',
        taxId: '',
        npi: '',
        taxonomyCode: '',
        contact: '',
        email: ''
      });
    };

    const FacilityTable = () => (
      <form onSubmit={handleNewFacilitySubmit} className="overflow-x-auto">
        <table className="min-w-[1260px] w-full bg-transparent">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[220px]" />
            <col className="w-[260px]" />
            <col className="w-[180px]" />
            <col className="w-[140px]" />
            <col className="w-[160px]" />
            <col className="w-[200px]" />
            <col className="w-[240px]" />
            <col className="w-[160px]" />
          </colgroup>
          <thead>
            <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
              <th className="px-3 py-3 text-left">Facility</th>
              <th className="px-3 py-3 text-left">Facility Type</th>
              <th className="px-3 py-3 text-left">Address</th>
              <th className="px-3 py-3 text-left">Tax ID</th>
              <th className="px-3 py-3 text-left">NPI</th>
              <th className="px-3 py-3 text-left">Taxonomy Code</th>
              <th className="px-3 py-3 text-left">Contact</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]">
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="name"
                  value={newFacility.name}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Facility"
                  required
                />
              </td>
              <td className="px-3 py-3">
                <select
                  name="facilityType"
                  value={newFacility.facilityType}
                  onChange={handleNewFacilityChange}
                  className={`${rowInputClass} bg-[#1f232a] text-white`}
                  required
                >
                  <option value="" className="bg-[#1f232a] text-white">Select Facility Type</option>
                  {FACILITY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[#1f232a] text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="address"
                  value={newFacility.address}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Address"
                  required
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="taxId"
                  value={newFacility.taxId}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Tax ID"
                  required
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="npi"
                  value={newFacility.npi}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="NPI"
                  required
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="taxonomyCode"
                  value={newFacility.taxonomyCode}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Taxonomy Code"
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="text"
                  name="contact"
                  value={newFacility.contact}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Contact"
                  required
                />
              </td>
              <td className="px-3 py-3">
                <input
                  type="email"
                  name="email"
                  value={newFacility.email}
                  onChange={handleNewFacilityChange}
                  className={rowInputClass}
                  placeholder="Email"
                  required
                />
              </td>
              <td className="px-3 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={handleNewFacilityClear}
                    className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                  >
                    Clear
                  </button>
                </div>
              </td>
            </tr>
            {(selectedTenant.facilities || []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-sm text-gray-400">
                  No facilities added yet.
                </td>
              </tr>
            )}
            {(selectedTenant.facilities || []).map((facility) => (
              <tr key={facility.id} className="border-b border-[#ffffff10] text-sm">
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.name}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.name || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <select
                      value={facilityEditForm.facilityType}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, facilityType: e.target.value }))}
                      className={`${rowInputClass} bg-[#1f232a] text-white`}
                    >
                      <option value="" className="bg-[#1f232a] text-white">Select Facility Type</option>
                      {FACILITY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option} className="bg-[#1f232a] text-white">
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-white">{facility.facilityType || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.address}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.address || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.taxId}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, taxId: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.taxId || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.npi}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, npi: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.npi || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.taxonomyCode}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, taxonomyCode: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.taxonomyCode || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="text"
                      value={facilityEditForm.contact}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, contact: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.contact || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {editingFacilityId === facility.id ? (
                    <input
                      type="email"
                      value={facilityEditForm.email}
                      onChange={(e) => setFacilityEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className={rowInputClass}
                    />
                  ) : (
                    <span className="text-white">{facility.email || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {editingFacilityId === facility.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const updated = await handleFacilityUpdate(facility.id, facilityEditForm);
                          if (updated) {
                            cancelFacilityEdit();
                          }
                        }}
                        className="px-3 py-2 bg-[#3b3f46] text-white text-xs font-medium rounded-md hover:bg-gray-700 transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelFacilityEdit}
                        className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => beginFacilityEdit(facility)}
                      className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    );

    if (!selectedTenant) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={handleClose}
        />
        <div
          className="relative bg-[#232429] rounded-xl w-full max-w-4xl overflow-hidden border border-[#2f333a] shadow-2xl"
        >
          <div className="flex justify-between items-center border-b border-[#ffffff20] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#1e1f24] rounded-lg flex items-center justify-center p-2 mr-4">
                <svg className="w-7 h-7 text-[#f4f4f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                {isEditingTenant ? (
                  <input
                    type="text"
                    name="name"
                    value={editTenantForm.name}
                    onChange={(e) => setEditTenantForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 text-lg font-semibold rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-white">{selectedTenant.name}</h2>
                )}
                <div className="flex items-center mt-1">
                  <span className="text-sm text-[#f4f4f4] mr-2">{selectedTenant.clientType}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${selectedTenant.status === 'Active'
                    ? 'bg-green-500/20 text-green-400'
                    : selectedTenant.status === 'Pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                    }`}>
                    {selectedTenant.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#ffffff10] rounded-full"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Contact Information</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  <div className="space-y-3 text-sm">
                    <div className="flex">
                      <span className="text-gray-400 w-24">Contact:</span>
                      {isEditingTenant ? (
                        <input
                          type="text"
                          name="contact"
                          value={editTenantForm.contact}
                          onChange={(e) => setEditTenantForm(prev => ({ ...prev, contact: e.target.value }))}
                          className="w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                        />
                      ) : (
                        <span className="text-white">{selectedTenant.contact}</span>
                      )}
                    </div>
                    <div className="flex">
                      <span className="text-gray-400 w-24">Email:</span>
                      {isEditingTenant ? (
                        <input
                          type="email"
                          name="email"
                          value={editTenantForm.email}
                          onChange={(e) => setEditTenantForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                        />
                      ) : (
                        <span className="text-white">{selectedTenant.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Type */}
              <div>
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Client Type</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {isEditingTenant ? (
                    <>
                      <div className="relative" tabIndex={0}>
                        <button
                          type="button"
                          onClick={() => setIsEditTenantTypeOpen((prev) => !prev)}
                          ref={editTenantTypeButtonRef}
                          className="w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20] flex items-center justify-between"
                        >
                          <span className={editTenantForm.clientType ? '' : 'text-gray-400'}>
                            {editTenantForm.clientType || 'Select tenant type'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isEditTenantTypeOpen && editTenantTypeMenuStyle && createPortal(
                          <div
                            ref={editTenantTypeMenuRef}
                            style={editTenantTypeMenuStyle}
                            className={portalMenuClass}
                          >
                            {CLIENT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setEditTenantForm(prev => ({ ...prev, clientType: option }));
                                  setIsEditTenantTypeOpen(false);
                                }}
                                className={portalMenuItemClass}
                              >
                                {option}
                              </button>
                            ))}
                          </div>,
                          document.body
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Status:</span>
                        <div className="relative" tabIndex={0}>
                          <button
                            type="button"
                            onClick={() => setIsEditTenantStatusOpen((prev) => !prev)}
                            ref={editTenantStatusButtonRef}
                            className="p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20] flex items-center justify-between min-w-[160px]"
                          >
                            <span className={editTenantForm.status ? '' : 'text-gray-400'}>
                              {editTenantForm.status || 'Select status'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {isEditTenantStatusOpen && editTenantStatusMenuStyle && createPortal(
                            <div
                              ref={editTenantStatusMenuRef}
                              style={editTenantStatusMenuStyle}
                              className={portalMenuClass}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setEditTenantForm(prev => ({ ...prev, status }));
                                    setIsEditTenantStatusOpen(false);
                                  }}
                                  className={portalMenuItemClass}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white">{selectedTenant.clientType}</p>
                      <div className="mt-3 flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${selectedTenant.status === 'Active' ? 'bg-green-500' :
                          selectedTenant.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                          } mr-2`}></span>
                        <span className="text-gray-300">{selectedTenant.status}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="md:col-span-2">
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Location</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {isEditingTenant ? (
                    <input
                      type="text"
                      name="address"
                      value={editTenantForm.address}
                      onChange={(e) => setEditTenantForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                    />
                  ) : (
                    <p className="text-white">{selectedTenant.address}</p>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'facilities', label: 'Facilities' },
                      { id: 'payer-plan', label: 'Payer Plan' },
                      { id: 'transaction-codes', label: 'Transaction Codes' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFacilityTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${facilityTab === tab.id
                          ? 'bg-[#ffffff15] text-white border border-[#ffffff30]'
                          : 'bg-[#1f232a] text-gray-300 hover:text-white hover:bg-[#2a2f38] border border-[#ffffff10]'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div />
                </div>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {facilityTab === 'facilities' && (
                    <>
                      <FacilityTable />
                    </>
                  )}
                  {facilityTab === 'payer-plan' && (
                    <p className="text-sm text-gray-400">No payer plans added yet.</p>
                  )}
                  {facilityTab === 'transaction-codes' && (
                    <p className="text-sm text-gray-400">No transaction codes added yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-[#ffffff15]">
            <div>
              <span className="text-sm text-gray-400">Tenant ID: #{selectedTenant.id}</span>
            </div>
            <div className="flex gap-3">
              {isEditingTenant ? (
                <>
                  <button
                    className="px-4 py-2 bg-[#ffffff10] text-white text-sm rounded-lg hover:bg-[#ffffff20] transition"
                    onClick={() => {
                      setIsEditingTenant(false);
                      setEditTenantForm({
                        name: selectedTenant.name || '',
                        clientType: selectedTenant.clientType || '',
                        address: selectedTenant.address || '',
                        contact: selectedTenant.contact || '',
                        email: selectedTenant.email || '',
                        status: selectedTenant.status || 'Active'
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-[#3b3f46] text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition shadow-lg hover:shadow-gray-500/30"
                    onClick={async () => {
                      const updated = await handleTenantUpdate(editTenantForm);
                      if (updated) {
                        setIsEditingTenant(false);
                      }
                    }}
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-2 bg-[#ffffff10] text-white text-sm rounded-lg hover:bg-[#ffffff20] transition"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    let date;
    if (value.toDate && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (typeof value === 'object' && (value.seconds || value._seconds)) {
      const seconds = value.seconds || value._seconds;
      date = new Date(seconds * 1000);
    } else {
      date = new Date(value);
    }
    if (Number.isNaN(date.getTime())) return '—';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'On Hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-900/20 text-green-400';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20 text-yellow-400';
      case 'error': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'info':
      default: return 'border-gray-500 bg-gray-900/20 text-gray-400';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };




  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const rowInputClass = "w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]";

  const getListText = (items) => {
    if (!items || items.length === 0) return '-';
    const names = items
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        return item.name || item.label || item.code || item.id || '';
      })
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  };



  // Add function to handle tenant form submit

  // Render content based on active tab
  const renderContent = () => {

    if (!client) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-[#232429] p-6 rounded-xl border border-[#2f333a] shadow-lg"
              >
                <h3 className="text-[#f4f4f4] text-sm">Total Denials Captured</h3>
                <p className="text-3xl font-bold text-white mt-2">{client.denialsCaptured.toLocaleString()}</p>
                <div className="flex items-center mt-4">
                  <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    12.5%
                  </div>
                  <span className="text-gray-400 text-xs ml-2">vs last month</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-[#232429] p-6 rounded-xl border border-[#2f333a] shadow-lg"
              >
                <h3 className="text-[#f4f4f4] text-sm">Revenue Recovered</h3>
                <p className="text-3xl font-bold text-white mt-2">{formatCurrency(client.revenueRecovered)}</p>
                <div className="flex items-center mt-4">
                  <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    8.3%
                  </div>
                  <span className="text-gray-400 text-xs ml-2">vs last month</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-[#232429] p-6 rounded-xl border border-[#2f333a] shadow-lg"
              >
                <h3 className="text-[#f4f4f4] text-sm">Success Rate</h3>
                <p className="text-3xl font-bold text-white mt-2">{client.metrics.successRate}%</p>
                <div className="flex items-center mt-4">
                  <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    3.2%
                  </div>
                  <span className="text-gray-400 text-xs ml-2">vs last month</span>
                </div>
              </motion.div>
            </div>



            {/* Recent Alerts */}
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {mockAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border-l-4 ${getAlertColor(alert.type)} p-4 rounded-r-md flex items-start`}
                  >
                    <div className="mr-3 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs mt-1 opacity-70">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        );
      // Add this case in the renderContent switch statement

      case 'client-management':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Tenants</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1400px] w-full bg-transparent">
                  <colgroup>
                    <col className="w-[220px]" />
                    <col className="w-[200px]" />
                    <col className="w-[140px]" />
                    <col className="w-[200px]" />
                    <col className="w-[220px]" />
                    <col className="w-[260px]" />
                    <col className="w-[220px]" />
                    <col className="w-[220px]" />
                    <col className="w-[220px]" />
                    <col className="w-[200px]" />
                  </colgroup>
                  <thead>
                    <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
                      <th className="px-3 py-3 text-left">Tenant</th>
                      <th className="px-3 py-3 text-left">Tenant Type</th>
                      <th className="px-3 py-3 text-left">Status</th>
                      <th className="px-3 py-3 text-left">Contact</th>
                      <th className="px-3 py-3 text-left">Email</th>
                      <th className="px-3 py-3 text-left">Address</th>
                      <th className="px-3 py-3 text-left">Facilities</th>
                      <th className="px-3 py-3 text-left">Payer Plans</th>
                      <th className="px-3 py-3 text-left">Transaction Codes</th>
                      <th className="px-3 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]">
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          name="name"
                          value={newTenant.name}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                          className={rowInputClass}
                          placeholder="Tenant"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative" tabIndex={0}>
                          <button
                            type="button"
                            onClick={() => setIsNewTenantTypeOpen((prev) => !prev)}
                            ref={newTenantTypeButtonRef}
                            className={`${rowInputClass} flex items-center justify-between`}
                          >
                            <span className={newTenant.clientType ? '' : 'text-gray-400'}>
                              {newTenant.clientType || 'Select tenant type'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {isNewTenantTypeOpen && newTenantTypeMenuStyle && createPortal(
                            <div
                              ref={newTenantTypeMenuRef}
                              style={newTenantTypeMenuStyle}
                              className={portalMenuClass}
                            >
                              {CLIENT_TYPE_OPTIONS.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setNewTenant(prev => ({ ...prev, clientType: option }));
                                    setIsNewTenantTypeOpen(false);
                                  }}
                                  className={portalMenuItemClass}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="relative" tabIndex={0}>
                          <button
                            type="button"
                            onClick={() => setIsNewTenantStatusOpen((prev) => !prev)}
                            ref={newTenantStatusButtonRef}
                            className={`${rowInputClass} flex items-center justify-between`}
                          >
                            <span className={newTenant.status ? '' : 'text-gray-400'}>
                              {newTenant.status || 'Select status'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {isNewTenantStatusOpen && newTenantStatusMenuStyle && createPortal(
                            <div
                              ref={newTenantStatusMenuRef}
                              style={newTenantStatusMenuStyle}
                              className={portalMenuClass}
                            >
                              {['Active', 'Pending', 'On Hold'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setNewTenant(prev => ({ ...prev, status: option }));
                                    setIsNewTenantStatusOpen(false);
                                  }}
                                  className={portalMenuItemClass}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          name="contact"
                          value={newTenant.contact}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, contact: e.target.value }))}
                          className={rowInputClass}
                          placeholder="Contact"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="email"
                          name="email"
                          value={newTenant.email}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                          className={rowInputClass}
                          placeholder="Email"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          name="address"
                          value={newTenant.address}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, address: e.target.value }))}
                          className={rowInputClass}
                          placeholder="Address"
                          required
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-500">—</td>
                      <td className="px-3 py-3 text-gray-500">—</td>
                      <td className="px-3 py-3 text-gray-500">—</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTenantSubmit(newTenant)}
                            className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTenant({
                              name: '',
                              clientType: '',
                              address: '',
                              contact: '',
                              email: '',
                              status: 'Active'
                            })}
                            className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                          >
                            Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                    {(client.subClients || []).length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-3 py-6 text-sm text-gray-400">
                          No Tenants Yet. Add tenants to manage multiple facilities under this client.
                        </td>
                      </tr>
                    )}
                    {(client.subClients || []).map((subClient) => (
                      <tr key={subClient.id} className="border-b border-[#ffffff10] text-sm">
                        <td className="px-3 py-3 text-white">{subClient.name || '-'}</td>
                        <td className="px-3 py-3 text-white">{subClient.clientType || '-'}</td>
                        <td className="px-3 py-3 text-white">{subClient.status || '-'}</td>
                        <td className="px-3 py-3 text-white">{subClient.contact || '-'}</td>
                        <td className="px-3 py-3 text-white">{subClient.email || '-'}</td>
                        <td className="px-3 py-3 text-white">{subClient.address || '-'}</td>
                        <td className="px-3 py-3 text-white">{getListText(subClient.facilities)}</td>
                        <td className="px-3 py-3 text-white">{getListText(subClient.payerPlans || subClient.payerPlan || subClient.payers)}</td>
                        <td className="px-3 py-3 text-white">{getListText(subClient.transactionCodes || subClient.transactionCode || subClient.transactionCodeList)}</td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                              onClick={() => openTenantDetails(subClient)}
                            >
                              Select
                            </button>
                            <button
                              type="button"
                              className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all"
                              onClick={() => openTenantDetails(subClient, { edit: true })}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        );

      // Add this to your renderContent switch statement
      case 'users':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Users</h3>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="bg-[#ffffff15] text-white px-4 py-2 rounded-lg w-56 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={searchKeyword}
                      onChange={handleUserSearch}
                    />
                    <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    className="px-4 py-2 bg-[#3b3f46] text-white rounded-lg hover:bg-gray-700 transition flex items-center"
                    onClick={() => setIsUserModalOpen(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {usersLoading && (
                <div className="py-16 flex justify-center items-center">
                  <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Users List */}
              {!usersLoading && (
                <div className="space-y-4">
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-[#f4f4f450] rounded-lg">
                      <svg className="w-16 h-16 mx-auto text-[#f4f4f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="mt-4 text-lg text-white">
                        {searchKeyword ? 'No users match your search' : 'No Users Yet'}
                      </p>
                      <p className="mt-2 text-gray-400">
                        {searchKeyword ?
                          'Try adjusting your search criteria' :
                          'Add users to manage access to this client.'}
                      </p>
                    </div>
                  )}

                  {filteredUsers.map(user => (
                    <div key={user.id} className="bg-[#ffffff08] p-4 rounded-lg hover:bg-[#ffffff10] transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${getAvatarColor(user.role)} rounded-full flex items-center justify-center text-white font-medium`}>
                            {getUserInitials(user.firstname, user.lastname)}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{user.firstname} {user.lastname}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                          <div className="ml-6 flex gap-2 items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${normalizeRole(user.role) === 'internal-admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : normalizeRole(user.role) === 'manager'
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : normalizeRole(user.role) === 'executive'
                                  ? 'bg-sky-500/20 text-sky-300'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                              {getRoleLabel(user.role)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${user.status === 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                              {user.status === 0 ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Last Login</p>
                            <p className="text-white text-sm">
                              {user.lastLogin ? formatLastLoginTime(user.lastLogin) : 'Never'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 hover:bg-[#ffffff20] rounded-lg transition"
                              onClick={() => handleEditUser(user)}
                            >
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>

                            {/* Don't show delete button for helio.ai emails */}
                            {!user.email.endsWith('@helio.ai') && (
                              <button
                                className="p-2 hover:bg-[#ffffff20] rounded-lg transition"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* <div className="mt-4 ml-14">
                  <p className="text-sm text-gray-400">Assigned Clients</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.client && user.client.length > 0 ? (
                      <>
                        {user.role === 'super-admin' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-gray-300">
                            All Clients
                          </span>
                        ) : (
                          <>
                            {user.client.slice(0, 3).map((clientName, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-gray-300">
                                {clientName}
                              </span>
                            ))}
                            
                            {user.client.length > 3 && (
                              <div className="group relative">
                                <span className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-gray-300 cursor-pointer">
                                  +{user.client.length - 3} more
                                </span>
                                
                                <div className="absolute z-10 left-0 mt-1 w-auto max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <div className="p-2 rounded-lg shadow-lg bg-[#232429] text-white border border-gray-700">
                                    <div className="flex flex-wrap gap-1">
                                      {user.client.slice(3).map((clientName, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-[#191a1d] text-gray-300">
                                          {clientName}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-xs italic text-gray-500">No clients assigned</span>
                    )}
                  </div>
                </div> */}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination (if needed) */}
              {filteredUsers.length > 0 && (
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                    {users.length > filteredUsers.length && ` of ${users.length} total`}
                  </p>

                  {/* Only show pagination if we implement it */}
                  {users.length > 10 && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-[#ffffff15]">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex">
                        <button className="px-3 py-1 rounded-lg bg-[#3b3f46] text-white">1</button>
                        <button className="px-3 py-1 rounded-lg text-gray-400 hover:bg-[#ffffff15]">2</button>
                        <button className="px-3 py-1 rounded-lg text-gray-400 hover:bg-[#ffffff15]">3</button>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-[#ffffff15]">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        );

      case 'claims':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <h3 className="text-lg font-semibold text-white mb-4">Claims Dashboard</h3>
              <p className="text-[#f4f4f4]">Detailed claims data and analytics would be displayed here.</p>
              {/* This would be replaced with actual claims data and visualizations */}
              <div className="mt-8 text-center py-20 border border-dashed border-[#f4f4f450] rounded-lg">
                <svg className="w-16 h-16 mx-auto text-[#f4f4f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-lg text-white">Claims Analytics</p>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">This module is under development. It will include detailed claims data, denial categorization, and appeals status tracking.</p>
              </div>
            </motion.div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <h3 className="text-lg font-semibold text-white mb-4">Client Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[#f4f4f4] font-medium">General Information</h4>

                  <div className="space-y-2">
                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Client Name</p>
                      <p className="text-white">{client.name}</p>
                    </div>


                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[#f4f4f4] font-medium">Billing Information</h4>

                  <div className="space-y-2">
                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Billing Contact</p>
                      <p className="text-white">{client.phone}</p>
                    </div>

                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Billing Email</p>
                      <p className="text-white">{client.email}</p>
                    </div>

                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Billing Address</p>
                      <p className="text-white">{client.facilityAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-[#f4f4f4] font-medium mb-4">Notification Settings</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-gray-400 text-sm mt-1">Receive email updates about denial status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Weekly Report</p>
                      <p className="text-gray-400 text-sm mt-1">Receive weekly performance summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Real-time Alerts</p>
                      <p className="text-gray-400 text-sm mt-1">Receive immediate alerts for critical issues</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-[#ffffff10] text-white rounded-lg hover:bg-[#ffffff20] transition">
                  Reset Defaults
                </button>
                <button className="px-4 py-2 bg-[#ffffff10] text-white rounded-lg hover:bg-[#ffffff20] transition">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        );

      case 'ai-agents':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-[#232429] p-6 rounded-xl border border-[#2f333a]">
              <h3 className="text-lg font-semibold text-white mb-4">AI Agents Dashboard</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2" />
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="text-md font-medium text-white">AI Agent</h4>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Active</span>
                      <span className="text-sm text-green-400">Running</span>
                    </div>
                    <div className="w-full h-2 bg-[#ffffff10] rounded-full overflow-hidden">
                      <div className="bg-green-500 h-2" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Processing resubmissions and appeals</p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-[#f4f4f4] text-sm">1,256 denials processed</span>
                    <span className="text-white text-sm">85% efficient</span>
                  </div>
                </div>

                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2" />
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="text-md font-medium text-white">AI Agent</h4>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Active</span>
                      <span className="text-sm text-green-400">Running</span>
                    </div>
                    <div className="w-full h-2 bg-[#ffffff10] rounded-full overflow-hidden">
                      <div className="bg-green-500 h-2" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Analyzing data and reclaiming write-offs</p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-[#f4f4f4] text-sm">785 write-offs reclaimed</span>
                    <span className="text-white text-sm">92% efficient</span>
                  </div>
                </div>

                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2" />
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h4 className="text-md font-medium text-white">AI Agent</h4>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Active</span>
                      <span className="text-sm text-green-400">Running</span>
                    </div>
                    <div className="w-full h-2 bg-[#ffffff10] rounded-full overflow-hidden">
                      <div className="bg-green-500 h-2" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Optimizing claims for approval</p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-[#f4f4f4] text-sm">505 claims optimized</span>
                    <span className="text-white text-sm">78% efficient</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-[#f4f4f4] font-medium mb-4">AI Agent Performance</h4>
                <div className="bg-[#ffffff08] p-6 rounded-lg">
                  {/* AI Performance charts would go here */}
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-[#f4f4f4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="mt-4 text-lg text-white">AI Performance Analytics</p>
                      <p className="mt-2 text-gray-400 max-w-md mx-auto">Detailed AI performance metrics will be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return <div>No content available</div>;
    }
  };
  // Add this function to your ClientDashboard component before the TenantModal definition
  const handleTenantSubmit = async (formData) => {
    try {
      // Show loading state
      setLoading(true);

      // Create new tenant object with facility information using the form data directly
      const tenantToAdd = {
        ...formData,
        clientId: client.id,
        clientName: client.name
      };

      const res = await axios.post(
        `${resolvedApiUrl}/clients/${client.id}/tenants`,
        tenantToAdd,
        { withCredentials: true }
      );

      const createdTenant = res.data || {
        ...tenantToAdd,
        id: `tenant-${Date.now()}`,
        facilities: []
      };

      setClient(prev => ({
        ...prev,
        subClients: [...(prev?.subClients || []), createdTenant]
      }));

      setNewTenant({
        name: '',
        clientType: '',
        address: '',
        contact: '',
        email: '',
        status: 'Active'
      });

      alert(`Tenant ${createdTenant.name} added successfully!`);
    } catch (error) {
      console.error("Error adding tenant:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantUpdate = async (formData) => {
    if (!selectedTenant || !client) return;
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        clientType: formData.clientType,
        address: formData.address,
        contact: formData.contact,
        email: formData.email,
        status: formData.status
      };

      const res = await axios.patch(
        `${resolvedApiUrl}/clients/${client.id}/tenants/${selectedTenant.id}`,
        payload,
        { withCredentials: true }
      );

      const updatedTenant = res.data || { ...selectedTenant, ...payload };

      const updatedSubClients = (client.subClients || []).map((subClient) =>
        subClient.id === selectedTenant.id ? { ...subClient, ...updatedTenant } : subClient
      );

      setClient(prev => ({
        ...prev,
        subClients: updatedSubClients
      }));
      setSelectedTenant({ ...selectedTenant, ...updatedTenant });
      alert(`Tenant ${updatedTenant.name} updated successfully!`);
      return true;
    } catch (error) {
      console.error("Error updating tenant:", error);
      alert(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityUpdate = async (facilityId, formData) => {
    if (!selectedTenant || !client) return false;
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        facilityType: formData.facilityType,
        address: formData.address,
        taxId: formData.taxId,
        npi: formData.npi,
        taxonomyCode: formData.taxonomyCode,
        contact: formData.contact,
        email: formData.email
      };

      const res = await axios.patch(
        `${resolvedApiUrl}/clients/${client.id}/tenants/${selectedTenant.id}/facilities/${facilityId}`,
        payload,
        { withCredentials: true }
      );

      const updatedFacility = res.data || { ...payload, id: facilityId };

      const updatedSubClients = (client.subClients || []).map((subClient) => {
        if (subClient.id !== selectedTenant.id) return subClient;
        const facilities = (subClient.facilities || []).map((facility) =>
          facility.id === facilityId ? { ...facility, ...updatedFacility } : facility
        );
        return { ...subClient, facilities };
      });

      setClient(prev => ({
        ...prev,
        subClients: updatedSubClients
      }));

      const updatedTenant = updatedSubClients.find((subClient) => subClient.id === selectedTenant.id);
      if (updatedTenant) {
        setSelectedTenant(updatedTenant);
      }

      alert(`Facility ${updatedFacility.name} updated successfully!`);
      return true;
    } catch (error) {
      console.error("Error updating facility:", error);
      alert(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitySubmit = async (formData) => {
    if (!selectedTenant || !client) return;
    try {
      setLoading(true);
      const facilityToAdd = {
        ...formData,
        tenantId: selectedTenant.id
      };

      const res = await axios.post(
        `${resolvedApiUrl}/clients/${client.id}/tenants/${selectedTenant.id}/facilities`,
        facilityToAdd,
        { withCredentials: true }
      );

      const createdFacility = res.data || {
        ...facilityToAdd,
        id: `facility-${Date.now()}`
      };

      const updatedSubClients = (client.subClients || []).map((subClient) => {
        if (subClient.id !== selectedTenant.id) return subClient;
        const facilities = subClient.facilities || [];
        return {
          ...subClient,
          facilities: [...facilities, createdFacility]
        };
      });

      setClient(prev => ({
        ...prev,
        subClients: updatedSubClients
      }));

      const updatedTenant = updatedSubClients.find((subClient) => subClient.id === selectedTenant.id);
      if (updatedTenant) {
        setSelectedTenant(updatedTenant);
      }

      alert(`Facility ${createdFacility.name} added successfully!`);
    } catch (error) {
      console.error("Error adding facility:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Revised TenantModal component to fix the data submission issue
  const TenantModal = () => {
    // Create a local state to manage the form values
    const [formState, setFormState] = useState({ ...newTenant });
    const [isTenantTypeOpen, setIsTenantTypeOpen] = useState(false);
    const rowInputClass = "w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]";

    const handleLocalInputChange = (e) => {
      const { name, value } = e.target;
      // Update the local state without losing focus
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleTenantTypeSelect = (value) => {
      setFormState(prev => ({
        ...prev,
        clientType: value
      }));
      setIsTenantTypeOpen(false);
    };

    // Submit form directly with form state data
    const handleFormSubmit = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Pass the form state directly to the submit handler
      handleTenantSubmit(formState);
    };

    const handleClear = () => {
      setFormState({
        name: '',
        clientType: '',
        address: '',
        contact: '',
        email: '',
        status: 'Active'
      });
    };

    const handleClose = () => {
      setIsTenantModalOpen(false);
    };

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
        onClick={handleClose}
      >
        <div
          className="bg-[#232429] rounded-xl w-full max-w-5xl overflow-hidden border border-[#2f333a] shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b border-[#ffffff20] p-6">
            <h2 className="text-xl font-semibold text-white">Add New Tenant</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full bg-transparent">
                <colgroup>
                  <col className="w-[220px]" />
                  <col className="w-[240px]" />
                  <col className="w-[320px]" />
                  <col className="w-[220px]" />
                  <col className="w-[280px]" />
                  <col className="w-[160px]" />
                </colgroup>
                <thead>
                  <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
                    <th className="px-3 py-3 text-left">Tenant</th>
                    <th className="px-3 py-3 text-left">Tenant Type</th>
                    <th className="px-3 py-3 text-left">Address</th>
                    <th className="px-3 py-3 text-left">Contact</th>
                    <th className="px-3 py-3 text-left">Email</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]">
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleLocalInputChange}
                        className={rowInputClass}
                        placeholder="Tenant"
                        required
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div
                        className="relative"
                        tabIndex={0}
                        onBlur={() => setIsTenantTypeOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={() => setIsTenantTypeOpen((prev) => !prev)}
                          className={`${rowInputClass} flex items-center justify-between`}
                        >
                          <span className={formState.clientType ? '' : 'text-gray-400'}>
                            {formState.clientType || 'Select tenant type'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isTenantTypeOpen && (
                          <div className="absolute z-20 mt-1 min-w-[220px] max-w-[320px] rounded-md border bg-[#1f232a] border-[#ffffff20] shadow-lg">
                            {CLIENT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleTenantTypeSelect(option)}
                                className={portalMenuItemClass}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        name="address"
                        value={formState.address}
                        onChange={handleLocalInputChange}
                        className={rowInputClass}
                        placeholder="Address"
                        required
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        name="contact"
                        value={formState.contact}
                        onChange={handleLocalInputChange}
                        className={rowInputClass}
                        placeholder="Contact"
                        required
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleLocalInputChange}
                        className={rowInputClass}
                        placeholder="Email"
                        required
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="submit"
                          className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={handleClear}
                          className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className={pageClass}>
      <div className="relative">
        {/* <button 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition p-2 rounded-lg bg-[#4a5565] hover:bg-[#ffffff10]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V5.01M12 12V12.01M12 19V19.01M12 6C11.4477 6 11 5.55228 11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6ZM12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13ZM12 20C11.4477 20 11 19.5523 11 19C11 18.4477 11.4477 18 12 18C12.5523 18 13 18.4477 13 19C13 19.5523 12.5523 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Actions</span>
            </button> */}

        {isMenuOpen && (
          <div className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-xl z-10 border ${
            isDark ? 'bg-[#2a2b30] border-[#2f333a]' : 'bg-white border-slate-200'
          }`}>
            <button className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'text-white hover:bg-[#ffffff15]' : 'text-slate-700 hover:bg-slate-100'}`}>
              Edit Client
            </button>
            <button className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'text-white hover:bg-[#ffffff15]' : 'text-slate-700 hover:bg-slate-100'}`}>
              Send Message
            </button>
            <button className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'text-white hover:bg-[#ffffff15]' : 'text-slate-700 hover:bg-slate-100'}`}>
              Export Reports
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-300 hover:bg-[#ffffff15]' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={async () => {
                const confirmed = window.confirm(`Delete client "${client?.name || 'Client'}"? This cannot be undone.`);
                if (!confirmed) return;
                try {
                  setLoading(true);
                  await axios.delete(`${resolvedApiUrl}/clients/${client.id}`, { withCredentials: true });
                  navigate('/clientmanagement', { replace: true });
                } catch (error) {
                  console.error("Error deleting client:", error);
                  alert(`Error: ${error.message}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Delete Client
            </button>
          </div>
        )}
      </div>


      {loading ? (
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#f4f4f4]">Loading client dashboard...</p>
          </div>
        </div>
      ) : !client ? (
        <div className="container mx-auto px-4">
          <div className="text-center py-24">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium">Client Not Found</h3>
            <p className="mt-2 text-[#f4f4f4]">We couldn't find the client you're looking for.</p>
            <button
              onClick={() => navigate('/client-management')}
              className="mt-6 px-4 py-2 bg-[#3b3f46] text-white rounded-lg hover:bg-gray-700 transition"
            >
              Return to Client Management
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Client info panel */}
          <div className="container mx-auto px-4 py-6">
            <div className="bg-[#232429] rounded-xl border border-[#2f333a] p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="w-20 h-20 bg-[#1e1f24] rounded-lg flex items-center justify-center p-3 mr-6 mb-4 md:mb-0 overflow-hidden border border-[#ffffff20]">
                  {client.logo ? (
                    <img src={client.logo} alt="" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-4xl font-semibold text-gray-300">
                      {(client.name || 'CL')
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('') || 'CL'}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold">{client.name}</h2>
                </div>

                <div className="mt-6 md:mt-0">
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Contact:</span>
                      <span className="text-white">{client.contact}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Email:</span>
                      <span className="text-white">{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Phone:</span>
                      <span className="text-white">{client.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2 border-b border-[#ffffff20]">
              {/* <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'overview' ? 'text-white bg-[#ffffff15] border-b-2 border-gray-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'claims' ? 'text-white bg-[#ffffff15] border-b-2 border-gray-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('claims')}
              >
                Claims
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'ai-agents' ? 'text-white bg-[#ffffff15] border-b-2 border-gray-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('ai-agents')}
              >
                AI Agents
              </button> */}
              <button
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'client-management' ? 'text-white bg-[#ffffff15] border-b-2 border-gray-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => handleTabChange('client-management')}
              >
                Tenant Management
              </button>


            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-0 py-6 pb-16">
            {renderContent()}
          </div>

          {/* Tenant Modal */}
        </>
      )}
    </div>
  );
};

export default ClientDashboard;

