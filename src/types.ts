export type EventType = 'Movie' | 'Concert' | 'Sports' | 'College' | 'Other';
export interface Ticket {
  id: string; eventName: string; eventType: EventType; date: string; venue: string;
  ticketNumber: string; imageUrl?: string; notes?: string; favorite: boolean; createdAt?: string;
}
export interface TicketFormData {
  eventName: string; eventType: EventType; date: string; venue: string; ticketNumber: string;
  imageUrl?: string; notes?: string; favorite: boolean;
}
export type FilterStatus = 'all' | 'upcoming' | 'past' | 'favorites';
export interface DatabaseStatus {
  connected: boolean; type: 'firestore' | 'unconfigured'; message: string; uriConfigured: boolean;
}
