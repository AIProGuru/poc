import React, { useMemo, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setAppTitle,
  setTheme,
  setTabIndex,
  setExtraFilter,
  setCurrentPage,
  setTableLoading,
  setTableData,
  setKeyword,
  setCode,
  setRemark,
  setProcedure,
  setPOS,
  setStartDate,
  setEndDate,
} from "../../redux/reducers/app.reducer";
import { setSelectedTags } from "../../redux/reducers/tag.reducer";
import { useApiEndpoint } from "../../ApiEndpointContext";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const type = useSelector((state) => state.app.type);
  const theme = useSelector((state) => state.app.theme);
  const counts = useSelector((state) => state.count.count);
  const tags = useSelector((state) => state.tags.allTags);
  const models = useSelector((state) => state.app.models) || [];
  const apiUrl = useApiEndpoint();
  const [navBadges, setNavBadges] = useState({});
  const placeholderNavs = [
    "dashboard",
    "support",
    "settings",
    "claim-edits",
    "claim-edits:ch-rejection",
    "claim-edits:payer-rejection",
    "payment-variance",
    "payment-variance:payer-overpaid",
    "payment-variance:payer-underpaid",
  ];

  const [selectedNav, setSelectedNav] = useState("home");
  const [expandedNav, setExpandedNav] = useState(() => new Set());
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const basePath =
    type === 0 ? "/rebound" : type === 1 ? "/pilotcustomer" : "/demo";
  const isDark = theme === "dark";

  const denialsCount = useMemo(() => {
    const value = counts?.[0]?.count;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [counts]);
  const patientResponsibilityCount = useMemo(() => {
    const value = counts?.[2]?.count;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [counts]);

  const navItems = useMemo(() => {
    const aiBadge = models.reduce(
      (sum, row) => sum + (Number(row.Count) || 0),
      0
    );
    return [
      { id: "home", title: "Home", icon: "home", badge: null, tab: 0 },
      { id: "dashboard", title: "Dashboard", icon: "dashboard", badge: null },
      {
        id: "claim-edits",
        title: "Claim Edits",
        icon: "clipboard",
        badge: 0,
        children: [
          { id: "claim-edits:ch-rejection", title: "CH Rejection", badge: 0 },
          { id: "claim-edits:payer-rejection", title: "Payer Rejection", badge: 0 },
        ],
      },
      {
        id: "claim-status",
        title: "Claim Status",
        icon: "list",
        badge: 0,
        children: [
          { id: "claim-status:pend-277", title: "Pend 277", badge: 0 },
          { id: "claim-status:pend-835", title: "Pend 835", badge: 0 },
        ],
      },
      {
        id: "denials",
        title: "Denials",
        icon: "shield-x",
        badge: denialsCount || null,
        children: [
          { id: "denials:authorization", title: "Authorization", badge: 0 },
          { id: "denials:billing", title: "Billing", badge: 0 },
          { id: "denials:cob", title: "Coordination of Benefits", badge: 0 },
          { id: "denials:documentation", title: "Documentation", badge: 0 },
          { id: "denials:duplicate", title: "Duplicate", badge: 0 },
          { id: "denials:eligibility", title: "Eligibility", badge: 0 },
          { id: "denials:loc", title: "Level of Care", badge: 0 },
          { id: "denials:medical-coding", title: "Medical Coding", badge: 0 },
          { id: "denials:medical-necessity", title: "Medical Necessity", badge: 0 },
          { id: "denials:non-covered", title: "Non-Covered", badge: 0 },
          { id: "denials:other", title: "Other Non-Specific", badge: 0 },
          { id: "denials:provider", title: "Provider", badge: 0 },
          { id: "denials:timely-filing", title: "Timely Filing", badge: 0 },
        ],
      },
      {
        id: "patient-responsibility",
        title: "Patient Responsibility",
        icon: "user",
        badge: patientResponsibilityCount,
        tab: 2,
        children: [{ id: "patient-responsibility:bal-due", title: "Bal Due from PT", badge: 0 }],
      },
      {
        id: "payment-variance",
        title: "Payment Variance",
        icon: "chart",
        badge: 0,
        tab: 4,
        children: [
          { id: "payment-variance:payer-overpaid", title: "Payer Overpaid", badge: 0 },
          { id: "payment-variance:payer-underpaid", title: "Payer Underpaid", badge: 0 },
        ],
      },
      {
        id: "payment-posting",
        title: "Payment Posting",
        icon: "card",
        badge: 0,
        children: [
          { id: "payment-posting:contractual-adj", title: "Contractual Adj", badge: 0 },
          { id: "payment-posting:payment", title: "Payment", badge: 0 },
          { id: "payment-posting:writeoff", title: "Write-off", badge: 0 },
          { id: "payment-posting:refund", title: "Refund", badge: 0 },
        ],
      },
      {
        id: "ai-library",
        title: "AI Library",
        icon: "book",
        badge: aiBadge || null,
      },
      { id: "support", title: "Support", icon: "lifebuoy", badge: null },
      { id: "settings", title: "Settings", icon: "cog", badge: null },
    ];
  }, [denialsCount, models, patientResponsibilityCount]);

  const navExtraFilters = useMemo(
    () => ({
      "payment-variance": { IncludeAllCategories: true },
    }),
    []
  );

  const navTagFilters = useMemo(
    () => ({
      "claim-status": ["Pend 277", "Delinquent"],
      "claim-status:pend-277": ["Pend 277"],
      "claim-status:pend-835": ["Delinquent"],
      "denials": [
        "Authorization",
        "Billing",
        "Coordination of Benefits",
        "Documentation",
        "Duplicate",
        "Eligibility",
        "Level of Care",
        "Medical Coding",
        "Medical Necessity",
        "Non-Covered",
        "Other Non-Specific",
        "Provider",
        "Timely Filing",
      ],
      "denials:authorization": ["Authorization"],
      "denials:billing": ["Billing"],
      "denials:cob": ["Coordination of Benefits"],
      "denials:documentation": ["Documentation"],
      "denials:duplicate": ["Duplicate"],
      "denials:eligibility": ["Eligibility"],
      "denials:loc": ["Level of Care"],
      "denials:medical-coding": ["Medical Coding"],
      "denials:medical-necessity": ["Medical Necessity"],
      "denials:non-covered": ["Non-Covered"],
      "denials:other": ["Other Non-Specific"],
      "denials:provider": ["Provider"],
      "denials:timely-filing": ["Timely Filing"],
      "patient-responsibility": ["Patient Resp"],
      "patient-responsibility:bal-due": ["Patient Resp"],
      "payment-posting:contractual-adj": ["Contractual Adj"],
      "payment-posting:payment": ["Payment"],
      "payment-posting:writeoff": ["Write-off"],
      "payment-posting:refund": ["Refund"],
      "payment-posting": ["Contractual Adj", "Payment", "Write-off", "Refund"],
    }),
    []
  );

  const formatCount = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === "number") return value.toLocaleString("en-US");
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : value;
  };

  const renderIcon = (name, active) => {
    const stroke = active ? "#ffffff" : "#8A8FB1";
    const fill = active ? "#ffffff" : "none";
    switch (name) {
      case "home":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
          </svg>
        );
      case "dashboard":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="9" rx="2" />
            <rect x="14" y="3" width="7" height="5" rx="2" />
            <rect x="14" y="11" width="7" height="10" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
          </svg>
        );
      case "clipboard":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M9 4V3h6v1" />
            <path d="M9 9h6" />
            <path d="M9 13h6" />
          </svg>
        );
      case "list":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6h11" />
            <path d="M9 12h11" />
            <path d="M9 18h11" />
            <circle cx="4" cy="6" r="1.5" fill={stroke} />
            <circle cx="4" cy="12" r="1.5" fill={stroke} />
            <circle cx="4" cy="18" r="1.5" fill={stroke} />
          </svg>
        );
      case "shield-x":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l8 4v5c0 5-3.6 7.6-8 9-4.4-1.4-8-4-8-9V7l8-4Z" />
            <path d="m10 10 4 4" />
            <path d="m14 10-4 4" />
          </svg>
        );
      case "user":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20c1.5-2 3.75-3 6-3s4.5 1 6 3" />
          </svg>
        );
      case "chart":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19V5" />
            <path d="M4 19h16" />
            <rect x="7" y="10" width="3" height="6" rx="1" />
            <rect x="12" y="7" width="3" height="9" rx="1" />
            <rect x="17" y="4" width="3" height="12" rx="1" />
          </svg>
        );
      case "card":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 9h18" />
            <path d="M7 13h4" />
          </svg>
        );
      case "book":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
            <path d="M20 5v14.5a1.5 1.5 0 0 1-2.11 1.39L12 18.5l-5.89 2.39A1.5 1.5 0 0 1 4 19.5" />
          </svg>
        );
      case "lifebuoy":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 15.5 19 19" />
            <path d="M8.5 15.5 5 19" />
            <path d="M5 5 8.5 8.5" />
            <path d="M19 5 15.5 8.5" />
          </svg>
        );
      case "cog":
        return (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const applyFilters = useCallback(
    (navId, fallbackTab) => {
      // Always clear ad-hoc filters when switching nav so AI drill-down payloads don't leak.
      dispatch(setKeyword(""));
      dispatch(setCode(""));
      dispatch(setRemark(""));
      dispatch(setProcedure(""));
      dispatch(setPOS(""));
      dispatch(setStartDate(null));
      dispatch(setEndDate(null));

      if (placeholderNavs.includes(navId)) {
        dispatch(setSelectedTags([]));
        dispatch(setExtraFilter({}));
        dispatch(setTableData([]));
        dispatch(setTableLoading(false));
        return;
      }
      const isAiLibrary = navId === "ai-library";
      let extra = navExtraFilters[navId] || navExtraFilters[fallbackTab] || {};
      let tagOverride = navTagFilters[navId];

      if (navId === "home") {
        extra = { IncludeAllCategories: true };
        tagOverride = [];
      }

      const tabOverrideMap = {
        "patient-responsibility": 2,
        "patient-responsibility:bal-due": 2,
        "payment-posting:contractual-adj": 1,
      };

      dispatch(setExtraFilter(extra));

      if (tagOverride && tagOverride.length > 0) {
        dispatch(setSelectedTags(tagOverride));
        dispatch(setTabIndex(tabOverrideMap[navId] ?? 6));
      } else if (navId === "ai-library") {
        // Keep denial categories visible when browsing AI Library
        dispatch(setSelectedTags(tags));
        dispatch(setTabIndex(6));
      } else if (navId === "denials") {
        const defaultTags = tags.filter(
          (tag) => tag && tag !== "Contractual Adj" && tag !== "Patient Resp"
        );
        dispatch(setSelectedTags(defaultTags));
        dispatch(setTabIndex(6));
      } else {
        dispatch(setSelectedTags([]));
      }

      dispatch(setCurrentPage(1));
      if (!isAiLibrary) {
        dispatch(setTableLoading(true));
      } else {
        dispatch(setTableLoading(false));
      }
    },
    [dispatch, navExtraFilters, navTagFilters, tags]
  );

  useEffect(() => {
    if (!apiUrl || !tags || tags.length === 0) return;
    const tabOverrideMap = {
      "patient-responsibility": 2,
      "patient-responsibility:bal-due": 2,
      "payment-posting:contractual-adj": 1,
    };
    const requests = [];
    const addRequest = (navId, parentTab) => {
      const tagOverride = navTagFilters[navId];
      if (!tagOverride || tagOverride.length === 0) return;
      const tabIndex =
        tabOverrideMap[navId] ??
        (typeof parentTab === "number" ? parentTab : 6);
      const extra = navExtraFilters[navId] || {};
      requests.push(
        axios
          .post(`${apiUrl}/part1_all`, {
            tabIndex,
            keyword: "",
            selectedTags: tagOverride,
            startDate: null,
            endDate: null,
            code: "",
            remark: "",
            procedure: "",
            pos: "",
            extra,
          })
          .then((res) => ({
            navId,
            count: res.data?.Count ?? res.data?.count ?? 0,
          }))
          .catch(() => null)
      );
    };

    navItems.forEach((item) => {
      const parentTab = item.tab;
      if (navTagFilters[item.id]) {
        addRequest(item.id, parentTab);
      }
      if (Array.isArray(item.children)) {
        item.children.forEach((child) => addRequest(child.id, parentTab));
      }
    });

    if (requests.length === 0) return;
    Promise.all(requests).then((results) => {
      const next = {};
      results
        .filter(Boolean)
        .forEach(({ navId, count }) => {
          next[navId] = Number(count) || 0;
        });
      const paymentPostingChildren = [
        "payment-posting:contractual-adj",
        "payment-posting:payment",
        "payment-posting:writeoff",
        "payment-posting:refund",
      ];
      if (paymentPostingChildren.some((id) => Object.prototype.hasOwnProperty.call(next, id))) {
        next["payment-posting"] = paymentPostingChildren.reduce(
          (total, id) => total + (next[id] || 0),
          0
        );
      }
      setNavBadges(next);
    });
  }, [apiUrl, tags, navItems, navExtraFilters, navTagFilters]);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobileView(nextIsMobile);
      if (!nextIsMobile) {
        setMobileExpanded(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (item) => {
    if (isMobileView && !mobileExpanded) {
      setMobileExpanded(true);
      return;
    }
    dispatch(setAppTitle(item.title));
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    if (hasChildren) {
      setExpandedNav((prev) => {
        const next = new Set(prev);
        if (next.has(item.id) && selectedNav === item.id) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    }
    setSelectedNav(item.id);
    if (item.id === "home") {
      dispatch(setTabIndex(0));
    } else if (typeof item.tab === "number") {
      dispatch(setTabIndex(item.tab));
    }
    applyFilters(item.id, item.id);
    navigate(basePath);
    if (isMobileView) {
      setMobileExpanded(false);
    }
  };

  const handleChildClick = (parent, child) => {
    if (isMobileView && !mobileExpanded) {
      setMobileExpanded(true);
      return;
    }
    dispatch(setAppTitle(`${parent.title} > ${child.title}`));
    setSelectedNav(child.id);
    if (typeof parent.tab === "number") {
      dispatch(setTabIndex(parent.tab));
    }
    applyFilters(child.id, parent.id);
    setExpandedNav((prev) => new Set(prev).add(parent.id));
    navigate(basePath);
    if (isMobileView) {
      setMobileExpanded(false);
    }
  };

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

  useEffect(() => {
    const current = navItems.find((nav) => nav.id === selectedNav);
    if (!current) return;
    dispatch(setAppTitle(current.title));
  }, [selectedNav, navItems, dispatch]);

  const activeId = selectedNav;

  return (
    <>
      {isMobileView && mobileExpanded && (
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={() => setMobileExpanded(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
      <aside
        className={`flex flex-col h-screen border-r px-2 md:px-3 py-6 top-0 left-0 ${
          mobileExpanded ? "w-[308px]" : "w-[72px]"
        } md:w-[308px] ${
          isMobileView ? (mobileExpanded ? "fixed z-50" : "sticky") : "sticky"
        } ${
          isDark
            ? "bg-[#1F2024] border-r-[#3f4045] text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
      <div
        className={`flex items-center justify-center gap-3 pb-6 ${
          isDark ? "bg-[#1F2024]" : "bg-white"
        } sticky top-0 z-10`}
      >
        <img
          src="/logo_sm.svg"
          alt="Helio RCM logo"
          className={`h-12 w-12 ${mobileExpanded ? "hidden md:hidden" : "md:hidden"}`}
          loading="lazy"
        />
        <img
          src="/helio-logo.svg"
          alt="Helio RCM logo"
          className={`${mobileExpanded ? "block" : "hidden"} h-16 w-auto md:block`}
          loading="lazy"
        />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto sidebar-scrollbar pr-1">
        {navItems.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const childActive = hasChildren && activeId.startsWith(`${item.id}:`);
          const isActive = activeId === item.id || childActive;
          const isExpanded = expandedNav.has(item.id) || childActive;
          const childSum = hasChildren
            ? item.children.reduce((sum, child) => sum + (navBadges[child.id] ?? 0), 0)
            : 0;
          const parentBadge = navBadges[item.id];
          const computedBadge =
            typeof parentBadge === "number" && parentBadge > 0
              ? parentBadge
              : childSum > 0
                ? childSum
                : item.badge;
          const navStateClass = isActive
            ? isDark
              ? "bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              : "bg-slate-900 text-white shadow-lg"
            : isDark
            ? "text-[#F4F4F4]/50 hover:bg-white/5"
            : "text-slate-500 hover:bg-slate-100";
          const iconWrapperClass = isActive
            ? isDark
              ? "border-white/20 bg-white/10"
              : "border-slate-700 bg-slate-800"
            : isDark
            ? "border-white/5 bg-white/5"
            : "border-slate-200 bg-white";
          const badgeClass = isActive
            ? isDark
              ? "bg-white/20 text-white"
              : "bg-white text-slate-900"
            : isDark
            ? "bg-[#1F2231] text-[#F4F4F4]/50"
            : "bg-slate-200 text-slate-700";
          return (
            <div key={item.id}>
              <div className={`w-full flex items-center rounded-2xl px-2 py-2 transition-colors ${navStateClass}`}>
                <button
                  type="button"
                  aria-label={item.title}
                  className={`flex-1 flex items-center justify-center gap-2 text-left bg-transparent border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    mobileExpanded ? "justify-between" : "md:justify-between"
                  }`}
                  onClick={() => handleClick(item)}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconWrapperClass}`}
                    >
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span
                      className={`${mobileExpanded ? "inline" : "hidden"} md:inline text-sm font-medium truncate max-w-[100px]`}
                      title={item.title}
                    >
                      {item.title}
                    </span>
                  </span>
                  {computedBadge !== null && computedBadge !== undefined && (
                    <span
                      className={`${mobileExpanded ? "inline-flex" : "hidden"} md:inline-flex text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
                    >
                      {formatCount(computedBadge)}
                    </span>
                  )}
                </button>
                {hasChildren && (
                  <button
                    type="button"
                    className={`${mobileExpanded ? "flex" : "hidden"} md:flex p-1 rounded-full ml-2 ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
                    onClick={(e) => {
                      e.preventDefault();
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
              </div>
              {hasChildren && (
                <div
                  className={`${mobileExpanded ? "block" : "hidden"} md:block ml-14 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'mt-1 mb-2 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'}`}
                  style={{
                    maxHeight: isExpanded ? `${(item.children?.length || 1) * 44}px` : 0,
                  }}
                >
                  {item.children.map((child) => {
                    const childIsActive = activeId === child.id;
                    const childBadge =
                      navBadges[child.id] ??
                      child.badge ??
                      (navBadges[item.id] ?? 0);
                    return (
                      <button
                        type="button"
                        key={child.id}
                        className={`w-full flex items-center justify-between text-left text-xs font-medium px-3 py-2 rounded-xl transition-colors ${
                          childIsActive
                            ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                            : (isDark ? 'text-[#F4F4F4]/50 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')
                        }`}
                        onClick={() => handleChildClick(item, child)}
                      >
                        <span className="truncate" title={child.title}>{child.title}</span>
                        <span
                          className={`ml-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            childIsActive
                              ? (isDark ? 'bg-white/20 text-white' : 'bg-white text-slate-900')
                              : (isDark ? 'bg-[#1F2231] text-[#F4F4F4]/50' : 'bg-slate-200 text-slate-700')
                          }`}
                        >
                          {formatCount(childBadge)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* <div className="mt-6 flex items-center justify-between px-3">
        <span className="text-sm font-semibold">Theme</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isDark}
            onChange={() => dispatch(setTheme(isDark ? "light" : "dark"))}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div> */}
    </aside>
    </>
  );
};

export default Sidebar;
