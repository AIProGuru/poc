#!/usr/bin/env node
/** Generate realistic matching X12 837P and 835 sample files. */

const fs = require("fs");
const path = require("path");

const ELEM = "*";
const SEG = "~";
const COMP = ":";
const OUTPUT_DIR = __dirname;
const DIR_837 = path.join(OUTPUT_DIR, "837");
const DIR_835 = path.join(OUTPUT_DIR, "835");

const PROVIDERS = [
  { name: "Summit Orthopedic Associates", npi: "1234567890", tax_id: "123456789", taxonomy: "207X00000X", address: "1200 Medical Center Dr", city: "Portland", state: "OR", zip: "97201" },
  { name: "Cascade Family Medicine", npi: "1987654321", tax_id: "987654321", taxonomy: "207Q00000X", address: "455 Willow Creek Ln", city: "Seattle", state: "WA", zip: "98101" },
  { name: "Pacific Spine & Rehab", npi: "1122334455", tax_id: "556677889", taxonomy: "208VP0014X", address: "890 Harbor View Blvd", city: "San Diego", state: "CA", zip: "92101" },
  { name: "Northwest Urgent Care PLLC", npi: "1678901234", tax_id: "334455667", taxonomy: "261QU0200X", address: "2200 Lakeview Ave", city: "Boise", state: "ID", zip: "83702" },
];

const PAYERS = [
  { name: "Blue Cross Blue Shield of Oregon", id: "BCBSOR", plan_id: "87726", address: "500 Payer Boulevard", city: "Chicago", state: "IL", zip: "60601" },
  { name: "Aetna Better Health", id: "AETNA01", plan_id: "60054", address: "151 Farmington Ave", city: "Hartford", state: "CT", zip: "06156" },
  { name: "UnitedHealthcare", id: "UHC001", plan_id: "87726", address: "9900 Bren Rd E", city: "Minnetonka", state: "MN", zip: "55343" },
  { name: "Cigna Healthcare", id: "CIGNA01", plan_id: "62308", address: "900 Cottage Grove Rd", city: "Bloomfield", state: "CT", zip: "06002" },
  { name: "Medicare Part B", id: "MEDICARE", plan_id: "CMS", address: "PO Box 30141", city: "Salt Lake City", state: "UT", zip: "84130" },
  { name: "Regence BlueShield", id: "REGENCE", plan_id: "00430", address: "100 SW Market St", city: "Portland", state: "OR", zip: "97201" },
];

/** Required by db_refresh Automation=1 (Taxonomy Missing AI agent). */
const DSHS_MEDICAID_PAYER = {
  name: "WA DSHS Medicaid",
  id: "WADSHS",
  plan_id: "WADSHS",
  address: "PO Box 45505",
  city: "Olympia",
  state: "WA",
  zip: "98504",
  claimFilingIndicator: "MC",
};

/** Segment patterns taken from HIPAA Suite reference files in `HIPAA 837 samples/` and `HIPAA 835 samples/`. */
const HIPAA_SUITE_REFERENCE = {
  source_837: "HIPAA 837 samples/837P_5010.837, TXMedicaid_837P_Professional.edi, Medicare_837P_Professional.edi",
  source_835: "HIPAA 835 samples/835_5010.edi, 835I1.edi",
  edi837: {
    claim_service_date: "DTP*472*D8 at claim level (not DTP*431)",
    payer_address: "NM1*PR followed by N3/N4",
    rendering_provider: "NM1*82 on claim after HI",
    service_line: "SV1*HC:code*amount*UN*units*pos**1",
    line_service_date: "DTP*472*D8 per LX loop",
  },
  edi835: {
    claim_dates: "DTM*232, DTM*233 (service period), DTM*050 (received) before service lines",
    claim_service_date: "DTP*472*D8 retained for platform matching",
    service_line: "SVC*HC:code*charge*paid**units",
    line_service_date: "DTM*150 + DTM*151 per SVC (HIPAA Suite reference) plus DTP*472*D8",
    adjustments: "Claim-level CAS*group*reason*amount*qty (aggregated) plus line-level CAS for detail — populates EDI_ClaimLevelAdjustments and EDI_PaidClaimLineAdj",
    plb: "PLB*providerId*fiscalDate*reason:referenceId*amount — composite PLB03/05 (extension for EDI_ProviderLevelAdjustments)",
  },
};

const PATIENTS = [
  { first: "Emily", last: "Johnson", member_id: "MBR100001", dob: "19850314", sex: "F" },
  { first: "Michael", last: "Chen", member_id: "MBR100002", dob: "19720822", sex: "M" },
  { first: "Sarah", last: "Martinez", member_id: "MBR100003", dob: "19901105", sex: "F" },
  { first: "David", last: "Thompson", member_id: "MBR100004", dob: "19651230", sex: "M" },
  { first: "Jessica", last: "Williams", member_id: "MBR100005", dob: "19880717", sex: "F" },
  { first: "Robert", last: "Anderson", member_id: "MBR100006", dob: "19550408", sex: "M" },
  { first: "Amanda", last: "Garcia", member_id: "MBR100007", dob: "19930425", sex: "F" },
  { first: "James", last: "Wilson", member_id: "MBR100008", dob: "19770912", sex: "M" },
  { first: "Lisa", last: "Brown", member_id: "MBR100009", dob: "19820103", sex: "F" },
  { first: "Daniel", last: "Taylor", member_id: "MBR100010", dob: "19960819", sex: "M" },
  { first: "Karen", last: "Moore", member_id: "MBR100011", dob: "19680327", sex: "F" },
  { first: "Christopher", last: "Lee", member_id: "MBR100012", dob: "19741215", sex: "M" },
  { first: "Michelle", last: "Davis", member_id: "MBR100013", dob: "19910502", sex: "F" },
  { first: "Kevin", last: "Miller", member_id: "MBR100014", dob: "19591028", sex: "M" },
  { first: "Rachel", last: "Jackson", member_id: "MBR100015", dob: "19840611", sex: "F" },
  { first: "Brian", last: "White", member_id: "MBR100016", dob: "19730107", sex: "M" },
  { first: "Nicole", last: "Harris", member_id: "MBR100017", dob: "19971223", sex: "F" },
  { first: "Steven", last: "Clark", member_id: "MBR100018", dob: "19660704", sex: "M" },
  { first: "Laura", last: "Lewis", member_id: "MBR100019", dob: "19890930", sex: "F" },
  { first: "Jason", last: "Walker", member_id: "MBR100020", dob: "19750618", sex: "M" },
];

const DIAGNOSES = ["M25512", "M5450", "J069", "E119", "I10", "S83201A", "M79604", "R509", "Z0000", "M1711"];

const SERVICE_LINES = [
  { code: "99213", charge: 150.0, pos: "11" },
  { code: "99214", charge: 210.0, pos: "11" },
  { code: "99203", charge: 175.0, pos: "11" },
  { code: "99204", charge: 265.0, pos: "11" },
  { code: "97110", charge: 85.0, pos: "11" },
  { code: "97140", charge: 75.0, pos: "11" },
  { code: "20610", charge: 320.0, pos: "11" },
  { code: "73030", charge: 95.0, pos: "11" },
  { code: "73721", charge: 850.0, pos: "11" },
  { code: "99285", charge: 450.0, pos: "23" },
  { code: "36415", charge: 25.0, pos: "11" },
  { code: "80053", charge: 45.0, pos: "11" },
  { code: "29881", charge: 1850.0, pos: "24" },
  { code: "27447", charge: 4200.0, pos: "24" },
  { code: "99232", charge: 180.0, pos: "21" },
];

function fmtMoney(v) { return Number(v).toFixed(2); }

/** CARC reason codes — keep unpadded like production EDI / carc.Code (16, not 016). */
function formatCarcReason(reason) {
  const raw = String(reason ?? "").trim();
  if (/^\d+$/.test(raw)) return String(parseInt(raw, 10));
  return raw.length > 5 ? raw.slice(0, 5) : raw;
}

/** Service unit count → AdjustmentQty varchar(15) */
function formatCasQty(qty) {
  const n = Math.max(1, Math.round(Number(qty || 1)));
  return String(n);
}

function normalizeAdjGroup(group) {
  return String(group || "CO").trim().toUpperCase().slice(0, 2);
}
function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  // Use UTC parts — scenario dates are created as YYYY-MM-DD (UTC).
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function toDateOnly(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}
function addDays(base, n) { const d = new Date(base); d.setDate(d.getDate() + n); return d; }
function joinSegs(segs) { return segs.join(""); }
function round2(v) { return Math.round(v * 100) / 100; }

/** Person NM1: NM05–NM07 empty, NM08=qual, NM09=id (HIPAA Suite / 835_5010.edi). */
function nm1Person(entity, last, first, qual, id) {
  return ["NM1", entity, "1", last, first, "", "", "", qual, id].join(ELEM) + SEG;
}

