# Connections Plus - Setup Guide

This guide will help you set up and run the Connections Plus application on your local machine.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git (optional, for cloning the repository)

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
   pip install -r requirements.txt
   ```

## Database Setup

1. Initialize the database:
   ```
   python scripts/init_db.py
   ```

2. Create sample puzzles:
   ```
   python scripts/create_sample_puzzles.py
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
  - `models.py` - Database models
  - `routes.py` - Route definitions
- `scripts/` - Utility scripts
  - `init_db.py` - Database initialization
  - `create_sample_puzzles.py` - Sample data creation
- `static/` - Static files (CSS, JavaScript)
  - `css/styles.css` - Main stylesheet
  - `js/main.js` - Main JavaScript file
- `templates/` - HTML templates
  - `base.html` - Base template
  - `index.html` - Home page
  - `puzzle.html` - Puzzle page
  - `archive.html` - Puzzle archive
  - `about.html` - About page
- `config.py` - Application configuration
- `run.py` - Application entry point

## Features

- Drag & Drop Interface
- Color Coding (right-click on cards)
- Note-taking
- Game History
- Submission Management
- AI-Powered Hints

## Troubleshooting

- If you encounter database errors, try deleting the `app.db` file and running the database setup steps again.
- If the application fails to start, check that all required packages are installed and that the virtual environment is activated.
- For any other issues, please check the console output for error messages. 