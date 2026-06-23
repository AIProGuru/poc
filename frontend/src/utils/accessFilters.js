export const isPrivilegedRole = (role) =>
  ['admin', 'super-admin', 'manager', 'internal-admin'].includes(role);

const normalizePayerName = (payer) => {
  if (!payer) return '';
  if (typeof payer === 'string') return payer;
  if (typeof payer === 'object') return payer.PayerName || payer.name || '';
  return '';
};

const normalizeCategory = (category) => {
  if (!category) return '';
  if (category === 'Pend 835') return 'Delinquent';
  return category;
};

const parseValueRange = (label) => {
  if (!label || typeof label !== 'string') return null;
  const normalized = label.replace(/\s+/g, '').replace(/,/g, '');
  const matchRange = normalized.match(/^\$?(\d+)-\$?(\d+)$/);
  if (matchRange) {
    return { min: Number(matchRange[1]), max: Number(matchRange[2]) };
  }
  const matchPlus = normalized.match(/^\$?(\d+)\+$/);
  if (matchPlus) {
    return { min: Number(matchPlus[1]), max: null };
  }
  return null;
};

const normalizeFacilityEntry = (entry) => {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const taxMatch = entry.match(/tax\s*id[:\s]*([0-9-]+)/i);
    const npiMatch = entry.match(/npi[:\s]*([0-9-]+)/i);
    const taxonomyMatch = entry.match(/taxonomy[:\s]*([A-Za-z0-9.]+)/i);
    return {
      name: entry,
      taxId: taxMatch ? taxMatch[1] : '',
      npi: npiMatch ? npiMatch[1] : '',
      taxonomyCode: taxonomyMatch ? taxonomyMatch[1] : '',
    };
  }
  if (typeof entry === 'object') {
    const taxId =
      entry.taxId ||
      entry.taxID ||
      entry.tax_id ||
      entry.facilityTaxId ||
      entry.facilityTaxID ||
      entry.FacilityTaxID ||
      entry.FedTaxID ||
      '';
    const npi =
      entry.npi ||
      entry.NPI ||
      entry.facilityNpi ||
      entry.facilityNPI ||
      entry.ProvNPI ||
      entry.BillProvNPI ||
      '';
    const taxonomyCode =
      entry.taxonomyCode ||
      entry.taxonomy ||
      entry.TaxonomyCode ||
      entry.facilityTaxonomyCode ||
      entry.BillTaxonomy ||
      entry.RendTaxonomy ||
      '';
    const name =
      entry.name ||
      entry.facilityName ||
      entry.FacilityName ||
      entry.PayerName ||
      entry.label ||
      '';
    return { name, taxId, npi, taxonomyCode };
  }
  return null;
};

const normalizeFacilityList = (facilityList) => {
  if (!Array.isArray(facilityList)) return [];
  const normalized = facilityList
    .map((entry) => normalizeFacilityEntry(entry))
    .filter((entry) => entry && (entry.taxId || entry.npi || entry.taxonomyCode || entry.name));
  if (!normalized.length) return [];
  const seen = new Set();
  return normalized.filter((entry) => {
    const key = `${entry.taxId || ''}::${entry.npi || ''}::${entry.taxonomyCode || ''}::${entry.name || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildAccessExtra = (baseExtra, access, role) => {
  if (isPrivilegedRole(role)) return { ...(baseExtra || {}) };
  const extra = { ...(baseExtra || {}) };

  if (Array.isArray(access?.modules) && access.modules.length > 0) {
    extra.AllowedModules = access.modules;
  }
  if (Array.isArray(access?.denialCategory) && access.denialCategory.length > 0) {
    extra.AllowedCategories = access.denialCategory
      .map(normalizeCategory)
      .filter((item) => item);
  }
  if (Array.isArray(access?.payer) && access.payer.length > 0) {
    const payerNames = access.payer
      .map(normalizePayerName)
      .filter((item) => item);
    if (payerNames.length > 0) {
      extra.AllowedPayers = payerNames;
    }
  }
  if (Array.isArray(access?.value) && access.value.length > 0) {
    const ranges = access.value
      .map(parseValueRange)
      .filter((range) => range && !Number.isNaN(range.min));
    if (ranges.length > 0) {
      extra.AllowedValueRanges = ranges;
    }
  }
  if (Array.isArray(access?.facility) && access.facility.length > 0) {
    const facilities = normalizeFacilityList(access.facility);
    if (facilities.length > 0) {
      extra.AllowedFacilities = facilities;
    }
  }
  return extra;
};
