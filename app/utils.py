import os
import json
import random
from datetime import datetime
from flask import current_app

# Path to the connections.json file
DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "connections.json"
)


def load_puzzles():
    """Load all puzzles from the connections.json file."""
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def get_puzzle_by_date(date):
    """Get a puzzle by its date string (YYYY-MM-DD)."""
    puzzles = load_puzzles()

    # Handle 'latest' as a special case
    if date == "latest":
        # Sort puzzles by date and return the most recent one
        puzzles.sort(key=lambda x: x["date"], reverse=True)
        return puzzles[0]

    # Find the puzzle with the matching date
    for puzzle in puzzles:
        if puzzle["date"] == date:
            return puzzle

    return None


def get_all_puzzles():
    """Get all puzzles sorted by date (newest first)."""
    puzzles = load_puzzles()
    puzzles.sort(key=lambda x: x["date"], reverse=True)
    return puzzles


def format_puzzle_for_display(puzzle):
    """Format a puzzle for display in the UI."""
    # Extract all words from the puzzle
    all_words = []
    for answer in puzzle["answers"]:
        all_words.extend(answer["members"])

    # Shuffle the words
    random.shuffle(all_words)

    return {
        "id": puzzle["id"],
        "date": puzzle["date"],
        "title": f"Connections Puzzle #{puzzle['id']}",
        "words": all_words,
        "answers": puzzle["answers"],
    }


def generate_hint(puzzle, level):
    """Generate a hint based on the hint level."""
    answers = puzzle["answers"]

    if level == "beginner":
        # Give a general hint about one of the categories
        answer = random.choice(answers)
        category = answer["group"]

        beginner_hints = [
            f"One group contains items related to {category.lower()}.",
            f"Look for words that could be classified as {category.lower()}.",
            f"Think about {category.lower()} for one of the groups.",
            f"One category involves {category.lower()}.",
        ]

        return random.choice(beginner_hints)

    elif level == "intermediate":
        # Give a hint about the relationship between words in a category
        answer = random.choice(answers)
        category = answer["group"]
        members = answer["members"]

        intermediate_hints = [
            f"Look for words that share a common {random.choice(['theme', 'property', 'characteristic'])}.",
            f"Some words might be related to {category.lower()}, but not in an obvious way.",
            f"Consider different ways to group '{members[0]}' with other words.",
            f"Think about what '{members[0]}' and '{members[1]}' have in common.",
        ]

        return random.choice(intermediate_hints)

    elif level == "advanced":
        # Give a minimal hint about a specific word
        answer = random.choice(answers)
        word = random.choice(answer["members"])

        advanced_hints = [
            f"'{word}' belongs to a group you might not have considered yet.",
            f"Try to find the group that includes '{word}'.",
            f"'{word}' is part of a category related to {answer['group'].lower()}.",
            f"Focus on '{word}' and think about its properties or characteristics.",
        ]

        return random.choice(advanced_hints)

    else:
        return "I'm not sure what kind of hint you're looking for. Try 'beginner', 'intermediate', or 'advanced'."


def check_submission(submission, puzzle):
    """Check if the submission matches the correct answers."""
    # Get the correct answers from the puzzle
    correct_answers = [set(answer["members"]) for answer in puzzle["answers"]]

    # Convert submission to sets for comparison
    submission_sets = [set(group) for group in submission if group]

    # Check if each submission group matches a correct answer group
    correct_count = 0
    for sub_set in submission_sets:
        if sub_set in correct_answers:
            correct_count += 1

    # All groups must be correct
    return correct_count == len(correct_answers)
