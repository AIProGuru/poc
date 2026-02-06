export const ROLE_EXECUTIVE = "executive";
export const ROLE_MANAGER = "manager";
export const ROLE_STANDARD = "standard-user";
export const ROLE_INTERNAL_ADMIN = "internal-admin";

export const LEGACY_ROLE_EXECUTIVE = "demo";
export const LEGACY_ROLE_MANAGER = "admin";
export const LEGACY_ROLE_STANDARD = "user";
export const LEGACY_ROLE_INTERNAL_ADMIN = "super-admin";

export const ROLE_LABELS = {
  [ROLE_EXECUTIVE]: "Executive",
  [ROLE_MANAGER]: "Manager",
  [ROLE_STANDARD]: "Standard User",
  [ROLE_INTERNAL_ADMIN]: "Internal Admin",
  [LEGACY_ROLE_EXECUTIVE]: "Executive",
  [LEGACY_ROLE_MANAGER]: "Manager",
  [LEGACY_ROLE_STANDARD]: "Standard User",
  [LEGACY_ROLE_INTERNAL_ADMIN]: "Internal Admin",
};

export const ROLE_OPTIONS = [
  { value: ROLE_EXECUTIVE, label: ROLE_LABELS[ROLE_EXECUTIVE] },
  { value: ROLE_MANAGER, label: ROLE_LABELS[ROLE_MANAGER] },
  { value: ROLE_STANDARD, label: ROLE_LABELS[ROLE_STANDARD] },
  { value: ROLE_INTERNAL_ADMIN, label: ROLE_LABELS[ROLE_INTERNAL_ADMIN] },
];

export const ALL_ROLES = [
  ROLE_EXECUTIVE,
  ROLE_MANAGER,
  ROLE_STANDARD,
  ROLE_INTERNAL_ADMIN,
  LEGACY_ROLE_EXECUTIVE,
  LEGACY_ROLE_MANAGER,
  LEGACY_ROLE_STANDARD,
  LEGACY_ROLE_INTERNAL_ADMIN,
];

export const USER_MANAGEMENT_ROLES = [
  ROLE_MANAGER,
  ROLE_INTERNAL_ADMIN,
  LEGACY_ROLE_MANAGER,
  LEGACY_ROLE_INTERNAL_ADMIN,
];

export const CLIENT_MANAGEMENT_ROLES = [
  ROLE_MANAGER,
  ROLE_INTERNAL_ADMIN,
  LEGACY_ROLE_MANAGER,
  LEGACY_ROLE_INTERNAL_ADMIN,
];

export const WORKLIST_ROLES = [
  ROLE_MANAGER,
  ROLE_STANDARD,
  ROLE_INTERNAL_ADMIN,
  LEGACY_ROLE_MANAGER,
  LEGACY_ROLE_STANDARD,
  LEGACY_ROLE_INTERNAL_ADMIN,
];

export const normalizeRole = (role) => {
  switch (role) {
    case LEGACY_ROLE_EXECUTIVE:
      return ROLE_EXECUTIVE;
    case LEGACY_ROLE_MANAGER:
      return ROLE_MANAGER;
    case LEGACY_ROLE_STANDARD:
      return ROLE_STANDARD;
    case LEGACY_ROLE_INTERNAL_ADMIN:
      return ROLE_INTERNAL_ADMIN;
    default:
      return role || ROLE_STANDARD;
  }
};

export const getRoleLabel = (role) => ROLE_LABELS[role] || ROLE_LABELS[normalizeRole(role)] || "Standard User";

export const canAccessUserManagement = (role) => USER_MANAGEMENT_ROLES.includes(role) || USER_MANAGEMENT_ROLES.includes(normalizeRole(role));

export const canAccessClientManagement = (role) => CLIENT_MANAGEMENT_ROLES.includes(role) || CLIENT_MANAGEMENT_ROLES.includes(normalizeRole(role));

export const canAccessWorklists = (role) => WORKLIST_ROLES.includes(role) || WORKLIST_ROLES.includes(normalizeRole(role));

export const isExecutiveRole = (role) => normalizeRole(role) === ROLE_EXECUTIVE;
