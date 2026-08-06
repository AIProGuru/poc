import React, { useState } from "react";
import { useSelector } from "react-redux";

const SupportWidget = () => {
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const demoQuestions = [
    "What is the timely filing limit for BCBS?",
    "Can you provide an appeal template for United Healthcare?",
    "I need to submit a ticket for a bug.",
    "I need to submit a ticket for an enhancement.",
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    setIsOpen(false);
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px] cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close support panel"
        />
      ) : null}

      <div className="fixed bottom-5 right-5 z-[9999] font-inter">
        {isOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-panel-title"
            className={`mb-4 w-[min(420px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.45)] animate-fade-in-up ${
              isDark
                ? "border-[var(--helio-border-strong)] bg-[var(--helio-surface)] text-white ring-1 ring-white/10"
                : "border-slate-200 bg-white text-slate-900 ring-1 ring-black/5"
            }`}
          >
            <div
              className="relative px-5 py-4 text-white"
              style={{ background: "linear-gradient(135deg, #4B9187 0%, #3d7a72 45%, #6911AC 100%)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path
                        d="M3.5 9.5C3.5 5.91015 6.41015 3 10 3C13.5899 3 16.5 5.91015 16.5 9.5V14.5C16.5 15.3284 15.8284 16 15 16H6L3.5 18.5V9.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                      Helio Support
                    </p>
                    <h2 id="support-panel-title" className="text-lg font-semibold leading-snug">
                      How can we help you?
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/85">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                      Team available · typical reply within 1 business day
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close support"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-2.5">
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  Quick questions
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {demoQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setMessage(question)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm leading-5 transition ${
                        message === question
                          ? "border-[#4B9187] bg-[#4B9187]/10 text-[#4B9187] ring-1 ring-[#4B9187]/30"
                          : isDark
                            ? "border-[var(--helio-border)] bg-[var(--helio-surface-muted)] text-gray-200 hover:border-[#4B9187]/50 hover:bg-[#4B9187]/10"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#4B9187]/40 hover:bg-[#4B9187]/5"
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="support-message"
                  className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-slate-500"}`}
                >
                  Your message
                </label>
                <textarea
                  id="support-message"
                  className={`w-full min-h-[112px] rounded-xl border px-3.5 py-3 text-sm resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-[#4B9187]/40 ${
                    isDark
                      ? "bg-[var(--helio-surface-muted)] border-[var(--helio-border)] text-white placeholder-gray-500"
                      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Describe your question, issue, or request..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#4B9187] text-sm font-semibold text-white shadow-md transition hover:bg-[#3d7a72] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-5 py-3.5 text-white shadow-[0_8px_30px_rgba(75,145,135,0.45)] transition hover:bg-[#3d7a72] hover:shadow-[0_10px_36px_rgba(75,145,135,0.55)] ${
            isOpen ? "bg-[#3d7a72]" : "bg-[#4B9187]"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close support" : "Open support"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <>
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-semibold">Close</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M3.5 9.5C3.5 5.91015 6.41015 3 10 3C13.5899 3 16.5 5.91015 16.5 9.5V14.5C16.5 15.3284 15.8284 16 15 16H6L3.5 18.5V9.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-semibold">Support</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default SupportWidget;
