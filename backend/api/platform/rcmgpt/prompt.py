from flask import Blueprint, request, jsonify
import openai
import os

# Initialize the Blueprint
rebound_api_prompt = Blueprint('rebound_api_prompt', __name__, url_prefix='/api/v1/rebound')
medevolve_api_prompt = Blueprint('medevolve_api_prompt', __name__, url_prefix='/api/v1/medevolve')

# Initialize OpenAI client with fallback
openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY")
if openai_key:
    openai.api_key = openai_key
else:
    print("Warning: OpenAI API key not found. Set OPENAI_API_KEY or OPENAI_KEY environment variable.")

@rebound_api_prompt.route("/prompt", methods=["POST"])
@medevolve_api_prompt.route("/prompt", methods=["POST"])
def generate_answer_with_prompt():
    """
    This endpoint generates an answer using OpenAI's GPT-3.5-turbo model based on the provided prompt.
    ---
    tags:
      - RCM GPT
    parameters:
      - in: body
        name: body
        description: JSON payload
        required: true
        schema:
          type: object
          properties:
            prompt:
              type: string
              example: "Explain the procedure for claim submission."
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            answer:
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
        prompt = request.json.get("prompt")

        res = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical chatbot.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        return jsonify({"answer": res.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500