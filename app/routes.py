from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app.models import Puzzle, UserProgress
from app import db
import random
import json

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
        latest_puzzle = Puzzle.query.order_by(Puzzle.date.desc()).first_or_404()
        return redirect(
            url_for("main.puzzle", date=latest_puzzle.date.strftime("%Y-%m-%d"))
        )

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
    # Handle 'latest' as a special case
    if date == "latest":
        puzzle = Puzzle.query.order_by(Puzzle.date.desc()).first_or_404()
    else:
        puzzle = Puzzle.query.filter_by(date=date).first_or_404()

    # Flatten and shuffle words for the frontend
    puzzle_dict = puzzle.to_dict()
    all_words = []
    for category_words in puzzle_dict["words"]:
        all_words.extend(category_words)

    random.shuffle(all_words)

    return jsonify(
        {
            "id": puzzle_dict["id"],
            "date": puzzle_dict["date"],
            "title": puzzle_dict["title"],
            "difficulty": puzzle_dict["difficulty"],
            "words": all_words,
        }
    )


@main_bp.route("/api/save_progress", methods=["POST"])
def save_progress():
    """API endpoint to save user progress."""
    data = request.json

    # For now, we'll just return success without authentication
    return jsonify({"status": "success"})


@main_bp.route("/api/hint/<date>", methods=["POST"])
def get_hint(date):
    """API endpoint to get a hint for a specific puzzle."""
    puzzle = Puzzle.query.filter_by(date=date).first_or_404()
    hint_level = request.json.get("level", "beginner")

    # Load puzzle data
    categories = json.loads(puzzle.categories)
    words = json.loads(puzzle.words)

    # Generate hint based on level
    hint = generate_hint(categories, words, hint_level)

    return jsonify({"hint": hint})


@main_bp.route("/api/submit/<date>", methods=["POST"])
def submit_answer(date):
    """API endpoint to submit an answer for a puzzle."""
    puzzle = Puzzle.query.filter_by(date=date).first_or_404()
    submission = request.json.get("submission", [])

    # Load correct answers
    correct_answers = json.loads(puzzle.words)

    # Check if submission is correct
    is_correct = check_submission(submission, correct_answers)

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


# Helper functions
def generate_hint(categories, words, level):
    """Generate a hint based on the hint level."""
    if level == "beginner":
        # Give a general hint about one of the categories
        category_index = random.randint(0, len(categories) - 1)
        category = categories[category_index]

        beginner_hints = [
            f"One group contains items related to {category.lower()}.",
            f"Look for words that could be classified as {category.lower()}.",
            f"Think about {category.lower()} for one of the groups.",
            f"One category involves {category.lower()}.",
        ]

        return random.choice(beginner_hints)

    elif level == "intermediate":
        # Give a hint about the relationship between words in a category
        category_index = random.randint(0, len(categories) - 1)
        category = categories[category_index]
        category_words = words[category_index]

        intermediate_hints = [
            f"Look for words that share a common {random.choice(['theme', 'property', 'characteristic'])}.",
            f"Some words might be related to {category.lower()}, but not in an obvious way.",
            f"Consider different ways to group '{category_words[0]}' with other words.",
            f"Think about what '{category_words[0]}' and '{category_words[1]}' have in common.",
        ]

        return random.choice(intermediate_hints)

    elif level == "advanced":
        # Give a minimal hint about a specific word
        category_index = random.randint(0, len(categories) - 1)
        word_index = random.randint(0, len(words[category_index]) - 1)
        word = words[category_index][word_index]

        advanced_hints = [
            f"'{word}' belongs to a group you might not have considered yet.",
            f"Try to find the group that includes '{word}'.",
            f"'{word}' is part of a category related to {categories[category_index].lower()}.",
            f"Focus on '{word}' and think about its properties or characteristics.",
        ]

        return random.choice(advanced_hints)

    else:
        return "I'm not sure what kind of hint you're looking for. Try 'beginner', 'intermediate', or 'advanced'."


def check_submission(submission, correct_answers):
    """Check if the submission matches the correct answers."""
    # Convert both to sets of frozensets for comparison
    # This allows for different ordering of groups and words within groups
    submission_sets = set(frozenset(group) for group in submission if group)
    correct_sets = set(frozenset(group) for group in correct_answers)

    return submission_sets == correct_sets
