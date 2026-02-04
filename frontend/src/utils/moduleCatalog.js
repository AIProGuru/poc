export const MODULE_OPTIONS = [
  "Claim Edits",
  "Claim Status",
  "Denials",
  "Patient Resp",
  "Payment Variance",
  "Payment Posting",
];

export const MODULE_CATEGORY_MAP = {
  "Claim Edits": ["CH Rejection", "Payer Rejection"],
  "Claim Status": ["Pend 277", "Pend 835"],
  "Denials": [
    "Authorization",
    "Billing",
    "Coordination of Benefits",
    "Documentation",
    "Duplicate",
    "Eligibility",
    "Level of Care",
    "Medical Coding",
    "Medical Necessity",
    "Non-Covered",
    "Other Non-Specific",
    "Provider",
    "Timely Filing",
  ],
  "Patient Resp": ["Patient Resp"],
  "Payment Variance": ["Payer Overpaid", "Payer Underpaid"],
  "Payment Posting": ["Contractual Adj", "Payment", "Write-off", "Refund"],
};
