"""Intelligent Appeal Generation: populate the standard letter and draft AI arguments."""

from __future__ import annotations

import json
import logging
import os
import re
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

SUPPORTING_DOC_CATALOG = [
    {"id": "medical_records", "label": "Medical Records", "fileTypes": ["medical_record", "clinical_note"]},
    {"id": "operative_report", "label": "Operative Report", "fileTypes": ["operative_report"]},
    {"id": "authorization", "label": "Authorization", "fileTypes": ["authorization"]},
    {"id": "imaging", "label": "Imaging", "fileTypes": ["imaging"]},
    {"id": "lab_results", "label": "Lab Results", "fileTypes": ["lab_results"]},
    {"id": "eob", "label": "EOB", "fileTypes": ["eob_eop"]},
    {"id": "contract_language", "label": "Contract Language", "fileTypes": ["other"]},
    {"id": "clinical_guidelines", "label": "Clinical Guidelines", "fileTypes": []},
]

LETTER_TEMPLATE = """Payer: {payer_name}

Patient:

{patient_name}
DOB: {patient_dob}
Member ID: {member_id}

Claim Information
-----------------
Claim Number: {claim_number}
Date of Service: {date_of_service}
Provider: {provider}
Facility: {facility}
Diagnosis Codes: {diagnosis_codes}
Procedure Codes: {procedure_codes}

Denial
-------
CARC: {carc}
RARC: {rarc}
Denial Reason: {denial_reason}

Clinical Summary
----------------
{clinical_summary}

Appeal Argument
---------------
{appeal_argument}

Supporting Documentation
-------------------------
{supporting_docs}

Requested Resolution
--------------------
Reprocess claim and issue payment according to the patient's benefits and contractual obligations.
"""


def _text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%m/%d/%Y")
    if isinstance(value, date):
        return value.strftime("%m/%d/%Y")
    return str(value).strip()


def _format_date(value: Any) -> str:
    text = _text(value)
    if not text:
        return ""
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%m/%d/%Y", "%Y-%m-%d %H:%M:%S"):
        try:
            parsed = text[:19] if " " in text and fmt == "%Y-%m-%d %H:%M:%S" else text
            return datetime.strptime(parsed, fmt).strftime("%m/%d/%Y")
        except ValueError:
            continue
    return text


def _join_codes(items: List[Any]) -> str:
    seen: List[str] = []
    for item in items or []:
        code = _text(item)
        if code and code not in seen:
            seen.append(code)
    return ", ".join(seen)


def _table_has_column(cursor, db_name: str, table: str, column: str) -> bool:
    try:
        from core.schema_cache import table_has_column

        return table_has_column(cursor, db_name, table, column)
    except Exception:
        return False


