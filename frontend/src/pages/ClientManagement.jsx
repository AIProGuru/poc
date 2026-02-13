import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import './ClientManagement.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL } from '../utils/config';

const ClientManagement = () => {
  const navigate = useNavigate();
  const platformApiUrl = `${SERVER_URL}/api`;
  const resolvedApiUrl = platformApiUrl;
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === 'dark';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [newClient, setNewClient] = useState({
    name: '',
    logo: '/logo_sm.svg',
    clientType: '',
    address: '',
    contact: '',
    email: '',
  });
  const [isClientTypeOpen, setIsClientTypeOpen] = useState(false);
  const [logoUploadingId, setLogoUploadingId] = useState(null);
  const CLIENT_TYPE_OPTIONS = [
    'Service Provider',
    'Hospital System',
    'Ambulatory Provider'
  ];
  const MAX_LOGO_BYTES = 1024 * 1024 * 2;

  const resetNewClientRow = () => {
    setNewClient({
      name: '',
      logo: '/logo_sm.svg',
      clientType: '',
      address: '',
      contact: '',
      email: '',
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

  const handleClientTypeSelect = (value) => {
    setNewClient((prev) => ({
      ...prev,
      clientType: value
    }));
    setIsClientTypeOpen(false);
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const handleLogoFileSelect = async (file, clientId) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      alert('Logo must be 2MB or smaller.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (clientId === 'new') {
        setNewClient((prev) => ({
          ...prev,
          logo: dataUrl
        }));
        return;
      }

      setLogoUploadingId(clientId);
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, logo: dataUrl } : client
        )
      );

      await axios.patch(
        `${resolvedApiUrl}/clients/${clientId}`,
        { logo: dataUrl },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error uploading client logo:", error);
      alert(`Error uploading logo: ${error.message}`);
      fetch_clients();
    } finally {
      setLogoUploadingId(null);
    }
  };


  // Function to submit the new client form
  const handleNewClientSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Show loading state
      setLoading(true);

      const requiredFields = [
        { key: 'name', label: 'Client' },
        { key: 'clientType', label: 'Client Type' },
        { key: 'address', label: 'Address' },
        { key: 'contact', label: 'Contact' },
        { key: 'email', label: 'Email' }
      ];

      const missing = requiredFields
        .filter(({ key }) => !String(newClient[key] || '').trim())
        .map(({ label }) => label);

      const emailValue = String(newClient.email || '').trim();
      const emailValid = !emailValue || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

      if (missing.length || !emailValid) {
        const parts = [];
        if (missing.length) parts.push(`Missing: ${missing.join(', ')}`);
        if (!emailValid) parts.push('Invalid email format');
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

  const handleDeleteClient = async (clientId, clientName) => {
    const confirmed = window.confirm(`Delete client "${clientName}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      setLoading(true);
      await axios.delete(`${resolvedApiUrl}/clients/${clientId}`, { withCredentials: true });
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const term = searchTerm.toLowerCase();
      return (
        (client.name || '').toLowerCase().includes(term) ||
        (client.clientType || '').toLowerCase().includes(term) ||
        (client.address || '').toLowerCase().includes(term) ||
        (client.contact || '').toLowerCase().includes(term) ||
        (client.email || '').toLowerCase().includes(term)
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
      <table className="min-w-[1200px] w-full bg-transparent">
        <colgroup>
          <col className="w-[200px]" />
          <col className="w-[220px]" />
          <col className="w-[320px]" />
          <col className="w-[220px]" />
          <col className="w-[280px]" />
          <col className="w-[140px]" />
        </colgroup>
        <thead>
          <tr className="text-[#9ca3af] border-b border-[#ffffff20]">
            <th className="px-3 py-3 text-left" onClick={() => handleSort('name')}>
              Client
              {sortArrow('name')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('clientType')}>
              Client Type
              {sortArrow('clientType')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('address')}>
              Address
              {sortArrow('address')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('contact')}>
              Contact
              {sortArrow('contact')}
            </th>
            <th className="px-3 py-3 text-left" onClick={() => handleSort('email')}>
              Email
              {sortArrow('email')}
            </th>
            <th className="px-3 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="show">
          <motion.tr
            className="border-b border-[#ffffff20] text-[#D9D9D9CC] bg-[#ffffff05]"
            variants={itemVariants}
          >
            <td className="px-3 py-3">
              <div className="flex items-center gap-3">
                <label
                  className="relative flex h-10 w-10 items-center justify-center rounded-md border border-[#ffffff20] bg-[#ffffff08] overflow-hidden cursor-pointer"
                  title="Upload client logo"
                >
                  <img
                    src={newClient.logo || '/default_logo.png'}
                    alt="Client logo"
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleLogoFileSelect(e.target.files?.[0], 'new')}
                  />
                </label>
                <input
                  type="text"
                  name="name"
                  value={newClient.name}
                  onChange={handleNewClientInputChange}
                  className={rowInputClass}
                  placeholder="Client"
                />
              </div>
            </td>
            <td className="px-3 py-3">
              <div
                className="relative"
                tabIndex={0}
                onBlur={() => setIsClientTypeOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsClientTypeOpen((prev) => !prev)}
                  className={`${rowInputClass} flex items-center justify-between`}
                >
                  <span className={newClient.clientType ? '' : 'text-gray-400'}>
                    {newClient.clientType || 'Select type'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isClientTypeOpen && (
                  <div className={`absolute z-20 mt-1 min-w-[220px] max-w-[320px] rounded-md border ${isDark ? 'bg-[#1f232a] border-[#ffffff20]' : 'bg-white border-slate-200'} shadow-lg`}>
                    {CLIENT_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleClientTypeSelect(option)}
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
                name="address"
                value={newClient.address}
                onChange={handleNewClientInputChange}
                className={rowInputClass}
                placeholder="Address"
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
              <td className="px-3 py-4 text-white">
                <div className="flex items-center gap-3">
                  <label
                    className="relative flex h-10 w-10 items-center justify-center rounded-md border border-[#ffffff20] bg-[#ffffff08] overflow-hidden cursor-pointer"
                    title="Upload client logo"
                  >
                    <img
                      src={client.logo || '/default_logo.png'}
                      alt={client.name || 'Client logo'}
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white">
                      {logoUploadingId === client.id ? 'Saving...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleLogoFileSelect(e.target.files?.[0], client.id)}
                    />
                  </label>
                  <span>{client.name || '-'}</span>
                </div>
              </td>
              <td className="px-3 py-4">{client.clientType || '-'}</td>
              <td className="px-3 py-4">{client.address || '-'}</td>
              <td className="px-3 py-4">{client.contact || '-'}</td>
              <td className="px-3 py-4">{client.email || '-'}</td>
              <td className="px-3 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectClient(client.id)}
                    className="px-3 py-1.5 bg-[#ffffff10] hover:bg-[#ffffff20] text-white text-xs font-medium rounded-md transition-all"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client.id, client.name || 'Client')}
                    className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium rounded-md transition-all"
                  >
                    Delete
                  </button>
                </div>
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
            <h1 className="mb-2 text-2xl font-bold">Client Management</h1>
            <p className={isDark ? "text-[#9ca3af]" : "text-slate-500"}>
              Add clients, then manage tenants and facilities from each client dashboard.
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
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
            Client Type options: Service Provider, Hospital System, Ambulatory Provider.
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
                <h3 className="mt-2 text-lg font-medium">No clients found</h3>
                <p className={`mt-1 ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Try adjusting your search.</p>
              </div>
            )}
            <div className={`mt-8 text-center ${isDark ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </>
        )}
    </div>
    </div>
  );
};

export default ClientManagement;
