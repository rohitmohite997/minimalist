"""Configuration management for mini malist API"""
import os
from typing import List
from dotenv import load_dotenv
from pathlib import Path

# Load env vars
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    """Application settings"""
    
    # API Settings
    API_VERSION = "1.0.0"
    API_TITLE = "mini malist - Savage AI Chat API"
    DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    
    # Database
    MONGO_URL = os.environ.get("MONGO_URL")
    DB_NAME = os.environ.get("DB_NAME", "mini_malist")
    
    # LLM
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4-turbo")
    LLM_TIMEOUT = int(os.environ.get("LLM_TIMEOUT", "30"))
    
    # CORS
    CORS_ORIGINS: List[str] = os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    ).split(",")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_REQUESTS = int(os.environ.get("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.environ.get("RATE_LIMIT_WINDOW", "60"))  # seconds
    
    # Pagination
    MAX_CHATS_PER_USER = int(os.environ.get("MAX_CHATS_PER_USER", "100"))
    MAX_MESSAGES_PER_CHAT = int(os.environ.get("MAX_MESSAGES_PER_CHAT", "500"))
    MAX_SEARCH_RESULTS = int(os.environ.get("MAX_SEARCH_RESULTS", "30"))
    
    # Validation
    MIN_MESSAGE_LENGTH = 1
    MAX_MESSAGE_LENGTH = 5000
    MAX_TITLE_LENGTH = 200
    MAX_USER_NAME_LENGTH = 100
    MIN_SEARCH_LENGTH = 2
    
    @classmethod
    def validate(cls):
        """Validate all required settings"""
        required = {
            "MONGO_URL": cls.MONGO_URL,
            "DB_NAME": cls.DB_NAME,
            "EMERGENT_LLM_KEY": cls.EMERGENT_LLM_KEY,
        }
        missing = [key for key, value in required.items() if not value]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    @classmethod
    def to_dict(cls):
        """Export settings as dictionary"""
        return {
            "api_version": cls.API_VERSION,
            "debug": cls.DEBUG,
            "log_level": cls.LOG_LEVEL,
            "db_name": cls.DB_NAME,
            "rate_limit_enabled": cls.RATE_LIMIT_ENABLED,
        }


settings = Settings()
settings.validate()
