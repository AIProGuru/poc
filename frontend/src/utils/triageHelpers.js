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

export const formatTriageHistoryTimestamp = (entry) => {
  const raw = entry?.action_date || entry?.created_at || "";
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

export const getTriageNotesHistory = (actions = []) =>
  (actions || [])
    .filter((entry) => `${entry?.claim_status || ""}`.toLowerCase() === "triage")
    .filter((entry) => (entry?.notes || "").trim() || (entry?.action || "").trim())
    .sort((a, b) => {
      const aId = Number(a?.id) || 0;
      const bId = Number(b?.id) || 0;
      if (aId && bId) return aId - bId;
      const aTime = Date.parse(a?.action_date || "") || 0;
      const bTime = Date.parse(b?.action_date || "") || 0;
      return aTime - bTime;
    });

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
