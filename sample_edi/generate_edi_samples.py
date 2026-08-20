#!/usr/bin/env python3
"""Generate realistic matching X12 837P and 835 sample files."""

from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

ELEM = "*"
SEG = "~"
COMP = ":"

OUTPUT_DIR = Path(__file__).parent
DIR_837 = OUTPUT_DIR / "837"
DIR_835 = OUTPUT_DIR / "835"

# Fake but realistic provider / payer pool
PROVIDERS = [
    {
        "name": "Summit Orthopedic Associates",
        "npi": "1234567890",
        "tax_id": "123456789",
        "taxonomy": "207X00000X",
        "address": "1200 Medical Center Dr",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
    },
    {
        "name": "Cascade Family Medicine",
        "npi": "1987654321",
        "tax_id": "987654321",
        "taxonomy": "207Q00000X",
        "address": "455 Willow Creek Ln",
        "city": "Seattle",
        "state": "WA",
        "zip": "98101",
    },
    {
        "name": "Pacific Spine & Rehab",
        "npi": "1122334455",
        "tax_id": "556677889",
        "taxonomy": "208VP0014X",
        "address": "890 Harbor View Blvd",
        "city": "San Diego",
        "state": "CA",
        "zip": "92101",
    },
    {
        "name": "Northwest Urgent Care PLLC",
        "npi": "1678901234",
        "tax_id": "334455667",
        "taxonomy": "261QU0200X",
        "address": "2200 Lakeview Ave",
        "city": "Boise",
        "state": "ID",
        "zip": "83702",
    },
]

PAYERS = [
    {"name": "Blue Cross Blue Shield of Oregon", "id": "BCBSOR", "id_qual": "PI", "plan_id": "87726", "address": "500 Payer Boulevard", "city": "Chicago", "state": "IL", "zip": "60601"},
    {"name": "Aetna Better Health", "id": "AETNA01", "id_qual": "PI", "plan_id": "60054", "address": "151 Farmington Ave", "city": "Hartford", "state": "CT", "zip": "06156"},
    {"name": "UnitedHealthcare", "id": "UHC001", "id_qual": "PI", "plan_id": "87726", "address": "9900 Bren Rd E", "city": "Minnetonka", "state": "MN", "zip": "55343"},
    {"name": "Cigna Healthcare", "id": "CIGNA01", "id_qual": "PI", "plan_id": "62308", "address": "900 Cottage Grove Rd", "city": "Bloomfield", "state": "CT", "zip": "06002"},
    {"name": "Medicare Part B", "id": "MEDICARE", "id_qual": "PI", "plan_id": "CMS", "address": "PO Box 30141", "city": "Salt Lake City", "state": "UT", "zip": "84130"},
    {"name": "Regence BlueShield", "id": "REGENCE", "id_qual": "PI", "plan_id": "00430", "address": "100 SW Market St", "city": "Portland", "state": "OR", "zip": "97201"},
]

PATIENTS = [
    {"first": "Emily", "last": "Johnson", "member_id": "MBR100001", "dob": "19850314", "sex": "F"},
    {"first": "Michael", "last": "Chen", "member_id": "MBR100002", "dob": "19720822", "sex": "M"},
    {"first": "Sarah", "last": "Martinez", "member_id": "MBR100003", "dob": "19901105", "sex": "F"},
    {"first": "David", "last": "Thompson", "member_id": "MBR100004", "dob": "19651230", "sex": "M"},
    {"first": "Jessica", "last": "Williams", "member_id": "MBR100005", "dob": "19880717", "sex": "F"},
    {"first": "Robert", "last": "Anderson", "member_id": "MBR100006", "dob": "19550408", "sex": "M"},
    {"first": "Amanda", "last": "Garcia", "member_id": "MBR100007", "dob": "19930425", "sex": "F"},
    {"first": "James", "last": "Wilson", "member_id": "MBR100008", "dob": "19770912", "sex": "M"},
    {"first": "Lisa", "last": "Brown", "member_id": "MBR100009", "dob": "19820103", "sex": "F"},
    {"first": "Daniel", "last": "Taylor", "member_id": "MBR100010", "dob": "19960819", "sex": "M"},
    {"first": "Karen", "last": "Moore", "member_id": "MBR100011", "dob": "19680327", "sex": "F"},
    {"first": "Christopher", "last": "Lee", "member_id": "MBR100012", "dob": "19741215", "sex": "M"},
    {"first": "Michelle", "last": "Davis", "member_id": "MBR100013", "dob": "19910502", "sex": "F"},
    {"first": "Kevin", "last": "Miller", "member_id": "MBR100014", "dob": "19591028", "sex": "M"},
    {"first": "Rachel", "last": "Jackson", "member_id": "MBR100015", "dob": "19840611", "sex": "F"},
    {"first": "Brian", "last": "White", "member_id": "MBR100016", "dob": "19730107", "sex": "M"},
    {"first": "Nicole", "last": "Harris", "member_id": "MBR100017", "dob": "19971223", "sex": "F"},
    {"first": "Steven", "last": "Clark", "member_id": "MBR100018", "dob": "19660704", "sex": "M"},
    {"first": "Laura", "last": "Lewis", "member_id": "MBR100019", "dob": "19890930", "sex": "F"},
    {"first": "Jason", "last": "Walker", "member_id": "MBR100020", "dob": "19750618", "sex": "M"},
]

