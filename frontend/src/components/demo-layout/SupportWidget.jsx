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
    <div className="fixed bottom-5 right-5 z-50 font-inter">
      {isOpen && (
        <div
          className={`mb-3 w-[360px] max-w-[calc(100vw-2.5rem)] rounded-lg border shadow-2xl ${
            isDark
              ? "bg-[#1e1f24] border-[#ffffff15] text-white"
              : "bg-white border-gray-200 text-[#151619]"
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? "border-[#ffffff15]" : "border-gray-200"
            }`}
          >
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Support
              </p>
              <p className="text-base font-semibold leading-6">How can we assist you today?</p>
            </div>
            <button
              type="button"
              className={`h-8 w-8 rounded-md flex items-center justify-center transition ${
                isDark ? "text-gray-300 hover:bg-[#ffffff10]" : "text-gray-600 hover:bg-gray-100"
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
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Try a demo question
              </p>
              <div className="grid grid-cols-1 gap-2">
                {demoQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setMessage(question)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-xs leading-5 transition ${
                      isDark
                        ? "border-[#ffffff14] bg-[#27282D] text-gray-200 hover:border-[#ffffff2e] hover:bg-[#30323a]"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className={`w-full h-24 rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#151619] border-[#ffffff15] text-white placeholder-gray-500 focus:ring-[#ffffff20]"
                  : "bg-white border-gray-200 text-[#151619] placeholder-gray-400 focus:ring-gray-300"
              }`}
              placeholder="Ask a question or describe what you need..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                We typically respond within 1 business day.
              </span>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  isDark ? "bg-[#3b3f46] text-white hover:bg-gray-700" : "bg-[#151619] text-white hover:bg-gray-800"
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
        className={`flex items-center gap-2 rounded-md px-4 py-3 shadow-lg transition ${
          isDark
            ? "bg-[#3b3f46] text-white hover:bg-gray-700"
            : "bg-[#151619] text-white hover:bg-gray-800"
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
