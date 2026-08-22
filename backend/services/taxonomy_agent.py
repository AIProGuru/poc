"""Taxonomy Missing AI agent: compare 837 vs Client Management facility config and fix PRV*BI."""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

SEG_TERMINATORS = ("~", "\n", "\r")


def _detect_separators(edi: str) -> Tuple[str, str]:
    """Return (element_sep, segment_sep)."""
    text = edi or ""
    if text.startswith("ISA") and len(text) > 105:
        return text[3], text[105]
    # Fallback for POC samples
    if "~" in text:
        return "*", "~"
    return "*", "\n"


def split_segments(edi: str) -> Tuple[List[str], str, str]:
    elem, seg = _detect_separators(edi)
    raw = edi.replace("\r\n", "\n").replace("\r", "\n")
    if seg != "\n":
        parts = [p.strip() for p in raw.split(seg)]
    else:
        parts = [p.strip() for p in raw.split("\n")]
    segments = [p for p in parts if p]
    return segments, elem, seg


def join_segments(segments: List[str], seg_sep: str) -> str:
    if seg_sep in ("\n", "\r", "\r\n"):
        return "\n".join(segments) + ("\n" if segments else "")
    body = seg_sep.join(segments)
    if segments and not body.endswith(seg_sep):
        body += seg_sep
    return body


def _norm_id(value: Any) -> str:
    return re.sub(r"[^0-9A-Za-z]", "", str(value or "")).upper()


def extract_837_provider_context(edi: str) -> Dict[str, Any]:
    segments, elem, seg = split_segments(edi)
    billing_npi = ""
    billing_tax_id = ""
    billing_name = ""
    billing_taxonomy = ""
    prv_index = None
    nm185_index = None

    for idx, segment in enumerate(segments):
        parts = segment.split(elem)
        tag = parts[0] if parts else ""
        if tag == "NM1" and len(parts) > 1 and parts[1] == "85":
            nm185_index = idx
            billing_name = parts[3] if len(parts) > 3 else ""
            # NM108/NM109 = XX / NPI
            if len(parts) > 8 and parts[8] == "XX":
                billing_npi = parts[9] if len(parts) > 9 else ""
            elif len(parts) > 9:
                billing_npi = parts[9]
        if tag == "REF" and len(parts) > 2 and parts[1] in ("EI", "TJ"):
            # Prefer tax id near billing provider
            if nm185_index is not None and idx > nm185_index and (prv_index is None or idx < prv_index):
                billing_tax_id = parts[2]
            elif not billing_tax_id:
                billing_tax_id = parts[2]
        if tag == "PRV" and len(parts) > 1 and parts[1] == "BI":
            prv_index = idx
            # PRV*BI*PXC*taxonomy
            if len(parts) > 3:
                billing_taxonomy = parts[3].strip()
            break

    return {
        "billingName": billing_name,
        "billingNpi": billing_npi,
        "billingTaxId": billing_tax_id,
        "billingTaxonomy": billing_taxonomy,
        "hasPrvBi": prv_index is not None,
        "prvIndex": prv_index,
        "nm185Index": nm185_index,
        "segments": segments,
        "elementSep": elem,
        "segmentSep": seg,
    }


def apply_billing_taxonomy(edi: str, taxonomy_code: str) -> Dict[str, Any]:
    """Insert or replace Loop 2000A/2010AA PRV*BI*PXC*{taxonomy}."""
    taxonomy = (taxonomy_code or "").strip()
    if not taxonomy:
        raise ValueError("taxonomy_code is required")

    ctx = extract_837_provider_context(edi)
    segments: List[str] = list(ctx["segments"])
    elem = ctx["elementSep"]
    seg = ctx["segmentSep"]
    before_segment = None
    after_segment = f"PRV{elem}BI{elem}PXC{elem}{taxonomy}"
    change_type = "inserted"
    change_index = None

    if ctx["hasPrvBi"] and ctx["prvIndex"] is not None:
        change_index = ctx["prvIndex"]
        before_segment = segments[change_index]
        parts = before_segment.split(elem)
        # Ensure PRV*BI*PXC*code shape
        while len(parts) < 4:
            parts.append("")
        parts[1] = "BI"
        parts[2] = parts[2] or "PXC"
        parts[3] = taxonomy
        after_segment = elem.join(parts[:4] if len(parts) >= 4 else parts)
        if before_segment == after_segment:
            change_type = "unchanged"
        else:
            change_type = "replaced"
        segments[change_index] = after_segment
    else:
        # Insert after REF*EI following NM1*85, else after NM1*85, else before CLM
        insert_at = None
        nm_idx = ctx["nm185Index"]
        if nm_idx is not None:
            insert_at = nm_idx + 1
            for j in range(nm_idx + 1, len(segments)):
                tag = segments[j].split(elem)[0]
                if tag in ("N3", "N4", "REF", "PER"):
                    insert_at = j + 1
                    continue
                break
        else:
            for j, segment in enumerate(segments):
                if segment.split(elem)[0] == "CLM":
                    insert_at = j
                    break
        if insert_at is None:
            insert_at = len(segments)
        change_index = insert_at
        before_segment = None
        segments.insert(insert_at, after_segment)
        change_type = "inserted"

    corrected = join_segments(segments, seg)
    return {
        "content": corrected,
        "changeType": change_type,
        "beforeSegment": before_segment,
        "afterSegment": after_segment,
        "changeIndex": change_index,
        "loop": "2000A/2010AA",
        "segmentId": "PRV",
        "elementPath": "PRV03 (Provider Taxonomy Code) with PRV01=BI, PRV02=PXC",
    }


