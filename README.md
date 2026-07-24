# Convrse Sales Kiosk

A real-time, cross-device Sales Kiosk Application built for the Convrse Spaces
full-stack technical assignment.

Two devices (the sales executive's tablet and the customer's screen) open the
same app and stay perfectly mirrored: whatever tab, image preview, video,
selected unit, or booking dialog is open on one device appears on the other,
live, with no refresh. Booking is atomic — if two devices try to book the same
unit at the same instant, exactly one succeeds.

## Live Demo

- **Live URL:** https://convrse-sales-kiosk.vercel.app/inventory


## Tech Stack

| Layer          | Choice                                                   |
| -------------- | --------------------------------------------------------- |
| Frontend       | Next.js 14 (App Router), TypeScript, Redux Toolkit, Tailwind CSS |
| Realtime       | Socket.io (client + server)                              |
| Backend        | Node.js, Express                                          |
| Database       | MongoDB (Mongoose)                                        |
| Deployment     | Frontend → Vercel, Backend → Render/Railway, DB → MongoDB Atlas |

Chosen because it's the stack I'm most productive in day-to-day, and because
Socket.io + a single conditional MongoDB write is the simplest correct tool
for both requirements this assignment actually cares about (mirroring and
atomic booking) — no need for a heavier realtime framework or DB-level
transactions for a single-document update.

## Architecture

```
convrse-sales-kiosk/
├── backend/                 Express API + Socket.io server
│   ├── server.js            Entry point: wires DB, routes, socket
│   └── src/
│       ├── config/db.js     Mongoose connection
│       ├── models/          Unit, GalleryItem, Video, InterestSignal
│       ├── routes/          /gallery /videos /inventory /book /interest
│       ├── socket/          Shared session state + mirroring broadcast
│       └── scripts/seed.js  Demo data loader
└── frontend/                Next.js app
    └── src/
        ├── app/              Routes: /gallery /videos /inventory
        ├── components/       SocketProvider, modals, nav, booking dialog...
        ├── store/            Redux Toolkit slices (session, gallery, videos, inventory, interest)
        ├── lib/              api client, socket client, dwell-signal hook
        └── types/            Shared TypeScript types
```

### How cross-device mirroring works

The server holds one small in-memory object — `sessionState.js` — representing
"what's currently on screen": active tab, open image preview, playing video,
selected tower/unit, and any open booking dialog. Every client action (open an
image, play a video, pick a unit) emits `session:update` with just the fields
that changed. The server merges that into the shared state and re-broadcasts
the *full* state to every connected socket as `session:state`. Every client —
including a device that just joined mid-session — simply renders whatever
`session:state` says. There's no per-feature sync logic; one mechanism drives
tab switching, previews, playback, selection, and dialogs alike.

This is deliberately a **single shared session** (one showroom, one pair of
screens), matching the assignment's scenario. Scaling to multiple concurrent
kiosks would mean keying this state by a `sessionId`/room instead of a single
global object — a small, contained change (see Future Improvements).

### How atomic booking works

`POST /book` performs one MongoDB call:

```js
Unit.findOneAndUpdate(
  { _id: unitId, status: "available" },  // <- the guard
  { $set: { status: "booked", bookedBy, bookedAt } },
  { new: true }
);
```

MongoDB guarantees a single-document write is atomic. Putting `status:
"available"` in the *filter* (not just checking it beforehand) turns the
database itself into the compare-and-swap: if two requests race for the same
unit, only the one that reaches Mongo first still matches `"available"`; the
second one's filter matches nothing, the update is a no-op, and the API
returns `409 { message: "This unit has already been booked." }`. No app-level
locks or explicit transactions needed for this shape of problem.

On success, the server broadcasts `inventory:updated` with the new unit
document, so every connected device's inventory board updates instantly. On
failure, the requesting device re-fetches inventory to correct its own view.

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local `mongod` or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGODB_URI to your connection string
npm install
npm run seed   # loads demo gallery images, videos, and a two-tower unit grid
npm run dev    # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# defaults already point at http://localhost:4000, adjust if needed
npm install
npm run dev    # starts on http://localhost:3000
```

Open `http://localhost:3000` in two separate browser windows (or one desktop
+ one phone on the same network, pointing the frontend env at your machine's
LAN IP) to see mirroring and live booking in action.

