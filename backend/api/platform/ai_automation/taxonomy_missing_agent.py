"""Taxonomy Missing AI Agent — raw 837 from S3 + facility taxonomy fix."""

from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request

from db import get_connection, close_connection
from services.s3_edi import load_raw_837
from services.taxonomy_agent import build_taxonomy_agent_result

logger = logging.getLogger(__name__)

rebound_api_taxonomy = Blueprint("rebound_api_taxonomy", __name__, url_prefix="/api/v1/rebound")
medevolve_api_taxonomy = Blueprint("medevolve_api_taxonomy", __name__, url_prefix="/api/v1/medevolve")
pilotcustomer_api_taxonomy = Blueprint(
    "pilotcustomer_api_taxonomy", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_taxonomy = Blueprint(
    "betacustomer_api_taxonomy", __name__, url_prefix="/api/v1/betacustomer"
)


def _platform_tenant_from_request() -> str:
    path = (request.path or "").lower()
    for name in ("betacustomer", "pilotcustomer", "rebound", "medevolve", "demo"):
        if f"/{name}/" in path or path.endswith(f"/{name}"):
            return name
    hint = (
        request.headers.get("X-Tenant")
        or request.headers.get("X-Client")
        or request.args.get("tenant")
        or ""
    ).strip().lower()
    return hint or "betacustomer"


def _claim_provider_ids(claim_no: str):
    conn = cursor = None
    npi = tax_id = bill_tax = rend_tax = ""
    automation = 0
    try:
        conn, cursor, _db = get_connection(request)
        cursor.execute(
            """
            SELECT ProvNPI, ProvTaxID, BillTaxonomy, RendTaxonomy, Automation
            FROM CUSTOM_ALL
            WHERE ClaimNo = %s
            LIMIT 1
            """,
            (claim_no,),
        )
        row = cursor.fetchone() or {}
        npi = str(row.get("ProvNPI") or "")
        tax_id = str(row.get("ProvTaxID") or "")
        bill_tax = str(row.get("BillTaxonomy") or "")
        rend_tax = str(row.get("RendTaxonomy") or "")
        automation = row.get("Automation") or 0
    except Exception as exc:
        logger.warning("Unable to load claim provider ids for %s: %s", claim_no, exc)
    finally:
        close_connection(cursor, conn)
    return npi, tax_id, bill_tax, rend_tax, automation


def _register(bp: Blueprint):
    @bp.route("/raw_837", methods=["GET"])
    def raw_837():
        claim_no = (request.args.get("id") or request.args.get("claimNo") or "").strip()
        if not claim_no:
            return jsonify({"error": "id (claim number) is required"}), 400
        tenant = _platform_tenant_from_request()
        result = load_raw_837(tenant, claim_no)
        status = 200 if result.get("content") else 404
        return jsonify(result), status

    @bp.route("/taxonomy_agent", methods=["GET", "POST"])
    def taxonomy_agent():
        payload = request.get_json(silent=True) or {}
        claim_no = (
            request.args.get("id")
            or request.args.get("claimNo")
            or payload.get("id")
            or payload.get("claimNo")
            or ""
        ).strip()
        if not claim_no:
            return jsonify({"error": "id (claim number) is required"}), 400

        client_id = (
            request.args.get("clientId")
            or payload.get("clientId")
            or request.headers.get("X-Client-Id")
            or ""
        ).strip() or None
        persist = bool(payload.get("persist") or request.args.get("persist") in ("1", "true", "True"))
        tenant = _platform_tenant_from_request()
        npi, tax_id, bill_tax, rend_tax, _automation = _claim_provider_ids(claim_no)

        try:
            result = build_taxonomy_agent_result(
                platform_tenant=tenant,
                claim_no=claim_no,
                claim_npi=npi,
                claim_tax_id=tax_id,
                claim_bill_taxonomy=bill_tax,
                claim_rend_taxonomy=rend_tax,
                client_id=client_id,
                persist_corrected=persist,
            )
            return jsonify(result), 200
        except Exception as exc:
            logger.exception("taxonomy_agent failed for %s", claim_no)
            return jsonify({"available": False, "error": str(exc)}), 500


_register(rebound_api_taxonomy)
_register(medevolve_api_taxonomy)
_register(pilotcustomer_api_taxonomy)
_register(betacustomer_api_taxonomy)
