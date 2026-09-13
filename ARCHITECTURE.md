# Project Structure Documentation

## Root Level

```
project/
├── backend/               # FastAPI backend application
├── frontend/              # React frontend application
├── tests/                 # Test directory (if exists)
├── memory/                # Project memory & documentation
├── docker-compose.yml     # Docker orchestration
├── Makefile              # Convenient commands
├── .dockerignore         # Docker build ignore
├── .gitignore            # Git ignore rules
├── PROJECT_SETUP_GUIDE.md # Main documentation
├── BUG_REPORT.md         # Bug analysis report
├── FIXES_COMPLETED.md    # Fix documentation
└── README.md             # Project overview
```

## Backend Structure

```
backend/
├── server.py              # Main FastAPI application
├── config.py              # Configuration management
├── logger.py              # Logging setup
├── schemas.py             # Pydantic models/schemas
├── rate_limit.py          # Rate limiting middleware
├── requirements-min.txt   # Minimal dependencies
├── requirements.txt       # All dependencies
├── .env                   # Local environment (gitignored)
├── .env.example           # Environment template
├── Dockerfile             # Container configuration
└── __pycache__/           # Python cache (gitignored)
```

### Backend Modules

#### server.py

- FastAPI application main file
- API endpoint definitions
- Database initialization
- Middleware setup

#### config.py

- Settings class for all configuration
- Environment variable validation
- Default values for all settings
- Centralized configuration management

#### logger.py

- Structured logging configuration
- Request/error logging functions
- Console output formatting

#### schemas.py

- Pydantic request models (ChatCreate, MessageCreate, etc.)
- Pydantic response models (ChatResponse, MessageResponse, etc.)
- Input validation definitions
- Error response schemas

#### rate_limit.py

- RateLimiter class implementation
- Per-user rate limiting
- Request tracking and reset timing

## Frontend Structure

```
frontend/
├── src/
│   ├── App.js             # Main app component
│   ├── index.js           # React entry point
│   ├── App.css            # Global styles
│   ├── index.css          # Base styles
│   ├── components/        # React components
│   │   ├── chat/          # Chat-related components
│   │   │   ├── ChatInput.js
│   │   │   ├── ChatMessages.js
│   │   │   ├── ChatSidebar.js
│   │   │   └── NamePrompt.js
│   │   └── ui/            # UI component library
│   │       ├── button.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       └── ...more UI components
│   ├── pages/             # Page components
│   │   ├── ChatPage.js    # Main chat interface
│   │   └── AuthPage.js    # Authentication (future)
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Auth context (future)
│   ├── hooks/             # Custom React hooks
│   │   └── use-toast.js   # Toast notifications
│   └── lib/               # Utility functions
│       └── utils.js       # Helper functions
├── public/                # Static assets
│   └── index.html         # HTML template
├── .env                   # Production backend URL
├── .env.local             # Local development URL
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind CSS config
├── craco.config.js        # Create React App config
├── Dockerfile             # Container configuration
└── node_modules/          # Dependencies (gitignored)
```

### Frontend Modules

### App.js

- Root React component
- Router setup
- Global providers

### pages/ChatPage.js

- Main chat UI
- State management for chats/messages
- API requests handling
- Error state management

### components/chat/ChatSidebar.js

- Chat list display
- Search functionality
- Intensity slider
- Chat creation/deletion

### components/chat/ChatMessages.js

- Message display
- Typewriter effect for AI responses
- Message bubbles
- Share functionality

### components/chat/ChatInput.js

- Message composition
- Auto-resizing textarea
- Send button
- Keyboard shortcuts

### components/chat/NamePrompt.js

- User name entry dialog
- Personalization setup

### contexts/AuthContext.js

- Auth state management (future use)
- Login/logout logic (future)

### hooks/use-toast.js

- Toast notification hook
- Success/error messages

## Configuration Files

### `config.py` (Backend)

