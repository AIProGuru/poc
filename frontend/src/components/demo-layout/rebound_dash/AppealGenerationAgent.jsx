import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import AgentAvatar from "./AgentAvatar";

const SUGGESTED_PROMPTS = [
  "Make the argument more clinical",
  "Shorten the letter",
  "Emphasize medical necessity",
  "Add language about timely filing",
  "Tone this down for a first-level appeal",
];

export default function AppealGenerationAgent({
  apiUrl,
  claimNo,
  isDark = false,
  autoGenerate = false,
  compact = false,
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [error, setError] = useState("");
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);
  const autoStartedRef = useRef("");

  const panelClass = isDark
    ? "border-[#3f4558] bg-[#1b1f29] text-gray-100"
    : "border-slate-200 bg-white text-slate-900";
  const muted = isDark ? "text-gray-400" : "text-slate-500";
  const fieldClass = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
    isDark
      ? "border-[#3f4558] bg-[#11141b] text-gray-100 placeholder-gray-500"
      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
  }`;
  const ghostBtn = `px-3 py-2 rounded-lg text-sm font-medium ${
    isDark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"
  }`;

  const applySession = (data) => {
    if (!data) return;
    setSession(data);
  };

  const loadPreview = async () => {
    if (!apiUrl || !claimNo) return;
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/appeal_agent`, { params: { id: claimNo } });
      applySession(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load appeal context");
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!apiUrl || !claimNo) return;
    setError("");
    setGenerating(true);
    try {
      const res = await axios.post(`${apiUrl}/appeal_agent`, {
        id: claimNo,
        physicianNotes,
      });
      applySession(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to generate appeal");
    } finally {
      setGenerating(false);
    }
  };

  const sendChat = async (message) => {
    const text = `${message || ""}`.trim();
    if (!text || !apiUrl || !claimNo || chatting) return;
    setChatInput("");
    setError("");
    setChatting(true);
    setSession((prev) => ({
      ...(prev || {}),
      messages: [...(prev?.messages || []), { role: "user", content: text }],
    }));
    try {
      const res = await axios.post(`${apiUrl}/appeal_agent/chat`, {
        id: claimNo,
        message: text,
        physicianNotes,
      });
      applySession(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to revise appeal");
    } finally {
      setChatting(false);
    }
  };

  useEffect(() => {
    autoStartedRef.current = "";
    loadPreview();
  }, [apiUrl, claimNo]);

  useEffect(() => {
    if (!autoGenerate || !apiUrl || !claimNo || generating) return;
    if (autoStartedRef.current === claimNo) return;
    if (session?.generated) {
      autoStartedRef.current = claimNo;
      return;
    }
    if (session == null && loading) return;
    autoStartedRef.current = claimNo;
    generate();
  }, [autoGenerate, apiUrl, claimNo, session, loading, generating]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages, chatting]);

  const letter = session?.letter || "";
  const messages = session?.messages || [];
  const supportingDocs = session?.supportingDocs || [];
  const populated = session?.populated || {};

  const copyLetter = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Could not copy letter");
    }
  };

  const downloadLetter = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appeal-${claimNo || "letter"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const busy = loading || generating || chatting;
  const headerSubtitle = useMemo(() => {
    if (generating) return "Drafting the appeal from claim, denial, and documentation…";
    if (session?.generated) {
      return session.usedLlm
        ? "AI drafted the clinical summary and argument. Ask April to revise anything."
        : "Letter populated from claim data. Chat to revise the argument.";
    }
    return "Populate the standard appeal letter, then generate the clinical and administrative argument.";
  }, [generating, session]);

  if (!claimNo) return null;

  return (
    <div className={`rounded-2xl border p-5 ${panelClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AgentAvatar name="April" size={44} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">AI Agent</p>
            <h3 className="text-lg font-semibold mt-1">Intelligent Appeal Generation</h3>
            <p className={`text-sm mt-1 ${muted}`}>{headerSubtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostBtn} onClick={loadPreview} disabled={busy}>
            {loading ? "Loading…" : "Reload claim"}
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[#072F40] text-white hover:opacity-90 disabled:opacity-60"
            onClick={generate}
            disabled={busy}
          >
            {generating ? "Generating…" : session?.generated ? "Regenerate appeal" : "Generate appeal"}
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}

      <div className={`mt-4 grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"}`}>
        <div className="space-y-4">
          <div className={`rounded-xl border p-3 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Physician notes (optional)</p>
            <textarea
              className={`${fieldClass} mt-2 min-h-[88px] resize-y`}
              value={physicianNotes}
              onChange={(e) => setPhysicianNotes(e.target.value)}
              placeholder="Paste clinical notes, op report highlights, or authorization details to strengthen the argument."
            />
          </div>

          <div className={`rounded-xl border overflow-hidden ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
            <div className={`flex items-center justify-between gap-2 px-3 py-2 ${isDark ? "bg-[#262a33]" : "bg-slate-50"}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Appeal letter</p>
              <div className="flex gap-2">
                <button type="button" className={ghostBtn} onClick={copyLetter} disabled={!letter}>
                  {copied ? "Copied" : "Copy"}
                </button>
                <button type="button" className={ghostBtn} onClick={downloadLetter} disabled={!letter}>
                  Download
                </button>
              </div>
            </div>
            <pre
              className={`px-4 py-3 text-sm font-mono whitespace-pre-wrap break-words max-h-[640px] overflow-auto leading-6 ${
                isDark ? "bg-[#0f1012] text-gray-100" : "bg-white text-slate-800"
              }`}
            >
              {letter || (loading ? "Loading claim fields…" : "Generate an appeal to populate this letter.")}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-xl border p-3 text-sm ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Claim snapshot</p>
            <dl className="mt-2 grid grid-cols-1 gap-1.5">
              {[
                ["Payer", populated.payerName],
                ["Patient", populated.patientName],
                ["Claim", populated.claimNumber],
                ["DOS", populated.dateOfService],
                ["CARC", populated.carc],
                ["RARC", populated.rarc],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className={`w-16 shrink-0 ${muted}`}>{label}</dt>
                  <dd className="min-w-0 break-words">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          {supportingDocs.length > 0 ? (
            <div className={`rounded-xl border p-3 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>Supporting documentation</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {supportingDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <span>{doc.checked ? "☑" : "☐"}</span>
                    <span>{doc.label}</span>
                    {doc.attached ? <span className={`text-xs ${muted}`}>attached</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={`rounded-xl border flex flex-col min-h-[320px] ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}>
            <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isDark ? "bg-[#262a33]" : "bg-slate-50"}`}>
              Ask April
            </div>
            <div className="flex-1 overflow-auto px-3 py-3 space-y-3 max-h-[360px]">
              {messages.length === 0 ? (
                <p className={`text-sm ${muted}`}>
                  After the letter is generated, ask for revisions, a stronger clinical argument, or a shorter version.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? isDark
                          ? "bg-[#072F40] text-white ml-6"
                          : "bg-[#072F40] text-white ml-6"
                        : isDark
                          ? "bg-white/5 mr-4"
                          : "bg-slate-100 mr-4"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              {chatting ? <p className={`text-sm ${muted}`}>April is revising the letter…</p> : null}
              <div ref={chatEndRef} />
            </div>
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={`text-xs rounded-full px-2.5 py-1 ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"}`}
                  onClick={() => sendChat(prompt)}
                  disabled={busy || !session?.generated}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className={`border-t p-3 flex gap-2 ${isDark ? "border-[#3f4558]" : "border-slate-200"}`}
              onSubmit={(e) => {
                e.preventDefault();
                sendChat(chatInput);
              }}
            >
              <input
                className={fieldClass}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question or request a revision…"
                disabled={busy || !session?.generated}
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-[#072F40] text-white disabled:opacity-60 shrink-0"
                disabled={busy || !session?.generated || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
