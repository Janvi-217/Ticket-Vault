# TicketVault — Full-Stack Development + Generative AI

TicketVault is a personal event-ticket management application. It demonstrates full-stack development, account authentication, secure cloud NoSQL storage, serverless backend APIs, and practical Generative AI.

## Features

- Email/password registration, login, logout and password reset.
- Private ticket vault: each account reads and writes only its own `users/{uid}/tickets` documents.
- Create, view, edit, delete, search, filter and favorite event tickets.
- Dashboard statistics for total, upcoming, past and favorite tickets.
- Gemini AI: extract ticket details, summarize ticket information, create event-day checklists and answer ticket-related questions.
- AI endpoint verifies Firebase ID tokens. Gemini API credentials and Firebase Admin credentials remain server-side.

## Technology stack

- React 19, TypeScript, Vite, Tailwind CSS
- Firebase Authentication
- Cloud Firestore + Firestore Security Rules
- Google Gemini API via `@google/genai`
- Netlify Functions and Netlify hosting

## 1. Firebase setup

1. Open https://console.firebase.google.com and create a Firebase project.
2. In **Project settings → General → Your apps**, register a Web App and copy its configuration.
3. Open **Build → Authentication → Sign-in method** and enable **Email/Password**.
4. Open **Build → Firestore Database** and create a database.
5. In the Firestore **Rules** tab, publish the contents of `firestore.rules` from this repository.
6. In **Authentication → Settings → Authorized domains**, add your Netlify domain after deployment.

The Firestore data model is:

```
users/{firebaseAuthUid}/tickets/{ticketId}
  eventName, eventType, date, venue, ticketNumber,
  imageUrl, notes, favorite, createdAt, updatedAt
```

Security rules check the authenticated UID against the UID in the document path. Never replace these rules with public read/write rules.

## 2. Run the frontend locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill the six `VITE_FIREBASE_*` settings in `.env.local` with your Firebase Web App configuration. The Vite development server prints the local URL.

The direct frontend dev server does not emulate Netlify Functions. To test the complete app including the AI endpoint locally, install/use the Netlify CLI and run:

```bash
npx netlify dev
```

Add `GEMINI_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` to the local environment used by Netlify CLI. Never commit real credentials.

## 3. Configure GenAI credentials

1. Create a Gemini API key at https://aistudio.google.com/app/apikey.
2. In Firebase Console → Project settings → Service accounts, generate a private key for a service account. Treat the downloaded JSON as a password: do not commit it or share it.
3. The Netlify Function verifies the caller's Firebase ID token using Firebase Admin before contacting Gemini.
4. Set the following **server-side Netlify environment variables**:
   - `GEMINI_API_KEY`: your Gemini API key.
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: the complete service-account JSON on one line (or valid JSON value supported by the Netlify environment editor).

Gemini model selection is in `netlify/functions/ai-assistant.mts`. The key is read at function runtime and is not prefixed with `VITE_`.

## 4. Deploy to Netlify

1. Push this branch to GitHub and import `Janvi-217/Ticket-Vault` in Netlify.
2. Select branch `firebase-genai-migration` while reviewing/testing this migration, or merge its pull request first and deploy `main`.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, functions directory `netlify/functions`.
4. In **Site configuration → Environment variables**, add these build/runtime values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
5. Trigger a new deploy after adding environment variables.
6. Add the deployed `*.netlify.app` domain to Firebase Authentication's authorized domains.

## 5. Verification checklist

- Register a new account and confirm sign-in works.
- Add, edit, favorite and delete a ticket; refresh and confirm persistence.
- Sign out and sign in again; confirm the tickets remain.
- Register a second test account; confirm it cannot see the first account's tickets.
- Try the AI feature while signed in and check the Netlify Function logs if it fails.
- Test a direct unauthenticated AI request; it should return HTTP 401.

## Security notes

- Firebase Web config is intended for the browser; Firestore Rules enforce database permissions.
- Do not commit `.env.local`, Gemini API keys, Firebase service-account JSON, or any other credentials.
- Firebase Admin credentials are used only in the serverless function to verify ID tokens.
- AI results are suggestions; review extracted information and event checklists before relying on them.

## Academic project scope

This project demonstrates React UI development, authentication flows, cloud database design, user-level authorization, Firestore CRUD, serverless API design, secret management, third-party API integration and Generative AI use cases.
