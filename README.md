# TicketVault 🎟️

A full-stack ticket management application built with React, Vite, Node.js, Express, and Firebase Cloud Firestore.

## Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express REST API
- Database: Firebase Cloud Firestore (Firebase Admin SDK)

## Firebase setup
1. Open the Firebase project `ticket-vault-a0426`.
2. Create a Cloud Firestore database in the Firebase console.
3. Open Project settings → Service accounts → Firebase Admin SDK.
4. Generate a new private key and download the JSON file.
5. Configure the backend environment variables using the JSON fields:
   - `FIREBASE_PROJECT_ID` = `project_id`
   - `FIREBASE_CLIENT_EMAIL` = `client_email`
   - `FIREBASE_PRIVATE_KEY` = `private_key`
6. Never commit the downloaded JSON file, a real private key, or a production `.env` file.

A Gemini API key or Firebase Web API key is **not** a substitute for Firebase Admin service-account credentials.

## Environment variables

Backend host:
| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service-account client email |
| `FIREBASE_PRIVATE_KEY` | Complete service-account private key |
| `PORT` | Port provided by the backend host |
| `CLIENT_URL` | Netlify site origin, used for CORS |

Frontend (Netlify):
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend public origin, e.g. `https://your-api.example.com`; do not add `/api` |

For `FIREBASE_PRIVATE_KEY`, store the complete key including BEGIN/END lines. If your host requires escaped newlines, use `\\n`; the backend converts them to real line breaks.

## Local development
1. Copy `.env.example` to `.env` and fill in the Firebase Admin credentials.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Deployment

### Backend (Render or another Node.js host)
- Root directory: repository root
- Build command: `npm install && npm run build:server`
- Start command: `npm start`
- Add the Firebase Admin variables listed above.
- Set `CLIENT_URL` to your Netlify site URL.

### Frontend (Netlify)
- Repository: `Janvi-217/Ticket-Vault`
- Branch: `firebase-firestore-migration`
- Build command: `npm run build`
- Publish directory: `dist`
- Add `VITE_API_BASE_URL` with the backend public origin.
- Redeploy after changing environment variables.

The frontend and backend are separate deployments. Netlify hosts the Vite frontend; the Node.js host runs the Express API and connects to Firestore.

## REST API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets` | List tickets with search and filters |
| GET | `/api/tickets/:id` | Get one ticket |
| POST | `/api/tickets` | Create a ticket |
| PUT | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |
| GET | `/api/tickets/status` | Check Firestore connection |
| GET | `/api/health` | API health check |

Ticket documents are stored in the Firestore `tickets` collection.