DIAGNOSES = [
    ("M25512", "Pain in left shoulder"),
    ("M5450", "Low back pain, unspecified"),
    ("J069", "Acute upper respiratory infection, unspecified"),
    ("E119", "Type 2 diabetes mellitus without complications"),
    ("I10", "Essential (primary) hypertension"),
    ("S83201A", "Unspecified tear of medial meniscus, right knee, initial"),
    ("M79604", "Pain in right leg"),
    ("R509", "Fever, unspecified"),
    ("Z0000", "Encounter for general adult medical examination"),
    ("M1711", "Unilateral primary osteoarthritis, right knee"),
]

SERVICE_LINES = [
    {"code": "99213", "desc": "Office visit est level 3", "charge": Decimal("150.00"), "pos": "11"},
    {"code": "99214", "desc": "Office visit est level 4", "charge": Decimal("210.00"), "pos": "11"},
    {"code": "99203", "desc": "Office visit new level 3", "charge": Decimal("175.00"), "pos": "11"},
    {"code": "99204", "desc": "Office visit new level 4", "charge": Decimal("265.00"), "pos": "11"},
    {"code": "97110", "desc": "Therapeutic exercises", "charge": Decimal("85.00"), "pos": "11"},
    {"code": "97140", "desc": "Manual therapy", "charge": Decimal("75.00"), "pos": "11"},
    {"code": "20610", "desc": "Arthrocentesis major joint", "charge": Decimal("320.00"), "pos": "11"},
    {"code": "73030", "desc": "X-ray shoulder", "charge": Decimal("95.00"), "pos": "11"},
    {"code": "73721", "desc": "MRI lower extremity", "charge": Decimal("850.00"), "pos": "11"},
    {"code": "99285", "desc": "Emergency dept visit high", "charge": Decimal("450.00"), "pos": "23"},
    {"code": "36415", "desc": "Routine venipuncture", "charge": Decimal("25.00"), "pos": "11"},
    {"code": "80053", "desc": "Comprehensive metabolic panel", "charge": Decimal("45.00"), "pos": "11"},
    {"code": "29881", "desc": "Knee arthroscopy/surgery", "charge": Decimal("1850.00"), "pos": "24"},
    {"code": "27447", "desc": "Total knee arthroplasty", "charge": Decimal("4200.00"), "pos": "24"},
    {"code": "99232", "desc": "Subsequent hospital care", "charge": Decimal("180.00"), "pos": "21"},
]

CODE_MODIFIERS = {
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
}


def default_modifiers(code: str) -> list[str]:
    return list(CODE_MODIFIERS.get(code, []))


def svc_composite(code: str, modifiers: list[str] | None = None) -> str:
    parts = [code, *(modifiers or [])[:4]]
    return f"HC{COMP}{COMP.join(parts)}"


def build_svc_segment(line: ServiceLine) -> str:
    mods = default_modifiers(line.code)
    if line.modifier:
        mods = line.modifier.split(":") if ":" in line.modifier else [line.modifier]
    paid_comp = svc_composite(line.code, mods)
    parts = ["SVC", paid_comp, fmt_money(line.charge), fmt_money(line.paid), "", str(line.units or 1)]
    return ELEM.join(parts) + SEG


def line_allowed_amount(line: ServiceLine) -> Decimal:
    adj_total = sum(Decimal(str(adj.amount)) for adj in line.adjustments)
    return max(Decimal("0.00"), (Decimal(str(line.charge)) - adj_total).quantize(Decimal("0.01")))


def append_835_service_line_segments(
    segments: list[str],
    line: ServiceLine,
    claim: Claim837,
    provider: dict,
    line_idx: int,
    match_service_date: date,
) -> None:
    line_date = getattr(line, "service_date", None) or match_service_date
    mods = default_modifiers(line.code)
    if line.modifier and ":" not in line.modifier:
        mods = [line.modifier]
    ctrl_no = f"{''.join(ch for ch in claim.claim_no if ch.isdigit())[-12:]}{line_idx + 1:02d}"[:20]
    auth_no = f"AUTH{line.code}{line_idx + 1:02d}"[:50]
    allowed = line_allowed_amount(line)
    pr_amount = sum(Decimal(str(adj.amount)) for adj in line.adjustments if adj.group == "PR")

    segments.append(build_svc_segment(line))
    segments.append(f"DTP{ELEM}472{ELEM}D8{ELEM}{fmt_date(line_date)}{SEG}")
    segments.append(f"DTP{ELEM}150{ELEM}{fmt_date(line_date)}{SEG}")
    segments.append(f"DTP{ELEM}151{ELEM}{fmt_date(line_date)}{SEG}")
    segments.append(f"REF{ELEM}6R{ELEM}{ctrl_no}{SEG}")
    segments.append(f"REF{ELEM}G1{ELEM}{auth_no}{SEG}")
    segments.append(f"REF{ELEM}BB{ELEM}{auth_no}{SEG}")
    segments.append(f"REF{ELEM}1D{ELEM}{str(line.pos or '11').zfill(2)}{SEG}")
    segments.append(f"REF{ELEM}BT{ELEM}POL{claim.patient['member_id']}{SEG}")
    segments.append(f"REF{ELEM}9B{ELEM}REB{line_idx + 1}{SEG}")

    for adj in line.adjustments:
        segments.append(f"CAS{ELEM}{adj.group}{ELEM}{adj.reason}{ELEM}{fmt_money(adj.amount)}{SEG}")

    segments.append(f"NM1{ELEM}82{ELEM}1{ELEM}SMITH{ELEM}JOHN{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}XX{ELEM}{provider['npi']}{SEG}")
    segments.append(f"REF{ELEM}TJ{ELEM}{provider['tax_id']}{SEG}")
    segments.append(f"REF{ELEM}1C{ELEM}{provider['tax_id']}{SEG}")
    segments.append(f"REF{ELEM}G2{ELEM}{provider['npi']}{SEG}")
    segments.append(f"REF{ELEM}HPI{ELEM}{provider['npi']}{SEG}")
    segments.append(f"REF{ELEM}SY{ELEM}{provider['tax_id']}{SEG}")
    segments.append(f"REF{ELEM}LU{ELEM}{provider['npi']}{SEG}")

    if allowed > 0:
        segments.append(f"AMT{ELEM}B6{ELEM}{fmt_money(allowed)}{SEG}")
    if pr_amount > 0:
        segments.append(f"AMT{ELEM}F5{ELEM}{fmt_money(pr_amount)}{SEG}")
    if line.paid > 0:
        segments.append(f"AMT{ELEM}T{ELEM}{fmt_money(line.paid)}{SEG}")

    segments.append(f"QTY{ELEM}ZK{ELEM}{line.units or 1}{SEG}")
    segments.append(f"QTY{ELEM}NE{ELEM}{line.units or 1}{SEG}")

    for code in line.remark_codes:
        segments.append(f"LQ{ELEM}HE{ELEM}{code}{SEG}")


