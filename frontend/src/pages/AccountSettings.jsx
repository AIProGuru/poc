import React, { useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AccountContext } from "../utils/Account";
import { canAccessUserManagement, getRoleLabel } from "../utils/roles";
import { auth } from "../FirebaseConfig";
import { SERVER_URL } from "../utils/config";
import {
  setFirstname,
  setLastname,
  setEmail as setEmailAction,
} from "../redux/reducers/auth.reducer";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const firstname = useSelector((state) => state.auth.firstname);
  const lastname = useSelector((state) => state.auth.lastname);
  const email = useSelector((state) => state.auth.email);
  const role = useSelector((state) => state.auth.role);
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { logout } = useContext(AccountContext);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstname: firstname || "",
    lastname: lastname || "",
    email: email || "",
  });

  const cardClass = isDark
    ? "border-white/[0.08] bg-[#27282D]/40 text-[#e5e7eb]"
    : "border-slate-200 bg-white text-slate-900";
  const dividerClass = isDark ? "border-white/[0.08]" : "border-slate-200";
  const labelClass = isDark ? "text-[#9ca3af]" : "text-slate-500";
  const buttonClass = isDark
    ? "rounded-lg px-4 py-2 text-sm font-medium border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition-colors"
    : "rounded-lg px-4 py-2 text-sm font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors";
  const inputClass = isDark
    ? "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
    : "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400";

  const startEditing = () => {
    setProfileForm({
      firstname: firstname || "",
      lastname: lastname || "",
      email: email || "",
    });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("You must be signed in to update your profile.");
      return;
    }

    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        firstname: `${profileForm.firstname || ""}`.trim(),
        lastname: `${profileForm.lastname || ""}`.trim(),
        email: `${profileForm.email || ""}`.trim().toLowerCase(),
      };

      const response = await fetch(`${SERVER_URL}/api/v1/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update profile.");
      }

      dispatch(setFirstname(result?.user?.firstname ?? payload.firstname));
      dispatch(setLastname(result?.user?.lastname ?? payload.lastname));
      dispatch(setEmailAction(result?.user?.email ?? payload.email));
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

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
              <p className={`text-sm ${labelClass}`}>First Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm.firstname}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstname: e.target.value }))}
                  className={inputClass}
                />
              ) : (
                <p className="mt-1 text-base font-medium">{firstname}</p>
              )}
            </div>
            <div>
              <p className={`text-sm ${labelClass}`}>Last Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={profileForm.lastname}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastname: e.target.value }))}
                  className={inputClass}
                />
              ) : (
                <p className="mt-1 text-base font-medium">{lastname}</p>
              )}
            </div>
            <div>
              <p className={`text-sm ${labelClass}`}>Email Address</p>
              {isEditing ? (
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                />
              ) : (
                <p className="mt-1 text-base font-medium">{email}</p>
              )}
            </div>
            <div>
              <p className={`text-sm ${labelClass}`}>Role</p>
              <p className="mt-1 text-base font-medium">{getRoleLabel(role)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            {!isEditing ? (
              <button type="button" onClick={startEditing} className={buttonClass}>
                Edit Profile
              </button>
            ) : (
              <>
                <button type="button" onClick={saveProfile} disabled={saving} className={buttonClass}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={buttonClass}
                >
                  Cancel
                </button>
              </>
            )}
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
