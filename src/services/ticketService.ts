import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy,
  query, serverTimestamp, updateDoc, type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { Ticket, TicketFormData } from '../types';

function currentUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in to manage your tickets.');
  return uid;
}

function ticketsCollection() {
  return collection(db, 'users', currentUserId(), 'tickets');
}

function mapTicket(id: string, data: DocumentData): Ticket {
  return {
    id,
    eventName: String(data.eventName ?? ''),
    eventType: data.eventType,
    date: String(data.date ?? ''),
    venue: String(data.venue ?? ''),
    ticketNumber: String(data.ticketNumber ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    notes: String(data.notes ?? ''),
    favorite: Boolean(data.favorite),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function fetchTickets(): Promise<Ticket[]> {
  const snapshot = await getDocs(query(ticketsCollection(), orderBy('date', 'asc')));
  return snapshot.docs.map((item) => mapTicket(item.id, item.data()));
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const ref = doc(db, 'users', currentUserId(), 'tickets', id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('Ticket not found.');
  return mapTicket(snapshot.id, snapshot.data());
}

export async function createTicket(data: TicketFormData): Promise<Ticket> {
  const payload = {
    eventName: data.eventName.trim(),
    eventType: data.eventType,
    date: data.date,
    venue: data.venue.trim(),
    ticketNumber: data.ticketNumber.trim(),
    imageUrl: data.imageUrl?.trim() ?? '',
    notes: data.notes?.trim() ?? '',
    favorite: Boolean(data.favorite),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const result = await addDoc(ticketsCollection(), payload);
  return { id: result.id, ...payload, createdAt: new Date().toISOString() } as Ticket;
}

export async function updateTicket(id: string, data: Partial<TicketFormData>): Promise<Ticket> {
  const ref = doc(db, 'users', currentUserId(), 'tickets', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) throw new Error('Ticket not found.');
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const key of ['eventName','eventType','date','venue','ticketNumber','imageUrl','notes','favorite'] as const) {
    if (data[key] !== undefined) updates[key] = typeof data[key] === 'string' ? data[key]!.trim() : data[key];
  }
  await updateDoc(ref, updates);
  return mapTicket(id, { ...existing.data(), ...updates, ...data });
}

export async function deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
  await deleteDoc(doc(db, 'users', currentUserId(), 'tickets', id));
  return { success: true, message: 'Ticket deleted successfully.' };
}

export async function fetchDbStatus() {
  return {
    connected: Boolean(auth.currentUser),
    type: 'firestore' as const,
    message: 'Your tickets are stored in your private Firestore account.',
    uriConfigured: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  };
}