def _ensure_sessions_table(cursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS appeal_agent_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          claim_no VARCHAR(64) NOT NULL,
          letter_text MEDIUMTEXT,
          clinical_summary TEXT,
          appeal_argument MEDIUMTEXT,
          denial_reason TEXT,
          supporting_docs_json TEXT,
          messages_json MEDIUMTEXT,
          populated_json MEDIUMTEXT,
          used_llm TINYINT(1) DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uk_appeal_agent_claim_no (claim_no)
        )
        """
    )


def _lookup_code_description(cursor, table: str, code: str) -> str:
    if not code:
        return ""
    try:
        cursor.execute(f"SELECT Description FROM {table} WHERE Code = %s LIMIT 1", (code,))
        row = cursor.fetchone() or {}
        return _text(row.get("Description"))
    except Exception:
        return ""


def _fetch_claim_row(cursor, db_name: str, claim_no: str) -> Dict[str, Any]:
    columns = [
        "ClaimNo", "PayerName", "PayerID", "PatientName", "PatientID", "ServiceDate",
        "BillProvName", "ProvNPI", "PrimaryDX", "PrimaryCode", "PrimaryGroup", "Remark",
        "Category", "PriorAuthorization", "PlaceOfService", "BillTaxonomy", "RendTaxonomy",
    ]
    available = [col for col in columns if _table_has_column(cursor, db_name, "CUSTOM_ALL", col)]
    if not available:
        cursor.execute("SELECT * FROM CUSTOM_ALL WHERE ClaimNo = %s LIMIT 1", (claim_no,))
        return cursor.fetchone() or {}
    select_sql = ", ".join(f"CUSTOM_ALL.{col}" for col in available)
    cursor.execute(f"SELECT {select_sql} FROM CUSTOM_ALL WHERE ClaimNo = %s LIMIT 1", (claim_no,))
    return cursor.fetchone() or {}


def _fetch_diagnoses(cursor, claim_no: str) -> List[Dict[str, str]]:
    try:
        cursor.execute(
            """
            SELECT CUSTOM_ICD.Code, CUSTOM_ICD.Description
            FROM Diagnosis
            LEFT JOIN CUSTOM_ICD ON CUSTOM_ICD.Code = Diagnosis.Diagnosis
            WHERE ClaimNo = %s
            """,
            (claim_no,),
        )
        return [
            {"code": _text(row.get("Code")), "description": _text(row.get("Description"))}
            for row in (cursor.fetchall() or [])
            if _text(row.get("Code"))
        ]
    except Exception as exc:
        logger.warning("Unable to load diagnoses for %s: %s", claim_no, exc)
        return []


def _fetch_procedures(cursor, claim_no: str) -> List[Dict[str, str]]:
    try:
        cursor.execute(
            """
            SELECT CUSTOM_SERVICE.Code, cpt.Description
            FROM CUSTOM_SERVICE
            LEFT JOIN cpt ON cpt.Code = CUSTOM_SERVICE.Code
            WHERE ClaimNo = %s
              AND (cpt.Type = 'CPT' OR cpt.Type = 'HCPCS' OR cpt.Type IS NULL)
            """,
            (claim_no,),
        )
        return [
            {"code": _text(row.get("Code")), "description": _text(row.get("Description"))}
            for row in (cursor.fetchall() or [])
            if _text(row.get("Code"))
        ]
    except Exception as exc:
        logger.warning("Unable to load procedures for %s: %s", claim_no, exc)
        return []


def _fetch_denial_codes(cursor, claim_no: str) -> Tuple[List[str], List[str], List[str]]:
    carcs: List[str] = []
    rarcs: List[str] = []
    carc_descriptions: List[str] = []
    try:
        cursor.execute(
            """
            SELECT AdjustmentGroup, AdjustmentReason
            FROM CUSTOM_SERVICE_CODE_FOR_TABLE
            WHERE id_837 = (SELECT ID FROM CUSTOM_ALL WHERE ClaimNo = %s LIMIT 1)
            """,
            (claim_no,),
        )
        for row in cursor.fetchall() or []:
            group = _text(row.get("AdjustmentGroup"))
            reason = _text(row.get("AdjustmentReason")).lstrip("0") or _text(row.get("AdjustmentReason"))
            if not reason:
                continue
            label = f"{group}-{reason}" if group else reason
            if label not in carcs:
                carcs.append(label)
                desc = _lookup_code_description(cursor, "carc", reason)
                if desc:
                    carc_descriptions.append(f"{label}: {desc}")
    except Exception as exc:
        logger.warning("Unable to load CARC codes for %s: %s", claim_no, exc)

    try:
        cursor.execute(
            """
            SELECT RemarkCode
            FROM CUSTOM_PAID_SERVICE_REMARK
            WHERE id_837 = (SELECT ID FROM CUSTOM_ALL WHERE ClaimNo = %s LIMIT 1)
            """,
            (claim_no,),
        )
        for row in cursor.fetchall() or []:
            code = _text(row.get("RemarkCode"))
            if code and code not in rarcs:
                rarcs.append(code)
    except Exception as exc:
        logger.warning("Unable to load RARC codes for %s: %s", claim_no, exc)

    return carcs, rarcs, carc_descriptions


def _fetch_appeal_guidance(cursor, claim_no: str) -> Dict[str, str]:
    queries = (
        (
            "SELECT action, rationale, evidence, root_cause, recommendation FROM denial_actions WHERE ClaimNo = %s LIMIT 1",
            {"action": "action", "rationale": "rationale", "evidence": "evidence", "root_cause": "root_cause", "recommendation": "recommendation"},
        ),
        (
            "SELECT Appeal1, Appeal2, Appeal3, Appeal4, Appeal5, Appeal6 FROM appeals WHERE ClaimNo = %s LIMIT 1",
            {"Appeal2": "action", "Appeal3": "rationale", "Appeal4": "evidence", "Appeal5": "root_cause", "Appeal6": "recommendation"},
        ),
    )
    for query, mapping in queries:
        try:
            cursor.execute(query, (claim_no,))
            row = cursor.fetchone()
            if row:
                return {out: _text(row.get(src)) for src, out in mapping.items()}
        except Exception:
            continue
    return {}


def _fetch_patient_dob(cursor, claim_no: str) -> str:
    for table, column in (("EDI_Claims", "PatientDOB"), ("EDI_Claims", "DateOfBirth"), ("CUSTOM_EDI_Claims_CLONE", "PatientDOB")):
        try:
            cursor.execute(f"SELECT {column} FROM {table} WHERE ClaimNo = %s LIMIT 1", (claim_no,))
            row = cursor.fetchone() or {}
            if row.get(column):
                return _format_date(row.get(column))
        except Exception:
            continue
    return ""


def _supporting_docs_from_uploads(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    uploaded_types = {
        _text(doc.get("file_type") or doc.get("fileType")).lower()
        for doc in (documents or [])
        if _text(doc.get("file_type") or doc.get("fileType"))
    }
    items = []
    for item in SUPPORTING_DOC_CATALOG:
        attached = any(file_type in uploaded_types for file_type in item["fileTypes"])
        items.append({"id": item["id"], "label": item["label"], "checked": attached, "attached": attached})
    return items


def _format_supporting_docs(items: List[Dict[str, Any]]) -> str:
    lines = []
    for item in items or SUPPORTING_DOC_CATALOG:
        mark = "☑" if item.get("checked") else "☐"
        lines.append(f"{mark} {item.get('label')}")
    return "\n".join(lines)


def format_appeal_letter(fields: Dict[str, Any], supporting_docs: List[Dict[str, Any]]) -> str:
    return (
        LETTER_TEMPLATE.format(
            payer_name=fields.get("payerName") or "",
            patient_name=fields.get("patientName") or "",
            patient_dob=fields.get("patientDob") or "",
            member_id=fields.get("memberId") or "",
            claim_number=fields.get("claimNumber") or "",
            date_of_service=fields.get("dateOfService") or "",
            provider=fields.get("provider") or "",
            facility=fields.get("facility") or "",
            diagnosis_codes=fields.get("diagnosisCodes") or "",
            procedure_codes=fields.get("procedureCodes") or "",
            carc=fields.get("carc") or "",
            rarc=fields.get("rarc") or "",
            denial_reason=fields.get("denialReason") or "",
            clinical_summary=fields.get("clinicalSummary") or "",
            appeal_argument=fields.get("appealArgument") or "",
            supporting_docs=_format_supporting_docs(supporting_docs),
        ).strip()
        + "\n"
    )


def load_claim_context(cursor, db_name: str, claim_no: str) -> Dict[str, Any]:
    from api.platform.claim_details.appeal_documents import fetch_supporting_documents

    claim = _fetch_claim_row(cursor, db_name, claim_no)
    diagnoses = _fetch_diagnoses(cursor, claim_no)
    procedures = _fetch_procedures(cursor, claim_no)
    carcs, rarcs, carc_descriptions = _fetch_denial_codes(cursor, claim_no)
    guidance = _fetch_appeal_guidance(cursor, claim_no)
    documents: List[Dict[str, Any]] = []
    try:
        documents = fetch_supporting_documents(cursor, claim_no)
    except Exception as exc:
        logger.warning("Unable to load supporting documents for %s: %s", claim_no, exc)

    rarc_descriptions = []
    for code in rarcs:
        desc = _lookup_code_description(cursor, "rarc", code)
        if desc:
            rarc_descriptions.append(f"{code}: {desc}")

    primary_group = _text(claim.get("PrimaryGroup"))
    primary_reason = _text(claim.get("PrimaryCode"))
    if primary_reason and not carcs:
        carcs = [f"{primary_group}-{primary_reason}".strip("-")]
    if _text(claim.get("Remark")) and not rarcs:
        rarcs = [part for part in re.split(r"[*,;]+", _text(claim.get("Remark"))) if part]

    denial_reason = (
        guidance.get("root_cause")
        or (carc_descriptions[0] if carc_descriptions else "")
        or _text(claim.get("Category"))
        or "Claim denied; see CARC/RARC."
    )
    if rarc_descriptions:
        denial_reason = f"{denial_reason} {rarc_descriptions[0]}".strip()

    dx_display = [
        f"{item['code']} ({item['description']})" if item.get("description") else item["code"]
        for item in diagnoses
    ]
    px_display = [
        f"{item['code']} ({item['description']})" if item.get("description") else item["code"]
        for item in procedures
    ]

    populated = {
        "payerName": _text(claim.get("PayerName")),
        "payerId": _text(claim.get("PayerID")),
        "patientName": _text(claim.get("PatientName")),
        "patientDob": _fetch_patient_dob(cursor, claim_no),
        "memberId": _text(claim.get("PatientID")),
        "claimNumber": _text(claim.get("ClaimNo") or claim_no),
        "dateOfService": _format_date(claim.get("ServiceDate")),
        "provider": _text(claim.get("BillProvName")),
        "facility": _text(claim.get("BillProvName")),
        "providerNpi": _text(claim.get("ProvNPI")),
        "diagnosisCodes": _join_codes(dx_display),
        "procedureCodes": _join_codes(px_display),
        "carc": _join_codes(carcs),
        "rarc": _join_codes(rarcs),
        "denialReason": denial_reason,
        "denialCategory": _text(claim.get("Category")),
        "priorAuthorization": _text(claim.get("PriorAuthorization")),
        "placeOfService": _text(claim.get("PlaceOfService")),
        "clinicalSummary": "",
        "appealArgument": "",
    }
    return {
        "populated": populated,
        "diagnoses": diagnoses,
        "procedures": procedures,
        "carcDescriptions": carc_descriptions,
        "rarcDescriptions": rarc_descriptions,
        "guidance": guidance,
        "supportingDocs": _supporting_docs_from_uploads(documents),
        "uploadedDocuments": documents,
    }


def _fallback_clinical_summary(context: Dict[str, Any], physician_notes: str = "") -> str:
    populated = context.get("populated") or {}
    diagnoses = context.get("diagnoses") or []
    procedures = context.get("procedures") or []
    notes = _text(physician_notes)
    if notes:
        return (
            f"Physician documentation for {populated.get('patientName') or 'the patient'} "
            f"on {populated.get('dateOfService') or 'the date of service'} supports the billed services. "
            f"Salient documentation: {notes}"
        )
    dx = ", ".join(f"{item.get('code')} {item.get('description')}".strip() for item in diagnoses) or populated.get("diagnosisCodes") or "the documented diagnosis"
    px = ", ".join(f"{item.get('code')} {item.get('description')}".strip() for item in procedures) or populated.get("procedureCodes") or "the billed procedure"
    return (
        f"On {populated.get('dateOfService') or 'the date of service'}, {populated.get('provider') or 'the provider'} "
        f"rendered {px} for {populated.get('patientName') or 'the patient'} related to {dx}. "
        "Clinical notes were not attached to this claim record; this summary is derived from coded diagnosis, "
        "procedure, and denial data. Additional medical records should be enclosed with the appeal."
    )


def _fallback_argument(context: Dict[str, Any], physician_notes: str = "") -> str:
    populated = context.get("populated") or {}
    guidance = context.get("guidance") or {}
    carc = (populated.get("carc") or "").upper()
    rarc = (populated.get("rarc") or "").upper()
    payer = populated.get("payerName") or "the payer"
    patient = populated.get("patientName") or "the patient"
    dos = populated.get("dateOfService") or "the date of service"

    if guidance.get("rationale") or guidance.get("recommendation"):
        return " ".join(part for part in [guidance.get("rationale"), guidance.get("recommendation"), guidance.get("evidence")] if part)

    if "N255" in rarc or re.search(r"\b16\b", carc):
        return (
            f"{payer} denied this claim for missing or invalid billing provider taxonomy (CARC 16 / RARC N255). "
            f"The billing provider who treated {patient} on {dos} is enrolled with a valid taxonomy on file. "
            "The claim is payable as billed once taxonomy is correctly reported. Please reprocess under the "
            "patient's benefits and the provider contract."
        )
    if "50" in carc or "MEDICAL NECESSITY" in (populated.get("denialReason") or "").upper():
        return (
            f"The services billed for {patient} on {dos} were medically necessary based on the documented diagnosis "
            f"and the standard of care. Clinical findings support the procedure as reasonable and necessary, "
            f"and {payer} should reprocess the claim for payment."
        )
    if "197" in carc or re.search(r"\b15\b", carc) or "AUTHORIZATION" in (populated.get("denialCategory") or "").upper():
        auth = populated.get("priorAuthorization")
        auth_clause = f"Prior authorization {auth} was obtained and is enclosed." if auth else "Authorization requirements were satisfied and supporting authorization documentation is enclosed."
        return (
            f"{payer} denied the claim for authorization. {auth_clause} "
            f"The service provided to {patient} on {dos} was approved and should be paid per contract."
        )
    if "29" in carc:
        return (
            f"This claim for {patient} with date of service {dos} was submitted within timely filing limits "
            "under the provider agreement. We request reprocessing and payment of the originally billed charges."
        )
    if "18" in carc:
        return (
            f"This is not a duplicate of a previously paid claim. Claim {populated.get('claimNumber')} "
            f"represents a distinct service for {patient} on {dos} and should be adjudicated on its own merits."
        )
    notes_clause = f" Physician notes state: {physician_notes.strip()}" if _text(physician_notes) else ""
    return (
        f"We respectfully appeal {payer}'s denial of claim {populated.get('claimNumber')} for {patient}. "
        f"The denial ({populated.get('carc') or 'see CARC'} {populated.get('rarc') or ''}) is inconsistent with "
        f"the documented services rendered on {dos}, the patient's coverage, and the provider's contract."
        f"{notes_clause} Please reprocess the claim and issue payment."
    )


def _openai_client():
    api_key = os.getenv("OPENAI_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        from openai import OpenAI

        return OpenAI(api_key=api_key)
    except Exception as exc:
        logger.warning("OpenAI client unavailable: %s", exc)
        return None


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    text = (raw or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.IGNORECASE).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
    return {}


def _llm_generate(
    context: Dict[str, Any],
    physician_notes: str = "",
    extra_instruction: str = "",
    history: Optional[List[Dict[str, str]]] = None,
) -> Optional[Dict[str, Any]]:
    client = _openai_client()
    if client is None:
        return None

    payload = {
        "claim": context.get("populated") or {},
        "diagnoses": context.get("diagnoses") or [],
        "procedures": context.get("procedures") or [],
        "carcDescriptions": context.get("carcDescriptions") or [],
        "rarcDescriptions": context.get("rarcDescriptions") or [],
        "existingGuidance": context.get("guidance") or {},
        "physicianNotes": physician_notes or "",
        "uploadedDocuments": [
            {"fileName": doc.get("file_name"), "fileType": doc.get("file_type")}
            for doc in (context.get("uploadedDocuments") or [])
        ],
        "supportingDocCatalog": [item["label"] for item in SUPPORTING_DOC_CATALOG],
    }
    system = (
        "You are April, a healthcare revenue-cycle appeal specialist. "
        "Write a professional clinical and administrative appeal for a US payer claim denial. "
        "Use only the supplied claim facts; do not invent patient history, test results, or policy clause numbers. "
        "If physician notes are missing, say so and base the clinical summary on coded diagnosis and procedure data. "
        "Return JSON with keys: clinicalSummary, appealArgument, denialReason, recommendedDocs (array of catalog labels), reply."
    )
    user = (
        "Populate the Clinical Summary and Appeal Argument for this standardized appeal letter.\n"
        f"{json.dumps(payload, default=str)}\n"
        "Keep the clinical summary to 1-2 paragraphs. Keep the appeal argument to 2-4 paragraphs, "
        "addressing the specific CARC/RARC and requesting reprocessing and payment."
    )
    if extra_instruction:
        user += f"\n\nUser revision request: {extra_instruction}"

    messages = [{"role": "system", "content": system}]
    for item in history or []:
        role = item.get("role") or "user"
        content = _text(item.get("content"))
        if content and role in ("user", "assistant"):
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user})

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_APPEAL_MODEL", "gpt-4o-mini"),
            messages=messages,
            temperature=0.3,
            max_tokens=1600,
            response_format={"type": "json_object"},
        )
        parsed = _parse_llm_json(response.choices[0].message.content or "")
        if not parsed.get("clinicalSummary") and not parsed.get("appealArgument"):
            return None
        return parsed
    except Exception as exc:
        logger.warning("Appeal LLM generation failed: %s", exc)
        return None


def _apply_recommended_docs(supporting_docs: List[Dict[str, Any]], recommended: List[Any]) -> List[Dict[str, Any]]:
    labels = {str(item).strip().lower() for item in (recommended or [])}
    updated = []
    for item in supporting_docs:
        checked = item.get("attached") or item["label"].lower() in labels or item["id"] in labels
        updated.append({**item, "checked": bool(checked)})
    return updated


def _serialize_session_row(row: Dict[str, Any]) -> Dict[str, Any]:
    def _loads(raw, default):
        try:
            return json.loads(raw) if raw else default
        except (TypeError, json.JSONDecodeError):
            return default

    populated = _loads(row.get("populated_json"), {})
    return {
        "available": True,
        "agent": "April",
        "title": "Intelligent Appeal Generation",
        "claimNo": row.get("claim_no"),
        "letter": row.get("letter_text") or "",
        "clinicalSummary": row.get("clinical_summary") or "",
        "appealArgument": row.get("appeal_argument") or "",
        "denialReason": row.get("denial_reason") or populated.get("denialReason") or "",
        "populated": populated,
        "supportingDocs": _loads(row.get("supporting_docs_json"), []),
        "messages": _loads(row.get("messages_json"), []),
        "usedLlm": bool(row.get("used_llm")),
        "updatedAt": _text(row.get("updated_at")),
        "generated": True,
    }


def load_saved_session(cursor, claim_no: str) -> Optional[Dict[str, Any]]:
    _ensure_sessions_table(cursor)
    cursor.execute(
        """
        SELECT claim_no, letter_text, clinical_summary, appeal_argument, denial_reason,
               supporting_docs_json, messages_json, populated_json, used_llm, updated_at
        FROM appeal_agent_sessions
        WHERE claim_no = %s
        LIMIT 1
        """,
        (claim_no,),
    )
    row = cursor.fetchone()
    return _serialize_session_row(row) if row else None


def _save_session(cursor, conn, claim_no: str, payload: Dict[str, Any]) -> None:
    _ensure_sessions_table(cursor)
    cursor.execute(
        """
        INSERT INTO appeal_agent_sessions (
          claim_no, letter_text, clinical_summary, appeal_argument, denial_reason,
          supporting_docs_json, messages_json, populated_json, used_llm
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          letter_text = VALUES(letter_text),
          clinical_summary = VALUES(clinical_summary),
          appeal_argument = VALUES(appeal_argument),
          denial_reason = VALUES(denial_reason),
          supporting_docs_json = VALUES(supporting_docs_json),
          messages_json = VALUES(messages_json),
          populated_json = VALUES(populated_json),
          used_llm = VALUES(used_llm)
        """,
        (
            claim_no,
            payload.get("letter") or "",
            payload.get("clinicalSummary") or "",
            payload.get("appealArgument") or "",
            payload.get("denialReason") or "",
            json.dumps(payload.get("supportingDocs") or []),
            json.dumps(payload.get("messages") or []),
            json.dumps(payload.get("populated") or {}, default=str),
            1 if payload.get("usedLlm") else 0,
        ),
    )
    conn.commit()


def preview_appeal(cursor, db_name: str, claim_no: str) -> Dict[str, Any]:
    saved = load_saved_session(cursor, claim_no)
    context = load_claim_context(cursor, db_name, claim_no)
    if saved:
        saved["populated"] = {**context["populated"], **(saved.get("populated") or {})}
        if not saved.get("supportingDocs"):
            saved["supportingDocs"] = context["supportingDocs"]
        saved["contextReady"] = True
        return saved
    populated = dict(context["populated"])
    return {
        "available": True,
        "agent": "April",
        "title": "Intelligent Appeal Generation",
        "claimNo": claim_no,
        "letter": format_appeal_letter(populated, context["supportingDocs"]),
        "clinicalSummary": "",
        "appealArgument": "",
        "denialReason": populated.get("denialReason") or "",
        "populated": populated,
        "supportingDocs": context["supportingDocs"],
        "messages": [],
        "usedLlm": False,
        "generated": False,
        "contextReady": True,
    }


def generate_appeal(
    cursor,
    conn,
    db_name: str,
    claim_no: str,
    physician_notes: str = "",
    extra_instruction: str = "",
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    context = load_claim_context(cursor, db_name, claim_no)
    populated = dict(context["populated"])
    supporting_docs = list(context["supportingDocs"])
    llm = _llm_generate(context, physician_notes, extra_instruction, history)
    used_llm = llm is not None
    if llm:
        clinical = _text(llm.get("clinicalSummary")) or _fallback_clinical_summary(context, physician_notes)
        argument = _text(llm.get("appealArgument")) or _fallback_argument(context, physician_notes)
        denial_reason = _text(llm.get("denialReason")) or populated.get("denialReason") or ""
        supporting_docs = _apply_recommended_docs(supporting_docs, llm.get("recommendedDocs") or [])
        reply = _text(llm.get("reply")) or "I drafted the appeal from the claim, denial, and available documentation."
    else:
        clinical = _fallback_clinical_summary(context, physician_notes)
        argument = _fallback_argument(context, physician_notes)
        denial_reason = populated.get("denialReason") or ""
        reply = (
            "I populated the appeal from claim and denial data. "
            "OpenAI is not configured, so the clinical argument is a structured draft you can revise in chat."
        )

    populated["clinicalSummary"] = clinical
    populated["appealArgument"] = argument
    populated["denialReason"] = denial_reason
    letter = format_appeal_letter(populated, supporting_docs)
    prior = load_saved_session(cursor, claim_no)
    messages = list((prior or {}).get("messages") or history or [])
    if extra_instruction:
        messages.append({"role": "user", "content": extra_instruction})
    messages.append({"role": "assistant", "content": reply})
    result = {
        "available": True,
        "agent": "April",
        "title": "Intelligent Appeal Generation",
        "claimNo": claim_no,
        "letter": letter,
        "clinicalSummary": clinical,
        "appealArgument": argument,
        "denialReason": denial_reason,
        "populated": populated,
        "supportingDocs": supporting_docs,
        "messages": messages,
        "usedLlm": used_llm,
        "generated": True,
        "reply": reply,
    }
    _save_session(cursor, conn, claim_no, result)
    return result


def revise_appeal(
    cursor,
    conn,
    db_name: str,
    claim_no: str,
    message: str,
    physician_notes: str = "",
) -> Dict[str, Any]:
    saved = load_saved_session(cursor, claim_no)
    history = list((saved or {}).get("messages") or [])
    return generate_appeal(
        cursor,
        conn,
        db_name,
        claim_no,
        physician_notes=physician_notes,
        extra_instruction=message,
        history=history,
    )
