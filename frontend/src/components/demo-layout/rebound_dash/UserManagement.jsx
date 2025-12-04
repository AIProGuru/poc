import React, { useState, useEffect } from 'react';
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import MultiSelect from '../../MultiSelect';
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { db } from '../../../FirebaseConfig';
import { auth } from '../../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { SERVER_URL } from '../../../utils/config';
import axios from 'axios';
import { deleteUser } from 'firebase/auth';


const UserRoleCell = ({ row, onUpdateRole,theme }) => {
  const [selectedRole, setSelectedRole] = useState(row.role);

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);
    onUpdateRole(row.id, newRole);
  };
  const isGabeoEmail = (email) => {
    return email?.toLowerCase().endsWith('@gabeo.ai');
  };


  return (
    <td>
      <div className="flex items-center space-x-2">
      <select
  value={selectedRole}
  onChange={handleRoleChange}
  className={`border border-gray-600 w-[159px] px-2 py-1 rounded-lg appearance-none cursor-pointer ${
    theme === 'dark' 
      ? "bg-[#151619] text-white" 
      : "bg-white text-gray-500"
  }`}
  style={{
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  }}
>
  <option value="user" className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`}>User</option>
      
      {!isGabeoEmail(row.email) && (
    <option value="super-admin" className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`}>
    Super Admin
  </option>
  )}
  {isGabeoEmail(row.email) && (
    <option value="admin" className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`}>Admin</option>
  )}
</select>
      </div>
    </td>
  );
};




const UserManagement = () => {
  const [assignFilter, setAssignFilter] = useState({
    client: ['Rebound','Medevolve'],
    selectedClient: [],
    facility: [],
    selectedFacility: [],
    clientState: ['Recoverable', 'Non-Recoverable', 'Patient Resp', 'Delinquent'],
    selectedClientState: [],
    denialCategory: useSelector((state) => state.tags.allTags),
    selectedDenialCategory: [],
    payer: useSelector((state) => state.tags.allPayers),
    selectedPayer: [],
    value: ['$1-$499', '$500-$999', '$1000-$4999', '$5000-$9999', '$10000-$24999', '$25000+'],
    selectedValue: [],
  })
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(10);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const pageSizes = [5, 10, 20, 25];
  const [totalUsers, setTotalUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [user, setUser] = useState({
    user_id:'',
    firstname: '',
    lastname: '',
    email: '',
    role: 'user',
    password: '',
    status: 0,
    access_level: 0,
    client: [],
    facility: [],
    clientState: [],
    denialCategory: [],
    payer: [],
    value: [],
  });

  const generatePassword = (length) => {
    const numbers = '0123456789';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let password = '';

    // Ensure at least two of each required type
    for (let i = 0; i < 2; i++) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += upperCase[Math.floor(Math.random() * upperCase.length)];
      password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    // Add random characters to meet the desired length
    const allChars = numbers + upperCase + lowerCase + specialChars;
    while (password.length < length) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to ensure random order
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setUser({ ...user, password: password });
  }

  const handleUpdateRole = (userId, newRole) => {
    // Update the user's role in Firestore or any other source
    const userRef = doc(db, 'users', userId);
    setDoc(userRef, { role: newRole }, { merge: true })
      .then(() => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success('Role updated successfully');
      })
      .catch(error => {
        toast.error('Failed to update role');
        console.error('Error updating role:', error);
      });
  };

  const [update_user_id,setUpdate_user_id]=useState('')
  

  const handleUserUpdate = (userId, updatedUser) => {
    // Log the data being sent
    console.log("Updating user with ID:", userId);
    console.log("Updated user data:", updatedUser);
    console.log("Previous user data:", users.find(user => user.id === userId));
  
    const userRef = doc(db, 'users', userId);
    setDoc(userRef, updatedUser, { merge: true })
      .then(() => {
        console.log("Update successful!");
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, ...updatedUser } : user
          )
        );
        toast.success('User updated successfully');
      })
      .catch(error => {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      });
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Add the EditUserModal component
  const EditUserModal = ({ open, onClose, userData, theme }) => {
    const [formData, setFormData] = React.useState({
      firstname: userData?.firstname || '',
      lastname: userData?.lastname || '',
      email: userData?.email || '',
      role: userData?.role || 'user',
      status: userData?.status || 0,
      id: userData?.id
    });
  
    React.useEffect(() => {
      if (userData) {
        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          role: userData.role || 'user',
          status: userData.status || 0,
          id: userData.id
        });
      }
    }, [userData]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await handleUserUpdate(formData.id, formData);
        onClose();
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      }
    };
  
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="edit-user-modal"
      >
        <Box className={`absolute w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 rounded-xl ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}>
          <form onSubmit={handleSubmit} className={`flex p-9 rounded-xl flex-col gap-4 ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-800'}`}>
            <div className='text-[32px] font-semibold text-center'>
              Edit User
            </div>
            
            <div className='flex gap-2'>
              <div className='flex flex-col gap-[6px] w-1/2'>
                <span className='text-[14px] font-medium'>First Name</span>
                <input 
                  type="text" 
                  className="text-sm rounded-lg block w-full py-2 px-3 border border-gray-600 bg-transparent"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                />
              </div>
              <div className='flex flex-col gap-[6px] w-1/2'>
                <span className='text-[14px] font-medium'>Last Name</span>
                <input 
                  type="text" 
                  className="text-sm rounded-lg block w-full py-2 px-3 border border-gray-600 bg-transparent"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                />
              </div>
            </div>
  
            <div className='flex flex-col gap-2'>
              <span>Email</span>
              <input 
                type="email" 
                className="text-sm rounded-lg block w-full py-2 px-3 border border-gray-600 bg-transparent"
                value={formData.email}
                readOnly
              />
            </div>
  
            <div className='flex flex-col gap-2'>
              <span>Role</span>
              <select 
                className={`text-sm rounded-lg block w-full py-2 px-3 border border-gray-600 ${
                  theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-500'
                }`}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">User</option>
                {!formData.email?.toLowerCase().endsWith('@gabeo.ai') && (
                  <option value="super-admin">Super Admin</option>
                )}
                {formData.email?.toLowerCase().endsWith('@gabeo.ai') && (
                  <option value="admin">Admin</option>
                )}
              </select>
            </div>
  
            <div className='flex flex-col gap-2'>
              <span>Status</span>
              <div className={`relative p-1 rounded-lg flex w-full ${theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-gray-100'}`}>
                {['Active', "Inactive"].map((status, index) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: index })}
                    className={`flex-1 py-2 px-4 rounded-sm ${
                      formData.status === index 
                        ? `${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'} ${
                            index === 0 ? 'text-green-600' : 
                            index === 1 ? 'text-orange-400' : 
                            'text-red-600'
                          }` 
                        : 'text-gray-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
  
            <div className='flex gap-4 mt-6'>
              <button
                type="button"
                className='flex-1 rounded-lg text-[16px] font-semibold bg-[#c1d8fa] text-[#005DE2] py-[10px] border border-solid'
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className='flex-1 rounded-lg text-[16px] font-semibold py-[10px] border border-solid text-white bg-[#005DE2]'
              >
                Save Changes
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    );
  };

  const addUser_backend = async (e) => {
    e.preventDefault();
    const token = await auth.currentUser.getIdToken()
    const data = await fetch(`${SERVER_URL}/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token

      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        status: user.status

      })
    })
    console.log(data)
    if (data.status === 200) {
      toast.success("User created!")
      setShowUserModal(false);
      setUser({
        firstname: '',
        lastname: '',
        email: '',
        role: '',
        status: 0
      })
    }
  }


  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);

