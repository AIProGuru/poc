import React, { useMemo, useState } from "react";

const localDate = (daysAgo) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const formatServiceDate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const INITIAL_ENCOUNTERS = [
  {
    id: "ci-1",
    name: "John Smith",
    mrn: "12345678",
    serviceDate: localDate(2),
    visit: "Office visit",
    status: "review",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "BCBS FL",
    plan: "Commercial",
    diagnosisCode: "M51.16",
    diagnosis: "Intervertebral disc degeneration, lumbar region",
    procedureCode: "63047",
    note: "Patient presents with ongoing low back pain radiating to the right lower extremity. Reports minimal improvement with physical therapy and NSAIDs. Physical exam notable for decreased range of motion and positive straight leg raise on the right.",
    addendum: "Consider documenting specific neurologic findings, results of recent imaging, and the duration and failure of conservative treatment.",
    findings: [
      {
        id: "f1",
        type: "Documentation gap",
        priority: "High",
        summary: "The note documents lumbar pain and prior conservative treatment, but not the neurologic findings, imaging, or duration needed to support 63047.",
        why: "The payer may deny the service for lack of medical necessity.",
      },
      {
        id: "f2",
        type: "Medical necessity",
        priority: "Medium",
        summary: "Frequency and duration of prior conservative treatment are not stated.",
        why: "BCBS FL may require that detail before this procedure is considered necessary.",
      },
      {
        id: "f3",
        type: "Coding discrepancy",
        priority: "Medium",
        summary: "Procedure 63047 may not be fully supported by the symptoms documented in this office visit.",
        why: "A mismatch can lead to an underpayment or a coding denial.",
      },
    ],
  },
  {
    id: "ci-2",
    name: "Sarah Johnson",
    mrn: "98765432",
    serviceDate: localDate(3),
    visit: "Follow up",
    status: "clear",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "BCBS FL",
    plan: "Commercial",
    diagnosisCode: "M54.50",
    diagnosis: "Low back pain, unspecified",
    procedureCode: "99213",
    note: "Follow-up visit. Pain improved after physical therapy. No procedure planned at this visit.",
    addendum: "",
    findings: [],
  },
  {
    id: "ci-3",
    name: "Robert Williams",
    mrn: "45678901",
    serviceDate: localDate(4),
    visit: "Consult",
    status: "clear",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "Aetna",
    plan: "Commercial",
    diagnosisCode: "M25.561",
    diagnosis: "Pain in right knee",
    procedureCode: "99243",
    note: "Consult for right knee pain. Exam and plan are documented. No surgery recommended.",
    addendum: "",
    findings: [],
  },
  {
    id: "ci-4",
    name: "Emily Davis",
    mrn: "23456789",
    serviceDate: localDate(6),
    visit: "Procedure",
    status: "review",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "BCBS FL",
    plan: "Commercial",
    diagnosisCode: "M48.061",
    diagnosis: "Spinal stenosis, lumbar region",
    procedureCode: "63047",
    note: "Procedure note lists lumbar stenosis. Laterality and the levels treated are not stated.",
    addendum: "Add the side and the spinal levels treated before this procedure note is used for coding.",
    findings: [
      {
        id: "f4",
        type: "Documentation gap",
        priority: "High",
        summary: "The procedure note does not state laterality or the levels treated.",
        why: "Coding cannot confirm 63047 without the level and side.",
      },
    ],
  },
  {
    id: "ci-5",
    name: "Michael Brown",
    mrn: "87654321",
    serviceDate: localDate(7),
    visit: "Office visit",
    status: "clear",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "Medicare",
    plan: "Medicare",
    diagnosisCode: "M17.11",
    diagnosis: "Osteoarthritis of right knee",
    procedureCode: "99214",
    note: "Office visit for right knee osteoarthritis. Conservative treatment and the follow-up plan are documented.",
    addendum: "",
    findings: [],
  },
  {
    id: "ci-6",
    name: "Jessica Miller",
    mrn: "34567890",
    serviceDate: localDate(8),
    visit: "Follow up",
    status: "clear",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "BCBS FL",
    plan: "Commercial",
    diagnosisCode: "M75.101",
    diagnosis: "Unspecified rotator cuff tear, right shoulder",
    procedureCode: "99213",
    note: "Shoulder follow-up. Strength and range of motion are recorded. No procedure is planned.",
    addendum: "",
    findings: [],
  },
  {
    id: "ci-7",
    name: "Christopher Anderson",
    mrn: "90123456",
    serviceDate: localDate(11),
    visit: "Consult",
    status: "review",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "UnitedHealthcare",
    plan: "Commercial",
    diagnosisCode: "M54.16",
    diagnosis: "Radiculopathy, lumbar region",
    procedureCode: "99244",
    note: "Consult documents lumbar radiculopathy. The exam does not record which side is affected.",
    addendum: "Document the side of the radiculopathy and the exam finding that supports it.",
    findings: [
      {
        id: "f5",
        type: "Documentation gap",
        priority: "Medium",
        summary: "Lumbar radiculopathy is listed without laterality.",
        why: "An unspecified side can be returned for a corrected diagnosis code.",
      },
    ],
  },
  {
    id: "ci-8",
    name: "Ashley Thomas",
    mrn: "11223344",
    serviceDate: localDate(12),
    visit: "Office visit",
    status: "clear",
    provider: "Dr. James Carter",
    specialty: "Orthopedics",
    payer: "BCBS FL",
    plan: "Commercial",
    diagnosisCode: "M54.2",
    diagnosis: "Cervicalgia",
    procedureCode: "99213",
    note: "Neck pain visit. History, exam, and a home-exercise plan are documented.",
    addendum: "",
    findings: [],
  },
];

