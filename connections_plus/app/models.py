from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    progress = db.relationship("UserProgress", backref="user", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"


class Puzzle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, index=True, unique=True)
    title = db.Column(db.String(128))
    difficulty = db.Column(db.String(20))  # easy, medium, hard, very hard
    categories = db.Column(db.Text)  # JSON string of categories
    words = db.Column(db.Text)  # JSON string of words grouped by category
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.strftime("%Y-%m-%d"),
            "title": self.title,
            "difficulty": self.difficulty,
            "categories": json.loads(self.categories),
            "words": json.loads(self.words),
        }

    def __repr__(self):
        return f"<Puzzle {self.date}>"


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    puzzle_id = db.Column(db.Integer, db.ForeignKey("puzzle.id"))
    state = db.Column(db.Text)  # JSON string of current puzzle state
    notes = db.Column(db.Text)  # User notes
    color_coding = db.Column(db.Text)  # JSON string of color assignments
    completed = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    hints_used = db.Column(db.Integer, default=0)
    time_spent = db.Column(db.Integer, default=0)  # in seconds
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "puzzle_id": self.puzzle_id,
            "state": json.loads(self.state) if self.state else {},
            "notes": self.notes,
            "color_coding": json.loads(self.color_coding) if self.color_coding else {},
            "completed": self.completed,
            "attempts": self.attempts,
            "hints_used": self.hints_used,
            "time_spent": self.time_spent,
            "last_updated": self.last_updated.isoformat(),
        }

    def __repr__(self):
        return f"<UserProgress {self.user_id} - {self.puzzle_id}>"
