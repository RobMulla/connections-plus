import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "you-will-never-guess"
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "sqlite:///" + os.path.join(basedir, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # NYT Connections game settings
    CONNECTIONS_CATEGORIES_COUNT = 4
    CONNECTIONS_WORDS_PER_CATEGORY = 4

    # Application settings
    DEBUG = os.environ.get("DEBUG") or True
    TESTING = os.environ.get("TESTING") or False
