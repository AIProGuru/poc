import { resolveFirstTriageSubmitDate } from "./triageHelpers";

/** Parse a claim/remit date to UTC midnight for day-level comparisons. */
export const toClaimDateOnlyMs = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const text = `${value}`.trim();
  const mdyMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdyMatch) {
    const month = Number(mdyMatch[1]) - 1;
    const day = Number(mdyMatch[2]);
    const year = Number(mdyMatch[3]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return Date.UTC(year, month, day);
    }
  }

  const isoDateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]) - 1;
    const day = Number(isoDateMatch[3]);
    return Date.UTC(year, month, day);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * First submit date from triage Notes History (earliest submit-type entry).
 * Uses the same date field as the history timestamp display.
 */
export const resolveClaimSubmitDate = (_claimData, actions = []) => {
  const { submitDateRaw } = resolveFirstTriageSubmitDate(actions);
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
      amount: 0,
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
