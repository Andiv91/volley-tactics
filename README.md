# 🏐 VoleiTactics - Volleyball Tactical & Theoretical Assessment Platform

A comprehensive athletic evaluation and training assessment system for university volleyball programs and tactical coaches. Designed with an energetic sports red visual identity matching the Volleyball Canada / University athletics aesthetic.

![Volleyball Tactics](https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Features

1. **Dual Role Access Control**:
   - **Administrators / Coaches**: Create tests, author multimedia questions (YouTube, MP4, images), view all athlete results, inspect question-by-question choices, and analyze topic mastery with circular pie/donut charts.
   - **Athletes / Students**: Take interactive theoretical & video decision tests, receive customized pedagogical feedback for every option chosen, review results, and track skill improvement.
2. **Pedagogical Option-Specific Feedback**:
   - Every single answer choice stores customized instructional feedback. If an athlete selects an aggressive or suboptimal response, the system immediately provides a constructive explanation (e.g., explaining why aggressive conduct is penalized, or the tactical consequences of missing a block seam in K2).
3. **Multimedia Questions**:
   - Support for YouTube video embeds, MP4 video streams, high-resolution court diagrams, and rich scenario descriptions.
4. **Circular Pie Analytics by Topic**:
   - Categorizes athlete knowledge into competencies:
     - *Táctica Ofensiva (K1: Recepción y Ataque)*
     - *Táctica Defensiva (K2: Bloqueo, Defensa y Contraataque)*
     - *Atención y Percepción Visual*
     - *Toma de Decisiones en Cancha*
     - *Reglamento y Ética Deportiva*
5. **Modern Athletic UI**:
   - Deep crimson/ruby red gradient theme matching the reference design.
   - Layered organic wave curves, dot grid patterns, pill-shaped inputs, and custom **Volleyball Charging/Bounce animations**.
6. **Authentication**:
   - Google Sign-In (OAuth 2.0) with `@react-oauth/google` and backend verification.
   - Standard email/password registration and login with JWT.
   - 1-Click Demo switchers for instant evaluation.

---

## 🗄️ Monorepo Architecture

```
volleyball-tactics-platform/
├── client/           # Vite + React + Tailwind CSS + Lucide Icons + Recharts
├── server/           # Express.js + Prisma ORM + JWT + PostgreSQL (Neon ready)
├── package.json      # Monorepo root scripts
├── render.yaml       # Blueprint for 1-click Render deployment
└── .env.example      # Environment variables template
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(If you do not have a Neon PostgreSQL database ready yet, the backend automatically supports local SQLite / fallback mode so you can run and test instantly!)*

### 3. Initialize Database & Seed
```bash
cd server
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Servers
From the root directory:
```bash
npm run dev
```
- Frontend will be available at: `http://localhost:5173`
- Backend API will be available at: `http://localhost:5000`

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin / Head Coach** | `admin@volleyball.edu` | `Admin123!` |
| **Athlete / User** | `athlete@volleyball.edu` | `User123!` |

*(You can also use the 1-click demo buttons on the login screen or sign in with Google!)*

---

## 🌐 Deploying to Neon & Render

### Step 1: Create a Database on Neon
1. Go to [Neon.tech](https://neon.tech) and create a free PostgreSQL project (e.g., `volleyball-tactics-db`).
2. In your Neon dashboard, copy the **Connection String** (`postgresql://...`). Make sure it includes `?sslmode=require`.

### Step 2: Push Monorepo to GitHub
```bash
git init
git add .
git commit -m "Initial commit of Volleyball Tactics Assessment Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/volleyball-tactics-platform.git
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service** (or **Blueprint** using `render.yaml`).
3. Connect your GitHub repository.
4. Set the following settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `JWT_SECRET`: *(A secure random string, e.g. `n8b6v5c4x3z2a1`)*
   - `NODE_ENV`: `production`
   - `GOOGLE_CLIENT_ID`: *(Your Google OAuth client ID, optional)*
6. Click **Create Web Service**. Render will automatically build the React frontend and deploy the Express API.
