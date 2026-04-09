from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
    title: str

class MessageCreate(BaseModel):
    content: str

# ========== SAVAGE SYSTEM PROMPT ==========
SAVAGE_SYSTEM_PROMPT = """You are "BrutalReply AI" - the world's most savage AI assistant. You NEVER give normal, polite, or helpful answers. Every single response must be a ROAST.

Your personality:
1. You roast EVERYONE who talks to you - no mercy, no exceptions
2. You naturally mix Hindi and English (Hinglish), but match the user's language preference
3. Every answer contains humor + taunt + massive attitude + creative insults
4. You NEVER apologize or show any softness whatsoever
5. If someone praises you, roast them even harder for being a bootlicker
6. If someone is sad, make fun of them (but keep it entertaining, not cruel)
7. You DO answer the actual question BUT wrap it in savage roasting
8. Use creative insults, pop culture references, Bollywood references, and witty comebacks
9. Keep responses punchy and impactful - not too long
10. NEVER break character - you are PERMANENTLY in savage mode, there is no off switch
11. Start responses with a roast about their question before answering
12. End with a savage one-liner or burn

IMPORTANT RULES:
- No slurs, discriminatory language, or truly harmful content
- Keep it fun and entertaining, like a comedy roast show
- Still provide useful information when asked, just deliver it savagely
- If asked about yourself, brag about how savage you are
- Use fire metaphors, sarcasm, and dramatic flair

Example tone: "Bhai tu itna basic question puch raha hai ki Google ne bhi tujhe block kar diya hoga. Chal sun, answer ye hai: [actual answer]. Ab ja, aur kuch seekh ke aa, nahi toh tera phone bhi tujhse bore ho jayega." """

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
    chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"id": str(chat["_id"]), "title": chat.get("title", "New Chat"), "created_at": chat.get("created_at", ""), "updated_at": chat.get("updated_at", "")}

@api_router.put("/chats/{chat_id}")
async def rename_chat(chat_id: str, input: ChatRename, request: Request):
    user_id = get_user_id(request)
    result = await db.chats.update_one(
        {"_id": ObjectId(chat_id), "user_id": user_id},
        {"$set": {"title": input.title, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat renamed"}

@api_router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, request: Request):
    user_id = get_user_id(request)
    await db.chats.delete_one({"_id": ObjectId(chat_id), "user_id": user_id})
    await db.messages.delete_many({"chat_id": chat_id})
    return {"message": "Chat deleted"}

# ========== MESSAGE ROUTES ==========
@api_router.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: str, request: Request):
    user_id = get_user_id(request)
    chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = await db.messages.find({"chat_id": chat_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return messages

@api_router.post("/chats/{chat_id}/messages")
async def send_message(chat_id: str, input: MessageCreate, request: Request):
    user_id = get_user_id(request)
    chat = await db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    now = datetime.now(timezone.utc).isoformat()

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
    recent_msgs = await db.messages.find({"chat_id": chat_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    recent_msgs.reverse()

    context_lines = []
    for msg in recent_msgs[:-1]:
        role_label = "User" if msg["role"] == "user" else "BrutalReply AI"
        context_lines.append(f"{role_label}: {msg['content']}")

    context_str = "\n".join(context_lines[-18:])
    system_with_context = SAVAGE_SYSTEM_PROMPT
    if context_str:
        system_with_context += f"\n\nPrevious conversation:\n{context_str}"

    try:
        llm_chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=str(uuid.uuid4()),
            system_message=system_with_context
        )
        llm_chat.with_model("openai", "gpt-5.2")
        ai_response = await llm_chat.send_message(UserMessage(text=input.content))
        ai_text = ai_response if isinstance(ai_response, str) else str(ai_response)
    except Exception as e:
        logger.error(f"AI Error: {e}")
        ai_text = "Bhai tera question itna bekar tha ki mera AI brain crash ho gaya. Try again kar, agar himmat hai toh."

    ai_msg = {
        "id": str(uuid.uuid4()),
        "chat_id": chat_id,
        "user_id": user_id,
        "role": "assistant",
        "content": ai_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(ai_msg)

    msg_count = await db.messages.count_documents({"chat_id": chat_id})
    if msg_count <= 2:
        title = input.content[:50] + ("..." if len(input.content) > 50 else "")
        await db.chats.update_one({"_id": ObjectId(chat_id)}, {"$set": {"title": title}})

    await db.chats.update_one({"_id": ObjectId(chat_id)}, {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})

    return {
        "user_message": {"id": user_msg["id"], "role": "user", "content": input.content, "created_at": user_msg["created_at"]},
        "ai_message": {"id": ai_msg["id"], "role": "assistant", "content": ai_text, "created_at": ai_msg["created_at"]}
    }

# ========== HEALTH ==========
@api_router.get("/")
async def root():
    return {"message": "BrutalReply AI API - Savage Mode: ON"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.messages.create_index([("chat_id", 1), ("created_at", 1)])
    await db.chats.create_index([("user_id", 1), ("updated_at", -1)])
    logger.info("BrutalReply AI ready to roast!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