@dataclass
class Adjustment:
    group: str
    reason: str
    amount: Decimal


@dataclass
class ServiceLine:
    code: str
    charge: Decimal
    paid: Decimal
    units: int = 1
    modifier: str = ""
    pos: str = "11"
    service_date: date | None = None
    adjustments: list[Adjustment] = field(default_factory=list)
    remark_codes: list[str] = field(default_factory=list)


@dataclass
class Remit835:
    check_number: str
    check_date: date
    check_amount: Decimal
    claim_status: str  # 1=paid, 2=secondary, 4=denied, 22=reversal
    payer_claim_id: str
    lines: list[ServiceLine]
    patient_resp: Decimal = Decimal("0.00")
    payer: dict | None = None
    include_claim_level_cas: bool = True
    claim_level_adjustments: list[dict] | None = None


@dataclass
class Claim837:
    claim_no: str
    service_date: date
    submit_date: date
    provider: dict
    payer: dict
    patient: dict
    diagnosis: str
    lines: list[ServiceLine]
    frequency: str = "1"
    remits: list[Remit835] = field(default_factory=list)

    @property
    def total_charge(self) -> Decimal:
        return sum(line.charge for line in self.lines)


def fmt_money(value: Decimal) -> str:
    return f"{value:.2f}"


def format_carc_reason(reason: str) -> str:
    raw = str(reason or "").strip()
    if raw.isdigit():
        return raw.zfill(3)[-3:]
    return raw[:3] if len(raw) >= 3 else raw


def format_cas_qty(qty: int | float | str) -> str:
    return str(max(1, int(round(float(qty or 1)))))


def normalize_adj_group(group: str) -> str:
    return str(group or "CO").strip().upper()[:2]


def fmt_date(d: date) -> str:
    return d.strftime("%Y%m%d")


def join_segments(segments: list[str]) -> str:
    return "".join(segments)


def build_isa(sender: str, receiver: str, ctrl: str, dt: date) -> str:
    return (
        f"ISA{ELEM}00{ELEM}          {ELEM}00{ELEM}          {ELEM}ZZ{ELEM}{sender:<15}{ELEM}"
        f"ZZ{ELEM}{receiver:<15}{ELEM}{fmt_date(dt)[2:]}{ELEM}1200{ELEM}^{ELEM}00501{ELEM}"
        f"{ctrl:>9}{ELEM}0{ELEM}P{ELEM}{COMP}{SEG}"
    )


def latest_line_date(lines: list[ServiceLine], fallback: date) -> date:
    dates = [getattr(line, "service_date", None) or fallback for line in lines]
    return max(dates) if dates else fallback


def build_bpr_segment(remit: Remit835, payer: dict) -> str:
    payer_identifier = str(payer.get("id", "PAYER01"))[:10]
    parts = [
        "BPR", "I", fmt_money(remit.check_amount), "C", "ACH", "CTX",
        "01", "0210", "DA", "123456",
        payer_identifier, "",
        "01", "0211", "DA", "987654",
        fmt_date(remit.check_date),
    ]
    return ELEM.join(parts) + SEG


