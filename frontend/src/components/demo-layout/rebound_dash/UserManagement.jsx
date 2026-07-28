import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { auth } from '../../../FirebaseConfig';
import { SERVER_URL } from '../../../utils/config';
import { MODULE_OPTIONS, MODULE_CATEGORY_MAP } from "../../../utils/moduleCatalog";
import { ROLE_OPTIONS, ROLE_STANDARD, normalizeRole } from "../../../utils/roles";
import { setRole, setFirstname, setLastname, setEmail } from '../../../redux/reducers/auth.reducer';


const getRoleValue = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_OPTIONS.some((option) => option.value === normalized)
    ? normalized
    : ROLE_STANDARD;
};

const resolveUserId = (row) => row?.id || row?.user_id || '';

const getUserDisplayName = (row) => {
  const name = `${row?.firstname || ''} ${row?.lastname || ''}`.trim();
  if (name) return name;
  if (row?.email) return row.email;
  return 'Incomplete profile';
};

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
];

const getStatusValue = (status) => (Number(status) === 1 ? 1 : 0);

const UserStatusCell = ({ row, onUpdateStatus, theme }) => {
  const [selectedStatus, setSelectedStatus] = useState(getStatusValue(row.status));
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    setSelectedStatus(getStatusValue(row.status));
  }, [row.status]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    const updateMenuPosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: `${Math.round(rect.bottom + 4)}px`,
        left: `${Math.round(rect.left)}px`,
        width: `${Math.round(rect.width)}px`,
        zIndex: 1200,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedLabel =
    STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'Active';

  const handleSelect = (value) => {
    setSelectedStatus(value);
    onUpdateStatus(resolveUserId(row), value);
    setOpen(false);
  };

  const triggerClass = isDark
    ? 'bg-[#27282D]/70 text-[#e5e7eb] border-white/10 hover:border-white/20'
    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300';

  const menuClass = isDark
    ? 'bg-[#2f3035] border-white/10 shadow-xl'
    : 'bg-white border-slate-200 shadow-lg';

  const optionClass = (isActive) => {
    if (isDark) {
      return isActive
        ? 'bg-white/12 text-white'
        : 'text-[#d1d5db] hover:bg-white/8 hover:text-white';
    }
    return isActive
      ? 'bg-slate-200 text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 w-[120px] px-3 py-1.5 rounded-lg border text-sm transition-colors ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 8L10 12L14 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && menuStyle && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className={`rounded-lg border overflow-hidden py-1 ${menuClass}`}
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selectedStatus === option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${optionClass(selectedStatus === option.value)}`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

const UserRoleCell = ({ row, onUpdateRole, theme }) => {
  const [selectedRole, setSelectedRole] = useState(getRoleValue(row.role));
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    setSelectedRole(getRoleValue(row.role));
  }, [row.role]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    const updateMenuPosition = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: `${Math.round(rect.bottom + 4)}px`,
        left: `${Math.round(rect.left)}px`,
        width: `${Math.round(rect.width)}px`,
        zIndex: 1200,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedLabel =
    ROLE_OPTIONS.find((option) => option.value === selectedRole)?.label || selectedRole;

  const handleSelect = (value) => {
    setSelectedRole(value);
    onUpdateRole(row.id, value);
    setOpen(false);
  };

  const triggerClass = isDark
    ? 'bg-[#27282D]/70 text-[#e5e7eb] border-white/10 hover:border-white/20'
    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300';

  const menuClass = isDark
    ? 'bg-[#2f3035] border-white/10 shadow-xl'
    : 'bg-white border-slate-200 shadow-lg';

  const optionClass = (isActive) => {
    if (isDark) {
      return isActive
        ? 'bg-white/12 text-white'
        : 'text-[#d1d5db] hover:bg-white/8 hover:text-white';
    }
    return isActive
      ? 'bg-slate-200 text-slate-900'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 w-[159px] px-3 py-1.5 rounded-lg border text-sm transition-colors ${triggerClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 8L10 12L14 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && menuStyle && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className={`rounded-lg border overflow-hidden py-1 max-h-56 overflow-y-auto ${menuClass}`}
        >
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selectedRole === option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${optionClass(selectedRole === option.value)}`}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};




