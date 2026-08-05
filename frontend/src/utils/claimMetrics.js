import {
  getTriageSubmitHistory,
  resolveTriageHistoryEntryDate,
} from "./triageHelpers";

/** Parse a claim/remit date to UTC midnight for day-level comparisons. */
export const toClaimDateOnlyMs = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * First submit date from triage Notes History (earliest submit-type entry).
 * Uses the same date field as the history timestamp display.
 */
export const resolveClaimSubmitDate = (_claimData, actions = []) => {
  const submits = getTriageSubmitHistory(actions);
  if (submits.length === 0) {
    return { submitDateMs: null, submitDateRaw: null, hasSubmitDate: false };
  }

  const firstSubmit = submits[0];
  const submitDateRaw = resolveTriageHistoryEntryDate(firstSubmit);
  const submitDateMs = toClaimDateOnlyMs(submitDateRaw);

  return {
    submitDateMs,
    submitDateRaw,
    hasSubmitDate: submitDateMs != null,
  };
};

/**
 * Sum allowed amounts from 835 remits received after the first triage submit date.
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

export { isSubmitActionEntry } from "./triageHelpers";
