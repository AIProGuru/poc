export const PLATFORM_TENANTS = ["rebound", "pilotcustomer", "betacustomer", "demo"];

export const PLATFORM_TENANT_OPTIONS = [
  { value: "rebound", label: "Rebound" },
  { value: "pilotcustomer", label: "Pilot Customer" },
  { value: "betacustomer", label: "Beta Customer" },
  { value: "demo", label: "Demo" },
];

const APP_TYPE_BY_TENANT = {
  rebound: 0,
  pilotcustomer: 1,
  demo: 2,
  betacustomer: 3,
};

const TENANT_BY_APP_TYPE = {
  0: "rebound",
  1: "pilotcustomer",
  2: "demo",
  3: "betacustomer",
};

/**
 * Map assorted client/tenant labels to a canonical platform path tenant.
 * Returns null when the value cannot be mapped.
 */
export function normalizePlatformTenant(value, defaultTenant = null) {
  if (value === null || value === undefined) return defaultTenant;

  const raw = String(value).trim().toLowerCase();
  if (!raw) return defaultTenant;

  if (PLATFORM_TENANTS.includes(raw)) return raw;

  const compact = raw.replace(/[\s/_-]+/g, "");
  if (PLATFORM_TENANTS.includes(compact)) return compact;

  if (compact.includes("betacustomer") || compact === "beta") return "betacustomer";
  if (compact.includes("pilotcustomer") || compact === "pilot") return "pilotcustomer";
  if (compact.includes("rebound") || compact.includes("medevolve")) return "rebound";
  if (compact.includes("demo")) return "demo";

  return defaultTenant;
}

export function platformTenantToAppType(tenant) {
  const normalized = normalizePlatformTenant(tenant);
  return normalized == null ? null : APP_TYPE_BY_TENANT[normalized];
}

export function appTypeToPlatformTenant(appType) {
  const key = Number(appType);
  return Number.isFinite(key) ? TENANT_BY_APP_TYPE[key] || null : null;
}

export function resolvePlatformTenantFromUser(userData = {}, defaultTenant = "pilotcustomer") {
  const fromTenant = normalizePlatformTenant(
    userData.tenant || userData.product || userData.basePath
  );
  if (fromTenant) return fromTenant;

  const fromType = appTypeToPlatformTenant(userData.appType ?? userData.type);
  if (fromType) return fromType;

  return defaultTenant;
}

export function resolveLandingPath(userData = {}) {
  return `/${resolvePlatformTenantFromUser(userData)}`;
}

export function resolveAppType(userData = {}) {
  const raw = userData.appType ?? userData.type;
  if (raw !== null && raw !== undefined && raw !== "") {
    const fromType = Number(raw);
    if (Number.isFinite(fromType)) return fromType;
  }

  return platformTenantToAppType(
    userData.tenant || userData.product || userData.basePath
  );
}
