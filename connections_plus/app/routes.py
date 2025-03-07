from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app.models import Puzzle, UserProgress
from app import db

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Home page with the latest puzzle or redirect to a specific puzzle."""
    return render_template("index.html")


@main_bp.route("/puzzle/<date>")
def puzzle(date):
    """Display a specific puzzle by date."""
    # Fetch puzzle from database
    puzzle = Puzzle.query.filter_by(date=date).first_or_404()
    return render_template("puzzle.html", puzzle=puzzle)


@main_bp.route("/puzzles")
def puzzle_archive():
    """Display archive of all available puzzles."""
    puzzles = Puzzle.query.order_by(Puzzle.date.desc()).all()
    return render_template("archive.html", puzzles=puzzles)


@main_bp.route("/api/puzzle/<date>")
def api_puzzle(date):
    """API endpoint to get puzzle data."""
    puzzle = Puzzle.query.filter_by(date=date).first_or_404()
    return jsonify(puzzle.to_dict())


@main_bp.route("/api/save_progress", methods=["POST"])
def save_progress():
    """API endpoint to save user progress."""
    data = request.json
    # Implementation will depend on authentication system
    return jsonify({"status": "success"})


@main_bp.route("/api/hint/<date>", methods=["POST"])
def get_hint(date):
    """API endpoint to get a hint for a specific puzzle."""
    puzzle = Puzzle.query.filter_by(date=date).first_or_404()
    hint_level = request.json.get("level", "beginner")
    # Logic to generate appropriate hint based on level
    return jsonify({"hint": "This is a sample hint"})


@main_bp.route("/about")
def about():
    """About page with information about the app."""
    return render_template("about.html")
