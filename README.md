# TicketVault 🎟️

A simple, fast, full-stack ticket management web application built with **React**, **Node.js**, **Express**, and **MongoDB / Mongoose**.

**Zero AI dependencies** — A clean, standard full-stack web application designed for fast setup, production-ready REST API communication, and easy deployment to GitHub.

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js REST API, Mongoose ORM
- **Database:** MongoDB (Local or MongoDB Atlas)

---

## 🛠️ Project Structure

```
TicketVault/
├── server/
│   ├── models/
│   │   └── Ticket.ts          # Mongoose Ticket schema & model
│   ├── routes/
│   │   └── ticketRoutes.ts    # Express REST API endpoints
│   └── db.ts                  # MongoDB connection & fallback handler
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Header & navigation bar
│   │   ├── StatCards.tsx      # Dashboard metrics (Total, Upcoming, Past, Favorites)
│   │   ├── FilterBar.tsx      # Search & category filters
│   │   ├── TicketCard.tsx     # Ticket stub card with actions
│   │   ├── TicketModal.tsx    # Add / Edit ticket form
│   │   ├── TicketDetailModal.tsx # Full ticket view with barcode
│   │   ├── DeleteConfirmModal.tsx# Delete confirmation dialog
│   │   ├── DbInfoModal.tsx    # MongoDB connection guide
│   │   └── Toast.tsx          # Toast notification alerts
│   ├── api.ts                 # Frontend REST API client
│   ├── utils.ts               # Date, time & badge helpers
│   ├── types.ts               # TypeScript types & interfaces
│   ├── App.tsx                # Main React application
│   ├── main.tsx               # React DOM root entry
│   └── index.css              # Global styles & Tailwind
├── .env.example               # Environment variables template
├── package.json               # Dependencies & build scripts
├── server.ts                  # Express server entry point
├── vite.config.ts             # Vite configuration
└── README.md                  # Project documentation
```

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MongoDB Connection

Create a `.env` file in the project root (you can copy `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:

```env
# Example MongoDB Atlas URI:
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/ticketvault?retryWrites=true&w=majority"

# Port (optional, defaults to 3000 or 5000)
PORT=3000
```

> **Note:** If you don't have MongoDB configured yet, the app will automatically run in local mode with sample tickets so you can test all UI and CRUD functionality immediately!

### 3. Run the Application

Start the unified development server (Express backend + Vite frontend):

```bash
npm run dev
```

Open your browser at: **`http://localhost:3000`**

### 4. Build for Production

```bash
# Build frontend and compile backend
npm run build

# Start production server
npm start
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | List all tickets (supports `?search=`, `?status=`, `?type=`) |
| `GET` | `/api/tickets/:id` | Get details for a specific ticket |
| `POST` | `/api/tickets` | Create a new ticket |
| `PUT` | `/api/tickets/:id` | Update an existing ticket |
| `DELETE` | `/api/tickets/:id` | Delete a ticket |
| `GET` | `/api/tickets/status` | Get MongoDB connection status |
| `GET` | `/api/health` | API health check |

---

## 💾 Ticket Data Model (Mongoose)

```typescript
{
  eventName: String,     // Required: e.g. "Coldplay World Tour"
  eventType: String,     // Required: 'Movie' | 'Concert' | 'Sports' | 'College' | 'Other'
  date: String,          // Required: ISO date-time string
  venue: String,         // Required: e.g. "Wembley Stadium"
  ticketNumber: String,  // Required: e.g. "CP-2026-SEC-A-42"
  imageUrl: String,      // Optional: Poster / ticket photo URL
  notes: String,         // Optional: Seat/gate instructions
  favorite: Boolean,     // Default: false
  createdAt: Date        // Default: Date.now
}
```

---

## 📂 MongoDB Setup Guide

To connect your MongoDB database:

1. **MongoDB Atlas (Cloud)**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
   - Under **Database Access**, create a database user and password.
   - Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for universal access).
   - Click **Connect** -> **Connect your application** and copy the URI string into `.env` as `MONGODB_URI`.

2. **Local MongoDB**:
   - Start MongoDB locally (`mongod` or `brew services start mongodb-community`).
   - Set `MONGODB_URI="mongodb://127.0.0.1:27017/ticketvault"` in `.env`.