def build_837(claim: Claim837, file_id: int) -> str:
    ctrl = f"{file_id:09d}"
    st_ctrl = f"{file_id:04d}"
    provider = claim.provider
    payer = claim.payer
    patient = claim.patient
    total = claim.total_charge
    match_service_date = latest_line_date(claim.lines, claim.service_date)

    segments = [
        build_isa("SUBMITTER001", "RECEIVER001", ctrl, claim.submit_date),
        f"GS{ELEM}HC{ELEM}SUBMITTER001{ELEM}RECEIVER001{ELEM}{fmt_date(claim.submit_date)}{ELEM}1200{ELEM}{file_id}{ELEM}X{ELEM}005010X222A1{SEG}",
        f"ST{ELEM}837{ELEM}{st_ctrl}{ELEM}005010X222A1{SEG}",
        f"BHT{ELEM}0019{ELEM}00{ELEM}{claim.claim_no}{ELEM}{fmt_date(claim.submit_date)}{ELEM}1200{ELEM}CH{SEG}",
        f"NM1{ELEM}41{ELEM}2{ELEM}{provider['name']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}46{ELEM}{provider['tax_id']}{SEG}",
        f"PER{ELEM}IC{ELEM}BILLING DEPT{ELEM}TE{ELEM}5035550100{SEG}",
        f"NM1{ELEM}40{ELEM}2{ELEM}{payer['name']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}46{ELEM}{payer['id']}{SEG}",
        f"HL{ELEM}1{ELEM}{ELEM}20{ELEM}1{SEG}",
        f"PRV{ELEM}BI{ELEM}PXC{ELEM}{provider['taxonomy']}{SEG}",
        f"NM1{ELEM}85{ELEM}2{ELEM}{provider['name']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}XX{ELEM}{provider['npi']}{SEG}",
        f"N3{ELEM}{provider['address']}{SEG}",
        f"N4{ELEM}{provider['city']}{ELEM}{provider['state']}{ELEM}{provider['zip']}{SEG}",
        f"REF{ELEM}EI{ELEM}{provider['tax_id']}{SEG}",
        f"HL{ELEM}2{ELEM}1{ELEM}22{ELEM}0{SEG}",
        f"SBR{ELEM}P{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}CI{SEG}",
        f"NM1{ELEM}IL{ELEM}1{ELEM}{patient['last']}{ELEM}{patient['first']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}MI{ELEM}{patient['member_id']}{SEG}",
        f"N3{ELEM}100 Main Street{SEG}",
        f"N4{ELEM}Portland{ELEM}OR{ELEM}97205{SEG}",
        f"DMG{ELEM}D8{ELEM}{patient['dob']}{ELEM}{patient['sex']}{SEG}",
        f"NM1{ELEM}PR{ELEM}2{ELEM}{payer['name']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}PI{ELEM}{payer['plan_id']}{SEG}",
        f"N3{ELEM}{payer.get('address', '500 Payer Boulevard')}{SEG}",
        f"N4{ELEM}{payer.get('city', 'Chicago')}{ELEM}{payer.get('state', 'IL')}{ELEM}{payer.get('zip', '60601')}{SEG}",
        f"CLM{ELEM}{claim.claim_no}{ELEM}{fmt_money(total)}{ELEM}{ELEM}{ELEM}{claim.lines[0].pos}{COMP}B{COMP}{claim.frequency}{ELEM}{ELEM}Y{ELEM}A{ELEM}Y{ELEM}I{SEG}",
        f"DTP{ELEM}472{ELEM}D8{ELEM}{fmt_date(match_service_date)}{SEG}",
        f"REF{ELEM}D9{ELEM}{claim.claim_no}{SEG}",
        f"REF{ELEM}EA{ELEM}{claim.claim_no}{SEG}",
        f"HI{ELEM}ABK{COMP}{claim.diagnosis}{SEG}",
        f"NM1{ELEM}82{ELEM}1{ELEM}SMITH{ELEM}JOHN{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}XX{ELEM}{provider['npi']}{SEG}",
    ]

    for idx, line in enumerate(claim.lines, start=1):
        mods = default_modifiers(line.code)
        if line.modifier:
            mods = line.modifier.split(":") if ":" in line.modifier else [line.modifier]
        svc = svc_composite(line.code, mods)
        line_date = getattr(line, "service_date", None) or match_service_date
        segments.extend(
            [
                f"LX{ELEM}{idx}{SEG}",
                f"SV1{ELEM}{svc}{ELEM}{fmt_money(line.charge)}{ELEM}UN{ELEM}{line.units}{ELEM}{line.pos}{ELEM}{ELEM}1{SEG}",
                f"DTP{ELEM}472{ELEM}D8{ELEM}{fmt_date(line_date)}{SEG}",
                f"REF{ELEM}6R{ELEM}{claim.claim_no}{idx:02d}{SEG}",
            ]
        )

    seg_count = len(segments) + 1
    segments.append(f"SE{ELEM}{seg_count}{ELEM}{st_ctrl}{SEG}")
    segments.append(f"GE{ELEM}1{ELEM}{file_id}{SEG}")
    segments.append(f"IEA{ELEM}1{ELEM}{ctrl}{SEG}")
    return join_segments(segments)


def fiscal_period_date(check_date: date) -> str:
    """CCYYMMDD for PLB02; importers store as FiscalPeriodDate (e.g. 12/31/YYYY)."""
    return f"{check_date.year}1231"


def default_provider_level_adjustments(claim: Claim837, remit: Remit835) -> list[dict]:
    check_digits = "".join(ch for ch in str(remit.check_number) if ch.isdigit())[-6:].zfill(6)
    base_suffix = 539303
    rows = []
    for idx, line in enumerate(remit.lines):
        charge = Decimal(str(line.charge))
        amount = -(max(Decimal("2.16"), (charge * Decimal("0.0144")).quantize(Decimal("0.01"))))
        rows.append(
            {
                "reason": "L6",
                "identifier": f"{check_digits}-{base_suffix + idx * 6884:06d}",
                "amount": amount,
            }
        )
    return rows


def format_plb_composite(adj: dict) -> str:
    reason = adj.get("reason", "L6")
    ref_id = str(adj.get("identifier", "")).strip()
    if not ref_id:
        return reason
    ref_id = ref_id.replace("-", ":")
    composite_prefix = f"{reason}:"
    if ref_id.startswith(composite_prefix):
        return ref_id
    return f"{reason}:{ref_id}"


def build_plb_segments(provider: dict, remit: Remit835, claim: Claim837) -> list[str]:
    adjustments = getattr(remit, "provider_level_adjustments", None) or default_provider_level_adjustments(
        claim, remit
    )
    if not adjustments:
        return []

    provider_id = provider["npi"]
    fiscal_date = fiscal_period_date(remit.check_date)
    segments: list[str] = []
    for i in range(0, len(adjustments), 6):
        batch = adjustments[i : i + 6]
        parts = ["PLB", provider_id, fiscal_date]
        for adj in batch:
            parts.extend([format_plb_composite(adj), fmt_money(adj["amount"])])
        segments.append(ELEM.join(parts) + SEG)
    return segments


