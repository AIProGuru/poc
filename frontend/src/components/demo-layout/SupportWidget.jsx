import React, { useState } from "react";
import { useSelector } from "react-redux";

const SupportWidget = () => {
  const theme = useSelector((state) => state.app.theme);
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div
          className={`mb-3 w-[320px] rounded-2xl border shadow-2xl ${
            isDark
              ? "bg-[#0B0E17] border-white/10 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-white/50" : "text-slate-400"}`}>
                Support
              </p>
              <p className="text-base font-semibold">How can we assist you today?</p>
            </div>
            <button
              type="button"
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isDark ? "text-white/70 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"
              }`}
              onClick={() => setIsOpen(false)}
              aria-label="Close support"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <textarea
              className={`w-full h-24 rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#141925] border-white/10 text-white placeholder-white/40 focus:ring-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-300"
              }`}
              placeholder="Ask a question about this claim or workflow..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isDark ? "text-white/50" : "text-slate-400"}`}>
                We typically respond within 1 business day.
              </span>
              <button
                type="submit"
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  isDark ? "bg-white text-[#0B0E17]" : "bg-slate-900 text-white"
                }`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`flex items-center gap-2 rounded-full px-4 py-3 shadow-lg ${
          isDark
            ? "bg-white text-[#0B0E17] hover:bg-white/90"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open support"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M3.5 9.5C3.5 5.91015 6.41015 3 10 3C13.5899 3 16.5 5.91015 16.5 9.5V14.5C16.5 15.3284 15.8284 16 15 16H6L3.5 18.5V9.5Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-semibold">Support</span>
      </button>
    </div>
  );
};

export default SupportWidget;