const DeleteConfirmationModal = () => (
  <div className="fixed inset-0 z-50 mt-2 sm:mt-32" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <div className={`inline-block transform overflow-hidden rounded-lg p-1 backdrop-blur-lg text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle ${
        theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#cee0fb]'
      }`}>
        <div className={`rounded-xl px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${
          theme === 'dark' ? 'bg-[#151619]' : 'bg-white'
        }`}>
          <div className="sm:flex sm:items-start flex-col">
            <div className='flex flex-row justify-between gap-x-3'>
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className={`text-lg font-medium leading-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Delete User</h3>
            </div>
            <hr className={`border w-full mt-5 ${
              theme === 'dark' ? 'border-gray-700' : 'border-[#e4e4e4]'
            }`} />
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <div className="mt-3">
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Are you sure you want to delete the user <span className='font-bold'>{userToDelete.firstname} {userToDelete.lastname}</span> from the system? This action cannot be undone, and all user data will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 `}>
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => {
              handleDeleteUser(userToDelete.id, userToDelete.email);
              setShowDeleteModal(false);
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-[#c1d8fa] px-4 py-2 text-base font-medium text-[#005DE2] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

  const handleDeleteUser = async (userId,email) => {
    console.log('handleDeleteUser called with userId:', userId);
    setLoading(true);
    try {
      
      const token = await auth.currentUser.getIdToken()
  
      const data = await fetch(`${SERVER_URL}/api/v1/admin-delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
  
        },
        body: JSON.stringify({
          user_id: userId,
          email: email
        })
      })
      console.log(data)
      if (data.status === 200) {
        toast.success("User deleted!")
        const newUsers = users.filter(user => user.id !== userId);
        setUsers(newUsers);
      }

    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTotalUsers(usersList);
      setUsers(usersList.slice(0, currentPageSize));
      setTotalPage(Math.ceil(usersList.length / currentPageSize));
      console.log(usersList)
    } catch (error) {
      toast.error('Error fetching users');
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPageSize]);

  useEffect(() => {
    setTotalPage(Math.ceil(users.length / currentPageSize))
  }, [currentPageSize]);

  useEffect(() => {
    const searchTerm = searchKeyword.toLowerCase();
    let filteredUsers = totalUsers.filter((row) => {
      const firstname = (row.firstname || '').toLowerCase();
      const lastname = (row.lastname || '').toLowerCase();
      const email = (row.email || '').toLowerCase();
      
      const matchesSearch = firstname.includes(searchTerm) || 
                           lastname.includes(searchTerm) || 
                           email.includes(searchTerm);
                           
      const matchesFilter = activeFilter === 'all' ||
                           (activeFilter === 'approved' && row.status === 0) ||
                           (activeFilter === 'pending' && row.status === 1) 
                          //  (activeFilter === 'refused' && row.status === 2);
                           
      return matchesSearch && matchesFilter;
    });
    
    setUsers(filteredUsers);
    setTotalPage(Math.ceil(filteredUsers.length / currentPageSize));
    setCurrentPage(1);
  }, [searchKeyword, totalUsers, currentPageSize, activeFilter]);
  const theme = useSelector((state) => state.app.theme);

  const isGabeoEmail = (email) => {
    return email?.toLowerCase().endsWith('@gabeo.ai');
  };

  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add this component within your UserManagement component
  const FilterModal = () => (
    <Modal
      open={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      aria-labelledby="filter-modal"
    >
      <Box className={`absolute rounded-xl border-none w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}>
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-600'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Filter Users</h2>
            <button onClick={() => setShowFilterModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Status</span>
              <div className="space-y-2">
                {['all', 'approved', 'pending'].map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={activeFilter === status}
                      onChange={() => setActiveFilter(status)}
                      className="form-radio text-blue-600"
                    />
                    <span className="capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Add more filter options here */}
          </div>
  
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setActiveFilter('all');
                setShowFilterModal(false);
              }}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );


  return (
    <div className={`flex flex-col  rounded-lg   gap-6 ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'}`}
    style={{
    'fontFamily':'nunito'
    }}>
     <div className="flex flex-col gap-4 px-3">
  {/* Desktop and Mobile Container */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    {/* Filter Pills - Left side on desktop, top on mobile */}
    <div className="w-full sm:w-full order-2">
 
</div>

{/* Add this near your other modals */}
{showFilterModal && <FilterModal />}

    {/* Search and Add Button - Right side on desktop, bottom on mobile */}
    <div className="flex items-center gap-4 order-2">
      <div className="relative flex-1 sm:w-[300px]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.98913 15.2496C11.6327 15.2496 14.5864 12.2959 14.5864 8.6524C14.5864 5.00885 11.6327 2.05518 7.98913 2.05518C4.34558 2.05518 1.39191 5.00885 1.39191 8.6524C1.39191 12.2959 4.34558 15.2496 7.98913 15.2496Z" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.2808 15.9441L13.8919 14.5552" stroke="#9598B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <input
          placeholder="Search"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setSearchKeyword(e.target.value);
          }}
          className={`text-sm rounded-lg block w-full py-2.5 px-4 pl-10 text-gray-700 ${
            theme === 'dark' 
              ? "bg-[#151619] text-white border border-gray-600" 
              : "text-black bg-white border border-gray-300"
          }`}
        />
      </div>
      <div className="relative">
    <button
      onClick={() => setShowFilterModal(true)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        theme === 'dark' 
          ? 'bg-[#191a1d] text-white hover:bg-[#1e1f23]' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
      } border border-gray-300`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <span className="text-sm font-medium">Filter</span>
      {activeFilter !== 'all' && (
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
      )}
    </button>
  </div>
      <div className='flex-shrink-0 flex items-center justify-center bg-[#005DE2] rounded-lg w-[40px] h-[40px] text-white cursor-pointer hover:bg-blue-700 transition-colors'
        onClick={() => {
          generatePassword(12);
          setShowUserModal(true);
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.9974 1.16666V12.8333M1.16406 6.99999H12.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</div>

      <div className={`flex flex-col ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} rounded-xl p-2 `}>
      <div className="w-full overflow-x-auto rounded-lg" style={{ maxHeight: '500px' }}>
  <table className="min-w-full  font-nunito">
    <thead className=" sticky top-0 z-10">
      <tr>
        <th scope="col" className={` ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[50px]`}>
          <div className="flex items-center gap-2">
            #
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.9974 0.666748C6.36559 0.666748 6.66406 0.965225 6.66406 1.33341V9.05727L10.1927 5.52868C10.453 5.26833 10.8751 5.26833 11.1355 5.52868C11.3958 5.78903 11.3958 6.21114 11.1355 6.47149L6.4688 11.1382C6.20845 11.3985 5.78634 11.3985 5.52599 11.1382L0.859325 6.47149C0.598975 6.21114 0.598975 5.78903 0.859325 5.52868C1.11967 5.26833 1.54178 5.26833 1.80213 5.52868L5.33073 9.05727V1.33341C5.33073 0.965225 5.62921 0.666748 5.9974 0.666748Z" fill="#1A3F59" />
            </svg>
          </div>
        </th>
        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[130px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'}`}>
          <div className="flex items-center gap-2">
           First Name
         
          </div>
        </th>
        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[130px] ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'}`}>
          <div className="flex items-center gap-2">
           Last Name
         
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[200px] `}>
          <div className="flex items-center gap-2">
            Email
            
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[200px] `}>
          <div className="flex items-center gap-2">
            Role
            
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[120px] `}>
          <div className="flex items-center gap-2">
            Status
           
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[10px] `}>
          <div className="flex items-center gap-2">
            Actions
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[10px] `}>
          <div className="flex items-center gap-2">
            Access  
          </div>
        </th>
        <th scope="col" className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider min-w-[10px] `}>
          <div className="flex items-center gap-2">
            Edit
          </div>
        </th>
      </tr>
    </thead>
    <tbody className={`relative ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'}`}>
    {searchKeyword.length > 0 && users.length === 0 && (
  <tr className="w-full">
    <td colSpan="7" className="w-full">
      <div className=" w-full text-white text-center py-2">
        <div className="px-6 py-8 animate-fade-in flex items-center justify-center space-x-3">
          <div className="text-center animate-bounce-slow">
            <svg 
              className="w-10 h-10 mx-auto text-gray-400 mb-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No users found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Try adjusting your search
            </p>
          </div>
        </div>
      </div>
    </td>
  </tr>
)}
          {users.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize).map((row, index) => (
    <tr key={index} className="">
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} `}>
        {(currentPage - 1) * currentPageSize + index + 1}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} `}>
        {row.firstname}
      </td> <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} `}>
        {row.lastname}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} `}>
        {row.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserRoleCell theme={theme} row={row} onUpdateRole={handleUpdateRole} />
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <div className='flex'>
          {row.status === 0 && (
            <div className=' text-[#027A48] border-[#44bfab] border-[2px] flex items-center px-3 py-1 rounded-xl gap-2'>
              <span>Active</span>
            </div>
          )}
          {row.status === 1 && (
            <div className=' text-[#B54708] border-[#f12622] border-[2px] flex items-center px-3 py-1 rounded-full gap-2'>
              <span>Inactive</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        
        <div 
          className={` cursor-pointer w-[50px] h-[38px] flex items-center justify-center text-center rounded-lg mx-auto ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}
          onClick={() => {
            const currentUser = users.find(u => u.id === row.id);
            setUpdate_user_id(row.id);
            setUser({
              client: currentUser.client || [],
              facility: currentUser.facility || [],
              clientState: currentUser.clientState || [],
              denialCategory: currentUser.denialCategory || [],
              payer: currentUser.payer || [],
              value: currentUser.value || [],
            });
            setShowPermissionModal(true);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.84006 2.4008L3.36673 8.19413C3.16006 8.41413 2.96006 8.84746 2.92006 9.14746L2.6734 11.3075C2.58673 12.0875 3.14673 12.6208 3.92006 12.4875L6.06673 12.1208C6.36673 12.0675 6.78673 11.8475 6.9934 11.6208L12.4667 5.82746C13.4134 4.82746 13.8401 3.68746 12.3667 2.29413C10.9001 0.914129 9.78673 1.4008 8.84006 2.4008Z" stroke="#686B7E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.92676 3.36719C8.21342 5.20719 9.70676 6.61385 11.5601 6.80052" stroke="#686B7E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 14.668H14" stroke="#686B7E" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
  <div className="relative group">
    <div className="flex items-center justify-start gap-1 flex-wrap max-w-[150px]">
      {row.client && row.client.length > 0 ? (
        <>
          {/* Always show the first 2 clients */}
          {row.client.slice(0, 2).map((client, idx) => (
            <span 
              key={idx} 
              className={`text-xs px-2 py-1 rounded-full ${
                theme === 'dark' 
                ? 'bg-[#191a1d] text-blue-300' 
                : 'bg-blue-100 text-blue-800'
              }`}
            >
              {client}
            </span>
          ))}
          
          {/* Show count indicator if more than 2 clients */}
          {row.client.length > 2 && (
            <span 
              className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                theme === 'dark' 
                ? 'bg-[#232429] text-gray-300' 
                : 'bg-gray-100 text-gray-600'
              }`}
            >
              +{row.client.length - 2}
            </span>
          )}
        </>
      ) : (
        <span className={`text-xs italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          No clients
        </span>
      )}
    </div>
    
    {/* Popup that appears on hover if there are more than 2 clients */}
    {row.client && row.client.length > 2 && (
      <div className="absolute z-10 left-0 mt-1 w-auto max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className={`p-2 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-[#232429] text-white' : 'bg-white text-gray-800'
        } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap gap-1">
            {row.client.map((client, idx) => (
              <span 
                key={idx} 
                className={`text-xs px-2 py-1 rounded-full ${
                  theme === 'dark' 
                  ? 'bg-[#191a1d] text-blue-300' 
                  : 'bg-blue-100 text-blue-800'
                }`}
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
</td>

          <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center justify-center gap-2">
            {/* Edit Button */}
    <div 
      className={`cursor-pointer w-[50px] h-[38px] flex items-center justify-center text-center rounded-lg ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}
      o  onClick={() => {
        setUser(row);
        setShowEditModal(true);
      }}
      title="Edit User"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.84 2.4L3.37 8.19C3.16 8.41 2.96 8.85 2.92 9.15L2.67 11.31C2.59 12.09 3.15 12.62 3.92 12.49L6.07 12.12C6.37 12.07 6.79 11.85 6.99 11.62L12.47 5.83C13.41 4.83 13.84 3.69 12.37 2.29C10.9 0.91 9.79 1.4 8.84 2.4Z" 
          stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} 
          strokeWidth="1.5" 
          strokeMiterlimit="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>

    {/* Delete Button */}

  </div>
</td>
    </tr>
  ))}
</tbody>
            </table>
        

<div className={`${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-500'} px-6 py-3 flex items-center justify-between rounded-lg`}>
  {/* Left side - Rows per page */}
  <div className="flex items-center gap-2">
    <span className="text-sm ">Rows per page:</span>
    <select 
  value={currentPageSize}
  onChange={(e) => setCurrentPageSize(Number(e.target.value))}
  className={`border-none rounded-md text-sm mr-[-10px] appearance-none cursor-pointer ${
    theme === 'dark' 
      ? "bg-[#151619] text-white" 
      : "bg-white text-gray-500"
  }`}
  style={{
    WebkitAppearance: 'none',
    MozAppearance: 'none'
  }}
>
  <option className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`} value={5}>5</option>
  <option className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`} value={10}>10</option>
  <option className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`} value={25}>25</option>
  <option className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`} value={50}>50</option>
</select>
  </div>

  {/* Right side - Pagination controls */}
  <div className="flex items-center gap-2">
    <button 
      onClick={() => setCurrentPage(1)}
      disabled={currentPage === 1}
      className="p-1 rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
    >
      {'<<'}
    </button>
    <button 
      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      className="p-1 rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
    >
      {'<'}
    </button>

    {/* Page numbers */}
    <div className="flex gap-1">
      {Array.from({ length: totalPage }, (_, i) => i + 1)
        .filter(page => page === 1 || page === totalPage || Math.abs(currentPage - page) <= 1)
        .map((page, index, array) => (
          <React.Fragment key={page}>
            {index > 0 && array[index - 1] !== page - 1 && (
              <span className="px-2">...</span>
            )}
            <button
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-md ${
                currentPage === page 
                  ? ' text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
    </div>

    <button 
      onClick={() => setCurrentPage(prev => Math.min(totalPage, prev + 1))}
      disabled={currentPage === totalPage}
      className="p-1 rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
    >
      {'>'}
    </button>
    <button 
      onClick={() => setCurrentPage(totalPage)}
      disabled={currentPage === totalPage}
      className="p-1 rounded-md cursor-pointer hover:bg-gray-100 disabled:opacity-50"
    >
      {'>>'}
    </button>
  </div>
</div>
            </div>
      </div>
      {showEditModal && (
  <EditUserModal 
    open={showEditModal}
    onClose={() => setShowEditModal(false)}
    userData={user}
    onSave={setUser}
    theme={theme}
  />
)}

      {showDeleteModal && <DeleteConfirmationModal />}

      {/* <div className="flex items-center gap-2 justify-start mb-3 pl-3">
        <label
          htmlFor="pageSize"
          className="text-nowrap mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Page Size:
        </label>
        <select
          id="pageSize"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => {
            setCurrentPageSize(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          value={currentPageSize}
        >
          {pageSizes.map((row, index) => (
            <option key={index} value={row}>
              {row}
            </option>
          ))}
        </select>
      </div> */}



      <Modal
        open={showUserModal}
        onClose={() => {
          setShowUserModal(false)
          setUser({
            firstname: '',
            lastname: '',
            email: '',
            role: '',
            password: '',
            status: 0
          })
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={`absolute   w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 rounded-xl ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}` }>
          <div className={`flex  p-9 rounded-xl flex-col gap-4 ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-800'}`}>
            <div className='text-[32px] font-semibold text-center '>
              Add New User
            </div>
            <div className='flex gap-2'>
              <div className='flex flex-col gap-[6px] w-1/2'>
                <span className='text-[14px] font-medium'>First Name</span>
                <input type="input" className="text-sm rounded-lg block w-full py-2 px-3   border border-gray-600  bg-transparent cursor-pointer"
                  value={user.firstname}
                  placeholder='First Name'
                  onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                />
              </div>
              <div className='flex flex-col gap-[6px] w-1/2'>
                <span className='text-[14px] font-medium'>Last Name</span>
                <input type="input" className="text-sm rounded-lg block w-full py-2 px-3   border border-gray-600  bg-transparent cursor-pointer"
                  value={user.lastname}
                  placeholder='Last Name'
                  onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                />
              </div>
            </div>
          
            <div className='flex flex-col gap-2'>
              <span>Email</span>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.66406 3.83337L8.46816 8.59624C9.01914 8.98193 9.29463 9.17477 9.59428 9.24946C9.85898 9.31544 10.1358 9.31544 10.4005 9.24946C10.7002 9.17477 10.9757 8.98193 11.5266 8.59624L18.3307 3.83337M5.66406 14.6667H14.3307C15.7309 14.6667 16.4309 14.6667 16.9657 14.3942C17.4361 14.1545 17.8186 13.7721 18.0582 13.3017C18.3307 12.7669 18.3307 12.0668 18.3307 10.6667V5.33337C18.3307 3.93324 18.3307 3.23318 18.0582 2.6984C17.8186 2.22799 17.4361 1.84554 16.9657 1.60586C16.4309 1.33337 15.7309 1.33337 14.3307 1.33337H5.66406C4.26393 1.33337 3.56387 1.33337 3.02909 1.60586C2.55868 1.84554 2.17623 2.22799 1.93655 2.6984C1.66406 3.23318 1.66406 3.93324 1.66406 5.33337V10.6667C1.66406 12.0668 1.66406 12.7669 1.93655 13.3017C2.17623 13.7721 2.55868 14.1545 3.02909 14.3942C3.56387 14.6667 4.26393 14.6667 5.66406 14.6667Z" stroke="#828385" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type='email'
                  placeholder="emailexample@gmail.com"
                 className="text-sm rounded-lg block w-full py-2 px-3 pl-9  border border-gray-600  bg-transparent cursor-pointer"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>
            </div>
       
            <div className='flex flex-col gap-2'>
  <span className={theme === 'dark' ? 'text-white' : ''}>Role</span>
  <select 
    className={`text-sm rounded-lg block w-full py-2 px-3 border border-gray-300 ${
      theme === 'dark' 
        ? 'bg-[#151619] text-white border-gray-600' 
        : 'bg-white text-gray-500'
    }`}
    value={user.role}
    onChange={(e) => setUser({ ...user, role: e.target.value })}
  >
    <option value="user" className={theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}>
      User
    </option>
    
      {!isGabeoEmail(user.email) && (
      <option value="super-admin" className={`${theme === 'dark' ? "bg-[#151619]" : "bg-white"}`}>
      Super Admin
    </option>
    )}
    {isGabeoEmail(user.email) && (
      <option value="admin" className={theme === 'dark' ? 'bg-[#151619]' : 'bg-white'}>
      Admin
    </option>
    )}
  </select>
</div>

<div className='flex flex-col gap-2'>
  <span className={theme === 'dark' ? 'text-white' : ''}>Password</span>
  <div className='flex items-center'>
    <div className="relative w-full flex-1">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={theme === 'dark' ? '#9CA3AF' : '#828385'} className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
      </div>
      <input
        type='text'
        readOnly
        className={`text-sm rounded-l-lg block w-full py-2 px-3 pl-9 border border-gray-300 ${
          theme === 'dark' 
            ? 'bg-[#151619] text-white border-gray-600' 
            : 'bg-white text-gray-500'
        }`}
        value={user.password}
      />
    </div>
    <div 
      className={`rounded-r-lg py-[6px] px-[6px] border-y border-r border-gray-300 cursor-pointer ${
        theme === 'dark' 
          ? 'bg-[#151619] text-gray-400 border-gray-600' 
          : 'bg-white text-gray-500'
      }`}
      onClick={() => generatePassword(12)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </div>
  </div>
</div>
         
            <div className='flex flex-col gap-2'>
            <span className={theme === 'dark' ? 'text-white' : ''}>Status</span>
  <div className={`relative p-1 rounded-lg flex w-full max-w-md ${
    theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-gray-100'
  }`}>
    {/* Sliding background */}
    <div 
      className={`absolute transition-all duration-200 ease-in-out h-[90%] top-[5%] w-1/3 rounded-md shadow-sm ${
        theme === 'dark' ? 'bg-[#151619]' : 'bg-white'
      } ${
        user.status === 0 ? 'left-[2px]' : 
        user.status === 1 ? 'left-[33.33%]' : 'left-[66.66%]'
      }`}
    />
    
    {/* Buttons */}
    <button
      onClick={() => setUser({ ...user, status: 0 })}
      className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 z-10 transition-colors duration-200 ${
        user.status === 0 ? 'text-green-600' : 'text-gray-600'
      }`}
    >
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.6693 1L5.5026 10.1667L1.33594 6" 
          stroke={user.status === 0 ? "#16a34a" : "#4B5563"} 
          strokeWidth="1.66667" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      <span className="text-sm font-medium">Approved</span>
    </button>

    <button
      onClick={() => setUser({ ...user, status: 1 })}
      className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 z-10 transition-colors duration-200 ${
        user.status === 1 ? 'text-orange-400' : 'text-gray-600'
      }`}
    >
      <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.9166 8.58333L16.2505 10.25L14.5833 8.58333M16.4542 9.83333C16.4845 9.55972 16.5 9.28167 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C11.3561 16.5 13.4584 15.4136 14.8333 13.7144M9 4.83333V9L11.5 10.6667" 
          stroke={user.status === 1 ? "#ea580c" : "#4B5563"} 
          strokeWidth="1.66667" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium">Pending</span>
    </button>

    <button
      onClick={() => setUser({ ...user, status: 2 })}
      className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 z-10 transition-colors duration-200 ${
        user.status === 2 ? 'text-red-600' : 'text-gray-600'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.10573 4.10829L15.8891 15.8916M18.3307 9.99996C18.3307 14.6023 14.5998 18.3333 9.9974 18.3333C5.39502 18.3333 1.66406 14.6023 1.66406 9.99996C1.66406 5.39759 5.39502 1.66663 9.9974 1.66663C14.5998 1.66663 18.3307 5.39759 18.3307 9.99996Z" 
          stroke={user.status === 2 ? "#dc2626" : "#4B5563"} 
          strokeWidth="1.66667" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium">Refused</span>
    </button>
  </div>
</div>
            
          </div>
          <div className='flex gap-4 mb-2 justify-end pt-3 pr-3'>
              <div className='rounded-lg text-[16px] font-semibold bg-[#c1d8fa] text-[#005DE2] px-[33px] py-[10px] border border-solid cursor-pointer select-none'
                onClick={() => {
                  setShowUserModal(false)
                  setUser({
                    firstname: '',
                    lastname: '',
                    email: '',
                    role: '',
                    password: '',
                    status: 0
                  })
                }}
              >
                Cancel
              </div>
              <div className='rounded-lg text-[16px] font-semibold px-[33px] py-[10px] border border-solid text-white bg-[#005DE2] cursor-pointer select-none'
                onClick={addUser_backend}
              >
                Add User
              </div>
            </div>
        </Box>
      </Modal>

      <Modal
        open={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={`absolute  rounded-xl border-none w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}>
          <div className='flex flex-col gap-4'>
           <div className={` p-9 gap-y-2 rounded-xl ${theme === 'dark' ? 'bg-[#151619] text-white' :'bg-white text-gray-600'}`}>
           <h1 className='text-[22px] mb-5'>Assign</h1>
           
           <>
    <MultiSelect
      label="Client"
      options={assignFilter.client}
      selected={user.client}
      onChange={(value) => setUser({ ...user, client: value })}
      placeholder="Select Client"
      theme={theme}
    />

    <MultiSelect
      label="Facilities" 
      options={assignFilter.facility}
      selected={user.facility}
      onChange={(value) => setUser({ ...user, facility: value })}
      placeholder="Select Facilities"
      theme={theme}
    />

    <MultiSelect
      label="Client State"
      options={assignFilter.clientState}
      selected={user.clientState}
      onChange={(value) => setUser({ ...user, clientState: value })}
      placeholder="Select Client State"
      theme={theme}
    />

    <MultiSelect
      label="Denial Category"
      options={assignFilter.denialCategory}
      selected={user.denialCategory}
      onChange={(value) => setUser({ ...user, denialCategory: value })}
      placeholder="Select Denial Category"
      theme={theme}
    />

    <MultiSelect
      label="Payer"
      options={assignFilter.payer}
      selected={user.payer}
      onChange={(value) => setUser({ ...user, payer: value })}
      placeholder="Select Payer"
      theme={theme}
    />

    <MultiSelect
      label="Value"
      options={assignFilter.value}
      selected={user.value}
      onChange={(value) => setUser({ ...user, value: value })}
      placeholder="Select Value"
      theme={theme}
    />
  </>


<div className='flex gap-4 pr-3 pb-2 justify-end pt-3'>
  <div className='rounded-lg text-[16px] font-semibold bg-[#c1d8fa] text-[#005DE2] px-[33px] py-[10px] border border-solid cursor-pointer select-none'
    onClick={() => setShowPermissionModal(false)}
  >
    Cancel
  </div>
  <div 
  className='rounded-lg text-[16px] font-semibold px-[33px] py-[10px] border border-solid text-white bg-[#005DE2] cursor-pointer select-none'
  onClick={() => {
    const updatedUser = {
      ...user,
      client: user.client, // Use the values from user state directly
      facility: user.facility,
      clientState: user.clientState,
      denialCategory: user.denialCategory,
      payer: user.payer,
      value: user.value,
    };

    handleUserUpdate(update_user_id, updatedUser);
    setShowPermissionModal(false);
  }}
>
  Save
</div>
</div>
            </div>
          </div>
        </Box>
      </Modal>
    </div >
  )
}

export default UserManagement;