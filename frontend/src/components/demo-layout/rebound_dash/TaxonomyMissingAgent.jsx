import React, { useMemo, useState } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

const AGENT_TITLE = "Missing or Incorrect Taxonomy Code";

function friendlyIssueLabel(issue) {
  switch (issue) {
    case "missing":
      return "Missing taxonomy";
    case "incorrect":
      return "Incorrect taxonomy";
    case "config_missing":
      return "Taxonomy not configured";
    case "facility_not_matched":
      return "No facility match";
    case "match":
      return "Already correct";
    default:
      return "Review required";
  }
}

function friendlySummary(diagnosis, agentError) {
  if (agentError) return agentError;
  switch (diagnosis?.issue) {
    case "missing":
      return "The billing provider taxonomy code is missing on this claim.";
    case "incorrect":
      return "The billing provider taxonomy code on this claim does not match Client Management.";
    case "config_missing":
      return "A facility was matched, but no taxonomy code is configured in Client Management.";
    case "facility_not_matched":
      return "No Client Management facility matched this claim's Tax ID and NPI. Update facility settings to match the billing provider.";
    case "match":
      return "The claim taxonomy already matches Client Management.";
    default:
      return diagnosis?.summary || "";
  }
}

/**
 * Taxonomy Missing AI Agent — triage workflow panel.
 */
