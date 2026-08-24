"""Intelligent Appeal Generation AI agent — templated letter + revision chat."""

from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request

from db import close_connection, get_connection
from services.appeal_agent import generate_appeal, preview_appeal, revise_appeal

logger = logging.getLogger(__name__)

rebound_api_appeal_agent = Blueprint(
    "rebound_api_appeal_agent", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_appeal_agent = Blueprint(
    "medevolve_api_appeal_agent", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_appeal_agent = Blueprint(
    "pilotcustomer_api_appeal_agent", __name__, url_prefix="/api/v1/pilotcustomer"
)
betacustomer_api_appeal_agent = Blueprint(
    "betacustomer_api_appeal_agent", __name__, url_prefix="/api/v1/betacustomer"
)


def _claim_no_from_request(payload=None) -> str:
    payload = payload or {}
    return (
        request.args.get("id")
        or request.args.get("claimNo")
        or payload.get("id")
        or payload.get("claimNo")
        or ""
    ).strip()


def _register(bp: Blueprint):
    @bp.route("/appeal_agent", methods=["GET"])
    def get_appeal_agent():
        claim_no = _claim_no_from_request()
        if not claim_no:
            return jsonify({"error": "id (claim number) is required"}), 400
        conn = cursor = None
        try:
            conn, cursor, db_name = get_connection(request)
            result = preview_appeal(cursor, db_name, claim_no)
            return jsonify(result), 200
        except Exception as exc:
            logger.exception("appeal_agent preview failed for %s", claim_no)
            return jsonify({"available": False, "error": str(exc)}), 500
        finally:
            close_connection(cursor, conn)

    @bp.route("/appeal_agent", methods=["POST"])
    def post_appeal_agent():
        payload = request.get_json(silent=True) or {}
        claim_no = _claim_no_from_request(payload)
        if not claim_no:
            return jsonify({"error": "id (claim number) is required"}), 400
        physician_notes = (payload.get("physicianNotes") or payload.get("notes") or "").strip()
        extra = (payload.get("instruction") or payload.get("message") or "").strip()
        conn = cursor = None
        try:
            conn, cursor, db_name = get_connection(request)
            result = generate_appeal(
                cursor,
                conn,
                db_name,
                claim_no,
                physician_notes=physician_notes,
                extra_instruction=extra,
            )
            return jsonify(result), 200
        except Exception as exc:
            logger.exception("appeal_agent generate failed for %s", claim_no)
            return jsonify({"available": False, "error": str(exc)}), 500
        finally:
            close_connection(cursor, conn)

    @bp.route("/appeal_agent/chat", methods=["POST"])
    def chat_appeal_agent():
        payload = request.get_json(silent=True) or {}
        claim_no = _claim_no_from_request(payload)
        message = (payload.get("message") or payload.get("instruction") or "").strip()
        if not claim_no:
            return jsonify({"error": "id (claim number) is required"}), 400
        if not message:
            return jsonify({"error": "message is required"}), 400
        physician_notes = (payload.get("physicianNotes") or payload.get("notes") or "").strip()
        conn = cursor = None
        try:
            conn, cursor, db_name = get_connection(request)
            result = revise_appeal(
                cursor,
                conn,
                db_name,
                claim_no,
                message,
                physician_notes=physician_notes,
            )
            return jsonify(result), 200
        except Exception as exc:
            logger.exception("appeal_agent chat failed for %s", claim_no)
            return jsonify({"available": False, "error": str(exc)}), 500
        finally:
            close_connection(cursor, conn)


_register(rebound_api_appeal_agent)
_register(medevolve_api_appeal_agent)
_register(pilotcustomer_api_appeal_agent)
_register(betacustomer_api_appeal_agent)
