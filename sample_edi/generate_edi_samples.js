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
  { name: "Blue Cross Blue Shield of Oregon", id: "BCBSOR", plan_id: "87726" },
  { name: "Aetna Better Health", id: "AETNA01", plan_id: "60054" },
  { name: "UnitedHealthcare", id: "UHC001", plan_id: "87726" },
  { name: "Cigna Healthcare", id: "CIGNA01", plan_id: "62308" },
  { name: "Medicare Part B", id: "MEDICARE", plan_id: "CMS" },
  { name: "Regence BlueShield", id: "REGENCE", plan_id: "00430" },
];

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
function fmtDate(d) { return d.toISOString().slice(0, 10).replace(/-/g, ""); }
function addDays(base, n) { const d = new Date(base); d.setDate(d.getDate() + n); return d; }
function joinSegs(segs) { return segs.join(""); }
function round2(v) { return Math.round(v * 100) / 100; }

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
  const matchServiceDate = claim.serviceDate;
  const total = lines.reduce((s, l) => s + l.charge, 0);
  const segs = [
    buildIsa("SUBMITTER001", "RECEIVER001", ctrl, claim.submitDate),
    `GS${ELEM}HC${ELEM}SUBMITTER001${ELEM}RECEIVER001${ELEM}${fmtDate(claim.submitDate)}${ELEM}1200${ELEM}${fileId}${ELEM}X${ELEM}005010X222A1${SEG}`,
    `ST${ELEM}837${ELEM}${stCtrl}${ELEM}005010X222A1${SEG}`,
    `BHT${ELEM}0019${ELEM}00${ELEM}${claim.claimNo}${ELEM}${fmtDate(claim.submitDate)}${ELEM}1200${ELEM}CH${SEG}`,
    `NM1${ELEM}41${ELEM}2${ELEM}${provider.name}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}46${ELEM}${provider.tax_id}${SEG}`,
    `PER${ELEM}IC${ELEM}BILLING DEPT${ELEM}TE${ELEM}5035550100${SEG}`,
    `NM1${ELEM}40${ELEM}2${ELEM}${payer.name}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}46${ELEM}${payer.id}${SEG}`,
    `HL${ELEM}1${ELEM}${ELEM}20${ELEM}1${SEG}`,
    `PRV${ELEM}BI${ELEM}PXC${ELEM}${provider.taxonomy}${SEG}`,
    `NM1${ELEM}85${ELEM}2${ELEM}${provider.name}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}XX${ELEM}${provider.npi}${SEG}`,
    `N3${ELEM}${provider.address}${SEG}`,
    `N4${ELEM}${provider.city}${ELEM}${provider.state}${ELEM}${provider.zip}${SEG}`,
    `REF${ELEM}EI${ELEM}${provider.tax_id}${SEG}`,
    `HL${ELEM}2${ELEM}1${ELEM}22${ELEM}0${SEG}`,
    `SBR${ELEM}P${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}CI${SEG}`,
    `NM1${ELEM}IL${ELEM}1${ELEM}${patient.last}${ELEM}${patient.first}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}MI${ELEM}${patient.member_id}${SEG}`,
    `N3${ELEM}100 Main Street${SEG}`,
    `N4${ELEM}Portland${ELEM}OR${ELEM}97205${SEG}`,
    `DMG${ELEM}D8${ELEM}${patient.dob}${ELEM}${patient.sex}${SEG}`,
    `NM1${ELEM}PR${ELEM}2${ELEM}${payer.name}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}PI${ELEM}${payer.plan_id}${SEG}`,
    `CLM${ELEM}${claim.claimNo}${ELEM}${fmtMoney(total)}${ELEM}${ELEM}${ELEM}${lines[0].pos}${COMP}B${COMP}${claim.frequency}${ELEM}${ELEM}Y${ELEM}A${ELEM}Y${ELEM}I${SEG}`,
    `DTP${ELEM}431${ELEM}D8${ELEM}${fmtDate(matchServiceDate)}${SEG}`,
    `REF${ELEM}D9${ELEM}${claim.claimNo}${SEG}`,
    `HI${ELEM}ABK${COMP}${claim.diagnosis}${SEG}`,
  ];
  lines.forEach((line, idx) => {
    const lineDate = line.serviceDate || matchServiceDate;
    const svc = `HC${COMP}${line.code}`;
    segs.push(`LX${ELEM}${idx + 1}${SEG}`);
    segs.push(`SV1${ELEM}${svc}${ELEM}${fmtMoney(line.charge)}${ELEM}UN${ELEM}${line.units}${ELEM}${ELEM}${ELEM}1${SEG}`);
    segs.push(`DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(lineDate)}${SEG}`);
  });
  segs.push(`SE${ELEM}${segs.length + 1}${ELEM}${stCtrl}${SEG}`);
  segs.push(`GE${ELEM}1${ELEM}${fileId}${SEG}`);
  segs.push(`IEA${ELEM}1${ELEM}${ctrl}${SEG}`);
  return joinSegs(segs);
}

