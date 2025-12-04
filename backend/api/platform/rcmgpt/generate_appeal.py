from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

# Initialize the Blueprint
rebound_api_generate_appeal = Blueprint('rebound_api_generate_appeal', __name__, url_prefix='/api/v1/rebound')
medevolve_api_generate_appeal = Blueprint('medevolve_api_generate_appeal', __name__, url_prefix='/api/v1/medevolve')

# Initialize OpenAI client with fallback
openai_key = os.getenv("OPENAI_KEY") or os.getenv("OPENAI_API_KEY")
if openai_key:
    client = OpenAI(api_key=openai_key)
else:
    client = None
    print("Warning: OpenAI API key not found. Set OPENAI_KEY or OPENAI_API_KEY environment variable.")

@rebound_api_generate_appeal.route("/generate_appeal", methods=["POST"])
@medevolve_api_generate_appeal.route("/generate_appeal", methods=["POST"])
def generate_appeal():
    """
    This endpoint generates an appeal letter using OpenAI's GPT models.
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
            procedure:
              type: array
              items:
                type: string
              example: ["Procedure1", "Procedure2"]
            diagnosis:
              type: array
              items:
                type: string
              example: ["Diagnosis1", "Diagnosis2"]
            denial_code:
              type: string
              example: "DenialCode"
            remark:
              type: array
              items:
                type: string
              example: ["Remark1", "Remark2"]
            claim_number:
              type: string
              example: "ClaimNumber"
            action:
              type: string
              example: "Action"
            evidence:
              type: string
              example: "Evidence"
            recommendation:
              type: string
              example: "Recommendation"
            rationale:
              type: string
              example: "Rationale"
            root_cause:
              type: string
              example: "RootCause"
    responses:
      200:
        description: Successful response
        schema:
          type: object
          properties:
            appeal_letter:
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
        procedure = request.json.get("procedure", [])
        diagnosis = request.json.get("diagnosis", [])
        denial_code = request.json.get("denial_code", "")
        remark = request.json.get("remark", [])
        claim_number = request.json.get("claim_number", "")
        action = request.json.get("action", "")
        evidence = request.json.get("evidence", "")
        recommendation = request.json.get("recommendation", "")
        rationale = request.json.get("rationale", "")
        root_cause = request.json.get("root_cause", "")

        prompt = f"""
        Resolve claim with Procedure Code = {", ".join(procedure)}
        Diagnosis Code = {", ".join(diagnosis)}
        Remark Code = {", ".join(remark)}
        Denial Code = {denial_code}
        Claim Number = {claim_number}
        Action is '{action}'
        Rationale is '{rationale}'
        Evidence is '{evidence}'
        Recommendation is '{recommendation}'
        Root cause is '{root_cause}'
        This Claim is denied. Write appeal letter. Do not write any thing else like greeting.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",  # Using a more modern model, replace with your preferred model
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical claims specialist that writes professional appeal letters for insurance claim denials.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,  # Controls randomness: lowering makes output more focused and deterministic
            max_tokens=1000,  # Controls the maximum length of the generated response
            top_p=1.0,  # Controls diversity via nucleus sampling
            frequency_penalty=0.0,  # Reduces repetition of token sequences
            presence_penalty=0.0,  # Reduces repetition of topics
        )
        
        # Extract and return the generated appeal letter
        appeal_letter = response.choices[0].message.content
        return jsonify({"appeal_letter": appeal_letter})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500