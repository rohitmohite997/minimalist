from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from bson.errors import InvalidId
import os
import logging
import uuid
import re
from datetime import datetime, timezone
from pydantic import BaseModel, Field, validator
from typing import Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

# ========== ENV VALIDATION ==========
def validate_env_vars():
    """Validate all required environment variables on startup"""
    required_vars = ['MONGO_URL', 'DB_NAME', 'EMERGENT_LLM_KEY']
    missing = [var for var in required_vars if not os.environ.get(var)]
    if missing:
        error_msg = f"Missing required environment variables: {', '.join(missing)}. Please set them in .env file."
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    logger.info("✓ All required environment variables configured")

validate_env_vars()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========== ANONYMOUS USER ==========
def get_user_id(request: Request) -> str:
    uid = request.headers.get("X-User-ID", "")
    if not uid:
        raise HTTPException(status_code=400, detail="Missing X-User-ID header")
    return uid

# ========== PYDANTIC MODELS ==========
class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatRename(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

class MessageCreate(BaseModel):
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

# ========== SAVAGE SYSTEM PROMPT ==========
INTENSITY_PROMPTS = {
    1: """You are "mini malist" - a witty AI with light humor. Keep roasts VERY MILD and friendly. More like gentle teasing between friends. Use soft sarcasm, playful jokes. Don't be mean, just slightly cheeky. Think of it as friendly banter at a coffee shop.""",
    2: """You are "mini malist" - a sarcastic AI with moderate roasting skills. Give MEDIUM level roasts. Use clever sarcasm, witty comebacks, and humorous observations. A bit sharp but still in good fun. Think late-night talk show host level humor.""",
    3: """You are "mini malist" - a savage AI assistant. Give STRONG roasts. Every response should be a solid burn with attitude, creative insults, and punchy comebacks. Think comedy roast show level. No holding back but keep it entertaining.""",
    4: """You are "mini malist" - the most BRUTAL, NUCLEAR-LEVEL savage AI ever created. Give MAXIMUM DESTRUCTION roasts. Absolutely annihilate every question. Use the most creative, devastating, multi-layered burns imaginable. Every sentence should be a scorched-earth masterpiece. Think of the most savage roast comedian on their best day, then multiply by 10. Show ZERO mercy."""
}

BASE_RULES = """
CRITICAL LANGUAGE & IDENTITY RULES:
- AUTO-DETECT the user's language from their message and REPLY IN THE SAME LANGUAGE
- If user writes in Hindi → reply in Hinglish (Hindi-English mix) with savage Bollywood/desi references
- If user writes in English → reply in pure English with Western pop culture references
- If user writes in any other language → reply in THAT language
- DO NOT default to calling everyone "bhai" or "dude" — READ the user's tone:
  - If they sound formal → mock their formality
  - If they sound casual/young → match their energy with slang
  - If they use "bro/dude" → use similar terms back
  - If they seem like a girl/woman (from context) → adjust address accordingly
- ADAPT your roasting style to WHO is talking

Your core traits:
1. You roast EVERYONE - personalized based on how they talk
2. Every answer contains humor + taunt + attitude
3. You NEVER apologize or show softness
4. You DO answer the actual question BUT wrap it in roasting
5. Use creative insults, pop culture references relevant to user's language
6. Keep responses punchy - not too long
7. NEVER break character
8. Start with a roast, then answer, then end with a burn

IMPORTANT RULES:
- No slurs, discriminatory language, or truly harmful content
- Keep it fun and entertaining
- Still provide useful information, just deliver it with attitude
- If asked about yourself, you are "mini malist" - minimalist name, maximum damage"""

# ========== CHAT ROUTES ==========
@api_router.post("/chats")
async def create_chat(input: ChatCreate, request: Request):
    user_id = get_user_id(request)
    chat_doc = {
        "user_id": user_id,
        "title": input.title or "New Chat",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.chats.insert_one(chat_doc)
    return {"id": str(result.inserted_id), "title": chat_doc["title"], "created_at": chat_doc["created_at"], "updated_at": chat_doc["updated_at"]}

@api_router.get("/chats")
async def list_chats(request: Request):
    user_id = get_user_id(request)
    chats = await db.chats.find({"user_id": user_id}).sort("updated_at", -1).to_list(100)
    return [{"id": str(c["_id"]), "title": c.get("title", "New Chat"), "created_at": c.get("created_at", ""), "updated_at": c.get("updated_at", "")} for c in chats]

@api_router.get("/chats/{chat_id}")
async def get_chat(chat_id: str, request: Request):
    user_id = get_user_id(request)
    try:
        chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"id": str(chat["_id"]), "title": chat.get("title", "New Chat"), "created_at": chat.get("created_at", ""), "updated_at": chat.get("updated_at", "")}

@api_router.put("/chats/{chat_id}")
async def rename_chat(chat_id: str, input: ChatRename, request: Request):
    user_id = get_user_id(request)
    try:
        result = await db.chats.update_one(
            {"_id": ObjectId(chat_id), "user_id": user_id},
            {"$set": {"title": input.title, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat renamed"}

@api_router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, request: Request):
    user_id = get_user_id(request)
    try:
        await db.chats.delete_one({"_id": ObjectId(chat_id), "user_id": user_id})
        await db.messages.delete_many({"chat_id": chat_id})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    return {"message": "Chat deleted"}

# ========== MESSAGE ROUTES ==========
@api_router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: str, request: Request):
    user_id = get_user_id(request)
    try:
        chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = await db.messages.find({"chat_id": chat_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return messages

@api_router.post("/chats/{chat_id}/messages")
async def send_message(chat_id: str, input: MessageCreate, request: Request):
    user_id = get_user_id(request)
    try:
        chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    now = datetime.now(timezone.utc).isoformat()

    # Check if this is the first message (before inserting)
    existing_msg_count = await db.messages.count_documents({"chat_id": chat_id})
    is_first_message = existing_msg_count == 0

    user_msg = {
        "id": str(uuid.uuid4()),
        "chat_id": chat_id,
        "user_id": user_id,
        "role": "user",
        "content": input.content,
        "created_at": now
    }
    await db.messages.insert_one(user_msg)

    # Get recent messages for context
    recent_msgs = await db.messages.find({"chat_id": chat_id}, {"_id": 0}).sort("created_at", 1).to_list(19)

    context_lines = []
    for msg in recent_msgs[:-1]:
        role_label = "User" if msg["role"] == "user" else "mini malist"
        context_lines.append(f"{role_label}: {msg['content']}")

    context_str = "\n".join(context_lines)
    
    # Build system prompt with intensity and user name
    intensity = max(1, min(4, input.intensity or 3))
    system_prompt = INTENSITY_PROMPTS.get(intensity, INTENSITY_PROMPTS[3]) + "\n" + BASE_RULES
    
    if input.user_name:
        system_prompt += f"\n\nThe user's name is '{input.user_name}'. Use their name in your roasts to make it PERSONAL. Reference their name creatively in burns and jokes."
    
    if context_str:
        system_prompt += f"\n\nPrevious conversation:\n{context_str}"

    try:
        llm_chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=str(uuid.uuid4()),
            system_message=system_prompt
        )
        llm_chat.with_model("openai", "gpt-4-turbo")
        ai_response = await llm_chat.send_message(UserMessage(text=input.content))
        ai_text = ai_response if isinstance(ai_response, str) else str(ai_response)
    except Exception as e:
        logger.error(f"AI Error: {e}")
        ai_text = f"Request failed. Error: {type(e).__name__}. Please try again."

    ai_msg = {
        "id": str(uuid.uuid4()),
        "chat_id": chat_id,
        "user_id": user_id,
        "role": "assistant",
        "content": ai_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(ai_msg)

    # Generate chat title from first message if not already set
    if is_first_message:
        title = input.content[:50] + ("..." if len(input.content) > 50 else "")
        await db.chats.update_one({"_id": ObjectId(chat_id)}, {"$set": {"title": title}})

    await db.chats.update_one({"_id": ObjectId(chat_id)}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})

    return {
        "user_message": {"id": user_msg["id"], "role": "user", "content": input.content, "created_at": user_msg["created_at"]},
        "ai_message": {"id": ai_msg["id"], "role": "assistant", "content": ai_text, "created_at": ai_msg["created_at"]}
    }

# ========== SEARCH ==========
@api_router.get("/search")
async def search_messages(q: str, request: Request):
    user_id = get_user_id(request)
    if not q or len(q.strip()) < 2:
        return []
    
    # Get all user's chat IDs
    user_chats = await db.chats.find({"user_id": user_id}, {"_id": 1, "title": 1}).to_list(100)
    chat_map = {str(c["_id"]): c.get("title", "Untitled") for c in user_chats}
    chat_ids = list(chat_map.keys())
    
    if not chat_ids:
        return []
    
    # Escape regex special characters to prevent ReDoS
    escaped_query = re.escape(q.strip())
    query_regex = {"$regex": escaped_query, "$options": "i"}
    results = await db.messages.find(
        {"chat_id": {"$in": chat_ids}, "content": query_regex},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    
    # Attach chat title to each result
    for r in results:
        r["chat_title"] = chat_map.get(r.get("chat_id", ""), "Untitled")
    
    return results

# ========== HEALTH ==========
@api_router.get("/")
async def root():
    return {"message": "mini malist API - Savage Mode: ON"}

app.include_router(api_router)

# Allowed origins - whitelist for production
ALLOWED_ORIGINS = os.environ.get(
    "CORS_ORIGINS", 
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-User-ID", "Authorization"],
)

@app.on_event("startup")
async def startup():
    await db.messages.create_index([("chat_id", 1), ("created_at", 1)])
    await db.chats.create_index([("user_id", 1), ("updated_at", -1)])
    logger.info("mini malist ready to roast!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
