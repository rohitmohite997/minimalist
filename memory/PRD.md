# mini malist - Savage AI Chatbot

## Original Problem Statement
Build a savage roast AI chatbot. Renamed to "mini malist". Auto-detect user language, respond in same language. Multi-language support. Better dark theme with more color accents.

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (GPT-5.2)
- **Frontend**: React + Tailwind + shadcn/ui
- **User ID**: Anonymous via localStorage UUID + X-User-ID header

## What's Been Implemented (April 2026)
- [x] Renamed to "mini malist" (from BrutalReply)
- [x] AI auto-detects language (Hindi→Hinglish, English→English, etc.)
- [x] AI adapts tone per user (not default "bhai" to everyone)
- [x] Message search across all chats (GET /api/search?q=)
- [x] Improved dark theme with amber/gold accents, better contrast
- [x] Multiple chat history with sidebar
- [x] Create, rename, delete chats
- [x] Typewriter effect for AI responses
- [x] Mobile responsive layout
- [x] Welcome screen with multi-language suggestion prompts

## P1 (Backlog)
- Chat export/share functionality
- Voice input support
- Markdown rendering in AI responses

## P2 (Future)
- Image-based roasting
- Roast leaderboard
