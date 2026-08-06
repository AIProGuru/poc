/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { MODULE_CATEGORY_MAP } from "../../../utils/moduleCatalog";
import AgentAvatar from "./AgentAvatar";

const PAYMENT_POSTING_CATEGORIES = new Set(
  MODULE_CATEGORY_MAP["Payment Posting"].map((c) => c.toLowerCase())
);

const isPaymentPostingCategory = (category) => {
  const norm = `${category || ""}`.trim().toLowerCase();
  if (norm === "payment posting") return true;
  return PAYMENT_POSTING_CATEGORIES.has(norm);
};

const MOCK_CATEGORIES = [
  { category: "Coordination of Benefits", inventory: 1261, arBalance: 580070, pct: 46, barPct: 100 },
  { category: "Timely Filing", inventory: 392, arBalance: 180000, pct: 14, barPct: 62 },
  { category: "Documentation", inventory: 240, arBalance: 137931, pct: 11, barPct: 38 },
  { category: "Medical Necessity", inventory: 174, arBalance: 100000, pct: 8, barPct: 28 },
  { category: "Authorization", inventory: 110, arBalance: 32925, pct: 3, barPct: 18 },
  { category: "Contractual Adj", inventory: 420, arBalance: 150000, pct: 12, barPct: 55 },
  { category: "Payment", inventory: 180, arBalance: 72999, pct: 6, barPct: 30 },
];

const formatCurrency = (value) =>
  `$${Math.round(Number(value || 0)).toLocaleString("en-US")}`;

const Trend = ({ value, label, positiveIsGood = true }) => {
  const up = value.startsWith("▲");
  const good = positiveIsGood ? up : !up;
  const color = good ? "text-emerald-600" : "text-rose-500";
  return (
    <p className={`text-xs font-medium ${color}`}>
      {value} <span className="text-slate-400 font-normal">{label}</span>
    </p>
  );
};

const MetricCard = ({ title, value, subtitle, trend, trendLabel, trendPositiveIsGood = true, highlight, children, isDark }) => (
  <div
    className={`rounded-xl border p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 min-h-[120px] min-w-0 ${
      highlight
        ? "border-emerald-400 ring-1 ring-emerald-400/30"
        : isDark
          ? "bg-[var(--helio-surface)] border-[var(--helio-border)]"
          : "bg-white border-slate-200 shadow-sm"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <p className={`text-xs sm:text-sm font-medium leading-snug ${isDark ? "text-gray-300" : "text-slate-600"}`}>{title}</p>
      {children}
    </div>
    <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    {subtitle ? (
      <p className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>{subtitle}</p>
    ) : null}
    {trend ? <Trend value={trend} label={trendLabel} positiveIsGood={trendPositiveIsGood} /> : null}
  </div>
);

const SectionCard = ({ title, subtitle, children, footer, isDark, className = "" }) => (
  <div
    className={`rounded-xl border p-4 sm:p-5 flex flex-col ${
      isDark
        ? "bg-[var(--helio-surface)] border-[var(--helio-border)] text-gray-100"
        : "bg-white border-slate-200 text-slate-900 shadow-sm"
    } ${className}`}
  >
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle ? (
        <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-slate-500"}`}>{subtitle}</p>
      ) : null}
    </div>
    <div className="flex-1 min-h-0">{children}</div>
    {footer ? (
      <button
        type="button"
        className={`mt-4 text-sm font-medium text-left ${
          isDark ? "text-sky-400 hover:text-sky-300" : "text-blue-600 hover:text-blue-700"
        }`}
      >
        {footer}
      </button>
    ) : null}
  </div>
);

