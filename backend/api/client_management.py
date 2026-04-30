from datetime import datetime
import logging

from flask import Blueprint, jsonify, request
from firebase_admin import firestore

from core.firebase.firebase_init import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client_management_bp = Blueprint("client_management", __name__, url_prefix="/api")


def _client_doc(client_id: str):
    return db.collection("clients").document(client_id)


def _serialize_doc(doc):
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


def _facility_doc(client_id: str, tenant_id: str, facility_id: str):
    return (
        _client_doc(client_id)
        .collection("tenants")
        .document(tenant_id)
        .collection("facilities")
        .document(facility_id)
    )


def _list_subcollection(parent_ref, collection_name: str):
    return [_serialize_doc(doc) for doc in parent_ref.collection(collection_name).stream()]


@client_management_bp.route("/clients", methods=["GET"])
def list_clients():
    try:
        clients = [_serialize_doc(doc) for doc in db.collection("clients").stream()]
        return jsonify(clients), 200
    except Exception as exc:
        logger.error("Error fetching clients: %s", exc)
        return jsonify({"error": "Failed to fetch clients"}), 500


@client_management_bp.route("/clients", methods=["POST"])
def create_client():
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    try:
        client_ref = db.collection("clients").document()
        payload = {k: v for k, v in payload.items() if v is not None}
        payload.setdefault("createdAt", datetime.utcnow().isoformat())

        client_ref.set(payload)
        created = dict(payload)
        created["id"] = client_ref.id
        return jsonify(created), 200
    except Exception as exc:
        logger.error("Error creating client: %s", exc)
        return jsonify({"error": "Failed to create client"}), 500


@client_management_bp.route("/clients/<client_id>", methods=["GET"])
def get_client(client_id):
    try:
        client_ref = _client_doc(client_id)
        client_doc = client_ref.get()
        if not client_doc.exists:
            return jsonify({"error": "Client not found"}), 404

        client_data = _serialize_doc(client_doc)

        tenants = []
        for tenant_doc in client_ref.collection("tenants").stream():
            tenant_data = _serialize_doc(tenant_doc)
            facilities = []
            for facility_doc in tenant_doc.reference.collection("facilities").stream():
                facility_data = _serialize_doc(facility_doc)
                facility_data["payerPlanCodes"] = _list_subcollection(facility_doc.reference, "payerPlanCodes")
                facility_data["transactionCodes"] = _list_subcollection(facility_doc.reference, "transactionCodes")
                facilities.append(facility_data)
            tenant_data["facilities"] = facilities
            tenants.append(tenant_data)

        client_data["subClients"] = tenants
        return jsonify(client_data), 200
    except Exception as exc:
        logger.error("Error fetching client %s: %s", client_id, exc)
        return jsonify({"error": "Failed to fetch client"}), 500