/** Organization NM1: NM04–NM07 empty, NM08=qual, NM09=id. */
function nm1Org(entity, name, qual, id) {
  return ["NM1", entity, "2", name, "", "", "", "", qual, id].join(ELEM) + SEG;
}

/** Common professional modifiers to populate ProcedureModifier / SubmittedProcedureModifier columns. */
const CODE_MODIFIERS = {
  "99213": ["25"],
  "99214": ["25"],
  "99203": ["25"],
  "99204": ["25"],
  "73721": ["LT"],
  "97110": ["59"],
  "97140": ["59"],
  "20610": ["RT"],
  "73030": ["LT"],
  "99285": ["25"],
};

function defaultModifiers(code) {
  return CODE_MODIFIERS[code] ? [...CODE_MODIFIERS[code]] : [];
}

function enrichServiceLine(line) {
  if (!line.modifiers?.length) line.modifiers = defaultModifiers(line.code);
  return line;
}

function svcComposite(code, modifiers = []) {
  return `HC${COMP}${[code, ...modifiers.filter(Boolean).slice(0, 4)].join(COMP)}`;
}

function buildSvcSegment(line) {
  enrichServiceLine(line);
  const paidComp = svcComposite(line.code, line.modifiers);
  const units = String(line.units || 1);
  // 835_5010 layout: SVC*composite*charge*paid**units~
  // SVC04=revenue (blank prof), SVC05=UnitsPaid. No trailing SVC06/07 composite —
  // HIPAA Suite WriteClaimLines mis-reads it as UnitsCharged (decimal).
  return ["SVC", paidComp, fmtMoney(line.charge), fmtMoney(line.paid), "", units].join(ELEM) + SEG;
}

function lineAllowedAmount(line) {
  const adjTotal = (line.adjustments || []).reduce((s, a) => s + Number(a.amount), 0);
  return round2(Math.max(0, Number(line.charge) - adjTotal));
}

/** Emit loop 2110 service line segments — maps to EDI_PaidClaimLines columns on import. */
function append835ServiceLineSegments(segs, line, ctx) {
  const { claim, provider, lineIdx, matchServiceDate } = ctx;
  enrichServiceLine(line);
  const lineDate = line.serviceDate || matchServiceDate;
  const ctrlNo = `${claim.claimNo.replace(/\D/g, "").slice(-12)}${String(lineIdx + 1).padStart(2, "0")}`.slice(0, 20);
  const authNo = `AUTH${line.code}${String(lineIdx + 1).padStart(2, "0")}`.slice(0, 50);
  const allowed = lineAllowedAmount(line);
  const prAmount = (line.adjustments || [])
    .filter((a) => a.group === "PR")
    .reduce((s, a) => s + Number(a.amount), 0);

  segs.push(buildSvcSegment(line));
  // HIPAA Suite reference (835_5010.edi) maps line service period via DTM*150/151.
  // These populate ServicePeriodStart/End used by servicedate_835 when ServiceDate
  // is not already stored as mm/dd/yyyy.
  segs.push(`DTM${ELEM}150${ELEM}${fmtDate(lineDate)}${SEG}`);
  segs.push(`DTM${ELEM}151${ELEM}${fmtDate(lineDate)}${SEG}`);
  // Keep DTP*472*D8 as well — many importers write this to ServiceDate.
  segs.push(`DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(lineDate)}${SEG}`);
  segs.push(`REF${ELEM}6R${ELEM}${ctrlNo}${SEG}`);
  segs.push(`REF${ELEM}G1${ELEM}${authNo}${SEG}`);
  segs.push(`REF${ELEM}BB${ELEM}${authNo}${SEG}`);
  segs.push(`REF${ELEM}1D${ELEM}${String(line.pos || "11").padStart(2, "0")}${SEG}`);
  segs.push(`REF${ELEM}BT${ELEM}POL${claim.patient.member_id}${SEG}`);
  segs.push(`REF${ELEM}9B${ELEM}REB${lineIdx + 1}${SEG}`);

  (line.adjustments || []).forEach((adj) => {
    segs.push(
      `CAS${ELEM}${normalizeAdjGroup(adj.group)}${ELEM}${formatCarcReason(adj.reason)}${ELEM}${fmtMoney(adj.amount)}${ELEM}${formatCasQty(adj.qty)}${SEG}`
    );
  });

  segs.push(nm1Person("82", "SMITH", "JOHN", "XX", provider.npi));
  segs.push(`REF${ELEM}TJ${ELEM}${provider.tax_id}${SEG}`);
  segs.push(`REF${ELEM}1C${ELEM}${provider.tax_id}${SEG}`);
  segs.push(`REF${ELEM}G2${ELEM}${provider.npi}${SEG}`);
  segs.push(`REF${ELEM}HPI${ELEM}${provider.npi}${SEG}`);
  segs.push(`REF${ELEM}SY${ELEM}${provider.tax_id}${SEG}`);
  segs.push(`REF${ELEM}LU${ELEM}${provider.npi}${SEG}`);

  if (allowed > 0) segs.push(`AMT${ELEM}B6${ELEM}${fmtMoney(allowed)}${SEG}`);
  if (prAmount > 0) segs.push(`AMT${ELEM}F5${ELEM}${fmtMoney(prAmount)}${SEG}`);
  if (Number(line.paid) > 0) segs.push(`AMT${ELEM}T${ELEM}${fmtMoney(line.paid)}${SEG}`);

  segs.push(`QTY${ELEM}ZK${ELEM}${line.units || 1}${SEG}`);
  segs.push(`QTY${ELEM}NE${ELEM}${line.units || 1}${SEG}`);

  (line.remarkCodes || []).forEach((code) => {
    segs.push(`LQ${ELEM}HE${ELEM}${code}${SEG}`);
  });
}

function buildIsa(sender, receiver, ctrl, dt) {
  return `ISA${ELEM}00${ELEM}          ${ELEM}00${ELEM}          ${ELEM}ZZ${ELEM}${sender.padEnd(15)}${ELEM}ZZ${ELEM}${receiver.padEnd(15)}${ELEM}${fmtDate(dt).slice(2)}${ELEM}1200${ELEM}^${ELEM}00501${ELEM}${String(ctrl).padStart(9)}${ELEM}0${ELEM}P${ELEM}${COMP}${SEG}`;
}

function latestLineDate(lines, fallback) {
  return lines.reduce((max, l) => {
    const d = l.serviceDate || fallback;
    return !max || d > max ? d : max;
  }, null) || fallback;
}

function build837(claim, fileId) {
  const ctrl = String(fileId).padStart(9, "0");
  const stCtrl = String(fileId).padStart(4, "0");
  const { provider, payer, patient, lines } = claim;
  const matchServiceDate = latestLineDate(lines, claim.serviceDate);
  claim.serviceDate = matchServiceDate;
  lines.forEach((ln) => {
    if (!ln.serviceDate) ln.serviceDate = matchServiceDate;
  });
  const total = lines.reduce((s, l) => s + l.charge, 0);
  const taxonomyCode =
    claim.taxonomyCode !== undefined ? claim.taxonomyCode : provider.taxonomy;
  const includeTaxonomy = claim.includeTaxonomy !== false && taxonomyCode;
  const segs = [
    buildIsa("SUBMITTER001", "RECEIVER001", ctrl, claim.submitDate),
    `GS${ELEM}HC${ELEM}SUBMITTER001${ELEM}RECEIVER001${ELEM}${fmtDate(claim.submitDate)}${ELEM}1200${ELEM}${fileId}${ELEM}X${ELEM}005010X222A1${SEG}`,
    `ST${ELEM}837${ELEM}${stCtrl}${ELEM}005010X222A1${SEG}`,
    `BHT${ELEM}0019${ELEM}00${ELEM}${claim.claimNo}${ELEM}${fmtDate(claim.submitDate)}${ELEM}1200${ELEM}CH${SEG}`,
    nm1Org("41", provider.name, "46", provider.tax_id),
    `PER${ELEM}IC${ELEM}BILLING DEPT${ELEM}TE${ELEM}5035550100${SEG}`,
    nm1Org("40", payer.name, "46", payer.id),
    `HL${ELEM}1${ELEM}${ELEM}20${ELEM}1${SEG}`,
  ];
  if (includeTaxonomy) {
    segs.push(`PRV${ELEM}BI${ELEM}PXC${ELEM}${taxonomyCode}${SEG}`);
  }
  segs.push(
    nm1Org("85", provider.name, "XX", provider.npi),
    `N3${ELEM}${provider.address}${SEG}`,
    `N4${ELEM}${provider.city}${ELEM}${provider.state}${ELEM}${provider.zip}${SEG}`,
    `REF${ELEM}EI${ELEM}${provider.tax_id}${SEG}`,
    `HL${ELEM}2${ELEM}1${ELEM}22${ELEM}0${SEG}`,
    `SBR${ELEM}P${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${claim.claimFilingIndicator || payer.claimFilingIndicator || "CI"}${SEG}`,
    nm1Person("IL", patient.last, patient.first, "MI", patient.member_id),
    `N3${ELEM}100 Main Street${SEG}`,
    `N4${ELEM}Portland${ELEM}OR${ELEM}97205${SEG}`,
    `DMG${ELEM}D8${ELEM}${patient.dob}${ELEM}${patient.sex}${SEG}`,
    nm1Org("PR", payer.name, "PI", payer.plan_id),
    `N3${ELEM}${payer.address || "500 Payer Boulevard"}${SEG}`,
    `N4${ELEM}${payer.city || "Chicago"}${ELEM}${payer.state || "IL"}${ELEM}${payer.zip || "60601"}${SEG}`,
    `CLM${ELEM}${claim.claimNo}${ELEM}${fmtMoney(total)}${ELEM}${ELEM}${ELEM}${lines[0].pos}${COMP}B${COMP}${claim.frequency}${ELEM}${ELEM}Y${ELEM}A${ELEM}Y${ELEM}I${SEG}`,
    `DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(matchServiceDate)}${SEG}`,
    `REF${ELEM}D9${ELEM}${claim.claimNo}${SEG}`,
    `REF${ELEM}EA${ELEM}${claim.claimNo}${SEG}`,
    `HI${ELEM}ABK${COMP}${claim.diagnosis}${SEG}`,
    nm1Person("82", "SMITH", "JOHN", "XX", provider.npi),
  );
  lines.forEach((line, idx) => {
    const lineDate = line.serviceDate || matchServiceDate;
    enrichServiceLine(line);
    const svc = svcComposite(line.code, line.modifiers);
    segs.push(`LX${ELEM}${idx + 1}${SEG}`);
    segs.push(`SV1${ELEM}${svc}${ELEM}${fmtMoney(line.charge)}${ELEM}UN${ELEM}${line.units}${ELEM}${line.pos}${ELEM}${ELEM}1${SEG}`);
    segs.push(`DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(lineDate)}${SEG}`);
    segs.push(`REF${ELEM}6R${ELEM}${claim.claimNo}${String(idx + 1).padStart(2, "0")}${SEG}`);
  });
  segs.push(`SE${ELEM}${segs.length + 1}${ELEM}${stCtrl}${SEG}`);
  segs.push(`GE${ELEM}1${ELEM}${fileId}${SEG}`);
  segs.push(`IEA${ELEM}1${ELEM}${ctrl}${SEG}`);
  return joinSegs(segs);
}

