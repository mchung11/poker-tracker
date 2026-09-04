# Poker Tracker

A full-stack web app for tracking poker home games — log buy-ins and cash-outs for each player, then instantly calculate who owes who, using a minimal-transaction settlement algorithm.

**Live app:** https://poker-tracker-tau-swart.vercel.app

## What it does

Log in, create a session for a poker night, add players as they arrive, log each buy-in (including rebuys) and everyone's final cash-out at the end of the night. The app calculates the fewest possible payments needed to settle everyone up — instead of everyone owing everyone, the algorithm minimizes the number of transactions.

## Features

- **Authentication** — signup/login with hashed passwords (bcrypt) and JWT-based sessions; each user only sees their own sessions
- **Full CRUD** — create sessions, add players, log buy-ins and cash-outs
- **Custom settlement algorithm** — a greedy debt-minimization algorithm that pairs the largest debtor with the largest creditor each round, guaranteeing the minimum number of transactions needed to settle a group
- **Persistent storage** — SQLite database with relational tables (users, sessions, players, buy-ins, cash-outs)
- **Deployed full-stack** — React frontend on Vercel, Express/Node backend on Render

## Tech stack

- **Frontend:** React (Vite), plain CSS
- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3)
- **Auth:** bcrypt (password hashing), JSON Web Tokens

## Time spent

Roughly 8-10 hours across a few sessions, covering backend API design, the settlement algorithm, frontend UI, authentication, and deployment.

## Running locally

**Backend:**
```
cd server
npm install
node index.js
```
Runs on `http://localhost:3001`.

**Frontend:**
```
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`. Create a `.env` file in `client/` with:
```
VITE_API_URL=http://localhost:3001
```
## What I'd improve with more time

- Player stats / profiles (hourly win rate, session history) — currently parked
- Unit tests for the settlement algorithm
- Support for rebuys/cash-outs scoped more cleanly per session when reusing player names
- Mobile-responsive styling pass