@client_management_bp.route("/clients/<client_id>", methods=["PATCH"])
def update_client(client_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Request body is required"}), 400

    try:
        client_ref = _client_doc(client_id)
        if not client_ref.get().exists:
            return jsonify({"error": "Client not found"}), 404

        client_ref.set(payload, merge=True)
        updated = _serialize_doc(client_ref.get())
        return jsonify(updated), 200
    except Exception as exc:
        logger.error("Error updating client %s: %s", client_id, exc)
        return jsonify({"error": "Failed to update client"}), 500


@client_management_bp.route("/clients/<client_id>", methods=["DELETE"])
def delete_client(client_id):
    try:
        client_ref = _client_doc(client_id)
        if not client_ref.get().exists:
            return jsonify({"error": "Client not found"}), 404

        for tenant_doc in client_ref.collection("tenants").stream():
            tenant_ref = tenant_doc.reference
            for facility_doc in tenant_ref.collection("facilities").stream():
                for payer_plan_doc in facility_doc.reference.collection("payerPlanCodes").stream():
                    payer_plan_doc.reference.delete()
                for transaction_code_doc in facility_doc.reference.collection("transactionCodes").stream():
                    transaction_code_doc.reference.delete()
                facility_doc.reference.delete()
            tenant_ref.delete()

        client_ref.delete()
        return jsonify({"message": "Client deleted"}), 200
    except Exception as exc:
        logger.error("Error deleting client %s: %s", client_id, exc)
        return jsonify({"error": "Failed to delete client"}), 500


@client_management_bp.route("/clients/<client_id>/users", methods=["GET"])
def list_users_for_client(client_id):
    try:
        client_ref = _client_doc(client_id)
        client_doc = client_ref.get()
        if not client_doc.exists:
            return jsonify({"error": "Client not found"}), 404

        client_data = client_doc.to_dict() or {}
        client_name = client_data.get("name")

        users = []
        seen = set()

        if client_id:
            for doc in db.collection("users").where("client", "array_contains", client_id).stream():
                row = _serialize_doc(doc)
                if row["id"] not in seen:
                    users.append(row)
                    seen.add(row["id"])

        if client_name:
            for doc in db.collection("users").where("client", "array_contains", client_name).stream():
                row = _serialize_doc(doc)
                if row["id"] not in seen:
                    users.append(row)
                    seen.add(row["id"])

        return jsonify(users), 200
    except Exception as exc:
        logger.error("Error fetching users for client %s: %s", client_id, exc)
        return jsonify({"error": "Failed to fetch users"}), 500


@client_management_bp.route("/clients/<client_id>/tenants", methods=["POST"])
def add_tenant(client_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    try:
        client_ref = _client_doc(client_id)
        if not client_ref.get().exists:
            return jsonify({"error": "Client not found"}), 404

        tenant_ref = client_ref.collection("tenants").document()
        payload = {k: v for k, v in payload.items() if v is not None}
        payload.setdefault("createdAt", datetime.utcnow().isoformat())
        tenant_ref.set(payload)

        created = dict(payload)
        created["id"] = tenant_ref.id
        created.setdefault("facilities", [])
        return jsonify(created), 200
    except Exception as exc:
        logger.error("Error adding tenant for client %s: %s", client_id, exc)
        return jsonify({"error": "Failed to add tenant"}), 500


@client_management_bp.route("/clients/<client_id>/tenants/<tenant_id>", methods=["PATCH"])
def update_tenant(client_id, tenant_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Request body is required"}), 400

    try:
        tenant_ref = _client_doc(client_id).collection("tenants").document(tenant_id)
        if not tenant_ref.get().exists:
            return jsonify({"error": "Tenant not found"}), 404

        tenant_ref.set(payload, merge=True)
        updated = _serialize_doc(tenant_ref.get())
        return jsonify(updated), 200
    except Exception as exc:
        logger.error("Error updating tenant %s for client %s: %s", tenant_id, client_id, exc)
        return jsonify({"error": "Failed to update tenant"}), 500


@client_management_bp.route("/clients/<client_id>/tenants/<tenant_id>", methods=["DELETE"])
def delete_tenant(client_id, tenant_id):
    try:
        tenant_ref = _client_doc(client_id).collection("tenants").document(tenant_id)
        if not tenant_ref.get().exists:
            return jsonify({"error": "Tenant not found"}), 404

        for facility_doc in tenant_ref.collection("facilities").stream():
            for payer_plan_doc in facility_doc.reference.collection("payerPlanCodes").stream():
                payer_plan_doc.reference.delete()
            for transaction_code_doc in facility_doc.reference.collection("transactionCodes").stream():
                transaction_code_doc.reference.delete()
            facility_doc.reference.delete()
        tenant_ref.delete()
        return jsonify({"message": "Tenant deleted"}), 200
    except Exception as exc:
        logger.error("Error deleting tenant %s for client %s: %s", tenant_id, client_id, exc)
        return jsonify({"error": "Failed to delete tenant"}), 500


@client_management_bp.route("/clients/<client_id>/tenants/<tenant_id>/facilities", methods=["POST"])
def add_facility(client_id, tenant_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    try:
        tenant_ref = _client_doc(client_id).collection("tenants").document(tenant_id)
        if not tenant_ref.get().exists:
            return jsonify({"error": "Tenant not found"}), 404

        facility_ref = tenant_ref.collection("facilities").document()
        payload = {k: v for k, v in payload.items() if v is not None}
        payload.setdefault("createdAt", datetime.utcnow().isoformat())
        facility_ref.set(payload)

        created = dict(payload)
        created["id"] = facility_ref.id
        created.setdefault("payerPlanCodes", [])
        created.setdefault("transactionCodes", [])
        return jsonify(created), 200
    except Exception as exc:
        logger.error("Error adding facility for tenant %s: %s", tenant_id, exc)
        return jsonify({"error": "Failed to add facility"}), 500


@client_management_bp.route("/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>", methods=["PATCH"])
def update_facility(client_id, tenant_id, facility_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Request body is required"}), 400

    try:
        facility_ref = _facility_doc(client_id, tenant_id, facility_id)
        if not facility_ref.get().exists:
            return jsonify({"error": "Facility not found"}), 404

        facility_ref.set(payload, merge=True)
        updated = _serialize_doc(facility_ref.get())
        return jsonify(updated), 200
    except Exception as exc:
        logger.error("Error updating facility %s: %s", facility_id, exc)
        return jsonify({"error": "Failed to update facility"}), 500


@client_management_bp.route("/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>", methods=["DELETE"])
def delete_facility(client_id, tenant_id, facility_id):
    try:
        facility_ref = _facility_doc(client_id, tenant_id, facility_id)
        if not facility_ref.get().exists:
            return jsonify({"error": "Facility not found"}), 404

        for payer_plan_doc in facility_ref.collection("payerPlanCodes").stream():
            payer_plan_doc.reference.delete()
        for transaction_code_doc in facility_ref.collection("transactionCodes").stream():
            transaction_code_doc.reference.delete()
        facility_ref.delete()
        return jsonify({"message": "Facility deleted"}), 200
    except Exception as exc:
        logger.error("Error deleting facility %s: %s", facility_id, exc)
        return jsonify({"error": "Failed to delete facility"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/payer-plan-codes",
    methods=["POST"],
)
def add_payer_plan_code(client_id, tenant_id, facility_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    try:
        facility_ref = _facility_doc(client_id, tenant_id, facility_id)
        if not facility_ref.get().exists:
            return jsonify({"error": "Facility not found"}), 404

        code_ref = facility_ref.collection("payerPlanCodes").document()
        payload = {k: v for k, v in payload.items() if v is not None}
        payload.setdefault("createdAt", datetime.utcnow().isoformat())
        code_ref.set(payload)

        created = dict(payload)
        created["id"] = code_ref.id
        return jsonify(created), 200
    except Exception as exc:
        logger.error("Error adding payer plan code for facility %s: %s", facility_id, exc)
        return jsonify({"error": "Failed to add payer plan code"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/payer-plan-codes/<code_id>",
    methods=["PATCH"],
)
def update_payer_plan_code(client_id, tenant_id, facility_id, code_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Request body is required"}), 400

    try:
        code_ref = _facility_doc(client_id, tenant_id, facility_id).collection("payerPlanCodes").document(code_id)
        if not code_ref.get().exists:
            return jsonify({"error": "Payer plan code not found"}), 404

        code_ref.set(payload, merge=True)
        return jsonify(_serialize_doc(code_ref.get())), 200
    except Exception as exc:
        logger.error("Error updating payer plan code %s: %s", code_id, exc)
        return jsonify({"error": "Failed to update payer plan code"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/payer-plan-codes/<code_id>",
    methods=["DELETE"],
)
def delete_payer_plan_code(client_id, tenant_id, facility_id, code_id):
    try:
        code_ref = _facility_doc(client_id, tenant_id, facility_id).collection("payerPlanCodes").document(code_id)
        if not code_ref.get().exists:
            return jsonify({"error": "Payer plan code not found"}), 404

        code_ref.delete()
        return jsonify({"message": "Payer plan code deleted"}), 200
    except Exception as exc:
        logger.error("Error deleting payer plan code %s: %s", code_id, exc)
        return jsonify({"error": "Failed to delete payer plan code"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/transaction-codes",
    methods=["POST"],
)
def add_transaction_code(client_id, tenant_id, facility_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    try:
        facility_ref = _facility_doc(client_id, tenant_id, facility_id)
        if not facility_ref.get().exists:
            return jsonify({"error": "Facility not found"}), 404

        code_ref = facility_ref.collection("transactionCodes").document()
        payload = {k: v for k, v in payload.items() if v is not None}
        payload.setdefault("createdAt", datetime.utcnow().isoformat())
        code_ref.set(payload)

        created = dict(payload)
        created["id"] = code_ref.id
        return jsonify(created), 200
    except Exception as exc:
        logger.error("Error adding transaction code for facility %s: %s", facility_id, exc)
        return jsonify({"error": "Failed to add transaction code"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/transaction-codes/<code_id>",
    methods=["PATCH"],
)
def update_transaction_code(client_id, tenant_id, facility_id, code_id):
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    payload = request.get_json() or {}
    if not payload:
        return jsonify({"error": "Request body is required"}), 400

    try:
        code_ref = _facility_doc(client_id, tenant_id, facility_id).collection("transactionCodes").document(code_id)
        if not code_ref.get().exists:
            return jsonify({"error": "Transaction code not found"}), 404

        code_ref.set(payload, merge=True)
        return jsonify(_serialize_doc(code_ref.get())), 200
    except Exception as exc:
        logger.error("Error updating transaction code %s: %s", code_id, exc)
        return jsonify({"error": "Failed to update transaction code"}), 500


@client_management_bp.route(
    "/clients/<client_id>/tenants/<tenant_id>/facilities/<facility_id>/transaction-codes/<code_id>",
    methods=["DELETE"],
)
def delete_transaction_code(client_id, tenant_id, facility_id, code_id):
    try:
        code_ref = _facility_doc(client_id, tenant_id, facility_id).collection("transactionCodes").document(code_id)
        if not code_ref.get().exists:
            return jsonify({"error": "Transaction code not found"}), 404

        code_ref.delete()
        return jsonify({"message": "Transaction code deleted"}), 200
    except Exception as exc:
        logger.error("Error deleting transaction code %s: %s", code_id, exc)
        return jsonify({"error": "Failed to delete transaction code"}), 500