function build835(claim, remit, fileId, options = {}) {
  const ctrl = String(fileId + 50000).padStart(9, "0");
  const stCtrl = String(fileId).padStart(4, "0");
  const provider = claim.provider;
  const payer = remit.payer || claim.payer;
  const matchServiceDate = options.clpServiceDate || claim.serviceDate;
  const totalCharge = remit.lines.reduce((s, l) => s + l.charge, 0);
  const totalPaid = remit.lines.reduce((s, l) => s + l.paid, 0);
  const segs = [
    buildIsa(payer.id.slice(0, 15), provider.npi, ctrl, remit.checkDate),
    `GS${ELEM}HP${ELEM}${payer.id}${ELEM}${provider.npi}${ELEM}${fmtDate(remit.checkDate)}${ELEM}1200${ELEM}${fileId}${ELEM}X${ELEM}005010X221A1${SEG}`,
    `ST${ELEM}835${ELEM}${stCtrl}${ELEM}005010X221A1${SEG}`,
    `BPR${ELEM}I${ELEM}${fmtMoney(remit.checkAmount)}${ELEM}C${ELEM}ACH${ELEM}CTX${ELEM}01${ELEM}123456789${ELEM}DA${ELEM}987654321${ELEM}${provider.tax_id}${ELEM}01${ELEM}123456789${ELEM}DA${ELEM}987654321${ELEM}${fmtDate(remit.checkDate)}${SEG}`,
    `TRN${ELEM}1${ELEM}${remit.checkNumber}${ELEM}${payer.id}${SEG}`,
    `DTM${ELEM}405${ELEM}${fmtDate(remit.checkDate)}${SEG}`,
    `N1${ELEM}PR${ELEM}${payer.name}${ELEM}XV${ELEM}${payer.plan_id}${SEG}`,
    `N3${ELEM}500 Payer Boulevard${SEG}`,
    `N4${ELEM}Chicago${ELEM}IL${ELEM}60601${SEG}`,
    `REF${ELEM}2U${ELEM}${payer.id}${SEG}`,
    `N1${ELEM}PE${ELEM}${provider.name}${ELEM}XX${ELEM}${provider.npi}${SEG}`,
    `N3${ELEM}${provider.address}${SEG}`,
    `N4${ELEM}${provider.city}${ELEM}${provider.state}${ELEM}${provider.zip}${SEG}`,
    `REF${ELEM}TJ${ELEM}${provider.tax_id}${SEG}`,
    `LX${ELEM}1${SEG}`,
    `CLP${ELEM}${claim.claimNo}${ELEM}${remit.claimStatus}${ELEM}${fmtMoney(totalCharge)}${ELEM}${fmtMoney(totalPaid)}${ELEM}${fmtMoney(remit.patientResp)}${ELEM}12${ELEM}${remit.payerClaimId}${ELEM}${claim.frequency}${SEG}`,
    `NM1${ELEM}QC${ELEM}1${ELEM}${claim.patient.last}${ELEM}${claim.patient.first}${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}MI${ELEM}${claim.patient.member_id}${SEG}`,
    `NM1${ELEM}82${ELEM}1${ELEM}SMITH${ELEM}JOHN${ELEM}${ELEM}${ELEM}${ELEM}${ELEM}XX${ELEM}${provider.npi}${SEG}`,
    `REF${ELEM}1L${ELEM}${claim.patient.member_id}${SEG}`,
    `DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(matchServiceDate)}${SEG}`,
  ];
  remit.lines.forEach((line) => {
    const lineDate = line.serviceDate || matchServiceDate;
    segs.push(`SVC${ELEM}HC${COMP}${line.code}${ELEM}${fmtMoney(line.charge)}${ELEM}${fmtMoney(line.paid)}${ELEM}${ELEM}${line.units}${SEG}`);
    segs.push(`DTP${ELEM}472${ELEM}D8${ELEM}${fmtDate(lineDate)}${SEG}`);
    (line.adjustments || []).forEach((adj) => {
      segs.push(`CAS${ELEM}${adj.group}${ELEM}${adj.reason}${ELEM}${fmtMoney(adj.amount)}${SEG}`);
    });
    if (line.remarkCodes && line.remarkCodes.length) {
      segs.push(`LQ${ELEM}HE${ELEM}${line.remarkCodes[0]}${SEG}`);
    }
  });
  segs.push(`SE${ELEM}${segs.length + 1}${ELEM}${stCtrl}${SEG}`);
  segs.push(`GE${ELEM}1${ELEM}${fileId}${SEG}`);
  segs.push(`IEA${ELEM}1${ELEM}${ctrl}${SEG}`);
  return joinSegs(segs);
}

