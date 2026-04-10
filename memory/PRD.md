# mini malist - Savage AI Chatbot

## Original Problem Statement
Build a savage roast AI chatbot "mini malist" with personalized roasts, adjustable intensity, and share functionality.

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (GPT-5.2)
- **Frontend**: React + Tailwind + shadcn/ui
- **User ID**: Anonymous via localStorage UUID + X-User-ID header

## What's Been Implemented (April 2026)
- [x] Renamed to "mini malist"
- [x] User name prompt - remembers name, AI uses it for personalized roasts
- [x] Roast intensity slider (Chill / Spicy / Savage / Nuclear)
- [x] Share button on AI messages - copies formatted roast to clipboard
- [x] AI auto-detects language (Hindi→Hinglish, English→English)
- [x] AI adapts tone per user personality
- [x] Message search across all chats
- [x] Multiple chat history with sidebar
- [x] Create, rename, delete chats
- [x] Dark theme with amber/gold accents
- [x] Typewriter effect for AI responses
- [x] Mobile responsive layout

## P1 (Backlog)
- Markdown rendering in AI responses
- Voice input support
- Chat export as image

## P2 (Future)
- Image-based roasting
- Roast leaderboard
- Social media direct sharing
