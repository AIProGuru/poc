import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setAppTitle,
  setTheme,
  setTabIndex,
  setExtraFilter,
  setCurrentPage,
  setTableLoading,
} from "../../redux/reducers/app.reducer";
import { setSelectedTags } from "../../redux/reducers/tag.reducer";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const type = useSelector((state) => state.app.type);
  const theme = useSelector((state) => state.app.theme);
  const counts = useSelector((state) => state.count.count);
  const tags = useSelector((state) => state.tags.allTags);
  const models = useSelector((state) => state.app.models) || [];
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
    "payment-posting",
    "payment-posting:payment",
    "payment-posting:writeoff",
    "payment-posting:refund",
  ];

  const [selectedNav, setSelectedNav] = useState("home");
  const [expandedNav, setExpandedNav] = useState(() => new Set());

  const basePath =
    type === 0 ? "/rebound" : type === 1 ? "/pilotcustomer" : "/demo";
  const isDark = theme === "dark";

  const denialsCount = useMemo(() => {
    const value = counts?.[0]?.count;
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
        badge: 45,
        children: [
          { id: "claim-edits:ch-rejection", title: "CH Rejection" },
          { id: "claim-edits:payer-rejection", title: "Payer Rejection" },
        ],
      },
      {
        id: "claim-status",
        title: "Claim Status",
        icon: "list",
        badge: 96,
        children: [
          { id: "claim-status:pend-277", title: "Pend 277" },
          { id: "claim-status:pend-835", title: "Pend 835" },
        ],
      },
      {
        id: "denials",
        title: "Denials",
        icon: "shield-x",
        badge: denialsCount || null,
        children: [
          { id: "denials:authorization", title: "Authorization" },
          { id: "denials:billing", title: "Billing" },
          { id: "denials:cob", title: "Coordination of Benefits" },
          { id: "denials:documentation", title: "Documentation" },
          { id: "denials:duplicate", title: "Duplicate" },
          { id: "denials:eligibility", title: "Eligibility" },
          { id: "denials:loc", title: "Level of Care" },
          { id: "denials:medical-coding", title: "Medical Coding" },
          { id: "denials:medical-necessity", title: "Medical Necessity" },
          { id: "denials:non-covered", title: "Non-Covered" },
          { id: "denials:other", title: "Other Non-Specific" },
          { id: "denials:provider", title: "Provider" },
          { id: "denials:timely-filing", title: "Timely Filing" },
        ],
      },
      {
        id: "patient-responsibility",
        title: "Patient Responsibility",
        icon: "user",
        badge: 23,
        tab: 2,
        children: [{ id: "patient-responsibility:bal-due", title: "Bal Due from PT" }],
      },
      {
        id: "payment-variance",
        title: "Payment Variance",
        icon: "chart",
        badge: 67,
        tab: 4,
        children: [
          { id: "payment-variance:payer-overpaid", title: "Payer Overpaid" },
          { id: "payment-variance:payer-underpaid", title: "Payer Underpaid" },
        ],
      },
      {
        id: "payment-posting",
        title: "Payment Posting",
        icon: "card",
        badge: 36,
        children: [
          { id: "payment-posting:contractual-adj", title: "Contractual Adj" },
          { id: "payment-posting:payment", title: "Payment" },
          { id: "payment-posting:writeoff", title: "Write-off" },
          { id: "payment-posting:refund", title: "Refund" },
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
  }, [denialsCount, models]);

  const navExtraFilters = useMemo(
    () => ({
      "claim-status:pend-835": { Missing835: true },
      "payment-variance": { IncludeAllCategories: true },
    }),
    []
  );

  const navTagFilters = useMemo(
    () => ({
      "claim-status:pend-835": ["Delinquent"],
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
    }),
    []
  );

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
      if (placeholderNavs.includes(navId)) {
        dispatch(setSelectedTags([]));
        dispatch(setExtraFilter({}));
        dispatch(setTableLoading(false));
        return;
      }
      let extra = navExtraFilters[navId] || navExtraFilters[fallbackTab] || {};
      let tagOverride = navTagFilters[navId];

      if (navId === "home") {
        extra = { IncludeAllCategories: true };
        tagOverride = [];
      }

      dispatch(setExtraFilter(extra));

      if (tagOverride && tagOverride.length > 0) {
        dispatch(setSelectedTags(tagOverride));
        dispatch(setTabIndex(6));
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
      dispatch(setTableLoading(true));
    },
    [dispatch, navExtraFilters, navTagFilters, tags]
  );

  const handleClick = (item) => {
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
  };

  const handleChildClick = (parent, child) => {
    dispatch(setAppTitle(`${parent.title} > ${child.title}`));
    setSelectedNav(child.id);
    if (typeof parent.tab === "number") {
      dispatch(setTabIndex(parent.tab));
    }
    applyFilters(child.id, parent.id);
    setExpandedNav((prev) => new Set(prev).add(parent.id));
    navigate(basePath);
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
    <aside
      className={`hidden md:flex flex-col w-72 h-full border-r px-3 py-6 ${
        isDark
          ? "bg-[#0B0E17] border-[#1F2231] text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="flex items-center justify-center gap-3 mt-4 mb-10">
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
          const childActive = hasChildren && activeId.startsWith(`${item.id}:`);
          const isActive = activeId === item.id || childActive;
          const isExpanded = expandedNav.has(item.id) || childActive;
          const navStateClass = isActive
            ? isDark
              ? "bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              : "bg-slate-900 text-white shadow-lg"
            : isDark
            ? "text-[#8A8FB1] hover:bg-white/5"
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
            ? "bg-[#1F2231] text-[#B3B8D6]"
            : "bg-slate-200 text-slate-700";
          return (
            <div key={item.id}>
              <div className={`w-full flex items-center rounded-2xl px-2 py-2 transition-colors ${navStateClass}`}>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-between gap-2 text-left bg-transparent border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  onClick={() => handleClick(item)}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${iconWrapperClass}`}
                    >
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.title}
                    </span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
                {hasChildren && (
                  <button
                    type="button"
                    className={`p-1 rounded-full ml-2 ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
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
              {hasChildren && isExpanded && (
                <div className="ml-14 mt-1 mb-2 space-y-1">
                  {item.children.map((child) => {
                    const childIsActive = activeId === child.id;
                    return (
                      <button
                        type="button"
                        key={child.id}
                        className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition-colors ${
                          childIsActive
                            ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                            : (isDark ? 'text-[#8A8FB1] hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')
                        }`}
                        onClick={() => handleChildClick(item, child)}
                      >
                        {child.title}
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
  );
};

export default Sidebar;
