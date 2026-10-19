import { SERVER_URL } from "./config";

export async function sendInquiry(payload) {
  let response;
  try {
    response = await fetch(`${SERVER_URL}/api/v1/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("We couldn't send your request. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || "We couldn't send your request. Please try again.");
    error.fields = data?.fields && typeof data.fields === "object" ? data.fields : null;
    throw error;
  }
  return data;
}
