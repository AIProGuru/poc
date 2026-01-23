import React from "react";

const HomeScreen = ({ isDark }) => (
  <div
    className={`rounded-2xl border px-6 py-10 text-center text-lg font-semibold ${
      isDark
        ? "bg-[#27282D] border-[#1f2433] text-gray-200"
        : "bg-white border-gray-200 text-gray-700"
    }`}
  >
    Home Screen
  </div>
);

export default HomeScreen;
