import React, { useMemo, useState } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

const AGENT_TITLE = "Missing or incorrect taxonomy code";

function friendlySummary(diagnosis, agentError) {
  if (agentError) return agentError;
  switch (diagnosis?.issue) {
    case "missing":
      return "The billing provider taxonomy code is missing on this claim, which will cause the payer to reject it on submission.";
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

const EdiFileIcon = ({ className = "" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path
      d="M7 3.5h7.2L19.5 9v11.5A1 1 0 0 1 18.5 21.5h-11A1 1 0 0 1 6.5 20.5v-16A1 1 0 0 1 7.5 3.5H7Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M14.2 3.5V9h5.3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 13.2h6.5M9 16.4h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4L19.5 9M19.5 12a7.5 7.5 0 0 1-12.7 5.4L4.5 15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M19.5 4.5V9h-4.5M4.5 19.5V15H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 20.5V6.5A1.5 1.5 0 0 1 5.5 5h8A1.5 1.5 0 0 1 15 6.5V20.5M15 10h3.5A1.5 1.5 0 0 1 20 11.5V20.5M2.5 20.5h19"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M7.5 8.5h2M7.5 12h2M7.5 15.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

  const summaryText = useMemo(
    () => friendlySummary(diagnosis, agent?.error),
    [diagnosis, agent?.error]
  );

  const beforeTaxonomy = before.taxonomy || "(missing)";
  const afterTaxonomy = after.taxonomy || "(not configured)";
  const beforeSegment = before.segment || `PRV*BI*PXC*${beforeTaxonomy}`;
  const afterSegment = after.segment || (after.taxonomy ? `PRV*BI*PXC*${after.taxonomy}` : null);

  const muted = isDark ? "text-gray-400" : "text-slate-500";
  const surface = isDark ? "bg-[#111F35] border-[#2A4A70]" : "bg-white border-slate-200";
  const sideCard = isDark ? "bg-[#1C3050] border-[#2A4A70]" : "bg-slate-50 border-slate-200";
  const ghostBtn = isDark
    ? "bg-white/10 hover:bg-white/15 text-gray-100 border border-white/10"
    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200";
  const softPill = isDark
    ? "bg-[#1C3050] border border-[#2A4A70] text-gray-100 hover:bg-[#2A4A70]"
    : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50";

  const reanalyzeTooltip =
    "Re-runs the taxonomy review using the latest claim file and your Client Management facility settings.";

  if (!claimNo) return null;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${surface} text-inherit`}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)] gap-4 xl:gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs font-medium ${muted}`}>Flagged by claims agent</p>
              <h3 className="mt-1 text-xl sm:text-2xl font-semibold leading-tight tracking-tight">
                {AGENT_TITLE}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Tooltip title={reanalyzeTooltip} arrow placement="top">
                <span>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${ghostBtn}`}
                    onClick={() => refresh()}
                    disabled={loading || saving}
                  >
                    <RefreshIcon />
                    {loading ? "Reviewing…" : agent ? "Re-analyze" : "Analyze"}
                  </button>
                </span>
              </Tooltip>
              {diagnosis.canFix ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-[#0F766E] hover:bg-[#0D9488] text-white transition-colors"
                  onClick={() => refresh({ persist: true })}
                  disabled={loading || saving}
                >
                  <CheckIcon />
                  {saving ? "Saving…" : "Approve update"}
                </button>
              ) : null}
            </div>
          </div>

          {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

          {!agent && !loading ? (
            <p className={`mt-3 text-sm ${muted}`}>
              Select Analyze to compare this claim against Client Management facility settings.
            </p>
          ) : null}

          {agent ? (
            <div className="mt-3 space-y-4">
              {summaryText ? (
                <p className={`text-sm sm:text-base leading-relaxed ${muted}`}>{summaryText}</p>
              ) : null}

              <div
                className={`overflow-hidden rounded-xl border font-mono text-sm sm:text-[15px] ${
                  isDark ? "border-[#2A4A70] bg-[#0D1829]" : "border-slate-200 bg-slate-950"
                }`}
              >
                <div className="flex items-stretch bg-[#7F1D1D]/80 text-rose-100">
                  <div className="flex w-10 shrink-0 items-center justify-center border-r border-white/10 text-base font-semibold">
                    −
                  </div>
                  <div className="min-w-0 flex-1 px-3 py-2.5 break-all">
                    {beforeSegment}
                  </div>
                </div>
                <div className="flex items-stretch bg-[#14532D]/85 text-emerald-100">
                  <div className="flex w-10 shrink-0 items-center justify-center border-r border-white/10 text-base font-semibold">
                    +
                  </div>
                  <div className="min-w-0 flex-1 px-3 py-2.5 break-all">
                    {afterSegment || `PRV*BI*PXC*${afterTaxonomy}`}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${softPill}`}
                  onClick={() => {
                    setFileMode("before");
                    setShowFile(true);
                  }}
                  disabled={!raw.content}
                >
                  <EdiFileIcon />
                  View original 837
                </button>
                {agent.correctedContent ? (
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${softPill}`}
                    onClick={() => {
                      setFileMode("after");
                      setShowFile(true);
                    }}
                  >
                    <EdiFileIcon />
                    View corrected 837
                  </button>
                ) : null}
                {raw.url ? (
                  <a
                    href={raw.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${softPill}`}
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
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${softPill}`}
                  >
                    <EdiFileIcon />
                    Open corrected file
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside className={`rounded-2xl border p-4 h-fit ${sideCard}`}>
          <div className={`flex items-center gap-2 text-sm font-medium ${muted}`}>
            <BuildingIcon />
            Matched facility
          </div>
          {facility ? (
            <>
              <p className={`mt-3 text-base sm:text-lg font-medium leading-snug ${isDark ? "text-[#A8C5E2]" : "text-slate-700"}`}>
                {facility.name || facility.id}
              </p>
              <dl className="mt-4 space-y-2.5 text-sm sm:text-base">
                {[
                  { label: "NPI", value: facility.npi || "—" },
                  { label: "Tax ID", value: facility.taxId || "—" },
                  {
                    label: "Taxonomy",
                    value: facility.taxonomyCode || "—",
                    accent: true,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3">
                    <dt className={muted}>{row.label}</dt>
                    <dd
                      className={`font-mono text-right ${
                        row.accent
                          ? "text-emerald-400 font-semibold"
                          : isDark
                            ? "text-gray-100"
                            : "text-slate-900"
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p className={`mt-3 text-sm ${muted}`}>
              No match — align Tax ID and NPI in Client Management.
            </p>
          )}
        </aside>
      </div>

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
