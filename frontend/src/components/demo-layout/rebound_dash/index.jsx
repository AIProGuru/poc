import React, { useEffect, useState, useRef, useContext, useMemo, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "./DataTable";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { setCount, setPart1Count, setPart2Count, setRecovery } from "../../../redux/reducers/count.reducer";
import {
  setCurrentPage,
  setEndDate,
  setKeyword,
  setPart1Loading,
  setPart2Loading,
  setStartDate,
  setTabIndex,
  setTableLoading,
  increaseLoading,
  decreaseLoading,
  setTagLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setCode,
  setRemark,
  setPOS,
  setProcedure,
  setExtraFilter,
  setRecoveryLoading,
} from "../../../redux/reducers/app.reducer";
import { setSelectedTags, setTags, setAllPayers } from "../../../redux/reducers/tag.reducer";
import { setTableData, setTheme, setModels } from '../../../redux/reducers/app.reducer';
import { setCategoryLabel, setCategoryValue } from '../../../redux/reducers/statistics.reducer';
import { useApiEndpoint } from "../../../ApiEndpointContext";
import ArIntel from "./ArIntel";
import UserManagement from "./UserManagement";
import { AccountContext } from "../../../utils/Account";

const ReboundDash = () => {
  const apiUrl = useApiEndpoint();
  const location = useLocation();
  const params = useParams();
  const rawToken = params.token ?? null;
  const isManagementRoute = location.pathname === '/management' || location.pathname.endsWith('/management');
  const [selectedNav, setSelectedNav] = useState(() => {
    if (isManagementRoute) return 'user-management';
    return location.pathname.includes('/denials') ? 'denials' : 'home';
  });
  const [expandedNav, setExpandedNav] = useState(() => new Set());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const inputKeywordRef = useRef();
  const navigate = useNavigate();
  const { logout } = useContext(AccountContext);

  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const appType = useSelector((state) => state.app.type);
  const role = useSelector((state) => state.auth.role);
  const baseAppPath = appType === 0 ? '/rebound' : appType === 1 ? '/medevolve' : '/demo';
  const isDenialsRoute = location.pathname.includes('/denials');
  const isUserManagementView = selectedNav === 'user-management';
  const showDenialModels = !isUserManagementView && isDenialsRoute && !rawToken;
  const count = useSelector((state) => state.count.count);
  const tags = useSelector((state) => state.tags.allTags);
  let tabIndex = useSelector((state) => state.app.tabIndex);
  const tagLoading = useSelector((state) => state.app.tagLoading);
  const countLoading = useSelector((state) => state.app.countLoading);
  const statisticsLoading = useSelector((state) => state.app.statisticsLoading);
  const payerLoading = useSelector((state) => state.app.payerLoading);
  const recoveryLoading = useSelector((state) => state.app.recoveryLoading);
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);
  const keyword = useSelector((state) => state.app.keyword);

  console.log('apiUrl', apiUrl);

  const filterByKeyword = () => {
    dispatch(setExtraFilter({}));
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
    dispatch(setTableLoading(true));
    dispatch(setKeyword(inputKeywordRef.current.value));
    dispatch(setCurrentPage(1));
  };

  useEffect(() => {
    if (inputKeywordRef.current) {
      inputKeywordRef.current.value = keyword;
    }
  }, [keyword]);

  useEffect(() => {
    if (location.pathname.includes('/denials')) {
      if (!selectedNav.startsWith('denials')) {
        setSelectedNav('denials');
      }
    } else if (isManagementRoute) {
      if (selectedNav !== 'user-management') {
        setSelectedNav('user-management');
      }
    } else if (
      selectedNav === 'denials' ||
      selectedNav.startsWith('denials:') ||
      selectedNav === 'user-management'
    ) {
      setSelectedNav('home');
    }
  }, [location.pathname, selectedNav, isManagementRoute]);

  const formatDisplay = (value, type = 'number') => {
    const numeric = Number(value ?? 0);
    if (type === 'currency') {
      return `$${numeric.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
    return numeric.toLocaleString('en-US');
  };

  const getMetricValue = (idx, key) => {
    if (!Array.isArray(count) || !count[idx]) return 0;
    return count[idx][key] ?? 0;
  };

  const insightCards = [
    { id: 'count', label: 'Count', value: getMetricValue(0, 'count'), format: 'number', gradient: 'from-[#1CB5E0] to-[#46E5B9]' },
    { id: 'charges', label: 'Charges', value: getMetricValue(0, 'amount'), format: 'currency', gradient: 'from-[#2DD5A5] to-[#61F1CD]' },
    { id: 'exp', label: 'Exp Reimbursement', value: getMetricValue(1, 'amount'), format: 'currency', gradient: 'from-[#22B8CF] to-[#5C7CFA]' },
    { id: 'allowed', label: 'Allowed Amt', value: getMetricValue(2, 'amount'), format: 'currency', gradient: 'from-[#7C4DFF] to-[#C471ED]' },
    { id: 'variance', label: 'Payment Variance', value: getMetricValue(3, 'amount'), format: 'currency', gradient: 'from-[#B24592] to-[#F15F79]' },
  ];

  const models = useSelector((state) => state.app.models);
  const denialCount = models.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);

  useEffect(() => {
    if (!apiUrl || models.length > 0) return;
    let cancelled = false;

    const mapModels = (rows) =>
      rows.map((row) => ({
        ...row,
        Group: (() => {
          switch (row.Category) {
            case 'Contractual Adj':
              return 'Non-Recoverable';
            case 'Patient Resp':
              return 'Patient Resp';
            case null:
              return 'Delinquent';
            default:
              return 'Recoverable';
          }
        })(),
      }));

    const fetchModels = async () => {
      try {
        const res = await axios.get(`${apiUrl}/get_artificial_intelligence`);
        if (!cancelled) {
          dispatch(setModels(mapModels(res.data)));
        }
      } catch (error) {
        console.error('Failed to load AI models', error);
      }
    };

    fetchModels();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, dispatch, models.length]);

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', badge: null, icon: 'home', tab: 0 },
    { id: 'dashboard', label: 'Dashboard', badge: null, icon: 'dashboard' },
    {
      id: 'claim-edits',
      label: 'Claim Edits',
      badge: 45,
      icon: 'clipboard',
      children: [
        { id: 'claim-edits:ch-rejection', label: 'CH Rejection' },
        { id: 'claim-edits:payer-rejection', label: 'Payer Rejection' },
      ],
    },
    {
      id: 'claim-status',
      label: 'Claim Status',
      badge: 96,
      icon: 'list',
      children: [
        { id: 'claim-status:pend-277', label: 'Pend 277' },
        { id: 'claim-status:pend-835', label: 'Pend 835' },
      ],
    },
    {
      id: 'denials',
      label: 'Denials',
      badge: denialCount || null,
      icon: 'shield-x',
      children: [
        { id: 'denials:authorization', label: 'Authorization' },
        { id: 'denials:billing', label: 'Billing' },
        { id: 'denials:cob', label: 'Coordination of Benefits' },
        { id: 'denials:documentation', label: 'Documentation' },
        { id: 'denials:duplicate', label: 'Duplicate' },
        { id: 'denials:eligibility', label: 'Eligibility' },
        { id: 'denials:loc', label: 'Level of Care' },
        { id: 'denials:medical-coding', label: 'Medical Coding' },
        { id: 'denials:medical-necessity', label: 'Medical Necessity' },
        { id: 'denials:non-covered', label: 'Non-Covered' },
        { id: 'denials:other', label: 'Other Non-Specific' },
        { id: 'denials:provider', label: 'Provider' },
        { id: 'denials:timely-filing', label: 'Timely Filing' },
      ],
    },
    {
      id: 'patient-responsibility',
      label: 'Patient Responsibility',
      badge: 23,
      icon: 'user',
      tab: 2,
      children: [
        { id: 'patient-responsibility:bal-due', label: 'Bal Due from PT' },
      ],
    },
    {
      id: 'payment-variance',
      label: 'Payment Variance',
      badge: 67,
      icon: 'chart',
      tab: 4,
      children: [
        { id: 'payment-variance:payer-overpaid', label: 'Payer Overpaid' },
        { id: 'payment-variance:payer-underpaid', label: 'Payer Underpaid' },
      ],
    },
    {
      id: 'payment-posting',
      label: 'Payment Posting',
      badge: 36,
      icon: 'card',
      children: [
        { id: 'payment-posting:contractual-adj', label: 'Contractual Adj' },
        { id: 'payment-posting:payment', label: 'Payment' },
        { id: 'payment-posting:writeoff', label: 'Write-off' },
        { id: 'payment-posting:refund', label: 'Refund' },
        { id: 'payment-posting:ai-library', label: 'AI Library' },
      ],
    },
    { id: 'support', label: 'Support', badge: null, icon: 'lifebuoy' },
    { id: 'settings', label: 'Settings', badge: null, icon: 'cog' },
    ...(role === 'admin'
      ? [{ id: 'user-management', label: 'User Management', badge: null, icon: 'users' }]
      : []),
  ], [denialCount, role]);
  const navExtraFilters = useMemo(() => ({
    'claim-status:pend-835': { Missing835: true },
  }), []);

  const applyNavFilters = useCallback((navId) => {
    if (!navId) return;
    if (navId === 'user-management' || navId.startsWith('denials')) {
      return;
    }
    const filterPayload = navExtraFilters[navId] || {};
    dispatch(setExtraFilter(filterPayload));
    dispatch(setCurrentPage(1));
    dispatch(setTableLoading(true));
  }, [dispatch, navExtraFilters]);

  const isDark = theme === 'dark';

  const renderNavIcon = (name, active) => {
    const tone = active ? 'text-white' : 'text-[#8A8FB1]';
    const strokeProps = {
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none',
    };

    switch (name) {
      case 'home':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <path d="M3.25 9.5L10 3.75L16.75 9.5V16C16.75 16.5523 16.3023 17 15.75 17H12V12.25H8V17H4.25C3.69772 17 3.25 16.5523 3.25 16V9.5Z" {...strokeProps} />
          </svg>
        );
      case 'dashboard':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <rect x="3" y="3" width="6" height="6" rx="1.2" {...strokeProps} />
            <rect x="11" y="3" width="6" height="4.5" rx="1.2" {...strokeProps} />
            <rect x="3" y="12" width="5.5" height="5.5" rx="1.2" {...strokeProps} />
            <rect x="10.5" y="9" width="6.5" height="8.5" rx="1.2" {...strokeProps} />
          </svg>
        );
      case 'clipboard':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <path d="M7 4H13C14.1046 4 15 4.89543 15 6V15C15 16.1046 14.1046 17 13 17H7C5.89543 17 5 16.1046 5 15V6C5 4.89543 5.89543 4 7 4Z" {...strokeProps} />
            <path d="M7 5.5H13" {...strokeProps} />
            <path d="M8.25 3H11.75C12.1642 3 12.5 3.33579 12.5 3.75V5.5H7.5V3.75C7.5 3.33579 7.83579 3 8.25 3Z" {...strokeProps} />
          </svg>
        );
      case 'list':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <path d="M7 6H16" {...strokeProps} />
            <path d="M7 10H16" {...strokeProps} />
            <path d="M7 14H16" {...strokeProps} />
            <circle cx="4" cy="6" r="0.9" {...strokeProps} />
            <circle cx="4" cy="10" r="0.9" {...strokeProps} />
            <circle cx="4" cy="14" r="0.9" {...strokeProps} />
          </svg>
        );
      case 'shield-x':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <path d="M10 3L16 5.25V10C16 13.5 13.5 16.75 10 17.5C6.5 16.75 4 13.5 4 10V5.25L10 3Z" {...strokeProps} />
            <path d="M8 9L12 13" {...strokeProps} />
            <path d="M12 9L8 13" {...strokeProps} />
          </svg>
        );
      case 'user':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <circle cx="10" cy="7" r="3" {...strokeProps} />
            <path d="M5 15.5C5 13.567 7.23858 12 10 12C12.7614 12 15 13.567 15 15.5" {...strokeProps} />
          </svg>
        );
      case 'chart':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <path d="M4 14V9" {...strokeProps} />
            <path d="M8 14V6" {...strokeProps} />
            <path d="M12 14V11" {...strokeProps} />
            <path d="M16 14V4" {...strokeProps} />
            <path d="M3.5 16H16.5" {...strokeProps} />
          </svg>
        );
      case 'card':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <rect x="3" y="5" width="14" height="10" rx="2" {...strokeProps} />
            <path d="M3 9H17" {...strokeProps} />
            <path d="M6 13H8M10 13H14" {...strokeProps} />
          </svg>
        );
      case 'users':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <circle cx="7" cy="7" r="3" {...strokeProps} />
            <circle cx="13" cy="7" r="3" {...strokeProps} />
            <path d="M3.5 16C3.5 13.5147 5.51472 11.5 8 11.5H9" {...strokeProps} />
            <path d="M16.5 16C16.5 13.5147 14.4853 11.5 12 11.5H11" {...strokeProps} />
          </svg>
        );
      case 'lifebuoy':
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="6.5" {...strokeProps} />
            <circle cx="10" cy="10" r="3" {...strokeProps} />
            <path d="M5.5 5.5L7.5 7.5" {...strokeProps} />
            <path d="M14.5 5.5L12.5 7.5" {...strokeProps} />
            <path d="M5.5 14.5L7.5 12.5" {...strokeProps} />
            <path d="M14.5 14.5L12.5 12.5" {...strokeProps} />
          </svg>
        );
      case 'cog':
      default:
        return (
          <svg className={`w-5 h-5 ${tone}`} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="2.5" {...strokeProps} />
            <path d="M10 4V6" {...strokeProps} />
            <path d="M10 14V16" {...strokeProps} />
            <path d="M4 10H6" {...strokeProps} />
            <path d="M14 10H16" {...strokeProps} />
            <path d="M6.343 6.343L7.757 7.757" {...strokeProps} />
            <path d="M12.243 12.243L13.657 13.657" {...strokeProps} />
            <path d="M13.657 6.343L12.243 7.757" {...strokeProps} />
            <path d="M7.757 12.243L6.343 13.657" {...strokeProps} />
          </svg>
        );
    }
  };

  const profileInitials = [firstname, lastname]
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'HR';
  useEffect(() => {
    console.log('apiUrl', apiUrl);
    if (apiUrl === '') return;

    if (rawToken) {
      let tokenObj;
      try {
        tokenObj = JSON.parse(atob(rawToken));
      } catch (err) {
        console.error('Invalid token payload', err);
        tokenObj = null;
      }
      if (tokenObj) {
        if (tokenObj.selectedTags != undefined) {
          dispatch(setSelectedTags(tokenObj.selectedTags));
        }
        if (tokenObj.keyword != undefined) {
          dispatch(setKeyword(tokenObj.keyword));
        }
        if (tokenObj.code != undefined) {
          dispatch(setCode(tokenObj.code));
        }
        if (tokenObj.remark != undefined) {
          dispatch(setRemark(tokenObj.remark));
        }
        if (tokenObj.pos != undefined) {
          dispatch(setPOS(tokenObj.pos));
        }
        if (tokenObj.procedure != undefined) {
          dispatch(setProcedure(tokenObj.procedure));
        }
        if (tokenObj.startDate != undefined) {
          dispatch(setStartDate(tokenObj.startDate));
        }
        if (tokenObj.endDate != undefined) {
          dispatch(setEndDate(tokenObj.endDate));
        }
        if (tokenObj.currentPage != undefined) {
          dispatch(setCurrentPage(tokenObj.currentPage));
        }
        if (tokenObj.extra != undefined) {
          dispatch(setExtraFilter(tokenObj.extra));
        }
        if (tokenObj.tabIndex != undefined) {
          dispatch(setTabIndex(tokenObj.tabIndex));
        }
        dispatch(setTableLoading(true));
        dispatch(setPart1Loading(true));
        dispatch(setPart2Loading(true));
        dispatch(setTableData([]));
        dispatch(setPart1Count([]));
        dispatch(setPart2Count([]));
      }
    }

    if (tagLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/get_all_tags`).then((res) => {
        dispatch(setTags(res.data));
        dispatch(setSelectedTags(res.data.filter(row => row !== 'Contractual Adj' && row !== 'Patient Resp' && row !== '')));
        dispatch(decreaseLoading())
        dispatch(setTagLoading(false));
      }).catch(err => {
        dispatch(setTagLoading(false));
      });
    }
    if (countLoading) {
      dispatch(increaseLoading())
      dispatch(setCountLoading(true))
      axios.get(`${apiUrl}/get_counts`).then((res) => {
        dispatch(setCount([
          {
            count: res.data.cnt1,
            amount: res.data.amount1
          },
          {
            count: res.data.cnt2,
            amount: res.data.amount2
          },
          {
            count: res.data.cnt3,
            amount: res.data.amount3
          },
          {
            count: res.data.cnt4,
            amount: res.data.amount4
          },
          {
            count: 0,
            amount: 0
          },
          {
            count: res.data.cnt6,
            amount: 0
          },
          {
            count: res.data.cnt7,
            amount: 0
          }
        ]));
        dispatch(decreaseLoading())
        dispatch(setCountLoading(false));
      }).catch(err => {
        dispatch(setCountLoading(false));
      });
    }
    if (statisticsLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/statistics`).then(res => {
        const label = res.data.map((row, index) => row.label)
        const value = res.data.map((row, index) => row.value)
        dispatch(setCategoryLabel(label))
        dispatch(setCategoryValue(value))
        dispatch(decreaseLoading())
        dispatch(setStatisticsLoading(false))
      }).catch(err => {
        dispatch(setStatisticsLoading(false))
      })
    }
    if (payerLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/get_all_payers`).then(res => {
        dispatch(setAllPayers(res.data));
        dispatch(decreaseLoading())
        dispatch(setPayerLoading(false))
      }).catch(err => {
        dispatch(setPayerLoading(false))
      })
    }
    if (recoveryLoading) {
      dispatch(increaseLoading())
      axios.get(`${apiUrl}/recovery`).then(res => {
        dispatch(setRecovery(res.data));
        dispatch(decreaseLoading())
        dispatch(setRecoveryLoading(false))
      }).catch(err => {
        dispatch(setRecoveryLoading(false))
      })
    }
  }, [apiUrl, rawToken])

  const changeTab = (index) => {
    dispatch(setTabIndex(index));
    dispatch(setCurrentPage(1));
    dispatch(setKeyword(''));
    if (index == 0) {
      dispatch(setSelectedTags(tags.filter(row => row !== 'Contractual Adj' && row !== 'Patient Resp' && row !== '')));
    } else if (index == 1) {
      dispatch(setSelectedTags(['Contractual Adj']))
    } else if (index == 2) {
      dispatch(setSelectedTags(['Patient Resp']))
    } else if (index == 3) {
      dispatch(setSelectedTags(['Missing']))
    } else if (index == 4) {
      dispatch(setSelectedTags([]))
    } else if (index == 5) {
      dispatch(setSelectedTags(tags))
    } else if (index == 6) {
      dispatch(setSelectedTags(tags))
    }
    dispatch(setStartDate(null));
    dispatch(setEndDate(null));
    dispatch(setCode(''));
    dispatch(setRemark(''));
    dispatch(setPOS(''));
    dispatch(setProcedure(''));
    dispatch(setKeyword(''));
    dispatch(setExtraFilter({}));
    dispatch(setTableLoading(true));
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
  }

  const toggleExpand = (id) => {
    setExpandedNav((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const ensureExpanded = (id) => {
    setExpandedNav((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleNavSelection = (item) => {
    if (item.id === 'denials') {
      const denialsBase = `${baseAppPath}/denials`;
      if (location.pathname !== denialsBase) {
        navigate(denialsBase);
      }
      setSelectedNav('denials');
      return;
    }
    if (item.id === 'user-management') {
      navigate('/management');
      setSelectedNav('user-management');
      return;
    }
    if (location.pathname.includes('/denials') || location.pathname.includes('/management')) {
      navigate(baseAppPath);
    }
    if (typeof item.tab === 'number') {
      changeTab(item.tab);
    }
    setSelectedNav(item.id);
    applyNavFilters(item.id);
  };

  const handleChildSelection = (parentId, child) => {
    setSelectedNav(child.id);
    ensureExpanded(parentId);
    const parentItem = navItems.find((nav) => nav.id === parentId);
    if (parentId === 'denials') {
      const denialsBase = `${baseAppPath}/denials`;
      if (location.pathname !== denialsBase) {
        navigate(denialsBase);
      }
    } else if (location.pathname.includes('/denials') || location.pathname.includes('/management')) {
      navigate(baseAppPath);
    }
    if (typeof parentItem?.tab === 'number') {
      changeTab(parentItem.tab);
    }
    applyNavFilters(child.id);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#07090F] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <aside className={`hidden md:flex flex-col w-72 border-r px-2 py-6 ${isDark ? 'bg-[#0B0E17] border-[#1F2231] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-center gap-3 mt-6 mb-10">
          <img
            src="/helio-logo.svg"
            alt="Helio RCM logo"
            className="h-16 w-auto"
            loading="lazy"
          />
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const childActive = hasChildren && selectedNav.startsWith(`${item.id}:`);
            const isActive = selectedNav === item.id || childActive;
            const isExpanded = expandedNav.has(item.id);
            const navStateClass = isActive
              ? (isDark ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]' : 'bg-slate-900 text-white shadow-lg')
              : (isDark ? 'text-[#8A8FB1] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100');
            const iconWrapperClass = isActive
              ? (isDark ? 'border-white/20 bg-white/10' : 'border-slate-700 bg-slate-800')
              : (isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white');
            const badgeClass = isActive
              ? (isDark ? 'bg-white/20 text-white' : 'bg-white text-slate-900')
              : (isDark ? 'bg-[#1F2231] text-[#B3B8D6]' : 'bg-slate-200 text-slate-700');
            return (
              <div key={item.id}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between rounded-2xl px-2 py-2 transition-colors text-left ${navStateClass}`}
                  onClick={() => handleNavSelection(item)}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${iconWrapperClass}`}>
                      {renderNavIcon(item.icon, isActive)}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <button
                        type="button"
                        className={`p-1 rounded-full ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </span>
                </button>
                {hasChildren && isExpanded && (
                  <div className="ml-14 mt-1 mb-2 space-y-1">
                    {item.children.map((child) => {
                      const childActive = selectedNav === child.id;
                      return (
                        <button
                          type="button"
                          key={child.id}
                          className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition-colors ${
                            childActive
                              ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                              : (isDark ? 'text-[#8A8FB1] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')
                          }`}
                          onClick={() => handleChildSelection(item.id, child)}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col gap-8 px-6 md:px-10 py-10 min-w-0 overflow-hidden">
        {isUserManagementView ? (
          <div className={`rounded-[40px] border ${isDark ? 'bg-[#070B18] border-[#161B2D] text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-[0_35px_80px_rgba(3,7,18,0.35)]`}>
            <div className={`flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <p className={`${isDark ? 'text-white/50' : 'text-slate-400'} text-sm uppercase tracking-[0.35em]`}>Administration</p>
                <h2 className="text-3xl font-semibold mt-2">User Management</h2>
                <p className={`${isDark ? 'text-white/60' : 'text-slate-500'} text-sm mt-1`}>
                  Manage access, roles, and assignments without leaving the dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(baseAppPath)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${isDark ? 'border-white/20 text-white/80 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Back to Dashboard
              </button>
            </div>
            <UserManagement embedded />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-end gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B80A1]">
                    <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                      <path d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15.5 15.5L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search"
                    defaultValue={keyword}
                    ref={inputKeywordRef}
                    onKeyDown={(e) => e.key === 'Enter' && filterByKeyword()}
                    className={`h-12 w-64 rounded-full border pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] ${
                      isDark
                        ? 'bg-[#11131B] border-[#1F2231] text-white placeholder:text-[#7B80A1]'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    className={`flex items-center gap-3 rounded-full px-2 py-1 border ${isDark ? 'border-white/10 bg-[#11131B]' : 'border-slate-200 bg-white'}`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD3A5] to-[#FD6585] text-[#1A1D2B] font-semibold flex items-center justify-center">
                      {profileInitials}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''} ${isDark ? 'text-white' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="none">
                      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showProfileMenu && (
                    <div className={`absolute right-0 mt-3 w-56 rounded-2xl border shadow-2xl ${isDark ? 'bg-[#0F1119] border-[#1F2231] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                        onClick={() => {
                          dispatch(setTheme(isDark ? 'light' : 'dark'));
                          setShowProfileMenu(false);
                        }}
                      >
                        Switch to {isDark ? 'Light' : 'Dark'} Mode
                      </button>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                        onClick={() => {
                          navigate('/account-settings');
                          setShowProfileMenu(false);
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`rounded-[48px] p-6 ${isDark ? 'bg-gradient-to-r from-[#4B9187] via-[#1D2540] to-[#6911AC80]' : 'bg-white'} shadow-[0_20px_60px_rgba(0,0,0,0.25)]`}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {insightCards.map((card) => (
                  <div
                    key={card.id}
                    className={`rounded-[32px] px-6 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] bg-gradient-to-br ${card.gradient}`}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-white/70">{card.label}</p>
                    <p className="mt-3 text-2xl font-semibold">{formatDisplay(card.value, card.format)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              {showDenialModels ? <ArIntel /> : <DataTable />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReboundDash;
