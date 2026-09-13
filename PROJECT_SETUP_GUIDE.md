# mini malist - Savage AI Chat Application 🔥

A production-ready AI chat application with multi-language support, roasting AI assistant, and full-stack features.

## Features ✨

### 🤖 AI Features
- **Multi-language Support**: Auto-detects user language and responds accordingly
- **Intensity Levels**: 4 roasting levels (Chill → Nuclear)
- **Personalized Roasts**: Uses user name for custom burns
- **Conversation Memory**: Maintains context from previous messages
- **Error Recovery**: Graceful fallbacks with descriptive error messages

### 💬 Chat Features
- **Chat Management**: Create, rename, delete chats
- **Message Display**: Real-time typewriter effect for AI responses
- **Search**: Full-text search across all messages
- **Sidebar**: Quick chat access and organization
- **Share**: Copy roasts to clipboard and share

### 🔒 Security Features
- **CORS Whitelisting**: Restricted to allowed origins
- **Input Validation**: Comprehensive Pydantic validation
- **Rate Limiting**: Prevent abuse with request rate limits
- **Regex Safety**: Escaped search queries (ReDoS prevention)
- **ObjectId Validation**: MongoDB ID format validation
- **Error Logging**: Detailed error tracking for debugging

### 🎨 UI/UX Features
- **Dark Theme**: Modern dark interface with amber accents
- **Responsive Design**: Mobile, tablet, and desktop support
- **Loading States**: Visual feedback for async operations
- **Animations**: Smooth transitions and typewriter effects
- **Accessibility**: Semantic HTML and proper ARIA labels

### 📊 Developer Features
- **Structured Logging**: Detailed logs for debugging
- **Configuration Management**: Centralized env-based config
- **Docker Support**: One-command deployment setup
- **Health Checks**: API and service health monitoring
- **Error Handling**: Production-ready error responses

---

## Project Structure 📁

```
project/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main application
│   ├── config.py              # Configuration management
│   ├── logger.py              # Logging setup
│   ├── schemas.py             # Pydantic models
│   ├── rate_limit.py          # Rate limiting middleware
│   ├── .env.example           # Env template
│   ├── requirements-min.txt   # Python dependencies
│   ├── Dockerfile             # Backend container
│   └── .env                   # Local config (gitignored)
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.js             # Main app
│   │   ├── index.js           # Entry point
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities
│   ├── public/                # Static assets
│   ├── .env.local             # Dev environment
│   ├── package.json           # Dependencies
│   ├── Dockerfile             # Frontend container
│   └── tailwind.config.js     # Tailwind config
│
├── docker-compose.yml         # Docker orchestration
├── README.md                  # This file
├── BUG_REPORT.md             # Bug analysis
└── FIXES_COMPLETED.md        # Fix documentation
```

---

## Quick Start 🚀

### Option 1: Docker (Recommended)

```bash
# 1. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 2. Start all services
docker-compose up -d

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - MongoDB: localhost:27017
```

### Option 2: Local Development

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements-min.txt

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start MongoDB (requires local MongoDB running)
# Or use: mongod --dbpath ~/mongodb-data

# Run server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
yarn install
# or: npm install

# Create environment file
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env.local

# Start dev server
yarn start
# or: npm start

# Open http://localhost:3000
```

---

## Configuration 🔧

### Backend `.env` Variables

```bash
# Debug & Logging
DEBUG=true|false
LOG_LEVEL=DEBUG|INFO|WARNING|ERROR

# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=mini_malist

# LLM API (Required)
EMERGENT_LLM_KEY=your_key_here
LLM_MODEL=gpt-4-turbo
LLM_TIMEOUT=30

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Pagination
MAX_CHATS_PER_USER=100
MAX_MESSAGES_PER_CHAT=500
MAX_SEARCH_RESULTS=30
```

### Frontend `.env.local` Variables

```bash
# Local development
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Frontend `.env` Variables (Production)

