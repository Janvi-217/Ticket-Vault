import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { StatCards } from './components/StatCards.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { TicketCard } from './components/TicketCard.tsx';
import { TicketModal } from './components/TicketModal.tsx';
import { TicketDetailModal } from './components/TicketDetailModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { DbInfoModal } from './components/DbInfoModal.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';
import {
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  fetchDbStatus,
} from './api.ts';
import { Ticket, TicketFormData, FilterStatus, DatabaseStatus } from './types.ts';
import { Ticket as TicketIcon, Plus, RefreshCw, Sparkles, Inbox } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDbInfoOpen, setIsDbInfoOpen] = useState<boolean>(false);
  const [selectedTicketForView, setSelectedTicketForView] = useState<Ticket | null>(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Tickets and DB status
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketsData, statusData] = await Promise.all([
        fetchTickets(),
        fetchDbStatus(),
      ]);
      setTickets(ticketsData);
      setDbStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError(err.message || 'Failed to load tickets from server');
      addToast('Error loading tickets from backend', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived counts for Stat Cards
  const now = new Date();
  const counts = useMemo(() => {
    return {
      total: tickets.length,
      upcoming: tickets.filter((t) => new Date(t.date) >= now).length,
      past: tickets.filter((t) => new Date(t.date) < now).length,
      favorites: tickets.filter((t) => t.favorite).length,
    };
  }, [tickets, now]);

  // Client-side filtering and search
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (statusFilter === 'favorites' && !ticket.favorite) return false;
      if (statusFilter === 'upcoming' && new Date(ticket.date) < now) return false;
      if (statusFilter === 'past' && new Date(ticket.date) >= now) return false;

      // Event Type filter
      if (selectedType !== 'All' && ticket.eventType !== selectedType) return false;

      // Search Query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchName = ticket.eventName.toLowerCase().includes(query);
        const matchVenue = ticket.venue.toLowerCase().includes(query);
        const matchNumber = ticket.ticketNumber.toLowerCase().includes(query);
        if (!matchName && !matchVenue && !matchNumber) return false;
      }

      return true;
    });
  }, [tickets, statusFilter, selectedType, searchQuery, now]);

  // Handlers for CRUD operations
  const handleCreateTicket = async (formData: TicketFormData) => {
    try {
      const created = await createTicket(formData);
      setTickets((prev) => [created, ...prev]);
      addToast(`Ticket "${created.eventName}" created successfully!`, 'success');
      setIsAddModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleUpdateTicket = async (formData: TicketFormData) => {
    if (!selectedTicketForEdit) return;
    try {
      const updated = await updateTicket(selectedTicketForEdit.id, formData);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicketForEdit.id ? updated : t))
      );
      // Also update view modal if open for this ticket
      if (selectedTicketForView?.id === selectedTicketForEdit.id) {
        setSelectedTicketForView(updated);
      }
      addToast(`Ticket "${updated.eventName}" updated!`, 'success');
      setSelectedTicketForEdit(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTicket(ticketToDelete.id);
      setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete.id));
      if (selectedTicketForView?.id === ticketToDelete.id) {
        setSelectedTicketForView(null);
      }
      addToast(`Ticket "${ticketToDelete.eventName}" deleted.`, 'info');
      setTicketToDelete(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete ticket', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async (ticket: Ticket) => {
    const newFavState = !ticket.favorite;
    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, favorite: newFavState } : t))
    );
    if (selectedTicketForView?.id === ticket.id) {
      setSelectedTicketForView((prev) => (prev ? { ...prev, favorite: newFavState } : null));
    }

    try {
      await updateTicket(ticket.id, { favorite: newFavState });
      addToast(
        newFavState ? `Added "${ticket.eventName}" to favorites` : `Removed from favorites`,
        'info'
      );
    } catch (err: any) {
      // Revert if failed
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, favorite: ticket.favorite } : t))
      );
      addToast('Failed to update favorite status', 'error');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedType('All');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        dbStatus={dbStatus}
        onOpenDbInfo={() => setIsDbInfoOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Ticket Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Store, organize, and inspect your event tickets, movie passes, and sports badges.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              id="btn-refresh-tickets"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
              title="Refresh tickets from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="btn-add-ticket-main"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Top Stat Metrics */}
        <StatCards
          totalCount={counts.total}
          upcomingCount={counts.upcoming}
          pastCount={counts.past}
          favoritesCount={counts.favorites}
          activeStatus={statusFilter}
          onSelectStatus={(status) => setStatusFilter(status)}
        />

        {/* Search, Status & Category Filters */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          totalFilteredCount={filteredTickets.length}
        />

        {/* Content State Handling */}
        {loading && tickets.length === 0 ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse shadow-xs"
              >
                <div className="h-28 bg-slate-200 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : error && tickets.length === 0 ? (
          /* Error State */
          <div className="bg-white rounded-xl border border-rose-200 p-8 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Failed to load tickets</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto my-10 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery || statusFilter !== 'all' || selectedType !== 'All'
                ? 'No matching tickets found'
                : 'No tickets in your vault yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all' || selectedType !== 'All'
                ? 'Try adjusting your search criteria or resetting filters to view all passes.'
                : 'Get started by adding your upcoming concert pass, movie stub, or sports ticket.'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              {searchQuery || statusFilter !== 'all' || selectedType !== 'All' ? (
                <button
                  id="btn-reset-filters"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              ) : null}
              <button
                id="btn-empty-add-ticket"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Ticket</span>
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onView={(t) => setSelectedTicketForView(t)}
                onEdit={(t) => setSelectedTicketForEdit(t)}
                onDelete={(t) => setTicketToDelete(t)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">TicketVault</span>
            <span>•</span>
            <span>REST API + React + Node.js + Firebase</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDbInfoOpen(true)}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Firebase Firestore Setup
            </button>
            <span>•</span>
            <span>Zero AI dependencies</span>
          </div>
        </div>
      </footer>

      {/* Add Ticket Modal */}
      <TicketModal
        isOpen={isAddModalOpen}
        mode="add"
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Edit Ticket Modal */}
      <TicketModal
        isOpen={!!selectedTicketForEdit}
        mode="edit"
        initialTicket={selectedTicketForEdit}
        onClose={() => setSelectedTicketForEdit(null)}
        onSubmit={handleUpdateTicket}
      />

      {/* View Ticket Details Modal */}
      <TicketDetailModal
        isOpen={!!selectedTicketForView}
        ticket={selectedTicketForView}
        onClose={() => setSelectedTicketForView(null)}
        onEdit={(ticket) => {
          setSelectedTicketForView(null);
          setSelectedTicketForEdit(ticket);
        }}
        onDelete={(ticket) => {
          setSelectedTicketForView(null);
          setTicketToDelete(ticket);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!ticketToDelete}
        ticket={ticketToDelete}
        onClose={() => setTicketToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

      {/* DB Info & Connection Modal */}
      <DbInfoModal
        isOpen={isDbInfoOpen}
        onClose={() => setIsDbInfoOpen(false)}
        dbStatus={dbStatus}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
