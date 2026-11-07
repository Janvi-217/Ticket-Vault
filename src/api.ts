import {
  addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase.ts';
import type { Ticket, TicketFormData, DatabaseStatus } from './types.ts';

function ticketsCollection() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to access your tickets.');
  return collection(db, 'users', user.uid, 'tickets');
}

function toTicket(id: string, data: Record<string, any>): Ticket {
  const createdAt = data.createdAt?.toDate
    ? data.createdAt.toDate().toISOString()
    : (data.createdAt || new Date().toISOString());
  return {
    id,
    eventName: String(data.eventName ?? ''),
    eventType: data.eventType ?? 'Other',
    date: String(data.date ?? ''),
    venue: String(data.venue ?? ''),
    ticketNumber: String(data.ticketNumber ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    notes: String(data.notes ?? ''),
    favorite: Boolean(data.favorite),
    createdAt,
  };
}

export async function fetchTickets(): Promise<Ticket[]> {
  const snapshot = await getDocs(ticketsCollection());
  return snapshot.docs
    .map((item) => toTicket(item.id, item.data()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const snapshot = await getDocs(ticketsCollection());
  const item = snapshot.docs.find((entry) => entry.id === id);
  if (!item) throw new Error('Ticket not found.');
  return toTicket(item.id, item.data());
}

export async function createTicket(ticketData: TicketFormData): Promise<Ticket> {
  const record = {
    ...ticketData,
    eventName: ticketData.eventName.trim(),
    venue: ticketData.venue.trim(),
    ticketNumber: ticketData.ticketNumber.trim(),
    imageUrl: ticketData.imageUrl?.trim() || '',
    notes: ticketData.notes?.trim() || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const result = await addDoc(ticketsCollection(), record);
  return { ...ticketData, ...record, id: result.id, createdAt: new Date().toISOString() } as Ticket;
}

export async function updateTicket(id: string, ticketData: Partial<TicketFormData>): Promise<Ticket> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to update tickets.');
  await updateDoc(doc(db, 'users', user.uid, 'tickets', id), {
    ...ticketData,
    updatedAt: serverTimestamp(),
  });
  return fetchTicketById(id);
}

export async function deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to delete tickets.');
  await deleteDoc(doc(db, 'users', user.uid, 'tickets', id));
  return { success: true, message: 'Ticket deleted successfully' };
}

export async function fetchDbStatus(): Promise<DatabaseStatus> {
  return {
    connected: true,
    type: 'firestore',
    message: 'Connected to Firebase Cloud Firestore from this browser. Your tickets are private to your signed-in account.',
    uriConfigured: true,
  };
}
