from flask import Blueprint, jsonify, request
from core.firebase.firebase_init import db, auth
from jsonschema import validate
import logging
import os
import requests
from db import get_connection, close_connection, normalize_tenant_hint
from core.email_service import send_new_user_welcome_email, send_password_reset_email
from core.email_service import PASSWORD_RESET_CONTINUE_URL, SENDGRID_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

# Web API key for the same Firebase project as the Admin SDK (heliorcm-e8d7a).
FIREBASE_WEB_API_KEY = os.environ.get(
    "FIREBASE_WEB_API_KEY",
    "AIzaSyBNAzDL2b5g0TaXTZVocilayMP59sbufR4",
)


FIREBASE_AUTH_MESSAGES = {
    "EMAIL_NOT_FOUND": "No account was found with that email address.",
    "INVALID_EMAIL": "Please enter a valid email address.",
    "RESET_PASSWORD_EXCEED_LIMIT": "Too many reset attempts. Please wait and try again.",
    "USER_NOT_FOUND": "No account was found with that email address.",
}


def _friendly_firebase_error(raw_message: str) -> str:
    if not raw_message:
        return "Something went wrong. Please try again."
    if raw_message in FIREBASE_AUTH_MESSAGES:
        return FIREBASE_AUTH_MESSAGES[raw_message]
    if "firebase" in raw_message.lower() or "identitytoolkit" in raw_message.lower():
        return "Unable to send the reset email right now. Please try again."
    return raw_message


def _send_password_reset_email(email: str) -> None:
    """Send a branded password reset email, falling back to Firebase if SendGrid is unavailable."""
    normalized_email = (email or "").strip().lower()
    if not normalized_email:
        raise ValueError("Email is required.")

    if SENDGRID_API_KEY:
        action_code_settings = auth.ActionCodeSettings(
            url=PASSWORD_RESET_CONTINUE_URL,
            handle_code_in_app=False,
        )
        reset_link = auth.generate_password_reset_link(normalized_email, action_code_settings)
        send_password_reset_email(to_email=normalized_email, reset_link=reset_link)
        return

    response = requests.post(
        f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={FIREBASE_WEB_API_KEY}",
        json={
            "requestType": "PASSWORD_RESET",
            "email": normalized_email,
        },
        timeout=15,
    )
    if response.ok:
        logger.warning(
            "Password reset for %s sent via Firebase default email (SendGrid not configured).",
            normalized_email,
        )
        return

    error_body = response.json().get("error", {}) if response.content else {}
    message = error_body.get("message") or "Failed to send password reset email."
    raise RuntimeError(_friendly_firebase_error(message))


def _resolve_user_document(user_id: str):
    """Return (doc_ref, doc_snapshot) for a Firestore users document."""
    doc_ref = db.collection("users").document(user_id)
    snapshot = doc_ref.get()
    if snapshot.exists:
        return doc_ref, snapshot

    query = db.collection("users").where("user_id", "==", user_id).limit(1).stream()
    for match in query:
        return match.reference, match

    return doc_ref, snapshot


def _is_admin_role(role: str) -> bool:
    return role in {"admin", "super-admin", "manager", "internal-admin"}


def _get_caller_profile(uid: str) -> dict:
    _, snapshot = _resolve_user_document(uid)
    if not snapshot.exists:
        raise PermissionError("User profile not found.")
    return snapshot.to_dict() or {}


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
        "facility": {"type": "array"},
        "tenant": {"type": "string"},
        "appType": {"type": "integer"},
    },
    "required": ["email", "password", "firstname", "lastname", "role", "status"],
    "additionalProperties": False,
}

APP_TYPE_BY_TENANT = {
    "rebound": 0,
    "pilotcustomer": 1,
    "demo": 2,
    "betacustomer": 3,
}


def _normalize_platform_tenant(value) -> str:
    """Canonical URL/DB tenant for the app. Unknown/empty → pilotcustomer."""
    hint = normalize_tenant_hint(value, default="pilotcustomer")
    if hint == "medevolve":
        return "pilotcustomer"
    return hint


