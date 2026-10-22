# PrepPulse AI — Intelligent Career & Interview Readiness Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248.svg)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3_Flash-4285F4.svg)](https://ai.google.dev/)

🚀 **Live Web App:** [https://preppulse-ai.vercel.app](https://preppulse-ai.vercel.app)  
📡 **Live API Endpoint:** [https://preppulse-ai-vzjf.onrender.com](https://preppulse-ai-vzjf.onrender.com/api/health)

> **PrepPulse AI** is a production-grade full-stack career acceleration platform that synthesizes job descriptions and candidate resumes to generate personalized technical strategies, interactive mock interviews with instant AI feedback, skill gap matrices, and automated ATS-tailored PDF resumes.

---

## 🌟 Key Engineering Features

- **Targeted Strategy Synthesis:** Ingests job descriptions and candidate resumes (PDF or structured text) and uses **Google Gemini 3 Flash** with structured Zod schemas to generate a multi-dimensional preparation roadmap.
- **Interactive Mock Practice Coach:** Candidates can draft answers to generated technical and behavioral questions and receive instant AI critique—including a 0–100 score, identified strengths, growth areas, and polished model delivery.
- **Competency & Skill Gap Matrix:** Maps role requirements against applicant skills, surfacing gaps labeled by severity (`High`, `Medium`, `Low`) to guide high-yield study priorities.
- **Automated ATS-Optimized Resume Generation:** Generates customized, ATS-friendly HTML resumes rendered directly into downloadable PDF files via a headless **Puppeteer** pipeline.
- **Enterprise-Grade Auth & Security:** JWT authentication stored in HTTP-only, secure cookies with database-backed token blacklisting on logout and bcrypt password hashing.
- **Modern Glassmorphic UI:** Built with React 19, Sass, and responsive dark-mode aesthetics designed for seamless candidate workflow.

---

## 🏗️ System Architecture

```
                    ┌─────────────────────────┐
                    │  React 19 + Vite Client │
                    │     (Port 5173)         │
                    └───────────┬─────────────┘
                                │ HTTP / REST (Axios + Cookies)
                                ▼
                    ┌─────────────────────────┐
                    │   Node.js / Express     │
                    │       API Server        │
                    │      (Port 3000)        │
                    └─────┬───────┬───────┬───┘
                          │       │       │
       ┌──────────────────┘       │       └──────────────────┐
       ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌───────────────────┐
│MongoDB Atlas │          │Google Gemini │          │ Headless Chrome   │
│ (Mongoose)   │          │3 Flash Engine│          │   (Puppeteer)     │
└──────────────┘          └──────────────┘          └───────────────────┘
```

---

## 🛠️ Tech Stack & Libraries

### Frontend
- **Framework:** React 19, Vite 7
- **Routing:** React Router 7
- **Styling:** Vanilla Sass (SCSS) with custom glassmorphic design system
- **Networking:** Axios with cross-origin credentials (`withCredentials: true`)

### Backend
- **Runtime:** Node.js, Express 5
- **Database:** MongoDB Atlas via Mongoose 9 ODM
- **AI Engine:** `@google/genai` (Gemini 3 Flash Preview) with structured Zod schemas
- **Document Processing:** `pdf-parse` (resume parsing), `multer` (file upload streams)
- **PDF Generation:** Puppeteer (headless browser rendering)
- **Security:** `jsonwebtoken` (JWT), `bcryptjs`, `cookie-parser`, `cors`

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue HTTP-only JWT |
| `GET` | `/api/auth/logout` | Private | Invalidate session & blacklist current token |
| `GET` | `/api/auth/get-me` | Private | Retrieve authenticated user profile |

### Interview & Career Engine (`/api/interview`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/interview/` | Private | Upload resume & JD to generate interview report |
| `GET` | `/api/interview/` | Private | Fetch all interview reports for active user |
| `GET` | `/api/interview/report/:id` | Private | Get full report details by interview ID |
| `POST` | `/api/interview/resume/pdf/:id` | Private | Compile and stream ATS-tailored resume PDF |
| `POST` | `/api/interview/practice/evaluate`| Private | AI evaluation of candidate practice response |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- A free [MongoDB Atlas](https://www.mongodb.com/) cluster connection string
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/Lalit05Hadkar/preppulse-ai.git
cd preppulse-ai
```

### 2. Configure Backend Environment
Navigate to `Backend/` and configure `.env`:
```bash
cd Backend
cp .env.example .env
```

Ensure your `Backend/.env` contains:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interview-ai?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

### 3. Install & Start Development Servers

**Backend:**
```bash
cd Backend
npm install
npm run dev
# Server running on http://localhost:3000
```

**Frontend:**
```bash
cd ../Frontend
npm install
npm run dev
# Client running on http://localhost:5173
```

---

## 💼 Resume Highlight Points (For Your Portfolio / CV)

You can feature this project on your resume with the following high-impact bullet points:

- **Full-Stack AI Career Readiness Engine (PrepPulse AI):** Architected and deployed an end-to-end interview preparation platform using Node.js, Express, React 19, Vite, and MongoDB Atlas.
- **LLM Structured Output Pipelines:** Integrated Google Gemini 3 Flash with Zod and JSON Schema constraints to reliably parse unstructured resumes (PDF), extract competencies, and generate multi-day technical roadmaps.
- **Interactive Practice & Automated Feedback:** Built an AI mock interview evaluator evaluating answers against role intention and depth, generating quantitative scores, strengths, and polished model answers.
- **Automated ATS Resume Compiler:** Implemented a headless Chromium (Puppeteer) PDF generation engine converting AI-tailored resume structures into ATS-compliant downloadable documents.
- **Secure Authentication Architecture:** Secured endpoints using JWT authentication with HTTP-only cookies, bcrypt credential hashing, and stateful token blacklisting in MongoDB.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ❤️ by **[Lalit Hadkar](https://github.com/Lalit05Hadkar)**.