def resolve_claim_level_adjustments(remit: Remit835) -> list[dict]:
    explicit = remit.claim_level_adjustments
    if explicit:
        return [
            {
                "group": normalize_adj_group(adj["group"]),
                "reason": format_carc_reason(adj["reason"]),
                "amount": Decimal(str(adj["amount"])).quantize(Decimal("0.01")),
                "qty": int(adj.get("qty", 1)),
            }
            for adj in explicit
        ]

    grouped: dict[str, dict] = {}
    for line in remit.lines:
        for adj in line.adjustments:
            group = normalize_adj_group(adj.group)
            reason = format_carc_reason(adj.reason)
            key = f"{group}|{reason}"
            row = grouped.get(key) or {
                "group": group,
                "reason": reason,
                "amount": Decimal("0.00"),
                "qty": 0,
            }
            row["amount"] = (row["amount"] + Decimal(str(adj.amount))).quantize(Decimal("0.01"))
            row["qty"] += int(getattr(line, "units", 1) or 1)
            grouped[key] = row

    adjustments = [row for row in grouped.values() if row["amount"] > 0]
    if not adjustments:
        total_charge = sum(Decimal(str(line.charge)) for line in remit.lines)
        total_paid = sum(Decimal(str(line.paid)) for line in remit.lines)
        patient_resp = Decimal(str(remit.patient_resp or 0))
        total_units = sum(int(getattr(line, "units", 1) or 1) for line in remit.lines)
        co_amount = (total_charge - total_paid - patient_resp).quantize(Decimal("0.01"))
        if co_amount > 0:
            adjustments.append(
                {"group": "CO", "reason": format_carc_reason("45"), "amount": co_amount, "qty": total_units}
            )
        if patient_resp > 0:
            pr_reason = format_carc_reason(getattr(remit, "pr_reason_code", None) or "2")
            adjustments.append(
                {"group": "PR", "reason": pr_reason, "amount": patient_resp, "qty": total_units}
            )
    return adjustments


def append_claim_level_cas_segments(segments: list[str], remit: Remit835) -> None:
    if remit.include_claim_level_cas is False:
        return
    adjustments = resolve_claim_level_adjustments(remit)
    if not adjustments:
        return
    by_group: dict[str, list[dict]] = {}
    for adj in adjustments:
        by_group.setdefault(adj["group"], []).append(adj)

    for group, group_adjs in by_group.items():
        for i in range(0, len(group_adjs), 6):
            batch = group_adjs[i : i + 6]
            parts = ["CAS", group]
            for adj in batch:
                parts.extend([adj["reason"], fmt_money(adj["amount"]), format_cas_qty(adj.get("qty", 1))])
            segments.append(ELEM.join(parts) + SEG)


def append_835_claim_date_segments(segments: list[str], service_date: date, check_date: date) -> None:
    segments.append(f"DTM{ELEM}232{ELEM}{fmt_date(service_date)}{SEG}")
    segments.append(f"DTM{ELEM}233{ELEM}{fmt_date(service_date)}{SEG}")
    segments.append(f"DTM{ELEM}050{ELEM}{fmt_date(check_date)}{SEG}")
    segments.append(f"DTP{ELEM}472{ELEM}D8{ELEM}{fmt_date(service_date)}{SEG}")


def build_835(claim: Claim837, remit: Remit835, file_id: int) -> str:
    ctrl = f"{file_id + 50000:09d}"
    st_ctrl = f"{file_id:04d}"
    provider = claim.provider
    payer = remit.payer or claim.payer
    match_service_date = latest_line_date(remit.lines, claim.service_date)
    total_charge = sum(line.charge for line in remit.lines)
    total_paid = sum(line.paid for line in remit.lines)
    patient_resp = remit.patient_resp

    segments = [
        build_isa(payer["id"][:15].ljust(15).strip(), provider["npi"], ctrl, remit.check_date),
        f"GS{ELEM}HP{ELEM}{payer['id']}{ELEM}{provider['npi']}{ELEM}{fmt_date(remit.check_date)}{ELEM}1200{ELEM}{file_id}{ELEM}X{ELEM}005010X221A1{SEG}",
        f"ST{ELEM}835{ELEM}{st_ctrl}{ELEM}005010X221A1{SEG}",
        build_bpr_segment(remit, payer),
        f"TRN{ELEM}1{ELEM}{remit.check_number}{ELEM}{payer['id']}{SEG}",
        f"DTM{ELEM}405{ELEM}{fmt_date(remit.check_date)}{SEG}",
        f"N1{ELEM}PR{ELEM}{payer['name']}{ELEM}XV{ELEM}{payer['plan_id']}{SEG}",
        f"N3{ELEM}{payer.get('address', '500 Payer Boulevard')}{SEG}",
        f"N4{ELEM}{payer.get('city', 'Chicago')}{ELEM}{payer.get('state', 'IL')}{ELEM}{payer.get('zip', '60601')}{SEG}",
        f"REF{ELEM}2U{ELEM}{payer['id']}{SEG}",
        f"N1{ELEM}PE{ELEM}{provider['name']}{ELEM}XX{ELEM}{provider['npi']}{SEG}",
        f"N3{ELEM}{provider['address']}{SEG}",
        f"N4{ELEM}{provider['city']}{ELEM}{provider['state']}{ELEM}{provider['zip']}{SEG}",
        f"REF{ELEM}TJ{ELEM}{provider['tax_id']}{SEG}",
        f"LX{ELEM}1{SEG}",
        f"CLP{ELEM}{claim.claim_no}{ELEM}{remit.claim_status}{ELEM}{fmt_money(total_charge)}{ELEM}{fmt_money(total_paid)}{ELEM}{fmt_money(patient_resp)}{ELEM}12{ELEM}{remit.payer_claim_id}{ELEM}{claim.frequency}{SEG}",
        f"NM1{ELEM}QC{ELEM}1{ELEM}{claim.patient['last']}{ELEM}{claim.patient['first']}{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}MI{ELEM}{claim.patient['member_id']}{SEG}",
        f"NM1{ELEM}82{ELEM}1{ELEM}SMITH{ELEM}JOHN{ELEM}{ELEM}{ELEM}{ELEM}{ELEM}XX{ELEM}{provider['npi']}{SEG}",
        f"REF{ELEM}EA{ELEM}{provider['tax_id']}{SEG}",
        f"REF{ELEM}1L{ELEM}{claim.patient['member_id']}{SEG}",
    ]

    append_835_claim_date_segments(segments, match_service_date, remit.check_date)
    append_claim_level_cas_segments(segments, remit)

    for line_idx, line in enumerate(remit.lines):
        append_835_service_line_segments(
            segments, line, claim, provider, line_idx, match_service_date
        )

    segments.extend(build_plb_segments(provider, remit, claim))

    seg_count = len(segments) + 1
    segments.append(f"SE{ELEM}{seg_count}{ELEM}{st_ctrl}{SEG}")
    segments.append(f"GE{ELEM}1{ELEM}{file_id}{SEG}")
    segments.append(f"IEA{ELEM}1{ELEM}{ctrl}{SEG}")
    return join_segments(segments)


