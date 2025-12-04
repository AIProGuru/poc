import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './ClientManagement.css';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import {  addDoc, serverTimestamp } from 'firebase/firestore';
// First import the necessary Firestore functions at the top of your file
import {  doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);



const ClientManagement = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  // New state variables for additional features
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    logo: './default_logo.png',
    status: 'Pending',
    tier: 'Standard',
    contact: '',
    email: '',
    phone: '',
    lastActivity: new Date().toISOString().split('T')[0],
    denialsCaptured: 0,
    revenueRecovered: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  // State to track new client modal and form
// Updated state to track new client modal and form
const [newClient, setNewClient] = useState({
  name: '',
  logo: './default_logo.png',
  status: 'Pending',
  tier: 'Standard',
  contact: '',
  email: '',
  phone: '',
  lastActivity: new Date().toISOString().split('T')[0],
  denialsCaptured: 0,
  revenueRecovered: 0,
  // New facility fields
  tenantName: '',
  facilityName: '',
  facilityType: '',
  facilityAddress: '',
  facilityTaxID: '',
  facilityNPI: '',
});

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);


  // Function to handle opening the new client modal
  const openNewClientModal = () => {
    setIsNewClientModalOpen(true);
  };

 // Function to handle closing the new client modal
const closeNewClientModal = () => {
  setIsNewClientModalOpen(false);
  // Reset form data
  setNewClient({
    name: '',
    logo: './default_logo.png',
    status: 'Pending',
    tier: 'Standard',
    contact: '',
    email: '',
    phone: '',
    lastActivity: new Date().toISOString().split('T')[0],
    denialsCaptured: 0,
    revenueRecovered: 0,
    // Reset new facility fields
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



// Function to submit the new client form
const handleNewClientSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Show loading state
    setLoading(true);
    
    // Create new client object
    const clientToAdd = {
      ...newClient,
      // Parse numeric values
      denialsCaptured: parseInt(newClient.denialsCaptured) || 0,
      revenueRecovered: parseInt(newClient.revenueRecovered) || 0,
      createdAt: serverTimestamp(), // Add server timestamp
      lastUpdated: serverTimestamp()
    };
    
    // Remove the client-generated ID as Firestore will create its own
    delete clientToAdd.id;
    
    // Add document to Firestore
    const clientsRef = collection(db, 'clients');
    const docRef = await addDoc(clientsRef, clientToAdd);
    const clientId = docRef.id;
    
    // Create a client lookup entry for quick access
    const clientLookupRef = collection(db, 'client_lookup');
    await addDoc(clientLookupRef, {
      clientId: clientId,
      name: clientToAdd.name,
      facilityName: clientToAdd.facilityName,
      tenantName: clientToAdd.tenantName,
      status: clientToAdd.status,
      createdAt: serverTimestamp()
    });
    
    // Add the new client to the local state with the Firestore document ID
    const newClientWithId = {
      ...clientToAdd,
      id: clientId,
      // Convert timestamps back to date strings for local state
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setClients([...clients, newClientWithId]);
    
    // Close modal and reset form
    closeNewClientModal();
    
    // Show success notification
    alert(`Client ${clientToAdd.name} added successfully!`);
  } catch (error) {
    console.error("Error adding client to Firestore:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const actionMenuRef = useRef(null);

  // Click outside handler for action menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetch_clients = async () => {
    try {
      setLoading(true);
      const clientsCollection = collection(db, 'clients');
      const clientsSnapshot = await getDocs(clientsCollection);
      const clientsList = clientsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      setClients(clientsList);
      setLoading(false);
      
      console.log('Clients fetched successfully:', clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
      // If you have toast notifications
      // toast.error('Failed to load client data. Please try again.');
    }
  };

  useEffect(() => {
    // Simulate API call
    fetch_clients();
  }, []);

  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
    setActiveTab('overview');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClientData({ ...newClientData, [name]: value });
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    const newClient = {
      id: clients.length + 1,
      ...newClientData,
      denialsCaptured: parseInt(newClientData.denialsCaptured) || 0,
      revenueRecovered: parseInt(newClientData.revenueRecovered) || 0
    };
    setClients([...clients, newClient]);
    setIsAddClientModalOpen(false);
    setNewClientData({
      name: '',
      logo: './default_logo.png',
      status: 'Pending',
      tier: 'Standard',
      contact: '',
      email: '',
      phone: '',
      lastActivity: new Date().toISOString().split('T')[0],
      denialsCaptured: 0,
      revenueRecovered: 0,
    });
  };

  const exportData = (format) => {
    // Implement actual export logic here
    const fileName = `client_data_${new Date().toISOString().slice(0, 10)}`;
    
    if (format === 'csv') {
      // Example CSV export
      const headers = ['Name', 'Status', 'Tier', 'Contact', 'Email', 'Denials Captured', 'Revenue Recovered'];
      const csvContent = [
        headers.join(','),
        ...filteredClients.map(client => 
          [
            client.name,
            client.status,
            client.tier,
            client.contact,
            client.email,
            client.denialsCaptured,
            client.revenueRecovered
          ].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
    } 
    else if (format === 'json') {
      const jsonContent = JSON.stringify(filteredClients, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.json`;
      link.click();
    }
    else if (format === 'pdf') {
      // In a real implementation, you'd use a library like jsPDF
      alert('PDF export would be implemented here with jsPDF or similar library');
    }
    
    setIsExportMenuOpen(false);
  };

  const toggleActionMenu = (clientId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === clientId ? null : clientId);
  };

 
// Then update the handleQuickAction function:
const handleQuickAction = async (action, clientId, e) => {
  e.stopPropagation();
  setShowActionMenu(null);
  
  // Implement quick actions
  switch(action) {
    case 'message':
      alert(`Send message to client ${clientId}`);
      break;
      
    case 'edit':
      alert(`Edit client ${clientId}`);
      break;
      
    case 'archive': {
      if (window.confirm('Are you sure you want to archive this client?')) {
        try {
          setLoading(true);
          
          // Find the client to archive
          const clientToArchive = clients.find(client => client.id === clientId);
          
          if (clientToArchive) {
            // Add the client to the archived-clients collection
            const archivedClientRef = collection(db, 'archived-clients');
            
            // Add archived timestamp
            const archivedClient = {
              ...clientToArchive,
              archivedAt: serverTimestamp(),
              archivedBy: "current-user", // Replace with actual user ID if available
              archiveReason: "User initiated archive" // You could add a reason input in the future
            };
            
            // Add to archived collection
            await addDoc(archivedClientRef, archivedClient);
            
            // Delete from active clients collection
            const clientDocRef = doc(db, 'clients', clientId);
            await deleteDoc(clientDocRef);
            
            // Update the UI by removing the client from the local state
            setClients(clients.filter(client => client.id !== clientId));
            
            // Show success message
            alert(`Client ${clientToArchive.name} has been archived successfully.`);
          } else {
            throw new Error("Client not found");
          }
        } catch (error) {
          console.error("Error archiving client:", error);
          alert(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
      break;
    }
    
    default:
      break;
  }
};

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => 
      (filterStatus === 'All' || client.status === filterStatus) &&
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key === 'revenueRecovered' || sortConfig.key === 'denialsCaptured') {
        return sortConfig.direction === 'ascending' 
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      } else {
        return sortConfig.direction === 'ascending'
          ? a[sortConfig.key].localeCompare(b[sortConfig.key])
          : b[sortConfig.key].localeCompare(a[sortConfig.key]);
      }
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
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'On Hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getClientProgress = (client) => {
    // Simple algorithm to calculate client onboarding progress
    let progress = 0;
    
    if (client.email) progress += 20;
    if (client.phone) progress += 20;
    if (client.denialsCaptured > 0) progress += 20;
    if (client.revenueRecovered > 0) progress += 20;
    if (client.status === 'Active') progress += 20;
    
    return progress;
  };

  // Chart data for client details
  const prepareChartData = (client) => {
    if (!client) return null;

    const pieData = {
      labels: ['Resolved Denials', 'Pending Denials'],
      datasets: [
        {
          data: [client.denialsCaptured * 0.75, client.denialsCaptured * 0.25], // Assuming 75% resolved
          backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
          borderWidth: 1,
        },
      ],
    };

    // Mock monthly data for demonstration
    const barData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue Recovered',
          data: [
            client.revenueRecovered * 0.1,
            client.revenueRecovered * 0.15,
            client.revenueRecovered * 0.22,
            client.revenueRecovered * 0.18,
            client.revenueRecovered * 0.25,
            client.revenueRecovered * 0.1
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
        },
      ],
    };

    return { pieData, barData };
  };

  // Render functions
  const renderGrid = () => (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {filteredClients.map(client => (
        <motion.div
          key={client.id}
          className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl overflow-hidden shadow-lg border border-[#6C9BE030] hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="relative p-5 pb-3 flex flex-col h-full">
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(client.status)}`}></span>
              <div className="relative">
                <button 
                  onClick={(e) => toggleActionMenu(client.id, e)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showActionMenu === client.id && (
                  <div 
                    ref={actionMenuRef}
                    className="absolute right-0 mt-1 py-1 w-48 bg-[#1a1f35] rounded-md shadow-lg z-10 border border-[#6C9BE030]"
                  >
                    <button 
                      className="px-4 py-2 text-sm text-white hover:bg-[#ffffff15] w-full text-left flex items-center" 
                      onClick={(e) => handleQuickAction('message', client.id, e)}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 10H8.01M12 10H12.01M16 10H16.01M3 5V19L7.8 15.5C8.14582 15.2346 8.56713 15.087 9 15.087H17C18.6569 15.087 20 13.7439 20 12.087V5C20 3.34315 18.6569 2 17 2H6C4.34315 2 3 3.34315 3 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Message
                    </button>
                    <button 
                      className="px-4 py-2 text-sm text-white hover:bg-[#ffffff15] w-full text-left flex items-center"
                      onClick={(e) => handleQuickAction('edit', client.id, e)}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.2322 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="px-4 py-2 text-sm text-red-400 hover:bg-[#ffffff15] w-full text-left flex items-center"
                      onClick={(e) => handleQuickAction('archive', client.id, e)}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H21M5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center mb-4" onClick={() => handleClientClick(client)}>
              <div className="w-16 h-16 bg-[#0B0C14] rounded-lg flex items-center justify-center p-2 mr-4">
                <img src={client.logo} alt={client.name} className="max-w-full max-h-full" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                <p className="text-[#6C9BE0] text-sm">{client.tier} Tier</p>
              </div>
            </div>
            
            <div className="text-[#D9D9D9CC] text-sm space-y-2 mb-4" onClick={() => handleClientClick(client)}>
              <p>Contact: {client.contact}</p>
              <p>Last Activity: {formatDate(client.lastActivity)}</p>
              
              {/* New: Client onboarding progress */}
              {/* <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Onboarding Progress</span>
                  <span>{getClientProgress(client)}%</span>
                </div>
                <div className="w-full bg-[#ffffff10] rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${getClientProgress(client)}%` }}
                  ></div>
                </div>
              </div> */}
            </div>
            
            {/* <div className="mt-auto pt-3 border-t border-[#ffffff20]" onClick={() => handleClientClick(client)}>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-[#6C9BE0]">Denials Captured</p>
                  <p className="text-white font-semibold">{client.denialsCaptured.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#6C9BE0]">Revenue Recovered</p>
                  <p className="text-white font-semibold">{formatCurrency(client.revenueRecovered)}</p>
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-transparent">
        <thead>
          <tr className="text-[#6C9BE0] border-b border-[#ffffff20]">
            <th className="px-4 py-3 text-left" onClick={() => handleSort('name')}>
              Client Name
              {sortConfig.key === 'name' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-left" onClick={() => handleSort('status')}>
              Status
              {sortConfig.key === 'status' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-left" onClick={() => handleSort('contact')}>
              Contact
              {sortConfig.key === 'contact' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-left" onClick={() => handleSort('lastActivity')}>
              Last Activity
              {sortConfig.key === 'lastActivity' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-right" onClick={() => handleSort('denialsCaptured')}>
              Denials
              {sortConfig.key === 'denialsCaptured' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-right" onClick={() => handleSort('revenueRecovered')}>
              Revenue
              {sortConfig.key === 'revenueRecovered' && (
                <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-4 py-3 text-center">Progress</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <motion.tbody variants={containerVariants} initial="hidden" animate="show">
          {filteredClients.map(client => (
            <motion.tr 
              key={client.id}
              className="border-b border-[#ffffff10] text-[#D9D9D9CC] hover:bg-[#ffffff08] cursor-pointer transition-colors"
              variants={itemVariants}
            >
              <td className="px-4 py-4" onClick={() => handleClientClick(client)}>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#0B0C14] rounded-md flex items-center justify-center p-1 mr-2">
                    <img src={client.logo} alt={client.name} className="max-w-full max-h-full" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-xs text-[#6C9BE0]">{client.tier}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4" onClick={() => handleClientClick(client)}>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  client.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                  client.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  <span className={`w-2 h-2 mr-1.5 rounded-full ${getStatusColor(client.status)}`}></span>
                  {client.status}
                </span>
              </td>
              <td className="px-4 py-4" onClick={() => handleClientClick(client)}>{client.contact}</td>
              <td className="px-4 py-4" onClick={() => handleClientClick(client)}>{formatDate(client.lastActivity)}</td>
              <td className="px-4 py-4 text-right" onClick={() => handleClientClick(client)}>{client.denialsCaptured.toLocaleString()}</td>
              <td className="px-4 py-4 text-right" onClick={() => handleClientClick(client)}>{formatCurrency(client.revenueRecovered)}</td>
              <td className="px-4 py-4" onClick={() => handleClientClick(client)}>
                <div className="w-full bg-[#ffffff10] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      getClientProgress(client) < 30 ? 'bg-red-500' :
                      getClientProgress(client) < 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${getClientProgress(client)}%` }}
                  ></div>
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex justify-center">
                  <button 
                    className="p-1.5 rounded-md hover:bg-[#ffffff15] text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction('message', client.id, e);
                    }}
                    title="Send Message"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 10H8.01M12 10H12.01M16 10H16.01M3 5V19L7.8 15.5C8.14582 15.2346 8.56713 15.087 9 15.087H17C18.6569 15.087 20 13.7439 20 12.087V5C20 3.34315 18.6569 2 17 2H6C4.34315 2 3 3.34315 3 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className="p-1.5 rounded-md hover:bg-[#ffffff15] text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction('edit', client.id, e);
                    }}
                    title="Edit Client"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.2322 5.23223L18.7677 8.76777M16.7322 3.73223C17.7085 2.75592 19.2914 2.75592 20.2677 3.73223C21.244 4.70854 21.244 6.29146 20.2677 7.26777L6.5 21.0355H3V17.4644L16.7322 3.73223Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    className="p-1.5 rounded-md hover:bg-[#ffffff15] text-gray-400 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction('archive', client.id, e);
                    }}
                    title="Archive Client"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H21M5 6V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );

  // Client detail modal with tabs
  const ClientDetailModal = () => {
    if (!selectedClient) return null;
    
    const chartData = prepareChartData(selectedClient);
    
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      >
        <motion.div 
          className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl w-full max-w-5xl overflow-hidden border border-[#6C9BE050] shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="relative flex items-center justify-between p-6 border-b border-[#ffffff15]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0B0C14] rounded-lg flex items-center justify-center p-2">
                <img src={selectedClient.logo} alt={selectedClient.name} className="max-w-full max-h-full" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(selectedClient.status)} mr-2`}></span>
                  <span className="text-[#6C9BE0] text-sm">{selectedClient.tier} • {selectedClient.status}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={closeModal}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#ffffff10] rounded-full"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Tabs Navigation */}
        {/* Tabs Navigation */}
<div className="flex border-b border-[#ffffff15]">
  <button 
    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
    onClick={() => setActiveTab('overview')}
  >
    Overview
  </button>
  
  <button 
    className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'activity' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
    onClick={() => setActiveTab('activity')}
  >
    Activity Log
  </button>
</div>
          
          {/* Tab Content */}
         
<div className="p-6">
  {/* Instead of conditional rendering with &&, use CSS to show/hide content */}
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${activeTab === 'overview' ? 'block' : 'hidden'}`}>
    {/* Left Column */}
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
        <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="text-gray-400 w-24">Primary:</span> 
            <span className="text-white">{selectedClient.contact}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-24">Email:</span> 
            <span className="text-white">{selectedClient.email}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-24">Phone:</span> 
            <span className="text-white">{selectedClient.phone}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 w-24">Last Active:</span> 
            <span className="text-white">{formatDate(selectedClient.lastActivity)}</span>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      {/* Additional content here */}
    </div>
    
    {/* Right Column - Charts */}
    {/* Add charts here */}
  </div>
  
  <div className={`${activeTab === 'activity' ? 'block' : 'hidden'}`}>
    <div className="text-center py-8">
      <p className="text-gray-400">Client activity log would be displayed here.</p>
    </div>
  </div>
</div>
          
          {/* Action Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#ffffff15]">
            <div>
              <span className="text-sm text-gray-400">Client ID: #{selectedClient.id}</span>
            </div>
            <div className="flex gap-3">
              <button 
                className="px-4 py-2 bg-[#ffffff10] text-white text-sm rounded-lg hover:bg-[#ffffff20] transition"
                onClick={() => navigate(`/client/${selectedClient.id}/edit`)}
              >
                Edit Client
              </button>
              <button 
                className="px-4 py-2 bg-[#0048FF] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
                onClick={() => navigate(`/client/${selectedClient.id}`)}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Main component render
  return (
    <div className="min-h-screen bg-[#0B0C14] text-white overflow-x-hidden"
         style={{
           backgroundImage: "url('/bg-optimized.png')",
           backgroundPosition: "center top",
           backgroundRepeat: "no-repeat"
         }}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Client Management</h1>
            <p className="text-[#6C9BE0]">Monitor and manage your clients' performance metrics</p>
          </div>
          <button
            onClick={openNewClientModal}
            className="mt-4 sm:mt-0 px-4 py-2.5 bg-[#0048FF] hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Add New Client
          </button>
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
                className="pl-10 p-2.5 w-full lg:w-64 bg-[#ffffff10] rounded-lg text-white placeholder-gray-400 border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <select
              className="p-2.5 pr-4 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none "
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All" className='dark:bg-black dark:text-white'>All Statuses</option>
              <option value="Active" className='dark:bg-black dark:text-white'>Active</option>
              <option value="Pending" className='dark:bg-black dark:text-white'>Pending</option>
              <option value="On Hold" className='dark:bg-black dark:text-white'>On Hold</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3 w-full lg:w-auto justify-between sm:justify-start">
  <span className="text-sm text-gray-400">View:</span>
  <div className="flex p-1 bg-[#ffffff10] rounded-lg">
    <button
      className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-[#ffffff15]'}`}
      onClick={() => setViewMode('grid')}
      title="Grid View"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5C3 3.89543 3.89543 3 5 3H9C10.1046 3 11 3.89543 11 5V9C11 10.1046 10.1046 11 9 11H5C3.89543 11 3 10.1046 3 9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 15C3 13.8954 3.89543 13 5 13H9C10.1046 13 11 13.8954 11 15V19C11 20.1046 10.1046 21 9 21H5C3.89543 21 3 20.1046 3 19V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M13 5C13 3.89543 13.8954 3 15 3H19C20.1046 3 21 3.89543 21 5V9C21 10.1046 20.1046 11 19 11H15C13.8954 11 13 10.1046 13 9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M13 15C13 13.8954 13.8954 13 15 13H19C20.1046 13 21 13.8954 21 15V19C21 20.1046 20.1046 21 19 21H15C13.8954 21 13 20.1046 13 19V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
    <button
      className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-blue-600' : 'hover:bg-[#ffffff15]'}`}
      onClick={() => setViewMode('table')}
      title="Table View"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10H21M3 14H21M3 18H21M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  </div>
</div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6C9BE0]">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium">No clients found</h3>
            <p className="mt-1 text-[#6C9BE0]">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? renderGrid() : renderTable()}
            
            <div className="mt-8 text-center text-[#6C9BE0]">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </>
        )}
    
      
      {/* Client detail modal */}
      {isModalOpen && <ClientDetailModal />}

      {/* New Client Modal */}
      <AnimatePresence>
        {isNewClientModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNewClientModal}
          >
            <motion.div 
              className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl w-full max-w-2xl overflow-hidden border border-[#6C9BE050] shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#ffffff20] p-6">
                <h2 className="text-xl font-semibold text-white">Add New Client</h2>
                <button 
                  onClick={closeNewClientModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleNewClientSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="col-span-1 md:col-span-2">
      <label className="block text-[#6C9BE0] mb-2 text-sm">Client Name</label>
      <input 
        type="text" 
        name="name" 
        value={newClient.name}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
      />
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <label className="block text-[#6C9BE0] mb-2 text-sm">Tenant Name <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="tenantName" 
        value={newClient.tenantName}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Name <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="facilityName" 
        value={newClient.facilityName}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Type <span className="text-red-400">*</span></label>
      <select 
        name="facilityType" 
        value={newClient.facilityType}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      >
        <option value="">Select Facility Type</option>
        <option value="Hospital">Hospital</option>
        <option value="Clinic">Clinic</option>
        <option value="Specialty Center">Specialty Center</option>
        <option value="Rehabilitation Center">Rehabilitation Center</option>
        <option value="Long-term Care">Long-term Care</option>
        <option value="Ambulatory Surgery Center">Ambulatory Surgery Center</option>
        <option value="Other">Other</option>
      </select>
    </div>
    
    <div className="col-span-1 md:col-span-2">
      <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Address <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="facilityAddress" 
        value={newClient.facilityAddress}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Tax ID <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="facilityTaxID" 
        value={newClient.facilityTaxID}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Facility NPI <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="facilityNPI" 
        value={newClient.facilityNPI}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>

    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Contact Person <span className="text-red-400">*</span></label>
      <input 
        type="text" 
        name="contact" 
        value={newClient.contact}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Email <span className="text-red-400">*</span></label>
      <input 
        type="email" 
        name="email" 
        value={newClient.email}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        required
      />
    </div>
    
    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Phone</label>
      <input 
        type="tel" 
        name="phone" 
        value={newClient.phone}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
      />
    </div>
    
    <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Status</label>
      <select 
        name="status" 
        value={newClient.status}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
      >
        <option value="Active">Active</option>
        <option value="Pending">Pending</option>
        <option value="On Hold">On Hold</option>
      </select>
    </div>
    
    {/* <div>
      <label className="block text-[#6C9BE0] mb-2 text-sm">Tier</label>
      <select 
        name="tier" 
        value={newClient.tier}
        onChange={handleNewClientInputChange}
        className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
      >
        <option value="Enterprise">Enterprise</option>
        <option value="Premium">Premium</option>
        <option value="Standard">Standard</option>
      </select>
    </div> */}
    
   
  </div>
  
  <div className="flex justify-end mt-8 space-x-4">
    <button
      type="button"
      onClick={closeNewClientModal}
      className="px-5 py-2.5 bg-[#ffffff10] hover:bg-[#ffffff20] text-white rounded-lg transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-5 py-2.5 bg-[#0048FF] hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
    >
      Add Client
    </button>
  </div>
</form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default ClientManagement;

