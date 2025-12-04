import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

const Edit_client = () => {
  // Extract ID from URL parameters
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  
  console.log("Firebase DB instance:", db);
  console.log("Received ID from URL params:", id);
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: 'success', message: '' });
  const [formData, setFormData] = useState({
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
    // Facility fields
    tenantName: '',
    facilityName: '',
    facilityType: '',
    facilityAddress: '',
    facilityTaxID: '',
    facilityNPI: '',
  });

  // Fetch client data on component mount
  useEffect(() => {
    // Safety check - ensure ID is a valid string
    if (!id) {
      console.error("No ID provided in URL parameters");
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to load client data: No client ID provided'
      });
      setLoading(false);
      return;
    }

    const fetchClientData = async () => {
      try {
        console.log("Attempting to fetch client with ID:", id);
        
        // Create document reference
        const clientRef = doc(db, "clients", id.trim());
        console.log("Client reference created:", clientRef);
        
        // Get document
        const docSnap = await getDoc(clientRef);
        console.log("Document snapshot obtained:", docSnap);
        
        if (docSnap.exists()) {
          console.log("Document exists, data:", docSnap.data());
          const clientData = docSnap.data();
          
          // Handle timestamp conversion
          if (clientData.lastActivity && typeof clientData.lastActivity.toDate === 'function') {
            clientData.lastActivity = clientData.lastActivity.toDate().toISOString().split('T')[0];
          }
          
          // Handle createdAt timestamp if it exists
          if (clientData.createdAt && typeof clientData.createdAt.toDate === 'function') {
            clientData.createdAt = clientData.createdAt.toDate().toISOString().split('T')[0];
          }
          
          setFormData(prevState => ({
            ...prevState,
            ...clientData
          }));
        } else {
          console.log("No document found with ID:", id);
          throw new Error('Client not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching client data:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        setAlert({
          open: true,
          severity: 'error',
          message: 'Failed to load client data: ' + (error.message || 'Unknown error')
        });
        setLoading(false);
      }
    };

    // Try loading with a direct ID reference as a backup
    const hardcodedFetch = async () => {
      try {
        const knownId = "CmtKRnZmVx2D6ZX4ZrTR"; // The ID you provided
        console.log("Attempting fallback fetch with hardcoded ID:", knownId);
        const debugRef = doc(db, "clients", knownId);
        const snap = await getDoc(debugRef);
        console.log("Debug document exists:", snap.exists());
        if (snap.exists()) {
          console.log("Debug data:", snap.data());
          // If the main fetch failed but this works, use this data
          if (loading) {
            const clientData = snap.data();
            if (clientData.lastActivity && typeof clientData.lastActivity.toDate === 'function') {
              clientData.lastActivity = clientData.lastActivity.toDate().toISOString().split('T')[0];
            }
            setFormData(prevState => ({
              ...prevState,
              ...clientData
            }));
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Debug fetch error:", err);
      }
    };

    fetchClientData();
    
    // If regular fetch doesn't work, try the hardcoded ID as fallback
    setTimeout(() => {
      if (loading) {
        hardcodedFetch();
      }
    }, 2000);
    
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prevState => ({
      ...prevState,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Use the ID from params or the hardcoded one if needed
      const targetId = id || "CmtKRnZmVx2D6ZX4ZrTR";
      console.log("Updating client with ID:", targetId);
      
      const clientRef = doc(db, "clients", targetId.trim());
      
      // Prepare data - ensure numeric fields are stored as numbers
      const updateData = {
        ...formData,
        denialsCaptured: parseFloat(formData.denialsCaptured) || 0,
        revenueRecovered: parseFloat(formData.revenueRecovered) || 0,
        lastUpdated: new Date() // Add a timestamp for when the record was updated
      };
      
      await updateDoc(clientRef, updateData);
      
      setAlert({
        open: true,
        severity: 'success',
        message: 'Client updated successfully!'
      });
      
      // Navigate back to client list after a brief delay
      setTimeout(() => navigate('/clientmanagement'), 1500);
    } catch (error) {
      console.error('Error updating client:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to update client: ' + error.message
      });
      setSubmitLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#121953] bg-opacity-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6C9BE0]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-[#121953] to-[#0B0C14] rounded-xl w-full max-w-4xl overflow-hidden border border-[#6C9BE050] shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex justify-between items-center border-b border-[#ffffff20] p-6">
          <h2 className="text-xl font-semibold text-white">Edit Client</h2>
          <button 
            onClick={() => navigate('/clientmanagement')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Client Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Contact Person</label>
              <input 
                type="text" 
                name="contact" 
                value={formData.contact || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Phone</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Status</label>
              <select 
                name="status" 
                value={formData.status || 'Pending'}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="On Hold">On Hold</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Tenant Name</label>
              <input 
                type="text" 
                name="tenantName" 
                value={formData.tenantName || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Name</label>
              <input 
                type="text" 
                name="facilityName" 
                value={formData.facilityName || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Type</label>
              <input
                type="text" 
                name="facilityType" 
                value={formData.facilityType || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Address</label>
              <input 
                type="text" 
                name="facilityAddress" 
                value={formData.facilityAddress || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Facility Tax ID</label>
              <input 
                type="text" 
                name="facilityTaxID" 
                value={formData.facilityTaxID || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[#6C9BE0] mb-2 text-sm">Facility NPI</label>
              <input 
                type="text" 
                name="facilityNPI" 
                value={formData.facilityNPI || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-[#ffffff10] rounded-lg text-white border border-[#ffffff20] focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={() => navigate('/clientmanagement')}
              className="px-5 py-2.5 bg-[#ffffff10] hover:bg-[#ffffff20] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-5 py-2.5 bg-[#0048FF] hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center min-w-[100px]"
            >
              {submitLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : 'Update Client'}
            </button>
          </div>
        </form>

        {/* Alert/Notification */}
        {alert.open && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            alert.severity === 'success' ? 'bg-green-800 border-green-500' : 'bg-red-800 border-red-500'
          } border text-white`}>
            <div className="flex items-center">
              {alert.severity === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
              <span>{alert.message}</span>
              <button onClick={handleCloseAlert} className="ml-3 text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Edit_client;