def _with_normalized_tenant_fields(data: dict) -> dict:
    payload = dict(data or {})
    tenant = _normalize_platform_tenant(
        payload.get("tenant")
        if payload.get("tenant") not in (None, "")
        else payload.get("appType")
    )
    payload["tenant"] = tenant
    payload["appType"] = APP_TYPE_BY_TENANT.get(tenant, 1)
    return payload


def _assert_admin(uid: str):
    """
    Ensure the caller has an admin-level role before performing privileged actions.
    """
    profile = _get_caller_profile(uid)
    if not _is_admin_role(profile.get("role")):
        raise PermissionError("Admin privileges required.")


@users_bp.route("/user", methods=["POST"])
def add_user():
    token = request.headers.get("Authorization")
    logger.info(f"token: {token}")
    try:
        data = request.get_json()
        decoded_token = auth.verify_id_token(token)
        _assert_admin(decoded_token["uid"])
        if not isinstance(data, dict):
            return jsonify({"error": "Request body must be a JSON object"}), 400
        if "status" not in data or data.get("status") is None:
            data["status"] = 0
        else:
            try:
                data["status"] = int(data["status"])
            except (TypeError, ValueError):
                return jsonify({"error": "status must be an integer"}), 400
        validate(instance=data, schema=addUserSchema)
        data = _with_normalized_tenant_fields(data)

        user_email = (data.get("email") or "").strip().lower()
        user_password = data.get("password") or ""
        decoded_user = auth.create_user(email=user_email, password=user_password)
        data.pop("password")
        doc_ref = db.collection("users").document(decoded_user.uid)
        doc_ref.set(data)

        email_sent = False
        email_warning = None
        try:
            send_new_user_welcome_email(
                to_email=user_email,
                password=user_password,
                firstname=data.get("firstname") or "",
                lastname=data.get("lastname") or "",
            )
            email_sent = True
        except Exception as email_err:
            email_warning = str(email_err) or "Welcome email could not be sent."
            logger.warning("User %s created but welcome email failed: %s", user_email, email_err)

        response_body = {"message": "User added successfully", "emailSent": email_sent}
        if email_warning:
            response_body["emailWarning"] = email_warning
        return jsonify(response_body), 200

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

    conn = None
    cursor = None

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

        doc_ref, user_doc = _resolve_user_document(user_id_to_delete)
        if not user_doc.exists:
            return jsonify({"error": "User profile not found."}), 404

        resolved_user_id = user_doc.id
        user_profile = user_doc.to_dict() or {}
        deleted_user_email = deleted_user_email or user_profile.get("email")

        # Revoke refresh tokens so existing sessions are forced to re-auth
        try:
            auth.revoke_refresh_tokens(resolved_user_id)
        except Exception as revoke_err:
            logger.warning(f"Failed to revoke tokens for {resolved_user_id}: {revoke_err}")

        # Delete from Firestore
        doc_ref.delete()
        
        # Delete from Firebase Auth (ignore if already removed)
        try:
            auth.delete_user(resolved_user_id)
        except auth.UserNotFoundError:
            logger.warning(f"Auth user already deleted: {resolved_user_id}")

        tenant_hint = normalize_tenant_hint(
            data.get("tenant")
            or user_profile.get("tenant")
            or user_profile.get("product")
            or user_profile.get("basePath")
            or user_profile.get("appType")
            or user_profile.get("type")
            or "pilotcustomer"
        )

        # Log deletion (best-effort; do not block user removal on DB issues)
        try:
            conn, cursor, _ = get_connection(tenant_hint)
            log_query = """
                INSERT INTO User_management_logs 
                (deleted_user_email, deleted_by_user_email)
                VALUES (%s, %s)
            """
            cursor.execute(log_query, (deleted_user_email, user_data.get('email')))
            conn.commit()
        except Exception as log_err:
            logger.warning(f"Failed to log user deletion for {resolved_user_id}: {log_err}")

        return jsonify({"message": "User deleted successfully"}), 200

    except PermissionError as e:
        logger.error(f"Permission error: {e}")
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        close_connection(cursor, conn)


@users_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required."}), 400

    try:
        try:
            auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return jsonify({"message": "If an account exists for that email, a reset link has been sent."}), 200

        _send_password_reset_email(email)
        return jsonify({"message": "If an account exists for that email, a reset link has been sent."}), 200
    except RuntimeError as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({"error": "Failed to send password reset email."}), 500


