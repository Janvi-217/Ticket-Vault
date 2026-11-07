import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export interface DbStatus {
  connected: boolean;
  type: 'firestore' | 'unconfigured';
  message: string;
  uriConfigured: boolean;
}

let firestore: Firestore | null = null;
let message = 'Firebase Admin SDK is initializing...';

export async function connectDB(): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Hosts may store line breaks as the two characters backslash+n.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    message = 'Firebase credentials are missing. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.';
    console.warn(message);
    return;
  }

  try {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
    firestore = getFirestore(app);
    await firestore.collection('_health').doc('connection').set(
      { checkedAt: new Date().toISOString() },
      { merge: true },
    );
    message = 'Connected to Firebase Cloud Firestore successfully.';
    console.log(message);
  } catch (error: unknown) {
    firestore = null;
    message = `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(message);
  }
}

export function getFirestoreDb(): Firestore {
  if (!firestore) throw new Error(message);
  return firestore;
}

export function getDbStatus(): DbStatus {
  return {
    connected: Boolean(firestore),
    type: firestore ? 'firestore' : 'unconfigured',
    message,
    uriConfigured: Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
  };
}
