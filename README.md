# TicketVault 🎟️

A full-stack ticket management application built with React, Node.js, Express, and Firebase Cloud Firestore.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, Lucide Icons
- Backend: Node.js and Express REST API
- Database: Firebase Cloud Firestore
- Server database access: Firebase Admin SDK

## Firebase Setup
1. In Firebase Console, select the Ticket-Vault project and ensure Cloud Firestore is created.
2. Open Project settings → Service accounts → Firebase Admin SDK.
3. Generate a new private key and download the JSON file. Keep it private.
4. Configure these environment variables on your backend host:

| Variable | Value |
|---|---|
| FIREBASE_PROJECT_ID | Project ID (ticket-vault-a0426) |
| FIREBASE_CLIENT_EMAIL | client_email from service-account JSON |
| FIREBASE_PRIVATE_KEY | private_key from service-account JSON |
| PORT | Port supplied by hosting provider |

For FIREBASE_PRIVATE_KEY, paste the complete key including BEGIN/END lines. The server converts escaped \\n sequences to newlines.

**Security:** Never commit the service-account JSON, private key, or production .env file to GitHub. Store credentials only in local environment variables or your backend host's secret settings.

## Local Development
```bash
npm install
npm run dev
```
Create a local .env from .env.example and fill in the Firebase service-account values. Open http://localhost:3000.

## Production
```bash
npm run build
npm start
```
The Express backend needs a Node.js host that runs a persistent server process. Netlify can host the frontend, but it does not run this Express server as a traditional always-on Node process without adapting it to Netlify Functions.

## REST API
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tickets | List tickets; supports search, status and type filters |
| GET | /api/tickets/:id | Get one ticket |
| POST | /api/tickets | Create a ticket |
| PUT | /api/tickets/:id | Update a ticket |
| DELETE | /api/tickets/:id | Delete a ticket |
| GET | /api/tickets/status | Check Firestore connection |
| GET | /api/health | API health check |

Ticket documents are stored in the Firestore tickets collection.
