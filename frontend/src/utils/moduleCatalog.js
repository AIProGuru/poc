export const MODULE_OPTIONS = [
  "Claim Edits",
  "Claim Status",
  "Denials",
  "Patient Resp",
  "Payment Variance",
  "Payment Posting",
];

export const MODULE_CATEGORY_MAP = {
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