const UserManagement = ({ embedded = false, view = 'actions' }) => {
  const navigate = useNavigate();
  const isTableView = view === 'table' || view === 'actions';
  const isAddView = view === 'add';
  const [assignFilter, setAssignFilter] = useState({
    client: MODULE_OPTIONS,
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
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const pageSizes = [5, 10, 20, 25];
  const [totalUsers, setTotalUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientOptionsLoading, setClientOptionsLoading] = useState(false);
  const [rawClients, setRawClients] = useState([]);
  const [facilityOptions, setFacilityOptions] = useState([]);
  const [facilityOptionsLoading, setFacilityOptionsLoading] = useState(false);
  const facilityCacheRef = useRef({});
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSkillsets, setShowSkillsets] = useState(true);
  const tableRef = React.useRef(null);

  const [user, setUser] = useState({
    user_id: '',
    firstname: '',
    lastname: '',
    email: '',
    role: ROLE_STANDARD,
    password: '',
    status: 0,
    access_level: 0,
    tenant: '',
    client: [],
    facility: [],
    clientState: [],
    denialCategory: [],
    payer: [],
    value: [],
  });
  const createEmptyUserForm = (password = '') => ({
    user_id: '',
    firstname: '',
    lastname: '',
    email: '',
    role: ROLE_STANDARD,
    password,
    status: 0,
    access_level: 0,
    tenant: '',
    client: [],
    facility: [],
    clientState: [],
    denialCategory: [],
    payer: [],
    value: [],
  });
  const resetUserForm = () => {
    setUser(createEmptyUserForm());
  };

  useEffect(() => {
    const modules = Array.isArray(user.client) ? user.client : [];
    if (modules.length === 0) {
      setAssignFilter((prev) => ({ ...prev, denialCategory: [] }));
      setUser((prev) => ({ ...prev, denialCategory: [] }));
      return;
    }
    const allowed = new Set();
    modules.forEach((module) => {
      const categories = MODULE_CATEGORY_MAP[module] || [];
      categories.forEach((category) => allowed.add(category));
    });
    const allowedList = Array.from(allowed).sort();
    setAssignFilter((prev) => ({ ...prev, denialCategory: allowedList }));
    setUser((prev) => ({
      ...prev,
      denialCategory: (prev.denialCategory || []).filter((category) => allowed.has(category)),
    }));
  }, [user.client]);

  const sanitizeTenantValue = (raw) => {
    if (!raw) return "";
    return String(raw)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_-]/g, "");
  };

  const normalizeFacility = (facility) => {
    if (!facility || typeof facility !== "object") return null;
    const name =
      facility.name ||
      facility.facilityName ||
      facility.FacilityName ||
      facility.label ||
      "Facility";
    const taxId =
      facility.taxId ||
      facility.taxID ||
      facility.facilityTaxId ||
      facility.facilityTaxID ||
      facility.FacilityTaxID ||
      facility.FedTaxID ||
      "";
    const npi =
      facility.npi ||
      facility.NPI ||
      facility.facilityNpi ||
      facility.facilityNPI ||
      facility.ProvNPI ||
      facility.BillProvNPI ||
      "";
    const taxonomyCode =
      facility.taxonomyCode ||
      facility.taxonomy ||
      facility.TaxonomyCode ||
      facility.facilityTaxonomyCode ||
      facility.BillTaxonomy ||
      facility.RendTaxonomy ||
      "";
    return { ...facility, name, taxId, npi, taxonomyCode };
  };

  const buildFacilityLabel = (facility, tenantLabel) => {
    if (!facility) return "";
    const parts = [];
    if (facility.name) parts.push(facility.name);
    if (facility.taxonomyCode) parts.push(`Taxonomy: ${facility.taxonomyCode}`);
    if (tenantLabel) parts.push(tenantLabel);
    return parts.join(" · ");
  };

  const buildFacilityOptions = (clientDetail) => {
    if (!clientDetail || typeof clientDetail !== "object") return [];
    const facilities = [];
    const tenants = Array.isArray(clientDetail.subClients) ? clientDetail.subClients : [];
    const directFacilities = Array.isArray(clientDetail.facilities)
      ? clientDetail.facilities
      : [];
    const appendFacilities = (list, tenantMeta) => {
      (list || []).forEach((facility) => {
        const normalized = normalizeFacility(facility);
        if (!normalized) return;
        const label = buildFacilityLabel(normalized, tenantMeta?.label);
        facilities.push({
          ...normalized,
          tenantId: tenantMeta?.id,
          tenantName: tenantMeta?.label,
          clientId: clientDetail.id,
          clientName: clientDetail.name,
          label,
          PayerName: label,
        });
      });
    };
    if (tenants.length > 0) {
      tenants.forEach((tenant) => {
        const tenantLabel =
          tenant?.name ||
          tenant?.clientType ||
          tenant?.tenant ||
          tenant?.basePath ||
          tenant?.id ||
          "";
        appendFacilities(tenant?.facilities || [], { id: tenant?.id, label: tenantLabel });
      });
    }
    if (directFacilities.length > 0) {
      appendFacilities(directFacilities, { id: null, label: "" });
    }
    return facilities;
  };

  const resolveClientForTenant = (tenantValue) => {
    const normalizedTenant = sanitizeTenantValue(tenantValue);
    if (!normalizedTenant) return null;
    return (rawClients || []).find((client) => {
      const candidate = sanitizeTenantValue(
        client?.basePath || client?.tenant || client?.slug || client?.name
      );
      return candidate && candidate === normalizedTenant;
    });
  };

  const resolvedClientOptions = useMemo(() => {
    const options = (clientOptions || []).filter(Boolean);
    return options.length > 0
      ? options
      : [
          { value: "pilotcustomer", label: "Pilot Customer", id: "pilotcustomer" },
          { value: "betacustomer", label: "Beta Customer", id: "betacustomer" },
        ];
  }, [clientOptions]);

  useEffect(() => {
    let mounted = true;
    const fetchClientOptions = async () => {
      setClientOptionsLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/clients`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch clients");
        }
        const options = (Array.isArray(data) ? data : [])
          .map((client) => {
            const value = sanitizeTenantValue(
              client?.basePath || client?.tenant || client?.slug || client?.name
            );
            if (!value) return null;
            return {
              value,
              label: client?.name || value,
              id: client?.id || value,
            };
          })
          .filter(Boolean);
        if (mounted) {
          setRawClients(Array.isArray(data) ? data : []);
          setClientOptions(options);
        }
      } catch (error) {
        console.error("Failed to load client options:", error);
        if (mounted) {
          setClientOptions([]);
        }
      } finally {
        if (mounted) {
          setClientOptionsLoading(false);
        }
      }
    };
    fetchClientOptions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!resolvedClientOptions.length) return;
    const hasMatch = resolvedClientOptions.some((option) => option.value === user.tenant);
    if (!user.tenant || !hasMatch) {
      setUser((prev) => ({ ...prev, tenant: resolvedClientOptions[0].value }));
    }
  }, [resolvedClientOptions, user.tenant]);

  useEffect(() => {
    const tenantValue = user.tenant;
    if (!tenantValue) {
      setFacilityOptions([]);
      setUser((prev) => ({ ...prev, facility: [] }));
      return;
    }
    const client = resolveClientForTenant(tenantValue);
    if (!client?.id) {
      setFacilityOptions([]);
      setUser((prev) => ({ ...prev, facility: [] }));
      return;
    }
    const cached = facilityCacheRef.current[client.id];
    if (cached) {
      setFacilityOptions(cached);
      return;
    }
    let mounted = true;
    const fetchFacilities = async () => {
      setFacilityOptionsLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/clients/${client.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const detail = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(detail?.error || "Failed to fetch facilities");
        }
        const options = buildFacilityOptions(detail);
        if (mounted) {
          facilityCacheRef.current[client.id] = options;
          setFacilityOptions(options);
        }
      } catch (error) {
        console.error("Failed to load facilities:", error);
        if (mounted) {
          setFacilityOptions([]);
        }
      } finally {
        if (mounted) {
          setFacilityOptionsLoading(false);
        }
      }
    };
    fetchFacilities();
    return () => {
      mounted = false;
    };
  }, [user.tenant, rawClients]);

  useEffect(() => {
    if (!Array.isArray(user.facility) || user.facility.length === 0) return;
    if (!facilityOptions.length) {
      setUser((prev) => ({ ...prev, facility: [] }));
      return;
    }
    const allowSet = new Set(
      facilityOptions.map((option) => `${option.taxId || ""}::${option.npi || ""}::${option.taxonomyCode || ""}::${option.label || option.PayerName || ""}`)
    );
    const nextFacilities = user.facility.filter((item) => {
      const taxId = item?.taxId || item?.taxID || item?.facilityTaxId || item?.facilityTaxID || "";
      const npi = item?.npi || item?.NPI || item?.facilityNpi || item?.facilityNPI || "";
      const taxonomyCode =
        item?.taxonomyCode ||
        item?.taxonomy ||
        item?.TaxonomyCode ||
        item?.facilityTaxonomyCode ||
        item?.BillTaxonomy ||
        item?.RendTaxonomy ||
        "";
      const label = item?.label || item?.PayerName || item?.name || "";
      const key = `${taxId || ""}::${npi || ""}::${taxonomyCode || ""}::${label}`;
      return allowSet.has(key);
    });
    if (nextFacilities.length !== user.facility.length) {
      setUser((prev) => ({ ...prev, facility: nextFacilities }));
    }
  }, [facilityOptions]);

  const requireAuthToken = async () => {
    if (!auth.currentUser) {
      throw new Error("Your session expired. Please sign in again.");
    }
    return auth.currentUser.getIdToken();
  };

  const patchUserProfile = async (userId, updates, successMessage) => {
    try {
      const token = await requireAuthToken();
      const response = await fetch(`${SERVER_URL}/api/v1/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(updates),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update user.");
      }

      const updatedUser = result?.user ?? { id: userId, ...updates };
      const mergeUsers = (list) =>
        list.map((row) => (resolveUserId(row) === userId ? { ...row, ...updatedUser, id: updatedUser.id || userId } : row));

      setUsers((prev) => mergeUsers(prev));
      setTotalUsers((prev) => mergeUsers(prev));

      const currentUserId = auth.currentUser?.uid;
      if (currentUserId && updatedUser?.id === currentUserId && updates?.role) {
        dispatch(setRole(updates.role));
      } else if (currentUserId && updatedUser?.id === currentUserId && updatedUser?.role) {
        dispatch(setRole(updatedUser.role));
      }
      if (currentUserId && updatedUser?.id === currentUserId) {
        if (updates?.firstname !== undefined || updatedUser?.firstname !== undefined) {
          dispatch(setFirstname(updatedUser?.firstname ?? updates?.firstname ?? ''));
        }
        if (updates?.lastname !== undefined || updatedUser?.lastname !== undefined) {
          dispatch(setLastname(updatedUser?.lastname ?? updates?.lastname ?? ''));
        }
        if (updates?.email !== undefined || updatedUser?.email !== undefined) {
          dispatch(setEmail(updatedUser?.email ?? updates?.email ?? ''));
        }
      }

      if (successMessage) {
        toast.success(successMessage);
      }
      return updatedUser;
    } catch (error) {
      toast.error(error?.message || "Failed to update user.");
      throw error;
    }
  };

  const generatePasswordValue = (length) => {
    const numbers = '0123456789';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let password = '';

    for (let i = 0; i < 2; i++) {
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += upperCase[Math.floor(Math.random() * upperCase.length)];
      password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    const allChars = numbers + upperCase + lowerCase + specialChars;
    while (password.length < length) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generatePassword = (length) => {
    const password = generatePasswordValue(length);
    setUser((prev) => ({ ...prev, password }));
    return password;
  };

  const buildAddUserPayload = (formUser) => ({
    email: `${formUser.email || ''}`.trim(),
    password: formUser.password,
    firstname: `${formUser.firstname || ''}`.trim(),
    lastname: `${formUser.lastname || ''}`.trim(),
    role: formUser.role || ROLE_STANDARD,
    status: Number.isFinite(Number(formUser.status)) ? Number(formUser.status) : 0,
    tenant: formUser.tenant || '',
    client: Array.isArray(formUser.client) ? formUser.client : [],
    facility: Array.isArray(formUser.facility) ? formUser.facility : [],
    denialCategory: Array.isArray(formUser.denialCategory) ? formUser.denialCategory : [],
    payer: Array.isArray(formUser.payer) ? formUser.payer : [],
    value: Array.isArray(formUser.value) ? formUser.value : [],
  });

  const handleUpdateRole = (userId, newRole) => {
    patchUserProfile(userId, { role: newRole }, 'Role updated successfully').catch((error) => {
      console.error('Error updating role:', error);
    });
  };

  const handleUpdateStatus = (userId, newStatus) => {
    patchUserProfile(userId, { status: newStatus }, 'Status updated successfully').catch((error) => {
      console.error('Error updating status:', error);
    });
  };

  const openPermissionEditor = (row) => {
    const rowId = resolveUserId(row);
    const currentUser = users.find((item) => resolveUserId(item) === rowId) || row;
    setUpdate_user_id(rowId);
    setUser((prev) => ({
      ...prev,
      tenant: currentUser.tenant || '',
      client: currentUser.client || [],
      facility: currentUser.facility || [],
      clientState: currentUser.clientState || [],
      denialCategory: currentUser.denialCategory || [],
      payer: currentUser.payer || [],
      value: currentUser.value || [],
    }));
    setShowPermissionModal(true);
  };

  const [update_user_id, setUpdate_user_id] = useState('')


  const handleUserUpdate = (userId, updatedUser) => {
    patchUserProfile(userId, updatedUser, 'Access updated successfully').catch((error) => {
      console.error('Error updating user:', error);
    });
  };

  const addUser_backend = async (e) => {
    e.preventDefault();
    try {
      const token = await requireAuthToken();
      const payload = buildAddUserPayload(user);
      const response = await fetch(`${SERVER_URL}/api/v1/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json().catch(() => ({}));
      if (response.ok) {
        if (res?.emailSent === false) {
          toast.warn(res?.emailWarning || "User created, but the welcome email could not be sent.");
        } else {
          toast.success("User created! A welcome email with login details was sent.");
        }
        resetUserForm();
        navigate('/management');
        fetchUsers();
      } else {
        toast.error(res?.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error?.message || 'Failed to create user');
    }
  };


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileUser, setEditProfileUser] = useState({
    id: '',
    firstname: '',
    lastname: '',
    email: '',
  });

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 z-50 mt-2 sm:mt-32" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className={`inline-block transform overflow-hidden rounded-lg p-1 backdrop-blur-lg text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#cee0fb]'
          }`}>
          <div className={`rounded-xl px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-[#151619]' : 'bg-white'
            }`}>
            <div className="sm:flex sm:items-start flex-col">
              <div className='flex flex-row justify-between gap-x-3'>
                <svg className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className={`text-lg font-medium leading-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Delete User</h3>
              </div>
              <hr className={`border w-full mt-5 ${theme === 'dark' ? 'border-gray-700' : 'border-[#e4e4e4]'
                }`} />
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <div className="mt-3">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                    Are you sure you want to delete the user <span className='font-bold'>{getUserDisplayName(userToDelete)}</span> from the system? This action cannot be undone, and all user data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 `}>
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md border px-4 py-2 text-base font-medium shadow-sm sm:ml-3 sm:w-auto sm:text-sm ${theme === 'dark' ? 'bg-[#3b3f46] text-white hover:bg-[#4a4f57] border-transparent' : 'bg-slate-700 text-white hover:bg-slate-800 border-transparent'}`}
              onClick={() => {
                handleDeleteUser(resolveUserId(userToDelete), userToDelete.email);
                setShowDeleteModal(false);
              }}
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-[#d1d5db] px-4 py-2 text-base font-medium text-[#3b3f46] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleDeleteUser = async (userId, email) => {
    const resolvedId = userId || '';
    if (!resolvedId) {
      toast.error('Unable to delete this user because the profile ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${SERVER_URL}/api/v1/admin-delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          user_id: resolvedId,
          email: email,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to delete user.');
      }
      toast.success("User deleted!");
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error?.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email) => {
    const normalizedEmail = `${email || ''}`.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error('User email is missing.');
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${SERVER_URL}/api/v1/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to send reset email.');
      }
      toast.success('Password reset email sent.');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error(error?.message || 'Failed to send reset email.');
    }
  };

  const openEditProfileModal = (row) => {
    setEditProfileUser({
      id: resolveUserId(row),
      firstname: row.firstname || '',
      lastname: row.lastname || '',
      email: row.email || '',
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    const userId = editProfileUser.id;
    if (!userId) {
      toast.error('Unable to update this profile because the user ID is missing.');
      return;
    }
    await patchUserProfile(
      userId,
      {
        firstname: `${editProfileUser.firstname || ''}`.trim(),
        lastname: `${editProfileUser.lastname || ''}`.trim(),
        email: `${editProfileUser.email || ''}`.trim().toLowerCase(),
      },
      'Profile updated successfully'
    );
    setShowEditProfileModal(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await requireAuthToken();
      const response = await fetch(`${SERVER_URL}/api/v1/users`, {
        headers: {
          "Authorization": token,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch users.');
      }
      const usersList = data?.users ?? [];
      setTotalUsers(usersList);
      setUsers(usersList.slice(0, currentPageSize));
      setTotalPage(Math.ceil(usersList.length / currentPageSize));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
  const dispatch = useDispatch();

  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add this component within your UserManagement component
  const FilterModal = () => (
    <Modal
      open={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      aria-labelledby="filter-modal"
    >
      <Box className={`absolute rounded-xl border-none w-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'bg-[#27282D]' : 'bg-white'}`}>
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#2a2b30] text-[#e5e7eb] border border-white/10' : 'bg-white text-slate-600 border border-slate-200'}`}>
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
                      className={`form-radio ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
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
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/5 text-[#cbd5e1] hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${theme === 'dark' ? 'bg-[#3b3f46] text-white hover:bg-[#4a4f57]' : 'bg-slate-700 text-white hover:bg-slate-800'}`}
            >
              Apply
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );



  useEffect(() => {
    if (!isAddView) return;
    setUser(createEmptyUserForm(generatePasswordValue(12)));
  }, [isAddView]);

  const shellClasses = embedded
    ? "w-full"
    : "px-3 sm:px-8 py-8 w-full";

  const panelClasses = embedded
    ? `flex flex-col gap-4 w-full ${theme === 'dark' ? 'text-[#F4F4F4]' : 'text-slate-900'}`
    : `flex flex-col gap-6 rounded-[12px] px-[30px] pt-[40px] py-[30px] sm:p-6 ${theme === 'dark'
      ? 'bg-[#26272C]/20 text-[#F4F4F4] border border-white/5 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
      : 'bg-white text-slate-900'
      }`;

  const tableCardClass = theme === 'dark'
    ? 'border-white/[0.08] bg-[#27282D]/40'
    : 'border-slate-200/80 bg-white';
  const tableHeaderClass = theme === 'dark'
    ? 'bg-[#2a2b30]/60 text-[#9ca3af]'
    : 'bg-slate-50 text-slate-500';
  const tableCellClass = theme === 'dark'
    ? 'text-[#e5e7eb]'
    : 'text-slate-600';
  const tableDividerClass = theme === 'dark'
    ? 'divide-white/[0.05]'
    : 'divide-slate-100';
  const tableFooterClass = theme === 'dark'
    ? 'border-white/[0.06] text-[#cbd5e1]'
    : 'border-slate-100 text-slate-500';
  const paginationButtonClass = theme === 'dark'
    ? 'p-1 rounded-md cursor-pointer hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed'
    : 'p-1 rounded-md cursor-pointer hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed';
  const controlClass = theme === 'dark'
    ? 'bg-[#27282D]/60 text-[#e5e7eb] border-white/10 focus:border-white/25'
    : 'bg-slate-50 text-slate-700 border-slate-200 focus:border-slate-400';
  const filterButtonClass = theme === 'dark'
    ? 'bg-[#27282D]/60 text-[#e5e7eb] border-white/10 hover:border-white/20 hover:bg-white/5'
    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50';

  return (
    <div className={shellClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className={panelClasses}>
        {isTableView && (
          <>
            <div className="flex flex-col gap-4 px-0 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="w-full sm:w-auto order-2 sm:order-1">
                  {/* Filter pills can render here if needed */}
                </div>
                <div className="flex items-center gap-4 order-1 sm:order-2">
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
                      id="user-search"
                      name="user-search"
                      className={`text-sm rounded-lg block w-full py-2.5 px-4 pl-10 border transition-colors focus:outline-none ${controlClass}`}
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${filterButtonClass}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span className="text-sm font-medium">Filter</span>
                      {activeFilter !== 'all' && (
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      )}
                    </button>
                  </div>
                  <div
                    className="flex-shrink-0 flex items-center justify-center bg-[#3b3f46] rounded-lg w-[40px] h-[40px] text-white cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      navigate('/management/users/new');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.9974 1.16666V12.8333M1.16406 6.99999H12.8307" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {showFilterModal && <FilterModal />}
            <div
              ref={tableRef}
              className={`flex flex-col rounded-2xl border ${tableCardClass} overflow-hidden`}
            >
              <div className="w-full overflow-x-auto overflow-y-auto" style={{ maxHeight: '500px' }}>
                <table className="min-w-full w-full font-inter">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[50px]`}>
                        <div className="flex items-center gap-2">
                          #
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.9974 0.666748C6.36559 0.666748 6.66406 0.965225 6.66406 1.33341V9.05727L10.1927 5.52868C10.453 5.26833 10.8751 5.26833 11.1355 5.52868C11.3958 5.78903 11.3958 6.21114 11.1355 6.47149L6.4688 11.1382C6.20845 11.3985 5.78634 11.3985 5.52599 11.1382L0.859325 6.47149C0.598975 6.21114 0.598975 5.78903 0.859325 5.52868C1.11967 5.26833 1.54178 5.26833 1.80213 5.52868L5.33073 9.05727V1.33341C5.33073 0.965225 5.62921 0.666748 5.9974 0.666748Z" fill="#3a3f46" />
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[130px]`}>
                        <div className="flex items-center gap-2">
                          First Name

                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[130px]`}>
                        <div className="flex items-center gap-2">
                          Last Name

                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[200px]`}>
                        <div className="flex items-center gap-2">
                          Email

                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[200px]`}>
                        <div className="flex items-center gap-2">
                          Role

                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[120px]`}>
                        <div className="flex items-center gap-2">
                          Status

                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[10px]`}>
                        <div className="flex items-center gap-2">
                          Access
                        </div>
                      </th>
                      <th scope="col" className={`${tableHeaderClass} px-6 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[120px]`}>
                        <div className="flex items-center gap-2">
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`relative divide-y ${tableDividerClass}`}>
                    {searchKeyword.length > 0 && users.length === 0 && (
                      <tr className="w-full">
                        <td colSpan="7" className="w-full">
                          <div className={`w-full text-center py-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
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
                      <tr key={resolveUserId(row) || index} className="">
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}>
                          {(currentPage - 1) * currentPageSize + index + 1}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}>
                          {row.firstname || (row.email ? '—' : '—')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}>
                          {row.lastname || (row.email ? '—' : '—')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}>
                          {row.email || <span className="italic opacity-60">Missing email</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <UserRoleCell theme={theme} row={row} onUpdateRole={handleUpdateRole} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <UserStatusCell theme={theme} row={row} onUpdateStatus={handleUpdateStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPermissionEditor(row)}
                            title="Click to edit access"
                            className={`relative group w-full text-left rounded-lg transition-colors cursor-pointer ${
                              theme === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-start gap-1 flex-wrap max-w-[180px] py-1">
                              {row.client && row.client.length > 0 ? (
                                <>
                                  {row.client.slice(0, 2).map((client, idx) => (
                                    <span
                                      key={idx}
                                      className={`text-xs px-2 py-1 rounded-full ${theme === 'dark'
                                        ? 'bg-[#191a1d] text-gray-300'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                      {client}
                                    </span>
                                  ))}

                                  {row.client.length > 2 && (
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${theme === 'dark'
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
                                  Click to assign access
                                </span>
                              )}
                            </div>

                            {row.client && row.client.length > 2 && (
                              <div className="absolute z-10 left-0 mt-1 w-auto max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                <div className={`p-2 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-[#232429] text-white' : 'bg-white text-gray-800'
                                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                  <div className="flex flex-wrap gap-1">
                                    {row.client.map((client, idx) => (
                                      <span
                                        key={idx}
                                        className={`text-xs px-2 py-1 rounded-full ${theme === 'dark'
                                          ? 'bg-[#191a1d] text-gray-300'
                                          : 'bg-gray-100 text-gray-800'
                                          }`}
                                      >
                                        {client}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit Profile Button */}
                            <div
                              className={`cursor-pointer w-[50px] h-[38px] flex items-center justify-center text-center rounded-lg ${theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                              onClick={() => openEditProfileModal(row)}
                              title="Edit Profile"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M4 20h4l10.5-10.5a1.77 1.77 0 0 0 0-2.5l-2-2a1.77 1.77 0 0 0-2.5 0L4 15.5V20z" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            {/* Reset Password Button */}
                            <div
                              className={`cursor-pointer w-[50px] h-[38px] flex items-center justify-center text-center rounded-lg ${theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                              onClick={() => handleResetPassword(row.email)}
                              title="Reset Password"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M4 12a8 8 0 1 1 2.34 5.66" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 8v4h4" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            {/* Delete Button */}
                            <div
                              className={`cursor-pointer w-[50px] h-[38px] flex items-center justify-center text-center rounded-lg ${theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                              onClick={() => {
                                setUserToDelete(row);
                                setShowDeleteModal(true);
                              }}
                              title="Delete User"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6V4h8v2" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 6l1 14h10l1-14" stroke={theme === 'dark' ? '#9BA1A6' : '#686B7E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`w-full px-6 py-3 flex items-center justify-between border-t ${tableFooterClass}`}>
                  {/* Left side - Rows per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm ">Rows per page:</span>
                    <select
                      value={currentPageSize}
                      onChange={(e) => setCurrentPageSize(Number(e.target.value))}
                      className={`border-none rounded-md text-sm appearance-none cursor-pointer ${theme === 'dark'
                        ? "bg-transparent text-[#cbd5e1]"
                        : "bg-transparent text-slate-500"
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
                      className={paginationButtonClass}
                    >
                      {'<<'}
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={paginationButtonClass}
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
                              className={`w-8 h-8 rounded-md ${currentPage === page
                                ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700')
                                : (theme === 'dark' ? 'hover:bg-white/5 text-[#cbd5e1]' : 'hover:bg-slate-100 text-slate-500')
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
                      className={paginationButtonClass}
                    >
                      {'>'}
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPage)}
                      disabled={currentPage === totalPage}
                      className={paginationButtonClass}
                    >
                      {'>>'}
                    </button>
                  </div>
                </div>
            </div>
          </>
        )}
        {showDeleteModal && <DeleteConfirmationModal />}

        <Modal
          open={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          aria-labelledby="edit-profile-modal"
        >
          <Box className={`absolute rounded-xl border-none w-[520px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'bg-[#27282D]' : 'bg-white'}`}>
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#2a2b30] text-[#e5e7eb] border border-white/10' : 'bg-white text-slate-700 border border-slate-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Edit User Profile</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={editProfileUser.firstname}
                  onChange={(e) => setEditProfileUser((prev) => ({ ...prev, firstname: e.target.value }))}
                  placeholder="First Name"
                  className={`text-sm rounded-lg px-4 py-2.5 border w-full ${theme === 'dark' ? 'bg-[#FFFFFF]/10 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                />
                <input
                  type="text"
                  value={editProfileUser.lastname}
                  onChange={(e) => setEditProfileUser((prev) => ({ ...prev, lastname: e.target.value }))}
                  placeholder="Last Name"
                  className={`text-sm rounded-lg px-4 py-2.5 border w-full ${theme === 'dark' ? 'bg-[#FFFFFF]/10 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                />
              </div>
              <input
                type="email"
                value={editProfileUser.email}
                onChange={(e) => setEditProfileUser((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className={`mt-4 text-sm rounded-lg px-4 py-2.5 border w-full ${theme === 'dark' ? 'bg-[#FFFFFF]/10 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold bg-[#d1d5db] text-[#3b3f46]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#3b3f46] hover:bg-[#2f3238]"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </Box>
        </Modal>

        {/* <div className="flex items-center gap-2 justify-start mb-3 pl-3">
        <label
          htmlFor="pageSize"
          className="text-nowrap mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Page Size:
        </label>
        <select
          id="pageSize"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-500 dark:focus:border-gray-500"
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


        {isAddView && (

          <div className={`flex flex-col gap-6 rounded-2xl px-[50px] pt-[30px] pb-[50px] border ${theme === 'dark' ? 'bg-[#27282D] text-white border-[#1F2231]' : 'bg-white text-gray-800 border-slate-200'}`}>
            <div>
              <h2 className="text-xl font-semibold">Add New User</h2>
              <div className={`mt-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  className={`text-sm rounded-full px-4 py-2.5 border bg-clip-padding focus:outline-none ${theme === 'dark' ?
                    'bg-[#FFFFFF]/10 text-white border-transparent ring-1 ring-inset ring-[#3B3F46] focus:border-[#6b6c71] focus:border-opacity-50' :
                    'bg-slate-50 text-slate-900 border-slate-200 focus:border-gray-800'
                    }`}
                  value={user.firstname}
                  placeholder="First Name"
                  onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                />
                <input
                  type="text"
                  className={`text-sm rounded-full px-4 py-2.5 border bg-clip-padding focus:outline-none ${theme === 'dark' ?
                    'bg-[#FFFFFF]/10 text-white border-transparent ring-1 ring-inset ring-[#3B3F46] focus:border-[#6b6c71] focus:border-opacity-50' :
                    'bg-slate-50 text-slate-900 border-slate-200 focus:border-gray-800'
                    }`}
                  value={user.lastname}
                  placeholder="Last Name"
                  onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 items-start">
                <input
                  type="text"
                  className={`text-sm rounded-full px-4 py-2.5 border bg-clip-padding focus:outline-none ${theme === 'dark' ?
                    'bg-[#FFFFFF]/10 text-white border-transparent ring-1 ring-inset ring-[#3B3F46] focus:border-[#6b6c71] focus:border-opacity-50' :
                    'bg-slate-50 text-slate-900 border-slate-200 focus:border-gray-800'
                    }`}
                  value={user.email}
                  placeholder="Email Address"
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
                <div className={`flex items-center justify-between gap-3 rounded-full border px-4 py-2.5 ${theme === 'dark' ? 'border-white/10 bg-[#FFFFFF]/10' : 'border-slate-200 bg-white'}`}>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Active</span>
                  <div className={`flex items-center rounded-full border px-1 ${theme === 'dark' ? 'border-white/10 bg-[#FFFFFF]/10' : 'border-slate-200 bg-slate-50'}`}>
                    <button
                      type="button"
                      onClick={() => setUser({ ...user, status: 0 })}
                      className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${user.status === 0
                        ? theme === 'dark'
                          ? 'bg-[#1F202499] text-white shadow-[0_6px_14px_rgba(0,0,0,0.35)]'
                          : 'bg-white text-slate-900 shadow-sm'
                        : theme === 'dark'
                          ? 'text-white/60'
                          : 'text-slate-500'
                        }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setUser({ ...user, status: 1 })}
                      className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${user.status !== 0
                        ? theme === 'dark'
                          ? 'bg-[#1F202499] text-white shadow-[0_6px_14px_rgba(0,0,0,0.35)]'
                          : 'bg-white text-slate-900 shadow-sm'
                        : theme === 'dark'
                          ? 'text-white/60'
                          : 'text-slate-500'
                        }`}
                    >
                      OFF
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 items-center">
                <div className="flex flex-col gap-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Client</span>
                  <select
                    value={user.tenant}
                    onChange={(e) => setUser({ ...user, tenant: e.target.value })}
                    className={`user-tenant-select ${theme === 'dark' ? 'user-tenant-select--dark' : 'user-tenant-select--light'} text-sm rounded-full px-4 py-2.5 border bg-clip-padding focus:outline-none ${theme === 'dark' ?
                      'bg-[#FFFFFF]/10 text-white border-transparent ring-1 ring-inset ring-[#3B3F46] focus:border-[#6b6c71] focus:border-opacity-50' :
                      'bg-slate-50 text-slate-900 border-slate-200 focus:border-gray-800'
                      }`}
                    disabled={clientOptionsLoading}
                  >
                    {resolvedClientOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Facility</span>
                  <MultiSelect
                    label="Facility"
                    options={facilityOptions}
                    selected={user.facility}
                    onChange={(value) => setUser({ ...user, facility: value })}
                    placeholder={facilityOptionsLoading ? "Loading facilities..." : "Select Facility"}
                    theme={theme}
                    containerClassName="w-full"
                  />
                </div>
              </div>

              <div className={`rounded-2xl border px-4 py-4 ${theme === 'dark' ? 'border-[#2A2F38] bg-[#FFFFFF]/10' : 'border-slate-200 bg-slate-50'}`}>
                <div className="font-['Inter'] font-normal text-[18px] leading-[100%] tracking-[0%] text-[#F4F4F4]">Role</div>
                <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {ROLE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="add-role"
                        checked={getRoleValue(user.role) === option.value}
                        onChange={() => setUser({ ...user, role: option.value })}
                        className="sr-only peer"
                      />
                      <span
                        className={`relative box-border flex h-[30px] w-[30px] items-center justify-center rounded-[6px] border transition-shadow shrink-0
                          ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}
                          border-[#9b9ca1] shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                          peer-checked:bg-[#25262b] peer-checked:border-[#606165]
                          peer-checked:shadow-[inset_4px_4px_4px_rgba(0,0,0,0.25),inset_-4px_-4px_4px_rgba(0,0,0,0.25)]
                          peer-checked:[&>svg]:opacity-100
                        `}
                      >
                        <svg
                          className="h-4 w-4 opacity-0 transition-opacity"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#F4F4F4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                        </svg>
                      </span>
                      <span className="font-['Inter'] font-normal text-[18px] leading-[20px] tracking-[0%]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`rounded-2xl border px-4 py-4 ${theme === 'dark' ? 'border-[#2A2F38] bg-[#FFFFFF]/10' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-['Inter'] font-normal text-[18px] leading-[100%] tracking-[0%] text-[#F4F4F4]">Skillsets</div>
                  <button
                    type="button"
                    onClick={() => setShowSkillsets((prev) => !prev)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center ${theme === 'dark' ? 'text-white/60 hover:bg-white/10' : 'text-slate-500 hover:bg-white'
                      }`}
                    aria-label="Toggle skillsets"
                  >
                    <span className="text-lg leading-none">{showSkillsets ? "-" : "+"}</span>
                  </button>
                </div>
                {showSkillsets && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <MultiSelect
                      label="Module"
                      options={assignFilter.client}
                      selected={user.client}
                      onChange={(value) => setUser({ ...user, client: value })}
                      placeholder="Select Module"
                      theme={theme}
                    />
                    <MultiSelect
                      label="Balance"
                      options={assignFilter.value}
                      selected={user.value}
                      onChange={(value) => setUser({ ...user, value: value })}
                      placeholder="Select Balance"
                      theme={theme}
                    />
                    <MultiSelect
                      label="Category"
                      options={assignFilter.denialCategory}
                      selected={user.denialCategory}
                      onChange={(value) => setUser({ ...user, denialCategory: value })}
                      placeholder="Select Category"
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
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    id="add-password"
                    name="add-password"
                    className={`text-sm rounded-full px-4 py-2.5 border w-full bg-clip-padding ${theme === 'dark' ? 'bg-[#FFFFFF]/10 text-white border-transparent ring-1 ring-inset ring-[#3B3F46]' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    value={user.password}
                    placeholder="Generated Password"
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                    Auto
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => generatePassword(12)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border ${theme === 'dark' ? 'border-white/10 text-white/70 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                className={`rounded-full px-6 py-2 text-sm font-semibold ${theme === 'dark'
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                onClick={() => {
                  resetUserForm();
                  navigate('/management');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full px-6 py-2 text-sm font-semibold text-white bg-[#3b3f46] hover:bg-[#2f3238]"
                onClick={addUser_backend}
              >
                Add User
              </button>
            </div>
          </div>

        )}

        <Modal
          open={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box className={`absolute  rounded-xl border-none w-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'}`}>
            <div className="flex flex-col gap-4">
              <div className={` p-9 gap-y-2 rounded-xl ${theme === 'dark' ? 'bg-[#151619] text-white' : 'bg-white text-gray-600'}`}>
                <h1 className="text-[22px] mb-5">Edit Access</h1>
                <>
                  <MultiSelect
                    label="Module"
                    options={assignFilter.client}
                    selected={user.client}
                    onChange={(value) => setUser({ ...user, client: value })}
                    placeholder="Select Module"
                    theme={theme}
                  />

                  <MultiSelect
                    label="Facility"
                    options={facilityOptions}
                    selected={user.facility}
                    onChange={(value) => setUser({ ...user, facility: value })}
                    placeholder={facilityOptionsLoading ? "Loading facilities..." : "Select Facility"}
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

                <div className="flex gap-4 pr-3 pb-2 justify-end pt-3">
                  <div
                    className="rounded-lg text-[16px] font-semibold bg-[#d1d5db] text-[#3b3f46] px-[33px] py-[10px] border border-solid cursor-pointer select-none"
                    onClick={() => setShowPermissionModal(false)}
                  >
                    Cancel
                  </div>
                  <div
                    className="rounded-lg text-[16px] font-semibold px-[33px] py-[10px] border border-solid text-white bg-[#3b3f46] cursor-pointer select-none"
                    onClick={() => {
                      const updatedUser = {
                        client: user.client,
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
      </div>
    </div>
  )
}

export default UserManagement;

