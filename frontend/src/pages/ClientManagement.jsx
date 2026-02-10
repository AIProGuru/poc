import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import './ClientManagement.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApiEndpoint } from '../ApiEndpointContext';
import { SERVER_URL } from '../utils/config';

const ClientManagement = () => {
  const navigate = useNavigate();
  const apiUrl = useApiEndpoint();
  const resolvedApiUrl = apiUrl || `${SERVER_URL}/api`;
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === 'dark';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [newClient, setNewClient] = useState({
    name: '',
    logo: './default_logo.png',
    contact: '',
    email: '',
    phone: '',
    tenantName: '',
    facilityName: '',
    facilityType: '',
    facilityAddress: '',
    facilityTaxID: '',
    facilityNPI: '',
  });
  const [isFacilityTypeOpen, setIsFacilityTypeOpen] = useState(false);

  const resetNewClientRow = () => {
    setNewClient({
      name: '',
      logo: './default_logo.png',
      contact: '',
      email: '',
      phone: '',
      tenantName: '',
      facilityName: '',
      facilityType: '',
      facilityAddress: '',
      facilityTaxID: '',
      facilityNPI: '',
    });
  };
  // Function to handle form input changes
  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({
      ...newClient,
      [name]: value
    });
  };

  const handleFacilityTypeSelect = (value) => {
    setNewClient((prev) => ({
      ...prev,
      facilityType: value
    }));
    setIsFacilityTypeOpen(false);
  };



  // Function to submit the new client form
  const handleNewClientSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Show loading state
      setLoading(true);

      const requiredFields = [
        { key: 'name', label: 'Client' },
        { key: 'tenantName', label: 'Tenant' },
        { key: 'facilityName', label: 'Facility' },
        { key: 'facilityType', label: 'Facility Type' },
        { key: 'facilityAddress', label: 'Facility Address' },
        { key: 'facilityTaxID', label: 'Tax ID' },
        { key: 'facilityNPI', label: 'NPI' },
        { key: 'contact', label: 'Contact' },
        { key: 'email', label: 'Email' }
      ];

      const missing = requiredFields
        .filter(({ key }) => !String(newClient[key] || '').trim())
        .map(({ label }) => label);

      const emailValue = String(newClient.email || '').trim();
      const phoneValue = String(newClient.phone || '').trim();
      const emailValid = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      const phoneDigits = phoneValue.replace(/\D/g, '');
      const phoneValid = !phoneValue || (phoneDigits.length >= 7 && /^[0-9()+\-.\s]+$/.test(phoneValue));

      if (missing.length || !emailValid || !phoneValid) {
        const parts = [];
        if (missing.length) parts.push(`Missing: ${missing.join(', ')}`);
        if (!emailValid) parts.push('Invalid email format');
        if (!phoneValid) parts.push('Invalid phone number');
        alert(parts.join(' | '));
        return;
      }
      
      const res = await axios.post(
        `${resolvedApiUrl}/clients`,
        { ...newClient },
        { withCredentials: true }
      );

      const newClientWithId = res.data || {
        ...newClient,
        id: `local-${Date.now()}`
      };
      
      setClients([...clients, newClientWithId]);
      await fetch_clients();
      
      // Reset row inputs
      resetNewClientRow();
      
      // Show success notification
      alert(`Client ${newClient.name} added successfully!`);
    } catch (error) {
      console.error("Error adding client:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetch_clients = async () => {
    try {
      if (!resolvedApiUrl) return;
      setLoading(true);
      const res = await axios.get(`${resolvedApiUrl}/clients`, { withCredentials: true });
      setClients(res.data || []);
      console.log('Clients fetched successfully:', res.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch_clients();
  }, [resolvedApiUrl]);

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectClient = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const term = searchTerm.toLowerCase();
      return (
        (client.name || '').toLowerCase().includes(term) ||
        (client.tenantName || '').toLowerCase().includes(term) ||
        (client.facilityName || '').toLowerCase().includes(term) ||
        (client.facility || '').toLowerCase().includes(term) ||
        (client.facilityType || '').toLowerCase().includes(term) ||
        (client.facilityAddress || '').toLowerCase().includes(term) ||
        (client.facilityTaxID || '').toLowerCase().includes(term) ||
        (client.facilityNPI || '').toLowerCase().includes(term) ||
        (client.contact || '').toLowerCase().includes(term) ||
        (client.email || '').toLowerCase().includes(term) ||
        (client.phone || '').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const aValue = (a[sortConfig.key] || '').toString();
      const bValue = (b[sortConfig.key] || '').toString();
      return sortConfig.direction === 'ascending'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // Utility functions
  // Render functions

  const rowInputClass = `w-full p-2 text-sm rounded-md border focus:ring-gray-500 focus:border-gray-500 focus:outline-none ${
    isDark ? 'bg-[#ffffff10] text-white border-[#ffffff20]' : 'bg-white text-slate-900 border-slate-200'
  }`;
  const sortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>;
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-[1800px] w-full bg-transparent">
        <colgroup>
          <col className="w-[140px]" />
          <col className="w-[140px]" />
          <col className="w-[160px]" />
          <col className="w-[260px]" />
          <col className="w-[320px]" />
          <col className="w-[130px]" />
          <col className="w-[120px]" />
          <col className="w-[220px]" />
          <col className="w-[280px]" />
          <col className="w-[220px]" />
          <col className="w-[110px]" />
        </colgroup>
        <thead>
          <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
            <th className="px-3 py-3 text-left" onClick={() => handleSort('name')}>
              Client
              {sortArrow('name')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('tenantName')}>
              Tenant
              {sortArrow('tenantName')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('facilityName')}>
              Facility
              {sortArrow('facilityName')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('facilityType')}>
              Facility Type
              {sortArrow('facilityType')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('facilityAddress')}>
              Facility Address
              {sortArrow('facilityAddress')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('facilityTaxID')}>
              Tax ID
              {sortArrow('facilityTaxID')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('facilityNPI')}>
              NPI
              {sortArrow('facilityNPI')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('contact')}>
              Contact
              {sortArrow('contact')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('email')}>
              Email
              {sortArrow('email')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('phone')}>
              Phone
              {sortArrow('phone')}
            </th>
            <th className="px-3 py-3 text-center">Select</th>
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="show">
          <motion.tr
            className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]"
            variants={itemVariants}
          >
            <td className="px-3 py-3">
              <input
                type="text"
                name="name"
                value={newClient.name}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Client"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="tenantName"
                value={newClient.tenantName}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Tenant"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="facilityName"
                value={newClient.facilityName}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Facility"
              />
            </td>
            <td className="px-3 py-3">
              <div
                className="relative"
                tabIndex={0}
                onBlur={() => setIsFacilityTypeOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsFacilityTypeOpen((prev) => !prev)}
                  className={`${rowInputClass} flex items-center justify-between`}
                >
                  <span className={newClient.facilityType ? '' : 'text-gray-400'}>
                    {newClient.facilityType || 'Select type'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isFacilityTypeOpen && (
                  <div className={`absolute z-20 mt-1 min-w-[220px] max-w-[320px] rounded-md border ${isDark ? 'bg-[#1f232a] border-[#ffffff20]' : 'bg-white border-slate-200'} shadow-lg`}>
                    {[
                      'Hospital',
                      'Clinic',
                      'Specialty Center',
                      'Rehabilitation Center',
                      'Long-term Care',
                      'Ambulatory Surgery Center',
                      'Other'
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFacilityTypeSelect(option)}
                        className={`w-full text-left px-3 py-2 text-sm whitespace-normal ${isDark ? 'text-gray-200 hover:bg-[#2a2f38]' : 'text-slate-900 hover:bg-slate-100'}`}
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
                name="facilityAddress"
                value={newClient.facilityAddress}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Address"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="facilityTaxID"
                value={newClient.facilityTaxID}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Tax ID"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="facilityNPI"
                value={newClient.facilityNPI}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="NPI"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="text"
                name="contact"
                value={newClient.contact}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Contact"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="email"
                name="email"
                value={newClient.email}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Email"
              />
            </td>
            <td className="px-3 py-3">
              <input
                type="tel"
                name="phone"
                value={newClient.phone}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Phone"
              />
            </td>
            <td className="px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleNewClientSubmit}
                  className="px-3 py-2 bg-[#3b3f46] hover:bg-gray-700 text-white text-xs font-medium rounded-md transition-all"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={resetNewClientRow}
                  className="px-3 py-2 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                >
                  Clear
                </button>
              </div>
            </td>
          </motion.tr>
          {filteredClients.map(client => (
            <motion.tr
              key={client.id}
              className="border-b border-[#ffffff10] text-[#D9D9D9CC] hover:bg-[#ffffff08] transition-colors"
              variants={itemVariants}
            >
              <td className="px-3 py-4 text-white">{client.name || '-'}</td>
              <td className="px-3 py-4">{client.tenantName || '-'}</td>
              <td className="px-3 py-4">{client.facilityName || '-'}</td>
              <td className="px-3 py-4">{client.facilityType || '-'}</td>
              <td className="px-3 py-4">{client.facilityAddress || '-'}</td>
              <td className="px-3 py-4">{client.facilityTaxID || '-'}</td>
              <td className="px-3 py-4">{client.facilityNPI || '-'}</td>
              <td className="px-3 py-4">{client.contact || '-'}</td>
              <td className="px-3 py-4">{client.email || '-'}</td>
              <td className="px-3 py-4">{client.phone || '-'}</td>
              <td className="px-3 py-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSelectClient(client.id)}
                  className="px-3 py-1.5 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                >
                  Select
                </button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );

  // Main component render
  return (
    <div className={`client-management min-h-screen overflow-x-hidden ${isDark ? 'theme-dark bg-[#1e1f24] text-white' : 'theme-light bg-slate-50 text-slate-900'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Client Management</h1>
            <p className={isDark ? "text-[#9ca3af]" : "text-slate-500"}>
              Manage client facilities, tax IDs, NPIs, and contacts in a spreadsheet-style view.
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                className={`pl-10 p-2.5 w-full lg:w-64 rounded-lg border focus:ring-gray-500 focus:border-gray-500 focus:outline-none ${isDark ? 'bg-[#ffffff10] text-white placeholder-gray-400 border-[#ffffff20]' : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200'}`}
                placeholder="Search clients or facilities..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
            Add facilities inline and manage multiple locations per client.
          </p>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={isDark ? "text-[#9ca3af]" : "text-slate-500"}>Loading clients...</p>
          </div>
        ) : (
          <>
            {renderTable()}
            {filteredClients.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium">No facilities found</h3>
                <p className={`mt-1 ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Try adjusting your search.</p>
              </div>
            )}
            <div className={`mt-8 text-center ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
              Showing {filteredClients.length} of {clients.length} facilities
            </div>
          </>
        )}
    </div>
    </div>
  );
};

export default ClientManagement;


