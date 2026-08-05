export const getUserInitials = (firstname = "", lastname = "", username = "") => {
  const first = `${firstname || ""}`.trim();
  const last = `${lastname || ""}`.trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first.length >= 2) return first.slice(0, 2).toUpperCase();
  if (first.length === 1 && last) return `${first[0]}${last[0]}`.toUpperCase();

  const user = `${username || ""}`.trim();
  if (!user) return "XX";
  if (user.includes("@")) {
    const local = user.split("@")[0];
    if (local.includes(".")) {
      return local
        .split(".")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  }
  const parts = user.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return user.slice(0, 2).toUpperCase();
};

export const getInitialsFromUserField = (user = "") => getUserInitials("", "", user);

export const parseTriageActionValue = (value) => {
  if (!value) return { selected: [], otherText: "", transactionCodes: {} };
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return { selected: value.filter(Boolean), otherText: "", transactionCodes: {} };
    }
    return {
      selected: Array.isArray(value.selected) ? value.selected.filter(Boolean) : [],
      otherText: value.otherText ? `${value.otherText}` : "",
      transactionCodes:
        value.transactionCodes && typeof value.transactionCodes === "object"
          ? value.transactionCodes
          : {},
    };
  }
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return { selected: parsed.filter(Boolean), otherText: "", transactionCodes: {} };
    }
    if (parsed && typeof parsed === "object") {
      return {
        selected: Array.isArray(parsed.selected) ? parsed.selected.filter(Boolean) : [],
        otherText: parsed.otherText ? `${parsed.otherText}` : "",
        transactionCodes:
          parsed.transactionCodes && typeof parsed.transactionCodes === "object"
            ? parsed.transactionCodes
            : {},
      };
    }
  } catch {
    // Fall back to comma-delimited list.
  }
  return {
    selected: `${value}`
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    otherText: "",
    transactionCodes: {},
  };
};

export const parseTickleDays = (tickleTime) => {
  if (!tickleTime) return null;
  const match = `${tickleTime}`.match(/(\d+)/);
  if (!match) return null;
  const days = Number(match[1]);
  return Number.isFinite(days) && days > 0 ? days : null;
};