/**
 * BPR segment for 835 ACH/CTX payments.
 * BPR12 = receiving DFI qualifier (max 4), BPR14 = receiver account qualifier (max 6).
 * Prior versions put routing/account numbers in those qualifier slots, which HIPAA Suite rejects.
 */
function buildBprSegment(remit, payer) {
  const senderDfiQual = "01";
  const senderDfiId = "0210";
  const senderAcctQual = "DA";
  const senderAcct = "123456";
  const payerIdentifier = String(payer.id || "PAYER01").slice(0, 10);
  const receiverDfiQual = "01";
  const receiverDfiId = "0211";
  const receiverAcctQual = "DA";
  const receiverAcct = "987654";
  return [
    "BPR",
    "I",
    fmtMoney(remit.checkAmount),
    "C",
    "ACH",
    "CTX",
    senderDfiQual,
    senderDfiId,
    senderAcctQual,
    senderAcct,
    payerIdentifier,
    "",
    receiverDfiQual,
    receiverDfiId,
    receiverAcctQual,
    receiverAcct,
    fmtDate(remit.checkDate),
  ].join(ELEM) + SEG;
}

/** Last day of the check year — maps to EDI_ProviderLevelAdjustments.FiscalPeriodDate (MM/DD/YYYY in DB). */
function fiscalPeriodDate(checkDate) {
  const y = checkDate.getFullYear();
  return `${y}1231`;
}

/**
 * PLB*providerId*fiscalDate*reason:identifier*amount*(repeat composite+amount up to 6 pairs).
 * PLB03/05/... are C042 composites (reason:reference), not separate elements.
 */
function formatPlbComposite(adj) {
  const reason = adj.reason || "L6";
  let refId = `${adj.identifier || ""}`.trim();
  if (!refId) return reason;
  refId = refId.replace(/-/g, ":");
  if (refId.startsWith(`${reason}:`)) return refId;
  return `${reason}:${refId}`;
}

function buildPlbSegments(provider, remit, claim) {
  const adjustments = remit.providerLevelAdjustments || defaultProviderLevelAdjustments(claim, remit);
  if (!adjustments.length) return [];

  const providerId = provider.npi;
  const fiscalDate = fiscalPeriodDate(remit.checkDate);
  const segments = [];

  for (let i = 0; i < adjustments.length; i += 6) {
    const batch = adjustments.slice(i, i + 6);
    const parts = ["PLB", providerId, fiscalDate];
    batch.forEach((adj) => {
      parts.push(formatPlbComposite(adj), fmtMoney(adj.amount));
    });
    segments.push(parts.join(ELEM) + SEG);
  }
  return segments;
}

function defaultProviderLevelAdjustments(claim, remit) {
  const checkDigits = String(remit.checkNumber || "").replace(/\D/g, "").slice(-6).padStart(6, "0");
  const baseSuffix = 539303;
  return remit.lines.map((line, idx) => {
    const charge = Number(line.charge) || 0;
    const amount = -round2(Math.max(2.16, charge * 0.0144));
    return {
      reason: "L6",
      identifier: `${checkDigits}-${String(baseSuffix + idx * 6884).padStart(6, "0")}`,
      amount,
    };
  });
}

/** Aggregate line CAS → EDI_ClaimLevelAdjustments rows (CAS in loop 2100, before first SVC). */
function resolveClaimLevelAdjustments(remit) {
  if (remit.claimLevelAdjustments?.length) {
    return remit.claimLevelAdjustments.map((adj) => ({
      group: normalizeAdjGroup(adj.group),
      reason: formatCarcReason(adj.reason),
      amount: round2(Number(adj.amount)),
      qty: Number(adj.qty ?? 1),
    }));
  }

  const map = new Map();
  remit.lines.forEach((line) => {
    (line.adjustments || []).forEach((adj) => {
      const group = normalizeAdjGroup(adj.group);
      const reason = formatCarcReason(adj.reason);
      const key = `${group}|${reason}`;
      const prev = map.get(key) || { group, reason, amount: 0, qty: 0 };
      prev.amount = round2(prev.amount + Number(adj.amount));
      prev.qty += Number(adj.qty ?? line.units ?? 1);
      map.set(key, prev);
    });
  });

  let adjustments = Array.from(map.values()).filter((adj) => Number(adj.amount) > 0);
  if (adjustments.length === 0) {
    const totalCharge = remit.lines.reduce((s, l) => s + Number(l.charge || 0), 0);
    const totalPaid = remit.lines.reduce((s, l) => s + Number(l.paid || 0), 0);
    const patientResp = Number(remit.patientResp || 0);
    const totalUnits = remit.lines.reduce((s, l) => s + Number(l.units || 1), 0);
    const coAmount = round2(totalCharge - totalPaid - patientResp);
    if (coAmount > 0.001) {
      adjustments.push({ group: "CO", reason: formatCarcReason("45"), amount: coAmount, qty: totalUnits });
    }
    if (patientResp > 0.001) {
      const prReason = remit.prReasonCode ? formatCarcReason(remit.prReasonCode) : formatCarcReason("2");
      adjustments.push({ group: "PR", reason: prReason, amount: patientResp, qty: totalUnits });
    }
  }
  return adjustments;
}

function appendClaimLevelCasSegments(segs, remit) {
  if (remit.includeClaimLevelCas === false) return;
  const adjustments = resolveClaimLevelAdjustments(remit);
  if (!adjustments.length) return;

  const byGroup = new Map();
  adjustments.forEach((adj) => {
    if (!byGroup.has(adj.group)) byGroup.set(adj.group, []);
    byGroup.get(adj.group).push(adj);
  });
  byGroup.forEach((groupAdjs, group) => {
    for (let i = 0; i < groupAdjs.length; i += 6) {
      const batch = groupAdjs.slice(i, i + 6);
      const parts = ["CAS", group];
      batch.forEach((adj) => {
        // CAS*Group*Reason*Amount*Qty → AdjustmentGroup/Reason/Amount/Qty
        parts.push(adj.reason, fmtMoney(adj.amount), formatCasQty(adj.qty));
      });
      segs.push(parts.join(ELEM) + SEG);
    }
  });
}

function append835ClaimDateSegments(segs, serviceDate, checkDate) {
  segs.push(`DTM${ELEM}232${ELEM}${fmtDate(serviceDate)}${SEG}`);
  segs.push(`DTM${ELEM}233${ELEM}${fmtDate(serviceDate)}${SEG}`);
  segs.push(`DTM${ELEM}050${ELEM}${fmtDate(checkDate)}${SEG}`);
  segs.push(`DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(serviceDate)}${SEG}`);
}

