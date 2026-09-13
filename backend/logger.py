"""Logging configuration for mini malist API"""
import logging
import sys
from datetime import datetime
from config import settings


def setup_logging():
    """Configure structured logging"""
    
    # Create logger
    logger = logging.getLogger("mini_malist")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Console handler with formatting
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Formatter with timestamps
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    # Add handler
    logger.addHandler(handler)
    
    return logger


logger = setup_logging()


def log_request(request, endpoint, user_id=None):
    """Log request details"""
    logger.info(
        f"Request: {request.method} {endpoint} | User: {user_id or 'anonymous'}"
    )


def log_error(error_type, error_msg, endpoint=None, user_id=None):
    """Log errors with context"""
    logger.error(
        f"Error [{error_type}]: {error_msg} | Endpoint: {endpoint} | User: {user_id or 'anonymous'}"
    )
