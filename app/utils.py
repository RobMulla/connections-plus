import os
import json
import random
from datetime import datetime
import requests
from flask import current_app

# Path to the connections.json file
DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "connections.json"
)


# Add OpenAI API integration
def call_openai_api(prompt, max_tokens=150):
    """Call the OpenAI API with the given prompt."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return "OpenAI API key not found in environment variables."

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"}

    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant providing hints for the NYT Connections game.",
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=data
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return (
            "Sorry, I couldn't generate a hint at the moment. Please try again later."
        )


# Update the generate_hint function to use OpenAI
def generate_hint(puzzle, level):
    """Generate a hint using OpenAI API based on the hint level."""
    answers = puzzle["answers"]

    # Create a description of the puzzle for the API
    puzzle_description = (
        "This is a NYT Connections puzzle with the following categories and words:\n\n"
    )

    for answer in answers:
        category = answer["group"]
        words = answer["members"]
        puzzle_description += f"Category: {category}\nWords: {', '.join(words)}\n\n"

    # Create prompts based on hint level
    if level == "beginner":
        prompt = f"{puzzle_description}\nGive a beginner-level hint that only mentions one category name without revealing any specific words in that category. Make the hint subtle but helpful."

    elif level == "intermediate":
        prompt = f"{puzzle_description}\nGive an intermediate-level hint that mentions the relationship between words in one category, possibly mentioning one specific word as an example, but don't make the connection too obvious."

    elif level == "advanced":
        prompt = f"{puzzle_description}\nGive an advanced-level hint that focuses on a specific word and which category it belongs to, providing more direct guidance while still requiring some thinking."

    else:
        return "Please select a valid hint level: beginner, intermediate, or advanced."

    # Call the OpenAI API
    return call_openai_api(prompt)


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
