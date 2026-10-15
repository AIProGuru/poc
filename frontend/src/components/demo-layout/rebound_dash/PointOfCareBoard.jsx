import React, { useEffect, useMemo, useState } from "react";

const MODULES = {
  "charge-capture": {
    title: "Charge capture",
    subtitle: "Final check before sending to coding",
    reviewLabel: "To review",
    doneLabel: "Sent to coding",
    actionLabel: "Send to coding",
    codeLabel: "Charge",
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;

const localDate = (daysAgo) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const parseLocalDate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatServiceDate = (iso) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(parseLocalDate(iso));

const INITIAL_ENCOUNTERS = [
  { id: "cc-1", moduleId: "charge-capture", status: "review", serviceDate: localDate(1), name: "R. Alvarez", diagnosisCode: "M54.16", diagnosis: "Radiculopathy, lumbar region", facility: "Mayo Clinic", code: "62323", provider: "Dr. Patel", visit: "Office visit" },
  { id: "cc-2", moduleId: "charge-capture", status: "review", serviceDate: localDate(1), name: "M. Okafor", diagnosisCode: "M17.11", diagnosis: "Osteoarthritis of right knee", facility: "Mayo Clinic", code: "27447-RT", provider: "Dr. Patel", visit: "Surgery" },
  { id: "cc-3", moduleId: "charge-capture", status: "review", serviceDate: localDate(1), name: "T. Nguyen", diagnosisCode: "M48.061", diagnosis: "Lumbar spinal stenosis", facility: "Mayo Clinic", code: "63047", provider: "Dr. Shah", visit: "Surgery" },
  { id: "cc-4", moduleId: "charge-capture", status: "review", serviceDate: localDate(1), name: "L. Brandt", diagnosisCode: "M75.121", diagnosis: "Rotator cuff tear, right", facility: "Mayo Clinic", code: "29827-RT", provider: "Dr. Shah", visit: "Surgery" },
  { id: "cc-5", moduleId: "charge-capture", status: "review", serviceDate: localDate(0), name: "A. Brooks", diagnosisCode: "M25.561", diagnosis: "Pain in right knee", facility: "Mayo Clinic", code: "20610-RT", provider: "Dr. Patel", visit: "Office visit" },
  { id: "cc-6", moduleId: "charge-capture", status: "review", serviceDate: localDate(3), name: "J. Morales", diagnosisCode: "M54.2", diagnosis: "Cervicalgia", facility: "Mayo Clinic", code: "99214", provider: "Dr. Shah", visit: "Office visit" },
  { id: "cc-7", moduleId: "charge-capture", status: "done", serviceDate: localDate(2), name: "S. Kim", diagnosisCode: "M16.11", diagnosis: "Osteoarthritis of right hip", facility: "Mayo Clinic", code: "27130-RT", provider: "Dr. Patel", visit: "Surgery" },
  { id: "cc-8", moduleId: "charge-capture", status: "done", serviceDate: localDate(8), name: "P. Singh", diagnosisCode: "M47.816", diagnosis: "Spondylosis, lumbar region", facility: "Mayo Clinic", code: "63030", provider: "Dr. Shah", visit: "Surgery" },
  { id: "cc-9", moduleId: "charge-capture", status: "done", serviceDate: localDate(14), name: "C. Walsh", diagnosisCode: "S83.511A", diagnosis: "Sprain of ACL, right knee", facility: "Mayo Clinic", code: "29888-RT", provider: "Dr. Patel", visit: "Surgery" },
  { id: "cc-10", moduleId: "charge-capture", status: "review", serviceDate: localDate(12), name: "H. Diaz", diagnosisCode: "M75.102", diagnosis: "Rotator cuff tear, left", facility: "Mayo Clinic", code: "29827-LT", provider: "Dr. Shah", visit: "Surgery" },
  { id: "cc-11", moduleId: "charge-capture", status: "review", serviceDate: localDate(20), name: "E. Novak", diagnosisCode: "M51.26", diagnosis: "Other intervertebral disc displacement", facility: "Mayo Clinic", code: "63047", provider: "Dr. Patel", visit: "Surgery" },
];

const buildColumns = (encounters, oldestFirst) => {
  const today = startOfToday();
  const cutoff = new Date(today.getTime() - 5 * DAY_MS);
  const recent = new Map();
  const older = [];

  encounters.forEach((encounter) => {
    const serviceDay = parseLocalDate(encounter.serviceDate);
    if (serviceDay < cutoff) {
      older.push(encounter);
      return;
    }
    const existing = recent.get(encounter.serviceDate) || [];
    existing.push(encounter);
    recent.set(encounter.serviceDate, existing);
  });

  const recentColumns = [...recent.entries()]
    .sort((a, b) => (oldestFirst ? a[0] > b[0] : a[0] < b[0]) ? 1 : -1)
    .map(([serviceDate, items]) => ({
      id: serviceDate,
      title: formatServiceDate(serviceDate),
      older: false,
      items,
    }));

  if (older.length === 0) return recentColumns;

  older.sort((a, b) => (a.serviceDate < b.serviceDate ? -1 : a.serviceDate > b.serviceDate ? 1 : a.name.localeCompare(b.name)));

  const olderColumn = {
    id: "older",
    title: "Older than 5 days",
    older: true,
    items: older,
  };

  return oldestFirst ? [olderColumn, ...recentColumns] : [...recentColumns, olderColumn];
};

export default function PointOfCareBoard({ navId, isDark }) {
  const module = MODULES[navId] || MODULES["charge-capture"];
  const [encounters, setEncounters] = useState(INITIAL_ENCOUNTERS);
  const [tab, setTab] = useState("review");
  const [selectedId, setSelectedId] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState(null);

  useEffect(() => {
    setTab("review");
    setSelectedId(null);
    setActiveColumnId(null);
  }, [navId]);

  const moduleEncounters = useMemo(
    () => encounters.filter((encounter) => encounter.moduleId === navId),
    [encounters, navId]
  );
  const reviewCount = moduleEncounters.filter((encounter) => encounter.status === "review").length;
  const doneCount = moduleEncounters.length - reviewCount;
  const visible = moduleEncounters.filter((encounter) => encounter.status === tab);
  const oldestFirst = navId === "charge-capture";
  const columns = useMemo(() => buildColumns(visible, oldestFirst), [visible, oldestFirst]);
  const columnKey = columns.map((column) => column.id).join("|");
  const activeColumn = columns.find((column) => column.id === activeColumnId) || columns[0] || null;
  const selected = moduleEncounters.find((encounter) => encounter.id === selectedId) || null;

  useEffect(() => {
    setActiveColumnId(columns[0]?.id ?? null);
  }, [columnKey, tab, navId]);

  const openPatient = (encounter) => setSelectedId(encounter.id);

  const complete = (encounter) => {
    setEncounters((current) =>
      current.map((item) => (item.id === encounter.id ? { ...item, status: "done" } : item))
    );
    setTab("done");
    setSelectedId(null);
  };

  if (selected) {
    return (
      <PatientDetail
        encounter={selected}
        module={module}
        isDark={isDark}
        onBack={() => setSelectedId(null)}
        onComplete={() => complete(selected)}
      />
    );
  }

  return (
    <section className="flex min-h-0 flex-col gap-4 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-950"}`}>
            {module.title}
          </h2>
          <p className={`mt-1 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {module.subtitle}
          </p>
        </div>
        <div className={`inline-flex w-full rounded-full p-1 sm:w-auto ${isDark ? "bg-[#111F35]" : "bg-slate-200/80"}`}>
          <TabButton
            active={tab === "review"}
            isDark={isDark}
            label={module.reviewLabel}
            count={reviewCount}
            onClick={() => setTab("review")}
          />
          <TabButton
            active={tab === "done"}
            isDark={isDark}
            label={module.doneLabel}
            count={doneCount}
            onClick={() => setTab("done")}
          />
        </div>
      </div>

      {columns.length === 0 ? (
        <p className={`rounded-2xl px-4 py-10 text-center text-sm ${isDark ? "bg-[#111F35] text-slate-400" : "bg-white text-slate-500"}`}>
          No patients {tab === "review" ? "to review" : `in ${module.doneLabel.toLowerCase()}`}.
        </p>
      ) : (
        <div className="flex min-h-0 flex-col gap-4">
          {oldestFirst ? (
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Dates run oldest to newest.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dates of service">
            {columns.map((column) => {
              const selectedDate = activeColumn?.id === column.id;
              return (
                <button
                  key={column.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedDate}
                  onClick={() => setActiveColumnId(column.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    selectedDate
                      ? "bg-[#0f9f8f] text-white"
                      : isDark
                        ? "bg-[#111F35] text-slate-300"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {column.title}
                  <span className={selectedDate ? "text-white/80" : isDark ? "text-slate-500" : "text-slate-400"}>
                    {" "}· {column.items.length}
                  </span>
                </button>
              );
            })}
          </div>
          {activeColumn?.older ? (
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Patients in this group are listed oldest to newest.
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeColumn?.items.map((encounter) => (
              <PatientCard
                key={encounter.id}
                encounter={encounter}
                isDark={isDark}
                showDate={Boolean(activeColumn?.older)}
                onOpen={() => openPatient(encounter)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TabButton({ active, isDark, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none ${
        active
          ? "bg-[#0f9f8f] text-white"
          : isDark
            ? "text-slate-300 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
      <span className={active ? "text-white/80" : isDark ? "text-slate-500" : "text-slate-400"}> · {count}</span>
    </button>
  );
}

function PatientCard({ encounter, isDark, showDate, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-sm transition ${
        isDark
          ? "border-white/10 bg-[#15263C] hover:border-white/20"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className={`block text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
          {encounter.name}
        </span>
        <span className="mt-1 block text-sm">
          <span className="font-semibold text-[#0f9f8f]">{encounter.diagnosisCode}</span>{" "}
          <span className={isDark ? "text-slate-300" : "text-slate-600"}>{encounter.diagnosis}</span>
        </span>
        <span className={`mt-2 flex items-center gap-1.5 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <BuildingIcon />
          {encounter.facility}
        </span>
        {showDate ? (
          <span className={`mt-1 block text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {formatServiceDate(encounter.serviceDate)}
          </span>
        ) : null}
        <span className={`mt-2 inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${
          isDark ? "bg-[#0D1829] text-slate-200" : "bg-slate-100 text-slate-700"
        }`}
        >
          {encounter.code}
        </span>
      </span>
      <ChevronIcon className={isDark ? "text-slate-500" : "text-slate-400"} />
    </button>
  );
}

function PatientDetail({ encounter, module, isDark, onBack, onComplete }) {
  const rows = [
    ["Date of service", formatServiceDate(encounter.serviceDate)],
    ["Diagnosis", `${encounter.diagnosisCode} ${encounter.diagnosis}`],
    ["Facility", encounter.facility],
    [module.codeLabel || "Code", encounter.code],
    ["Provider", encounter.provider],
    ["Visit", encounter.visit],
    ["Status", encounter.status === "review" ? module.reviewLabel : module.doneLabel],
  ];

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
          isDark ? "bg-[#111F35] text-white hover:bg-[#1C3050]" : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
        }`}
      >
        <ChevronIcon className="rotate-180" />
        Back to list
      </button>
      <div className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "border-white/10 bg-[#15263C]" : "border-slate-200 bg-white"}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {formatServiceDate(encounter.serviceDate)}
        </p>
        <h2 className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
          {encounter.name}
        </h2>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-[#0f9f8f]">{encounter.diagnosisCode}</span>{" "}
          <span className={isDark ? "text-slate-300" : "text-slate-600"}>{encounter.diagnosis}</span>
        </p>
        <dl className="mt-5 divide-y divide-slate-200/80 dark:divide-white/10">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
              <dt className={isDark ? "text-slate-400" : "text-slate-500"}>{label}</dt>
              <dd className={`text-right font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{value}</dd>
            </div>
          ))}
        </dl>
        {encounter.status === "review" ? (
          <button
            type="button"
            onClick={onComplete}
            className="mt-4 rounded-full bg-[#0f9f8f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0c8a7c]"
          >
            {module.actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 13.5h11M3.5 13.5V4.2L8 2.5l4.5 1.7v9.3M6.2 13.5v-3h3.6v3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
