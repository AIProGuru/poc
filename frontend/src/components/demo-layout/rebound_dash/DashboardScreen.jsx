import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DashboardScreen = ({ isDark, selectedAgent, onSelectAgent }) => {
  const models = useSelector((state) => state.app.models) || [];
  const surface = isDark ? "bg-[#1b1c20] border-[#2b2f37] text-gray-100" : "bg-white border-slate-200 text-slate-900";
  const panel = isDark ? "bg-[#202228] border-[#2b2f37]" : "bg-white border-slate-200";
  const muted = isDark ? "text-[#b7bcc6]" : "text-slate-500";
  const subtle = isDark ? "text-[#8f96a3]" : "text-slate-400";
  const divider = isDark ? "border-[#2b2f37]" : "border-slate-200";
  const productivity = useMemo(() => {
    const grouped = new Map();
    (models || []).forEach((row) => {
      const title = `${row.ModelTitle || row.model_title || 'AI Agent'}`.trim() || 'AI Agent';
      const current = grouped.get(title) || 0;
      grouped.set(title, current + (Number(row.Count) || 0));
    });
    return Array.from(grouped.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [models]);

  const filteredModels = useMemo(() => {
    if (!selectedAgent) return models || [];
    return (models || []).filter((row) => {
      const title = `${row.ModelTitle || row.model_title || 'AI Agent'}`.trim() || 'AI Agent';
      return title === selectedAgent;
    });
  }, [models, selectedAgent]);

  const totals = useMemo(() => {
    const totalCount = filteredModels.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
    const totalAmount = filteredModels.reduce((sum, row) => sum + (Number(row.Amount) || 0), 0);
    const avgPerHour = totalCount > 0 ? Math.max(1, Math.round(totalCount / 24)) : 0;
    const accuracy = clamp(60 + (totalCount % 36), 60, 95);
    return { totalCount, totalAmount, avgPerHour, accuracy };
  }, [filteredModels]);

  const categoryRows = useMemo(() => {
    const categoryMap = new Map();
    filteredModels.forEach((row) => {
      const category = row.Category || row.Group || "Uncategorized";
      const current = categoryMap.get(category) || { count: 0, amount: 0 };
      categoryMap.set(category, {
        count: current.count + (Number(row.Count) || 0),
        amount: current.amount + (Number(row.Amount) || 0),
      });
    });
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([category, data], index) => {
        const avgBalance = data.count > 0 ? Math.round(data.amount / data.count) : 0;
        const avgAge = 12 + index * 4;
        return [category, data.count.toLocaleString("en-US"), `$${Math.round(data.amount).toLocaleString("en-US")}`, `$${avgBalance.toLocaleString("en-US")}`, `${avgAge}`];
      });
  }, [filteredModels]);

  const recoveryBars = useMemo(() => {
    const base = totals.totalAmount || 0;
    if (!base) return [40, 64, 52, 78, 60, 90, 72];
    const seed = Math.max(1, Math.round(base / 10000));
    return Array.from({ length: 7 }, (_, idx) => clamp(40 + ((seed + idx * 7) % 60), 35, 95));
  }, [totals.totalAmount]);

  const remainingActions = useMemo(() => {
    return categoryRows.slice(0, 4).map((row) => [row[0], row[1]]);
  }, [categoryRows]);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 ${surface}`}
      style={{ fontFamily: '"Space Grotesk", "IBM Plex Sans", ui-sans-serif, system-ui' }}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold">Client Dashboard</h2>
        </div>
        <div className={`text-xs ${subtle}`}>
          {selectedAgent ? `Filtered: ${selectedAgent}` : "All agents"}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className={`rounded-xl border p-4 ${panel}`}>
          <div className="text-sm font-semibold">User Productivity (Daily)</div>
          <div className={`mt-2 text-xs ${subtle}`}>Agents and output score</div>
          <div className="mt-4 space-y-3">
            {productivity.length === 0 ? (
              <div className={`text-sm ${muted}`}>No AI agents available.</div>
            ) : (
              productivity.map(([name, value]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelectAgent?.(selectedAgent === name ? null : name)}
                  className={`w-full flex items-center justify-between text-sm rounded-lg px-2 py-1 transition ${
                    selectedAgent === name
                      ? (isDark ? "bg-white/10 text-white" : "bg-slate-900 text-white")
                      : (isDark ? "hover:bg-white/5" : "hover:bg-slate-100")
                  }`}
                >
                  <span className={selectedAgent === name ? "text-white" : muted}>{name}</span>
                  <span className={`font-semibold ${selectedAgent === name ? "text-white" : "text-gray-200"}`}>{value}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Current Burn Rate</div>
            <div className="mt-6 rounded-lg border border-[#2b2f37] bg-black/40 p-6 text-center">
              <div className="text-5xl font-semibold">{totals.avgPerHour}</div>
              <div className={`mt-2 text-xs ${subtle}`}>Average claims per hour</div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Remaining, AR balance, averages</div>
            <div className={`mt-4 hidden sm:grid sm:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_0.6fr] text-[11px] uppercase tracking-[0.12em] ${subtle}`}>
              <div>Category</div>
              <div className="text-right">Remaining</div>
              <div className="text-right">AR Balance</div>
              <div className="text-right">Avg AR Balance</div>
              <div className="text-right">Avg Age</div>
            </div>
            <div className={`mt-2 border-t ${divider}`} />
            {categoryRows.length === 0 ? (
              <div className={`py-6 text-sm ${muted}`}>No category data for this agent.</div>
            ) : (
              categoryRows.map((row) => (
                <div key={row[0]} className={`py-3 text-sm ${muted}`}>
                  <div className="sm:hidden space-y-1 rounded-lg border border-[#2b2f37] bg-black/20 p-3">
                    <div className="text-gray-200 font-semibold truncate" title={row[0]}>{row[0]}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={subtle}>Remaining</span>
                      <span className="tabular-nums">{row[1]}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={subtle}>AR Balance</span>
                      <span className="tabular-nums">{row[2]}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={subtle}>Avg AR Balance</span>
                      <span className="tabular-nums">{row[3]}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={subtle}>Avg Age</span>
                      <span className="tabular-nums">{row[4]}</span>
                    </div>
                  </div>
                  <div className="hidden sm:grid sm:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_0.6fr]">
                    {row.map((cell, i) => (
                      <div
                        key={`${row[0]}-${i}`}
                        className={i === 0 ? "text-gray-200 truncate pr-2" : "text-right tabular-nums"}
                        title={i === 0 ? row[0] : undefined}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:col-span-2">
          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Inventory Accuracy</div>
            <div className="mt-4 h-32 rounded-lg border border-[#2b2f37] bg-black/30 p-4">
              <div className="text-xs uppercase text-[#7b808c]">Accuracy trend</div>
              <div className="mt-4 h-2 w-full rounded-full bg-[#2a2d33]">
                <div className="h-2 rounded-full bg-[#9aa0ab]" style={{ width: `${totals.accuracy}%` }} />
              </div>
              <div className={`mt-3 text-2xl font-semibold ${muted}`}>{totals.accuracy}%</div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Recovery $ Month to Date (MTD)</div>
            <div className="mt-4 h-32 rounded-lg border border-[#2b2f37] bg-black/30 p-4">
              <div className="flex items-end justify-between gap-1 sm:gap-2">
                {recoveryBars.map((h, idx) => (
                  <div key={idx} className="flex w-full flex-col items-center">
                    <div className="w-full rounded-md bg-[#858b95]" style={{ height: `${h}px` }} />
                    <span className={`mt-1 text-[10px] ${subtle}`}>{`W${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">${`${Math.round(totals.totalAmount / 1_000_000 * 10) / 10}`}M Outstanding AR Balance</div>
            <div className="mt-6 text-3xl font-semibold">{`${Math.round(totals.totalAmount / 1_000_000 * 10) / 10}`}M</div>
            <div className={`mt-2 text-xs ${subtle}`}>Balance across all open claims</div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-[#2a2d33]">
              <div className="h-1.5 rounded-full bg-[#9aa0ab]" style={{ width: `${clamp(Math.round((totals.totalAmount % 1_000_000) / 10_000), 20, 90)}%` }} />
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${panel}`}>
            <div className="text-sm font-semibold">Remaining Actions</div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {remainingActions.length === 0 ? (
                <div className={`text-sm ${muted}`}>No actions available.</div>
              ) : (
                remainingActions.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#2b2f37] bg-black/30 p-3">
                    <div className={`text-xs ${subtle}`}>{label}</div>
                    <div className="mt-1 text-xl font-semibold">{value}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
