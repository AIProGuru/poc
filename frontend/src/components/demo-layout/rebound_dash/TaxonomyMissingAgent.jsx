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

const EdiFileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 3.5h7.2L19.5 9v11.5A1 1 0 0 1 18.5 21.5h-11A1 1 0 0 1 6.5 20.5v-16A1 1 0 0 1 7.5 3.5H7Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M14.2 3.5V9h5.3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 13.2h6.5M9 16.4h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path
      d="M8.2 10.4 9.6 9l1.4 1.4M14.4 10.4 13 9l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const cardClass = `rounded-lg border px-3 py-2 ${isDark ? "border-[#2A4A70] bg-[#1C3050]" : "border-slate-200"}`;
  const chipOk = isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-50 text-emerald-800";
  const chipWarn = isDark ? "bg-amber-900/40 text-amber-200" : "bg-amber-50 text-amber-900";
  const chipBad = isDark ? "bg-rose-900/40 text-rose-200" : "bg-rose-50 text-rose-800";
  const chip =
    diagnosis.issue === "match" ? chipOk : diagnosis.issue === "config_missing" ? chipWarn : chipBad;
  const ediBtnBase =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";

  const reanalyzeTooltip =
    "Re-runs the taxonomy review using the latest claim file and your Client Management facility settings.";

  if (!claimNo) return null;

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${panelClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">AI Agent</p>
          <h3 className="text-lg font-semibold leading-tight">{AGENT_TITLE}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Tooltip title={reanalyzeTooltip} arrow placement="top">
            <span>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"}`}
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
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-colors"
              onClick={() => refresh({ persist: true })}
              disabled={loading || saving}
            >
              {saving ? "Saving…" : "Approve Update"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-rose-500">{error}</p> : null}

      {!agent && !loading ? (
        <p className={`mt-2 text-sm ${muted}`}>
          Select Analyze to compare this claim against Client Management facility settings.
        </p>
      ) : null}

      {agent ? (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip}`}>
              {issueLabel}
            </span>
            {summaryText ? <p className="text-sm flex-1 min-w-[12rem]">{summaryText}</p> : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <div className={cardClass}>
              <p className={`text-xs uppercase font-semibold ${muted}`}>Before</p>
              <p className="mt-0.5 text-base font-mono leading-snug">{beforeTaxonomy}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-xs uppercase font-semibold ${muted}`}>After</p>
              <p className="mt-0.5 text-base font-mono leading-snug text-emerald-600 dark:text-emerald-300">{afterTaxonomy}</p>
            </div>
            <div className={cardClass}>
              <p className={`text-xs uppercase font-semibold ${muted}`}>Matched Facility</p>
              {facility ? (
                <>
                  <p className="mt-0.5 text-base font-medium truncate leading-snug">{facility.name || facility.id}</p>
                  <p className={`text-sm ${muted}`}>
                    NPI {facility.npi || "—"} · Tax ID {facility.taxId || "—"}
                  </p>
                  <p className={`text-sm ${muted}`}>
                    Taxonomy Code: <span className="font-mono">{facility.taxonomyCode || "—"}</span>
                  </p>
                </>
              ) : (
                <p className={`mt-0.5 text-sm ${muted}`}>
                  No match — align Tax ID and NPI in Client Management.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${ediBtnBase} ${isDark ? "bg-[#2A4A70] text-white hover:bg-[#4A6080]" : "bg-[#1C3050] text-white hover:bg-[#2A4A70]"}`}
              onClick={() => {
                setFileMode("before");
                setShowFile(true);
              }}
              disabled={!raw.content}
            >
              <EdiFileIcon />
              View Original 837
            </button>
            {agent.correctedContent ? (
              <button
                type="button"
                className={`${ediBtnBase} bg-[#14B8A6] text-white hover:bg-[#0D9488]`}
                onClick={() => {
                  setFileMode("after");
                  setShowFile(true);
                }}
              >
                <EdiFileIcon />
                View Corrected 837
              </button>
            ) : null}
            {raw.url ? (
              <a
                href={raw.url}
                target="_blank"
                rel="noreferrer"
                className={`${ediBtnBase} ${isDark ? "bg-[#2A4A70] text-white hover:bg-[#4A6080]" : "bg-[#1C3050] text-white hover:bg-[#2A4A70]"}`}
              >
                <EdiFileIcon />
                Open original file
              </a>
            ) : null}
            {agent.saved?.url ? (
              <a
                href={agent.saved.url}
                target="_blank"
                rel="noreferrer"
                className={`${ediBtnBase} bg-emerald-700 text-white hover:bg-emerald-800`}
              >
                <EdiFileIcon />
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
            <h4 className="text-base font-semibold">
              {fileMode === "after" ? "Corrected 837" : "Original 837"} · {claimNo}
            </h4>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? "bg-white/10" : "bg-slate-100"}`}
              onClick={() => setShowFile(false)}
            >
              Close
            </button>
          </div>
          <pre className={`text-sm font-mono whitespace-pre-wrap break-all rounded-lg p-2 max-h-[70vh] overflow-auto ${isDark ? "bg-[#1C3050]" : "bg-slate-50"}`}>
            {fileMode === "after" ? agent?.correctedContent || "" : raw.content || ""}
          </pre>
        </Box>
      </Modal>
    </div>
  );
}
