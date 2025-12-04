from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flasgger import Swagger
from config import ApplicationConfig
from api.auth.users import users_bp
from api.auth.refresh import refresh_bp
from api.platform.launchpad.tags import rebound_api_tags, medevolve_api_tags
from api.platform.launchpad.part1 import rebound_api_part1, medevolve_api_part1
from api.platform.launchpad.part2 import rebound_api_part2, medevolve_api_part2
from api.platform.launchpad.stratification_details import rebound_api_stratification, medevolve_api_stratification
from api.platform.claim_details.get_claim_detail import rebound_api_get_claim , medevolve_api_get_claim
from api.platform.claim_details.add_appeal import rebound_api_appeal, medevolve_api_appeal
from api.platform.claim_details.save_action import rebound_api_action, medevolve_api_action
from api.platform.claim_details.save_comment import rebound_api_comment, medevolve_api_comment
from api.platform.claim_details.add_document import rebound_api_add_doc, medevolve_api_add_doc
from api.platform.ai_automation.get_artificial_intelligence import rebound_api_ai, medevolve_api_ai
from api.platform.ai_automation.update_automation_status import rebound_api_status, medevolve_api_status
from api.platform.statistics.recoverable_view import rebound_api_recoverable, medevolve_api_recoverable
from api.platform.statistics.resubmitted_claims import rebound_api_resubmitted, medevolve_api_resubmitted
from api.platform.statistics.rebound_data_combined import rebound_api_combined, medevolve_api_combined
from api.platform.launchpad.payer import rebound_api_payer,medevolve_api_payer
from api.platform.launchpad.get_counts import rebound_api_counts,medevolve_api_counts
from api.platform.launchpad.recovery import rebound_api_recovery,medevolve_api_recovery
from api.platform.rcmgpt.generate_appeal import rebound_api_generate_appeal, medevolve_api_generate_appeal

from api.platform.demo.demo import demo_api

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(ApplicationConfig)
    
    
    # Initialize Flask-RESTful
    api = Api(app)
    
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
            "supports_credentials": True
        }
    })
    
    # Initialize Flasgger


    swagger = Swagger(app, template={
        "info": {
            "title": "Backend API",
            "description": "A list of API",
            "version": "1.0.0"
        }
    })
    
    # Register blueprints
    app.register_blueprint(demo_api)
    app.register_blueprint(users_bp, url_prefix='/api/v1')
    app.register_blueprint(refresh_bp, url_prefix='/api/v1')
    app.register_blueprint(rebound_api_tags)
    app.register_blueprint(medevolve_api_tags)
    app.register_blueprint(rebound_api_part1)
    app.register_blueprint(medevolve_api_part1)
    app.register_blueprint(rebound_api_part2)
    app.register_blueprint(medevolve_api_part2)
    app.register_blueprint(rebound_api_stratification)
    app.register_blueprint(medevolve_api_stratification)
    app.register_blueprint(rebound_api_get_claim)
    app.register_blueprint(medevolve_api_get_claim)
    app.register_blueprint(rebound_api_ai)
    app.register_blueprint(medevolve_api_ai)
    app.register_blueprint(rebound_api_recoverable)
    app.register_blueprint(medevolve_api_recoverable)
    app.register_blueprint(rebound_api_status)
    app.register_blueprint(medevolve_api_status)
    app.register_blueprint(rebound_api_appeal)
    app.register_blueprint(medevolve_api_appeal)
    app.register_blueprint(rebound_api_action)
    app.register_blueprint(medevolve_api_action)
    app.register_blueprint(rebound_api_comment)
    app.register_blueprint(medevolve_api_comment)
    app.register_blueprint(rebound_api_add_doc)
    app.register_blueprint(medevolve_api_add_doc)
    app.register_blueprint(rebound_api_resubmitted)
    app.register_blueprint(medevolve_api_resubmitted)
    app.register_blueprint(rebound_api_combined)
    app.register_blueprint(medevolve_api_combined)
    app.register_blueprint(rebound_api_payer)
    app.register_blueprint(medevolve_api_payer)
    app.register_blueprint(medevolve_api_counts)
    app.register_blueprint(rebound_api_counts)
    app.register_blueprint(medevolve_api_recovery)
    app.register_blueprint(rebound_api_recovery)
    app.register_blueprint(rebound_api_generate_appeal)
    app.register_blueprint(medevolve_api_generate_appeal)



    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)