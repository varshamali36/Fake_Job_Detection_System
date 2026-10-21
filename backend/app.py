import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager

# Add backend directory to system path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from config import Config
from database.db import db
from models.user import User
from routes.auth_routes import auth_bp
from routes.predict_routes import predict_bp
from routes.history_routes import history_bp
from routes.dashboard_routes import dashboard_bp
from routes.admin_routes import admin_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("fake_job_detector")

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Database Initialization
    db.init_app(app)

    # CORS configuration (restricted to Vite origin with credentials support)
    CORS(app, origins=[app.config["CORS_ORIGIN"], "http://127.0.0.1:5173"], supports_credentials=True)

    # Flask-Login Initialization
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "Authentication required. Please log in."}), 401

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(admin_bp)

    # Global Error Handlers (Hard Rule 7: Never return raw tracebacks)
    @app.errorhandler(400)
    def bad_request_error(error):
        logger.warning(f"400 Bad Request: {error}")
        return jsonify({"error": "Bad Request: The submitted payload was invalid."}), 400

    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify({"error": "Unauthorized access. Please log in."}), 401

    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify({"error": "Forbidden: You do not have permission to perform this action."}), 403

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"500 Internal Server Error: {error}", exc_info=True)
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Flask application server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
