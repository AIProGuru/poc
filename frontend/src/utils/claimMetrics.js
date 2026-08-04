import { parseTriageActionValue } from "./triageHelpers";

/** Parse a claim/remit date to UTC midnight for day-level comparisons. */
export const toClaimDateOnlyMs = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const SUBMIT_ACTION_PATTERN = /submit/i;

/** True when a saved action represents a claim submit/resubmit from triage. */
export const isSubmitActionEntry = (entry) => {
  if (!entry) return false;
  const status = `${entry.claim_status || ""}`.trim().toLowerCase();
  if (status.includes("resubmit")) return true;

  const parsed = parseTriageActionValue(entry.action);
  return (parsed.selected || []).some((label) => SUBMIT_ACTION_PATTERN.test(`${label}`));
};

/**
 * Latest submit date from triage/resubmit actions, falling back to 837 TransactionDate.
 */
export const resolveClaimSubmitDate = (claimData, actions = []) => {
  let latestMs = null;
  let latestRaw = null;

  (actions || []).forEach((entry) => {
    if (!isSubmitActionEntry(entry)) return;
    const ms = toClaimDateOnlyMs(entry.action_date);
    if (ms == null) return;
    if (latestMs == null || ms > latestMs) {
      latestMs = ms;
      latestRaw = entry.action_date;
    }
  });

  if (latestMs == null) {
    const fallback = claimData?.SubmitDate || claimData?.TransactionDate;
    latestMs = toClaimDateOnlyMs(fallback);
    latestRaw = fallback || null;
  }

  return {
    submitDateMs: latestMs,
    submitDateRaw: latestRaw,
    hasSubmitDate: latestMs != null,
  };
};

/**
 * Sum allowed amounts from 835 remits received after the claim submit date.
 */
export const calculateRecoveryAmount = (claimData, remits = [], actions = []) => {
  const { submitDateMs, submitDateRaw, hasSubmitDate } = resolveClaimSubmitDate(
    claimData,
    actions
  );

  if (!hasSubmitDate) {
    return {
      amount: Number(claimData?.RecoveryAmount) || 0,
      remitCount: 0,
      hasSubmitDate: false,
      submitDate: null,
    };
  }

  let amount = 0;
  let remitCount = 0;

  (remits || []).forEach((remit) => {
    const checkMs = toClaimDateOnlyMs(remit?.CheckDate);
    if (checkMs == null || checkMs <= submitDateMs) return;
    remitCount += 1;
    (remit?.ServiceLine || []).forEach((line) => {
      amount += Number(line?.AllowedAmount) || 0;
    });
  });

  if (amount === 0 && typeof claimData?.RecoveryAmount === "number") {
    amount = Number(claimData.RecoveryAmount) || 0;
  }

  return {
    amount,
    remitCount,
    hasSubmitDate: true,
    submitDate: submitDateRaw,
  };
};
