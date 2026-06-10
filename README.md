# GitIntel — AI-Powered Developer Intelligence Platform

GitIntel turns a GitHub username into an evidence-based, recruiter-friendly developer intelligence report. Instead of relying on self-reported resumes, GitIntel crawls public repositories, analyzes project complexity, evaluates consistency of contributions, and verifies technologies through config parsing and OpenAI analysis.

---

## Technical Stack

### Frontend
- **Framework:** React 18 (TypeScript)
- **Build System:** Vite
- **Routing:** React Router v6
- **Styling:** Plain CSS (Premium Dark Glassmorphism Design System)
- **Charts & Data Viz:** Recharts (Radar Chart, Area Timeline, Bar Distribution) & Custom Heatmap
- **Icons:** Lucide React

### Backend
- **Framework:** Node.js, Express.js (TypeScript)
- **Database:** MongoDB via Mongoose
- **AI Integration:** OpenAI API (GPT-4o-mini) with automatic local rule-based fallback
- **Security:** Helmet and CORS

---

## Folder Structure

```text
GitIntel/
├── backend/
│   ├── src/
│   │   ├── ai/            # OpenAI & local analyzer pipelines
│   │   ├── config/        # Environment and DB config
│   │   ├── controllers/   # Auth and analysis endpoints
│   │   ├── data/          # Configurable skill taxonomies
│   │   ├── middleware/    # Auth verification & error handlers
│   │   ├── models/        # MongoDB / Mongoose schemas
│   │   ├── routes/        # Router files
│   │   ├── services/      # Core engines (GitHub service, scoring, matching)
│   │   ├── utils/         # Memory caching & async helpers
│   │   └── server.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Recharts & dashboard components
│   │   ├── context/       # Auth state management
│   │   ├── pages/         # React application pages
│   │   ├── services/      # Fetch API wrappers
│   │   ├── styles/        # Global dark-glass css
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
```

---

## API Documentation

All routes are fully public and do not require authentication headers.

### Analysis & Report Routes
- **POST `/api/analyze`**
  - Payload: `{ "username": "github-username" }`
  - Returns: Detailed `ProfileBundle` (profile metadata, analysed repositories, scores, strengths, weaknesses, recommended roles).
- **GET `/api/profile/:username`**
  - Returns: The stored `ProfileBundle` for the candidate.
- **GET `/api/skills/:username`**
  - Returns: Distinct technology list detected for the candidate.
- **GET `/api/scores/:username`**
  - Returns: Specific numeric ratings (Backend, DevOps, Testing, Security, Consistency, Impact, Collaboration) with supporting evidence.
- **GET `/api/insights/:username`**
  - Returns: Career role matches, strengths lists, and weaknesses lists.
- **POST `/api/job-match`**
  - Payload: `{ "username": "github-username", "jobDescription": "Full Job Description text..." }`
  - Returns: Matching percentage, strengths, missing skills list, and hiring recommendations.
- **GET `/api/report/:username`**
  - Returns: Downloadable JSON bundle structure with public share link.

---

## Quick Start (Local Development)

### 1. Prerequisite
Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017/gitintel`.

### 2. Setup Env Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/gitintel
JWT_SECRET=development-secret-change-before-production
JWT_EXPIRES_IN=7d
GITHUB_TOKEN=your_github_personal_access_token # Recommended
OPENAI_API_KEY=your_openai_api_key             # Optional
```

### 3. Installation
Install all workspaces dependencies at the project root:
```bash
npm install
```

### 4. Running Servers
Start both backend api and frontend dev servers in watch mode:
```bash
# In one terminal:
npm --prefix backend run dev

# In another terminal:
npm --prefix frontend run dev
```

Visit the application at `http://localhost:5173`.

---

## Deployment Configuration
For deploying on a live Ubuntu VPS, see the [Manual Deployment Guide](file:///c:/Users/munak/OneDrive/Documents/GitIntel/docs/deployment.md).
