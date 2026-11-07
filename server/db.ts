import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export interface DbStatus {
  connected: boolean;
  type: 'firestore' | 'unconfigured';
  message: string;
  uriConfigured: boolean;
}

let firestore: Firestore | null = null;
let connectionMessage = 'Firebase Admin SDK is initializing...';

export async function connectDB(): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    connectionMessage = 'Firebase service account is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.';
    console.warn(connectionMessage);
    return;
  }

  try {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
          projectId,
        });

    firestore = getFirestore(app);
    await firestore.collection('_health').doc('connection').set(
      { checkedAt: new Date().toISOString() },
      { merge: true }
    );
    connectionMessage = 'Connected to Firebase Cloud Firestore successfully.';
    console.log(connectionMessage);
  } catch (error: any) {
    firestore = null;
    connectionMessage = `Firebase connection failed: ${error.message}`;
    console.error(connectionMessage);
  }
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    throw new Error(connectionMessage || 'Firestore is not configured.');
  }
  return firestore;
}

export function getDbStatus(): DbStatus {
  return {
    connected: Boolean(firestore),
    type: firestore ? 'firestore' : 'unconfigured',
    message: connectionMessage,
    uriConfigured: Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
  };
}
