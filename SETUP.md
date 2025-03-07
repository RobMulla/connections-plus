# Connections Plus - Setup Guide

This guide will help you set up and run the Connections Plus application on your local machine.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Clone the repository (or download and extract the ZIP file):
   ```
   git clone https://github.com/yourusername/connections-plus.git
   cd connections-plus
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install flask
   ```

## Running the Application

1. Start the Flask development server:
   ```
   python run.py
   ```

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Application Structure

- `app/` - Main application package
  - `__init__.py` - Application factory
  - `routes.py` - Route definitions
  - `utils.py` - Utility functions for data handling
  - `static/` - Static files (CSS, JavaScript)
    - `css/styles.css` - Main stylesheet
    - `js/main.js` - Main JavaScript file
- `data/` - Data files
  - `connections.json` - Puzzle data
- `templates/` - HTML templates
  - `base.html` - Base template
  - `index.html` - Home page
  - `puzzle.html` - Puzzle page
  - `archive.html` - Puzzle archive
  - `about.html` - About page
- `run.py` - Application entry point

## Features

- Drag & Drop Interface: Move cards anywhere on the screen to visually organize your thoughts
- Color Coding: Tag cards with potential category colors by right-clicking on them
- Note-taking: Add notes to help solve the puzzle
- Game History: Play any historic NYT Connections puzzle
- Submission Management: Review and submit your final answers
- AI-Powered Hints: Get subtle clues without spoilers

## How to Play

1. Select a puzzle (daily or from archives)
2. Drag cards to organize your thoughts
3. Use color coding to mark potential groups (right-click on cards)
4. Request hints if needed
5. Submit when ready!

## Troubleshooting

- If the application fails to start, check that all required packages are installed and that the virtual environment is activated.
- For any other issues, please check the console output for error messages. 