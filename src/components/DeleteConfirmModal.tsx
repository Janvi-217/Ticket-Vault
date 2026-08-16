import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Ticket } from '../types.ts';

interface DeleteConfirmModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="modal-delete-confirm"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Delete Ticket?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-800">"{ticket.eventName}"</span>? This
              action cannot be undone.
            </p>

            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <div>
                <span className="text-slate-400 font-medium">Ticket #: </span>
                <span className="font-mono font-bold text-slate-800">{ticket.ticketNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Venue: </span>
                <span>{ticket.venue}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            id="btn-cancel-delete"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Yes, Delete Ticket'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
