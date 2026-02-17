import React from "react";

const DashboardScreen = ({ isDark }) => {
  const surface = isDark ? "bg-[#1b1c20] border-[#2b2f37] text-gray-100" : "bg-white border-slate-200 text-slate-900";
  const panel = isDark ? "bg-[#202228] border-[#2b2f37]" : "bg-white border-slate-200";
  const muted = isDark ? "text-[#b7bcc6]" : "text-slate-500";
  const subtle = isDark ? "text-[#8f96a3]" : "text-slate-400";
  const divider = isDark ? "border-[#2b2f37]" : "border-slate-200";

  return (
    <div
      className={`rounded-2xl border p-6 ${surface}`}
      style={{ fontFamily: '"Space Grotesk", "IBM Plex Sans", ui-sans-serif, system-ui' }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#7b808c]">Operations</div>
          <h2 className="mt-1 text-2xl font-semibold">Client Dashboard</h2>
        </div>
        <div className={`text-xs ${subtle}`}>Updated just now</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className={`rounded-xl border p-4 ${panel}`}>
          <div className="text-sm font-semibold">User Productivity (Daily)</div>
          <div className={`mt-2 text-xs ${subtle}`}>Agents and output score</div>
          <div className="mt-4 space-y-3">
            {[
              ["AI Agent 1", 100],
              ["AI Agent 2", 75],
              ["AI Agent 3", 50],
              ["AI Agent 4", 30],
              ["Sally", 25],
              ["Joe", 20],
              ["Kimberly", 19],
            ].map(([name, value]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className={muted}>{name}</span>
                <span className="font-semibold text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Current Burn Rate</div>
            <div className="mt-6 rounded-lg border border-[#2b2f37] bg-black/40 p-6 text-center">
              <div className="text-5xl font-semibold">47</div>
              <div className={`mt-2 text-xs ${subtle}`}>Average claims per hour</div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Table 1</div>
            <div className={`mt-2 text-xs ${subtle}`}>Remaining, AR balance, averages</div>
            <div className={`mt-4 grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.5fr] text-xs uppercase ${subtle}`}>
              <div>Category</div>
              <div>Remaining</div>
              <div>AR Balance</div>
              <div>Avg AR Balance</div>
              <div>Avg Age</div>
            </div>
            <div className={`mt-2 border-t ${divider}`} />
            {[
              ["Claim Edits", "45", "$500,000", "$11,111", "18"],
              ["Claim Status", "1,000", "$1,000,000", "$1,000", "24"],
              ["Denials", "3,000", "$2,000,000", "$667", "31"],
              ["Patient Resp", "2,000", "$500,000", "$250", "16"],
              ["Contractual Adjustment", "50,000", "$800,000", "$16", "9"],
            ].map((row) => (
              <div key={row[0]} className={`grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.5fr] py-2 text-sm ${muted}`}>
                {row.map((cell, i) => (
                  <div key={`${row[0]}-${i}`} className={i === 0 ? "text-gray-200" : "text-right"}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:col-span-2">
            <div className={`rounded-xl border p-4 ${panel}`}>
              <div className="text-sm font-semibold">Inventory Accuracy</div>
              <div className="mt-4 h-32 rounded-lg border border-[#2b2f37] bg-black/30 p-4">
                <div className="text-xs uppercase text-[#7b808c]">Accuracy trend</div>
                <div className="mt-4 h-2 w-full rounded-full bg-[#2a2d33]">
                  <div className="h-2 w-[82%] rounded-full bg-[#9aa0ab]" />
                </div>
                <div className={`mt-3 text-2xl font-semibold ${muted}`}>82%</div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${panel}`}>
              <div className="text-sm font-semibold">Recovery $ Month to Date (MTD)</div>
              <div className="mt-4 h-32 rounded-lg border border-[#2b2f37] bg-black/30 p-4">
                <div className="flex items-end justify-between gap-2">
                  {[40, 64, 52, 78, 60, 90, 72].map((h, idx) => (
                    <div key={idx} className="flex w-full flex-col items-center">
                      <div className="w-full rounded-md bg-[#858b95]" style={{ height: `${h}px` }} />
                      <span className={`mt-1 text-[10px] ${subtle}`}>{`W${idx + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${panel}`}>
              <div className="text-sm font-semibold">$4.2M Outstanding AR Balance</div>
              <div className="mt-6 text-3xl font-semibold">4.2M</div>
              <div className={`mt-2 text-xs ${subtle}`}>Balance across all open claims</div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-[#2a2d33]">
                <div className="h-1.5 w-[65%] rounded-full bg-[#9aa0ab]" />
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${panel}`}>
              <div className="text-sm font-semibold">Remaining Actions</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  ["Claim Edits", "45"],
                  ["Denials", "3,000"],
                  ["Patient Resp", "2,000"],
                  ["Contractual Adj.", "50,000"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#2b2f37] bg-black/30 p-3">
                    <div className={`text-xs ${subtle}`}>{label}</div>
                    <div className="mt-1 text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
