# BrutalReply AI - Product Requirements Document

## Original Problem Statement
Build a fully powered AI chatbot like ChatGPT where all answers are savage/roast style. User asks anything and gets roasted instead of normal answers.

## User Choices
- AI Model: OpenAI GPT-5.2 (via emergentintegrations)
- Chat History: Multiple chats with sidebar (ChatGPT-like)
- Authentication: None (removed per user request)
- Roast Level: Always full savage mode (no customization)
- Theme: Dark neo-brutalist

## Architecture
- **Backend**: FastAPI + MongoDB + emergentintegrations (GPT-5.2)
- **Frontend**: React + Tailwind + shadcn/ui
- **Database**: MongoDB (chats, messages collections)
- **User Identification**: Anonymous via localStorage UUID + X-User-ID header

## What's Been Implemented (April 2026)
- [x] Savage AI chatbot with GPT-5.2 integration
- [x] Multiple chat history with sidebar
- [x] Create, rename, delete chats
- [x] Send messages and get savage AI responses
- [x] Dark neo-brutalist UI (Unbounded + JetBrains Mono fonts)
- [x] Typewriter effect for AI responses
- [x] Mobile responsive layout
- [x] Welcome screen with suggestion prompts
- [x] Anonymous user system (no auth)

## Core Requirements
1. All AI responses must be savage/roast style
2. ChatGPT-like interface with sidebar
3. Chat history persistence per user
4. Dark theme with aggressive styling

## P0 (Done)
- Chat creation and messaging
- AI savage responses
- Chat history sidebar
- Mobile responsive

## P1 (Backlog)
- Message search across chats
- Chat export/share functionality
- Custom roast intensity levels

## P2 (Future)
- Voice input support
- Image-based roasting
- Roast of the day feature