export const clinicalIntelligenceItemCount = INITIAL_ENCOUNTERS.length;

const STEPS = [
  { id: "review", label: "Review" },
  { id: "identify", label: "Identify" },
  { id: "route", label: "Route" },
  { id: "resolve", label: "Resolve" },
];

const stepIndexFor = (encounter) => {
  if (encounter.status === "clear") return 3;
  if (encounter.routed) return 2;
  if (encounter.findings.length > 0) return 1;
  return 0;
};

export default function ClinicalIntelligence({ isDark }) {
  const [encounters, setEncounters] = useState(INITIAL_ENCOUNTERS);
  const [selectedId, setSelectedId] = useState(INITIAL_ENCOUNTERS[0].id);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const selected = encounters.find((item) => item.id === selectedId) || null;
  const visible = useMemo(() => {
    const rows = encounters.filter((item) => {
      if (filter === "review") return item.status === "review";
      if (filter === "clear") return item.status === "clear";
      return true;
    });
    return rows.sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  }, [encounters, filter]);

  const reviewCount = encounters.filter((item) => item.status === "review").length;

  const updateEncounter = (id, changes) => {
    setEncounters((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const sendToClinician = (encounter) => {
    updateEncounter(encounter.id, { routed: true });
    setNotice("Addendum saved on this encounter. It stays in this session and is not sent to an EHR or by email.");
  };

  const markResolved = (encounter) => {
    updateEncounter(encounter.id, { status: "clear" });
    setNotice("Marked clear for this session.");
  };

  const card = isDark ? "border-white/10 bg-[#15263C]" : "border-slate-200 bg-white";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const title = isDark ? "text-white" : "text-slate-950";

  return (
    <section className="flex min-h-0 flex-col gap-4 pb-6">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${title}`}>Clinical Intelligence</h2>
        <p className={`mt-1 max-w-3xl text-sm sm:text-base ${muted}`}>
          Sample review of visit notes before coding. {reviewCount} encounters need review.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className={selected ? "hidden lg:block" : "block"}>
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["review", "Needs review"],
              ["clear", "Clear"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  filter === value
                    ? "bg-[#0f9f8f] text-white"
                    : isDark
                      ? "bg-[#111F35] text-slate-300"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {visible.map((item) => {
              const active = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setNotice("");
                    }}
                    className={`w-full rounded-2xl border px-3 py-3 text-left ${
                      active
                        ? "border-[#0f9f8f] bg-[#0f9f8f]/10"
                        : isDark
                          ? "border-white/10 bg-[#15263C] hover:border-white/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className={`block font-semibold ${title}`}>{item.name}</span>
                        <span className={`mt-0.5 block text-sm ${muted}`}>
                          {formatServiceDate(item.serviceDate)} · {item.visit}
                        </span>
                      </span>
                      <StatusPill status={item.status} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 ? (
            <p className={`rounded-2xl px-4 py-8 text-center text-sm ${isDark ? "bg-[#111F35] text-slate-400" : "bg-white text-slate-500"}`}>
              No encounters in this filter.
            </p>
          ) : null}
        </div>

        {selected ? (
          <EncounterReview
            encounter={selected}
            isDark={isDark}
            notice={notice}
            onBack={() => setSelectedId(null)}
            onSend={() => sendToClinician(selected)}
            onResolve={() => markResolved(selected)}
          />
        ) : (
          <p className={`hidden rounded-2xl border px-4 py-10 text-center text-sm lg:block ${card} ${muted}`}>
            Select an encounter.
          </p>
        )}
      </div>
    </section>
  );
}

function EncounterReview({ encounter, isDark, notice, onBack, onSend, onResolve }) {
  const step = stepIndexFor(encounter);
  const card = isDark ? "border-white/10 bg-[#15263C]" : "border-slate-200 bg-white";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const title = isDark ? "text-white" : "text-slate-950";
  const openFindings = encounter.status === "review" ? encounter.findings : [];

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold lg:hidden ${
          isDark ? "bg-[#111F35] text-white" : "bg-white text-slate-800 ring-1 ring-slate-200"
        }`}
      >
        <span aria-hidden="true">←</span>
        Back to encounters
      </button>

      <div className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className={`text-xl font-bold ${title}`}>{encounter.name}</h3>
            <p className={`mt-1 text-sm ${muted}`}>MRN {encounter.mrn}</p>
          </div>
          <StatusPill status={encounter.status} />
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Fact label="Date of service" value={`${formatServiceDate(encounter.serviceDate)} · ${encounter.visit}`} muted={muted} title={title} />
          <Fact label="Provider" value={`${encounter.provider} · ${encounter.specialty}`} muted={muted} title={title} />
          <Fact label="Payer" value={`${encounter.payer} · ${encounter.plan}`} muted={muted} title={title} />
          <Fact label="Codes" value={`${encounter.diagnosisCode} · ${encounter.procedureCode}`} muted={muted} title={title} />
        </dl>
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((item, index) => {
          const reached = index <= step;
          return (
            <li
              key={item.id}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                reached ? "bg-[#0f9f8f] text-white" : isDark ? "bg-[#111F35] text-slate-400" : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {index + 1}. {item.label}
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
          <h4 className={`text-lg font-bold ${title}`}>
            {openFindings.length > 0 ? `${openFindings.length} open finding${openFindings.length === 1 ? "" : "s"}` : "No open findings"}
          </h4>
          <div className="mt-4 flex flex-col gap-3">
            {openFindings.map((finding) => (
              <article key={finding.id} className={`rounded-xl border p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className={`font-semibold ${title}`}>{finding.type}</h5>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    finding.priority === "High"
                      ? "bg-amber-100 text-amber-800"
                      : isDark
                        ? "bg-white/10 text-slate-200"
                        : "bg-slate-100 text-slate-700"
                  }`}
                  >
                    {finding.priority}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>{finding.summary}</p>
                <p className={`mt-2 text-sm ${muted}`}>Why it matters: {finding.why}</p>
              </article>
            ))}
            {openFindings.length === 0 ? (
              <p className={`text-sm ${muted}`}>This sample note has no open documentation or coding gap.</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
            <h4 className={`text-lg font-bold ${title}`}>Addendum suggestion</h4>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {encounter.addendum || "No addendum is suggested for this encounter."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSend}
                disabled={encounter.status === "clear" || encounter.routed || !encounter.addendum}
                className="rounded-full bg-[#0f9f8f] px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {encounter.routed ? "Saved for clinician" : "Send to clinician"}
              </button>
              <button
                type="button"
                onClick={onResolve}
                disabled={encounter.status === "clear"}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  isDark ? "bg-[#111F35] text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {encounter.status === "clear" ? "Resolved" : "Mark as resolved"}
              </button>
            </div>
            {notice ? <p className={`mt-3 text-sm ${muted}`}>{notice}</p> : null}
          </div>

          <div className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
            <h4 className={`text-lg font-bold ${title}`}>Visit note</h4>
            <p className={`mt-1 text-sm ${muted}`}>
              {formatServiceDate(encounter.serviceDate)} · {encounter.visit} · {encounter.provider}
            </p>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>{encounter.note}</p>
            <p className={`mt-4 text-sm ${muted}`}>
              {encounter.diagnosisCode} {encounter.diagnosis}. Procedure {encounter.procedureCode}.
            </p>
          </div>
        </div>
      </div>

      <p className={`text-sm ${muted}`}>
        Sample review only. A qualified clinician or coding specialist makes the final decision.
      </p>
    </div>
  );
}

function Fact({ label, value, muted, title }) {
  return (
    <div>
      <dt className={`text-xs font-medium ${muted}`}>{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${title}`}>{value}</dd>
    </div>
  );
}

function StatusPill({ status }) {
  const clear = status === "clear";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
      clear ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
    }`}
    >
      {clear ? "Clear" : "Needs review"}
    </span>
  );
}
