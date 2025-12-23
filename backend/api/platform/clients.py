from flask import Blueprint, jsonify
from core.firebase.firebase_init import db

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
