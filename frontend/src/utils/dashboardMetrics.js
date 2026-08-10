/** Estimated month-to-date recovery as a share of AI Library recoverable AR. */
export const RECOVERY_MTD_AI_LIBRARY_RATE = 0.12;

export const sumAiLibraryModels = (models) =>
  (models || []).reduce(
    (acc, row) => ({
      claims: acc.claims + (Number(row.Count) || 0),
      amount: acc.amount + (Number(row.Amount) || 0),
    }),
    { claims: 0, amount: 0 }
  );

/**
 * Recovery MTD is modeled as a percentage of AI Library recoverable dollars
 * (sum of Amount from ai_model bootstrap rows), not total worklist recoverable AR.
 */
export const computeRecoveryMtd = (models, rate = RECOVERY_MTD_AI_LIBRARY_RATE) => {
  const { amount } = sumAiLibraryModels(models);
  if (amount <= 0) return 0;
  return Math.round(amount * rate);
};
