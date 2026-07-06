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

  const cardClass = isDark
    ? "border-white/[0.08] bg-[#27282D]/40 text-[#e5e7eb]"
    : "border-slate-200 bg-white text-slate-900";
  const dividerClass = isDark ? "border-white/[0.08]" : "border-slate-200";
  const labelClass = isDark ? "text-[#9ca3af]" : "text-slate-500";
  const buttonClass = isDark
    ? "rounded-lg px-4 py-2 text-sm font-medium border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition-colors"
    : "rounded-lg px-4 py-2 text-sm font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors";

  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-6 md:px-10 py-4">
        <div className={`w-full rounded-2xl border p-6 ${cardClass}`}>
          <div className={`flex items-center gap-4 pb-6 border-b ${dividerClass}`}>
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${
                isDark ? "bg-white/10 text-gray-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              {`${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">{firstname} {lastname}</p>
              <p className={`text-sm ${labelClass}`}>{getRoleLabel(role)}</p>
            </div>
          </div>

          <div className={`grid gap-5 py-6 sm:grid-cols-2 border-b ${dividerClass}`}>
            <div>
              <p className={`text-sm ${labelClass}`}>Email Address</p>
              <p className="mt-1 text-base font-medium">{email}</p>
            </div>
            <div>
              <p className={`text-sm ${labelClass}`}>Role</p>
              <p className="mt-1 text-base font-medium">{getRoleLabel(role)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            {canAccessUserManagement(role) && (
              <button type="button" onClick={() => navigate("/management")} className={buttonClass}>
                Manage Users
              </button>
            )}
            <button type="button" onClick={logout} className={buttonClass}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
