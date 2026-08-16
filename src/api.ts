import { Ticket, TicketFormData, DatabaseStatus, FilterStatus, EventType } from './types.ts';

const API_BASE = '/api';

export async function fetchTickets(params?: {
  search?: string;
  status?: FilterStatus;
  type?: string;
}): Promise<Ticket[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.type && params.type !== 'All') query.set('type', params.type);

  const res = await fetch(`${API_BASE}/tickets?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ticket: ${res.statusText}`);
  }
  return res.json();
}

export async function createTicket(ticketData: TicketFormData): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create ticket: ${res.statusText}`);
  }
  return res.json();
}

export async function updateTicket(id: string, ticketData: Partial<TicketFormData>): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update ticket: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete ticket: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDbStatus(): Promise<DatabaseStatus> {
  try {
    const res = await fetch(`${API_BASE}/tickets/status`);
    if (!res.ok) {
      return {
        connected: false,
        type: 'memory',
        message: 'Could not connect to backend server',
        uriConfigured: false,
      };
    }
    return res.json();
  } catch {
    return {
      connected: false,
      type: 'memory',
      message: 'Server offline or unreachable',
      uriConfigured: false,
    };
  }
}
