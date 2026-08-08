import { buildAccessExtra } from "./accessFilters";

export const buildExcludeAiModels = (models) => {
  const seen = new Set();
  return (models || []).reduce((acc, row) => {
    const group = `${row?.GroupCode || row?.group || ""}`.trim();
    const code = `${row?.Code || row?.code || ""}`.trim();
    if (!group || !code) return acc;
    const key = `${group}:${code}`;
    if (seen.has(key)) return acc;
    seen.add(key);
    acc.push({ group, code });
    return acc;
  }, []);
};

export const shouldExcludeAiModels = (extra, { code = "", remark = "" } = {}) => {
  if (extra?.source === "ai-library") return false;
  if (`${code}`.trim() && `${remark}`.trim()) return false;
  return true;
};

export const buildWorklistExtra = (baseExtra, access, role, models, options = {}) => {
  const extra = buildAccessExtra(baseExtra, access, role);
  const { code = "", remark = "", includeAiModels = false } = options;
  if (includeAiModels || !shouldExcludeAiModels(baseExtra, { code, remark })) {
    return extra;
  }
  const excludeAiModels = buildExcludeAiModels(models);
  if (excludeAiModels.length > 0) {
    extra.ExcludeAiModels = excludeAiModels;
  }
  return extra;
};