export const computeTickleDate = (tickleTime) => {
  const days = parseTickleDays(tickleTime);
  if (!days) return "";
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const resolveTickleFromActions = (checkedActions = []) => {
  const withTickle = checkedActions.filter((item) => item.tickleTime);
  if (withTickle.length === 0) {
    return { tickleTime: "", tickleDate: computeTickleDate("7 days"), sourceLabel: "Default (7 days)" };
  }
  const longest = withTickle.reduce((best, item) => {
    const days = parseTickleDays(item.tickleTime);
    const bestDays = parseTickleDays(best.tickleTime);
    if (days === null) return best;
    if (bestDays === null || days > bestDays) return item;
    return best;
  }, withTickle[0]);

  return {
    tickleTime: longest.tickleTime,
    tickleDate: computeTickleDate(longest.tickleTime),
    sourceLabel: longest.label || longest.tickleTime,
  };
};

export const buildAutoTriageNotes = (initials, selectedLabels = [], otherText = "") => {
  const parts = [...selectedLabels];
  if (otherText) parts.push(`Other: ${otherText}`);
  const prefix = `${initials}:`;
  if (parts.length === 0) return `${prefix} `;
  return `${prefix} ${parts.join(", ")}`;
};

/** Normalize action row keys from API / DB variants. */
export const normalizeActionEntry = (entry) => {
  if (!entry || typeof entry !== "object") return entry;
  return {
    ...entry,
    id: entry.id ?? entry.ID,
    action_date: entry.action_date ?? entry.ActionDate ?? entry.actionDate ?? "",
    created_at: entry.created_at ?? entry.CreatedAt ?? entry.createdAt ?? "",
    claim_status: entry.claim_status ?? entry.ClaimStatus ?? entry.claim_status ?? "",
    action: entry.action ?? entry.Action ?? "",
    notes: entry.notes ?? entry.Notes ?? "",
    user: entry.user ?? entry.User ?? entry.username ?? "",
  };
};

/** Same timestamp source as Notes History display. */
export const resolveTriageHistoryEntryDate = (entry) => {
  const normalized = normalizeActionEntry(entry);
  return normalized?.action_date || normalized?.created_at || null;
};

export const formatTriageHistoryTimestamp = (entry) => {
  const raw = resolveTriageHistoryEntryDate(entry) || "";
  if (!raw) return "—";
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return `${raw}`;
};

export const formatTriageActionSummary = (actionValue) => {
  const parsed = parseTriageActionValue(actionValue);
  const labels = [...(parsed.selected || [])];
  if (parsed.otherText) labels.push(`Other: ${parsed.otherText}`);
  return labels.join(", ");
};

const SUBMIT_ACTION_PATTERN = /submit|resubmit|rebill/i;

/** True when a triage note entry includes a claim submit/resubmit action. */
export const isSubmitActionEntry = (entry) => {
  const normalized = normalizeActionEntry(entry);
  if (!normalized) return false;

  const status = `${normalized.claim_status || ""}`.trim().toLowerCase();
  if (status.includes("resubmit")) return true;

  const parsed = parseTriageActionValue(normalized.action);
  const labels = [
    ...(parsed.selected || []),
    ...Object.keys(parsed.transactionCodes || {}),
  ];
  if (labels.some((label) => SUBMIT_ACTION_PATTERN.test(`${label}`))) return true;

  // Bulk/Individual submit actions persist a transaction code when selected.
  if (Object.keys(parsed.transactionCodes || {}).length > 0) return true;

  const notes = `${normalized.notes || ""}`;
  return SUBMIT_ACTION_PATTERN.test(notes);
};

export const getTriageNotesHistory = (actions = []) =>
  (actions || [])
    .map(normalizeActionEntry)
    .filter((entry) => `${entry?.claim_status || ""}`.toLowerCase().trim() === "triage")
    .filter((entry) => (entry?.notes || "").trim() || (entry?.action || "").trim())
    .sort((a, b) => {
      const aId = Number(a?.id) || 0;
      const bId = Number(b?.id) || 0;
      if (aId && bId) return aId - bId;
      const aTime = Date.parse(resolveTriageHistoryEntryDate(a) || "") || 0;
      const bTime = Date.parse(resolveTriageHistoryEntryDate(b) || "") || 0;
      return aTime - bTime;
    });

/** Earliest triage note entry that includes a submit-type action. */
export const getTriageSubmitHistory = (actions = []) =>
  getTriageNotesHistory(actions).filter(isSubmitActionEntry);

/** First submit date from Notes History (same entry/date as the history UI). */
export const resolveFirstTriageSubmitDate = (actions = []) => {
  const submits = getTriageSubmitHistory(actions);
  if (submits.length === 0) {
    return { submitDateRaw: null, firstSubmitEntry: null };
  }
  const firstSubmit = submits[0];
  return {
    submitDateRaw: resolveTriageHistoryEntryDate(firstSubmit),
    firstSubmitEntry: firstSubmit,
  };
};

export const findNextWorklistClaim = (tableData = [], currentClaimNo = "") => {
  if (!Array.isArray(tableData) || tableData.length === 0 || !currentClaimNo) return null;
  const idx = tableData.findIndex(
    (row) => (row?.ClaimNo || row?.ClaimID || "") === currentClaimNo
  );
  if (idx >= 0) {
    for (let i = idx + 1; i < tableData.length; i += 1) {
      const claimNo = tableData[i]?.ClaimNo || tableData[i]?.ClaimID;
      if (claimNo && claimNo !== currentClaimNo) return tableData[i];
    }
    for (let i = 0; i < idx; i += 1) {
      const claimNo = tableData[i]?.ClaimNo || tableData[i]?.ClaimID;
      if (claimNo && claimNo !== currentClaimNo) return tableData[i];
    }
    return null;
  }
  return tableData.find((row) => (row?.ClaimNo || row?.ClaimID) !== currentClaimNo) || null;
};

const normalizeCategoryToken = (value = "") =>
  `${value}`.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Map claim/workflow context to the governance category used by claim_action_items. */
export const resolveTriageActionCategory = ({
  claimCategory = "",
  routeTitle = "",
  appTitle = "",
  routeCategory = "",
  pend277Flag = false,
  pend835Flag = false,
} = {}) => {
  const sources = [routeTitle, appTitle, routeCategory, claimCategory].filter(Boolean);
  const sourceNorms = sources.map(normalizeCategoryToken);
  const claimNorm = normalizeCategoryToken(claimCategory);

  if (
    pend277Flag ||
    sourceNorms.some((value) => value.includes("pend277"))
  ) {
    return "Pend 277";
  }

  if (
    pend835Flag ||
    sourceNorms.some((value) => value.includes("pend835"))
  ) {
    return "Pend 835";
  }

  if (
    claimNorm === "patientresp" ||
    sourceNorms.some(
      (value) =>
        value.includes("patientresp") ||
        value.includes("patientresponsibility") ||
        value.includes("balduefrompt")
    )
  ) {
    return "Patient Resp";
  }

  if (
    claimNorm === "eligibility" ||
    sourceNorms.some((value) => value.includes("eligibility"))
  ) {
    return "Eligibility";
  }

  return `${claimCategory || routeCategory || ""}`.trim();
};

export const resolveTriageWorkflowHint = ({
  routeTitle = "",
  appTitle = "",
  routeCategory = "",
  pend277Flag = false,
  pend835Flag = false,
} = {}) => {
  const sources = [routeTitle, appTitle, routeCategory].filter(Boolean);
  const sourceNorms = sources.map(normalizeCategoryToken);

  if (pend277Flag || sourceNorms.some((value) => value.includes("pend277"))) {
    return "pend277";
  }
  if (pend835Flag || sourceNorms.some((value) => value.includes("pend835"))) {
    return "pend835";
  }
  if (
    sourceNorms.some(
      (value) =>
        value.includes("patientresp") ||
        value.includes("patientresponsibility") ||
        value.includes("balduefrompt")
    )
  ) {
    return "patient-resp";
  }
  if (sourceNorms.some((value) => value.includes("eligibility"))) {
    return "eligibility";
  }
  return "";
};

export const parseTickleDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const raw = `${value}`.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(`${raw.slice(0, 10)}T12:00:00`);
    d.setHours(0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const d = new Date(Number(mdy[3]), Number(mdy[1]) - 1, Number(mdy[2]));
    d.setHours(0, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  d.setHours(0, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const getTickleDaysRemaining = (tickleDate) => {
  const due = parseTickleDateValue(tickleDate);
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
};

export const formatTickleDueIn = (tickleDate) => {
  const days = getTickleDaysRemaining(tickleDate);
  if (days === null) return "—";
  if (days <= 0) return "Due today";
  if (days === 1) return "1 day";
  return `${days} days`;
};
