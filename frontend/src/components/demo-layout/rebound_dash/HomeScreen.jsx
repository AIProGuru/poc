import React from "react";
import { getHelioLogoSrc } from "../../../utils/helioLogo";

const HomeScreen = ({ isDark }) => (
  <div
    className={`rounded-2xl min-h-[520px] flex flex-col items-center justify-center gap-6 px-6 py-12 border ${
      isDark
        ? "text-gray-200 border-transparent"
        : "text-slate-800 border-slate-200 bg-white shadow-sm"
    }`}
  >
    <img src={getHelioLogoSrc(isDark)} alt="Helio RCM" className="h-20 w-auto" loading="lazy" />
    <p className={`text-center text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
      Simple RCM, AI Precision, Powerful Results
    </p>
  </div>
);

export default HomeScreen;
