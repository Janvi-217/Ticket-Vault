import express, { Request, Response } from 'express';
import { getDbStatus, getFirestoreDb } from '../db.ts';
import { TicketRecord, EventType } from '../models/Ticket.ts';

const router = express.Router();
const collection = 'tickets';

function fail(res: Response, error: unknown) {
  return res.status(503).json({
    error: 'Firestore is unavailable',
    message: error instanceof Error ? error.message : 'Unknown database error',
    hint: 'Check Firebase service-account environment variables and Firestore permissions.',
  });
}
function toTicket(id: string, data: FirebaseFirestore.DocumentData): TicketRecord {
  return {
    id, eventName: String(data.eventName ?? ''), eventType: (data.eventType ?? 'Other') as EventType,
    date: String(data.date ?? ''), venue: String(data.venue ?? ''), ticketNumber: String(data.ticketNumber ?? ''),
    imageUrl: String(data.imageUrl ?? ''), notes: String(data.notes ?? ''), favorite: Boolean(data.favorite),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}
router.get('/status', async (_req, res) => {
  const status = getDbStatus();
  if (!status.connected) return res.json({ ...status, ticketCount: 0 });
  try {
    const snap = await getFirestoreDb().collection(collection).get();
    return res.json({ ...status, ticketCount: snap.size });
  } catch (e) { return fail(res, e); }
});
router.get('/', async (req, res) => {
  try {
    const { search, status, type } = req.query;
    const snap = await getFirestoreDb().collection(collection).get();
    const term = typeof search === 'string' ? search.trim().toLowerCase() : '';
    let tickets = snap.docs.map(d => toTicket(d.id, d.data()));
    if (type && type !== 'All') tickets = tickets.filter(t => t.eventType === type);
    if (term) tickets = tickets.filter(t => [t.eventName, t.venue, t.ticketNumber].some(v => v.toLowerCase().includes(term)));
    const now = Date.now();
    if (status === 'favorites') tickets = tickets.filter(t => t.favorite);
    if (status === 'upcoming') tickets = tickets.filter(t => new Date(t.date).getTime() >= now);
    if (status === 'past') tickets = tickets.filter(t => new Date(t.date).getTime() < now);
    tickets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return res.json(tickets);
  } catch (e) { return fail(res, e); }
});
router.get('/:id', async (req, res) => {
  try {
    const doc = await getFirestoreDb().collection(collection).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Ticket not found' });
    return res.json(toTicket(doc.id, doc.data()!));
  } catch (e) { return fail(res, e); }
});
router.post('/', async (req, res) => {
  try {
    const { eventName, eventType, date, venue, ticketNumber, imageUrl, notes, favorite } = req.body;
    if (!eventName || !eventType || !date || !venue || !ticketNumber) {
      return res.status(400).json({ error: 'Missing required fields', required: ['eventName', 'eventType', 'date', 'venue', 'ticketNumber'] });
    }
    const record = {
      eventName: String(eventName).trim(), eventType: eventType as EventType, date: String(date),
      venue: String(venue).trim(), ticketNumber: String(ticketNumber).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : '', notes: notes ? String(notes).trim() : '',
      favorite: Boolean(favorite), createdAt: new Date().toISOString(),
    };
    const doc = await getFirestoreDb().collection(collection).add(record);
    return res.status(201).json({ id: doc.id, ...record });
  } catch (e) { return fail(res, e); }
});
router.put('/:id', async (req, res) => {
  try {
    const ref = getFirestoreDb().collection(collection).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Ticket not found' });
    const allowed = ['eventName', 'eventType', 'date', 'venue', 'ticketNumber', 'imageUrl', 'notes', 'favorite'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    for (const key of ['eventName', 'venue', 'ticketNumber', 'imageUrl', 'notes']) {
      if (typeof updates[key] === 'string') updates[key] = (updates[key] as string).trim();
    }
    await ref.update(updates);
    const updated = await ref.get();
    return res.json(toTicket(updated.id, updated.data()!));
  } catch (e) { return fail(res, e); }
});
router.delete('/:id', async (req, res) => {
  try {
    const ref = getFirestoreDb().collection(collection).doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return res.status(404).json({ error: 'Ticket not found' });
    await ref.delete();
    return res.json({ success: true, message: 'Ticket deleted successfully', id: req.params.id });
  } catch (e) { return fail(res, e); }
});
export default router;
