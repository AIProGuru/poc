import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AccountContext } from "../utils/Account";
import { canAccessUserManagement, getRoleLabel } from "../utils/roles";

const AccountSettings = () => {
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);
  const email = useSelector((state) => state.auth.email);
  const role = useSelector((state) => state.auth.role);
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { logout } = useContext(AccountContext);

  return (
    <div className={`min-h-screen px-4 sm:px-8 py-10 ${isDark ? "bg-[#07090F] text-white" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Account</p>
            <h1 className="text-2xl font-semibold">Account Settings</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full px-4 py-2 text-sm font-semibold border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Back
          </button>
        </div>

        <div className={`rounded-3xl p-6 shadow-lg ${isDark ? "bg-[#0B0E17] text-white border border-[#1F2231]" : "bg-white text-slate-900 border border-slate-200"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD3A5] to-[#FD6585] flex items-center justify-center text-xl font-semibold text-[#1A1D2B]">
              {`${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">{firstname} {lastname}</p>
              <p className="text-sm text-slate-500">{getRoleLabel(role).toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="text-base font-medium">{email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Role</p>
              <p className="text-base font-medium">{getRoleLabel(role)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {canAccessUserManagement(role) && (
              <button
                type="button"
                onClick={() => navigate("/management")}
                className="rounded-xl px-4 py-2 text-sm font-semibold border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Manage Users
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