Provides centralized configuration:
- API settings (version, title, debug)
- Database connection (MongoDB)
- LLM settings (model, timeout)
- CORS origins whitelist
- Rate limiting parameters
- Pagination limits
- Message validation rules

### `.env` (Backend)

Environment variables:

```bash
DEBUG=true|false
LOG_LEVEL=DEBUG|INFO|WARNING|ERROR
MONGO_URL=mongodb://...
DB_NAME=mini_malist
EMERGENT_LLM_KEY=api_key
CORS_ORIGINS=http://localhost:3000,...
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

### `.env.local` (Frontend)

Development environment:

```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

### `.env` (Frontend)

Production environment:

```bash
REACT_APP_BACKEND_URL=https://api.domain.com
```

## API Architecture

### Request Flow

```text
Frontend (React)
    ↓
Axios HTTP Client
    ↓
Backend (FastAPI)
    ├── CORS Middleware (validation)
    ├── Rate Limiter (requests check)
    ├── Request Logger (log request)
    ├── Pydantic Validation (input check)
    ├── Database Operations (MongoDB)
    ├── LLM API Call (Emergent)
    └── Response Logger (log response)
    ↓
JSON Response
    ↓
Frontend State Update
    ↓
UI Render
```

### Data Models

**Chat**
```javascript
{
  _id: ObjectId,
  user_id: string,
  title: string,
  created_at: ISO8601,
  updated_at: ISO8601
}
```

**Message**
```javascript
{
  id: UUID,
  chat_id: string,
  user_id: string,
  role: "user" | "assistant",
  content: string,
  created_at: ISO8601
}
```

## Middleware Stack

1. **CORS Middleware** - Cross-origin requests validation
2. **Request Logger** - Log all incoming requests
3. **Pydantic Validation** - Input schema validation
4. **Rate Limiter** - Per-user request limiting
5. **Error Handler** - Standardized error responses

## Database Schema

### Collections

**chats**
- Index: user_id, updated_at (for sorting)
- Documents: User chat metadata

**messages**
- Index: chat_id, created_at (for querying)
- Documents: Chat messages

### Indexes (Auto-created on startup)

```python
db.messages.create_index([("chat_id", 1), ("created_at", 1)])
db.chats.create_index([("user_id", 1), ("updated_at", -1)])
```

## Error Handling

### Backend Error Responses

```json
{
  "error": "error_type",
  "detail": "error message",
  "status_code": 400,
  "timestamp": "2026-04-12T10:00:00Z"
}
```

### Common Status Codes
- 200: Success
- 400: Bad request (validation)
- 401: Unauthorized
- 404: Not found
- 429: Rate limit exceeded
- 500: Server error

## Security Layers

1. **Input Validation** (Pydantic)
   - String length limits
   - Enum constraints
   - Type checking

2. **Rate Limiting**
   - Per-user limits
   - Time-window based
   - Configurable thresholds

3. **Database Safety**
   - ObjectId validation
   - User isolation (user_id checks)
   - Index optimization

4. **Regex Safety**
   - Special character escaping
   - ReDoS prevention

5. **CORS**
   - Origin whitelisting
   - Method restrictions
   - Header validation

## Build & Deployment

### Docker Images

**mini-malist-backend:latest**
- Python 3.11 slim base
- FastAPI + required packages
- Health check endpoint
- Uvicorn server

**mini-malist-frontend:latest**
- Node 18 alpine base
- Multi-stage build
- Optimized production build
- Health check endpoint

### Docker Compose Services

1. **mongodb** - Database (port 27017)
2. **backend** - API server (port 8000)
3. **frontend** - Web app (port 3000)

All services connected via `mini_malist_network`

## Performance Optimizations

- **Database Indexes**: Pre-computed for common queries
- **Message Pagination**: Limited to 500 per chat
- **Search Limiting**: Max 30 results
- **Input Size Limits**: 5000 chars for messages
- **Rate Limiting**: Prevents abuse
- **Connection Pooling**: MongoDB connection reuse

---

**This documentation aligns with production best practices and scalable architecture patterns.**