def make_line_from_template(template: dict, charge_override: Decimal | None = None) -> ServiceLine:
    charge = charge_override or template["charge"]
    code = template["code"]
    modifier = default_modifiers(code)
    return ServiceLine(
        code=code,
        charge=charge,
        paid=Decimal("0.00"),
        pos=template.get("pos", "11"),
        modifier=":".join(modifier) if modifier else "",
    )


def build_scenarios() -> list[Claim837]:
    random.seed(42)
    scenarios: list[Claim837] = []
    base_date = date(2025, 10, 1)

    def next_claim_no(seq: int) -> str:
        return f"CLM2025{seq:05d}"

    seq = 1

    # 1. Full payment - single line
    for i in range(5):
        svc = SERVICE_LINES[i]
        prov = PROVIDERS[i % len(PROVIDERS)]
        payer = PAYERS[i % len(PAYERS)]
        pat = PATIENTS[i]
        svc_date = base_date + timedelta(days=i * 3)
        submit = svc_date + timedelta(days=2)
        claim_no = next_claim_no(seq)
        seq += 1
        line = make_line_from_template(svc)
        line.paid = line.charge
        claim = Claim837(
            claim_no=claim_no,
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=payer,
            patient=pat,
            diagnosis=DIAGNOSES[i % len(DIAGNOSES)][0],
            lines=[line],
        )
        claim.remits.append(
            Remit835(
                check_number=f"CHK{100000 + i}",
                check_date=submit + timedelta(days=14),
                check_amount=line.charge,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}",
                lines=[ServiceLine(code=line.code, charge=line.charge, paid=line.charge, units=1)],
            )
        )
        scenarios.append(claim)

    # 2. Contractual adjustment CO-45 + patient PR-1
    for i in range(5):
        svc = SERVICE_LINES[i + 5]
        prov = PROVIDERS[(i + 1) % len(PROVIDERS)]
        payer = PAYERS[(i + 1) % len(PAYERS)]
        pat = PATIENTS[i + 5]
        svc_date = base_date + timedelta(days=20 + i * 2)
        submit = svc_date + timedelta(days=1)
        claim_no = next_claim_no(seq)
        seq += 1
        charge = svc["charge"]
        contractual = (charge * Decimal("0.20")).quantize(Decimal("0.01"))
        allowed = charge - contractual
        copay = Decimal("25.00")
        paid = allowed - copay
        line = ServiceLine(code=svc["code"], charge=charge, paid=paid, units=1)
        claim = Claim837(
            claim_no=claim_no,
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=payer,
            patient=pat,
            diagnosis=DIAGNOSES[(i + 3) % len(DIAGNOSES)][0],
            lines=[line],
        )
        remit_line = ServiceLine(
            code=svc["code"],
            charge=charge,
            paid=paid,
            units=1,
            adjustments=[
                Adjustment("CO", "45", contractual),
                Adjustment("PR", "1", copay),
            ],
            remark_codes=["N130"],
        )
        claim.remits.append(
            Remit835(
                check_number=f"CHK{200000 + i}",
                check_date=submit + timedelta(days=21),
                check_amount=paid,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}",
                lines=[remit_line],
                patient_resp=copay,
            )
        )
        scenarios.append(claim)

    # 3. Denied claims
    for i in range(3):
        svc = SERVICE_LINES[i + 10]
        prov = PROVIDERS[(i + 2) % len(PROVIDERS)]
        payer = PAYERS[(i + 2) % len(PAYERS)]
        pat = PATIENTS[i + 10]
        svc_date = base_date + timedelta(days=35 + i * 4)
        submit = svc_date + timedelta(days=3)
        claim_no = next_claim_no(seq)
        seq += 1
        charge = svc["charge"]
        line = ServiceLine(code=svc["code"], charge=charge, paid=Decimal("0.00"), units=1)
        claim = Claim837(
            claim_no=claim_no,
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=payer,
            patient=pat,
            diagnosis=DIAGNOSES[(i + 5) % len(DIAGNOSES)][0],
            lines=[line],
        )
        remit_line = ServiceLine(
            code=svc["code"],
            charge=charge,
            paid=Decimal("0.00"),
            units=1,
            adjustments=[Adjustment("CO", "197", charge)],
            remark_codes=["M15", "N522"],
        )
        claim.remits.append(
            Remit835(
                check_number=f"CHK{300000 + i}",
                check_date=submit + timedelta(days=18),
                check_amount=Decimal("0.00"),
                claim_status="4",
                payer_claim_id=f"PAY{claim_no}",
                lines=[remit_line],
            )
        )
        scenarios.append(claim)

    # 4. Multi-line claims
    for i in range(4):
        prov = PROVIDERS[i % len(PROVIDERS)]
        payer = PAYERS[i % len(PAYERS)]
        pat = PATIENTS[i + 13]
        svc_date = base_date + timedelta(days=50 + i * 5)
        submit = svc_date + timedelta(days=2)
        claim_no = next_claim_no(seq)
        seq += 1
        templates = [SERVICE_LINES[i], SERVICE_LINES[i + 1], SERVICE_LINES[i + 2]]
        lines = [make_line_from_template(t) for t in templates]
        total = sum(l.charge for l in lines)
        paid_lines = []
        total_paid = Decimal("0.00")
        total_pr = Decimal("0.00")
        for ln, tmpl in zip(lines, templates):
            co_adj = (ln.charge * Decimal("0.15")).quantize(Decimal("0.01"))
            pr_adj = Decimal("15.00") if i % 2 == 0 else Decimal("0.00")
            ln_paid = ln.charge - co_adj - pr_adj
            total_paid += ln_paid
            total_pr += pr_adj
            paid_lines.append(
                ServiceLine(
                    code=ln.code,
                    charge=ln.charge,
                    paid=ln_paid,
                    units=1,
                    adjustments=[
                        Adjustment("CO", "45", co_adj),
                        *([Adjustment("PR", "3", pr_adj)] if pr_adj else []),
                    ],
                    remark_codes=["N290"] if pr_adj else [],
                )
            )
        claim = Claim837(
            claim_no=claim_no,
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=payer,
            patient=pat,
            diagnosis=DIAGNOSES[i % len(DIAGNOSES)][0],
            lines=lines,
        )
        claim.remits.append(
            Remit835(
                check_number=f"CHK{400000 + i}",
                check_date=submit + timedelta(days=25),
                check_amount=total_paid,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}",
                lines=paid_lines,
                patient_resp=total_pr,
            )
        )
        scenarios.append(claim)

    # 5. One 837 -> multiple 835 (primary partial + final payment)
    for i in range(4):
        svc = SERVICE_LINES[i + 3]
        prov = PROVIDERS[(i + 1) % len(PROVIDERS)]
        primary = PAYERS[i % len(PAYERS)]
        secondary = PAYERS[(i + 2) % len(PAYERS)]
        pat = PATIENTS[i + 3]
        svc_date = base_date + timedelta(days=70 + i * 6)
        submit = svc_date + timedelta(days=1)
        claim_no = next_claim_no(seq)
        seq += 1
        charge = svc["charge"]
        line = ServiceLine(code=svc["code"], charge=charge, paid=Decimal("0.00"), units=1)
        claim = Claim837(
            claim_no=claim_no,
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=primary,
            patient=pat,
            diagnosis=DIAGNOSES[(i + 2) % len(DIAGNOSES)][0],
            lines=[line],
        )
        primary_co = (charge * Decimal("0.25")).quantize(Decimal("0.01"))
        primary_paid = charge - primary_co - Decimal("30.00")
        claim.remits.append(
            Remit835(
                check_number=f"CHK{500000 + i}",
                check_date=submit + timedelta(days=20),
                check_amount=primary_paid,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}A",
                lines=[
                    ServiceLine(
                        code=svc["code"],
                        charge=charge,
                        paid=primary_paid,
                        units=1,
                        adjustments=[
                            Adjustment("CO", "45", primary_co),
                            Adjustment("PR", "2", Decimal("30.00")),
                        ],
                        remark_codes=["N179"],
                    )
                ],
                patient_resp=Decimal("30.00"),
                payer=primary,
            )
        )
        secondary_paid = Decimal("30.00")
        claim.remits.append(
            Remit835(
                check_number=f"CHK{600000 + i}",
                check_date=submit + timedelta(days=35),
                check_amount=secondary_paid,
                claim_status="2",
                payer_claim_id=f"PAY{claim_no}B",
                lines=[
                    ServiceLine(
                        code=svc["code"],
                        charge=charge,
                        paid=secondary_paid,
                        units=1,
                        adjustments=[Adjustment("OA", "23", secondary_paid)],
                        remark_codes=["N89"],
                    )
                ],
                patient_resp=Decimal("0.00"),
                payer=secondary,
            )
        )
        scenarios.append(claim)

    # 6. One 837 -> 3 remits (denial, correction, final pay)
    for i in range(2):
        svc = SERVICE_LINES[i + 8]
        prov = PROVIDERS[i]
        payer = PAYERS[i + 1]
        pat = PATIENTS[i + 16]
        svc_date = base_date + timedelta(days=95 + i * 7)
        submit = svc_date + timedelta(days=2)
        claim_no = next_claim_no(seq)
        seq += 1
        charge = svc["charge"]
        line = ServiceLine(code=svc["code"], charge=charge, paid=Decimal("0.00"), units=1)
        claim = Claim837(
            claim_no=f"{claim_no}-1",
            service_date=svc_date,
            submit_date=submit,
            provider=prov,
            payer=payer,
            patient=pat,
            diagnosis=DIAGNOSES[i + 7][0],
            lines=[line],
            frequency="7",
        )
        claim.remits.append(
            Remit835(
                check_number=f"CHK{700000 + i}",
                check_date=submit + timedelta(days=15),
                check_amount=Decimal("0.00"),
                claim_status="4",
                payer_claim_id=f"PAY{claim_no}X",
                lines=[
                    ServiceLine(
                        code=svc["code"],
                        charge=charge,
                        paid=Decimal("0.00"),
                        units=1,
                        adjustments=[Adjustment("CO", "4", charge)],
                        remark_codes=["M76"],
                    )
                ],
            )
        )
        partial = (charge * Decimal("0.50")).quantize(Decimal("0.01"))
        claim.remits.append(
            Remit835(
                check_number=f"CHK{710000 + i}",
                check_date=submit + timedelta(days=30),
                check_amount=partial,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}Y",
                lines=[
                    ServiceLine(
                        code=svc["code"],
                        charge=charge,
                        paid=partial,
                        units=1,
                        adjustments=[Adjustment("CO", "45", charge - partial)],
                        remark_codes=["N362"],
                    )
                ],
            )
        )
        final_paid = charge - partial
        claim.remits.append(
            Remit835(
                check_number=f"CHK{720000 + i}",
                check_date=submit + timedelta(days=45),
                check_amount=final_paid,
                claim_status="1",
                payer_claim_id=f"PAY{claim_no}Z",
                lines=[
                    ServiceLine(
                        code=svc["code"],
                        charge=charge,
                        paid=final_paid,
                        units=1,
                        adjustments=[Adjustment("CO", "45", charge - final_paid)],
                    )
                ],
            )
        )
        scenarios.append(claim)

    # 7. Unpaid 837 only (no matching 835 yet)
    for i in range(3):
        svc = SERVICE_LINES[i + 12]
        prov = PROVIDERS[(i + 3) % len(PROVIDERS)]
        payer = PAYERS[(i + 3) % len(PAYERS)]
        pat = PATIENTS[i + 18]
        svc_date = base_date + timedelta(days=110 + i * 3)
        submit = svc_date + timedelta(days=1)
        claim_no = next_claim_no(seq)
        seq += 1
        line = make_line_from_template(svc)
        scenarios.append(
            Claim837(
                claim_no=claim_no,
                service_date=svc_date,
                submit_date=submit,
                provider=prov,
                payer=payer,
                patient=pat,
                diagnosis=DIAGNOSES[(i + 8) % len(DIAGNOSES)][0],
                lines=[line],
                remits=[],
            )
        )

    return scenarios


