# GitIntel — AI-Powered Developer Intelligence Platform

GitIntel turns a GitHub username into an evidence-based, recruiter-friendly developer intelligence report. It operates entirely as a powerful **Frontend-Only** application, parsing GitHub profiles locally in your browser. Instead of relying on self-reported resumes, GitIntel analyzes public repositories, evaluates project complexity, and verifies technologies through deep dependency parsing.

---

## How It Works (Architecture)

GitIntel is a completely serverless, client-side application built with React and Vite. It does not require a custom backend or database. Here is how the analysis engine operates:

1. **Direct GitHub API Integration**: The application communicates directly with the public GitHub REST API from the browser. It fetches candidate profile metadata and their most recently pushed repositories.
2. **Deep Skill Extraction**: Beyond standard GitHub language detection, GitIntel fetches the `package.json` for the candidate's top repositories. It parses `dependencies` and `devDependencies` to identify specific frameworks and tools (e.g., React, Express, Next.js, Vue, Jest) and intelligently infers technologies like TSX and JSX.
3. **Local Analysis Engine**: A robust, rule-based engine (`analyzerService`) aggregates this data to determine the candidate's true "strengths" based on technology frequency across all repositories. It calculates scores for "Experience", "Code Quality", and "Consistency" using heuristics like account age, repository size, documentation presence, stars, and forks.
4. **Local Storage Talent Pool**: Analyzed candidate reports are cached in your browser's `localStorage`. This powers features like the **Skill Benchmark** and **Job Match** without requiring repeated, expensive API calls.

---

## Technical Stack

### Frontend
- **Framework:** React 18 (TypeScript)
- **Build System:** Vite
- **Routing:** React Router v6
- **Styling:** Plain CSS (Premium Dark Glassmorphism Design System)
- **Charts & Data Viz:** Recharts (Radar Chart, Area Timeline, Bar Distribution)
- **Icons:** Lucide React
- **Data Persistence:** Browser Local Storage (`localStorage`)

---

## Folder Structure

```text
GitIntel/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # React application pages (Report, Benchmark, etc.)
│   │   ├── services/      # Core logic (github.ts, analyzer.ts, api.ts, storage.ts)
│   │   ├── styles/        # Global CSS and tokens
│   │   ├── App.tsx        # Application entry and routing
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Quick Start (Local Development)

### 1. Setup GitHub Token
To prevent GitHub API rate-limiting during development and analysis, it is highly recommended to generate a Personal Access Token (classic) on GitHub. You can enter this token securely within the GitIntel "Settings" page in the UI.

### 2. Installation
Install the frontend dependencies:
```bash
cd frontend
npm install
```

### 3. Running the Server
Start the Vite development server:
```bash
npm run dev
```

Visit the application at `http://localhost:5173`.
