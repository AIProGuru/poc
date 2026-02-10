from flask import Blueprint, jsonify, request
from core.firebase.firebase_init import db
from firebase_admin import firestore

clients_api = Blueprint("clients_api", __name__, url_prefix="/api")


@clients_api.route("/clients", methods=["GET"])
def get_clients():
    """
    Return the list of clients from Firestore using server-side credentials.
    """
    try:
        docs = db.collection("clients").stream()
        clients = []
        for doc in docs:
            data = doc.to_dict() or {}
            data["id"] = doc.id
            clients.append(data)
        return jsonify(clients), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to fetch clients", "detail": str(exc)}), 500


@clients_api.route("/clients", methods=["POST"])
def add_client():
    """
    Add a client facility entry using server-side credentials.
    """
    try:
        payload = request.get_json(silent=True) or {}
        payload.pop("id", None)
        payload["createdAt"] = firestore.SERVER_TIMESTAMP
        payload["lastUpdated"] = firestore.SERVER_TIMESTAMP

        doc_ref = db.collection("clients").document()
        doc_ref.set(payload)

        db.collection("client_lookup").add(
            {
                "clientId": doc_ref.id,
                "name": payload.get("name", ""),
                "facilityName": payload.get("facilityName", ""),
                "tenantName": payload.get("tenantName", ""),
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )

        result = payload.copy()
        result.pop("createdAt", None)
        result.pop("lastUpdated", None)
        result["id"] = doc_ref.id
        return jsonify(result), 201
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to add client", "detail": str(exc)}), 500
