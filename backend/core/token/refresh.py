import jwt
import datetime

SECRET_KEY = "your_secret_key" 

def generate_refresh_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Refresh token expires in 7 days
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def decode_refresh_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Refresh token has expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid refresh token"}