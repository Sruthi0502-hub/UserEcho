<<<<<<< HEAD
# Antigravity Analytics

## Overview
A full-stack web analytics platform featuring:
- **Backend**: FastAPI (Python) with SQLite database.
- **Frontend**: React (Vite) with a premium dark-mode dashboard.
- **Tracker**: Lightweight JavaScript tracker (`tracker.js`).

## Features
- Real-time visitor counting.
- Event tracking (Pageviews, Sessions, Clicks).
- Analytics Dashboard (Charts, Tables).
- AI-based Traffic Prediction (Peak time estimation).

## Setup & Run

### Prerequisites
- Python 3.8+
- Node.js & npm

### 1. Backend (API)
The backend runs on port `8000`.
```bash
cd backend
# Create virtual env (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (Dashboard)
The frontend runs on port `5173`.
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
- Open `http://localhost:5173` to view the Dashboard.
- The `tracker.js` is automatically embedded.
- Browse the dashboard to generate events (it tracks itself!).