function build835(claim, remit, fileId, options = {}) {
  const ctrl = String(fileId + 50000).padStart(9, "0");
  const stCtrl = String(fileId).padStart(4, "0");
  const provider = claim.provider;
  const payer = remit.payer || claim.payer;
  const matchServiceDate = options.clpServiceDate || latestLineDate(
    remit.lines,
    latestLineDate(claim.lines, claim.serviceDate)
  );
  // Guarantee every SVC line carries the match date when not explicitly set.
  remit.lines.forEach((ln) => {
    if (!ln.serviceDate) ln.serviceDate = matchServiceDate;
  });
  const totalCharge = remit.lines.reduce((s, l) => s + l.charge, 0);
  const totalPaid = remit.lines.reduce((s, l) => s + l.paid, 0);
  const segs = [
    buildIsa(payer.id.slice(0, 15), provider.npi, ctrl, remit.checkDate),
    `GS${ELEM}HP${ELEM}${payer.id}${ELEM}${provider.npi}${ELEM}${fmtDate(remit.checkDate)}${ELEM}1200${ELEM}${fileId}${ELEM}X${ELEM}005010X221A1${SEG}`,
    `ST${ELEM}835${ELEM}${stCtrl}${ELEM}005010X221A1${SEG}`,
    buildBprSegment(remit, payer),
    `TRN${ELEM}1${ELEM}${remit.checkNumber}${ELEM}${payer.id}${SEG}`,
    `DTM${ELEM}405${ELEM}${fmtDate(remit.checkDate)}${SEG}`,
    `N1${ELEM}PR${ELEM}${payer.name}${ELEM}XV${ELEM}${payer.plan_id}${SEG}`,
    `N3${ELEM}${payer.address || "500 Payer Boulevard"}${SEG}`,
    `N4${ELEM}${payer.city || "Chicago"}${ELEM}${payer.state || "IL"}${ELEM}${payer.zip || "60601"}${SEG}`,
    `REF${ELEM}2U${ELEM}${payer.id}${SEG}`,
    `N1${ELEM}PE${ELEM}${provider.name}${ELEM}XX${ELEM}${provider.npi}${SEG}`,
    `N3${ELEM}${provider.address}${SEG}`,
    `N4${ELEM}${provider.city}${ELEM}${provider.state}${ELEM}${provider.zip}${SEG}`,
    `REF${ELEM}TJ${ELEM}${provider.tax_id}${SEG}`,
    `LX${ELEM}1${SEG}`,
    `CLP${ELEM}${claim.claimNo}${ELEM}${remit.claimStatus}${ELEM}${fmtMoney(totalCharge)}${ELEM}${fmtMoney(totalPaid)}${ELEM}${fmtMoney(remit.patientResp)}${ELEM}${remit.claimFilingIndicator || payer.claimFilingIndicator || "12"}${ELEM}${remit.payerClaimId}${ELEM}${claim.frequency}${SEG}`,
    nm1Person("QC", claim.patient.last, claim.patient.first, "MI", claim.patient.member_id),
    nm1Person("82", "SMITH", "JOHN", "XX", provider.npi),
    // REF*EA = patient account / patient control number (same as CLM01 / CLP01)
    `REF${ELEM}EA${ELEM}${claim.claimNo}${SEG}`,
    `REF${ELEM}1L${ELEM}${claim.patient.member_id}${SEG}`,
  ];
  append835ClaimDateSegments(segs, matchServiceDate, remit.checkDate);
  appendClaimLevelCasSegments(segs, remit);
  remit.lines.forEach((line, lineIdx) => {
    append835ServiceLineSegments(segs, line, { claim, provider, payer, lineIdx, matchServiceDate });
  });
  buildPlbSegments(provider, remit, claim).forEach((plbSeg) => segs.push(plbSeg));
  segs.push(`SE${ELEM}${segs.length + 1}${ELEM}${stCtrl}${SEG}`);
  segs.push(`GE${ELEM}1${ELEM}${fileId}${SEG}`);
  segs.push(`IEA${ELEM}1${ELEM}${ctrl}${SEG}`);
  return joinSegs(segs);
}

function line(code, charge, paid = 0, units = 1, pos = "11", adjustments = [], remarkCodes = [], serviceDate = null, modifiers = null) {
  return {
    code,
    charge,
    paid,
    units,
    pos,
    adjustments,
    remarkCodes,
    serviceDate,
    modifiers: modifiers ?? defaultModifiers(code),
  };
}

function lineOnDate(template, serviceDate, paid = 0, adjustments = [], remarkCodes = []) {
  return line(template.code, template.charge, paid, 1, template.pos, adjustments, remarkCodes, serviceDate);
}

/** Denial for invalid/missing taxonomy: CARC CO-16 + RARC N255 */
function taxonomyDenialLine(code, charge, pos = "11", serviceDate = null) {
  return line(
    code,
    charge,
    0,
    1,
    pos,
    [{ group: "CO", reason: "16", amount: charge }],
    ["N255"],
    serviceDate
  );
}

function buildTaxonomyDenialRemit(claim, checkNumber, checkDate) {
  return {
    checkNumber,
    checkDate,
    checkAmount: 0,
    claimStatus: "4",
    payerClaimId: `PAY${claim.claimNo}`,
    patientResp: 0,
    lines: claim.lines.map((ln) =>
      taxonomyDenialLine(
        ln.code,
        ln.charge,
        ln.pos,
        ln.serviceDate || claim.serviceDate
      )
    ),
  };
}

/** Mirrors SUBSTRING_INDEX(value, '-', 1) in db_refresh.sql */
function claimPrefix(value) {
  const idx = value.indexOf("-");
  return idx === -1 ? value : value.slice(0, idx);
}

/**
 * Platform matching logic from backend/sql/db_refresh.sql (matching_837_835).
 * All three predicates must be true for an 837↔835 link.
 */
const MATCHING_LOGIC = {
  source: "backend/sql/db_refresh.sql → matching_837_835",
  join_predicates: [
    {
      id: "claim_prefix",
      sql: "CUSTOM_EDI_Claims_CLONE.ClaimNoFirst = CUSTOM_EDI_PaidClaims_CLONE.ClaimIDFirst",
      edi_837: "SUBSTRING_INDEX(EDI_Claims.ClaimNo, '-', 1) from CLM01",
      edi_835: "SUBSTRING_INDEX(EDI_PaidClaims.ClaimID, '-', 1) from CLP01",
      note: "Only the segment BEFORE the first dash is matched. Suffixes (ClaimNoLast / ClaimIDLast) are ignored.",
    },
    {
      id: "service_date",
      sql: "CUSTOM_EDI_PaidClaims_CLONE.ServiceDate = CUSTOM_EDI_Claims_CLONE.ServiceDate",
      edi_837: "MAX(EDI_ClaimDetail.ServiceDateFrom) per claim — latest line date (servicedate_837)",
      edi_835: "MAX(COALESCE(parse ServiceDate as mm/dd/yyyy|yyyy-mm-dd|yyyymmdd, ServicePeriodStart, ServicePeriodEnd)) per paid claim (servicedate_835)",
      note: "Not the 835 check/ERA date. Emit matching DTM*150/151 (+ DTP*472) on every SVC line using the same latest service date as the 837.",
    },
    {
      id: "charge_amount",
      sql: "CUSTOM_EDI_PaidClaims_CLONE.ChargeAmount = CUSTOM_EDI_Claims_CLONE.Amount",
      edi_837: "EDI_Claims.Amount (CLM02 total billed)",
      edi_835: "SUM(EDI_PaidClaimLines.ChargedAmount) — total billed on the remit, NOT CLP04 paid amount",
      note: "For multi-line claims, CLM02 must equal the sum of all SV1/SVC line charges.",
    },
  ],
  multiple_835_per_837:
    "Each 835 that satisfies all three predicates links to the same id_837. matching_837_835.rn=1 (latest CheckDate) is used for CUSTOM_ALL; get_claim_detail returns all linked 835 rows.",
  plb_provider_level_adjustments:
    "PLB*ProviderID*FiscalDate*Reason:ReferenceID*Amount before SE (composite PLB03/05). Maps to EDI_ProviderLevelAdjustments.",
  claim_level_adjustments:
    "EDI_ClaimLevelAdjustments: CAS*Group(2)*Reason(3)*Amount*Qty after claim DTM/DTP, before SVC. Reason zero-padded (045, 016, 002). AdjustmentQty = CAS04.",
  paid_claim_lines:
    "Loop 2110 SVC with HC composite + modifiers, DTM*150/151 + DTP*472, REF*6R/G1/BB, NM1*82+REF*TJ, AMT*B6/F5/T, QTY*ZK/NE, LQ*HE — populates EDI_PaidClaimLines.",
  hipaa_suite_reference: HIPAA_SUITE_REFERENCE,
  related_837_lookup:
    "Separate from 835 matching: get_claim_detail Related uses ClaimNoFirst + Amount + PrincipalDiagnosis + ServiceDate to find duplicate 837 submissions.",
};

