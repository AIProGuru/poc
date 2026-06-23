const TENANT_BASES = ["/rebound", "/pilotcustomer", "/betacustomer", "/demo"];

const NON_CLAIM_PATH_PREFIXES = [
  "/governance-management",
  "/appeal-templates",
  "/clientmanagement",
  "/client/",
  "/account-settings",
  "/management",
  "/signin",
  "/signup",
];

const NON_CLAIM_ROUTE_SEGMENTS = ["/detail/", "/statistics", "/artificial-intelligence"];

const NON_CLAIM_APP_TITLES = new Set([
  "Home",
  "Dashboard",
  "Settings",
  "AI Agents",
  "AI Automation",
  "User Management",
  "Client Management",
  "Governance Management",
  "Appeal Templates",
  "Account Settings",
]);

const WORKLIST_ROOT_TITLES = new Set([
  "Claim Edits",
  "Claim Status",
  "Denials",
  "Patient Responsibility",
  "Payment Variance",
  "Payment Posting",
]);

export const shouldShowClaimSearch = (pathname = "", appTitle = "") => {
  const path = `${pathname || ""}`.toLowerCase();
  const title = `${appTitle || ""}`.trim();

  if (NON_CLAIM_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return false;
  }

  const onTenantRoute = TENANT_BASES.some(
    (base) => path === base || path.startsWith(`${base}/`)
  );
  if (!onTenantRoute) {
    return false;
  }

  if (NON_CLAIM_ROUTE_SEGMENTS.some((segment) => path.includes(segment))) {
    return false;
  }

  if (NON_CLAIM_APP_TITLES.has(title)) {
    return false;
  }

  if (title.includes(" > ") || WORKLIST_ROOT_TITLES.has(title)) {
    return true;
  }

  // AI agent drill-down and other claim table views use dynamic titles.
  return Boolean(title);
};
