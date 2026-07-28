import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AUTOMATION_OPTIONS = [
  { value: "", label: "None" },
  { value: "autopopulate_appeal_letter", label: "Autopopulate Appeal Letter" },
  { value: "request_clinical_documentation", label: "Request Clinical Documentation" },
  { value: "apply_write_off", label: "Apply Write-off" },
  { value: "rebill_claim", label: "Rebill Claim" },
];

const parseTickleDays = (tickleTime) => {
  if (!tickleTime) return null;
  const match = `${tickleTime}`.match(/(\d+)/);
  if (!match) return null;
  const days = Number(match[1]);
  return days > 0 ? days : null;
};

const computeTickleDate = (tickleTime) => {
  const days = parseTickleDays(tickleTime);
  if (days === null) return "";
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Derive follow-up date from governance tickle_time values on selected action codes. */
const resolveTickleFromActions = (checkedActions) => {
  const withTickle = (checkedActions || []).filter((item) => item.tickleTime);
  if (withTickle.length === 0) {
    return { tickleTime: "", tickleDate: "", sourceLabel: "" };
  }

  const longest = withTickle.reduce((best, item) => {
    const days = parseTickleDays(item.tickleTime);
    const bestDays = parseTickleDays(best.tickleTime);
    if (days === null) return best;
    if (bestDays === null || days > bestDays) return item;
    return best;
  }, withTickle[0]);

  return {
    tickleTime: longest.tickleTime,
    tickleDate: computeTickleDate(longest.tickleTime),
    sourceLabel: longest.label,
  };
};

const BulkDenialsPanel = ({
  apiUrl,
  username,
  selectedClaimIds,
  denialCategory,
  isDarkMode,
  onComplete,
  onClearSelection,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [triageActions, setTriageActions] = useState([]);
  const [notes, setNotes] = useState("");
  const [otherText, setOtherText] = useState("");
  const [automation, setAutomation] = useState("");
  const [tickleDate, setTickleDate] = useState("");
  const [tickleDateManual, setTickleDateManual] = useState(false);
  const [progress, setProgress] = useState({ total: 0, success: 0, failed: 0 });
  const [errors, setErrors] = useState([]);

  const selectedIds = useMemo(
    () => (selectedClaimIds || []).filter((id) => id && `${id}`.trim() !== ""),
    [selectedClaimIds]
  );

  useEffect(() => {
    if (!open || !apiUrl || !denialCategory) return;
    setActionsLoading(true);
    axios
      .get(`${apiUrl}/triage_actions`, {
        params: {
          denial_category: denialCategory,
          workflow: (() => {
            const title = `${denialCategory}`.toLowerCase();
            if (title.includes("pend 277")) return "pend277";
            if (title.includes("pend 835")) return "pend835";
            if (title.includes("patient")) return "patient-resp";
            return undefined;
          })(),
        },
      })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setTriageActions(
          items.map((item) => ({
            label: item.label || item.action || "Action",
            checked: false,
            allowFreeText: Boolean(item.allowFreeText || item.allow_free_text),
            tickleTime: item.tickleTime || item.tickle_time || "",
          }))
        );
      })
      .catch(() => {
        setTriageActions([]);
        toast.error("Unable to load action codes for this category.");
      })
      .finally(() => setActionsLoading(false));
  }, [open, apiUrl, denialCategory]);

  const checkedActions = useMemo(
    () => triageActions.filter((item) => item.checked),
    [triageActions]
  );

  const selectedActions = useMemo(
    () => checkedActions.map((item) => item.label),
    [checkedActions]
  );

  const resolvedTickle = useMemo(
    () => resolveTickleFromActions(checkedActions),
    [checkedActions]
  );

  useEffect(() => {
    if (tickleDateManual) return;
    setTickleDate(resolvedTickle.tickleDate || "");
  }, [resolvedTickle.tickleDate, tickleDateManual]);

  const resetForm = () => {
    setNotes("");
    setOtherText("");
    setAutomation("");
    setTickleDate("");
    setTickleDateManual(false);
    setProgress({ total: 0, success: 0, failed: 0 });
    setErrors([]);
    setTriageActions((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const toggleAction = (index) => {
    setTriageActions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (selectedIds.length === 0) {
      toast.info("Select at least one account first.");
      return;
    }
    if (!denialCategory) {
      toast.info("Select a single denial category before applying bulk updates.");
      return;
    }

    const finalSelected = [...selectedActions];
    const trimmedOther = otherText.trim();
    if (trimmedOther && !finalSelected.some((label) => `${label}`.toLowerCase() === "other")) {
      finalSelected.push("Other");
    }

    if (finalSelected.length === 0 && notes.trim() === "" && trimmedOther === "") {
      toast.info("Select at least one action code or add a bulk note.");
      return;
    }

    const actionPayload = {
      selected: finalSelected,
      otherText: trimmedOther,
      transactionCodes: {},
    };

    setLoading(true);
    setErrors([]);
    setProgress({ total: selectedIds.length, success: 0, failed: 0 });

    try {
      const response = await axios.post(`${apiUrl}/bulk_save_action`, {
        claimNos: selectedIds,
        action_date: new Date().toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        }),
        action: actionPayload,
        claim_status: "triage",
        notes: notes.trim(),
        username,
        automation,
        tickleTime: resolvedTickle.tickleTime || null,
        tickleDate: tickleDate || resolvedTickle.tickleDate || null,
      });

      const resultErrors = (response.data?.results || [])
        .filter((item) => item.status !== "ok")
        .map((item) => ({
          claimNo: item.claimNo || `#${item.index + 1}`,
          detail: item.error || "Update failed",
        }));

      const successCount = response.data?.successCount ?? selectedIds.length - resultErrors.length;
      const failureCount = response.data?.failureCount ?? resultErrors.length;

      setProgress({ total: selectedIds.length, success: successCount, failed: failureCount });
      setErrors(resultErrors);

      if (failureCount > 0) {
        toast.error(`Bulk update completed with ${failureCount} failure(s).`);
      } else {
        toast.success(`Bulk update applied to ${successCount} account(s).`);
        onClearSelection?.();
        await onComplete?.();
        handleClose();
        return;
      }

      await onComplete?.();
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Bulk update failed";
      setErrors([{ claimNo: "bulk", detail }]);
      toast.error("Bulk update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={`mb-5 rounded-2xl border p-4 ${isDarkMode ? "border-[#2d3348] bg-[#1b1f29] text-white" : "bg-white border-gray-200 text-slate-900"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Bulk Updates</p>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {selectedIds.length} account{selectedIds.length === 1 ? "" : "s"} selected
              {denialCategory ? ` · ${denialCategory}` : " · select a category to continue"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!denialCategory}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              !denialCategory
                ? "bg-gray-400 text-white cursor-not-allowed"
                : isDarkMode
                  ? "bg-[#2d3348] text-white hover:bg-[#39415c]"
                  : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Apply Bulk Action
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-xl ${
              isDarkMode ? "border-[#2d3348] bg-[#1b1f29] text-white" : "bg-white border-gray-200 text-slate-900"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Bulk Updates – Denials Worklist</h2>
                <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Apply action codes and a shared note to {selectedIds.length} selected account
                  {selectedIds.length === 1 ? "" : "s"} in {denialCategory}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className={`text-sm ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
              >
                Close
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Action Codes</label>
                {actionsLoading ? (
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Loading action codes...</p>
                ) : triageActions.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No action codes configured for this category.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {triageActions.map((action, index) => {
                      const isOther =
                        action.allowFreeText ||
                        `${action.label || ""}`.trim().toLowerCase() === "other";
                      return (
                        <div key={`${action.label}-${index}`}>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={action.checked}
                              onChange={() => toggleAction(index)}
                              className="rounded"
                            />
                            <span>{action.label}</span>
                            {action.tickleTime ? (
                              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                · Tickle: {action.tickleTime}
                              </span>
                            ) : null}
                          </label>
                          {isOther && action.checked ? (
                            <input
                              type="text"
                              value={otherText}
                              onChange={(event) => setOtherText(event.target.value)}
                              placeholder="Describe other action"
                              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm ${
                                isDarkMode
                                  ? "border-[#2d3348] bg-[#27282D] text-white"
                                  : "border-gray-200 bg-white text-slate-900"
                              }`}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Bulk Note</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="This note will be attached to every selected account."
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDarkMode
                      ? "border-[#2d3348] bg-[#27282D] text-white"
                      : "border-gray-200 bg-white text-slate-900"
                  }`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Automation</label>
                  <select
                    value={automation}
                    onChange={(event) => setAutomation(event.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDarkMode
                        ? "border-[#2d3348] bg-[#27282D] text-white"
                        : "border-gray-200 bg-white text-slate-900"
                    }`}
                  >
                    {AUTOMATION_OPTIONS.map((option) => (
                      <option key={option.value || "none"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Follow-up / Tickler Date</label>
                  <input
                    type="date"
                    value={tickleDate}
                    onChange={(event) => {
                      setTickleDateManual(true);
                      setTickleDate(event.target.value);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDarkMode
                        ? "border-[#2d3348] bg-[#27282D] text-white"
                        : "border-gray-200 bg-white text-slate-900"
                    }`}
                  />
                  {resolvedTickle.tickleTime ? (
                    <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      From Governance action code
                      {resolvedTickle.sourceLabel ? ` "${resolvedTickle.sourceLabel}"` : ""}
                      {`: ${resolvedTickle.tickleTime}`}
                      {tickleDateManual ? " (manually overridden)" : ""}
                    </p>
                  ) : (
                    <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      Configure Tickle Time on the Governance Management action codes tab.
                    </p>
                  )}
                </div>
              </div>

              {progress.total > 0 ? (
                <div className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Progress: {progress.success + progress.failed}/{progress.total} (Failed: {progress.failed})
                </div>
              ) : null}

              {errors.length > 0 ? (
                <div className={`text-xs ${isDarkMode ? "text-red-300" : "text-red-600"}`}>
                  {errors.slice(0, 5).map((err, idx) => (
                    <div key={`bulk-denials-err-${idx}`}>
                      {err.claimNo}: {err.detail}
                    </div>
                  ))}
                  {errors.length > 5 ? <div>+{errors.length - 5} more errors</div> : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  isDarkMode
                    ? "bg-[#27282D] text-white hover:bg-[#32343a]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {loading ? "Applying..." : "Apply to Selected Accounts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkDenialsPanel;