def build_segment_diff(
    original_edi: str,
    corrected_edi: str,
    change: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Return aligned segment rows for before/after highlighting."""
    before_segs, elem, _ = split_segments(original_edi)
    after_segs, _, _ = split_segments(corrected_edi)
    rows: List[Dict[str, Any]] = []

    # Pad for insert case
    if change.get("changeType") == "inserted" and change.get("changeIndex") is not None:
        idx = change["changeIndex"]
        # before has a blank at insert point
        before_view = before_segs[:idx] + [""] + before_segs[idx:]
        after_view = after_segs
    else:
        before_view = before_segs
        after_view = after_segs

    max_len = max(len(before_view), len(after_view))
    for i in range(max_len):
        b = before_view[i] if i < len(before_view) else ""
        a = after_view[i] if i < len(after_view) else ""
        changed = b != a
        # Keep context around change + any PRV/NM1*85/REF*EI lines
        is_context = False
        for candidate in (b, a):
            if not candidate:
                continue
            tag = candidate.split(elem)[0]
            parts = candidate.split(elem)
            if tag == "PRV" or (tag == "NM1" and len(parts) > 1 and parts[1] == "85") or (
                tag == "REF" and len(parts) > 1 and parts[1] in ("EI", "TJ")
            ):
                is_context = True
        rows.append(
            {
                "index": i,
                "before": b,
                "after": a,
                "changed": changed,
                "context": is_context or changed,
            }
        )
    # Compact: only changed + nearby ±2 + context tags
    keep = set()
    for row in rows:
        if row["changed"] or row["context"]:
            for j in range(max(0, row["index"] - 2), min(len(rows), row["index"] + 3)):
                keep.add(j)
    return [rows[i] for i in sorted(keep)]


def match_facility(
    facilities: List[Dict[str, Any]],
    claim_npi: str = "",
    claim_tax_id: str = "",
    edi_npi: str = "",
    edi_tax_id: str = "",
) -> Optional[Dict[str, Any]]:
    npi_candidates = {_norm_id(claim_npi), _norm_id(edi_npi)} - {""}
    tax_candidates = {_norm_id(claim_tax_id), _norm_id(edi_tax_id)} - {""}

    scored: List[Tuple[int, Dict[str, Any]]] = []
    for fac in facilities or []:
        fac_npi = _norm_id(fac.get("npi") or fac.get("NPI") or fac.get("facilityNPI"))
        fac_tax = _norm_id(
            fac.get("taxId")
            or fac.get("taxID")
            or fac.get("TaxId")
            or fac.get("facilityTaxID")
            or fac.get("facilityTaxId")
        )
        score = 0
        if fac_npi and fac_npi in npi_candidates:
            score += 2
        if fac_tax and fac_tax in tax_candidates:
            score += 2
        if score:
            scored.append((score, fac))
    if not scored:
        return None
    scored.sort(key=lambda x: (-x[0], str(x[1].get("name") or "")))
    return scored[0][1]


def diagnose_taxonomy(
    edi_taxonomy: str,
    configured_taxonomy: str,
    has_prv: bool,
) -> Dict[str, Any]:
    current = (edi_taxonomy or "").strip()
    expected = (configured_taxonomy or "").strip()
    if not expected:
        return {
            "issue": "config_missing",
            "summary": "Client Management has no taxonomy code for the matched facility.",
            "canFix": False,
        }
    if not has_prv or not current:
        return {
            "issue": "missing",
            "summary": "Billing provider taxonomy (PRV*BI*PXC) is missing on the 837.",
            "canFix": True,
        }
    if current.upper() != expected.upper():
        return {
            "issue": "incorrect",
            "summary": f"837 taxonomy '{current}' does not match configured taxonomy '{expected}'.",
            "canFix": True,
        }
    return {
        "issue": "match",
        "summary": "837 billing taxonomy already matches Client Management.",
        "canFix": False,
    }


def load_facilities_from_firestore(platform_tenant: str, client_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load facilities from Client Management (Firestore)."""
    try:
        from core.firebase.firebase_init import db
    except Exception as exc:
        logger.warning("Firestore unavailable for facility lookup: %s", exc)
        return []

    facilities: List[Dict[str, Any]] = []
    tenant_hint = (platform_tenant or "").strip().lower()

    def _add_facility(doc, tenant_name: str, cid: str):
        data = doc.to_dict() or {}
        data["id"] = doc.id
        data["clientId"] = cid
        data["tenantName"] = tenant_name
        facilities.append(data)

    try:
        if client_id:
            client_ref = db.collection("clients").document(client_id)
            for tenant_doc in client_ref.collection("tenants").stream():
                tdata = tenant_doc.to_dict() or {}
                tname = str(tdata.get("name") or tenant_doc.id)
                for fac_doc in tenant_doc.reference.collection("facilities").stream():
                    _add_facility(fac_doc, tname, client_id)
            return facilities

        for client_doc in db.collection("clients").stream():
            cid = client_doc.id
            cdata = client_doc.to_dict() or {}
            cname = str(cdata.get("name") or "").lower()
            for tenant_doc in client_doc.reference.collection("tenants").stream():
                tdata = tenant_doc.to_dict() or {}
                tname = str(tdata.get("name") or tenant_doc.id)
                tname_l = tname.lower()
                tid = str(tenant_doc.id).lower()
                # Prefer tenants that look like the platform tenant; otherwise include all
                if tenant_hint and not (
                    tenant_hint in tname_l
                    or tenant_hint in tid
                    or tenant_hint in cname
                    or not tenant_hint
                ):
                    # still include — matching is by NPI/taxId later; skip only if we want strict
                    pass
                for fac_doc in tenant_doc.reference.collection("facilities").stream():
                    _add_facility(fac_doc, tname, cid)
    except Exception as exc:
        logger.warning("Failed loading facilities: %s", exc)
    return facilities


def build_taxonomy_agent_result(
    *,
    platform_tenant: str,
    claim_no: str,
    claim_npi: str = "",
    claim_tax_id: str = "",
    claim_bill_taxonomy: str = "",
    claim_rend_taxonomy: str = "",
    client_id: Optional[str] = None,
    persist_corrected: bool = False,
) -> Dict[str, Any]:
    from services.s3_edi import load_raw_837, save_corrected_837

    raw = load_raw_837(platform_tenant, claim_no)
    if not raw.get("content"):
        return {
            "available": False,
            "error": raw.get("error") or "Raw 837 not found",
            "raw837": raw,
        }

    edi = raw["content"]
    ctx = extract_837_provider_context(edi)
    facilities = load_facilities_from_firestore(platform_tenant, client_id)
    facility = match_facility(
        facilities,
        claim_npi=claim_npi,
        claim_tax_id=claim_tax_id,
        edi_npi=ctx.get("billingNpi") or "",
        edi_tax_id=ctx.get("billingTaxId") or "",
    )

    configured = ""
    facility_payload = None
    if facility:
        configured = str(
            facility.get("taxonomyCode")
            or facility.get("TaxonomyCode")
            or facility.get("facilityTaxonomyCode")
            or ""
        ).strip()
        facility_payload = {
            "id": facility.get("id"),
            "name": facility.get("name") or facility.get("facilityName"),
            "npi": facility.get("npi") or facility.get("NPI"),
            "taxId": facility.get("taxId") or facility.get("taxID"),
            "taxonomyCode": configured,
            "clientId": facility.get("clientId"),
            "tenantName": facility.get("tenantName"),
        }

    current_taxonomy = (
        ctx.get("billingTaxonomy")
        or claim_bill_taxonomy
        or claim_rend_taxonomy
        or ""
    ).strip()
    diagnosis = diagnose_taxonomy(current_taxonomy, configured, bool(ctx.get("hasPrvBi")))

    change = None
    corrected_content = None
    diff = []
    saved = None
    if diagnosis.get("canFix") and configured:
        change = apply_billing_taxonomy(edi, configured)
        corrected_content = change["content"]
        diff = build_segment_diff(edi, corrected_content, change)
        if persist_corrected:
            try:
                saved = save_corrected_837(
                    platform_tenant,
                    claim_no,
                    corrected_content,
                    original_key=raw.get("key"),
                )
            except Exception as exc:
                logger.warning("Failed to persist corrected 837: %s", exc)
                saved = {"error": str(exc)}

    return {
        "available": True,
        "agent": "Taxonomy Missing",
        "claimNo": claim_no,
        "raw837": {
            "source": raw.get("source"),
            "bucket": raw.get("bucket"),
            "key": raw.get("key"),
            "filename": raw.get("filename"),
            "url": raw.get("url"),
            "content": edi,
        },
        "parsed": {
            "billingName": ctx.get("billingName"),
            "billingNpi": ctx.get("billingNpi"),
            "billingTaxId": ctx.get("billingTaxId"),
            "billingTaxonomy": ctx.get("billingTaxonomy"),
            "hasPrvBi": ctx.get("hasPrvBi"),
        },
        "facility": facility_payload,
        "diagnosis": diagnosis,
        "before": {
            "taxonomy": current_taxonomy or None,
            "segment": change.get("beforeSegment") if change else (
                f"PRV*BI*PXC*{current_taxonomy}" if current_taxonomy else None
            ),
        },
        "after": {
            "taxonomy": configured or None,
            "segment": change.get("afterSegment") if change else None,
            "loop": change.get("loop") if change else "2000A/2010AA",
            "elementPath": change.get("elementPath") if change else "PRV03",
        },
        "changeType": change.get("changeType") if change else None,
        "diff": diff,
        "correctedContent": corrected_content,
        "saved": saved,
        "facilityMatchCount": len(facilities),
    }
