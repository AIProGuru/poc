import axios from "axios";
import {
  setNavGrouped,
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setWorklistSummary,
} from "../redux/reducers/app.reducer";
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

export async function refreshWorklistFromAppState({ apiUrl, dispatch, filters }) {
  if (!apiUrl) return null;

  dispatch(setTableLoading(true));
  dispatch(setPart1Loading(true));
  dispatch(setPart2Loading(true));

  const { groupedPayload, summaryPayload, canFetchSummary } = buildWorklistRefreshPayloads(filters);

  try {
    const requests = [axios.post(`${apiUrl}/part1_all_grouped`, groupedPayload)];
    if (canFetchSummary) {
      requests.push(axios.post(`${apiUrl}/data_summary`, summaryPayload));
    }
    const [groupedRes, summaryRes] = await Promise.all(requests);
    const grouped = groupedRes.data?.grouped || {};
    const summary = canFetchSummary ? summaryRes?.data || null : null;

    dispatch(setNavGrouped(grouped));
    if (summary) {
      dispatch(setWorklistSummary(summary));
    }

    return { grouped, summary };
  } catch {
    return null;
  }
}