@users_bp.route("/admin-reset-password", methods=["POST"])
def admin_reset_password():
    if request.content_type != "application/json":
        return jsonify({"error": "Unsupported Media Type"}), 415

    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing Authorization token"}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        _assert_admin(decoded_token["uid"])

        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        if not email:
            return jsonify({"error": "Email is required"}), 400

        try:
            auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            return jsonify({"error": "User not found in authentication system."}), 404

        _send_password_reset_email(email)
        return jsonify({"message": "Password reset email sent."}), 200
    except PermissionError as e:
        logger.error(f"Permission error: {e}")
        return jsonify({"error": str(e)}), 403
    except RuntimeError as e:
        logger.error(f"Password reset error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error sending password reset email: {e}")
        return jsonify({"error": "Failed to send password reset email."}), 500


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

        users.sort(key=lambda item: (
            (item.get("firstname") or "").lower(),
            (item.get("lastname") or "").lower(),
            (item.get("email") or "").lower(),
        ))
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
        caller_uid = decoded_token["uid"]
        caller_profile = _get_caller_profile(caller_uid)
        caller_is_admin = _is_admin_role(caller_profile.get("role"))

        payload = request.get_json()
        if not payload:
            return jsonify({"error": "Request body is required"}), 400

        doc_ref, doc_snapshot = _resolve_user_document(user_id)
        if not doc_snapshot.exists:
            return jsonify({"error": "User document not found"}), 404

        resolved_user_id = doc_snapshot.id
        editing_self = caller_uid == resolved_user_id

        if not caller_is_admin and not editing_self:
            raise PermissionError("You can only update your own profile.")

        profile_fields = {"firstname", "lastname", "email"}
        permission_fields = {
            "client",
            "facility",
            "clientState",
            "denialCategory",
            "payer",
            "value",
            "access_level",
            "user_id",
            "tenant",
            "appType",
        }
        admin_only_fields = {"role", "status"}

        if editing_self and not caller_is_admin:
            allowed_fields = profile_fields
        elif caller_is_admin:
            allowed_fields = profile_fields | permission_fields | admin_only_fields
        else:
            allowed_fields = set()

        sanitized = {k: v for k, v in payload.items() if k in allowed_fields}
        if not sanitized:
            return jsonify({"error": "No valid fields to update"}), 400

        if "tenant" in sanitized or "appType" in sanitized:
            normalized = _with_normalized_tenant_fields(sanitized)
            sanitized["tenant"] = normalized["tenant"]
            sanitized["appType"] = normalized["appType"]
        for field in ("firstname", "lastname", "email"):
            if field in sanitized:
                sanitized[field] = f"{sanitized[field]}".strip()
                if not sanitized[field]:
                    return jsonify({"error": f"{field} cannot be empty."}), 400
                if field == "email":
                    sanitized[field] = sanitized[field].lower()

        if "status" in sanitized:
            try:
                sanitized["status"] = int(sanitized["status"])
            except (TypeError, ValueError):
                return jsonify({"error": "status must be an integer"}), 400
            if sanitized["status"] not in (0, 1):
                return jsonify({"error": "status must be 0 (active) or 1 (inactive)"}), 400

        if resolved_user_id != user_id:
            doc_ref = db.collection("users").document(resolved_user_id)

        doc_ref.set(sanitized, merge=True)

        # Update Firebase custom claims if role changes
        if "role" in sanitized:
            auth.set_custom_user_claims(
                resolved_user_id,
                {
                    "admin": sanitized["role"]
                    in {"admin", "super-admin", "manager", "internal-admin"}
                },
            )

        if "email" in sanitized:
            try:
                auth.update_user(resolved_user_id, email=sanitized["email"])
            except Exception as auth_update_error:
                logger.error(f"Failed to sync auth email for {resolved_user_id}: {auth_update_error}")
                return jsonify({"error": "Profile saved, but email could not be updated in authentication."}), 400

        updated = doc_ref.get().to_dict()
        updated["id"] = resolved_user_id

        return jsonify({"message": "User updated successfully", "user": updated}), 200
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return jsonify({"error": "Failed to update user"}), 500