function validateRemitMatch(claim, remit) {
  const totalCharge = remit.lines.reduce((s, l) => s + Number(l.charge || 0), 0);
  const claimTotal = claim.lines.reduce((s, l) => s + Number(l.charge || 0), 0);
  const claimMatchDate = toDateOnly(latestLineDate(claim.lines, claim.serviceDate));
  const remitMatchDate = toDateOnly(latestLineDate(remit.lines, claim.serviceDate));
  const errors = [];
  if (claimPrefix(claim.claimNo) !== claimPrefix(claim.claimNo)) {
    errors.push("internal: claim prefix check failed");
  }
  if (Math.abs(totalCharge - claimTotal) > 0.001) {
    errors.push(`charge mismatch: 835 billed ${totalCharge.toFixed(2)} vs 837 ${claimTotal.toFixed(2)}`);
  }
  if (claimMatchDate !== remitMatchDate) {
    errors.push(`service date mismatch: 835 max line ${remitMatchDate} vs 837 max line ${claimMatchDate}`);
  }
  return {
    claim_no_first: claimPrefix(claim.claimNo),
    claim_id_first: claimPrefix(claim.claimNo),
    service_date: claimMatchDate,
    charge_amount: claimTotal.toFixed(2),
    valid: errors.length === 0,
    errors,
  };
}

function buildScenarios() {
  const base = new Date("2025-10-01");
  const scenarios = [];
  let seq = 1;
  const claimNo = () => `CLM2025${String(seq++).padStart(5, "0")}`;

  for (let i = 0; i < 5; i++) {
    const svc = SERVICE_LINES[i];
    const svcDate = addDays(base, i * 3);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[i % 4], payer: PAYERS[i % 6], patient: PATIENTS[i],
      diagnosis: DIAGNOSES[i % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, svc.charge, 1, svc.pos)],
      remits: [{ checkNumber: `CHK${100000 + i}`, checkDate: addDays(submit, 14), checkAmount: svc.charge, claimStatus: "1", payerClaimId: `PAY${cn}`, patientResp: 0, lines: [line(svc.code, svc.charge, svc.charge, 1, svc.pos)] }],
    });
  }

  for (let i = 0; i < 5; i++) {
    const svc = SERVICE_LINES[i + 5];
    const svcDate = addDays(base, 20 + i * 2);
    const submit = addDays(svcDate, 1);
    const cn = claimNo();
    const co = round2(svc.charge * 0.2);
    const copay = 25;
    const paid = round2(svc.charge - co - copay);
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 1) % 4], payer: PAYERS[(i + 1) % 6], patient: PATIENTS[i + 5],
      diagnosis: DIAGNOSES[(i + 3) % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, paid, 1, svc.pos)],
      remits: [{ checkNumber: `CHK${200000 + i}`, checkDate: addDays(submit, 21), checkAmount: paid, claimStatus: "1", payerClaimId: `PAY${cn}`, patientResp: copay,
        lines: [line(svc.code, svc.charge, paid, 1, svc.pos, [{ group: "CO", reason: "45", amount: co }, { group: "PR", reason: "1", amount: copay }], ["N130"])] }],
    });
  }

  for (let i = 0; i < 3; i++) {
    const svc = SERVICE_LINES[i + 10];
    const svcDate = addDays(base, 35 + i * 4);
    const submit = addDays(svcDate, 3);
    const cn = claimNo();
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 2) % 4], payer: PAYERS[(i + 2) % 6], patient: PATIENTS[i + 10],
      diagnosis: DIAGNOSES[(i + 5) % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [{ checkNumber: `CHK${300000 + i}`, checkDate: addDays(submit, 18), checkAmount: 0, claimStatus: "4", payerClaimId: `PAY${cn}`, patientResp: 0,
        lines: [line(svc.code, svc.charge, 0, 1, svc.pos, [{ group: "CO", reason: "197", amount: svc.charge }], ["M15", "N522"])] }],
    });
  }

  for (let i = 0; i < 4; i++) {
    const svcDate = addDays(base, 50 + i * 5);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const templates = [SERVICE_LINES[i], SERVICE_LINES[i + 1], SERVICE_LINES[i + 2]];
    const lines = templates.map((t) => line(t.code, t.charge, 0, 1, t.pos));
    const paidLines = [];
    let totalPaid = 0, totalPr = 0;
    templates.forEach((tmpl) => {
      const co = round2(tmpl.charge * 0.15);
      const pr = i % 2 === 0 ? 15 : 0;
      const paid = round2(tmpl.charge - co - pr);
      totalPaid += paid; totalPr += pr;
      const adjs = [{ group: "CO", reason: "45", amount: co }];
      if (pr) adjs.push({ group: "PR", reason: "3", amount: pr });
      paidLines.push(line(tmpl.code, tmpl.charge, paid, 1, tmpl.pos, adjs, pr ? ["N290"] : []));
    });
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[i % 4], payer: PAYERS[i % 6], patient: PATIENTS[i + 13],
      diagnosis: DIAGNOSES[i % 10], frequency: "1", lines,
      remits: [{ checkNumber: `CHK${400000 + i}`, checkDate: addDays(submit, 25), checkAmount: totalPaid, claimStatus: "1", payerClaimId: `PAY${cn}`, patientResp: totalPr, lines: paidLines }],
    });
  }

  for (let i = 0; i < 4; i++) {
    const svc = SERVICE_LINES[i + 3];
    const svcDate = addDays(base, 70 + i * 6);
    const submit = addDays(svcDate, 1);
    const cn = claimNo();
    const primary = PAYERS[i % 6];
    const secondary = PAYERS[(i + 2) % 6];
    const primaryCo = round2(svc.charge * 0.25);
    const primaryPaid = round2(svc.charge - primaryCo - 30);
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 1) % 4], payer: primary, patient: PATIENTS[i + 3],
      diagnosis: DIAGNOSES[(i + 2) % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [
        { checkNumber: `CHK${500000 + i}`, checkDate: addDays(submit, 20), checkAmount: primaryPaid, claimStatus: "1", payerClaimId: `PAY${cn}A`, patientResp: 30, payer: primary,
          lines: [line(svc.code, svc.charge, primaryPaid, 1, svc.pos, [{ group: "CO", reason: "45", amount: primaryCo }, { group: "PR", reason: "2", amount: 30 }], ["N179"])] },
        { checkNumber: `CHK${600000 + i}`, checkDate: addDays(submit, 35), checkAmount: 30, claimStatus: "2", payerClaimId: `PAY${cn}B`, patientResp: 0, payer: secondary,
          lines: [line(svc.code, svc.charge, 30, 1, svc.pos, [{ group: "OA", reason: "23", amount: 30 }], ["N89"])] },
      ],
    });
  }

  for (let i = 0; i < 2; i++) {
    const svc = SERVICE_LINES[i + 8];
    const svcDate = addDays(base, 95 + i * 7);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const partial = round2(svc.charge * 0.5);
    const finalPaid = round2(svc.charge - partial);
    scenarios.push({
      claimNo: `${cn}-1`, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[i], payer: PAYERS[i + 1], patient: PATIENTS[i + 16],
      diagnosis: DIAGNOSES[i + 7], frequency: "7",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [
        { checkNumber: `CHK${700000 + i}`, checkDate: addDays(submit, 15), checkAmount: 0, claimStatus: "4", payerClaimId: `PAY${cn}X`, patientResp: 0,
          lines: [line(svc.code, svc.charge, 0, 1, svc.pos, [{ group: "CO", reason: "4", amount: svc.charge }], ["M76"])] },
        { checkNumber: `CHK${710000 + i}`, checkDate: addDays(submit, 30), checkAmount: partial, claimStatus: "1", payerClaimId: `PAY${cn}Y`, patientResp: 0,
          lines: [line(svc.code, svc.charge, partial, 1, svc.pos, [{ group: "CO", reason: "45", amount: round2(svc.charge - partial) }], ["N362"])] },
        { checkNumber: `CHK${720000 + i}`, checkDate: addDays(submit, 45), checkAmount: finalPaid, claimStatus: "1", payerClaimId: `PAY${cn}Z`, patientResp: 0,
          lines: [line(svc.code, svc.charge, finalPaid, 1, svc.pos, [{ group: "CO", reason: "45", amount: round2(svc.charge - finalPaid) }])] },
      ],
    });
  }

  for (let i = 0; i < 1; i++) {
    const svc = SERVICE_LINES[i + 12];
    const svcDate = addDays(base, 110 + i * 3);
    const submit = addDays(svcDate, 1);
    scenarios.push({
      claimNo: claimNo(), serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 3) % 4], payer: PAYERS[(i + 3) % 6], patient: PATIENTS[(i + 17) % PATIENTS.length],
      diagnosis: DIAGNOSES[(i + 8) % 10], frequency: "1",
      scenarioType: "unmatched_no_835_pend277",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)], remits: [],
    });
  }

  // Matching remits for the former "no 835" slots so most sample claims leave Pend 277
  for (let i = 1; i < 3; i++) {
    const svc = SERVICE_LINES[i + 12];
    const svcDate = addDays(base, 110 + i * 3);
    const submit = addDays(svcDate, 1);
    const cn = claimNo();
    const co = round2(svc.charge * 0.18);
    const paid = round2(svc.charge - co);
    scenarios.push({
      claimNo: cn, serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 3) % 4], payer: PAYERS[(i + 3) % 6], patient: PATIENTS[(i + 17) % PATIENTS.length],
      diagnosis: DIAGNOSES[(i + 8) % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, paid, 1, svc.pos, [], [], svcDate)],
      remits: [{
        checkNumber: `CHK${850000 + i}`,
        checkDate: addDays(submit, 16),
        checkAmount: paid,
        claimStatus: "1",
        payerClaimId: `PAY${cn}`,
        patientResp: 0,
        lines: [line(svc.code, svc.charge, paid, 1, svc.pos, [{ group: "CO", reason: "45", amount: co }], ["N130"], svcDate)],
      }],
    });
  }

  // 8. Multi-date service lines — platform matches on LATEST line date (servicedate_837 / servicedate_835)
  for (let i = 0; i < 2; i++) {
    const earliest = addDays(base, 125 + i * 12);
    const middle = addDays(earliest, 4);
    const latest = addDays(earliest, 9);
    const submit = addDays(latest, 2);
    const cn = claimNo();
    const t0 = SERVICE_LINES[i];
    const t1 = SERVICE_LINES[i + 5];
    const t2 = SERVICE_LINES[i + 8];
    const lines837 = [
      lineOnDate(t0, earliest),
      lineOnDate(t1, middle),
      lineOnDate(t2, latest),
    ];
    const totalCharge = lines837.reduce((s, l) => s + l.charge, 0);
    const paidLines = lines837.map((ln) => {
      const co = round2(ln.charge * 0.12);
      const paid = round2(ln.charge - co);
      return line(ln.code, ln.charge, paid, 1, ln.pos, [{ group: "CO", reason: "45", amount: co }], ["N620"], ln.serviceDate);
    });
    const totalPaid = paidLines.reduce((s, l) => s + l.paid, 0);
    scenarios.push({
      claimNo: cn,
      serviceDate: latest,
      submitDate: submit,
      scenarioType: "multi_date_latest_match",
      lineServiceDates: {
        earliest: earliest.toISOString().slice(0, 10),
        middle: middle.toISOString().slice(0, 10),
        latest: latest.toISOString().slice(0, 10),
        match_key_date: latest.toISOString().slice(0, 10),
        note: "servicedate_837 and servicedate_835 both use MAX(line dates). CLP DTP*472 must be the latest date, not earliest or middle.",
      },
      provider: PROVIDERS[(i + 2) % 4],
      payer: PAYERS[(i + 4) % 6],
      patient: PATIENTS[(i + 10) % PATIENTS.length],
      diagnosis: DIAGNOSES[(i + 4) % 10],
      frequency: "1",
      lines: lines837,
      remits: [{
        checkNumber: `CHK${800000 + i}`,
        checkDate: addDays(submit, 18),
        checkAmount: totalPaid,
        claimStatus: "1",
        payerClaimId: `PAY${cn}`,
        patientResp: 0,
        lines: paidLines,
      }],
      negativeControl835: i === 0 ? {
        checkNumber: "CHK799999",
        checkDate: addDays(submit, 20),
        note: "All SVC line DTP*472 dates set to earliest line date — servicedate_835 MAX becomes earliest, so this 835 should NOT match the 837",
        lines: paidLines.map((ln) => line(ln.code, ln.charge, ln.paid, 1, ln.pos, ln.adjustments, ln.remarkCodes, earliest)),
        checkAmount: totalPaid,
        claimStatus: "1",
        payerClaimId: `PAY${cn}BAD`,
        patientResp: 0,
        expected_match: false,
        wrong_service_date: earliest.toISOString().slice(0, 10),
        correct_service_date: latest.toISOString().slice(0, 10),
      } : null,
    });
  }

  return scenarios;
}

