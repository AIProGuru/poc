import {
  setAppTitle,
  setCode,
  setCurrentPage,
  setDenialTabIds,
  setEndDate,
  setExtraFilter,
  setKeyword,
  setPOS,
  setProcedure,
  setRemark,
  setStartDate,
  setTabIndex,
  setTableData,
  setTableLoading,
} from "../redux/reducers/app.reducer";
import { setSelectedTags } from "../redux/reducers/tag.reducer";

export const WORKLIST_PLACEHOLDER_IDS = [
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

export const WORKLIST_NAV_CHILDREN = {
  "claim-edits": [
    { id: "claim-edits:ch-rejection", title: "CH Rejection", category: "CH Rejection" },
    { id: "claim-edits:payer-rejection", title: "Payer Rejection", category: "Payer Rejection" },
  ],
  "claim-status": [
    { id: "claim-status:pend-277", title: "Pend 277", category: "Pend 277" },
    { id: "claim-status:pend-835", title: "Pend 835", category: "Pend 835" },
  ],
  denials: [
    { id: "denials:authorization", title: "Authorization", category: "Authorization" },
    { id: "denials:billing", title: "Billing", category: "Billing" },
    { id: "denials:cob", title: "Coordination of Benefits", category: "Coordination of Benefits" },
    { id: "denials:documentation", title: "Documentation", category: "Documentation" },
    { id: "denials:duplicate", title: "Duplicate", category: "Duplicate" },
    { id: "denials:eligibility", title: "Eligibility", category: "Eligibility" },
    { id: "denials:loc", title: "Level of Care", category: "Level of Care" },
    { id: "denials:medical-coding", title: "Medical Coding", category: "Medical Coding" },
    { id: "denials:medical-necessity", title: "Medical Necessity", category: "Medical Necessity" },
    { id: "denials:non-covered", title: "Non-Covered", category: "Non-Covered" },
    { id: "denials:other", title: "Other Non-Specific", category: "Other Non-Specific" },
    { id: "denials:provider", title: "Provider", category: "Provider" },
    { id: "denials:timely-filing", title: "Timely Filing", category: "Timely Filing" },
  ],
  "patient-responsibility": [
    { id: "patient-responsibility:bal-due", title: "Bal Due from PT", category: "Patient Resp" },
  ],
  "payment-variance": [
    { id: "payment-variance:payer-overpaid", title: "Payer Overpaid", category: "Payer Overpaid" },
    { id: "payment-variance:payer-underpaid", title: "Payer Underpaid", category: "Payer Underpaid" },
  ],
  "payment-posting": [
    { id: "payment-posting:contractual-adj", title: "Contractual Adj", category: "Contractual Adj" },
    { id: "payment-posting:payment", title: "Payment", category: "Payment" },
    { id: "payment-posting:writeoff", title: "Write-off", category: "Write-off" },
    { id: "payment-posting:refund", title: "Refund", category: "Refund" },
  ],
};

export const WORKLIST_PARENT_TITLES = {
  "claim-edits": "Claim Edits",
  "claim-status": "Claim Status",
  denials: "Denials",
  "patient-responsibility": "Patient Responsibility",
  "payment-variance": "Payment Variance",
  "payment-posting": "Payment Posting",
};

export const WORKLIST_EXTRA_FILTERS = {
  "recent-claims": { RecentClaims: true, IncludeAllCategories: true },
  "payment-variance": { IncludeAllCategories: true },
  "claim-status:pend-277": { IncludeAllCategories: true, Pend277: true },
  "claim-status:pend-835": { IncludeAllCategories: true, Pend835: true },
};

export const WORKLIST_TAG_FILTERS = {
  "claim-status": ["Pend 277", "Delinquent"],
  "claim-status:pend-277": [],
  "claim-status:pend-835": [],
  denials: [
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
};

export const WORKLIST_TAB_INDEX = {
  "patient-responsibility": 2,
  "patient-responsibility:bal-due": 2,
  "payment-posting": 1,
  "payment-posting:contractual-adj": 1,
  "payment-posting:payment": 1,
  "payment-posting:writeoff": 1,
  "payment-posting:refund": 1,
  "payment-variance": 4,
  "payment-variance:payer-overpaid": 4,
  "payment-variance:payer-underpaid": 4,
};

const TAG_ALIAS_MAP = {
  "patient responsibility": "Patient Resp",
  "bal due from pt": "Patient Resp",
  "pend 835": "Delinquent",
};

export const normalizeTagKey = (value) => `${value || ""}`.trim().toLowerCase();

export const getParentNavId = (navId) => {
  if (!navId) return navId;
  const idx = `${navId}`.indexOf(":");
  return idx === -1 ? navId : navId.slice(0, idx);
};

export const isWorklistNav = (navId) =>
  Boolean(WORKLIST_NAV_CHILDREN[getParentNavId(navId)]);

export const getWorklistChild = (navId) => {
  const parentId = getParentNavId(navId);
  const children = WORKLIST_NAV_CHILDREN[parentId] || [];
  return children.find((child) => child.id === navId) || null;
};

const categoryAliases = (category) => {
  const value = `${category || ""}`.trim();
  if (!value) return [];
  if (value === "Pend 835" || value === "Delinquent") return ["Pend 835", "Delinquent"];
  if (value === "Patient Resp" || value === "Bal Due from PT") {
    return ["Patient Resp", "Bal Due from PT"];
  }
  return [value];
};

export const categoryMatchesPermission = (category, allowedCategories) => {
  if (!Array.isArray(allowedCategories) || allowedCategories.length === 0) return true;
  const aliases = categoryAliases(category).map(normalizeTagKey);
  return allowedCategories.some((allowed) => aliases.includes(normalizeTagKey(allowed)));
};

export const getPermittedWorklistChildren = (
  parentId,
  accessDenialCategory,
  isPrivilegedRole
) => {
  const children = WORKLIST_NAV_CHILDREN[parentId] || [];
  const allowedCategories = Array.isArray(accessDenialCategory) ? accessDenialCategory : [];
  const restrictCategories = allowedCategories.length > 0 && !isPrivilegedRole;
  if (!restrictCategories) return children;
  return children.filter((child) =>
    categoryMatchesPermission(child.category || child.title, allowedCategories)
  );
};

export const buildAvailableTagLookup = (tags) => {
  const lookup = new Map();
  (tags || []).forEach((tag) => {
    const normalized = normalizeTagKey(tag);
    if (!normalized || lookup.has(normalized)) return;
    lookup.set(normalized, tag);
  });
  return lookup;
};

export const resolveFilterTags = (tagList, tags) => {
  const lookup = buildAvailableTagLookup(tags);
  const resolved = (tagList || [])
    .map((tag) => {
      const normalized = normalizeTagKey(tag);
      if (!normalized) return "";
      const aliased = TAG_ALIAS_MAP[normalized] || tag;
      return lookup.get(normalizeTagKey(aliased)) || lookup.get(normalized) || aliased;
    })
    .filter((tag) => `${tag || ""}`.trim() !== "");
  return [...new Set(resolved)];
};

const getDenialTabsStorageKey = (username) =>
  `helio.denialWorklistTabs.${username || "default"}`;

export const readStoredDenialTabIds = (username) => {
  try {
    const raw = localStorage.getItem(getDenialTabsStorageKey(username));
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch (err) {
    return [];
  }
};

export const writeStoredDenialTabIds = (username, ids) => {
  try {
    localStorage.setItem(getDenialTabsStorageKey(username), JSON.stringify(ids || []));
  } catch (err) {
    // ignore storage failures
  }
};

export const persistDenialTabIds = (dispatch, username, ids) => {
  const nextIds = Array.isArray(ids) ? ids : [];
  writeStoredDenialTabIds(username, nextIds);
  dispatch(setDenialTabIds(nextIds));
};

export const getInitialWorklistNavId = ({
  parentId,
  accessDenialCategory,
  isPrivilegedRole,
  username,
}) => {
  const permitted = getPermittedWorklistChildren(
    parentId,
    accessDenialCategory,
    isPrivilegedRole
  );
  if (parentId === "denials") {
    const stored = readStoredDenialTabIds(username).filter((id) =>
      permitted.some((child) => child.id === id)
    );
    return stored[0] || parentId;
  }
  return permitted[0]?.id || parentId;
};

export const getWorklistTitle = (navId) => {
  const parentId = getParentNavId(navId);
  const parentTitle = WORKLIST_PARENT_TITLES[parentId];
  if (!parentTitle) return null;
  const child = getWorklistChild(navId);
  return child ? `${parentTitle} > ${child.title}` : parentTitle;
};

export const getChildBadgeCount = (child, navGrouped, navPendCounts) => {
  if (!child) return 0;
  if (child.id === "claim-status:pend-277") return Number(navPendCounts?.pend277 || 0);
  if (child.id === "claim-status:pend-835") return Number(navPendCounts?.pend835 || 0);
  const parentId = getParentNavId(child.id);
  const tabIndex = WORKLIST_TAB_INDEX[child.id] ?? WORKLIST_TAB_INDEX[parentId] ?? 6;
  const rows = navGrouped?.[String(tabIndex)] || [];
  const aliases = categoryAliases(child.category || child.title).map(normalizeTagKey);
  return rows.reduce((sum, row) => {
    const key = normalizeTagKey(row?.Category);
    if (!key || !aliases.includes(key)) return sum;
    return sum + (Number(row.Count) || 0);
  }, 0);
};

export const applyWorklistNavFilters = ({ dispatch, navId, tags }) => {
  dispatch(setKeyword(""));
  dispatch(setCode(""));
  dispatch(setRemark(""));
  dispatch(setProcedure(""));
  dispatch(setPOS(""));
  dispatch(setStartDate(null));
  dispatch(setEndDate(null));

  if (WORKLIST_PLACEHOLDER_IDS.includes(navId)) {
    dispatch(setSelectedTags([]));
    dispatch(setExtraFilter({}));
    dispatch(setTableData([]));
    dispatch(setTableLoading(false));
    return;
  }

  const isAiLibrary = navId === "ai-library";
  let extra = WORKLIST_EXTRA_FILTERS[navId] || {};
  let tagOverride = resolveFilterTags(WORKLIST_TAG_FILTERS[navId], tags);

  if (navId === "home") {
    extra = { IncludeAllCategories: true };
    tagOverride = [];
  }

  if (navId === "recent-claims") {
    extra = { RecentClaims: true, IncludeAllCategories: true };
    tagOverride = [];
  }

  dispatch(setExtraFilter(extra));

  const worklistTabIndex = WORKLIST_TAB_INDEX[navId] ?? (isWorklistNav(navId) || isAiLibrary ? 6 : null);

  if (tagOverride && tagOverride.length > 0) {
    dispatch(setSelectedTags(tagOverride));
    dispatch(setTabIndex(WORKLIST_TAB_INDEX[navId] ?? 6));
  } else if (isAiLibrary) {
    dispatch(setSelectedTags(resolveFilterTags(tags, tags)));
    dispatch(setTabIndex(6));
  } else if (navId === "denials") {
    dispatch(setSelectedTags([]));
    dispatch(setTabIndex(6));
    dispatch(setCurrentPage(1));
    dispatch(setTableData([]));
    dispatch(setTableLoading(false));
    return;
  } else {
    dispatch(setSelectedTags([]));
    if (typeof worklistTabIndex === "number") {
      dispatch(setTabIndex(worklistTabIndex));
    }
  }

  dispatch(setCurrentPage(1));
  if (!isAiLibrary) {
    dispatch(setTableData([]));
    dispatch(setTableLoading(true));
  } else {
    dispatch(setTableLoading(false));
  }
};

export const selectWorklistNav = ({
  dispatch,
  navId,
  tags,
  title,
}) => {
  const nextTitle = title || getWorklistTitle(navId);
  if (nextTitle) {
    dispatch(setAppTitle(nextTitle));
  }
  applyWorklistNavFilters({ dispatch, navId, tags });
};
