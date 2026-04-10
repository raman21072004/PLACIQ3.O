# PlaCIQ 2.0 — Agentic AI Placement Intelligence System
**HackAI Season 2 Submission · Built with Claude AI (Anthropic)**

---

## 🚀 What is PlaCIQ 2.0?

PlaCIQ 2.0 is a **multi-agent AI system** that autonomously analyzes student profiles, fetches market intelligence, builds personalized placement strategies, conducts mock interviews, and optimizes resumes — all powered by **Claude AI (Anthropic)** with Gemini as fallback.

### 5 Intelligent Agents
| Agent | Function |
|-------|----------|
| 🧠 Profile Analyzer | Reads resume/skills, outputs readiness score + gaps |
| 📡 Market Intelligence | Real-time 2025 job market trends, hot skills, top companies |
| 🗺️ Strategy Engine | Personalized week-by-week placement roadmap |
| 🎯 Interview Coach | Company-specific questions + AI feedback via Claude |
| 📄 Resume Optimizer | ATS scoring, keyword gaps, bullet rewrites |

### Unique Features
- **Claude AI Chat** — Multi-turn conversational placement coach powered by Anthropic
- **Resume Upload** — PDF/DOC upload → AI analysis (ATS score, fixes, keywords)
- **Agentic Pipeline Visualizer** — Real-time agent execution flow
- **Mock Interview with AI Evaluation** — Claude scores answers, gives model answers
- **MongoDB Atlas** — Persistent user data, profile, sessions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite, CSS Variables, Recharts |
| Backend | Node.js + Express, Socket.IO |
| AI (Primary) | **Claude claude-sonnet-4-5** (Anthropic) |
| AI (Fallback) | Google Gemini 1.5 Flash |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Deployment | Frontend → Vercel, Backend → Railway |

---

## ⚡ Quick Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend `.env`** (copy from `.env.example`):
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/placiq
JWT_SECRET=your-strong-secret-key
ANTHROPIC_API_KEY=sk-ant-api03-...   # From console.anthropic.com
GEMINI_API_KEY=AIza...               # Optional fallback - aistudio.google.com
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`**:
```env
VITE_API_URL=/api
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: http://localhost:5173

### 4. Demo Login
Click **"Try Demo (No signup required)"** on the login page — no API keys needed for basic UI exploration.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy /dist folder to Vercel
# Set environment variable: VITE_API_URL=https://your-backend.railway.app/api
```

### Backend → Railway
1. Push backend folder to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Railway auto-detects Node.js and deploys

---

## 🔑 API Keys

| Key | Where to Get | Required? |
|-----|-------------|-----------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Yes (primary AI) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | No (fallback) |
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) | Yes (database) |

---

## 📁 Project Structure

```
placiq/
├── backend/
│   ├── agents/
│   │   ├── claudeAgent.js     ← Anthropic Claude API
│   │   └── geminiAgent.js     ← Google Gemini (fallback)
│   ├── models/User.js
│   ├── routes/
│   │   ├── agent.js           ← All 5 agents + chat + resume upload
│   │   ├── auth.js
│   │   ├── profile.js
│   │   └── dashboard.js
│   ├── middleware/auth.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx        ← Auth + agent showcase
        │   ├── Dashboard.jsx    ← Stats, charts, activity
        │   ├── Agents.jsx       ← 5-agent orchestrator + Claude chat
        │   ├── Resume.jsx       ← File upload + AI analysis
        │   ├── MockInterview.jsx ← AI interview with scoring
        │   ├── Strategy.jsx     ← Roadmap with task tracking
        │   └── Profile.jsx      ← User profile management
        ├── components/Layout.jsx
        ├── context/AuthContext.jsx
        └── index.css            ← Professional design system
```

---

## 🏆 Evaluation Criteria

| Criteria | Implementation |
|----------|---------------|
| **Deployment (20%)** | Vercel + Railway, working web app |
| **Agentic AI (20%)** | 5 autonomous agents, Claude AI orchestration |
| **Presentation (20%)** | Clean UI, live demo ready |
| **Placement Impact (15%)** | Risk scoring, personalized roadmaps, ATS analysis |
| **Innovation (25%)** | Claude AI chat, resume upload, multi-model fallback |

---

Built for **HackAI Season 2** · Overhauling the university placement engine.