function buildTaxonomyScenarios(startSeq = 29) {
  const base = new Date("2026-03-01");
  let seq = startSeq;
  const claimNo = () => `CLM2025${String(seq++).padStart(5, "0")}`;
  const scenarios = [];

  const taxonomyDenialMeta = {
    scenarioType: "taxonomy_denial_co16_n255",
    denial_reason: {
      carc: "CO-16",
      carc_description: "Claim/service lacks information or has submission/billing error(s)",
      rarc: "N255",
      rarc_description: "Missing/incomplete/invalid taxonomy code",
      platform_note:
        "db_refresh.sql sets Automation=1 (Taxonomy Missing) when RemarkCode=N255, CO-16, InsuranceType=MC, and PayerName LIKE '%DSHS%'",
    },
  };

  const withDshsMedicaid = (claim) => {
    const payer = { ...DSHS_MEDICAID_PAYER };
    const remits = (claim.remits || []).map((remit) => ({
      ...remit,
      payer,
      claimFilingIndicator: "MC",
    }));
    return { ...claim, payer, claimFilingIndicator: "MC", remits };
  };

  // 1. Missing PRV/taxonomy segment on 837 — matching denial 835
  {
    const svc = SERVICE_LINES[0];
    const svcDate = addDays(base, 0);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const claim = withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[0] },
      patient: PATIENTS[0],
      diagnosis: DIAGNOSES[0],
      frequency: "1",
      includeTaxonomy: false,
      taxonomyIssue: "missing_prv_segment",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [buildTaxonomyDenialRemit({ claimNo: cn, serviceDate: svcDate, lines: [line(svc.code, svc.charge)] }, "CHK900001", addDays(submit, 14))],
    });
    claim.remits[0].lines = claim.lines.map((ln) => taxonomyDenialLine(ln.code, ln.charge, ln.pos, svcDate));
    scenarios.push(claim);
  }

  // 2. Invalid taxonomy code on 837 — matching denial 835
  {
    const svc = SERVICE_LINES[1];
    const svcDate = addDays(base, 4);
    const submit = addDays(svcDate, 1);
    const cn = claimNo();
    scenarios.push(withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[1] },
      patient: PATIENTS[1],
      diagnosis: DIAGNOSES[1],
      frequency: "1",
      taxonomyCode: "INVALIDTX",
      taxonomyIssue: "invalid_taxonomy_code",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [buildTaxonomyDenialRemit({ claimNo: cn, serviceDate: svcDate, lines: [line(svc.code, svc.charge)] }, "CHK900002", addDays(submit, 16))],
    }));
  }

  // 3. Truncated/wrong-length taxonomy — matching denial 835
  {
    const svc = SERVICE_LINES[4];
    const svcDate = addDays(base, 8);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const claim = withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[2] },
      patient: PATIENTS[2],
      diagnosis: DIAGNOSES[2],
      frequency: "1",
      taxonomyCode: "207X00000",
      taxonomyIssue: "truncated_taxonomy_code",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [buildTaxonomyDenialRemit({ claimNo: cn, serviceDate: svcDate, lines: [line(svc.code, svc.charge)] }, "CHK900003", addDays(submit, 18))],
    });
    claim.remits[0].lines = claim.lines.map((ln) => taxonomyDenialLine(ln.code, ln.charge, ln.pos, svcDate));
    scenarios.push(claim);
  }

  // 4. Multi-line claim, both lines denied CO-16 + N255 — matching 835
  {
    const svcDate = addDays(base, 12);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const templates = [SERVICE_LINES[5], SERVICE_LINES[6]];
    const lines837 = templates.map((t) => line(t.code, t.charge, 0, 1, t.pos));
    const claim = withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[3] },
      patient: PATIENTS[3],
      diagnosis: DIAGNOSES[3],
      frequency: "1",
      taxonomyCode: "",
      includeTaxonomy: false,
      taxonomyIssue: "missing_taxonomy_multi_line",
      lines: lines837,
      remits: [buildTaxonomyDenialRemit({ claimNo: cn, serviceDate: svcDate, lines: lines837 }, "CHK900004", addDays(submit, 20))],
    });
    claim.remits[0].lines = lines837.map((ln) => taxonomyDenialLine(ln.code, ln.charge, ln.pos, svcDate));
    scenarios.push(claim);
  }

  // 5. Pending — 837 with bad taxonomy, no 835 yet (stays Pend 277; not Automation=1)
  {
    const svc = SERVICE_LINES[7];
    const svcDate = addDays(base, 16);
    const submit = addDays(svcDate, 1);
    const cn = claimNo();
    scenarios.push(withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[0] },
      patient: PATIENTS[4],
      diagnosis: DIAGNOSES[4],
      frequency: "1",
      taxonomyCode: "BADCODE99",
      taxonomyIssue: "invalid_taxonomy_pending_remit",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)],
      remits: [],
    }));
  }

  // 6. Base matching claim for negative controls (valid match reference)
  {
    const svc = SERVICE_LINES[2];
    const svcDate = addDays(base, 20);
    const submit = addDays(svcDate, 2);
    const cn = claimNo();
    const lines837 = [line(svc.code, svc.charge, 0, 1, svc.pos)];
    const claim = withDshsMedicaid({
      ...taxonomyDenialMeta,
      claimNo: cn,
      serviceDate: svcDate,
      submitDate: submit,
      provider: { ...PROVIDERS[1] },
      patient: PATIENTS[5],
      diagnosis: DIAGNOSES[5],
      frequency: "1",
      includeTaxonomy: false,
      taxonomyIssue: "missing_prv_with_negative_controls",
      lines: lines837,
      remits: [buildTaxonomyDenialRemit({ claimNo: cn, serviceDate: svcDate, lines: lines837 }, "CHK900006", addDays(submit, 25))],
      negativeControl835s: [
        {
          // Break platform match keys (charge) so these stay true NOMATCH files and cannot win rn=1.
          checkNumber: "CHK900061",
          checkDate: addDays(submit, 17),
          note: "Wrong CARC (CO-197) and charge +0.01 — must not join via matching_837_835",
          expected_match: false,
          reason: "wrong_carc",
          lines: [line(svc.code, svc.charge + 0.01, 0, 1, svc.pos, [{ group: "CO", reason: "197", amount: svc.charge + 0.01 }], ["N255"], svcDate)],
        },
        {
          checkNumber: "CHK900062",
          checkDate: addDays(submit, 18),
          note: "Wrong RARC (N522) and charge +0.01 — must not join via matching_837_835",
          expected_match: false,
          reason: "wrong_rarc",
          lines: [line(svc.code, svc.charge + 0.01, 0, 1, svc.pos, [{ group: "CO", reason: "16", amount: svc.charge + 0.01 }], ["N522"], svcDate)],
        },
        {
          checkNumber: "CHK900063",
          checkDate: addDays(submit, 19),
          note: "Wrong service date on 835 line DTP*472 — should NOT match 837",
          expected_match: false,
          reason: "wrong_service_date",
          wrong_service_date: addDays(svcDate, -7).toISOString().slice(0, 10),
          lines: [taxonomyDenialLine(svc.code, svc.charge, svc.pos, addDays(svcDate, -7))],
        },
        {
          checkNumber: "CHK900064",
          checkDate: addDays(submit, 20),
          note: "Wrong charge amount on 835 SVC — should NOT match 837 CLM02 total",
          expected_match: false,
          reason: "wrong_charge_amount",
          lines: [taxonomyDenialLine(svc.code, svc.charge + 50, svc.pos, svcDate)],
        },
      ],
    });
    claim.remits[0].lines = lines837.map((ln) => taxonomyDenialLine(ln.code, ln.charge, ln.pos, svcDate));
    scenarios.push(claim);
  }

  return scenarios;
}

