import type { Ticket, TicketFormData, FilterStatus } from './types';
import * as tickets from './services/ticketService';

export async function fetchTickets(params?: {
  search?: string; status?: FilterStatus; type?: string;
}): Promise<Ticket[]> {
  let result = await tickets.fetchTickets();
  if (params?.search?.trim()) {
    const term = params.search.toLowerCase().trim();
    result = result.filter((t) => [t.eventName, t.venue, t.ticketNumber].some((v) => v.toLowerCase().includes(term)));
  }
  if (params?.status === 'favorites') result = result.filter((t) => t.favorite);
  if (params?.status === 'upcoming') result = result.filter((t) => new Date(t.date) >= new Date());
  if (params?.status === 'past') result = result.filter((t) => new Date(t.date) < new Date());
  if (params?.type && params.type !== 'All') result = result.filter((t) => t.eventType === params.type);
  return result;
}

export const fetchTicketById = tickets.fetchTicketById;
export const createTicket = (data: TicketFormData) => tickets.createTicket(data);
export const updateTicket = (id: string, data: Partial<TicketFormData>) => tickets.updateTicket(id, data);
export const deleteTicket = (id: string) => tickets.deleteTicket(id);
export const fetchDbStatus = tickets.fetchDbStatus;
