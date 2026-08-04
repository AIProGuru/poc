/** Parse a claim/remit date to UTC midnight for day-level comparisons. */
export const toClaimDateOnlyMs = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * Sum allowed amounts from 835 remits received after the claim submit date.
 * Submit date uses the 837 TransactionDate field.
 */
export const calculateRecoveryAmount = (claimData, remits = []) => {
  const submitMs = toClaimDateOnlyMs(claimData?.TransactionDate);
  if (submitMs == null) {
    return {
      amount: Number(claimData?.RecoveryAmount) || 0,
      remitCount: 0,
      hasSubmitDate: false,
    };
  }

  let amount = 0;
  let remitCount = 0;

  (remits || []).forEach((remit) => {
    const checkMs = toClaimDateOnlyMs(remit?.CheckDate);
    if (checkMs == null || checkMs <= submitMs) return;
    remitCount += 1;
    (remit?.ServiceLine || []).forEach((line) => {
      amount += Number(line?.AllowedAmount) || 0;
    });
  });

  if (typeof claimData?.RecoveryAmount === "number" && remitCount === 0 && amount === 0) {
    amount = Number(claimData.RecoveryAmount) || 0;
  }

  return { amount, remitCount, hasSubmitDate: true };
};
