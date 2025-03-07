from flask import (
    Blueprint,
    render_template,
    request,
    jsonify,
    redirect,
    url_for,
    flash,
    abort,
)
import random
import json
from app.utils import (
    get_puzzle_by_date,
    get_all_puzzles,
    format_puzzle_for_display,
    generate_hint,
    check_submission,
)

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Home page with the latest puzzle or redirect to a specific puzzle."""
    return render_template("index.html")


@main_bp.route("/puzzle/<date>")
def puzzle(date):
    """Display a specific puzzle by date."""
    # Handle 'latest' as a special case
    if date == "latest":
        latest_puzzle = get_puzzle_by_date("latest")
        return redirect(url_for("main.puzzle", date=latest_puzzle["date"]))

    # Fetch puzzle from data file
    puzzle = get_puzzle_by_date(date)
    if not puzzle:
        abort(404)

    # Format puzzle for display
    formatted_puzzle = format_puzzle_for_display(puzzle)
    return render_template("puzzle.html", puzzle=formatted_puzzle)


@main_bp.route("/puzzles")
def puzzle_archive():
    """Display archive of all available puzzles."""
    puzzles = get_all_puzzles()
    formatted_puzzles = [format_puzzle_for_display(puzzle) for puzzle in puzzles]
    return render_template("archive.html", puzzles=formatted_puzzles)


@main_bp.route("/api/puzzle/<date>")
def api_puzzle(date):
    """API endpoint to get puzzle data."""
    # Fetch puzzle from data file
    puzzle = get_puzzle_by_date(date)
    if not puzzle:
        abort(404)

    # Format puzzle for display
    formatted_puzzle = format_puzzle_for_display(puzzle)

    return jsonify(
        {
            "id": formatted_puzzle["id"],
            "date": formatted_puzzle["date"],
            "title": formatted_puzzle["title"],
            "difficulty": formatted_puzzle["difficulty"],
            "words": formatted_puzzle["words"],
        }
    )


@main_bp.route("/api/save_progress", methods=["POST"])
def save_progress():
    """API endpoint to save user progress."""
    # For now, we'll just return success without saving anything
    return jsonify({"status": "success"})


@main_bp.route("/api/hint/<date>", methods=["POST"])
def get_hint(date):
    """API endpoint to get a hint for a specific puzzle."""
    puzzle = get_puzzle_by_date(date)
    if not puzzle:
        abort(404)

    hint_level = request.json.get("level", "beginner")

    # Generate hint based on level
    hint = generate_hint(puzzle, hint_level)

    return jsonify({"hint": hint})


@main_bp.route("/api/submit/<date>", methods=["POST"])
def submit_answer(date):
    """API endpoint to submit an answer for a puzzle."""
    puzzle = get_puzzle_by_date(date)
    if not puzzle:
        abort(404)

    submission = request.json.get("submission", [])

    # Check if submission is correct
    is_correct = check_submission(submission, puzzle)

    return jsonify(
        {
            "correct": is_correct,
            "message": "Congratulations!"
            if is_correct
            else "That's not quite right. Try again!",
        }
    )


@main_bp.route("/about")
def about():
    """About page with information about the app."""
    return render_template("about.html")
