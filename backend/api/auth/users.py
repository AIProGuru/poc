from flask import Blueprint, jsonify, request
from core.firebase.firebase_init import db, auth
from jsonschema import validate
import logging
from db import medevolve_conn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

# Schema definition
addUserSchema = {
    "type": "object",
    "properties": {
        "email": {"type": "string"},
        "password": {"type": "string"},
        "firstname": {"type": "string"},
        "lastname": {"type": "string"},
        "role": {"type": "string"},
        "status": {"type": "integer"},
        "client": {"type": "array"},
        "denialCategory": {"type": "array"},
        "payer": {"type": "array"},
        "value": {"type": "array"},
    },
    "required": ["email", "password", "firstname", "lastname", "role", "status"],
    "additionalProperties": False,
}


def _assert_admin(uid: str):
    """
    Ensure the caller has an admin-level role before performing privileged actions.
    """
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        raise PermissionError("User profile not found.")

    role = user_doc.to_dict().get("role")
    if role not in {"admin", "super-admin", "manager", "internal-admin"}:
        raise PermissionError("Admin privileges required.")


@users_bp.route("/user", methods=["POST"])
def add_user():
    token = request.headers.get("Authorization")
    logger.info(f"token: {token}")
    try:
        data = request.get_json()
        decoded_token = auth.verify_id_token(token)
        _assert_admin(decoded_token["uid"])
        validate(instance=data, schema=addUserSchema)

        decoded_user = auth.create_user(email=data["email"], password=data["password"])
        data.pop("password")
        doc_ref = db.collection("users").document(decoded_user.uid)
        doc_ref.set(data)

        return jsonify({"message": "User added successfully"}), 200

    except PermissionError as e:
        logger.error(f"Permission error: {e}")
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 400

@users_bp.route("/admin-delete-user", methods=["POST"])
def admin_delete_user():
    if request.content_type != 'application/json':
        return jsonify({"error": "Unsupported Media Type"}), 415

    conn = medevolve_conn.get_connection()
    cursor = conn.cursor()

    try:
        token = request.headers.get("Authorization")
        user_data = auth.verify_id_token(token)
        uid = user_data.get('uid')
        _assert_admin(uid)
        
        data = request.get_json()
        user_id_to_delete = data.get('user_id')
        deleted_user_email = data.get('email')
        
        if not user_id_to_delete:
            return jsonify({"error": "User ID required"}), 400

        # Revoke refresh tokens so existing sessions are forced to re-auth
        try:
            auth.revoke_refresh_tokens(user_id_to_delete)
        except Exception as revoke_err:
            logger.warning(f"Failed to revoke tokens for {user_id_to_delete}: {revoke_err}")

        # Delete from Firestore
        db.collection("users").document(user_id_to_delete).delete()
        
        # Delete from Firebase Auth
        auth.delete_user(user_id_to_delete)

        # Log deletion
        log_query = """
            INSERT INTO User_management_logs 
            (deleted_user_email, deleted_by_user_email)
            VALUES (%s, %s)
        """
        cursor.execute(log_query, (deleted_user_email, user_data.get('email')))
        conn.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except PermissionError as e:
        logger.error(f"Permission error: {e}")
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@users_bp.route("/users", methods=["GET"])
def list_users():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing Authorization token"}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        _assert_admin(decoded_token["uid"])

        users = []
        for doc in db.collection("users").stream():
            row = doc.to_dict()
            row["id"] = doc.id
            users.append(row)

        return jsonify({"users": users}), 200
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500


@users_bp.route("/user/<user_id>", methods=["PATCH"])
def update_user(user_id):
    if request.content_type != 'application/json':
        return jsonify({"error": "Unsupported Media Type"}), 415

    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing Authorization token"}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        _assert_admin(decoded_token["uid"])

        payload = request.get_json()
        if not payload:
            return jsonify({"error": "Request body is required"}), 400

        allowed_fields = {
            "firstname",
            "lastname",
            "email",
            "role",
            "status",
            "client",
            "facility",
            "clientState",
            "denialCategory",
            "payer",
            "value",
            "access_level",
            "user_id",
        }

        sanitized = {k: v for k, v in payload.items() if k in allowed_fields}
        if not sanitized:
            return jsonify({"error": "No valid fields to update"}), 400

        doc_ref = db.collection("users").document(user_id)
        if not doc_ref.get().exists:
            return jsonify({"error": "User document not found"}), 404

        doc_ref.set(sanitized, merge=True)

        # Update Firebase custom claims if role changes
        if "role" in sanitized:
            auth.set_custom_user_claims(
                user_id,
                {
                    "admin": sanitized["role"]
                    in {"admin", "super-admin", "manager", "internal-admin"}
                },
            )

        updated = doc_ref.get().to_dict()
        updated["id"] = user_id

        return jsonify({"message": "User updated successfully", "user": updated}), 200
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return jsonify({"error": "Failed to update user"}), 500
