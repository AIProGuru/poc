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
