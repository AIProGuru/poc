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
    },
    "required": ["email", "password", "firstname", "lastname", "role", "status"],
    "additionalProperties": False,
}


@users_bp.route("/user", methods=["POST"])
def add_user():
    token = request.headers.get("Authorization")
    logger.info(f"token: {token}")
    try:
        data = request.get_json()
        auth.verify_id_token(token)
        validate(instance=data, schema=addUserSchema)

        decoded_token = auth.create_user(email=data["email"], password=data["password"])
        data.pop("password")
        doc_ref = db.collection("users").document(decoded_token.uid)
        doc_ref.set(data)

        return jsonify({"message": "User added successfully"}), 200

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
        
        data = request.get_json()
        user_id_to_delete = data.get('user_id')
        deleted_user_email = data.get('email')
        
        if not user_id_to_delete:
            return jsonify({"error": "User ID required"}), 400

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

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