## Environment Variables

**backend/.env**

| Variable       | Description                          |
| -------------- | ------------------------------------- |
| `PORT`         | Port the API/socket server listens on |
| `MONGODB_URI`  | MongoDB connection string             |
| `CORS_ORIGIN`  | Allowed frontend origin               |

**frontend/.env.local**

| Variable                  | Description                    |
| -------------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Backend REST base URL           |
| `NEXT_PUBLIC_SOCKET_URL`   | Backend Socket.io URL (usually same host as API) |

## Deployment

1. **Database** — create a free MongoDB Atlas cluster, whitelist all IPs (or
   your host's), grab the connection string.
2. **Backend** — deploy `backend/` to Render or Railway as a Node web service.
   Set `MONGODB_URI` and `CORS_ORIGIN` (your Vercel frontend URL) as env vars.
   Run `npm run seed` once against the deployed DB (e.g. via a one-off Render
   shell/job) to load demo data.
3. **Frontend** — deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_API_URL` and
   `NEXT_PUBLIC_SOCKET_URL` to your backend's deployed URL.
4. Open the deployed URL on two devices/tabs to verify sync end-to-end, then
   fill in the Live Demo links above.

## Assumptions

- Single showroom session at a time (matches the brief: one exec, one
  customer screen). Multi-kiosk support is noted under Future Improvements
  rather than built, to keep the primary evaluation area (Inventory) solid.
- Gallery/video content is seeded demo data (Unsplash images, sample MP4s)
  rather than a real media upload pipeline, since the brief says these
  sections are for context, not the evaluation focus.
- "Real-time" is implemented via Socket.io WebSockets rather than polling.
- Phone number validation is a light format check (digits/+/-/spaces,
  7–15 chars), not carrier/region-specific validation.

## Known Limitations

- Session state (active tab, open dialogs, etc.) lives in server memory, not
  the database — a backend restart clears "what's currently on screen" (but
  never booking/inventory data, which is fully persisted). Acceptable for a
  single always-on kiosk process; would move to Redis for a multi-instance
  deployment.
- No authentication — matches the assignment's scope of a single trusted
  kiosk session, not a public-facing app.
- Offline conflict resolution (per the brief) is intentionally out of scope.

## Future Improvements

- Multi-kiosk support: key session state and socket rooms by a `sessionId` so
  multiple showrooms can run concurrently against the same backend.
- Offline queueing: cache gallery/video data and queue booking requests when
  the network drops, replaying them on reconnect (the brief flags this as
  bonus scope).
- Move ephemeral session state to Redis so it survives backend restarts/scaling.
- Search/filter on the inventory board once unit counts grow past a page.

## Beyond the Scope

**Buyer Interest Signals** — a small live feed (bottom-right corner) that logs
whenever a buyer's screen lingers on a specific image, video, or unit for more
than ~2.5 seconds. Every dwell event is persisted (`InterestSignal` model) and
broadcast live, so the executive gets a running read on "what's actually
catching their eye" during the walkthrough — not just what they clicked, but
what held their attention.

**Why:** picture the actual showroom scenario the assignment describes — a
sales exec standing next to a buyer. The exec can already see the buyer's
screen, but a lightweight signal like this gives them a nudge mid-pitch
("they've been on this 3BHK for a while — let's talk numbers") and, after the
visit, a CRM-ready trail of what a lead actually cared about, without the exec
having to take notes. It's a small addition, but it's the kind of detail that
makes the tool feel like it's actually helping the exec sell, not just
displaying data.

If I had more time, I'd extend this into a simple end-of-session summary
("this buyer spent the most time on Tower B, 3BHK units, and the amenities
video") that the exec could screenshot or export after the walkthrough.
