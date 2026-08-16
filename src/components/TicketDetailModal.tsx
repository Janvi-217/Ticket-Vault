import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Star,
  Edit2,
  Trash2,
  Clock,
  QrCode,
  Share2,
} from 'lucide-react';
import { Ticket } from '../types.ts';
import {
  formatFullDateTime,
  getRelativeTime,
  getEventTypeBadge,
} from '../utils.ts';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onToggleFavorite: (ticket: Ticket) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  if (!isOpen || !ticket) return null;

  const badge = getEventTypeBadge(ticket.eventType);
  const relative = getRelativeTime(ticket.date);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        id="modal-ticket-detail"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all my-6"
      >
        {/* Top bar with category & close */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
            >
              {ticket.eventType} Pass
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                relative.isPast
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {relative.label || (relative.isPast ? 'Past' : 'Upcoming')}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              id="btn-detail-fav"
              onClick={() => onToggleFavorite(ticket)}
              className={`p-2 rounded-lg border transition-all ${
                ticket.favorite
                  ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-50'
              }`}
              title={ticket.favorite ? 'Remove favorite' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${ticket.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              id="btn-close-detail"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Image if provided */}
        {ticket.imageUrl && (
          <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
            <img
              src={ticket.imageUrl}
              alt={ticket.eventName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          </div>
        )}

        {/* Ticket Details Body */}
        <div className="p-6 space-y-5">
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-slate-400">
              Event Title
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {ticket.eventName}
            </h2>
          </div>

          {/* Date & Time block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-2xs uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Date & Time</span>
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {formatFullDateTime(ticket.date)}
              </p>
            </div>
            <div>
              <span className="text-2xs uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1 mb-1">
                <MapPin className="w-3 h-3" />
                <span>Venue & Location</span>
              </span>
              <p className="text-xs font-semibold text-slate-800">{ticket.venue}</p>
            </div>
          </div>

          {/* Notes if present */}
          {ticket.notes && (
            <div>
              <span className="text-2xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Notes & Instructions
              </span>
              <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-lg text-xs text-slate-700 leading-relaxed">
                {ticket.notes}
              </div>
            </div>
          )}

          {/* Perforated Divider Ticket Stub */}
          <div className="relative py-2">
            <div className="border-t-2 border-dashed border-slate-300" />
            <div className="absolute -left-9 -top-1 w-6 h-6 rounded-full bg-slate-900/60" />
            <div className="absolute -right-9 -top-1 w-6 h-6 rounded-full bg-slate-900/60" />
          </div>

          {/* Ticket Barcode Voucher Section */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xs uppercase tracking-widest text-slate-400 font-semibold">
                  Official Pass Code
                </span>
                <p className="text-sm sm:text-base font-mono font-bold tracking-wider text-indigo-300">
                  {ticket.ticketNumber}
                </p>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Simulated Barcode Stripes */}
            <div className="h-9 w-full bg-white/95 rounded flex items-center justify-center px-3 space-x-1">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-slate-950"
                  style={{
                    width: (i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2) + 'px',
                    opacity: (i + ticket.ticketNumber.length) % 5 === 0 ? 0.4 : 0.9,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              id="btn-detail-edit"
              onClick={() => {
                onClose();
                onEdit(ticket);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              id="btn-detail-delete"
              onClick={() => {
                onClose();
                onDelete(ticket);
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            id="btn-detail-done"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
