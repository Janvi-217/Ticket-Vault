import mongoose from 'mongoose';

export interface DbStatus {
  connected: boolean;
  type: 'mongodb' | 'memory';
  message: string;
  uriConfigured: boolean;
}

let isMongoConnected = false;
let connectionMessage = 'Initializing database...';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.trim() === '') {
    isMongoConnected = false;
    connectionMessage = 'MONGODB_URI not configured. Using in-memory fallback store.';
    console.log('ℹ️  MONGODB_URI not set. Running with built-in memory storage for quick evaluation.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    connectionMessage = 'Connected to MongoDB successfully.';
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error: any) {
    isMongoConnected = false;
    connectionMessage = `Could not connect to MongoDB (${error.message}). Using local fallback store.`;
    console.warn('⚠️  MongoDB connection failed, falling back to local store:', error.message);
  }
}

export function getDbStatus(): DbStatus {
  return {
    connected: isMongoConnected && mongoose.connection.readyState === 1,
    type: isMongoConnected && mongoose.connection.readyState === 1 ? 'mongodb' : 'memory',
    message: connectionMessage,
    uriConfigured: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')),
  };
}
