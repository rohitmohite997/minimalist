"""Pydantic models/schemas for mini malist API"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, validator


# ========== REQUEST MODELS ==========
class ChatCreate(BaseModel):
    """Schema for creating a new chat"""
    title: Optional[str] = Field(None, max_length=200)
    
    @validator('title')
    def validate_title(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty string')
        return v or "New Chat"


class ChatRename(BaseModel):
    """Schema for renaming a chat"""
    title: str = Field(..., min_length=1, max_length=200)


class MessageCreate(BaseModel):
    """Schema for creating a message"""
    content: str = Field(..., min_length=1, max_length=5000)
    user_name: Optional[str] = Field(None, max_length=100)
    intensity: Optional[int] = 3
    
    @validator('intensity')
    def validate_intensity(cls, v):
        if v is None:
            return 3
        if not isinstance(v, int) or v < 1 or v > 4:
            raise ValueError('Intensity must be between 1 and 4')
        return v


# ========== RESPONSE MODELS ==========
class ChatResponse(BaseModel):
    """Chat response schema"""
    id: str
    title: str
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Message response schema"""
    id: str
    chat_id: str
    role: str  # 'user' or 'assistant'
    content: str
    created_at: str
    
    class Config:
        from_attributes = True


class SendMessageResponse(BaseModel):
    """Response for sending a message"""
    user_message: MessageResponse
    ai_message: MessageResponse


class SearchResultResponse(BaseModel):
    """Search result response schema"""
    id: str
    chat_id: str
    role: str
    content: str
    created_at: str
    chat_title: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: str


# ========== ERROR RESPONSES ==========
class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: str
    status_code: int
    timestamp: str
