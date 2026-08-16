import React from 'react';
import {
  Calendar,
  MapPin,
  Star,
  Eye,
  Edit2,
  Trash2,
  Ticket as TicketIcon,
  Clock,
  Film,
  Music,
  Trophy,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Ticket, EventType } from '../types.ts';
import { formatDate, formatTime, getRelativeTime, getEventTypeBadge } from '../utils.ts';

interface TicketCardProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onToggleFavorite: (ticket: Ticket) => void;
}

const typeIcons: Record<EventType, React.ElementType> = {
  Movie: Film,
  Concert: Music,
  Sports: Trophy,
  College: GraduationCap,
  Other: Sparkles,
};

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const badge = getEventTypeBadge(ticket.eventType);
  const relative = getRelativeTime(ticket.date);
  const TypeIcon = typeIcons[ticket.eventType] || Sparkles;

  return (
    <div
      id={`ticket-card-${ticket.id}`}
      className="group relative bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Banner / Image (if available) or Decorative Header */}
      {ticket.imageUrl ? (
        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
          <img
            src={ticket.imageUrl}
            alt={ticket.eventName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide broken image gracefully
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          {/* Category Chip over image */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md bg-white/90 shadow-xs border ${badge.border} ${badge.text}`}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{ticket.eventType}</span>
            </span>
          </div>

          {/* Favorite Toggle Button on Image */}
          <button
            id={`btn-fav-${ticket.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(ticket);
            }}
            className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              ticket.favorite
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-white/80 hover:bg-white text-slate-400 hover:text-amber-500'
            }`}
            title={ticket.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${ticket.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      ) : (
        <div className="p-4 pb-0 flex items-center justify-between">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.border} ${badge.text}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{ticket.eventType}</span>
          </span>

          <button
            id={`btn-fav-${ticket.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(ticket);
            }}
            className={`p-1.5 rounded-lg border transition-all active:scale-90 ${
              ticket.favorite
                ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-100'
            }`}
            title={ticket.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${ticket.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Status & Relative Time */}
          <div className="flex items-center space-x-2 text-xs font-medium mb-1.5">
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full ${
                relative.isPast
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-emerald-50 text-emerald-700 font-semibold'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{relative.label || (relative.isPast ? 'Past Event' : 'Upcoming')}</span>
            </span>
          </div>

          {/* Event Title */}
          <h3
            onClick={() => onView(ticket)}
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer mb-2"
            title={ticket.eventName}
          >
            {ticket.eventName}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center text-xs text-slate-600 space-x-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium">{formatDate(ticket.date)}</span>
            {formatTime(ticket.date) && (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatTime(ticket.date)}</span>
              </>
            )}
          </div>

          {/* Venue */}
          <div className="flex items-center text-xs text-slate-600 space-x-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={ticket.venue}>
              {ticket.venue}
            </span>
          </div>
        </div>

        {/* Ticket Perforation / Barcode Ribbon */}
        <div className="pt-3 border-t border-dashed border-slate-200">
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200/80 mb-3">
            <div className="flex items-center space-x-1.5">
              <TicketIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400">
                Ticket #
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800 truncate max-w-[150px]">
              {ticket.ticketNumber}
            </span>
          </div>

          {/* Action Buttons: View, Edit, Delete */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id={`btn-view-${ticket.id}`}
              onClick={() => onView(ticket)}
              className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-md transition-colors"
              title="View ticket details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>

            <button
              id={`btn-edit-${ticket.id}`}
              onClick={() => onEdit(ticket)}
              className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              title="Edit ticket"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              id={`btn-delete-${ticket.id}`}
              onClick={() => onDelete(ticket)}
              className="inline-flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-semibold rounded-md transition-colors"
              title="Delete ticket"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
