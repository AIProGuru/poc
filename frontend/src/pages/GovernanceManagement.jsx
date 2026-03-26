import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../components/demo-layout/Header";

const GovernanceManagement = () => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? "bg-[#1e1f24] text-white" : "bg-slate-50 text-slate-900"}`}>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-start gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate("/clientmanagement")}
            className={`mt-1 rounded-lg p-2 transition ${isDark ? "bg-[#ffffff10] hover:bg-[#ffffff20]" : "bg-white hover:bg-slate-100 border border-slate-200"}`}
            aria-label="Back to Client Management"
            title="Back to Client Management"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke={isDark ? "white" : "#0F172A"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <h1 className="mb-2 text-2xl font-bold">Governance Management</h1>
            <p className={isDark ? "text-[#9ca3af]" : "text-slate-500"}>
              Governance tools are available only to Internal Admin users.
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? "border-[#ffffff14] bg-[#23252b]" : "border-slate-200 bg-white"}`}>
          <p className={isDark ? "text-[#d1d5db]" : "text-slate-700"}>
            This entry point is now in place and restricted to the Internal Admin role.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovernanceManagement;
