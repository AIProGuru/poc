import React from "react";

const SupportScreen = ({ isDark }) => (
  <div
    className={`rounded-2xl border px-6 py-10 text-center text-lg font-semibold ${
      isDark
        ? "bg-[var(--helio-surface)] border-[var(--helio-border)] text-gray-200"
        : "bg-white border-gray-200 text-gray-700"
    }`}
  >
    Support Screen
  </div>
);

export default SupportScreen;
