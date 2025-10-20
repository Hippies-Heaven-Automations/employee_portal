# 🌿 Employee Portal

A modern, full-stack employee management system built with **React + TypeScript + Vite + Supabase**, featuring secure authentication, scheduling, announcements, and automated testing.  
Deployed seamlessly via **Vercel** and managed with **pnpm** for optimized builds.

---

## 🚀 Features

- 🧩 **Role-Based Dashboards** — Separate interfaces for Admins and Employees  
- 📅 **Scheduling System** — Manage shifts, time logs, and leave requests  
- 📰 **Announcements Module** — Create, edit, and broadcast updates  
- ✅ **Supabase Authentication** — Secure login with RLS policies  
- 🧠 **Jest + React Testing Library** — Smoke-tested components for stability  
- ⚡ **Vite + pnpm** — Lightning-fast local builds and CI/CD pipelines  
- ☁️ **Vercel Deployment** — Zero-config hosting with environment variables  

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|:------|:------------|:--------|
| Frontend | **React + TypeScript + Vite** | SPA + modular component system |
| Styling | **Tailwind CSS** | Fast, responsive UI |
| Backend | **Supabase (PostgreSQL + Auth)** | Database, storage, and APIs |
| State & Routing | **React Router v7**, **Hooks** | Navigation and data flow |
| Testing | **Jest + Testing Library** | Automated sanity checks |
| Build Tool | **pnpm + Vite** | Efficient dependency management |
| Deployment | **Vercel** | CI/CD and environment handling |

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd employee_portal

### 2️⃣ Install Dependencies
pnpm install

### 3️⃣ Create Environment Variables
Create a .env file at the project root (never commit this):
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
For reference, there’s a safe .env.example file in the repo.

---

## 🧪 Run Tests
All smoke tests and component checks are powered by Jest:
pnpm run test

To lint your code before committing:
pnpm run lint

## 🧰 Build for Production
Generate your optimized production build:
pnpm run build
The build output will be in the /dist directory.

## ☁️ Deploy to Vercel
This project is fully configured for Vercel.
Your vercel.json should look like this:
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}

Set these environment variables in Vercel:
| Key                      | Value                              |
| :----------------------- | :--------------------------------- |
| `VITE_SUPABASE_URL`      | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key`                    |

Then deploy directly via Vercel Dashboard or CLI:
vercel --prod

## 🔍 Development Scripts
| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `pnpm run dev`         | Start local development server           |
| `pnpm run lint`        | Run ESLint checks                        |
| `pnpm run test`        | Execute Jest test suites                 |
| `pnpm run build`       | Build production-ready assets            |
| `pnpm run clean:build` | Remove generated `.js` files and `dist/` |

## 🧠 Folder Structure
employee_portal/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── pages/
│   ├── styles/
│   └── utils.ts
├── __mocks__/
│   ├── fileMock.js
│   └── supabaseClient.ts
├── __tests__/
│   └── smoke.test.tsx
├── public/
├── .gitignore
├── jest.config.ts
├── jest.setup.ts
├── tsconfig.json
├── vite.config.ts
└── package.json

## 🧹 CI/CD Pipeline
GitHub Actions automatically:
  Installs dependencies with pnpm
  Runs lint + Jest test suites
  Builds for production
Workflow file:
  .github/workflows/ci.yml

## 🔒 Environment Safety
This repo ignores all sensitive files:
  .env
  .env.local
  .env.*
Always set keys manually in Vercel or your CI environment.

## 🧑‍💻 Contributors
Project Lead: Chris Albea
Collaborators: Brenton, Shawn Downing
Organization: Hippies Heaven Gift Shop LLC

## 📜 License
MIT License © 2025 Hippies Heaven Gift Shop LLC
You are free to use, modify, and distribute this software with proper attribution.