const RecoveryTrendChart = ({ isDark }) => {
  const points = [
    { x: 0, actual: 120, target: 100 },
    { x: 1, actual: 155, target: 130 },
    { x: 2, actual: 140, target: 160 },
    { x: 3, actual: 210, target: 190 },
    { x: 4, actual: 285, target: 250 },
  ];
  const w = 320;
  const h = 140;
  const pad = { t: 12, r: 12, b: 24, l: 36 };
  const maxY = 350;
  const toX = (i) => pad.l + (i / (points.length - 1)) * (w - pad.l - pad.r);
  const toY = (v) => pad.t + (1 - v / maxY) * (h - pad.t - pad.b);
  const actualPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.actual)}`).join(" ");
  const targetPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.target)}`).join(" ");
  const gridColor = isDark ? "#2d3348" : "#e2e8f0";
  const labelColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[280px]" aria-hidden>
        {[0, 100, 200, 300].map((tick) => (
          <g key={tick}>
            <line x1={pad.l} x2={w - pad.r} y1={toY(tick)} y2={toY(tick)} stroke={gridColor} strokeWidth="1" />
            <text x={4} y={toY(tick) + 4} fill={labelColor} fontSize="9">
              ${tick}K
            </text>
          </g>
        ))}
        <path d={targetPath} fill="none" stroke={isDark ? "#64748b" : "#94a3b8"} strokeWidth="2" strokeDasharray="5 4" />
        <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
        {points.map((p, i) => (
          <circle key={p.x} cx={toX(p.x)} cy={toY(p.actual)} r="4" fill="#10b981" />
        ))}
        {points.map((p, i) => (
          <text key={`w-${p.x}`} x={toX(p.x)} y={h - 4} textAnchor="middle" fill={labelColor} fontSize="10">
            W{i + 1}
          </text>
        ))}
      </svg>
      <div className={`flex gap-4 mt-2 text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-emerald-500 rounded" /> Actual Recovery
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-slate-400" /> Target
        </span>
      </div>
    </div>
  );
};

const Sparkline = () => (
  <svg viewBox="0 0 80 28" className="w-20 h-7 text-emerald-500" aria-hidden>
    <polyline
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      points="0,22 12,18 24,20 36,12 48,14 60,8 72,10 80,4"
    />
  </svg>
);

const DashboardScreen = ({ isDark }) => {
  const modelsState = useSelector((state) => state.app.models);
  const models = useMemo(() => modelsState ?? [], [modelsState]);

  const productivity = useMemo(() => {
    const grouped = new Map();
    (models || []).forEach((row) => {
      const title = `${row.ModelTitle || row.model_title || "AI Agent"}`.trim() || "AI Agent";
      grouped.set(title, (grouped.get(title) || 0) + (Number(row.Count) || 0));
    });
    const rows = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const efficiencies = [99, 78, 71, 67, 62, 58];
    return rows.map(([name, claims], i) => ({
      name,
      claims,
      efficiency: efficiencies[i] ?? 60,
    }));
  }, [models]);

  const categoryRows = useMemo(() => {
    const categoryMap = new Map();
    (models || []).forEach((row) => {
      const category = row.Category || row.Group || "Uncategorized";
      const current = categoryMap.get(category) || { count: 0, amount: 0 };
      categoryMap.set(category, {
        count: current.count + (Number(row.Count) || 0),
        amount: current.amount + (Number(row.Amount) || 0),
      });
    });
    const rows = Array.from(categoryMap.entries()).sort((a, b) => b[1].amount - a[1].amount);
    const totalAmount = rows.reduce((s, [, d]) => s + d.amount, 0) || 1;
    const maxCount = Math.max(...rows.map(([, d]) => d.count), 1);
    return rows.map(([category, data]) => ({
      category,
      inventory: data.count,
      arBalance: data.amount,
      pct: Math.round((data.amount / totalAmount) * 100),
      barPct: Math.round((data.count / maxCount) * 100),
    }));
  }, [models]);

  const displayCategories = categoryRows.length > 0 ? categoryRows : MOCK_CATEGORIES;

  const revenueSplit = useMemo(() => {
    const recoverableRows = displayCategories.filter((row) => !isPaymentPostingCategory(row.category));
    const nonRecoverableRows = displayCategories.filter((row) => isPaymentPostingCategory(row.category));
    const recoverableRevenue = recoverableRows.reduce((sum, row) => sum + row.arBalance, 0);
    const nonRecoverableRevenue = nonRecoverableRows.reduce((sum, row) => sum + row.arBalance, 0);
    const recoverableClaims = recoverableRows.reduce((sum, row) => sum + row.inventory, 0);
    const nonRecoverableClaims = nonRecoverableRows.reduce((sum, row) => sum + row.inventory, 0);
    const arBalance = recoverableRevenue + nonRecoverableRevenue;
    const inventory = displayCategories.reduce((sum, row) => sum + row.inventory, 0);
    return {
      arBalance,
      inventory,
      recoverableRevenue,
      nonRecoverableRevenue,
      recoverableClaims,
      nonRecoverableClaims,
    };
  }, [displayCategories]);

  const { arBalance, inventory, recoverableRevenue, nonRecoverableRevenue, recoverableClaims, nonRecoverableClaims } =
    revenueSplit;
  const recoveryMtd = Math.round(recoverableRevenue * 0.62) || 287450;

  const priorities = [
    { rank: 1, amount: 72443, label: "BCBS - Coordination of Benefits", priority: "High" },
    { rank: 2, amount: 58920, label: "Aetna - Timely Filing", priority: "High" },
    { rank: 3, amount: 42150, label: "UHC - Documentation", priority: "Medium" },
  ];

  const aiAgents = [
    { name: "Denial Reviewer Agent", status: "Online", metric: "2,177 Claims Reviewed", rate: "94% Success Rate" },
    { name: "Underpayment Agent", status: "Online", metric: "412 Claims Corrected", rate: "89% Success Rate" },
    { name: "Appeals Agent", status: "Idle", metric: "128 Appeals Filed", rate: "76% Success Rate" },
    { name: "Eligibility Agent", status: "Online", metric: "891 Eligibility Checks", rate: "97% Success Rate" },
  ];

  const alerts = [
    { icon: "⏱", text: "43 Claims > 90 days", tone: "text-rose-500" },
    { icon: "📋", text: "112 COB denials need review", tone: "text-amber-500" },
    { icon: "📅", text: "17 Appeals overdue", tone: "text-rose-500" },
  ];

  const productivityRows =
    productivity.length > 0
      ? productivity
      : [
          { name: "David", claims: 142, efficiency: 99 },
          { name: "Carrie", claims: 118, efficiency: 78 },
          { name: "Ivan", claims: 96, efficiency: 71 },
          { name: "Sarah", claims: 88, efficiency: 67 },
          { name: "Mike", claims: 74, efficiency: 62 },
        ];

  const maxClaims = Math.max(...productivityRows.map((r) => r.claims), 1);
  const barColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];

  const muted = isDark ? "text-gray-400" : "text-slate-500";
  const rowBorder = isDark ? "border-[var(--helio-border)]" : "border-slate-100";

  return (
    <div className={`space-y-6 ${isDark ? "text-gray-100" : "text-slate-900"}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Client Dashboard</h2>
        <p className={`mt-1 text-sm ${muted}`}>Real-time overview of your revenue cycle performance</p>
      </div>

      {/* KPI metrics row — one line on wide screens, wraps on narrower viewports */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))]">
        <MetricCard
          isDark={isDark}
          title="AR Balance"
          value={formatCurrency(arBalance)}
          subtitle="Across all open claims"
        >
          <Sparkline />
        </MetricCard>
        <MetricCard
          isDark={isDark}
          title="Recovery MTD"
          value={formatCurrency(recoveryMtd)}
          trend="▲ 18.6%"
          trendLabel="vs Apr 14 – Apr 20"
        />
        <MetricCard
          isDark={isDark}
          title="Recoverable Revenue"
          value={formatCurrency(recoverableRevenue)}
          subtitle={`${recoverableClaims.toLocaleString("en-US")} claims`}
          trend="▲ 14.3%"
          trendLabel="vs last week"
          highlight
        />
        <MetricCard
          isDark={isDark}
          title="Non-Recoverable Revenue"
          value={formatCurrency(nonRecoverableRevenue)}
          subtitle={`${nonRecoverableClaims.toLocaleString("en-US")} claims · Payment Posting`}
        />
        <MetricCard
          isDark={isDark}
          title="Inventory Burn Rate"
          value="55 Days"
          subtitle="Target: 60 Days"
          trend="▼ 9 Days"
          trendLabel="vs last week"
          trendPositiveIsGood={false}
        />
        <MetricCard
          isDark={isDark}
          title="Inventory"
          value={inventory.toLocaleString("en-US")}
          subtitle="Total claims"
        />
        <MetricCard
          isDark={isDark}
          title="Accuracy"
          value="98%"
          trend="▲ 5%"
          trendLabel="vs last week"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          isDark={isDark}
          title="Outstanding AR By Category"
          footer="View all categories →"
        >
          <div className={`grid grid-cols-[1.4fr_1fr_0.9fr_0.6fr] gap-2 text-[11px] uppercase tracking-wide ${muted} pb-2 border-b ${rowBorder}`}>
            <span>Category</span>
            <span>Inventory</span>
            <span className="text-right">AR Balance</span>
            <span className="text-right">% Total</span>
          </div>
          <div className="divide-y divide-[var(--helio-border)]">
            {displayCategories.map((row) => (
              <div
                key={row.category}
                className={`grid grid-cols-[1.4fr_1fr_0.9fr_0.6fr] gap-2 items-center py-3 text-sm ${isDark ? "border-[var(--helio-border)]" : "border-slate-100"}`}
              >
                <span className={`truncate font-medium ${isDark ? "text-gray-200" : "text-slate-800"}`} title={row.category}>
                  {row.category}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDark ? "bg-[var(--helio-surface-muted)]" : "bg-slate-100"}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500"
                      style={{ width: `${row.barPct}%` }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums shrink-0 ${muted}`}>{row.inventory.toLocaleString()}</span>
                </div>
                <span className="text-right tabular-nums">{formatCurrency(row.arBalance)}</span>
                <span className="text-right tabular-nums">{row.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard isDark={isDark} title="Recovery Trend MTD" footer="View recovery details →">
          <RecoveryTrendChart isDark={isDark} />
        </SectionCard>

        <SectionCard isDark={isDark} title="User Productivity Today" footer="View team performance →">
          <div className={`grid grid-cols-[1fr_1.2fr_0.7fr] gap-2 text-[11px] uppercase tracking-wide ${muted} pb-2 border-b ${rowBorder}`}>
            <span>Agent</span>
            <span>Claims Completed</span>
            <span className="text-right">Efficiency</span>
          </div>
          <div className="space-y-3 mt-1">
            {productivityRows.map((row, i) => (
              <div key={row.name} className="grid grid-cols-[1fr_1.2fr_0.7fr] gap-2 items-center text-sm">
                <span className="flex items-center gap-2 min-w-0">
                  <AgentAvatar name={row.name} size={28} />
                  <span className={`truncate ${isDark ? "text-gray-200" : "text-slate-800"}`}>{row.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDark ? "bg-[var(--helio-surface-muted)]" : "bg-slate-100"}`}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((row.claims / maxClaims) * 100)}%`,
                        backgroundColor: barColors[i % barColors.length],
                      }}
                    />
                  </div>
                  <span className={`text-xs tabular-nums w-8 text-right ${muted}`}>{row.claims}</span>
                </div>
                <span className="text-right font-semibold tabular-nums">{row.efficiency}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard isDark={isDark} title="Today's Priorities" footer="View all priorities →">
          <div className="space-y-3">
            {priorities.map((item) => (
              <div
                key={item.rank}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                  isDark ? "border-[var(--helio-border)] bg-[var(--helio-surface-muted)]" : "border-slate-100 bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDark ? "bg-[var(--helio-border-strong)] text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-rose-500 tabular-nums">{formatCurrency(item.amount)}</p>
                  <p className={`text-xs truncate ${muted}`}>{item.label}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    item.priority === "High"
                      ? "bg-rose-500/15 text-rose-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard isDark={isDark} title="AI Agent Status" footer="View agent details →">
          <div className="space-y-3">
            {aiAgents.map((agent) => (
              <div
                key={agent.name}
                className={`rounded-lg border px-3 py-3 ${isDark ? "border-[var(--helio-border)] bg-[var(--helio-surface-muted)]" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-slate-800"}`}>{agent.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      agent.status === "Online"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : isDark
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className={`mt-1 text-xs ${muted}`}>{agent.metric}</p>
                <p className={`text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{agent.rate}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard isDark={isDark} title="Attention Needed" footer="View all alerts →">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.text}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 ${
                  isDark ? "border-[var(--helio-border)] bg-[var(--helio-surface-muted)]" : "border-slate-100 bg-slate-50"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {alert.icon}
                </span>
                <p className={`text-sm font-medium ${alert.tone}`}>{alert.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardScreen;