function writeScenarioBatch(scenarios, fileIdStart, manifestClaims, negativeControls) {
  let fileId = fileIdStart;
  scenarios.forEach((claim) => {
    const fname837 = `837_${claim.claimNo}_${fmtDate(claim.serviceDate)}.edi`;
    fs.writeFileSync(path.join(DIR_837, fname837), build837(claim, fileId), "utf8");
    const remitFiles = [];
    claim.remits.forEach((remit, rIdx) => {
      const remitFileId = fileId * 10 + rIdx + 1;
      const fname835 = `835_${remit.checkNumber}_${claim.claimNo}.edi`;
      fs.writeFileSync(path.join(DIR_835, fname835), build835(claim, remit, remitFileId), "utf8");
      remitFiles.push({
        file: fname835,
        check_number: remit.checkNumber,
        check_date: remit.checkDate.toISOString().slice(0, 10),
        claim_status: remit.claimStatus,
        paid_amount: fmtMoney(remit.lines.reduce((s, l) => s + l.paid, 0)),
        expected_match: true,
        denial_codes: remit.lines.some((l) => (l.adjustments || []).some((a) => a.group === "CO" && a.reason === "16"))
          ? { carc: "CO-16", rarc: (remit.lines[0].remarkCodes || [])[0] || "N255" }
          : null,
      });
    });

    (claim.negativeControl835s || []).forEach((nc) => {
      const ncRemit = {
        checkNumber: nc.checkNumber,
        checkDate: nc.checkDate,
        checkAmount: 0,
        claimStatus: "4",
        payerClaimId: `PAY${claim.claimNo}${nc.reason || "BAD"}`,
        patientResp: 0,
        lines: nc.lines,
      };
      const suffix = nc.reason ? `_NOMATCH_${nc.reason.toUpperCase()}` : "_NOMATCH";
      const ncFile = `835_${nc.checkNumber}_${claim.claimNo}${suffix}.edi`;
      const ncFileId = fileId * 10 + 90 + (claim.negativeControl835s.indexOf(nc) + 1);
      const clpDate = nc.wrong_service_date
        ? new Date(nc.wrong_service_date + "T12:00:00")
        : claim.serviceDate;
      fs.writeFileSync(path.join(DIR_835, ncFile), build835(claim, ncRemit, ncFileId, { clpServiceDate: clpDate }), "utf8");
      negativeControls.push({
        file: ncFile,
        pairs_with_837: fname837,
        claim_no: claim.claimNo,
        expected_match: false,
        reason: nc.reason,
        note: nc.note,
        wrong_service_date: nc.wrong_service_date || null,
      });
    });

    if (claim.negativeControl835) {
      const nc = claim.negativeControl835;
      const ncRemit = {
        checkNumber: nc.checkNumber,
        checkDate: nc.checkDate,
        checkAmount: nc.checkAmount,
        claimStatus: nc.claimStatus,
        payerClaimId: nc.payerClaimId,
        patientResp: nc.patientResp,
        lines: nc.lines,
      };
      const ncFile = `835_${nc.checkNumber}_${claim.claimNo}_NOMATCH.edi`;
      fs.writeFileSync(
        path.join(DIR_835, ncFile),
        build835(claim, ncRemit, fileId * 10 + 99, {
          clpServiceDate: nc.wrong_service_date ? new Date(nc.wrong_service_date + "T12:00:00") : claim.serviceDate,
        }),
        "utf8"
      );
      negativeControls.push({
        file: ncFile,
        pairs_with_837: fname837,
        claim_no: claim.claimNo,
        expected_match: false,
        reason: nc.reason || "negative_control",
        note: nc.note,
      });
    }

    const claimTotal = claim.lines.reduce((s, l) => s + l.charge, 0);
    const entry = {
      claim_no: claim.claimNo,
      claim_no_first: claimPrefix(claim.claimNo),
      "837_file": fname837,
      service_date: claim.serviceDate.toISOString().slice(0, 10),
      total_charge: fmtMoney(claimTotal),
      diagnosis: claim.diagnosis,
      patient: `${claim.patient.first} ${claim.patient.last}`,
      payer: claim.payer.name,
      provider: claim.provider.name,
      taxonomy_issue: claim.taxonomyIssue || null,
      taxonomy_on_837: claim.includeTaxonomy === false
        ? "(PRV segment omitted)"
        : (claim.taxonomyCode !== undefined ? claim.taxonomyCode : claim.provider.taxonomy),
      service_lines: claim.lines.map((l) => ({
        code: l.code,
        charge: fmtMoney(l.charge),
        service_date: (l.serviceDate || claim.serviceDate).toISOString().slice(0, 10),
      })),
      match_keys: {
        claim_no_first: claimPrefix(claim.claimNo),
        service_date: claim.serviceDate.toISOString().slice(0, 10),
        charge_amount: fmtMoney(claimTotal),
      },
      "835_files": remitFiles.map((r, idx) => ({
        ...r,
        match_validation: validateRemitMatch(claim, claim.remits[idx]),
      })),
      "835_count": remitFiles.length,
    };
    if (claim.scenarioType) entry.scenario_type = claim.scenarioType;
    if (claim.denial_reason) entry.denial_reason = claim.denial_reason;
    if (claim.lineServiceDates) entry.line_service_dates = claim.lineServiceDates;
    manifestClaims.push(entry);
    fileId++;
  });
  return fileId;
}

