export type EventType = 'Movie' | 'Concert' | 'Sports' | 'College' | 'Other';
export interface TicketRecord {
  id: string; eventName: string; eventType: EventType; date: string; venue: string;
  ticketNumber: string; imageUrl?: string; notes?: string; favorite: boolean; createdAt: string;
}
