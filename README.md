# TicketVault 🎟️

TicketVault is a personal event-ticket manager built with React, TypeScript, Vite, Firebase Authentication, and Cloud Firestore.

## Firebase setup
1. In Firebase Console, enable **Authentication → Email/Password**.
2. Create a **Cloud Firestore** database.
3. Register a Firebase Web App and copy its configuration.
4. Add the six `VITE_FIREBASE_*` variables from `.env.example` to your local `.env` file and to Netlify's environment variables.
5. Publish the Firestore security rules shown below.

## Firestore security rules
These rules make each signed-in user able to read and modify only their own tickets. Ticket documents live at `users/{userId}/tickets/{ticketId}`.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tickets/{ticketId} {
      function isOwner() {
        return request.auth != null && request.auth.uid == userId;
      }

      function validTicket() {
        return request.resource.data.keys().hasAll([
          'eventName', 'eventType', 'date', 'venue', 'ticketNumber',
          'imageUrl', 'notes', 'favorite', 'createdAt', 'updatedAt'
        ])
        && request.resource.data.keys().hasOnly([
          'eventName', 'eventType', 'date', 'venue', 'ticketNumber',
          'imageUrl', 'notes', 'favorite', 'createdAt', 'updatedAt'
        ])
        && request.resource.data.eventName is string
        && request.resource.data.eventName.size() > 0
        && request.resource.data.eventName.size() <= 200
        && request.resource.data.eventType in ['Movie', 'Concert', 'Sports', 'College', 'Other']
        && request.resource.data.date is string
        && request.resource.data.venue is string
        && request.resource.data.ticketNumber is string
        && request.resource.data.imageUrl is string
        && request.resource.data.notes is string
        && request.resource.data.favorite is bool
        && request.resource.data.createdAt is timestamp
        && request.resource.data.updatedAt is timestamp;
      }

      allow read, delete: if isOwner();
      allow create: if isOwner() && validTicket();
      allow update: if isOwner()
        && validTicket()
        && request.resource.data.createdAt == resource.data.createdAt;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Run locally
```bash
npm install
npm run dev
```

## Deploy on Netlify
- Repository: `Janvi-217/Ticket-Vault`
- Branch: `firebase-firestore-migration`
- Build command: `npm run build`
- Publish directory: `dist`
- Add all six `VITE_FIREBASE_*` variables in Site configuration → Environment variables, then trigger a fresh deploy.

The application is a static frontend. Firebase Authentication and Firestore are accessed directly from the browser using the Firebase Web SDK. No Express server, MongoDB, Firebase Admin service-account key, Render service, or backend URL is required.

**Security:** Never put Firebase Admin private keys or service-account JSON in frontend code, Netlify `VITE_*` variables, or GitHub.
