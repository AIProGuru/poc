export const ADVANCED_FILTER_FIELDS = [
  { key: 'facilityName', label: 'Facility Name', placeholder: 'e.g. Memorial Hospital' },
  { key: 'provTaxId', label: 'Provider Tax ID', placeholder: 'e.g. 12-3456789' },
  { key: 'provNpi', label: 'Provider NPI', placeholder: 'e.g. 1234567890' },
  { key: 'payerId', label: 'Payer ID', placeholder: 'e.g. 87726' },
  { key: 'payerName', label: 'Payer Name', placeholder: 'e.g. Aetna' },
  { key: 'payerSeq', label: 'Payer Seq', placeholder: 'P, S, or T' },
  { key: 'patientName', label: 'Patient Name', placeholder: 'e.g. Smith' },
  { key: 'patientId', label: 'Patient ID', placeholder: 'Member / patient ID' },
  { key: 'serviceDate', label: 'Service Date', inputType: 'date' },
  { key: 'category', label: 'Category', placeholder: 'e.g. Medical Coding' },
  { key: 'placeOfService', label: 'Place of Service', placeholder: 'e.g. 11' },
  { key: 'primaryDx', label: 'Primary Dx', placeholder: 'e.g. Z00.00' },
  { key: 'primaryProcedure', label: 'Primary Service', placeholder: 'e.g. 99213' },
];

export const EMPTY_ADVANCED_FILTERS = ADVANCED_FILTER_FIELDS.reduce((acc, field) => {
  acc[field.key] = '';
  return acc;
}, {});

const SERVICE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const sanitizeAdvancedFilters = (filters = {}) => {
  const cleaned = {};
  ADVANCED_FILTER_FIELDS.forEach(({ key }) => {
    const value = `${filters[key] ?? ''}`.trim();
    if (!value) return;
    if (key === 'serviceDate' && !SERVICE_DATE_PATTERN.test(value)) return;
    cleaned[key] = value;
  });
  return cleaned;
};

export const countActiveAdvancedFilters = (filters = {}) =>
  Object.keys(sanitizeAdvancedFilters(filters)).length;

export const withAdvancedFiltersExtra = (extra = {}, advancedFilters = {}) => {
  const cleaned = sanitizeAdvancedFilters(advancedFilters);
  if (!Object.keys(cleaned).length) return extra;
  return { ...extra, AdvancedFilters: cleaned };
};

export const formatAdvancedFilterDisplayValue = (key, value) => {
  if (!value) return value;
  if (key === 'serviceDate') {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  return value;
};

export const getActiveAdvancedFilterEntries = (filters = {}) =>
  ADVANCED_FILTER_FIELDS
    .map((field) => ({
      ...field,
      value: `${filters[field.key] ?? ''}`.trim(),
      displayValue: formatAdvancedFilterDisplayValue(field.key, `${filters[field.key] ?? ''}`.trim()),
    }))
    .filter((field) => field.value);
