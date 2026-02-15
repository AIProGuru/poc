from flask import Blueprint, jsonify, request
from core.firebase.firebase_init import db
from firebase_admin import firestore
from datetime import datetime
try:
    from google.cloud.firestore_v1 import DocumentReference, GeoPoint
except Exception:  # pragma: no cover - optional import for type checks
    DocumentReference = None
    GeoPoint = None


def _serialize_value(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if DocumentReference is not None and isinstance(value, DocumentReference):
        return value.path
    if GeoPoint is not None and isinstance(value, GeoPoint):
        return {"latitude": value.latitude, "longitude": value.longitude}
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, dict):
        return {key: _serialize_value(val) for key, val in value.items()}
    if isinstance(value, list):
        return [_serialize_value(item) for item in value]
    return value

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
            data = _serialize_value(data)
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
        created_at = datetime.utcnow()
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


@clients_api.route("/clients/<client_id>", methods=["GET"])
def get_client(client_id):
    """
    Return a single client by ID.
    """
    try:
        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404
        data = doc.to_dict() or {}
        data = _serialize_value(data)
        data["id"] = doc.id
        return jsonify(data), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to fetch client", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>", methods=["DELETE"])
def delete_client(client_id):
    """
    Delete a client and any related lookup entries.
    """
    try:
        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        # Remove lookup entries for this client
        lookup_query = db.collection("client_lookup").where("clientId", "==", client_id).stream()
        lookup_docs = [d for d in lookup_query]
        for lookup_doc in lookup_docs:
            lookup_doc.reference.delete()

        doc_ref.delete()
        return jsonify({"status": "deleted", "id": client_id}), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to delete client", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>", methods=["PATCH"])
def update_client(client_id):
    """
    Update a client (partial).
    """
    try:
        payload = request.get_json(silent=True) or {}
        payload.pop("id", None)

        if not payload:
            return jsonify({"error": "No updates provided"}), 400

        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        payload["lastUpdated"] = firestore.SERVER_TIMESTAMP
        doc_ref.update(payload)

        updated = doc_ref.get().to_dict() or {}
        updated = _serialize_value(updated)
        updated["id"] = client_id
        return jsonify(updated), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to update client", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>/tenants", methods=["POST", "OPTIONS"])
def add_tenant(client_id):
    """
    Add a tenant under a client (stored in subClients array).
    """
    try:
        if request.method == "OPTIONS":
            return ("", 204)
        payload = request.get_json(silent=True) or {}
        created_at = datetime.utcnow()
        payload.pop("id", None)

        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        data = doc.to_dict() or {}
        sub_clients = data.get("subClients") or []
        tenant_id = f"tenant-{int(datetime.utcnow().timestamp() * 1000)}"
        tenant = payload.copy()
        tenant["id"] = tenant_id
        tenant["createdAt"] = created_at
        tenant.setdefault("facilities", [])
        tenant.setdefault("denialsCaptured", 0)
        tenant.setdefault("revenueRecovered", 0)

        sub_clients.append(tenant)
        doc_ref.update({"subClients": sub_clients, "lastUpdated": firestore.SERVER_TIMESTAMP})

        result = _serialize_value(tenant)
        return jsonify(result), 201
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to add tenant", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>/tenants/<tenant_id>/facilities", methods=["POST", "OPTIONS"])
def add_facility(client_id, tenant_id):
    """
    Add a facility under a tenant (nested in subClients[].facilities).
    """
    try:
        if request.method == "OPTIONS":
            return ("", 204)
        payload = request.get_json(silent=True) or {}
        payload.pop("id", None)
        created_at = datetime.utcnow()

        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        data = doc.to_dict() or {}
        sub_clients = data.get("subClients") or []
        facility_id = f"facility-{int(datetime.utcnow().timestamp() * 1000)}"
        facility = payload.copy()
        facility["id"] = facility_id
        facility["createdAt"] = created_at

        updated = False
        for sub_client in sub_clients:
            if sub_client.get("id") == tenant_id:
                facilities = sub_client.get("facilities") or []
                facilities.append(facility)
                sub_client["facilities"] = facilities
                updated = True
                break

        if not updated:
            return jsonify({"error": "Tenant not found"}), 404

        doc_ref.update({"subClients": sub_clients, "lastUpdated": firestore.SERVER_TIMESTAMP})

        result = _serialize_value(facility)
        return jsonify(result), 201
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to add facility", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>", methods=["PATCH", "OPTIONS"])
def update_facility(client_id, tenant_id, facility_id):
    """
    Update a facility under a tenant (nested in subClients[].facilities).
    """
    try:
        if request.method == "OPTIONS":
            return ("", 204)
        payload = request.get_json(silent=True) or {}
        payload.pop("id", None)
        payload.pop("createdAt", None)

        if not payload:
            return jsonify({"error": "No updates provided"}), 400

        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        data = doc.to_dict() or {}
        sub_clients = data.get("subClients") or []

        updated_facility = None
        updated = False
        for sub_client in sub_clients:
            if sub_client.get("id") != tenant_id:
                continue
            facilities = sub_client.get("facilities") or []
            for facility in facilities:
                if facility.get("id") == facility_id:
                    for key, value in payload.items():
                        facility[key] = value
                    updated_facility = facility
                    updated = True
                    break
            if updated:
                sub_client["facilities"] = facilities
                break

        if not updated:
            return jsonify({"error": "Facility not found"}), 404

        doc_ref.update({"subClients": sub_clients, "lastUpdated": firestore.SERVER_TIMESTAMP})

        result = _serialize_value(updated_facility)
        return jsonify(result), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to update facility", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>/tenants/<tenant_id>", methods=["PATCH", "OPTIONS"])
def update_tenant(client_id, tenant_id):
    """
    Update a tenant under a client (stored in subClients array).
    """
    try:
        if request.method == "OPTIONS":
            return ("", 204)
        payload = request.get_json(silent=True) or {}
        payload.pop("id", None)
        payload.pop("createdAt", None)

        if not payload:
            return jsonify({"error": "No updates provided"}), 400

        doc_ref = db.collection("clients").document(client_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Client not found"}), 404

        data = doc.to_dict() or {}
        sub_clients = data.get("subClients") or []

        updated_tenant = None
        for sub_client in sub_clients:
            if sub_client.get("id") == tenant_id:
                for key, value in payload.items():
                    sub_client[key] = value
                updated_tenant = sub_client
                break

        if updated_tenant is None:
            return jsonify({"error": "Tenant not found"}), 404

        doc_ref.update({"subClients": sub_clients, "lastUpdated": firestore.SERVER_TIMESTAMP})

        result = _serialize_value(updated_tenant)
        return jsonify(result), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to update tenant", "detail": str(exc)}), 500


@clients_api.route("/clients/<client_id>/users", methods=["GET"])
def get_client_users(client_id):
    """
    Return users linked to a client (by client name in users.client array).
    """
    try:
        client_doc = db.collection("clients").document(client_id).get()
        if not client_doc.exists:
            return jsonify({"error": "Client not found"}), 404

        client_data = client_doc.to_dict() or {}
        client_name = client_data.get("name")
        if not client_name:
            return jsonify([]), 200

        query = db.collection("users").where("client", "array_contains", client_name).stream()
        users = []
        for doc in query:
            data = doc.to_dict() or {}
            data = _serialize_value(data)
            data["id"] = doc.id
            users.append(data)
        return jsonify(users), 200
    except Exception as exc:  # pragma: no cover - simple pass-through
        return jsonify({"error": "Failed to fetch client users", "detail": str(exc)}), 500