```bash
# Production
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

---

## API Documentation 📚

### Base URL

```text
http://localhost:8000/api
```

### Endpoints

#### Chats
- `POST /chats` - Create chat
- `GET /chats` - List all chats
- `GET /chats/{id}` - Get specific chat
- `PUT /chats/{id}` - Rename chat
- `DELETE /chats/{id}` - Delete chat

#### Messages
- `GET /chats/{id}/messages` - List messages
- `POST /chats/{id}/messages` - Send message

#### Search
- `GET /search?q=query` - Search messages

#### Health
- `GET /` - API health check

### Message Creation

```json
POST /chats/{chat_id}/messages
Content-Type: application/json
X-User-ID: user-123

{
  "content": "Your question here",
  "user_name": "Your Name",
  "intensity": 3
}
```

Response:
```json
{
  "user_message": {
    "id": "msg-1",
    "role": "user",
    "content": "Your question here",
    "created_at": "2026-04-12T10:00:00Z"
  },
  "ai_message": {
    "id": "msg-2",
    "role": "assistant",
    "content": "Roasted response...",
    "created_at": "2026-04-12T10:00:01Z"
  }
}
```

---

## Development 👨‍💻

### Code Quality

```bash
# Backend linting
cd backend
flake8 server.py

# Format code
black server.py

# Frontend linting
cd frontend
yarn lint

# Format frontend
yarn format
```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

### Database

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# View collections
use mini_malist
db.chats.find()
db.messages.find()
```

---

## Deployment 🌐

### Using Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Environment for Production

Create `.env` for production:

```bash
DEBUG=false
LOG_LEVEL=INFO
MONGO_URL=your_production_mongo_uri
EMERGENT_LLM_KEY=production_key
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=300
```

### MongoDB Atlas Setup

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Set `MONGO_URL` in production `.env`

---

## Troubleshooting 🐛

### Backend Issues

**MongoDB Connection Error**

```text
Error: cannot connect to MongoDB
Solution: Ensure MongoDB is running
docker run -d -p 27017:27017 mongo:7.0
```

**Missing Environment Variables**

```text
Error: Missing required environment variables
Solution: Copy .env.example to .env and fill in values
cp backend/.env.example backend/.env
```

**Port Already in Use**

```text
Error: Address already in use :8000
Solution: Change port in server startup
uvicorn server:app --port 8001
```

### Frontend Issues

**API Connection Error**

```text
Error: Failed to fetch from backend
Solution: Check REACT_APP_BACKEND_URL in .env.local
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env.local
```

**Build Fails**

```text
Solution: Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
yarn build
```

---

## Performance Tips ⚡

1. **Database Indexing**: Already configured on startup
2. **Message Pagination**: Limited to 500 per chat
3. **Search Results**: Limited to 30 results
4. **Rate Limiting**: Enabled by default (100 req/min)
5. **Input Validation**: Prevents large payloads (max 5000 bytes)

---

## Security Checklist ✅

- [x] CORS whitelisting
- [x] Input validation
- [x] Rate limiting
- [x] Regex escaping
- [x] Environment variable validation
- [x] Error logging
- [x] ObjectId validation
- [x] Request signing (via X-User-ID header)

---

## Future Enhancements 🔮

- [ ] User authentication (JWT)
- [ ] Premium features (chat export, advanced search)
- [ ] Analytics dashboard
- [ ] Webhooks for integrations
- [ ] Browser extensions
- [ ] Mobile apps (React Native)
- [ ] Multi-language AI responses
- [ ] Custom AI model selection

---

## Contributing 🤝

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -am 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## License 📄

MIT License - See LICENSE file

---

## Support 💬

- Issues: GitHub Issues
- Discussion: GitHub Discussions
- Documentation: See docs/ folder

---

## Credits 👏

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Made with 🔥 by mini malist team**

*Last updated: April 12, 2026*
