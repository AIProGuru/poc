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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const money = (amount) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

const PATIENTS = [
  { id: "pt-1", name: "E. Novak", facility: "Mayo Clinic", serviceDate: localDate(15), memberId: "MCK441908", payerId: "60054" },
  { id: "pt-2", name: "H. Diaz", facility: "Mayo Clinic", serviceDate: localDate(7), memberId: "MCK118334", payerId: "87726" },
  { id: "pt-3", name: "R. Alvarez", facility: "Mayo Clinic", serviceDate: localDate(4), memberId: "MCK551002", payerId: "87726" },
  { id: "pt-4", name: "M. Okafor", facility: "Mayo Clinic", serviceDate: localDate(1), memberId: "MCK104882", payerId: "87726" },
  { id: "pt-5", name: "L. Brandt", facility: "Mayo Clinic", serviceDate: localDate(0), memberId: "MCK220194", payerId: "60054" },
].sort((a, b) => (a.serviceDate < b.serviceDate ? -1 : 1));

export const priceTransparencyItemCount = PATIENTS.length;

const ESTIMATES = {
  27447: {
    description: "Total Knee Replacement",
    charge: 2500,
    cpt: "27447",
    allowed: 2000,
    copay: 50,
    deductible: 2500,
    deductibleMet: 1250,
    estimateDue: 1300,
    payerLiability: 700,
  },
};

const procedureEstimate = (value) => {
  const codes = `${value || ""}`
    .split(/[^0-9A-Za-z]+/)
    .map((code) => code.replace(/[A-Za-z]+$/, "").trim())
    .filter(Boolean);
  return codes.map((code) => ESTIMATES[code]).find(Boolean) || null;
};

export default function PriceTransparency({ isDark }) {
  const [selectedId, setSelectedId] = useState(null);
  const patient = useMemo(
    () => PATIENTS.find((item) => item.id === selectedId) || null,
    [selectedId]
  );

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-6">
      <div>
        <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-950"}`}>
          Price transparency
        </h2>
        <p className={`mt-1 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Choose a patient, then review the estimate.
        </p>
      </div>

      {patient ? (
        <EstimateForm
          key={patient.id}
          patient={patient}
          isDark={isDark}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {PATIENTS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left ${
                  isDark
                    ? "border-white/10 bg-[#15263C] hover:border-white/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span>
                  <span className={`block font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>
                    {item.name}
                  </span>
                  <span className={`mt-0.5 block text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.facility}
                  </span>
                </span>
                <span className={`shrink-0 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {formatServiceDate(item.serviceDate)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EstimateForm({ patient, isDark, onBack }) {
  const [memberId, setMemberId] = useState(patient.memberId);
  const [payerId, setPayerId] = useState(patient.payerId);
  const [diagnosis, setDiagnosis] = useState("");
  const [procedures, setProcedures] = useState("");
  const estimate = procedureEstimate(procedures);
  const asked = procedures.trim().length > 0;

  const fieldClass = `w-full rounded-xl border px-3 py-2 text-sm outline-none ${
    isDark
      ? "border-white/10 bg-[#0D1829] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
  }`;
  const labelClass = `text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
          isDark ? "bg-[#111F35] text-white hover:bg-[#1C3050]" : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
        }`}
      >
        <span aria-hidden="true">←</span>
        Back to list
      </button>
    <div className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-white/10 bg-[#15263C]" : "border-slate-200 bg-white"}`}>
      <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{patient.name}</h3>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {patient.facility} · {formatServiceDate(patient.serviceDate)}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Member ID</span>
          <input className={fieldClass} value={memberId} onChange={(event) => setMemberId(event.target.value)} />
          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Eligibility</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Payer ID</span>
          <input className={fieldClass} value={payerId} onChange={(event) => setPayerId(event.target.value)} />
          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Eligibility</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Primary diagnosis code(s)</span>
          <input
            className={fieldClass}
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="M17.11"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Primary procedure code(s)</span>
          <input
            className={fieldClass}
            value={procedures}
            onChange={(event) => setProcedures(event.target.value)}
            placeholder="27447"
          />
        </label>
      </div>

      {estimate ? (
        <dl className={`mt-6 divide-y text-sm ${isDark ? "divide-white/10" : "divide-slate-200"}`}>
          <ResultRow
            label={estimate.description}
            value={money(estimate.charge)}
            isDark={isDark}
            strong
          />
          <ResultRow label={`CPT ${estimate.cpt}`} value="" isDark={isDark} />
          <ResultRow label="Allowed Amount" value={money(estimate.allowed)} isDark={isDark} />
          <ResultRow label="Patient Co-Pay" value={money(estimate.copay)} isDark={isDark} />
          <ResultRow label="Patient Deductible" value={money(estimate.deductible)} isDark={isDark} />
          <ResultRow label="Patient Deductible Met" value={money(estimate.deductibleMet)} isDark={isDark} />
          <ResultRow
            label="Patient Estimate Due (Co-Pay + Deductible Not Met)"
            value={money(estimate.estimateDue)}
            isDark={isDark}
            strong
          />
          <ResultRow
            label="Estimated Payer Liability"
            value={money(estimate.payerLiability)}
            isDark={isDark}
            bold
          />
        </dl>
      ) : asked ? (
        <p className={`mt-6 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          An estimate for this procedure is not available yet.
        </p>
      ) : null}
    </div>
    </div>
  );
}

function ResultRow({ label, value, isDark, strong, bold }) {
  const weight = bold ? "font-bold" : strong ? "font-semibold" : "";
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className={weight ? `${weight} ${isDark ? "text-white" : "text-slate-950"}` : isDark ? "text-slate-300" : "text-slate-600"}>
        {label}
      </dt>
      <dd className={`shrink-0 tabular-nums ${weight} ${isDark ? "text-white" : "text-slate-950"}`}>
        {value}
      </dd>
    </div>
  );
}
