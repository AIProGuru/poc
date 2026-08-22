import React, { useMemo, useState } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

/**
 * Taxonomy Missing AI Agent panel:
 * - Link to raw 837 (S3 / local)
 * - Diagnose missing/incorrect PRV*BI taxonomy vs Client Management
 * - Show before/after highlight and optionally persist corrected 837 to S3
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
  const [showRaw, setShowRaw] = useState(false);
  const [rawMode, setRawMode] = useState("before"); // before | after

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
      setError(err?.response?.data?.error || err.message || "Failed to run taxonomy agent");
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
  const diff = Array.isArray(agent?.diff) ? agent.diff : [];

  const issueLabel = useMemo(() => {
    switch (diagnosis.issue) {
      case "missing":
        return "Missing taxonomy";
      case "incorrect":
        return "Incorrect taxonomy";
      case "config_missing":
        return "Facility taxonomy not configured";
      case "facility_not_matched":
        return "No facility match";
      case "match":
        return "Already correct";
      default:
        return agent?.available === false ? "Unavailable" : "Review required";
    }
  }, [diagnosis.issue, agent?.available]);

  const panelClass = isDark
    ? "border-[#3f4558] bg-[#1b1f29] text-gray-100"
    : "border-slate-200 bg-white text-slate-900";
  const muted = isDark ? "text-gray-400" : "text-slate-500";
  const chipOk = isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-50 text-emerald-800";
  const chipWarn = isDark ? "bg-amber-900/40 text-amber-200" : "bg-amber-50 text-amber-900";
  const chipBad = isDark ? "bg-rose-900/40 text-rose-200" : "bg-rose-50 text-rose-800";
  const chip =
    diagnosis.issue === "match" ? chipOk : diagnosis.issue === "config_missing" ? chipWarn : chipBad;

  if (!claimNo) return null;

  return (
    <div className={`rounded-2xl border p-5 ${panelClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">AI Agent</p>
          <h3 className="text-lg font-semibold mt-1">Taxonomy Missing</h3>
          <p className={`text-sm mt-1 ${muted}`}>
            Compare the raw 837 billing taxonomy (PRV*BI) to Client Management Tax ID / NPI / taxonomy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"}`}
            onClick={() => refresh()}
            disabled={loading || saving}
          >
            {loading ? "Analyzing…" : agent ? "Re-analyze" : "Analyze claim"}
          </button>
          {diagnosis.canFix ? (
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-sm font-medium bg-[#072F40] text-white hover:opacity-90"
              onClick={() => refresh({ persist: true })}
              disabled={loading || saving}
            >
              {saving ? "Saving…" : "Apply taxonomy & save to S3"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
      {!agent && !loading ? (
        <p className={`mt-4 text-sm ${muted}`}>
          Run analyze to load the raw 837 from the tenant S3 bucket and detect taxonomy issues.
        </p>
      ) : null}

      {agent ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${chip}`}>
              {issueLabel}
            </span>
            {raw.filename ? (
              <span className={`text-xs ${muted}`}>
                Source: {raw.source || "unknown"} · {raw.filename}
                {raw.bucket ? ` · s3://${raw.bucket}/${raw.key}` : ""}
              </span>
            ) : null}
          </div>

          <p className="text-sm">{diagnosis.summary || agent.error || ""}</p>

          {agent.matchContext ? (
            <div className={`rounded-xl border p-3 text-xs ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <p className={`font-semibold uppercase ${muted}`}>837 billing provider (used for matching)</p>
              <p className="mt-1 font-mono">
                NPI {agent.matchContext.ediBillingNpi || agent.matchContext.claimNpi || "—"}
                {" · "}
                Tax ID {agent.matchContext.ediBillingTaxId || agent.matchContext.claimTaxId || "—"}
              </p>
              <p className={`mt-1 ${muted}`}>
                {agent.matchContext.facilitiesLoaded} facilit{agent.matchContext.facilitiesLoaded === 1 ? "y" : "ies"} loaded from Client Management
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`rounded-xl border p-3 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <p className={`text-xs uppercase ${muted}`}>837 taxonomy (before)</p>
              <p className="mt-1 font-mono text-sm">{before.taxonomy || "(missing)"}</p>
              {before.segment ? (
                <p className={`mt-2 font-mono text-xs break-all ${muted}`}>{before.segment}</p>
              ) : (
                <p className={`mt-2 text-xs ${muted}`}>No PRV*BI segment</p>
              )}
            </div>
            <div className={`rounded-xl border p-3 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <p className={`text-xs uppercase ${muted}`}>Configured taxonomy (after)</p>
              <p className="mt-1 font-mono text-sm">{after.taxonomy || "(not configured)"}</p>
              {after.segment ? (
                <p className={`mt-2 font-mono text-xs break-all text-emerald-600 dark:text-emerald-300`}>
                  {after.segment}
                </p>
              ) : null}
              <p className={`mt-2 text-xs ${muted}`}>{after.loop || "2000A/2010AA"} · {after.elementPath || "PRV03"}</p>
            </div>
            <div className={`rounded-xl border p-3 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <p className={`text-xs uppercase ${muted}`}>Matched facility</p>
              {facility ? (
                <>
                  <p className="mt-1 text-sm font-medium">{facility.name || facility.id}</p>
                  <p className={`mt-1 text-xs ${muted}`}>NPI {facility.npi || "—"} · Tax ID {facility.taxId || "—"}</p>
                  <p className={`mt-1 text-xs ${muted}`}>taxonomyCode: {facility.taxonomyCode || "—"}</p>
                </>
              ) : (
                <p className={`mt-1 text-sm ${muted}`}>
                  No facility matched by NPI/Tax ID. Configure the facility in Client Management.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}
              onClick={() => {
                setRawMode("before");
                setShowRaw(true);
              }}
              disabled={!raw.content}
            >
              View raw 837
            </button>
            {raw.url ? (
              <a
                href={raw.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-[#202123] text-white"
              >
                Open S3 837 link
              </a>
            ) : null}
            {agent.correctedContent ? (
              <button
                type="button"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-white/10" : "bg-slate-100"}`}
                onClick={() => {
                  setRawMode("after");
                  setShowRaw(true);
                }}
              >
                View corrected 837
              </button>
            ) : null}
            {agent.saved?.url ? (
              <a
                href={agent.saved.url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-700 text-white"
              >
                Open corrected S3 file
              </a>
            ) : null}
          </div>

          {diff.length > 0 ? (
            <div className={`overflow-hidden rounded-xl border ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isDark ? "bg-[#262a33]" : "bg-slate-50"}`}>
                Before / after segment highlight
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className={`border-b md:border-b-0 md:border-r ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
                  <p className={`px-3 py-2 text-xs font-medium ${muted}`}>Before</p>
                  <pre className="px-3 pb-3 text-xs font-mono whitespace-pre-wrap break-all max-h-64 overflow-auto">
                    {diff.map((row) => (
                      <div
                        key={`b-${row.index}`}
                        className={
                          row.changed
                            ? isDark
                              ? "bg-rose-900/40 text-rose-100"
                              : "bg-rose-50 text-rose-900"
                            : ""
                        }
                      >
                        {row.before || "∅"}
                      </div>
                    ))}
                  </pre>
                </div>
                <div>
                  <p className={`px-3 py-2 text-xs font-medium ${muted}`}>After</p>
                  <pre className="px-3 pb-3 text-xs font-mono whitespace-pre-wrap break-all max-h-64 overflow-auto">
                    {diff.map((row) => (
                      <div
                        key={`a-${row.index}`}
                        className={
                          row.changed
                            ? isDark
                              ? "bg-emerald-900/40 text-emerald-100"
                              : "bg-emerald-50 text-emerald-900"
                            : ""
                        }
                      >
                        {row.after || "∅"}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal open={showRaw} onClose={() => setShowRaw(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(960px, 94vw)",
            maxHeight: "85vh",
            bgcolor: isDark ? "#151619" : "background.paper",
            color: isDark ? "#f3f4f6" : "inherit",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            overflow: "auto",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-base font-semibold">
              {rawMode === "after" ? "Corrected 837" : "Raw 837"} · {raw.filename || claimNo}
            </h4>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? "bg-white/10" : "bg-slate-100"}`}
              onClick={() => setShowRaw(false)}
            >
              Close
            </button>
          </div>
          <pre className={`text-xs font-mono whitespace-pre-wrap break-all rounded-lg p-3 ${isDark ? "bg-[#0f1012]" : "bg-slate-50"}`}>
            {rawMode === "after" ? agent?.correctedContent || "" : raw.content || ""}
          </pre>
        </Box>
      </Modal>
    </div>
  );
}
