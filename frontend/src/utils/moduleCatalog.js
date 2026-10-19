export const MODULE_OPTIONS = [
  "Price Transparency",
  "Clinical Intelligence",
  "Charge Capture",
  "Coding Accuracy",
  "Claim Edits",
  "Claim Status",
  "Denials",
  "Patient Resp",
  "Payment Variance",
  "Payment Posting",
];

export const MODULE_CATEGORY_MAP = {
  "Price Transparency": ["Price Transparency"],
  "Clinical Intelligence": ["Clinical Intelligence"],
  "Coding Accuracy": ["Coding Accuracy"],
  "Charge Capture": ["Charge Capture"],
  "Claim Edits": ["CH Rejection", "Payer Rejection"],
  "Claim Status": ["Pend 277", "Pend 835"],
  "Denials": [
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
  "Patient Resp": ["Patient Resp"],
  "Payment Variance": ["Payer Overpaid", "Payer Underpaid"],
  "Payment Posting": ["Contractual Adj", "Payment", "Write-off", "Refund"],
};

export const DASHBOARD_RECOVERABLE_MODULES = [
  "Claim Edits",
  "Claim Status",
  "Denials",
  "Patient Resp",
  "Payment Variance",
];

export const DASHBOARD_NON_RECOVERABLE_MODULE = "Payment Posting";

/** Sidebar item id → skillset module name stored on the user profile. */
export const NAV_ID_TO_MODULE = {
  "price-transparency": "Price Transparency",
  cdi: "Clinical Intelligence",
  "coding-accuracy": "Coding Accuracy",
  "charge-capture": "Charge Capture",
  "claim-edits": "Claim Edits",
  "claim-status": "Claim Status",
  denials: "Denials",
  "patient-responsibility": "Patient Resp",
  "payment-variance": "Payment Variance",
  "payment-posting": "Payment Posting",
};

const MODULE_NAME_ALIASES = {
  "clinical documentation integrity (cdi)": "Clinical Intelligence",
  "clinical documentation intelligence": "Clinical Intelligence",
};

export const canonicalModuleName = (name) => {
  const raw = `${name || ""}`.trim();
  return MODULE_NAME_ALIASES[raw.toLowerCase()] || raw;
};

export const isNavModuleAllowed = (navId, modules, privileged) => {
  const moduleName = NAV_ID_TO_MODULE[navId];
  if (!moduleName || privileged) return true;
  if (!Array.isArray(modules) || modules.length === 0) return true;
  const allowed = new Set(modules.map((name) => canonicalModuleName(name).toLowerCase()));
  return allowed.has(canonicalModuleName(moduleName).toLowerCase());
};

const CATEGORY_TO_MODULE = (() => {
  const map = new Map();
  Object.entries(MODULE_CATEGORY_MAP).forEach(([module, categories]) => {
    categories.forEach((category) => {
      map.set(category.toLowerCase(), module);
    });
  });
  return map;
})();

export const getModuleForCategory = (category) => {
  const normalized = `${category || ""}`.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "payment posting") return DASHBOARD_NON_RECOVERABLE_MODULE;
  return CATEGORY_TO_MODULE.get(normalized) || null;
};

const categoryAliases = (category) => {
  const value = `${category || ""}`.trim().toLowerCase();
  if (!value) return [];
  if (value === "pend 835" || value === "delinquent") return ["pend 835", "delinquent"];
  return [value];
};

/** True when this claim category is inside the user's assigned modules and categories. */
export const isCategoryInAssignedSkills = (category, { modules, denialCategory, privileged } = {}) => {
  if (privileged) return true;
  const assignedModules = (Array.isArray(modules) ? modules : []).map((name) => `${name || ""}`.trim()).filter(Boolean);
  const assignedCategories = (Array.isArray(denialCategory) ? denialCategory : [])
    .map((name) => `${name || ""}`.trim().toLowerCase())
    .filter(Boolean);
  if (assignedModules.length === 0 && assignedCategories.length === 0) return true;

  const lookupCategory = `${category || ""}`.trim().toLowerCase() === "delinquent" ? "Pend 835" : category;

  if (assignedModules.length > 0) {
    const moduleName = getModuleForCategory(lookupCategory);
    const allowedModules = new Set(assignedModules.map((name) => canonicalModuleName(name).toLowerCase()));
    if (!moduleName || !allowedModules.has(moduleName.toLowerCase())) return false;
  }

  if (assignedCategories.length > 0) {
    const aliases = categoryAliases(category);
    if (!aliases.some((alias) => assignedCategories.includes(alias))) return false;
  }

  return true;
};

export const getAccessibleModelCount = (row, access) => {
  if (!isCategoryInAssignedSkills(row?.Category, access)) return 0;
  const count = Number(row?.Count);
  return Number.isFinite(count) ? count : 0;
};

export const isRecoverableDashboardCategory = (category) => {
  const module = getModuleForCategory(category);
  return module != null && DASHBOARD_RECOVERABLE_MODULES.includes(module);
};

export const isNonRecoverableDashboardCategory = (category) =>
  getModuleForCategory(category) === DASHBOARD_NON_RECOVERABLE_MODULE;

export const isDashboardArCategory = (category) =>
  isRecoverableDashboardCategory(category) || isNonRecoverableDashboardCategory(category);

/** Worklist tab that owns category counts (must match sidebar navGrouped tabs). */
export const getDashboardCategorySourceTab = (category) => {
  const module = getModuleForCategory(category);
  if (module === DASHBOARD_NON_RECOVERABLE_MODULE) return "1";
  if (module === "Patient Resp") return "2";
  if (module === "Payment Variance") return "4";
  if (module != null && DASHBOARD_RECOVERABLE_MODULES.includes(module)) return "6";
  return null;
};

export const buildDashboardCategoriesFromNavGrouped = (navGrouped) => {
  const tabs = ["1", "2", "4", "6"];
  const byCategory = new Map();

  tabs.forEach((tab) => {
    (navGrouped?.[tab] || []).forEach((row) => {
      const category = `${row?.Category ?? row?.category ?? ""}`.trim();
      if (!category || !isDashboardArCategory(category)) return;
      if (getDashboardCategorySourceTab(category) !== tab) return;

      byCategory.set(category, {
        category,
        count: Number(row?.Count ?? row?.count) || 0,
        amount: Number(row?.Charge ?? row?.charge ?? row?.Amount ?? row?.amount) || 0,
      });
    });
  });

  return Array.from(byCategory.values());
};
