import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Ticket as TicketIcon, Image as ImageIcon, Sparkles, Star } from 'lucide-react';
import { Ticket, TicketFormData, EventType } from '../types.ts';
import { generateSampleTicketNumber } from '../utils.ts';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: TicketFormData) => Promise<void>;
  initialTicket?: Ticket | null;
  mode: 'add' | 'edit';
}

const sampleImages = [
  {
    label: 'Concert Stage',
    url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Movie Cinema',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Stadium',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Campus',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
];

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTicket,
  mode,
}) => {
  const [formData, setFormData] = useState<TicketFormData>({
    eventName: '',
    eventType: 'Concert',
    date: '',
    venue: '',
    ticketNumber: '',
    imageUrl: '',
    notes: '',
    favorite: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTicket && mode === 'edit') {
      setFormData({
        eventName: initialTicket.eventName,
        eventType: initialTicket.eventType,
        date: initialTicket.date,
        venue: initialTicket.venue,
        ticketNumber: initialTicket.ticketNumber,
        imageUrl: initialTicket.imageUrl || '',
        notes: initialTicket.notes || '',
        favorite: initialTicket.favorite || false,
      });
    } else {
      // Default new ticket form with a generated number
      const defaultType: EventType = 'Concert';
      const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        eventName: '',
        eventType: defaultType,
        date: defaultDate,
        venue: '',
        ticketNumber: generateSampleTicketNumber(defaultType),
        imageUrl: '',
        notes: '',
        favorite: false,
      });
    }
    setError(null);
  }, [initialTicket, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventName.trim()) {
      setError('Please enter an event name');
      return;
    }
    if (!formData.date) {
      setError('Please select an event date and time');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Please specify a venue');
      return;
    }
    if (!formData.ticketNumber.trim()) {
      setError('Please provide a ticket or barcode number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: EventType) => {
    setFormData((prev) => ({
      ...prev,
      eventType: newType,
      ticketNumber:
        mode === 'add' && (!prev.ticketNumber || prev.ticketNumber.includes('-'))
          ? generateSampleTicketNumber(newType)
          : prev.ticketNumber,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="modal-ticket-form"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'add' ? 'Add New Ticket' : 'Edit Ticket Details'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'add'
                ? 'Save your ticket information securely in Firebase Firestore'
                : 'Update event date, seat number, venue, or notes'}
            </p>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Event Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-event-name"
              type="text"
              required
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              placeholder="e.g. Coldplay Music of the Spheres, UEFA Final"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Event Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Event Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-event-type"
                value={formData.eventType}
                onChange={(e) => handleTypeChange(e.target.value as EventType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              >
                <option value="Concert">Concert</option>
                <option value="Movie">Movie</option>
                <option value="Sports">Sports</option>
                <option value="College">College</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-event-date"
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Venue & Ticket Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Venue <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  id="input-event-venue"
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Wembley Stadium, AMC 16"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ticket # <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  id="btn-gen-ticket-num"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      ticketNumber: generateSampleTicketNumber(formData.eventType),
                    })
                  }
                  className="text-2xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Generate #
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-ticket-number"
                  type="text"
                  required
                  value={formData.ticketNumber}
                  onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                  placeholder="e.g. CP-2026-SEC-A-42"
                  className="w-full pl-9 pr-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Ticket Image URL (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Image URL (Optional)
              </label>
              <span className="text-2xs text-slate-400">Poster / Ticket stub photo</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                id="input-image-url"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Quick Image Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-2xs text-slate-400 font-medium">Quick Presets:</span>
              {sampleImages.map((img) => (
                <button
                  type="button"
                  key={img.label}
                  onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                  className="text-2xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium whitespace-nowrap transition-colors"
                >
                  {img.label}
                </button>
              ))}
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="text-2xs px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Notes / Instructions (Optional)
            </label>
            <textarea
              id="textarea-notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Gate opens 2h early, bring photo ID, Section 102 Row 14 Seat 3"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Favorite Checkbox */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label
              htmlFor="checkbox-favorite"
              className="flex items-center space-x-2 text-sm font-medium text-slate-800 cursor-pointer select-none"
            >
              <input
                id="checkbox-favorite"
                type="checkbox"
                checked={formData.favorite}
                onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div className="flex items-center space-x-1.5">
                <Star
                  className={`w-4 h-4 ${
                    formData.favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>Mark as favorite ticket</span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              id="btn-cancel-ticket-form"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-ticket-form"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <span>{mode === 'add' ? 'Create Ticket' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
