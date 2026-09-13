# Mini Malist - Chat Website

A modern, minimalist chat website with AI-powered responses. Built with React, FastAPI, and MongoDB.

## Features

✨ **Clean & Minimalist Design** - Simple, distraction-free chat interface
🤖 **AI-Powered Chat** - Intelligent responses with customizable personality
💾 **Message History** - Save and organize multiple conversations
⚡ **Real-time Data** - Instant message updates
🔒 **Secure** - User-isolated data with proper validation

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Docker (optional, for containerized deployment)

### Local Development

**Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

**Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python -m uvicorn server:app --reload
```

Frontend will be available at `http://localhost:3000`
Backend API at `http://localhost:8000`

### Using Docker

```bash
docker-compose up --build
```

## Project Structure

```
project/
├── frontend/         # React web application
│   ├── src/         # React components & pages
│   ├── public/      # Static assets
│   └── package.json # Dependencies
│
├── backend/         # FastAPI backend
│   ├── server.py    # Main application
│   ├── config.py    # Configuration
│   ├── schemas.py   # Data models
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

## Deployment

See [PROJECT_SETUP_GUIDE.md](PROJECT_SETUP_GUIDE.md) for detailed deployment instructions.

## Environment Variables

### Backend (.env)
```
MONGO_URL=your_mongodb_connection_string
DB_NAME=chat_db
EMERGENT_LLM_KEY=your_api_key
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:8000
```

## License

MIT

## Support

For issues or questions, refer to [QUICK_START.md](QUICK_START.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

