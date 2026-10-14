"""Integrex Insurance Discovery for Coordination of Benefits and Eligibility denials.

837 segments supply the request. The 835 denial category decides whether this
API may run. Required fields follow Integrex Insurance Discovery v3 (r20260720).
"""
from flask import Blueprint, request, jsonify
import logging
import os
import re
from datetime import datetime, date

import requests

from db import get_connection, close_connection


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rebound_api_insurance_discovery = Blueprint(
    "rebound_api_insurance_discovery", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_insurance_discovery = Blueprint(
    "medevolve_api_insurance_discovery", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_insurance_discovery = Blueprint(
    "pilotcustomer_api_insurance_discovery", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_insurance_discovery = Blueprint(
    "betacustomer_api_insurance_discovery", __name__, url_prefix="/api/v1/betacustomer"
)

ALLOWED_CATEGORIES = {
    "coordination of benefits",
    "eligibility",
    "cob",
}

# 837 element -> Insurance Discovery field. Service type is not on the 837;
# the spec says to send "30" (health benefit plan coverage) unless a payer needs another code.
FIELD_SOURCES = {
    "patientDob": "837 DMG*D8 date",
    "patientFirstName": "837 NM1*IL first name",
    "patientLastName": "837 NM1*IL last name",
    "patientSsn": "837 REF*SY",
    "patientGender": "837 DMG gender",
    "subscriberFirstName": "837 subscriber NM1*IL when different from the patient",
    "subscriberLastName": "837 subscriber NM1*IL when different from the patient",
    "subscriberSsn": "837 subscriber REF*SY when different from the patient",
    "subscriberGender": "837 subscriber DMG when different from the patient",
    "subscriberDob": "837 subscriber DMG when different from the patient",
    "billingProviderNpi": "837 NM1*85*XX",
    "billingProviderName": "837 NM1*85",
    "beginDos": "837 DTP*472",
    "endDos": "837 DTP*472 through date, when the date is a range",
    "serviceType": "Default 30 (not carried on the 837)",
    "patientState": "837 patient N4 state",
    "patientAddress1": "837 patient N3",
    "patientCity": "837 patient N4 city",
    "internalAccountNumber1": "837 CLM01 / REF*EA",
}

REQUIRED_FIELDS = (
    "patientDob",
    "patientFirstName",
    "patientLastName",
    "patientSsn",
    "billingProviderNpi",
    "beginDos",
    "serviceType",
    "patientState",
    "internalAccountNumber1",
)

TOKEN_URL = "https://api.integrexrcm.com:53443/api/v2/auth"
DISCOVERY_URL = "https://api.integrexrcm.com:53443/api/v2/insurance-discovery"


def _clean(value):
    return f"{value or ''}".strip()


def _format_date(value):
    if not value:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")
    text = _clean(value)
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return ""


def _format_ssn(value):
    digits = re.sub(r"\D", "", _clean(value))
    if len(digits) != 9:
        return ""
    return f"{digits[0:3]}-{digits[3:5]}-{digits[5:9]}"


def _gender(value):
    text = _clean(value).upper()
    return text if text in {"M", "F"} else ""


def _split_name(value):
    raw = _clean(value)
    if not raw:
        return "", ""
    if "," in raw:
        last, first = [part.strip() for part in raw.split(",", 1)]
        return first, last
    parts = [part for part in raw.split(" ") if part]
    if len(parts) == 1:
        return parts[0], ""
    return " ".join(parts[:-1]), parts[-1]


def _segments(edi_text):
    text = _clean(edi_text).replace("\n", "")
    return [segment for segment in text.split("~") if segment.strip()]


def _elements(segment):
    return segment.split("*")


def request_from_837(edi_text, service_type="30"):
    """Build an Insurance Discovery POST body from an 837P claim."""
    payload = {
        "serviceType": _clean(service_type) or "30",
    }
    context = ""
    for segment in _segments(edi_text):
        parts = _elements(segment)
        tag = parts[0]
        if tag == "NM1" and len(parts) > 3 and parts[1] == "IL":
            last_name = parts[3]
            first_name = parts[4] if len(parts) > 4 else ""
            if context != "patient":
                payload["patientLastName"] = last_name
                payload["patientFirstName"] = first_name
                context = "patient"
            else:
                payload["subscriberLastName"] = last_name
                payload["subscriberFirstName"] = first_name
                context = "subscriber"
        elif tag == "NM1" and len(parts) > 1 and parts[1] == "85":
            context = "billing"
            payload["billingProviderName"] = parts[3] if len(parts) > 3 else ""
            if len(parts) > 9 and parts[8] == "XX":
                payload["billingProviderNpi"] = parts[9]
        elif tag == "NM1" and len(parts) > 1 and parts[1] == "PR":
            context = "payer"
        elif tag == "N4" and context == "patient" and len(parts) > 2:
            payload["patientCity"] = parts[1]
            payload["patientState"] = parts[2]
        elif tag == "N3" and context == "patient" and len(parts) > 1:
            payload["patientAddress1"] = parts[1]
        elif tag == "DMG" and len(parts) > 2:
            dob = _format_date(parts[2])
            gender = _gender(parts[3] if len(parts) > 3 else "")
            if "patientDob" not in payload:
                payload["patientDob"] = dob
                if gender:
                    payload["patientGender"] = gender
            else:
                payload["subscriberDob"] = dob
                if gender:
                    payload["subscriberGender"] = gender
        elif tag == "REF" and len(parts) > 2 and parts[1] == "SY":
            ssn = _format_ssn(parts[2])
            if ssn and "patientSsn" not in payload:
                payload["patientSsn"] = ssn
            elif ssn:
                payload["subscriberSsn"] = ssn
        elif tag == "CLM" and len(parts) > 1:
            payload["internalAccountNumber1"] = parts[1]
        elif tag == "DTP" and len(parts) > 3 and parts[1] == "472":
            qualifier = parts[2]
            raw_date = parts[3]
            if qualifier == "RD8" and "-" in raw_date:
                begin, end = raw_date.split("-", 1)
                payload["beginDos"] = _format_date(begin)
                payload["endDos"] = _format_date(end)
            elif "beginDos" not in payload:
                payload["beginDos"] = _format_date(raw_date)
    return {key: value for key, value in payload.items() if _clean(value)}


def missing_required_fields(payload):
    return [field for field in REQUIRED_FIELDS if not _clean(payload.get(field))]


def mask_request(payload):
    masked = dict(payload or {})
    for key in ("patientSsn", "subscriberSsn"):
        value = _clean(masked.get(key))
        if len(value) >= 4:
            masked[key] = f"***-**-{value[-4:]}"
    return masked


def _category_allowed(category):
    return _clean(category).lower() in ALLOWED_CATEGORIES


def _optional_row(cursor, sql, params):
    try:
        cursor.execute(sql, params)
        return cursor.fetchone() or {}
    except Exception as exc:
        logger.info("Optional insurance discovery column lookup skipped: %s", exc)
        return {}


def _build_request_from_claim(cursor, claim_no):
    cursor.execute(
        """
        SELECT
          ClaimNo,
          Category,
          ServiceDate,
          PatientName,
          ProvNPI,
          COALESCE(BillProvName, '') AS BillProvName
        FROM CUSTOM_ALL
        WHERE ClaimNo = %s
        LIMIT 1
        """,
        (claim_no,),
    )
    claim = cursor.fetchone() or {}
    if not claim:
        raise ValueError("Claim not found.")
    if not _category_allowed(claim.get("Category")):
        raise PermissionError(
            "Insurance Discovery is available for Coordination of Benefits and Eligibility denials only."
        )

    edi = _optional_row(
        cursor,
        """
        SELECT *
        FROM CUSTOM_EDI_Claims_CLONE
        WHERE ClaimNo = %s
        LIMIT 1
        """,
        (claim_no,),
    )
    first_name, last_name = _split_name(claim.get("PatientName"))
    first_name = _clean(edi.get("PatientFirst") or edi.get("patientFirst") or first_name)
    last_name = _clean(edi.get("PatientLast") or edi.get("patientLast") or last_name)
    payload = {
        "patientDob": _format_date(edi.get("PatientDOB") or edi.get("DateOfBirth") or edi.get("patientDob")),
        "patientFirstName": first_name,
        "patientLastName": last_name,
        "patientSsn": _format_ssn(edi.get("PatientSSN") or edi.get("SSN") or edi.get("patientSsn")),
        "patientGender": _gender(edi.get("PatientGender") or edi.get("Gender") or edi.get("patientGender")),
        "subscriberFirstName": _clean(edi.get("SubscriberFirst") or edi.get("subscriberFirstName")),
        "subscriberLastName": _clean(edi.get("SubscriberLast") or edi.get("subscriberLastName")),
        "subscriberSsn": _format_ssn(edi.get("SubscriberSSN") or edi.get("subscriberSsn")),
        "subscriberGender": _gender(edi.get("SubscriberGender") or edi.get("subscriberGender")),
        "subscriberDob": _format_date(edi.get("SubscriberDOB") or edi.get("subscriberDob")),
        "billingProviderNpi": _clean(claim.get("ProvNPI") or edi.get("BillingProviderNPI")),
        "billingProviderName": _clean(claim.get("BillProvName")),
        "beginDos": _format_date(claim.get("ServiceDate") or edi.get("ServiceDate")),
        "serviceType": "30",
        "patientState": _clean(edi.get("PatientState") or edi.get("State") or edi.get("patientState")).upper(),
        "patientAddress1": _clean(edi.get("PatientAddress1") or edi.get("Address1")),
        "patientCity": _clean(edi.get("PatientCity") or edi.get("City")),
        "internalAccountNumber1": _clean(claim.get("ClaimNo")),
    }
    if len(payload["patientState"]) != 2:
        payload["patientState"] = ""
    return claim, {key: value for key, value in payload.items() if _clean(value)}


def _credentials_configured():
    return bool(_clean(os.getenv("INTEGREX_CLIENT_ID")) and _clean(os.getenv("INTEGREX_CLIENT_SECRET")))


def _discovery_headers(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    env_header = os.getenv("INTEGREX_ENV", "T")
    if _clean(env_header):
        headers["env"] = env_header.strip()
    if os.getenv("INTEGREX_ENABLE_FUNDING_TYPE", "").strip().lower() == "true":
        headers["Enable-Funding-Type"] = "true"
    if os.getenv("INTEGREX_ENABLE_SSN_LOOKUP", "").strip().lower() == "true":
        headers["Enable-SSN-Lookup"] = "true"
    return headers


def _get_token():
    response = requests.post(
        os.getenv("INTEGREX_TOKEN_URL", TOKEN_URL),
        data={
            "grant_type": "client_credentials",
            "client_id": os.getenv("INTEGREX_CLIENT_ID", ""),
            "client_secret": os.getenv("INTEGREX_CLIENT_SECRET", ""),
        },
        timeout=30,
    )
    if response.status_code >= 400:
        raise RuntimeError("Integrex authorization failed.")
    body = response.json() if response.content else {}
    token = body.get("access_token") or body.get("token")
    if not token:
        raise RuntimeError("Integrex authorization did not return an access token.")
    return token


def _request_id(body):
    if not isinstance(body, dict):
        return ""
    return _clean(body.get("id") or body.get("Id"))


def _eligibility_info(body):
    if not isinstance(body, dict):
        return None
    info = body.get("eligibility-info")
    if info is None:
        return None
    if isinstance(info, list):
        return info
    return [info]


def _summarize(results):
    summary = []
    for item in results or []:
        if not isinstance(item, dict):
            continue
        member = item.get("sub") if isinstance(item.get("sub"), dict) else {}
        summary.append({
            "coverageStatus": item.get("coverageStatusDesc") or item.get("coverageStatusCode") or "",
            "payerName": item.get("payerName1") or item.get("payerName2") or "",
            "payerId": item.get("payerID1") or item.get("payerID2") or "",
            "memberId": item.get("sub.MemberID") or member.get("MemberID") or "",
            "coverageStartDate": item.get("coverageStartDate") or "",
            "coverageEndDate": item.get("coverageEndDate") or "",
            "fundType": item.get("fundType") or "",
            "fundTypeScore": item.get("fundTypeScore") or "",
            "planType": item.get("planType") or "",
            "groupNumber": item.get("groupNumber") or "",
        })
    return summary


def _preview(payload, missing):
    return {
        "mode": "preview",
        "status": "preview",
        "message": (
            "Integrex credentials are not configured. This is the Insurance Discovery "
            "request built from the claim. No vendor call was made."
        ),
        "request": mask_request(payload),
        "missing": missing,
        "sources": FIELD_SOURCES,
        "fundingTypeEnabled": os.getenv("INTEGREX_ENABLE_FUNDING_TYPE", "").strip().lower() == "true",
    }


def _call_discovery(payload):
    token = _get_token()
    headers = _discovery_headers(token)
    url = os.getenv("INTEGREX_DISCOVERY_URL", DISCOVERY_URL)
    response = requests.post(url, json=payload, headers=headers, timeout=60)
    body = response.json() if response.content else {}
    if response.status_code in {400, 401, 402}:
        message = body.get("error") or body.get("message") or "Insurance Discovery rejected the request."
        raise RuntimeError(message)
    if response.status_code not in {200, 202}:
        raise RuntimeError("Insurance Discovery request failed.")
    request_id = _request_id(body)
    results = _eligibility_info(body)
    if response.status_code == 202 or not results:
        return {
            "mode": "live",
            "status": "processing",
            "id": request_id,
            "message": "Insurance Discovery is processing. Poll again in 15 seconds.",
            "request": mask_request(payload),
        }
    return {
        "mode": "live",
        "status": "complete",
        "id": request_id,
        "request": mask_request(payload),
        "results": _summarize(results),
        "eligibilityInfo": results,
    }


def _poll_discovery(request_id):
    token = _get_token()
    headers = _discovery_headers(token)
    url = os.getenv("INTEGREX_DISCOVERY_URL", DISCOVERY_URL)
    response = requests.get(url, params={"id": request_id}, headers=headers, timeout=60)
    body = response.json() if response.content else {}
    if response.status_code == 202:
        return {
            "mode": "live",
            "status": "processing",
            "id": request_id,
            "message": "Insurance Discovery is still processing.",
        }
    if response.status_code >= 400:
        message = body.get("error") or body.get("message") or "Insurance Discovery poll failed."
        raise RuntimeError(message)
    results = _eligibility_info(body)
    return {
        "mode": "live",
        "status": "complete" if results else "processing",
        "id": request_id,
        "results": _summarize(results),
        "eligibilityInfo": results or [],
    }


def _json_error(message, status):
    return jsonify({"error": message}), status


def _post_insurance_discovery():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200
    conn = None
    cursor = None
    try:
        payload_in = request.get_json(silent=True) or {}
        claim_no = _clean(payload_in.get("claimId") or payload_in.get("claimNo"))
        if not claim_no:
            return _json_error("Claim number is required.", 400)
        conn, cursor, _db_name = get_connection(request)
        _claim, discovery_request = _build_request_from_claim(cursor, claim_no)
        missing = missing_required_fields(discovery_request)
        if not _credentials_configured():
            return jsonify(_preview(discovery_request, missing)), 200
        if missing:
            preview = _preview(discovery_request, missing)
            preview["message"] = "Insurance Discovery needs the missing 837 fields before it can be sent."
            preview["error"] = preview["message"]
            return jsonify(preview), 400
        return jsonify(_call_discovery(discovery_request)), 200
    except PermissionError as exc:
        return _json_error(str(exc), 403)
    except ValueError as exc:
        return _json_error(str(exc), 404)
    except Exception as exc:
        logger.error("Insurance Discovery failed: %s", exc)
        return _json_error(str(exc) or "Insurance Discovery failed.", 502)
    finally:
        close_connection(cursor, conn)


def _get_insurance_discovery():
    conn = None
    cursor = None
    try:
        request_id = _clean(request.args.get("id"))
        claim_no = _clean(request.args.get("claimId") or request.args.get("claimNo"))
        if not request_id or not claim_no:
            return _json_error("Request id and claim number are required.", 400)
        if not _credentials_configured():
            return _json_error("Integrex credentials are not configured.", 400)
        conn, cursor, _db_name = get_connection(request)
        _claim, _discovery_request = _build_request_from_claim(cursor, claim_no)
        return jsonify(_poll_discovery(request_id)), 200
    except PermissionError as exc:
        return _json_error(str(exc), 403)
    except ValueError as exc:
        return _json_error(str(exc), 404)
    except Exception as exc:
        logger.error("Insurance Discovery poll failed: %s", exc)
        return _json_error(str(exc) or "Insurance Discovery poll failed.", 502)
    finally:
        close_connection(cursor, conn)


@rebound_api_insurance_discovery.route("/insurance-discovery", methods=["POST", "GET", "OPTIONS"])
@medevolve_api_insurance_discovery.route("/insurance-discovery", methods=["POST", "GET", "OPTIONS"])
@pilotcustomer_api_insurance_discovery.route("/insurance-discovery", methods=["POST", "GET", "OPTIONS"])
@betacustomer_api_insurance_discovery.route("/insurance-discovery", methods=["POST", "GET", "OPTIONS"])
def insurance_discovery():
    if request.method == "GET":
        return _get_insurance_discovery()
    return _post_insurance_discovery()