function generateTaxonomyOnly() {
  fs.mkdirSync(DIR_837, { recursive: true });
  fs.mkdirSync(DIR_835, { recursive: true });
  const manifestPath = path.join(OUTPUT_DIR, "MANIFEST.json");
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : { description: "Synthetic 837P/835 sample files", matching_logic: MATCHING_LOGIC, claims: [], stats: {} };

  const scenarios = buildTaxonomyScenarios(29);
  const existingClaimNos = new Set((manifest.claims || []).map((c) => c.claim_no));
  const newScenarios = scenarios.filter((c) => !existingClaimNos.has(c.claimNo));
  const negativeControls = (manifest.negative_controls || []).filter(
    (nc) => !newScenarios.some((c) => c.claimNo === nc.claim_no)
  );
  const fileIdStart = (manifest.claims?.length || 0) + 1;
  const ncBefore = negativeControls.length;

  writeScenarioBatch(newScenarios, fileIdStart, manifest.claims, negativeControls);

  manifest.taxonomy_denial_logic = {
    description: "Claims denied for invalid or missing taxonomy code",
    carc: "CO-16",
    rarc: "N255",
    edi_835_segments: "CAS*CO*16*{amount}~ and LQ*HE*N255~ per service line",
    platform_sql: "backend/sql/db_refresh.sql sets Automation=1 when RemarkCode=N255 and AdjustmentGroup=CO, AdjustmentReason=16",
  };
  manifest.negative_controls = negativeControls;
  const taxonomyClaims = manifest.claims.filter((c) => c.scenario_type === "taxonomy_denial_co16_n255");
  const taxonomyClaimNos = new Set(taxonomyClaims.map((c) => c.claim_no));
  manifest.stats = {
    ...(manifest.stats || {}),
    total_837_files: manifest.claims.length,
    total_835_files: manifest.claims.reduce((s, c) => s + (c["835_count"] || 0), 0) + negativeControls.length,
    taxonomy_denial_scenarios: taxonomyClaims.length,
    taxonomy_denial_negative_controls: negativeControls.filter((n) => taxonomyClaimNos.has(n.claim_no)).length,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Added ${newScenarios.length} taxonomy denial 837/835 scenario(s)`);
  console.log(`Taxonomy claims: ${newScenarios.map((c) => c.claimNo).join(", ")}`);
  console.log(`Negative control 835 files added: ${negativeControls.length - ncBefore}`);
}

function main() {
  if (process.argv.includes("--taxonomy-only")) {
    generateTaxonomyOnly();
    return;
  }
  fs.mkdirSync(DIR_837, { recursive: true });
  fs.mkdirSync(DIR_835, { recursive: true });
  const scenarios = [...buildScenarios(), ...buildTaxonomyScenarios(29)];
  const manifest = {
    description: "Synthetic 837P/835 sample files aligned to platform matching_837_835 logic",
    matching_logic: MATCHING_LOGIC,
    claims: [],
    stats: {},
  };

  let fileId = 1, total837 = 0, total835 = 0;
  const negativeControls = [];

  scenarios.forEach((claim) => {
    const fname837 = `837_${claim.claimNo}_${fmtDate(claim.serviceDate)}.edi`;
    fs.writeFileSync(path.join(DIR_837, fname837), build837(claim, fileId), "utf8");
    total837++;
    const remitFiles = [];
    claim.remits.forEach((remit, rIdx) => {
      const remitFileId = fileId * 10 + rIdx + 1;
      const fname835 = `835_${remit.checkNumber}_${claim.claimNo}.edi`;
      fs.writeFileSync(path.join(DIR_835, fname835), build835(claim, remit, remitFileId), "utf8");
      total835++;
      remitFiles.push({
        file: fname835,
        check_number: remit.checkNumber,
        check_date: remit.checkDate.toISOString().slice(0, 10),
        claim_status: remit.claimStatus,
        paid_amount: fmtMoney(remit.lines.reduce((s, l) => s + l.paid, 0)),
        expected_match: true,
      });
    });

    if (claim.negativeControl835) {
      const nc = claim.negativeControl835;
      const ncRemit = {
        checkNumber: nc.checkNumber,
        checkDate: nc.checkDate,
        checkAmount: nc.checkAmount,
        claimStatus: nc.claimStatus,
        payerClaimId: nc.payerClaimId,
        patientResp: nc.patientResp,
        lines: nc.lines,
      };
      const ncFile = `835_${nc.checkNumber}_${claim.claimNo}_NOMATCH.edi`;
      const ncFileId = fileId * 10 + 99;
      fs.writeFileSync(
        path.join(DIR_835, ncFile),
        build835(claim, ncRemit, ncFileId, { clpServiceDate: nc.wrong_service_date ? new Date(nc.wrong_service_date + "T12:00:00") : claim.serviceDate }),
        "utf8"
      );
      total835++;
      negativeControls.push({
        file: ncFile,
        pairs_with_837: fname837,
        claim_no: claim.claimNo,
        expected_match: false,
        reason: "835 line dates resolve to wrong MAX service date",
        wrong_max_service_date: nc.wrong_service_date,
        correct_max_service_date: nc.correct_service_date,
        note: nc.note,
      });
    }

    (claim.negativeControl835s || []).forEach((nc, ncIdx) => {
      const ncRemit = {
        checkNumber: nc.checkNumber,
        checkDate: nc.checkDate,
        checkAmount: 0,
        claimStatus: "4",
        payerClaimId: `PAY${claim.claimNo}${nc.reason || "BAD"}`,
        patientResp: 0,
        lines: nc.lines,
      };
      const suffix = nc.reason ? `_NOMATCH_${nc.reason.toUpperCase()}` : "_NOMATCH";
      const ncFile = `835_${nc.checkNumber}_${claim.claimNo}${suffix}.edi`;
      const ncFileId = fileId * 10 + 90 + ncIdx + 1;
      const clpDate = nc.wrong_service_date
        ? new Date(nc.wrong_service_date + "T12:00:00")
        : claim.serviceDate;
      fs.writeFileSync(path.join(DIR_835, ncFile), build835(claim, ncRemit, ncFileId, { clpServiceDate: clpDate }), "utf8");
      total835++;
      negativeControls.push({
        file: ncFile,
        pairs_with_837: fname837,
        claim_no: claim.claimNo,
        expected_match: false,
        reason: nc.reason,
        note: nc.note,
        wrong_service_date: nc.wrong_service_date || null,
      });
    });

    const claimTotal = claim.lines.reduce((s, l) => s + l.charge, 0);
    const entry = {
      claim_no: claim.claimNo,
      claim_no_first: claimPrefix(claim.claimNo),
      "837_file": fname837,
      service_date: claim.serviceDate.toISOString().slice(0, 10),
      total_charge: fmtMoney(claimTotal),
      diagnosis: claim.diagnosis,
      patient: `${claim.patient.first} ${claim.patient.last}`,
      payer: claim.payer.name,
      provider: claim.provider.name,
      service_lines: claim.lines.map((l) => ({
        code: l.code,
        charge: fmtMoney(l.charge),
        service_date: (l.serviceDate || claim.serviceDate).toISOString().slice(0, 10),
      })),
      match_keys: {
        claim_no_first: claimPrefix(claim.claimNo),
        service_date: claim.serviceDate.toISOString().slice(0, 10),
        charge_amount: fmtMoney(claimTotal),
      },
      "835_files": remitFiles.map((r, idx) => ({
        ...r,
        match_validation: validateRemitMatch(claim, claim.remits[idx]),
      })),
      "835_count": remitFiles.length,
    };
    if (claim.scenarioType) entry.scenario_type = claim.scenarioType;
    if (claim.denial_reason) entry.denial_reason = claim.denial_reason;
    if (claim.taxonomyIssue) entry.taxonomy_issue = claim.taxonomyIssue;
    if (claim.includeTaxonomy === false || claim.taxonomyCode !== undefined) {
      entry.taxonomy_on_837 = claim.includeTaxonomy === false
        ? "(PRV segment omitted)"
        : (claim.taxonomyCode !== undefined ? claim.taxonomyCode : claim.provider.taxonomy);
    }
    if (claim.lineServiceDates) entry.line_service_dates = claim.lineServiceDates;
    manifest.claims.push(entry);
    fileId++;
  });

  manifest.negative_controls = negativeControls;
  const taxonomyClaims = manifest.claims.filter((c) => c.scenario_type === "taxonomy_denial_co16_n255");
  manifest.taxonomy_denial_logic = {
    description: "Claims denied for invalid or missing taxonomy code",
    carc: "CO-16",
    rarc: "N255",
    edi_835_segments: "CAS*CO*16*{amount}~ and LQ*HE*N255~ per service line",
    platform_sql: "backend/sql/db_refresh.sql sets Automation=1 when RemarkCode=N255 and AdjustmentGroup=CO, AdjustmentReason=16",
  };
  manifest.stats = {
    total_837_files: total837,
    total_835_files: total835,
    multi_date_scenarios: manifest.claims.filter((c) => c.scenario_type === "multi_date_latest_match").length,
    negative_control_835_files: negativeControls.length,
    claims_with_multiple_835: manifest.claims.filter((c) => c["835_count"] > 1).length,
    claims_without_835: manifest.claims.filter((c) => c["835_count"] === 0).length,
    taxonomy_denial_scenarios: taxonomyClaims.length,
    taxonomy_denial_negative_controls: negativeControls.filter((n) =>
      taxonomyClaims.some((c) => c.claim_no === n.claim_no)
    ).length,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "MANIFEST.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Generated ${total837} x 837 files`);
  console.log(`Generated ${total835} x 835 files`);
  console.log(`Multi-date scenarios: ${manifest.stats.multi_date_scenarios}`);
  console.log(`Negative control 835 files: ${manifest.stats.negative_control_835_files}`);
  console.log(`Claims with multiple 835: ${manifest.stats.claims_with_multiple_835}`);
  console.log(`Claims without 835 (pending): ${manifest.stats.claims_without_835}`);
}

main();