def write_files(scenarios: list[Claim837]) -> dict:
    DIR_837.mkdir(parents=True, exist_ok=True)
    DIR_835.mkdir(parents=True, exist_ok=True)

    manifest = {
        "description": "Synthetic 837P/835 sample files with matching claim keys",
        "matching_rules": [
            "ClaimNo (837) must match ClaimID (835) — first segment before dash is primary match key",
            "ServiceDate (837) must match DTP*472 date on 835",
            "Total charge on 837 must match CLP03 / SVC02 charge total on 835",
        ],
        "claims": [],
        "stats": {},
    }

    file_id = 1
    total_837 = 0
    total_835 = 0

    for claim in scenarios:
        content_837 = build_837(claim, file_id)
        fname_837 = f"837_{claim.claim_no}_{fmt_date(claim.service_date)}.edi"
        (DIR_837 / fname_837).write_text(content_837, encoding="utf-8")
        total_837 += 1

        remit_files = []
        for r_idx, remit in enumerate(claim.remits, start=1):
            remit_file_id = file_id * 10 + r_idx
            content_835 = build_835(claim, remit, remit_file_id)
            fname_835 = f"835_{remit.check_number}_{claim.claim_no}.edi"
            (DIR_835 / fname_835).write_text(content_835, encoding="utf-8")
            total_835 += 1
            remit_files.append(
                {
                    "file": fname_835,
                    "check_number": remit.check_number,
                    "check_date": remit.check_date.isoformat(),
                    "claim_status": remit.claim_status,
                    "paid_amount": fmt_money(sum(l.paid for l in remit.lines)),
                }
            )

        manifest["claims"].append(
            {
                "claim_no": claim.claim_no,
                "837_file": fname_837,
                "service_date": claim.service_date.isoformat(),
                "total_charge": fmt_money(claim.total_charge),
                "diagnosis": claim.diagnosis,
                "patient": f"{claim.patient['first']} {claim.patient['last']}",
                "payer": claim.payer["name"],
                "provider": claim.provider["name"],
                "service_lines": [
                    {"code": l.code, "charge": fmt_money(l.charge)} for l in claim.lines
                ],
                "835_files": remit_files,
                "835_count": len(remit_files),
            }
        )
        file_id += 1

    manifest["stats"] = {
        "total_837_files": total_837,
        "total_835_files": total_835,
        "claims_with_multiple_835": sum(1 for c in manifest["claims"] if c["835_count"] > 1),
        "claims_without_835": sum(1 for c in manifest["claims"] if c["835_count"] == 0),
    }

    (OUTPUT_DIR / "MANIFEST.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    scenarios = build_scenarios()
    manifest = write_files(scenarios)
    print(f"Generated {manifest['stats']['total_837_files']} x 837 files")
    print(f"Generated {manifest['stats']['total_835_files']} x 835 files")
    print(f"Claims with multiple 835: {manifest['stats']['claims_with_multiple_835']}")
    print(f"Claims without 835 (pending): {manifest['stats']['claims_without_835']}")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