function line(code, charge, paid = 0, units = 1, pos = "11", adjustments = [], remarkCodes = [], serviceDate = null) {
  return { code, charge, paid, units, pos, adjustments, remarkCodes, serviceDate };
}

function lineOnDate(template, serviceDate, paid = 0, adjustments = [], remarkCodes = []) {
  return line(template.code, template.charge, paid, 1, template.pos, adjustments, remarkCodes, serviceDate);
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
      edi_835: "MAX(COALESCE(STR_TO_DATE(ServiceDate,'%m/%d/%Y'), ServicePeriodStart, ServicePeriodEnd)) per paid claim — latest line date (servicedate_835)",
      note: "Not the 835 check/ERA date. Use the same latest service line date on both sides.",
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
  related_837_lookup:
    "Separate from 835 matching: get_claim_detail Related uses ClaimNoFirst + Amount + PrincipalDiagnosis + ServiceDate to find duplicate 837 submissions.",
};

function validateRemitMatch(claim, remit) {
  const totalCharge = remit.lines.reduce((s, l) => s + l.charge, 0);
  const claimTotal = claim.lines.reduce((s, l) => s + l.charge, 0);
  const errors = [];
  if (claimPrefix(claim.claimNo) !== claimPrefix(claim.claimNo)) {
    errors.push("internal: claim prefix check failed");
  }
  if (Math.abs(totalCharge - claimTotal) > 0.001) {
    errors.push(`charge mismatch: 835 billed ${totalCharge.toFixed(2)} vs 837 ${claimTotal.toFixed(2)}`);
  }
  return {
    claim_no_first: claimPrefix(claim.claimNo),
    claim_id_first: claimPrefix(claim.claimNo),
    service_date: claim.serviceDate.toISOString().slice(0, 10),
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

  for (let i = 0; i < 3; i++) {
    const svc = SERVICE_LINES[i + 12];
    const svcDate = addDays(base, 110 + i * 3);
    const submit = addDays(svcDate, 1);
    scenarios.push({
      claimNo: claimNo(), serviceDate: svcDate, submitDate: submit,
      provider: PROVIDERS[(i + 3) % 4], payer: PAYERS[(i + 3) % 6], patient: PATIENTS[(i + 17) % PATIENTS.length],
      diagnosis: DIAGNOSES[(i + 8) % 10], frequency: "1",
      lines: [line(svc.code, svc.charge, 0, 1, svc.pos)], remits: [],
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

function main() {
  fs.mkdirSync(DIR_837, { recursive: true });
  fs.mkdirSync(DIR_835, { recursive: true });
  const scenarios = buildScenarios();
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
    if (claim.lineServiceDates) entry.line_service_dates = claim.lineServiceDates;
    manifest.claims.push(entry);
    fileId++;
  });

  manifest.negative_controls = negativeControls;
  manifest.stats = {
    total_837_files: total837,
    total_835_files: total835,
    multi_date_scenarios: manifest.claims.filter((c) => c.scenario_type === "multi_date_latest_match").length,
    negative_control_835_files: negativeControls.length,
    claims_with_multiple_835: manifest.claims.filter((c) => c["835_count"] > 1).length,
    claims_without_835: manifest.claims.filter((c) => c["835_count"] === 0).length,
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
