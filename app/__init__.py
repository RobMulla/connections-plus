from flask import Flask


def create_app():
    app = Flask(__name__, static_folder="static", template_folder="../templates")
    app.secret_key = "dev-key-for-connections-plus"  # For flash messages and sessions

    # Register blueprints
    from app.routes import main_bp

    app.register_blueprint(main_bp)

    return app
