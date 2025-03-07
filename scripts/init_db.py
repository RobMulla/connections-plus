import os
import sys

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models import User, Puzzle, UserProgress


def init_database():
    """Initialize the database and create all tables."""
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully.")


if __name__ == "__main__":
    init_database()
