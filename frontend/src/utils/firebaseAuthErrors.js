const FIREBASE_AUTH_MESSAGES = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account was found with that email address.",
  "auth/missing-email": "Please enter your email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/internal-error": "Something went wrong. Please try again in a moment.",
  EMAIL_NOT_FOUND: "No account was found with that email address.",
  INVALID_EMAIL: "Please enter a valid email address.",
  RESET_PASSWORD_EXCEED_LIMIT: "Too many reset attempts. Please wait and try again.",
};

export function getFirebaseAuthErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  const code = error?.code || error?.error?.message || error?.message || "";
  if (FIREBASE_AUTH_MESSAGES[code]) {
    return FIREBASE_AUTH_MESSAGES[code];
  }

  const normalized = `${code}`.replace(/^auth\//, "").replace(/_/g, " ").trim();
  if (/firebase/i.test(normalized)) {
    return fallback;
  }

  return normalized || fallback;
}
