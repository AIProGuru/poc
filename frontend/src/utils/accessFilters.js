export const isPrivilegedRole = (role) =>
  ['admin', 'super-admin', 'manager', 'internal-admin'].includes(role);

const parseValueRange = (label) => {
  if (!label || typeof label !== 'string') return null;
  const normalized = label.replace(/\s+/g, '');
  const matchRange = normalized.match(/^\$(\d+)-\$(\d+)$/);
  if (matchRange) {
    return { min: Number(matchRange[1]), max: Number(matchRange[2]) };
  }
  const matchPlus = normalized.match(/^\$(\d+)\+$/);
  if (matchPlus) {
    return { min: Number(matchPlus[1]), max: null };
  }
  return null;
};

export const buildAccessExtra = (baseExtra, access, role) => {
  if (isPrivilegedRole(role)) return { ...(baseExtra || {}) };
  const extra = { ...(baseExtra || {}) };

  if (Array.isArray(access?.modules) && access.modules.length > 0) {
    extra.AllowedModules = access.modules;
  }
  if (Array.isArray(access?.denialCategory) && access.denialCategory.length > 0) {
    extra.AllowedCategories = access.denialCategory;
  }
  if (Array.isArray(access?.payer) && access.payer.length > 0) {
    extra.AllowedPayers = access.payer;
  }
  if (Array.isArray(access?.value) && access.value.length > 0) {
    const ranges = access.value
      .map(parseValueRange)
      .filter((range) => range && !Number.isNaN(range.min));
    if (ranges.length > 0) {
      extra.AllowedValueRanges = ranges;
    }
  }
  return extra;
};
