from flask import Blueprint, request, jsonify
from core.token.refresh import generate_refresh_token, decode_refresh_token
from core.token.generate_access_token import generate_access_token

refresh_bp = Blueprint('refresh', __name__)

@refresh_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get("refresh_token")
        
        if not refresh_token:
            return jsonify({"error": "Refresh token is required"}), 400
        
        payload = decode_refresh_token(refresh_token)
        if "error" in payload:
            return jsonify(payload), 400
        
        user_id = payload["user_id"]
        new_access_token = generate_access_token(user_id)
        new_refresh_token = generate_refresh_token(user_id)
        
        return jsonify({
            "access_token": new_access_token,
            "refresh_token": new_refresh_token
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500