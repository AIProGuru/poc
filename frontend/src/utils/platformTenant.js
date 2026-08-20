/** Canonical platform tenant URL/DB keys used by the app. */
export const PLATFORM_TENANTS = ["rebound", "pilotcustomer", "betacustomer", "demo"];

export const DEFAULT_PLATFORM_TENANT = "pilotcustomer";

export const PLATFORM_CLIENT_OPTIONS = [
  { value: "pilotcustomer", label: "Pilot Customer", id: "pilotcustomer" },
  { value: "betacustomer", label: "Beta Customer", id: "betacustomer" },
];

const APP_TYPE_TO_TENANT = {
  0: "rebound",
  1: "pilotcustomer",
  2: "demo",
  3: "betacustomer",
};

const TENANT_TO_APP_TYPE = {
  rebound: 0,
  pilotcustomer: 1,
  demo: 2,
  betacustomer: 3,
};

/**
 * Map a free-form client/tenant label to a platform tenant key.
 * Empty / unknown → pilotcustomer (medevolve), per product rules.
 */
export function resolvePlatformTenantFromHint(value, { defaultTenant = DEFAULT_PLATFORM_TENANT } = {}) {
  if (value === null || value === undefined) {
    return defaultTenant;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return APP_TYPE_TO_TENANT[value] || defaultTenant;
  }

  const raw = String(value).trim().toLowerCase();
  if (!raw) {
    return defaultTenant;
  }

  if (Object.prototype.hasOwnProperty.call(APP_TYPE_TO_TENANT, raw)) {
    return APP_TYPE_TO_TENANT[Number(raw)] || defaultTenant;
  }

  const compact = raw
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop()
    .replace(/[\s_-]+/g, "");

  if (PLATFORM_TENANTS.includes(compact)) {
    return compact;
  }

  // Prefer beta before pilot so labels like "beta-customer" resolve correctly.
  if (compact.includes("betacustomer") || compact === "beta" || compact.startsWith("beta")) {
    return "betacustomer";
  }
  if (compact.includes("rebound")) {
    return "rebound";
  }
  if (compact.includes("demo")) {
    return "demo";
  }
  if (compact.includes("pilotcustomer") || compact.includes("pilot") || compact.includes("medevolve")) {
    return "pilotcustomer";
  }

  if (raw.includes("betacustomer") || /\bbeta\b/.test(raw)) {
    return "betacustomer";
  }
  if (raw.includes("rebound")) {
    return "rebound";
  }
  if (raw.includes("demo")) {
    return "demo";
  }
  if (raw.includes("pilotcustomer") || raw.includes("pilot") || raw.includes("medevolve")) {
    return "pilotcustomer";
  }

  return defaultTenant;
}

/**
 * Resolve platform tenant from a Firestore user profile.
 * Checks tenant/product/basePath, then appType, then client[] assignment.
 * No client / unknown → pilotcustomer.
 */
export function resolvePlatformTenant(userData = {}) {
  const explicit =
    userData.tenant ||
    userData.product ||
    userData.basePath ||
    "";
  if (`${explicit}`.trim()) {
    return resolvePlatformTenantFromHint(explicit);
  }

  const rawType = userData.appType ?? userData.type;
  if (rawType !== null && rawType !== undefined && `${rawType}`.trim() !== "") {
    const fromType = resolvePlatformTenantFromHint(rawType);
    if (fromType) {
      return fromType;
    }
  }

  const clients = Array.isArray(userData.client) ? userData.client : [];
  for (const entry of clients) {
    const resolved = resolvePlatformTenantFromHint(entry, { defaultTenant: "" });
    if (resolved) {
      return resolved;
    }
  }

  return DEFAULT_PLATFORM_TENANT;
}

export function resolveAppTypeFromTenant(tenant) {
  const key = resolvePlatformTenantFromHint(tenant);
  return TENANT_TO_APP_TYPE[key] ?? 1;
}

export function resolveAppType(userData = {}) {
  return resolveAppTypeFromTenant(resolvePlatformTenant(userData));
}

export function resolveLandingPath(userData = {}) {
  return `/${resolvePlatformTenant(userData)}`;
}

export function isPlatformTenant(value) {
  return PLATFORM_TENANTS.includes(`${value || ""}`.toLowerCase());
}
