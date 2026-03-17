

# Tee2Green - The Ultimate Golf Scoring & Betting App


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

____________________________________________________________________________________________________________________________________
____________________________________________________________________________________________________________________________________


## 📌 Overview

Tee2Green is a **golf-focused live scoring and betting application** designed to enhance competitive rounds by emphasizing:

* Live standings
* Game formats (match play, skins, etc.)
* Real-time scoring input
* Betting-style interaction and feedback

Unlike traditional golf apps, Tee2Green is **not focused on game improvement or deep analytics**. Instead, it prioritizes:

> 🧠 *“Who’s winning right now, and what do I need to win?”*

---

## 🎯 Core Product Vision

Tee2Green sits at the intersection of:

* Golf scoring apps (e.g. 18Birdies)
* Sportsbook UX (e.g. DraftKings)

### Key Differentiators:

* Fast, intuitive score input
* Game-aware scoring (match play, skins, etc.)
* Betting-oriented UI/UX
* Minimal stat tracking, maximum competitive context

---

## 🧱 Architecture Overview

The app is built around a **central scoring engine** with a clean separation between:

### 1. Logic Layer (Core Engine)

Handles:

* Score calculations
* Game rules
* Determining winners
* Derived stats (totals, +/-)

### 2. UI Layer (React + Tailwind)

Handles:

* Rendering scorecards
* User input
* Displaying game state

---

## 🧠 Core Data Model

### Scores

```ts
type Scores = {
  [playerId: string]: number[] // index = hole (0–17)
}
```

---

### Game Context

```ts
type GameContext = {
  game: Game
  players: Player[]
  scores: Scores
  handicaps?: Record<string, number>
}
```

---

## ⚙️ Core Engine (MVP)

### Main Entry Point

```ts
calculateGameResult(context: GameContext)
```

### Returns:

```ts
{
  playerTotals: Record<string, number>,
  relativeToPar?: Record<string, number>,
  winner: string | string[],
}
```

---

### Game Resolver Pattern

```ts
const gameResolvers = {
  stroke: resolveStrokePlay,
  match: resolveMatchPlay,
  points: resolvePointsGame,
}
```

---

## 🖥️ UI Structure

### Scorecard View (Main Screen)

**Purpose:** Overview of round + standings

Features:

* Front 9 / Back 9 / Full 18 toggle
* Horizontal scroll for holes
* Player rows with totals
* Leader awareness (subtle)

---

### Hole View (Live Scoring)

**Purpose:** Fast score input + live game context

Features:

* Current hole info (Par, Yardage)
* Large tap-based score input
* Player cards
* Betting-style interaction

---

## 🧩 Component Structure

```txt
ScorecardContainer
  ├── ScorecardHeader
  ├── ScorecardGrid
  │     ├── PlayerRow
  │     │     ├── HoleCell
  │     │     └── TotalCell

HoleView
  ├── HoleHeader
  ├── PlayerCard
  │     └── ScoreButton
```

---

## 🎨 Design Philosophy

* Mobile-first (390px width baseline)
* Dark mode default
* High contrast, bold numbers
* Minimal UI clutter
* Fast, tappable interactions

### Influences:

* 18Birdies (structure)
* Sportsbook apps (interaction + feel)

---

## 🛠️ Tech Stack

* React (frontend)
* Tailwind CSS (styling)
* TypeScript (types + safety)

---

## 🚀 MVP Scope

### ✅ Included

* Stroke play scoring
* Scorecard view (Front 9 / Back 9 / 18)
* Hole-by-hole input screen
* Player totals
* Basic leaderboard

---

### ❌ Excluded (for now)

* Net scoring
* Team formats
* Match play logic
* Betting mechanics
* Historical stats
* Course maps / GPS

---

## 🔄 Future Iterations

### Phase 2: Game Logic Expansion

* Match play
* Skins
* Nassau
* Team formats

---

### Phase 3: Betting Layer

* Presses
* Side bets
* Hole values
* Winnings tracking

---

### Phase 4: UX Enhancements

* Animations (score selection feedback)
* Leader highlighting
* Auto-scroll to current hole

---

### Phase 5: Social + History

* Round history
* Group tracking
* Sharing results

---

## ⚡ Development Principles

### 1. Single Source of Truth

All scoring logic flows through:

```ts
calculateGameResult()
```

---

### 2. Dumb UI Components

UI components should:

* Receive data via props
* Not calculate game logic

---

### 3. Reusable Components

Every UI element should be:

* Modular
* Reusable
* Named consistently

---

### 4. Build Logic Before UI Polish

Focus on:

* Correct scoring
* Clean architecture

Before:

* Styling
* Animations

---

## 🧠 Guiding Philosophy

> “This is not a golf tracker. This is a live competitive engine.”

---

## 🔥 Next Steps

* Finalize scorecard UI in Figma
* Implement `calculateGameResult`
* Wire UI to centralized scoring logic
* Add match play support

---

## 👤 Author

Built by Charlie Conner