export default function TaxonomyMissingAgent({
  apiUrl,
  claimNo,
  initialAgent,
  isDark = false,
}) {
  const [agent, setAgent] = useState(initialAgent || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showFile, setShowFile] = useState(false);
  const [fileMode, setFileMode] = useState("before");

  React.useEffect(() => {
    setAgent(initialAgent || null);
  }, [initialAgent, claimNo]);

  const refresh = async ({ persist = false } = {}) => {
    if (!apiUrl || !claimNo) return;
    setError("");
    if (persist) setSaving(true);
    else setLoading(true);
    try {
      const res = await axios({
        method: persist ? "post" : "get",
        url: `${apiUrl}/taxonomy_agent`,
        params: { id: claimNo, persist: persist ? "1" : undefined },
        data: persist ? { id: claimNo, persist: true } : undefined,
      });
      setAgent(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to run taxonomy review");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const diagnosis = agent?.diagnosis || {};
  const facility = agent?.facility || null;
  const raw = agent?.raw837 || {};
  const before = agent?.before || {};
  const after = agent?.after || {};

  const issueLabel = useMemo(
    () => (agent?.available === false ? "Unavailable" : friendlyIssueLabel(diagnosis.issue)),
    [diagnosis.issue, agent?.available]
  );

  const summaryText = useMemo(
    () => friendlySummary(diagnosis, agent?.error),
    [diagnosis, agent?.error]
  );

  const beforeTaxonomy = before.taxonomy || "(missing)";
  const afterTaxonomy = after.taxonomy || "(not configured)";

  const panelClass = isDark
    ? "border-[#2A4A70] bg-[#111F35] text-gray-100"
    : "border-slate-200 bg-white text-slate-900";
  const muted = isDark ? "text-gray-400" : "text-slate-500";
  const cardClass = `rounded-lg border p-2.5 ${isDark ? "border-[#2A4A70] bg-[#1C3050]" : "border-slate-200"}`;
  const chipOk = isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-50 text-emerald-800";
  const chipWarn = isDark ? "bg-amber-900/40 text-amber-200" : "bg-amber-50 text-amber-900";
  const chipBad = isDark ? "bg-rose-900/40 text-rose-200" : "bg-rose-50 text-rose-800";
  const chip =
    diagnosis.issue === "match" ? chipOk : diagnosis.issue === "config_missing" ? chipWarn : chipBad;

  const reanalyzeTooltip =
    "Re-runs the taxonomy review using the latest claim file and your Client Management facility settings.";

  if (!claimNo) return null;

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${panelClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">AI Agent</p>
          <h3 className="text-base font-semibold leading-tight">{AGENT_TITLE}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Tooltip title={reanalyzeTooltip} arrow placement="top">
            <span>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"}`}
                onClick={() => refresh()}
                disabled={loading || saving}
              >
                {loading ? "Reviewing…" : agent ? "Re-analyze" : "Analyze"}
              </button>
            </span>
          </Tooltip>
          {diagnosis.canFix ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              onClick={() => refresh({ persist: true })}
              disabled={loading || saving}
            >
              {saving ? "Saving…" : "Approve Taxonomy Update"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}

      {!agent && !loading ? (
        <p className={`mt-2 text-xs ${muted}`}>
          Select Analyze to compare this claim against Client Management facility settings.
        </p>
      ) : null}

      {agent ? (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${chip}`}>
              {issueLabel}
            </span>
            {summaryText ? <p className="text-xs flex-1 min-w-[12rem]">{summaryText}</p> : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className={cardClass}>
              <p className={`text-[10px] uppercase font-semibold ${muted}`}>Before</p>
              <p className="mt-0.5 text-sm font-mono">{beforeTaxonomy}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-[10px] uppercase font-semibold ${muted}`}>After</p>
              <p className="mt-0.5 text-sm font-mono text-emerald-600 dark:text-emerald-300">{afterTaxonomy}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-[10px] uppercase font-semibold ${muted}`}>Matched Facility</p>
              {facility ? (
                <>
                  <p className="mt-0.5 text-sm font-medium truncate">{facility.name || facility.id}</p>
                  <p className={`text-[11px] ${muted}`}>
                    NPI {facility.npi || "—"} · Tax ID {facility.taxId || "—"}
                  </p>
                  <p className={`text-[11px] ${muted}`}>
                    Taxonomy Code: <span className="font-mono">{facility.taxonomyCode || "—"}</span>
                  </p>
                </>
              ) : (
                <p className={`mt-0.5 text-xs ${muted}`}>
                  No match — align Tax ID and NPI in Client Management.
                </p>
              )}
            </div>
          </div>

          {(agent.correctedContent || raw.content || agent.saved?.url) ? (
            <div className={`rounded-lg border overflow-hidden ${isDark ? "border-[#2A4A70]" : "border-slate-200"}`}>
              <div className={`px-2.5 py-1.5 text-[11px] font-semibold ${isDark ? "bg-[#1C3050]" : "bg-slate-50"}`}>
                Before | After Snapshot
              </div>
              <div className="grid grid-cols-2 text-xs">
                <div className={`px-2.5 py-2 border-r ${isDark ? "border-[#2A4A70] bg-rose-950/20" : "border-slate-200 bg-rose-50/50"}`}>
                  <p className={`text-[10px] font-semibold uppercase ${muted}`}>Before</p>
                  <p className="mt-1 font-mono">{beforeTaxonomy}</p>
                </div>
                <div className={`px-2.5 py-2 ${isDark ? "bg-emerald-950/20" : "bg-emerald-50/50"}`}>
                  <p className={`text-[10px] font-semibold uppercase ${muted}`}>After</p>
                  <p className="mt-1 font-mono text-emerald-600 dark:text-emerald-300">{afterTaxonomy}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}
              onClick={() => {
                setFileMode("before");
                setShowFile(true);
              }}
              disabled={!raw.content}
            >
              View Original 837
            </button>
            {agent.correctedContent ? (
              <button
                type="button"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                onClick={() => {
                  setFileMode("after");
                  setShowFile(true);
                }}
              >
                View Corrected 837
              </button>
            ) : null}
            {raw.url ? (
              <a
                href={raw.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#2A4A70] text-white"
              >
                Open original file
              </a>
            ) : null}
            {agent.saved?.url ? (
              <a
                href={agent.saved.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-700 text-white"
              >
                Open corrected file
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <Modal open={showFile} onClose={() => setShowFile(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(960px, 94vw)",
            maxHeight: "85vh",
            bgcolor: isDark ? "#111F35" : "background.paper",
            color: isDark ? "#f3f4f6" : "inherit",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            overflow: "auto",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <h4 className="text-sm font-semibold">
              {fileMode === "after" ? "Corrected 837" : "Original 837"} · {claimNo}
            </h4>
            <button
              type="button"
              className={`px-3 py-1 rounded-lg text-xs ${isDark ? "bg-white/10" : "bg-slate-100"}`}
              onClick={() => setShowFile(false)}
            >
              Close
            </button>
          </div>
          <pre className={`text-[11px] font-mono whitespace-pre-wrap break-all rounded-lg p-2 max-h-[70vh] overflow-auto ${isDark ? "bg-[#1C3050]" : "bg-slate-50"}`}>
            {fileMode === "after" ? agent?.correctedContent || "" : raw.content || ""}
          </pre>
        </Box>
      </Modal>
    </div>
  );
}
