import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './ClientManagement.css';
import { db } from '../FirebaseConfig';
import { doc, getDoc ,updateDoc,collection,query,where,getDocs} from 'firebase/firestore';


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
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('client-management');
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedMetric, setSelectedMetric] = useState('denials');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  
  // Add these state variables at the main component level
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Move fetchUsersForClient function to the main component level
  const fetchUsersForClient = async () => {
    if (!client) return;
    
    try {
      setUsersLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('client', 'array-contains', client.name));
      const querySnapshot = await getDocs(q);
      
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      
      setUsers(usersData);
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
    switch (role) {
      case 'super-admin': return 'bg-purple-600';
      case 'admin': return 'bg-green-600';
      case 'user': default: return 'bg-blue-600';
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
  
  const [newTenant, setNewTenant] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Active'
  });


useEffect(() => {
  // Set loading state
  setLoading(true);
  
  const fetchClientData = async () => {
    try {
      // Create a reference to the client document using the ID from URL params
      const clientDocRef = doc(db, 'clients', clientId);
      
      // Get the document
      const clientDoc = await getDoc(clientDocRef);
      
      // Check if document exists
      if (clientDoc.exists()) {
        // Get data and add the id
        const clientData = {
          id: clientDoc.id,
          ...clientDoc.data()
        };
        
        // Update state with client data
        setClient(clientData);
      } else {
        console.log("No client found with that ID");
        // Navigate back if client not found
        navigate('/clientmanagement', { replace: true });
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      // Handle error (could show error message)
    } finally {
      // Always turn off loading state when done
      setLoading(false);
    }
  };

  // Call the function
  fetchClientData();
}, [clientId, navigate]);

// Add this new state to track the selected tenant
const [selectedTenant, setSelectedTenant] = useState(null);
const [isTenantDetailsOpen, setIsTenantDetailsOpen] = useState(false);

// Add this function to handle opening tenant details
const openTenantDetails = (tenant) => {
  setSelectedTenant(tenant);
  setIsTenantDetailsOpen(true);
};

// Add this component at the end of your file, right before the final return
const TenantDetailsModal = () => {
  const handleClose = () => {
    setIsTenantDetailsOpen(false);
  };


  if (!selectedTenant) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl w-full max-w-4xl overflow-hidden border border-[#6C9BE050] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#ffffff20] p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#0B0C14] rounded-lg flex items-center justify-center p-2 mr-4">
              <svg className="w-7 h-7 text-[#6C9BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedTenant.name}</h2>
              <div className="flex items-center mt-1">
                <span className="text-sm text-[#6C9BE0] mr-2">{selectedTenant.type}</span>
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
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#ffffff10] rounded-full"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-[#6C9BE0] text-sm font-medium mb-3">Contact Information</h3>
              <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-400 w-24">Contact:</span> 
                    <span className="text-white">{selectedTenant.contactName}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24">Email:</span> 
                    <span className="text-white">{selectedTenant.contactEmail}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24">Phone:</span> 
                    <span className="text-white">{selectedTenant.contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Facility Type */}
            <div>
              <h3 className="text-[#6C9BE0] text-sm font-medium mb-3">Facility Type</h3>
              <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                <p className="text-white">{selectedTenant.type}</p>
                <div className="mt-3 flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    selectedTenant.status === 'Active' ? 'bg-green-500' : 
                    selectedTenant.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                  } mr-2`}></span>
                  <span className="text-gray-300">{selectedTenant.status}</span>
                </div>
              </div>
            </div>
            
            {/* Location Information */}
            <div className="md:col-span-2">
              <h3 className="text-[#6C9BE0] text-sm font-medium mb-3">Location</h3>
              <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                <p className="text-white">
                  {selectedTenant.address}, {selectedTenant.city}, {selectedTenant.state} {selectedTenant.zip}
                </p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="md:col-span-2">
              <h3 className="text-[#6C9BE0] text-sm font-medium mb-3">Recent Activity</h3>
              <div className="bg-[#ffffff08] rounded-lg p-5 border border-[#ffffff10]">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="min-w-[40px] h-10 flex items-center justify-center bg-blue-500/20 rounded-full mr-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">48 claims processed successfully</p>
                      <p className="text-xs text-gray-400 mt-1">Today at 2:30 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-[40px] h-10 flex items-center justify-center bg-yellow-500/20 rounded-full mr-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">12 denials requiring attention</p>
                      <p className="text-xs text-gray-400 mt-1">Yesterday at 4:15 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-[40px] h-10 flex items-center justify-center bg-green-500/20 rounded-full mr-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm">$24,350 in revenue recovered</p>
                      <p className="text-xs text-gray-400 mt-1">Last week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-6 border-t border-[#ffffff15]">
          <div>
            <span className="text-sm text-gray-400">Tenant ID: #{selectedTenant.id}</span>
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-[#ffffff10] text-white text-sm rounded-lg hover:bg-[#ffffff20] transition"
              onClick={handleClose}
            >
              Close
            </button>
            <button 
              className="px-4 py-2 bg-[#0048FF] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
              onClick={() => {
                // Add tenant editing functionality here
                handleClose();
              }}
            >
              Edit Tenant
            </button>
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'On Hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getAlertColor = (type) => {
    switch(type) {
      case 'success': return 'border-green-500 bg-green-900/20 text-green-400';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20 text-yellow-400';
      case 'error': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'info':
      default: return 'border-blue-500 bg-blue-900/20 text-blue-400';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
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
                className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030] shadow-lg"
              >
                <h3 className="text-[#6C9BE0] text-sm">Total Denials Captured</h3>
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
                className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030] shadow-lg"
              >
                <h3 className="text-[#6C9BE0] text-sm">Revenue Recovered</h3>
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
                className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030] shadow-lg"
              >
                <h3 className="text-[#6C9BE0] text-sm">Success Rate</h3>
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
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
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
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Tenants</h3>
                  <button 
                    onClick={() => setIsTenantModalOpen(true)}
                    className="px-4 py-2 bg-[#0048FF] text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Tenants
                  </button>
                </div>
        
                <div className="space-y-4">
                  {client.subClients?.map((subClient) => (
                    <div 
                      key={subClient.id}
                      className="bg-[#ffffff08] p-4 rounded-lg hover:bg-[#ffffff10] transition cursor-pointer"
                      onClick={() => openTenantDetails(subClient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="text-white font-medium">{subClient.name}</h4>
                            <span className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-gray-300">
                              {subClient.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              subClient.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {subClient.status}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Denials Captured</p>
                              <p className="text-white">{subClient.denialsCaptured?.toLocaleString() || '0'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Revenue Recovered</p>
                              <p className="text-white">{formatCurrency(subClient.revenueRecovered || 0)}</p>
                            </div>
                          </div>
                        </div>
                        <button 
                          className="p-2 hover:bg-[#ffffff15] rounded-lg transition"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent parent onClick from firing
                            openTenantDetails(subClient);
                          }}
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {(!client.subClients || client.subClients.length === 0) && (
                  <div className="text-center py-12 border border-dashed border-[#6C9BE050] rounded-lg">
                    <svg className="w-16 h-16 mx-auto text-[#6C9BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-lg text-white">No Tenants Yet</p>
                    <p className="mt-2 text-gray-400">Add Tenants to manage multiple facilities under this client.</p>
                  </div>
                )}
              </motion.div>
              {isTenantDetailsOpen && <TenantDetailsModal />}
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
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Users</h3>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="bg-[#ffffff15] text-white px-4 py-2 rounded-lg w-56 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchKeyword}
                onChange={handleUserSearch}
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              className="px-4 py-2 bg-[#0048FF] text-white rounded-lg hover:bg-blue-700 transition flex items-center"
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
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Users List */}
        {!usersLoading && (
          <div className="space-y-4">
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 border border-dashed border-[#6C9BE050] rounded-lg">
                <svg className="w-16 h-16 mx-auto text-[#6C9BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'super-admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : user.role === 'admin' 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'super-admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 0 
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
                      
                      {/* Don't show delete button for gabeo.ai emails */}
                      {!user.email.endsWith('@gabeo.ai') && (
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
                          <span className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-blue-300">
                            All Clients
                          </span>
                        ) : (
                          <>
                            {user.client.slice(0, 3).map((clientName, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-blue-300">
                                {clientName}
                              </span>
                            ))}
                            
                            {user.client.length > 3 && (
                              <div className="group relative">
                                <span className="px-2 py-1 text-xs rounded-full bg-[#ffffff15] text-blue-300 cursor-pointer">
                                  +{user.client.length - 3} more
                                </span>
                                
                                <div className="absolute z-10 left-0 mt-1 w-auto max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                  <div className="p-2 rounded-lg shadow-lg bg-[#232429] text-white border border-gray-700">
                                    <div className="flex flex-wrap gap-1">
                                      {user.client.slice(3).map((clientName, idx) => (
                                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-[#191a1d] text-blue-300">
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
                  <button className="px-3 py-1 rounded-lg bg-[#0048FF] text-white">1</button>
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
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
              <h3 className="text-lg font-semibold text-white mb-4">Claims Dashboard</h3>
              <p className="text-[#6C9BE0]">Detailed claims data and analytics would be displayed here.</p>
              {/* This would be replaced with actual claims data and visualizations */}
              <div className="mt-8 text-center py-20 border border-dashed border-[#6C9BE050] rounded-lg">
                <svg className="w-16 h-16 mx-auto text-[#6C9BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
              <h3 className="text-lg font-semibold text-white mb-4">Client Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[#6C9BE0] font-medium">General Information</h4>
                  
                  <div className="space-y-2">
                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Client Name</p>
                      <p className="text-white">{client.name}</p>
                    </div>
                    
                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Tier</p>
                      <p className="text-white">{client.tier}</p>
                    </div>
                    
                    <div className="bg-[#ffffff08] p-4 rounded-lg">
                      <p className="text-gray-400 text-xs">Status</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(client.status)} mr-2`}></span>
                        <span className="text-white">{client.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[#6C9BE0] font-medium">Billing Information</h4>
                  
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
                <h4 className="text-[#6C9BE0] font-medium mb-4">Notification Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-gray-400 text-sm mt-1">Receive email updates about denial status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Weekly Report</p>
                      <p className="text-gray-400 text-sm mt-1">Receive weekly performance summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#ffffff08] rounded-lg">
                    <div>
                      <p className="text-white">Real-time Alerts</p>
                      <p className="text-gray-400 text-sm mt-1">Receive immediate alerts for critical issues</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#ffffff20] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button className="px-4 py-2 bg-[#ffffff10] text-white rounded-lg hover:bg-[#ffffff20] transition">
                  Reset Defaults
                </button>
                <button className="px-4 py-2 bg-[#0048FF] text-white rounded-lg hover:bg-blue-700 transition">
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
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#121953] to-[#0B0C14] p-6 rounded-xl border border-[#6C9BE030]">
              <h3 className="text-lg font-semibold text-white mb-4">AI Agents Dashboard</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2"/>
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <span className="text-[#6C9BE0] text-sm">1,256 denials processed</span>
                    <span className="text-white text-sm">85% efficient</span>
                  </div>
                </div>
                
                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2"/>
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <span className="text-[#6C9BE0] text-sm">785 write-offs reclaimed</span>
                    <span className="text-white text-sm">92% efficient</span>
                  </div>
                </div>
                
                <div className="bg-[#ffffff08] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="white" strokeWidth="2"/>
                        <path d="M17.5 6.5H17.51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <span className="text-[#6C9BE0] text-sm">505 claims optimized</span>
                    <span className="text-white text-sm">78% efficient</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-[#6C9BE0] font-medium mb-4">AI Agent Performance</h4>
                <div className="bg-[#ffffff08] p-6 rounded-lg">
                  {/* AI Performance charts would go here */}
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-[#6C9BE0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      ...formData, // Use formData directly instead of newTenant
      facilityName: client.name,
      facilityId: client.id,
      id: `tenant-${Date.now()}`, // Generate unique ID for the tenant
      denialsCaptured: 0,
      revenueRecovered: 0,
      createdAt: new Date().toISOString()
    };
    
    // Create a reference to the client document
    const clientDocRef = doc(db, 'clients', client.id);
    
    // Get the current client data
    const clientDoc = await getDoc(clientDocRef);
    
    if (clientDoc.exists()) {
      // Create a copy of the client's data
      const clientData = clientDoc.data();
      
      // Initialize subClients array if it doesn't exist
      const subClients = clientData.subClients || [];
      
      // Add the new tenant to the subClients array
      const updatedSubClients = [...subClients, tenantToAdd];
      
      // Update the document in Firestore
      await updateDoc(clientDocRef, {
        subClients: updatedSubClients
      });
      
      // Update local state
      setClient(prev => ({
        ...prev,
        subClients: updatedSubClients
      }));
      
      // Reset form and close modal
      setNewTenant({
        name: '',
        type: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        status: 'Active'
      });
      
      setIsTenantModalOpen(false);
      
      // Show success message
      alert(`Tenant ${tenantToAdd.name} added successfully!`);
    } else {
      throw new Error("Client document not found");
    }
  } catch (error) {
    console.error("Error adding tenant:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Revised TenantModal component to fix the data submission issue
const TenantModal = () => {
  // Create a local state to manage the form values
  const [formState, setFormState] = useState({...newTenant});
  
  const handleLocalInputChange = (e) => {
    const { name, value } = e.target;
    // Update the local state without losing focus
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form directly with form state data
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pass the form state directly to the submit handler
    handleTenantSubmit(formState);
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
        className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl w-full max-w-2xl overflow-hidden border border-[#6C9BE050] shadow-2xl"
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Facility Name (non-editable) */}
          <div className="mb-6">
            <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Name</label>
            <div className="w-full p-2.5 bg-[#ffffff08] rounded-lg text-white border border-[#ffffff15] font-medium">
              {client.name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[#6C9BE0] mb-2 text-sm">Tenant Name <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                name="name" 
                value={formState.name}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            {/* Tenant Type */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[#6C9BE0] mb-2 text-sm">Tenant Type <span className="text-red-400">*</span></label>
              <select 
                name="type" 
                value={formState.type}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="" disabled>Select Tenant Type</option>
                <option value="Hospital">Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Specialty Center">Specialty Center</option>
                <option value="Rehabilitation Center">Rehabilitation Center</option>
                <option value="Long-term Care">Long-term Care</option>
                <option value="Ambulatory Surgery Center">Ambulatory Surgery Center</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-[#6C9BE0] mb-2 text-sm">Street Address <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                name="address" 
                value={formState.address}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            {/* City, State, Zip */}
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">City <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                name="city" 
                value={formState.city}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#6C9BE0] mb-2 text-sm">State <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="state" 
                  value={formState.state}
                  onChange={handleLocalInputChange}
                  className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[#6C9BE0] mb-2 text-sm">ZIP <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="zip" 
                  value={formState.zip}
                  onChange={handleLocalInputChange}
                  className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Contact Name <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                name="contactName" 
                value={formState.contactName}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Contact Email <span className="text-red-400">*</span></label>
              <input 
                type="email" 
                name="contactEmail" 
                value={formState.contactEmail}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Contact Phone <span className="text-red-400">*</span></label>
              <input 
                type="tel" 
                name="contactPhone" 
                value={formState.contactPhone}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Status</label>
              <select 
                name="status" 
                value={formState.status}
                onChange={handleLocalInputChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-[#ffffff10] hover:bg-[#ffffff20] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0048FF] hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Add Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  // Main render
  return (
    <div className="min-h-screen bg-[#0B0C14] text-white"
      style={{
        backgroundImage: "url('/bg-optimized.png')",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat"
      }}>
      
      {/* Header with client info and back button */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/clientmanagement')} 
            className="mr-4 p-2 bg-[#ffffff10] rounded-lg hover:bg-[#ffffff20] transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          
          <div className="ml-auto relative">
            <button 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition p-2 rounded-lg hover:bg-[#ffffff10]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V5.01M12 12V12.01M12 19V19.01M12 6C11.4477 6 11 5.55228 11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6ZM12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13ZM12 20C11.4477 20 11 19.5523 11 19C11 18.4477 11.4477 18 12 18C12.5523 18 13 18.4477 13 19C13 19.5523 12.5523 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Actions</span>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-[#1a1f35] rounded-lg shadow-xl z-10 border border-[#6C9BE030]">
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#ffffff15]">
                  Edit Client
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#ffffff15]">
                  Send Message
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#ffffff15]">
                  Export Reports
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#ffffff15]">
                  Archive Client
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6C9BE0]">Loading client dashboard...</p>
          </div>
        </div>
      ) : !client ? (
        <div className="container mx-auto px-4">
          <div className="text-center py-24">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium">Client Not Found</h3>
            <p className="mt-2 text-[#6C9BE0]">We couldn't find the client you're looking for.</p>
            <button 
              onClick={() => navigate('/client-management')}
              className="mt-6 px-4 py-2 bg-[#0048FF] text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Client Management
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Client info panel */}
          <div className="container mx-auto px-4 py-6">
            <div className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl border border-[#6C9BE030] p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="w-20 h-20 bg-[#0B0C14] rounded-lg flex items-center justify-center p-3 mr-6 mb-4 md:mb-0">
                  <img src={client.logo} alt={client.name} className="max-w-full max-h-full" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold">{client.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(client.status)} mr-2`}></span>
                      <span className="text-[#6C9BE0]">{client.status}</span>
                    </div>
                    <div className="text-[#6C9BE0]">
                      <span className="text-gray-400 mr-2">Tier:</span> 
                      {client.tier}
                    </div>
                    <div className="text-[#6C9BE0]">
                      <span className="text-gray-400 mr-2">Last Activity:</span>
                      {formatDate(client.lastActivity)}
                    </div>
                  </div>
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
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'overview' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'claims' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('claims')}
              >
                Claims
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'ai-agents' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('ai-agents')}
              >
                AI Agents
              </button> */}
              <button 
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'client-management' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
      onClick={() => handleTabChange('client-management')}
    >
      Tenant Management
    </button>

    <button 
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'users' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
      onClick={() => handleTabChange('users')}
    >
      Users
    </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'settings' ? 'text-white bg-[#ffffff15] border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`} 
                onClick={() => handleTabChange('settings')}
              >
                Settings
              </button>
             
            </div>
          </div>

          {/* Main Content Area */}
          <div className="container mx-auto px-4 py-6 pb-16">
            {renderContent()}
          </div>

          {/* Tenant Modal */}
          {isTenantModalOpen && <TenantModal />}
        </>
      )}
    </div>
  );
};

export default ClientDashboard;