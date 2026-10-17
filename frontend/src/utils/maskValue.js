const UNMASKED = new Set(["", "N/A", "-", "—"]);

/** Replace a displayed value with one asterisk per character. Empty placeholders stay as they are. */
export const maskWithStars = (value) => {
  if (value === undefined || value === null) return value;
  const text = `${value}`;
  if (UNMASKED.has(text.trim())) return text;
  return "*".repeat([...text].length);
};
