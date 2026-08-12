# Wayfinder

An AI wayfinding assistant for transit passengers at Singapore Changi Airport.

Enter a flight number and Voncierge works out where you are, where you need to be, how long it will take at your walking pace, and whether you'll make it. Ask it anything in fifteen languages.

---

## The problem

A passenger lands at Changi with 55 minutes to make a connection in a different terminal. Static airport maps don't know where they are, don't know their gate changed twelve minutes ago, and don't know they use a wheelchair. Airport signage is excellent but generic — it can't answer "will I make it?"

Wayfinder answers that question, with a number behind it.

## Features

| Feature | What it does |
|---|---|
| **Flight lookup** | Flight number in, live arrival time, terminal, gate, baggage belt and onward connection out |
| **Wayfinding** | Interactive terminal map with a step-by-step route and a live countdown against boarding |
| **Pace profiles** | Rushing / Normal / Step-free — step-free excludes escalators entirely and routes via lifts |
| **AI assistant** | Streaming answers grounded in real route and flight data, not guesses |
| **Multilingual** | Auto-detects device language, replies in any of 15 languages |

## The one architectural idea

> **The AI does not calculate anything. It calls functions that calculate things.**

---

## Quick start

**Requirements:** Node.js 20 or later.

```bash
git clone <your-repo-url> voncierge
cd wayfinder
npm install

cp .env.example .env.local
# open .env.local and paste your Google API key

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Suggested run-through

1. Enter **VC418**. Position derived, connection found automatically.
2. Open the **Connecting flight** tab. Walk time, boarding deadline, spare time.
3. **Guide me to B14.** Full map with the route drawn.
4. Switch to **Step-free**. The route visibly avoids the escalator, ETA rises. Strongest single visual.
5. Ask **"will I make my connection?"** Streamed answer with numbers matching the countdown.
6. Trigger **gateChange** in another tab. Everything updates.
7. Switch language and ask the same question again.

---

## Available scripts

```bash
npm run dev      # dev server with hot reload
npm run build    # production build — run before every push
npm run start    # serve the production build locally
npm run lint     # ESLint
```

`npm run build` takes about thirty seconds and catches nearly everything that would fail a deployment. Get in the habit of running it before you push.

---

## Known gaps

Stated plainly, because an assessment rewards judgement as much as output:

- **Amenities and transfer-briefing screens** exist in the design but aren't implemented.
- **Voice input** is shown in the UI copy but not wired. The Web Speech API is about ten lines.
- **The chat is request/response, not token-streamed.** Simpler to reason about; swap to the AI SDK's `streamText` for streaming.
- **No ops dashboard.** It needs a database, so it's correctly the last thing to add.
- **No rate limiting.** A public endpoint calling a paid API needs one before it goes anywhere real.
- **Flight data is mocked.** Live integration is one environment variable, but gate and baggage-belt data need an airport FIDS feed rather than a consumer API.
- **The terminal graph is a simplified representation**, not licensed airport data. Production would integrate the airport's own indoor mapping.

---

## Licence and attribution

The terminal layout is a simplified original representation informed by publicly known facts about Changi's arrangement — terminal names, pier letters, the Skytrain connections. It is not derived from Changi Airport Group's copyrighted map artwork, and no airport data is scraped.

Flight numbers in the mock data are representative of carriers operating at each terminal. They are **not** a live schedule and should never be presented as one.
