import { EventType } from './types.ts';

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function formatFullDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getRelativeTime(dateString: string): { label: string; isPast: boolean } {
  try {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    const diffMs = target - now;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const pastDays = Math.abs(diffDays);
      if (pastDays === 0) return { label: 'Earlier today', isPast: true };
      if (pastDays === 1) return { label: 'Yesterday', isPast: true };
      if (pastDays < 30) return { label: `${pastDays} days ago`, isPast: true };
      const months = Math.floor(pastDays / 30);
      return { label: `${months} month${months > 1 ? 's' : ''} ago`, isPast: true };
    } else {
      if (diffDays === 0) return { label: 'Today', isPast: false };
      if (diffDays === 1) return { label: 'Tomorrow', isPast: false };
      if (diffDays < 30) return { label: `In ${diffDays} days`, isPast: false };
      const months = Math.floor(diffDays / 30);
      return { label: `In ${months} month${months > 1 ? 's' : ''}`, isPast: false };
    }
  } catch {
    return { label: '', isPast: false };
  }
}

export function getEventTypeBadge(type: EventType): {
  bg: string;
  text: string;
  border: string;
  iconColor: string;
} {
  switch (type) {
    case 'Concert':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        iconColor: 'text-rose-500',
      };
    case 'Movie':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        iconColor: 'text-indigo-500',
      };
    case 'Sports':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconColor: 'text-emerald-500',
      };
    case 'College':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconColor: 'text-amber-500',
      };
    case 'Other':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        iconColor: 'text-slate-500',
      };
  }
}

export function generateSampleTicketNumber(type: EventType): string {
  const prefix = {
    Concert: 'LIVE',
    Movie: 'CINE',
    Sports: 'STAD',
    College: 'UNIV',
    Other: 'TCKT',
  }[type] || 'TCKT';

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomSec = ['A', 'B', 'C', 'VIP', 'GEN'][Math.floor(Math.random() * 5)];
  return `${prefix}-${randomSec}-${randomNum}`;
}
