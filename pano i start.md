# Startup Instructions

## Backend (FastAPI Server)
From the project root:
```
cd Backend && python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```
Server will run on: http://127.0.0.1:8000

## Frontend (React App)
From the project root:
```
cd Frontend && npm run dev
```
App will run on: http://localhost:5173/ (or next available port)

## Full Stack Testing
1. Start backend first
2. Start frontend
3. Open http://localhost:5175/ in browser (or next available port)
4. Navigate to Dashboard, Portfolio, Transactions, Buy/Sell, Settings pages

