from flask import Blueprint, request, jsonify
import openai
import os
import uuid
from datetime import datetime, timedelta
from db import get_connection, close_connection

# Initialize the Blueprint
rebound_api_chats = Blueprint('rebound_api_chats', __name__, url_prefix='/api/v1/rebound')
medevolve_api_chats = Blueprint('medevolve_api_chats', __name__, url_prefix='/api/v1/medevolve')

# Initialize OpenAI client with fallback
openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY")
if openai_key:
    openai.api_key = openai_key
else:
    print("Warning: OpenAI API key not found. Set OPENAI_API_KEY or OPENAI_KEY environment variable.")

@rebound_api_chats.route("/chats", methods=["GET"])
@medevolve_api_chats.route("/chats", methods=["GET"])
def get_chats():
    """
    This endpoint retrieves a list of chats for a specific user.
    ---
    tags:
      - RCM GPT
    parameters:
      - in: query
        name: user_email
        type: string
        required: true
        description: The email of the user
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            chats:
              type: object
              properties:
                today:
                  type: array
                  items:
                    type: object
                    properties:
                      uuid:
                        type: string
                      title:
                        type: string
                      updated_at:
                        type: string
                yesterday:
                  type: array
                  items:
                    type: object
                    properties:
                      uuid:
                        type: string
                      title:
                        type: string
                      updated_at:
                        type: string
                lastWeek:
                  type: array
                  items:
                    type: object
                    properties:
                      uuid:
                        type: string
                      title:
                        type: string
                      updated_at:
                        type: string
                older:
                  type: array
                  items:
                    type: object
                    properties:
                      uuid:
                        type: string
                      title:
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
        conn, cursor,db_name = get_connection(request.base_url)
        email = request.args.get('user_email')
        if not email:
            return({"error": "User email is required"}), 400
        
        query = """
            SELECT uuid, title, updated_at
            FROM chats
            WHERE user_id = %s
            ORDER BY updated_at DESC;
        """
        cursor.execute(query, (email,))
        rows = cursor.fetchall()
        
        chats = []
        for row in rows:
            chats.append({
                "uuid": row['uuid'],
                "title": row['title'],
                "updated_at": row['updated_at']
            })
        today = datetime.today()
        yesterday = today - timedelta(days=1)
        last_week = today - timedelta(days=7)
        grouped = {
            'today': [],
            'yesterday': [],
            'lastWeek': [],
            'older': []
        }
        for chat in chats:
            updated_at = datetime.strptime(str(chat['updated_at']), '%Y-%m-%d %H:%M:%S')
            if updated_at.date() == today.date():
                grouped['today'].append(chat)
            elif updated_at.date() == yesterday.date():
                grouped['yesterday'].append(chat)
            elif updated_at >= last_week:
                grouped['lastWeek'].append(chat)
            else:
                grouped['older'].append(chat)
    
        return {"chats": grouped}, 200
        
    except Exception as e:
        print(f"[ERROR]: {e}")
        return {"error": "Internal server Error"}, 500
    finally:
        close_connection(cursor, conn)

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
        conn, cursor,db_name = get_connection(request.base_url)
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