import express, { Request, Response } from 'express';
import { TicketModel } from '../models/Ticket.ts';
import { getDbStatus } from '../db.ts';

const router = express.Router();

// Fallback in-memory store when MongoDB is not connected
interface MemoryTicket {
  id: string;
  eventName: string;
  eventType: 'Movie' | 'Concert' | 'Sports' | 'College' | 'Other';
  date: string;
  venue: string;
  ticketNumber: string;
  imageUrl?: string;
  notes?: string;
  favorite: boolean;
  createdAt: string;
}

const initialSampleTickets: MemoryTicket[] = [
  {
    id: 'tkt_sample_1',
    eventName: 'Coldplay: Music of the Spheres World Tour',
    eventType: 'Concert',
    date: '2026-09-24T19:30',
    venue: 'Wembley Stadium, London',
    ticketNumber: 'CP-2026-SEC-A-42',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
    notes: 'Floor standing ticket. Gate opens at 5:00 PM. Bring digital ID.',
    favorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tkt_sample_2',
    eventName: 'Interstellar - 70mm IMAX Special Screening',
    eventType: 'Movie',
    date: '2026-08-28T20:15',
    venue: 'BFI IMAX, Waterloo',
    ticketNumber: 'IMAX-ROW-H-14',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    notes: 'Center prime view row H. Concession combo with large popcorn.',
    favorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tkt_sample_3',
    eventName: 'UEFA Champions League Quarter-Final',
    eventType: 'Sports',
    date: '2026-10-14T20:00',
    venue: 'Santiago Bernabéu, Madrid',
    ticketNumber: 'UCL-CAT1-GATE7-89',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    notes: 'Category 1 West Stand. Entry requires fan pass validation.',
    favorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tkt_sample_4',
    eventName: 'Stanford AI & Robotics Annual Symposium',
    eventType: 'College',
    date: '2026-11-05T09:00',
    venue: 'Arrillaga Alumni Center, Stanford',
    ticketNumber: 'STAN-CONF-2026-041',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    notes: 'Student delegate pass. Includes breakfast and keynote luncheon.',
    favorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tkt_sample_5',
    eventName: 'Cirque du Soleil: Echo',
    eventType: 'Other',
    date: '2026-06-15T18:00',
    venue: 'Under the Big Top, Santa Monica',
    ticketNumber: 'CDS-VIP-BOX-12',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    notes: 'VIP Lounge access and meet & greet program included.',
    favorite: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let memoryTickets: MemoryTicket[] = [...initialSampleTickets];

function isUsingMongo(): boolean {
  return getDbStatus().connected;
}

// GET /api/status - DB Status check
router.get('/status', (req: Request, res: Response) => {
  const status = getDbStatus();
  res.json({
    ...status,
    ticketCount: memoryTickets.length,
  });
});

// GET /api/tickets - Get all tickets with optional search and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, type } = req.query;

    if (isUsingMongo()) {
      const query: any = {};

      if (type && type !== 'All') {
        query.eventType = type;
      }

      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { eventName: searchRegex },
          { venue: searchRegex },
          { ticketNumber: searchRegex },
        ];
      }

      if (status === 'favorites') {
        query.favorite = true;
      }

      const tickets = await TicketModel.find(query).sort({ date: 1 });
      const now = new Date();

      // Filter upcoming vs past if requested
      const filtered = tickets.filter((t) => {
        if (status === 'upcoming') {
          return new Date(t.date) >= now;
        }
        if (status === 'past') {
          return new Date(t.date) < now;
        }
        return true;
      });

      return res.json(filtered.map((t) => t.toJSON()));
    }

    // In-memory fallback handler
    let result = [...memoryTickets];

    if (type && type !== 'All') {
      result = result.filter((t) => t.eventType === type);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.eventName.toLowerCase().includes(term) ||
          t.venue.toLowerCase().includes(term) ||
          t.ticketNumber.toLowerCase().includes(term)
      );
    }

    const now = new Date();
    if (status === 'favorites') {
      result = result.filter((t) => t.favorite);
    } else if (status === 'upcoming') {
      result = result.filter((t) => new Date(t.date) >= now);
    } else if (status === 'past') {
      result = result.filter((t) => new Date(t.date) < now);
    }

    // Sort by event date ascending
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets', message: error.message });
  }
});

// GET /api/tickets/:id - Get single ticket
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isUsingMongo()) {
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json(ticket.toJSON());
    }

    const ticket = memoryTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error: any) {
    console.error('Error fetching ticket by id:', error);
    res.status(500).json({ error: 'Failed to fetch ticket', message: error.message });
  }
});

// POST /api/tickets - Create a new ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const { eventName, eventType, date, venue, ticketNumber, imageUrl, notes, favorite } = req.body;

    if (!eventName || !eventType || !date || !venue || !ticketNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['eventName', 'eventType', 'date', 'venue', 'ticketNumber'],
      });
    }

    if (isUsingMongo()) {
      const newTicket = new TicketModel({
        eventName,
        eventType,
        date,
        venue,
        ticketNumber,
        imageUrl: imageUrl || '',
        notes: notes || '',
        favorite: Boolean(favorite),
      });

      const saved = await newTicket.save();
      return res.status(201).json(saved.toJSON());
    }

    const newTicket: MemoryTicket = {
      id: 'tkt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      eventName: eventName.trim(),
      eventType,
      date,
      venue: venue.trim(),
      ticketNumber: ticketNumber.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : '',
      notes: notes ? notes.trim() : '',
      favorite: Boolean(favorite),
      createdAt: new Date().toISOString(),
    };

    memoryTickets.unshift(newTicket);
    res.status(201).json(newTicket);
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket', message: error.message });
  }
});

// PUT /api/tickets/:id - Update an existing ticket
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventName, eventType, date, venue, ticketNumber, imageUrl, notes, favorite } = req.body;

    if (isUsingMongo()) {
      const updated = await TicketModel.findByIdAndUpdate(
        id,
        {
          eventName,
          eventType,
          date,
          venue,
          ticketNumber,
          imageUrl: imageUrl !== undefined ? imageUrl : '',
          notes: notes !== undefined ? notes : '',
          favorite: Boolean(favorite),
        },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json(updated.toJSON());
    }

    const index = memoryTickets.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const existing = memoryTickets[index];
    const updatedTicket: MemoryTicket = {
      ...existing,
      eventName: eventName !== undefined ? eventName.trim() : existing.eventName,
      eventType: eventType !== undefined ? eventType : existing.eventType,
      date: date !== undefined ? date : existing.date,
      venue: venue !== undefined ? venue.trim() : existing.venue,
      ticketNumber: ticketNumber !== undefined ? ticketNumber.trim() : existing.ticketNumber,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : existing.imageUrl,
      notes: notes !== undefined ? notes.trim() : existing.notes,
      favorite: favorite !== undefined ? Boolean(favorite) : existing.favorite,
    };

    memoryTickets[index] = updatedTicket;
    res.json(updatedTicket);
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket', message: error.message });
  }
});

// DELETE /api/tickets/:id - Delete a ticket
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isUsingMongo()) {
      const deleted = await TicketModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      return res.json({ success: true, message: 'Ticket deleted successfully', id });
    }

    const index = memoryTickets.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    memoryTickets.splice(index, 1);
    res.json({ success: true, message: 'Ticket deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket', message: error.message });
  }
});

export default router;
