from flask import Blueprint, request, jsonify
from db import get_connection, close_connection

# Initialize the Blueprint
rebound_api_chat = Blueprint('rebound_api_chat', __name__, url_prefix='/api/v1/rebound')
medevolve_api_chat = Blueprint('medevolve_api_chat', __name__, url_prefix='/api/v1/medevolve')

@rebound_api_chat.route("/chat", methods=["GET"])
@medevolve_api_chat.route("/chat", methods=["GET"])
def get_chat():
    """
    This endpoint retrieves the chat history for a specific chat UUID.
    ---
    tags:
      - RCM GPT
    parameters:
      - in: query
        name: chatUuid
        type: string
        required: true
        description: The UUID of the chat
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            chats:
              type: array
              items:
                type: object
                properties:
                  chat_id:
                    type: string
                  query:
                    type: string
                  response:
                    type: string
                  created_at:
                    type: string
                  updated_at:
                    type: string
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            error:
              type: string
    """
    try:
        conn, cursor = get_connection(request.base_url)
        chat_uuid = request.args.get('chatUuid')
        if not chat_uuid:
            return({"uuid": "Chat UUID is required"}), 400
        
        query = """
            SELECT *
            FROM chat_history
            WHERE chat_id = %s
            ORDER BY updated_at DESC;
        """
        cursor.execute(query, (chat_uuid,))
        rows = cursor.fetchall()
        
        return {"chats": rows}, 200
        
    except Exception as e:
        print(f"[ERROR]: {e}")
        return {"error": "Internal server Error"}, 500
    finally:
        close_connection(cursor, conn)