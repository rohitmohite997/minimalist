# 🚀 Quick Start Guide - mini malist

**Get the app running in 5 minutes!**

## Fastest Way: Docker

### Prerequisites
- Docker & Docker Compose installed
- API key from Emergent (EMERGENT_LLM_KEY)

### Steps

1. **Clone and setup**
   ```bash
   cd project
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env`**
   ```bash
   EMERGENT_LLM_KEY=your_actual_key_here
   MONGO_URL=mongodb://admin:password@mongodb:27017
   ```

3. **Start everything**
   ```bash
   docker-compose up -d
   ```

4. **Access**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - MongoDB: localhost:27017

✅ **Done!** App is running!

---

## Local Development Setup

### Backend (Python)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements-min.txt

# Setup environment
cp .env.example .env
# Edit .env with your EMERGENT_LLM_KEY

# Start MongoDB (in another terminal)
# Install MongoDB or use Docker:
docker run -d -p 27017:27017 mongo:7.0

# Run backend
uvicorn server:app --reload
```

### Frontend (Node.js)

```bash
# Navigate to frontend (in another terminal)
cd frontend

# Install dependencies
yarn install

# Create local environment
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env.local

# Start frontend
yarn start
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Verification

### Check Backend Health
```bash
curl http://localhost:8000/api/
```

Expected response:
```json
{"message": "mini malist API - Savage Mode: ON"}
```

### Create First Chat
```bash
curl -X POST http://localhost:8000/api/chats \
  -H "X-User-ID: test-user" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat"}'
```

### Send Message
```bash
curl -X POST http://localhost:8000/api/chats/{chat_id}/messages \
  -H "X-User-ID: test-user" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, roast me!",
    "intensity": 2
  }'
```

---

## Common Issues

### "Permission denied" error
**Solution:** Make sure you have rights to access ports 3000, 8000, 27017

### MongoDB connection failed
**Solution:** Ensure MongoDB is running
```bash
# Check if running
mongosh
# If not, start it:
mongod
```

### Backend won't start
**Solution:** Check env vars are set
```bash
# Verify
echo $EMERGENT_LLM_KEY
```

### Frontend blank page
**Solution:** Check .env.local
```bash
cat frontend/.env.local
# Should show: REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Next Steps

After setup works:

1. **Explore API** - See PROJECT_SETUP_GUIDE.md
2. **Read Architecture** - See ARCHITECTURE.md
3. **Configure** - Edit configs in backend/.env
4. **Deploy** - Use docker-compose.yml
5. **Develop** - Start coding!

---

## Useful Commands

```bash
# Run makes (if installed)
make help              # See all commands
make dev              # Start dev environment
make docker-up        # Start Docker
make logs             # View logs
make lint             # Check code quality
make clean            # Clean up

# Backend
uvicorn server:app --reload --port 8000
pytest                # Run tests

# Frontend
yarn start            # Dev server
yarn build            # Production build
yarn test             # Run tests

# Docker
docker-compose up -d  # Start
docker-compose down   # Stop
docker-compose logs   # View logs
```

---

## Environment Variables Needed

**Backend (.env)**
```
EMERGENT_LLM_KEY=required  # Your API key
MONGO_URL=optional         # Default: local
DB_NAME=optional           # Default: mini_malist
```

**Frontend (.env.local)**
```
REACT_APP_BACKEND_URL=optional  # Default: http://localhost:8000
```

---

## Support

- **Issues:** Check BUG_REPORT.md and FIXES_COMPLETED.md
- **Setup:** See PROJECT_SETUP_GUIDE.md
- **Architecture:** See ARCHITECTURE.md
- **API Docs:** Check /docs on running backend

---

**Questions? Start with the most recent setup guide!** 🎉
