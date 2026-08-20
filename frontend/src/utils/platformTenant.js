export const PLATFORM_TENANTS = ["rebound", "pilotcustomer", "betacustomer", "demo"];

export const PLATFORM_TENANT_OPTIONS = [
  { value: "rebound", label: "Rebound" },
  { value: "pilotcustomer", label: "Pilot Customer" },
  { value: "betacustomer", label: "Beta Customer" },
  { value: "demo", label: "Demo" },
];

export const LAST_TENANT_BASE_KEY = "lastTenantBase";
export const LAST_APP_TYPE_KEY = "lastAppType";

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

function resolveFromClientList(userData = {}) {
  const buckets = [userData.client, userData.clients, userData.modules];
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    for (const entry of bucket) {
      const mapped = normalizePlatformTenant(
        typeof entry === "string" ? entry : entry?.basePath || entry?.tenant || entry?.slug || entry?.name
      );
      if (mapped) return mapped;
    }
  }
  return null;
}

/**
 * Canonical platform tenant for routing (/betacustomer, /pilotcustomer, ...).
 * Uses explicit tenant/appType. Defaults to pilotcustomer (admins included).
 */
export function resolvePlatformTenantFromUser(userData = {}, defaultTenant = "pilotcustomer") {
  const fromTenant = normalizePlatformTenant(
    userData.tenant || userData.product || userData.basePath
  );
  if (fromTenant) return fromTenant;

  // Prefer dedicated appType over legacy `type` (type is overloaded in older docs).
  const fromAppType = appTypeToPlatformTenant(userData.appType);
  if (fromAppType) return fromAppType;

  const fromClient = resolveFromClientList(userData);
  if (fromClient) return fromClient;

  const fromType = appTypeToPlatformTenant(userData.type);
  if (fromType) return fromType;

  return defaultTenant;
}

export function resolveLandingPath(userData = {}) {
  return `/${resolvePlatformTenantFromUser(userData)}`;
}

export function resolveAppType(userData = {}) {
  const tenant = resolvePlatformTenantFromUser(userData);
  return platformTenantToAppType(tenant);
}

export function persistPlatformTenant(tenant) {
  const normalized = normalizePlatformTenant(tenant, "pilotcustomer");
  const appType = platformTenantToAppType(normalized);
  try {
    localStorage.setItem(LAST_TENANT_BASE_KEY, normalized);
    if (appType !== null && appType !== undefined) {
      localStorage.setItem(LAST_APP_TYPE_KEY, String(appType));
    }
  } catch (err) {
    // Ignore storage write errors.
  }
  return { tenant: normalized, appType };
}

export function clearPersistedPlatformTenant() {
  try {
    localStorage.removeItem(LAST_TENANT_BASE_KEY);
    localStorage.removeItem(LAST_APP_TYPE_KEY);
  } catch (err) {
    // Ignore storage errors.
  }
}
