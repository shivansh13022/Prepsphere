# PrepSphere

### AI-Powered Career Preparation & Adaptive Interview Platform

PrepSphere is a full-stack AI career preparation platform designed to connect the complete job preparation workflow — from understanding a candidate's profile and discovering relevant jobs to conducting adaptive AI interviews, analyzing performance, and tracking applications.

Unlike a traditional mock interview application that follows a fixed list of questions, PrepSphere uses an adaptive interview workflow built with LangGraph. The interview dynamically decides whether to ask a follow-up, explore a concept deeper, maintain the current level, or move to another concept based on the candidate's previous answer.

🌐 **Live Application:** https://prepsphere-xi.vercel.app

---

## ✨ Key Features

### 📄 Resume Intelligence

- Upload and parse resumes
- Extract structured candidate information
- Build a candidate profile from resume data
- Normalize technical skills using a canonical skill taxonomy
- Detect duplicate resume uploads

### 💼 Job Intelligence

- Analyze job descriptions using structured LLM outputs
- Extract required skills and role information
- Compare candidate skills with job requirements
- Identify skill gaps
- Discover external SDE, AI/ML, and Data Science opportunities through Adzuna
- Open jobs directly on the original job portal

### 🤖 Adaptive AI Interviews

PrepSphere's interview system is not based on a fixed question list.

The interview agent dynamically adapts according to the candidate's answers.

It supports:

- Multiple interview topics
- Easy, medium, and hard difficulty levels
- 15, 30, 45, and 60 minute interviews
- Concept-aware question planning
- Adaptive follow-up questions
- Dynamic difficulty/depth decisions
- Manual interview termination
- Automatic time-based completion
- Persistent interview history

The evaluator can choose between:

```text
follow_up
same_level
go_deeper
next_concept
next_topic
```

This creates an interview flow that reacts to candidate performance instead of simply iterating through predefined questions.

---

## 🎙️ Voice Interview Experience

PrepSphere supports voice-based mock interviews.

The flow is:

```text
AI Question
     ↓
Text-to-Speech
     ↓
Candidate speaks
     ↓
Audio recording
     ↓
Speech-to-Text
     ↓
Transcript
     ↓
AI Evaluation
     ↓
Next adaptive question
```

The current implementation uses browser speech synthesis for question playback and Groq Whisper for speech-to-text transcription.

---

## 📊 Interview Evaluation & Analytics

After an interview, PrepSphere generates a structured performance report containing:

- Overall interview score
- Technical correctness
- Completeness
- Depth
- Communication
- Strong areas
- Weak areas
- Improvement suggestions
- Topic-level performance

The platform also maintains historical analytics across interviews.

### Skill Trend Intelligence

Topic performance is compared across interviews to identify whether a skill is:

- Improving
- Stable
- Declining

PrepSphere also assigns topic priorities based on recent performance, helping candidates identify areas that need more preparation.

---

## 📋 Application Tracker

Candidates can maintain their job application pipeline directly inside PrepSphere.

Supported states include:

```text
Saved
Applied
OA
Interview
Offer
Rejected
Withdrawn
```

Applications can originate from manually added jobs or discovered jobs.

---

## 🔐 Authentication

PrepSphere supports:

- Email/password authentication
- JWT-based authorization
- Google OAuth
- User-specific protected resources

Resume data, interviews, reports, analytics, and applications are scoped to the authenticated user.

---

# 🧠 Adaptive Interview Architecture

A simplified interview lifecycle:

```text
Interview Setup
      ↓
Concept Planning
      ↓
Generate Question
      ↓
Candidate Answer
      ↓
LLM Evaluation
      ↓
┌─────────────────────────────┐
│ Adaptive Decision           │
│                             │
│ • Follow Up                 │
│ • Same Level                │
│ • Go Deeper                 │
│ • Next Concept              │
│ • Next Topic                │
└─────────────────────────────┘
      ↓
Next Question
      ↓
Interview Complete
      ↓
Performance Report
```

LangGraph manages the interview state and transitions between the different stages of the interview.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      User Browser    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + TypeScript │
                         │        Vite          │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                               REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
        ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
        │   PostgreSQL   │ │  LangGraph   │ │ External APIs  │
        │   SQLAlchemy   │ │  LangChain   │ │                │
        │    Alembic     │ │              │ │ Adzuna         │
        └────────────────┘ └──────┬───────┘ │ Google OAuth   │
                                  │         └────────────────┘
                                  ▼
                           ┌──────────────┐
                           │    Groq      │
                           │ LLM + Whisper│
                           └──────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios
- Recharts
- Lucide React

## Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic

## AI / Agentic Workflow

- LangGraph
- LangChain
- Groq
- Structured LLM outputs
- Whisper speech-to-text

## Authentication

- JWT
- Google OAuth

## External Integrations

- Adzuna Jobs API

## Infrastructure

- Docker / Docker Compose — local PostgreSQL development
- Vercel — frontend deployment
- Render — backend deployment
- Neon — production PostgreSQL
- GitHub — source control

---

# 🚀 Production Architecture

```text
                       GitHub
                          │
               ┌──────────┴──────────┐
               │                     │
               ▼                     ▼
            Vercel                 Render
       React/Vite Frontend      FastAPI Backend
               │                     │
               └──────────┬──────────┘
                          │
                          ▼
                    Neon PostgreSQL
```

The production application separates frontend, backend, and database infrastructure while keeping the local development environment isolated through Docker.

---

# 📁 Project Structure

```text
Prepsphere/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── services/
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── requirements.txt
│   └── alembic.ini
│
└── README.md
```

---

# ⚙️ Local Development

## 1. Clone the repository

```bash
git clone https://github.com/shivansh13022/Prepsphere.git
cd Prepsphere
```

## 2. Backend Setup

```bash
cd backend

python -m venv .venv
```

Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables in:

```text
backend/.env
```

Example variable names:

```env
DATABASE_URL=
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

GOOGLE_API_KEY=
GROQ_API_KEY=

ADZUNA_APP_ID=
ADZUNA_APP_KEY=
GOOGLE_CLIENT_ID=

FRONTEND_URL=http://localhost:5173
```

Never commit real API keys or secrets.

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Configure:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
VITE_GOOGLE_CLIENT_ID=
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🗄️ Database Migrations

PrepSphere uses Alembic for database schema migrations.

Create a migration:

```bash
alembic revision --autogenerate -m "migration description"
```

Apply migrations:

```bash
alembic upgrade head
```

Production migrations are applied before the FastAPI server starts.

---

# 🌐 Deployment

The production system is deployed using:

| Component | Platform        |
| --------- | --------------- |
| Frontend  | Vercel          |
| Backend   | Render          |
| Database  | Neon PostgreSQL |

The deployed backend runs Alembic migrations before starting the FastAPI server.

---

---

# 🔮 Future Improvements

Potential extensions include:

- Durable persistence for active LangGraph interview state
- Higher-quality neural text-to-speech
- Real-time streaming voice interviews
- Expanded job provider integrations
- More comprehensive automated testing
- Background job processing for expensive asynchronous workflows
- Observability and LLM cost monitoring
- Dedicated object storage for uploaded files

---

# 🔒 Security

API keys and production credentials are stored using environment variables and are excluded from source control.

The repository does not contain production database credentials, JWT secrets, or third-party API secrets.

---

# 👨‍💻 Author

**Shivansh Yadav**

Built as an exploration of agentic AI systems, adaptive interview intelligence, full-stack engineering, and production deployment.
