
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from '../utils/config';

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

const STATUS_OPTIONS = ['Active', 'Pending', 'On Hold'];

const TenantDetails = () => {
  const { clientId, tenantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedApiUrl = `${SERVER_URL}/api`;

  const [client, setClient] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [facilityTab, setFacilityTab] = useState('facilities');
  const [isEditingTenant, setIsEditingTenant] = useState(Boolean(location.state?.edit));
  const [isEditTenantTypeOpen, setIsEditTenantTypeOpen] = useState(false);
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
    contact: '',
    email: ''
  });
  const [newFacility, setNewFacility] = useState({
    name: '',
    facilityType: '',
    address: '',
    taxId: '',
    npi: '',
    contact: '',
    email: ''
  });

  const editInputClass = "w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]";
  const rowInputClass = editInputClass;

  useEffect(() => {
    let isMounted = true;
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${resolvedApiUrl}/clients/${clientId}`, { withCredentials: true });
        if (!isMounted) return;
        setClient(res.data);
      } catch (error) {
        console.error('Error fetching client data:', error);
        if (isMounted) {
          navigate('/clientmanagement', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClientData();
    return () => {
      isMounted = false;
    };
  }, [clientId, navigate, resolvedApiUrl]);

  useEffect(() => {
    if (!client) return;
    const tenant = (client.subClients || []).find((subClient) => String(subClient.id) === String(tenantId));
    setSelectedTenant(tenant || null);
  }, [client, tenantId]);

  useEffect(() => {
    if (!selectedTenant) return;
    setEditTenantForm({
      name: selectedTenant.name || '',
      clientType: selectedTenant.clientType || '',
      address: selectedTenant.address || '',
      contact: selectedTenant.contact || '',
      email: selectedTenant.email || '',
      status: selectedTenant.status || 'Active'
    });
    setIsEditingTenant(Boolean(location.state?.edit));
    setEditingFacilityId(null);
    setFacilityEditForm({
      name: '',
      facilityType: '',
      address: '',
      taxId: '',
      npi: '',
      contact: '',
      email: ''
    });
    setNewFacility({
      name: '',
      facilityType: '',
      address: '',
      taxId: '',
      npi: '',
      contact: '',
      email: ''
    });
  }, [selectedTenant?.id, location.state?.edit]);

  const handleTenantUpdate = async (formData) => {
    if (!selectedTenant || !client) return false;
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
      console.error('Error updating tenant:', error);
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
      console.error('Error updating facility:', error);
      alert(`Error: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityDelete = async (facilityId) => {
    if (!selectedTenant || !client) return;
    const confirmed = window.confirm('Delete this facility? This cannot be undone.');
    if (!confirmed) return;
    try {
      setLoading(true);
      await axios.delete(
        `${resolvedApiUrl}/clients/${client.id}/tenants/${selectedTenant.id}/facilities/${facilityId}`,
        { withCredentials: true }
      );

      const updatedSubClients = (client.subClients || []).map((subClient) => {
        if (subClient.id !== selectedTenant.id) return subClient;
        const facilities = (subClient.facilities || []).filter((facility) => facility.id !== facilityId);
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

      if (editingFacilityId === facilityId) {
        cancelFacilityEdit();
      }
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert(`Error: ${error.message}`);
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
      console.error('Error adding facility:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const beginFacilityEdit = (facility) => {
    setEditingFacilityId(facility.id);
    setFacilityEditForm({
      name: facility.name || '',
      facilityType: facility.facilityType || '',
      address: facility.address || '',
      taxId: facility.taxId || '',
      npi: facility.npi || '',
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
      contact: '',
      email: ''
    });
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1f24] text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#f4f4f4]">Loading tenant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <div className="min-h-screen bg-[#1e1f24] text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/client/${clientId}`)}
            className="mb-6 px-4 py-2 bg-[#ffffff10] rounded-lg hover:bg-[#ffffff20] transition"
          >
            Back to Client
          </button>
          <div className="text-center py-24 border border-dashed border-[#f4f4f450] rounded-lg">
            <p className="text-lg text-white">Tenant not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1f24] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/client/${clientId}`)}
            className="mr-4 p-2 bg-[#ffffff10] rounded-lg hover:bg-[#ffffff20] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Tenant Details</h1>
          <div className="ml-auto">
            {isEditingTenant ? (
              <div className="flex gap-3">
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
              </div>
            ) : (
              <button
                className="px-4 py-2 bg-[#3b3f46] text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition shadow-lg hover:shadow-gray-500/30"
                onClick={() => setIsEditingTenant(true)}
              >
                Edit Tenant
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#232429] rounded-xl border border-[#2f333a] shadow-2xl overflow-hidden">
          <div className="border-b border-[#ffffff20] p-6">
            <h2 className="text-xl font-semibold text-white">
              {isEditingTenant ? (
                <input
                  type="text"
                  name="name"
                  value={editTenantForm.name}
                  onChange={(e) => setEditTenantForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 text-lg font-semibold rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                />
              ) : (
                selectedTenant.name
              )}
            </h2>
            <div className="flex items-center mt-1">
              <span className="text-sm text-[#f4f4f4] mr-2">{selectedTenant.clientType}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                selectedTenant.status === 'Active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : selectedTenant.status === 'Pending'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {selectedTenant.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Contact Information</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10] space-y-4">
                  <div>
                    <p className="text-gray-400">Contact Person</p>
                    {isEditingTenant ? (
                      <input
                        type="text"
                        name="contact"
                        value={editTenantForm.contact}
                        onChange={(e) => setEditTenantForm(prev => ({ ...prev, contact: e.target.value }))}
                        className={editInputClass}
                      />
                    ) : (
                      <p className="text-white">{selectedTenant.contact}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    {isEditingTenant ? (
                      <input
                        type="email"
                        name="email"
                        value={editTenantForm.email}
                        onChange={(e) => setEditTenantForm(prev => ({ ...prev, email: e.target.value }))}
                        className={editInputClass}
                      />
                    ) : (
                      <p className="text-white">{selectedTenant.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Tenant Details</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10] space-y-4">
                  <div>
                    <p className="text-gray-400">Tenant Type</p>
                    {isEditingTenant ? (
                      <div
                        className="relative mt-1"
                        tabIndex={0}
                        onBlur={() => setIsEditTenantTypeOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={() => setIsEditTenantTypeOpen((prev) => !prev)}
                          className={`${editInputClass} flex items-center justify-between`}
                        >
                          <span className={editTenantForm.clientType ? '' : 'text-gray-400'}>
                            {editTenantForm.clientType || 'Select tenant type'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isEditTenantTypeOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-[#1f232a] border border-[#ffffff20] rounded-md shadow-lg">
                            {CLIENT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setEditTenantForm(prev => ({ ...prev, clientType: option }));
                                  setIsEditTenantTypeOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2f38]"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-white">{selectedTenant.clientType}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    {isEditingTenant ? (
                      <select
                        value={editTenantForm.status}
                        onChange={(e) => setEditTenantForm(prev => ({ ...prev, status: e.target.value }))}
                        className={`${editInputClass} bg-[#1f232a] text-white`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-[#1f232a] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center mt-1">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          selectedTenant.status === 'Active' ? 'bg-green-500' : 
                          selectedTenant.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-300">{selectedTenant.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-[#f4f4f4] text-sm font-medium mb-3">Location</h3>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {isEditingTenant ? (
                    <input
                      type="text"
                      name="address"
                      value={editTenantForm.address}
                      onChange={(e) => setEditTenantForm(prev => ({ ...prev, address: e.target.value }))}
                      className={editInputClass}
                    />
                  ) : (
                    <p className="text-white">{selectedTenant.address}</p>
                  )}
                </div>
              </div>

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
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                          facilityTab === tab.id
                            ? 'bg-[#ffffff15] text-white border border-[#ffffff30]'
                            : 'bg-[#1f232a] text-gray-300 hover:text-white hover:bg-[#2a2f38] border border-[#ffffff10]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {facilityTab === 'facilities' && (
                    <form onSubmit={handleNewFacilitySubmit} className="overflow-x-auto">
                      <table className="min-w-[1100px] w-full bg-transparent">
                        <colgroup>
                          <col className="w-[220px]" />
                          <col className="w-[220px]" />
                          <col className="w-[260px]" />
                          <col className="w-[180px]" />
                          <col className="w-[140px]" />
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
                              <td colSpan={8} className="px-3 py-6 text-sm text-gray-400">
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
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => beginFacilityEdit(facility)}
                                      className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleFacilityDelete(facility.id)}
                                      className="px-3 py-2 bg-red-500/20 text-red-300 text-xs font-medium rounded-md hover:bg-red-500/30 transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </form>
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
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
