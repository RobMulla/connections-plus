from flask import Flask
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


def create_app():
    app = Flask(__name__, static_folder="static", template_folder="../templates")
    app.secret_key = os.environ.get("SECRET_KEY") or "dev-key-for-connections-plus"

    # Register blueprints
    from app.routes import main_bp

    app.register_blueprint(main_bp)

    return app
