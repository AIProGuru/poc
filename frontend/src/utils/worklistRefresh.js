import axios from "axios";
import { setNavGrouped, setTableLoading, setWorklistSummary } from "../redux/reducers/app.reducer";
import { sanitizeAdvancedFilters } from "./advancedFilters";

const formatDateParam = (value) => {
  if (!value) return null;
  const dateObj = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString().substr(0, 10);
};

export function buildWorklistRefreshPayloads(filters = {}) {
  const {
    keyword = "",
    startDate,
    endDate,
    tabIndex,
    selectedTags = [],
    code = "",
    remark = "",
    procedure = "",
    pos = "",
    accessExtra = {},
    advancedFilters = {},
  } = filters;

  const includeAllCategories = accessExtra?.IncludeAllCategories;
  const canFetchSummary = includeAllCategories || selectedTags.length > 0;

  const groupedPayload = {
    tabIndexes: [6, 2, 1, 4],
    keyword: keyword || "",
    startDate: formatDateParam(startDate),
    endDate: formatDateParam(endDate),
    code,
    remark,
    procedure,
    pos,
    extra: accessExtra,
  };

  const summaryPayload = {
    selectedTags,
    keyword,
    tabIndex,
    startDate: formatDateParam(startDate),
    endDate: formatDateParam(endDate),
    code,
    remark,
    procedure,
    pos,
    extra: accessExtra,
    advancedFilters: sanitizeAdvancedFilters(advancedFilters),
  };

  return { groupedPayload, summaryPayload, canFetchSummary };
}

export async function refreshWorklistFromAppState({
  apiUrl,
  dispatch,
  filters,
  refreshTable = false,
  refreshNavBadges = true,
  refreshSummary = true,
}) {
  if (!apiUrl) return null;

  if (refreshTable) {
    dispatch(setTableLoading(true));
  }

  const { groupedPayload, summaryPayload, canFetchSummary } = buildWorklistRefreshPayloads(filters);

  try {
    const requests = [];
    if (refreshNavBadges) {
      requests.push({ key: "grouped", promise: axios.post(`${apiUrl}/part1_all_grouped`, groupedPayload) });
    }
    if (refreshSummary && canFetchSummary) {
      requests.push({ key: "summary", promise: axios.post(`${apiUrl}/data_summary`, summaryPayload) });
    }

    if (requests.length === 0) {
      return null;
    }

    const results = await Promise.all(requests.map((entry) => entry.promise));
    const grouped = refreshNavBadges ? results[0]?.data?.grouped || {} : null;
    const summary = refreshSummary && canFetchSummary
      ? results[refreshNavBadges ? 1 : 0]?.data || null
      : null;

    if (grouped) {
      dispatch(setNavGrouped(grouped));
    }
    if (summary) {
      dispatch(setWorklistSummary(summary));
    }

    return { grouped, summary };
  } catch {
    return null;
  }
}
