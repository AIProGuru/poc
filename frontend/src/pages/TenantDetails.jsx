
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
const PAYER_TYPE_OPTIONS = ['Commercial', 'Medicare', 'Medicaid', 'Workers Comp', 'Self Pay', 'Other'];
const PAYER_MODULE_OPTIONS = ['Claim Submission', 'Appeal', 'Denials', 'Payment Posting', 'Other'];
const PAYER_CATEGORY_OPTIONS = ['Primary', 'Secondary', 'Tertiary', 'Corrected Claim', 'Appeal', 'Other'];
const TRANSACTION_CODE_TYPE_OPTIONS = ['Contractual Adjustment', 'Write-off', 'Patient Payment', 'Payer Payment', 'Other'];

const EMPTY_PAYER_PLAN_CODE = {
  payerType: '',
  payerId: '',
  payerDescription: '',
  payerAddress: '',
  payerPhoneNumber: '',
  payerFaxNumber: '',
  module: '',
  category: ''
};

const EMPTY_TRANSACTION_CODE = {
  transactionCodeType: '',
  transactionCode: '',
  transactionCodeDescription: ''
};

const TenantDetails = () => {
  const { clientId, tenantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedApiUrl = `${SERVER_URL}/api`;

  const [client, setClient] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [facilityTab, setFacilityTab] = useState('facilities');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [isEditingTenant, setIsEditingTenant] = useState(Boolean(location.state?.edit));
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
  const [newPayerPlanCode, setNewPayerPlanCode] = useState(EMPTY_PAYER_PLAN_CODE);
  const [editingPayerPlanCodeId, setEditingPayerPlanCodeId] = useState(null);
  const [payerPlanCodeEditForm, setPayerPlanCodeEditForm] = useState(EMPTY_PAYER_PLAN_CODE);
  const [newTransactionCode, setNewTransactionCode] = useState(EMPTY_TRANSACTION_CODE);
  const [editingTransactionCodeId, setEditingTransactionCodeId] = useState(null);
  const [transactionCodeEditForm, setTransactionCodeEditForm] = useState(EMPTY_TRANSACTION_CODE);
  const editTenantTypeButtonRef = useRef(null);
  const editTenantTypeMenuRef = useRef(null);
  const editTenantStatusButtonRef = useRef(null);
  const editTenantStatusMenuRef = useRef(null);
  const [editTenantTypeMenuStyle, setEditTenantTypeMenuStyle] = useState(null);
  const [editTenantStatusMenuStyle, setEditTenantStatusMenuStyle] = useState(null);

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
    setFacilitySearch('');
    setSelectedFacilityId('');
    setNewPayerPlanCode({ ...EMPTY_PAYER_PLAN_CODE });
    setEditingPayerPlanCodeId(null);
    setPayerPlanCodeEditForm({ ...EMPTY_PAYER_PLAN_CODE });
    setNewTransactionCode({ ...EMPTY_TRANSACTION_CODE });
    setEditingTransactionCodeId(null);
    setTransactionCodeEditForm({ ...EMPTY_TRANSACTION_CODE });
  }, [selectedTenant?.id, location.state?.edit]);

  useEffect(() => {
    if (!selectedTenant) return;
    const facilities = selectedTenant.facilities || [];
    if (selectedFacilityId && facilities.some((facility) => String(facility.id) === String(selectedFacilityId))) {
      return;
    }
    setSelectedFacilityId('');
    setEditingPayerPlanCodeId(null);
    setEditingTransactionCodeId(null);
  }, [selectedTenant?.facilities, selectedFacilityId]);

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

  const facilities = selectedTenant?.facilities || [];
  const normalizedFacilitySearch = facilitySearch.trim().toLowerCase();
  const filteredFacilities = normalizedFacilitySearch
    ? facilities.filter((facility) =>
        [
          facility.name,
          facility.facilityType,
          facility.contact,
          facility.email,
          facility.status,
          facility.taxId,
          facility.npi
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedFacilitySearch))
      )
    : facilities;
  const selectedFacility = facilities.find((facility) => String(facility.id) === String(selectedFacilityId)) || null;

  const updateFacilityInState = (facilityId, updater) => {
    if (!selectedTenant || !client) return;
    const updatedSubClients = (client.subClients || []).map((subClient) => {
      if (subClient.id !== selectedTenant.id) return subClient;
      const nextFacilities = (subClient.facilities || []).map((facility) => {
        if (String(facility.id) !== String(facilityId)) return facility;
        return updater(facility);
      });
      return { ...subClient, facilities: nextFacilities };
    });

    setClient((prev) => ({
      ...prev,
      subClients: updatedSubClients
    }));

    const updatedTenant = updatedSubClients.find((subClient) => subClient.id === selectedTenant.id);
    if (updatedTenant) {
      setSelectedTenant(updatedTenant);
    }
  };

  const codeBaseUrl = (facilityId) =>
    `${resolvedApiUrl}/clients/${client.id}/tenants/${selectedTenant.id}/facilities/${facilityId}`;

  const handlePayerPlanCodeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) {
      alert('Select a facility before adding payer plan codes.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${codeBaseUrl(selectedFacility.id)}/payer-plan-codes`,
        newPayerPlanCode,
        { withCredentials: true }
      );
      const createdCode = res.data || { ...newPayerPlanCode, id: `payer-plan-${Date.now()}` };
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        payerPlanCodes: [...(facility.payerPlanCodes || []), createdCode]
      }));
      setNewPayerPlanCode({ ...EMPTY_PAYER_PLAN_CODE });
    } catch (error) {
      console.error('Error adding payer plan code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const beginPayerPlanCodeEdit = (code) => {
    setEditingPayerPlanCodeId(code.id);
    setPayerPlanCodeEditForm({
      payerType: code.payerType || '',
      payerId: code.payerId || '',
      payerDescription: code.payerDescription || '',
      payerAddress: code.payerAddress || '',
      payerPhoneNumber: code.payerPhoneNumber || '',
      payerFaxNumber: code.payerFaxNumber || '',
      module: code.module || '',
      category: code.category || ''
    });
  };

  const cancelPayerPlanCodeEdit = () => {
    setEditingPayerPlanCodeId(null);
    setPayerPlanCodeEditForm({ ...EMPTY_PAYER_PLAN_CODE });
  };

  const handlePayerPlanCodeUpdate = async (codeId) => {
    if (!selectedFacility) return;
    try {
      setLoading(true);
      const res = await axios.patch(
        `${codeBaseUrl(selectedFacility.id)}/payer-plan-codes/${codeId}`,
        payerPlanCodeEditForm,
        { withCredentials: true }
      );
      const updatedCode = res.data || { ...payerPlanCodeEditForm, id: codeId };
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        payerPlanCodes: (facility.payerPlanCodes || []).map((code) =>
          code.id === codeId ? { ...code, ...updatedCode } : code
        )
      }));
      cancelPayerPlanCodeEdit();
    } catch (error) {
      console.error('Error updating payer plan code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayerPlanCodeDelete = async (codeId) => {
    if (!selectedFacility) return;
    const confirmed = window.confirm('Delete this payer plan code? This cannot be undone.');
    if (!confirmed) return;
    try {
      setLoading(true);
      await axios.delete(
        `${codeBaseUrl(selectedFacility.id)}/payer-plan-codes/${codeId}`,
        { withCredentials: true }
      );
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        payerPlanCodes: (facility.payerPlanCodes || []).filter((code) => code.id !== codeId)
      }));
      if (editingPayerPlanCodeId === codeId) {
        cancelPayerPlanCodeEdit();
      }
    } catch (error) {
      console.error('Error deleting payer plan code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCodeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility) {
      alert('Select a facility before adding transaction codes.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${codeBaseUrl(selectedFacility.id)}/transaction-codes`,
        newTransactionCode,
        { withCredentials: true }
      );
      const createdCode = res.data || { ...newTransactionCode, id: `transaction-code-${Date.now()}` };
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        transactionCodes: [...(facility.transactionCodes || []), createdCode]
      }));
      setNewTransactionCode({ ...EMPTY_TRANSACTION_CODE });
    } catch (error) {
      console.error('Error adding transaction code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const beginTransactionCodeEdit = (code) => {
    setEditingTransactionCodeId(code.id);
    setTransactionCodeEditForm({
      transactionCodeType: code.transactionCodeType || '',
      transactionCode: code.transactionCode || '',
      transactionCodeDescription: code.transactionCodeDescription || ''
    });
  };

  const cancelTransactionCodeEdit = () => {
    setEditingTransactionCodeId(null);
    setTransactionCodeEditForm({ ...EMPTY_TRANSACTION_CODE });
  };

  const handleTransactionCodeUpdate = async (codeId) => {
    if (!selectedFacility) return;
    try {
      setLoading(true);
      const res = await axios.patch(
        `${codeBaseUrl(selectedFacility.id)}/transaction-codes/${codeId}`,
        transactionCodeEditForm,
        { withCredentials: true }
      );
      const updatedCode = res.data || { ...transactionCodeEditForm, id: codeId };
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        transactionCodes: (facility.transactionCodes || []).map((code) =>
          code.id === codeId ? { ...code, ...updatedCode } : code
        )
      }));
      cancelTransactionCodeEdit();
    } catch (error) {
      console.error('Error updating transaction code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCodeDelete = async (codeId) => {
    if (!selectedFacility) return;
    const confirmed = window.confirm('Delete this transaction code? This cannot be undone.');
    if (!confirmed) return;
    try {
      setLoading(true);
      await axios.delete(
        `${codeBaseUrl(selectedFacility.id)}/transaction-codes/${codeId}`,
        { withCredentials: true }
      );
      updateFacilityInState(selectedFacility.id, (facility) => ({
        ...facility,
        transactionCodes: (facility.transactionCodes || []).filter((code) => code.id !== codeId)
      }));
      if (editingTransactionCodeId === codeId) {
        cancelTransactionCodeEdit();
      }
    } catch (error) {
      console.error('Error deleting transaction code:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
                      <div className="relative mt-1" tabIndex={0}>
                        <button
                          type="button"
                          onClick={() => setIsEditTenantTypeOpen((prev) => !prev)}
                          ref={editTenantTypeButtonRef}
                          className={`${editInputClass} flex items-center justify-between`}
                        >
                          <span className={editTenantForm.clientType ? '' : 'text-gray-400'}>
                            {editTenantForm.clientType || 'Select tenant type'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isEditTenantTypeOpen && editTenantTypeMenuStyle && createPortal(
                          <div
                            ref={editTenantTypeMenuRef}
                            style={editTenantTypeMenuStyle}
                            className="z-50 rounded-md border bg-[#1f232a] border-[#ffffff20] shadow-lg"
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
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2f38]"
                              >
                                {option}
                              </button>
                            ))}
                          </div>,
                          document.body
                        )}
                      </div>
                    ) : (
                      <p className="text-white">{selectedTenant.clientType}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    {isEditingTenant ? (
                      <div className="relative mt-1" tabIndex={0}>
                        <button
                          type="button"
                          onClick={() => setIsEditTenantStatusOpen((prev) => !prev)}
                          ref={editTenantStatusButtonRef}
                          className={`${editInputClass} flex items-center justify-between`}
                        >
                          <span className={editTenantForm.status ? '' : 'text-gray-400'}>
                            {editTenantForm.status || 'Select status'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isEditTenantStatusOpen && editTenantStatusMenuStyle && createPortal(
                          <div
                            ref={editTenantStatusMenuRef}
                            style={editTenantStatusMenuStyle}
                            className="z-50 rounded-md border bg-[#1f232a] border-[#ffffff20] shadow-lg"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setEditTenantForm(prev => ({ ...prev, status: option }));
                                  setIsEditTenantStatusOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2f38]"
                              >
                                {option}
                              </button>
                            ))}
                          </div>,
                          document.body
                        )}
                      </div>
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="search"
                      value={facilitySearch}
                      onChange={(e) => setFacilitySearch(e.target.value)}
                      className="w-full sm:w-72 p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#ffffff10] text-white border-[#ffffff20]"
                      placeholder="Search facilities"
                    />
                    <select
                      value={selectedFacilityId}
                      onChange={(e) => {
                        setSelectedFacilityId(e.target.value);
                        setEditingPayerPlanCodeId(null);
                        setEditingTransactionCodeId(null);
                      }}
                      className="w-full sm:w-72 p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none bg-[#1f232a] text-white border-[#ffffff20]"
                    >
                      <option value="" className="bg-[#1f232a] text-white">Select facility</option>
                      {filteredFacilities.map((facility) => (
                        <option key={facility.id} value={facility.id} className="bg-[#1f232a] text-white">
                          {facility.name || 'Unnamed Facility'}{facility.facilityType ? ` - ${facility.facilityType}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                  {facilityTab !== 'facilities' && (
                    <div className="mb-4 rounded-lg border border-[#ffffff10] bg-[#1f232a] p-4">
                      {selectedFacility ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Selected Facility</p>
                            <p className="text-white font-medium">{selectedFacility.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Type</p>
                            <p className="text-white">{selectedFacility.facilityType || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Contact</p>
                            <p className="text-white">{selectedFacility.contact || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Status</p>
                            <p className="text-white">{selectedFacility.status || selectedTenant.status || '-'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Select a facility before entering or managing codes.</p>
                      )}
                    </div>
                  )}
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
                          {filteredFacilities.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-3 py-6 text-sm text-gray-400">
                                {facilities.length === 0 ? 'No facilities added yet.' : 'No facilities match your search.'}
                              </td>
                            </tr>
                          )}
                          {filteredFacilities.map((facility) => (
                            <tr
                              key={facility.id}
                              className={`border-b border-[#ffffff10] text-sm ${
                                String(selectedFacilityId) === String(facility.id) ? 'bg-[#ffffff08]' : ''
                              }`}
                            >
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
                                      onClick={() => setSelectedFacilityId(facility.id)}
                                      className={`px-3 py-2 text-xs font-medium rounded-md transition ${
                                        String(selectedFacilityId) === String(facility.id)
                                          ? 'bg-green-500/20 text-green-300'
                                          : 'bg-[#ffffff10] text-white hover:bg-[#ffffff20]'
                                      }`}
                                    >
                                      {String(selectedFacilityId) === String(facility.id) ? 'Selected' : 'Select'}
                                    </button>
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
                    selectedFacility ? (
                      <form onSubmit={handlePayerPlanCodeSubmit} className="overflow-x-auto">
                        <table className="min-w-[1460px] w-full bg-transparent">
                          <colgroup>
                            <col className="w-[160px]" />
                            <col className="w-[150px]" />
                            <col className="w-[220px]" />
                            <col className="w-[260px]" />
                            <col className="w-[180px]" />
                            <col className="w-[170px]" />
                            <col className="w-[180px]" />
                            <col className="w-[170px]" />
                            <col className="w-[190px]" />
                          </colgroup>
                          <thead>
                            <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
                              <th className="px-3 py-3 text-left">Payer Type</th>
                              <th className="px-3 py-3 text-left">Payer ID</th>
                              <th className="px-3 py-3 text-left">Payer Description</th>
                              <th className="px-3 py-3 text-left">Payer Address</th>
                              <th className="px-3 py-3 text-left">Payer Phone Number</th>
                              <th className="px-3 py-3 text-left">Payer Fax Number</th>
                              <th className="px-3 py-3 text-left">Module</th>
                              <th className="px-3 py-3 text-left">Category</th>
                              <th className="px-3 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]">
                              <td className="px-3 py-3">
                                <select
                                  value={newPayerPlanCode.payerType}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerType: e.target.value }))}
                                  className={`${rowInputClass} bg-[#1f232a] text-white`}
                                  required
                                >
                                  <option value="" className="bg-[#1f232a] text-white">Select type</option>
                                  {PAYER_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  value={newPayerPlanCode.payerId}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerId: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Payer ID"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  value={newPayerPlanCode.payerDescription}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerDescription: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Description"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  value={newPayerPlanCode.payerAddress}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerAddress: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Address"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="tel"
                                  value={newPayerPlanCode.payerPhoneNumber}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerPhoneNumber: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Phone"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="tel"
                                  value={newPayerPlanCode.payerFaxNumber}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, payerFaxNumber: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Fax"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  value={newPayerPlanCode.module}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, module: e.target.value }))}
                                  className={`${rowInputClass} bg-[#1f232a] text-white`}
                                  required
                                >
                                  <option value="" className="bg-[#1f232a] text-white">Select module</option>
                                  {PAYER_MODULE_OPTIONS.map((option) => (
                                    <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  value={newPayerPlanCode.category}
                                  onChange={(e) => setNewPayerPlanCode(prev => ({ ...prev, category: e.target.value }))}
                                  className={`${rowInputClass} bg-[#1f232a] text-white`}
                                  required
                                >
                                  <option value="" className="bg-[#1f232a] text-white">Select category</option>
                                  {PAYER_CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button type="submit" className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all">Add</button>
                                  <button
                                    type="button"
                                    onClick={() => setNewPayerPlanCode({ ...EMPTY_PAYER_PLAN_CODE })}
                                    className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {(selectedFacility.payerPlanCodes || []).length === 0 && (
                              <tr>
                                <td colSpan={9} className="px-3 py-6 text-sm text-gray-400">No payer plan codes added for this facility.</td>
                              </tr>
                            )}
                            {(selectedFacility.payerPlanCodes || []).map((code) => (
                              <tr key={code.id} className="border-b border-[#ffffff10] text-sm">
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <select
                                      value={payerPlanCodeEditForm.payerType}
                                      onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerType: e.target.value }))}
                                      className={`${rowInputClass} bg-[#1f232a] text-white`}
                                      required
                                    >
                                      <option value="" className="bg-[#1f232a] text-white">Select type</option>
                                      {PAYER_TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-white">{code.payerType || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <input value={payerPlanCodeEditForm.payerId} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerId: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.payerId || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <input value={payerPlanCodeEditForm.payerDescription} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerDescription: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.payerDescription || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <input value={payerPlanCodeEditForm.payerAddress} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerAddress: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.payerAddress || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <input type="tel" value={payerPlanCodeEditForm.payerPhoneNumber} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerPhoneNumber: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.payerPhoneNumber || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <input type="tel" value={payerPlanCodeEditForm.payerFaxNumber} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, payerFaxNumber: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.payerFaxNumber || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <select value={payerPlanCodeEditForm.module} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, module: e.target.value }))} className={`${rowInputClass} bg-[#1f232a] text-white`}>
                                      <option value="" className="bg-[#1f232a] text-white">Select module</option>
                                      {PAYER_MODULE_OPTIONS.map((option) => (
                                        <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-white">{code.module || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <select value={payerPlanCodeEditForm.category} onChange={(e) => setPayerPlanCodeEditForm(prev => ({ ...prev, category: e.target.value }))} className={`${rowInputClass} bg-[#1f232a] text-white`}>
                                      <option value="" className="bg-[#1f232a] text-white">Select category</option>
                                      {PAYER_CATEGORY_OPTIONS.map((option) => (
                                        <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-white">{code.category || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {editingPayerPlanCodeId === code.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button type="button" onClick={() => handlePayerPlanCodeUpdate(code.id)} className="px-3 py-2 bg-[#3b3f46] text-white text-xs font-medium rounded-md hover:bg-gray-700 transition">Save</button>
                                      <button type="button" onClick={cancelPayerPlanCodeEdit} className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition">Cancel</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      <button type="button" onClick={() => beginPayerPlanCodeEdit(code)} className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition">Edit</button>
                                      <button type="button" onClick={() => handlePayerPlanCodeDelete(code.id)} className="px-3 py-2 bg-red-500/20 text-red-300 text-xs font-medium rounded-md hover:bg-red-500/30 transition">Delete</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-400">Select a facility before entering or managing payer plan codes.</p>
                    )
                  )}
                  {facilityTab === 'transaction-codes' && (
                    selectedFacility ? (
                      <form onSubmit={handleTransactionCodeSubmit} className="overflow-x-auto">
                        <table className="min-w-[820px] w-full bg-transparent">
                          <colgroup>
                            <col className="w-[220px]" />
                            <col className="w-[220px]" />
                            <col className="w-[260px]" />
                            <col className="w-[160px]" />
                          </colgroup>
                          <thead>
                            <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
                              <th className="px-3 py-3 text-left">Transaction Code Type</th>
                              <th className="px-3 py-3 text-left">Transaction Code</th>
                              <th className="px-3 py-3 text-left">Transaction Code Description</th>
                              <th className="px-3 py-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]">
                              <td className="px-3 py-3">
                                <select
                                  value={newTransactionCode.transactionCodeType}
                                  onChange={(e) => setNewTransactionCode(prev => ({ ...prev, transactionCodeType: e.target.value }))}
                                  className={`${rowInputClass} bg-[#1f232a] text-white`}
                                  required
                                >
                                  <option value="" className="bg-[#1f232a] text-white">Select type</option>
                                  {TRANSACTION_CODE_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  value={newTransactionCode.transactionCode}
                                  onChange={(e) => setNewTransactionCode(prev => ({ ...prev, transactionCode: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Code"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  value={newTransactionCode.transactionCodeDescription}
                                  onChange={(e) => setNewTransactionCode(prev => ({ ...prev, transactionCodeDescription: e.target.value }))}
                                  className={rowInputClass}
                                  placeholder="Description"
                                  required
                                />
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button type="submit" className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all">Add</button>
                                  <button
                                    type="button"
                                    onClick={() => setNewTransactionCode({ ...EMPTY_TRANSACTION_CODE })}
                                    className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {(selectedFacility.transactionCodes || []).length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-6 text-sm text-gray-400">No transaction codes added for this facility.</td>
                              </tr>
                            )}
                            {(selectedFacility.transactionCodes || []).map((code) => (
                              <tr key={code.id} className="border-b border-[#ffffff10] text-sm">
                                <td className="px-3 py-3">
                                  {editingTransactionCodeId === code.id ? (
                                    <select
                                      value={transactionCodeEditForm.transactionCodeType}
                                      onChange={(e) => setTransactionCodeEditForm(prev => ({ ...prev, transactionCodeType: e.target.value }))}
                                      className={`${rowInputClass} bg-[#1f232a] text-white`}
                                    >
                                      <option value="" className="bg-[#1f232a] text-white">Select type</option>
                                      {TRANSACTION_CODE_TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option} className="bg-[#1f232a] text-white">{option}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-white">{code.transactionCodeType || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingTransactionCodeId === code.id ? (
                                    <input value={transactionCodeEditForm.transactionCode} onChange={(e) => setTransactionCodeEditForm(prev => ({ ...prev, transactionCode: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.transactionCode || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {editingTransactionCodeId === code.id ? (
                                    <input value={transactionCodeEditForm.transactionCodeDescription} onChange={(e) => setTransactionCodeEditForm(prev => ({ ...prev, transactionCodeDescription: e.target.value }))} className={rowInputClass} />
                                  ) : (
                                    <span className="text-white">{code.transactionCodeDescription || '-'}</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {editingTransactionCodeId === code.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button type="button" onClick={() => handleTransactionCodeUpdate(code.id)} className="px-3 py-2 bg-[#3b3f46] text-white text-xs font-medium rounded-md hover:bg-gray-700 transition">Save</button>
                                      <button type="button" onClick={cancelTransactionCodeEdit} className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition">Cancel</button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      <button type="button" onClick={() => beginTransactionCodeEdit(code)} className="px-3 py-2 bg-[#ffffff10] text-white text-xs font-medium rounded-md hover:bg-[#ffffff20] transition">Edit</button>
                                      <button type="button" onClick={() => handleTransactionCodeDelete(code.id)} className="px-3 py-2 bg-red-500/20 text-red-300 text-xs font-medium rounded-md hover:bg-red-500/30 transition">Delete</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-400">Select a facility before entering or managing transaction codes.</p>
                    )
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
