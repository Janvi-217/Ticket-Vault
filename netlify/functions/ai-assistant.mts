import type { Context } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const prompts: Record<string, string> = {
  classify: 'Read the event-ticket text and extract the likely event name, event type (Movie, Concert, Sports, College, or Other), event date/time, venue, ticket number, and useful notes. Return a clearly labeled list. Use "Not provided" for missing details. Do not invent details.',
  summarize: 'Summarize these event ticket details in 3-5 concise bullets. Highlight date, time, venue, ticket reference, and entry instructions when present. Do not invent missing details.',
  checklist: 'Create a practical event-day checklist based only on the details provided. Include ticket readiness, arrival/entry, documents, transport and useful reminders where relevant. Mark uncertain suggestions as suggestions.',
  assistant: 'You are TicketVault AI, an assistant for organizing event tickets and preparing for events. Answer clearly using only the information provided. Do not claim to book, verify, or modify any real-world reservation or ticket.',
};

function getFirebaseAuth() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getAuth();
}

export default async (request: Request, _context: Context) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: 'GEMINI_API_KEY is not configured in Netlify.' }, { status: 503 });

  try {
    const authorization = request.headers.get('authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return Response.json({ error: 'Please sign in to use the AI assistant.' }, { status: 401 });
    try {
      await getFirebaseAuth().verifyIdToken(authorization.slice(7));
    } catch {
      return Response.json({ error: 'Your session is invalid or expired. Please sign in again.' }, { status: 401 });
    }

    const body = await request.json() as { task?: string; text?: string };
    const task = body.task ?? '';
    const text = body.text?.trim() ?? '';
    if (!Object.hasOwn(prompts, task)) return Response.json({ error: 'Invalid AI task.' }, { status: 400 });
    if (!text || text.length > 12000) return Response.json({ error: 'Text must contain 1–12,000 characters.' }, { status: 400 });

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${prompts[task]}\n\nTicket or user content:\n${text}`,
    });
    return Response.json({ result: response.text ?? 'No response was generated.' });
  } catch (error) {
    console.error('TicketVault AI request failed:', error);
    return Response.json({ error: 'The AI service could not complete this request. Please try again.' }, { status: 500 });
  }
};
