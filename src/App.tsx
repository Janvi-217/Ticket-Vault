import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LogOut, UserRound, Ticket as TicketIcon, Plus, RefreshCw, Inbox } from 'lucide-react';
import { auth } from './firebase/config';
import { logout } from './services/authService';
import { AuthScreen } from './components/AuthScreen';
import { AiAssistantPanel } from './components/AiAssistantPanel';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { TicketCard } from './components/TicketCard';
import { TicketModal } from './components/TicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DbInfoModal } from './components/DbInfoModal';
import { Toast, ToastMessage } from './components/Toast';
import { fetchTickets, createTicket, updateTicket, deleteTicket, fetchDbStatus } from './api';
import type { Ticket, TicketFormData, FilterStatus, DatabaseStatus } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedType, setSelectedType] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDbInfoOpen, setIsDbInfoOpen] = useState(false);
  const [selectedTicketForView, setSelectedTicketForView] = useState<Ticket | null>(null);
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<Ticket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3500);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthLoading(false);
  }), []);

  const loadData = useCallback(async () => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [items, status] = await Promise.all([fetchTickets(), fetchDbStatus()]);
      setTickets(items);
      setDbStatus(status);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load tickets.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadData();
    else {
      setTickets([]);
      setLoading(false);
      setDbStatus(null);
    }
  }, [user, loadData]);

  const now = new Date();
  const counts = useMemo(() => ({
    total: tickets.length,
    upcoming: tickets.filter((ticket) => new Date(ticket.date) >= now).length,
    past: tickets.filter((ticket) => new Date(ticket.date) < now).length,
    favorites: tickets.filter((ticket) => ticket.favorite).length,
  }), [tickets]);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    if (statusFilter === 'favorites' && !ticket.favorite) return false;
    if (statusFilter === 'upcoming' && new Date(ticket.date) < now) return false;
    if (statusFilter === 'past' && new Date(ticket.date) >= now) return false;
    if (selectedType !== 'All' && ticket.eventType !== selectedType) return false;
    const term = searchQuery.toLowerCase().trim();
    return !term || [ticket.eventName, ticket.venue, ticket.ticketNumber]
      .some((value) => value.toLowerCase().includes(term));
  }), [tickets, statusFilter, selectedType, searchQuery]);

  async function handleCreateTicket(data: TicketFormData) {
    const created = await createTicket(data);
    setTickets((prev) => [created, ...prev]);
    addToast(`Ticket "${created.eventName}" created successfully!`);
    setIsAddModalOpen(false);
  }

  async function handleUpdateTicket(data: TicketFormData) {
    if (!selectedTicketForEdit) return;
    const updated = await updateTicket(selectedTicketForEdit.id, data);
    setTickets((prev) => prev.map((ticket) => ticket.id === updated.id ? updated : ticket));
    if (selectedTicketForView?.id === updated.id) setSelectedTicketForView(updated);
    addToast('Ticket updated!');
    setSelectedTicketForEdit(null);
  }

  async function handleDeleteConfirm() {
    if (!ticketToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTicket(ticketToDelete.id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketToDelete.id));
      if (selectedTicketForView?.id === ticketToDelete.id) setSelectedTicketForView(null);
      addToast('Ticket deleted.', 'info');
      setTicketToDelete(null);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleFavorite(ticket: Ticket) {
    const favorite = !ticket.favorite;
    setTickets((prev) => prev.map((item) => item.id === ticket.id ? { ...item, favorite } : item));
    if (selectedTicketForView?.id === ticket.id) setSelectedTicketForView({ ...ticket, favorite });
    try {
      await updateTicket(ticket.id, { favorite });
    } catch {
      setTickets((prev) => prev.map((item) => item.id === ticket.id ? { ...item, favorite: ticket.favorite } : item));
      addToast('Could not update favorite.', 'error');
    }
  }

  function resetFilters() {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedType('All');
  }

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading TicketVault…</div>;
  }
  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900">
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} dbStatus={dbStatus} onOpenDbInfo={() => setIsDbInfoOpen(true)} />
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs text-slate-600">
          <span className="flex items-center gap-2"><UserRound className="w-4 h-4" />Signed in as <strong>{user.displayName || user.email}</strong></span>
          <button onClick={() => logout().catch((err) => addToast(err.message || 'Sign out failed.', 'error'))} className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 font-semibold">
            <LogOut className="w-4 h-4" />Sign out
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Ticket Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your private event passes, organized with intelligent AI assistance.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-xs font-semibold">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
              <Plus className="w-4 h-4" />New Ticket
            </button>
          </div>
        </div>

        <AiAssistantPanel />
        <StatCards totalCount={counts.total} upcomingCount={counts.upcoming} pastCount={counts.past} favoritesCount={counts.favorites} activeStatus={statusFilter} onSelectStatus={setStatusFilter} />
        <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusChange={setStatusFilter} selectedType={selectedType} onTypeChange={setSelectedType} totalFilteredCount={filteredTickets.length} />

        {loading && tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">Loading your tickets…</div>
        ) : error && tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-auto">
            <Inbox className="w-8 h-8 mx-auto text-rose-500" /><h3 className="font-bold mt-3">Unable to load tickets</h3>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <button onClick={loadData} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Try again</button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center max-w-lg mx-auto my-10">
            <TicketIcon className="w-10 h-10 mx-auto text-indigo-500" />
            <h3 className="text-lg font-bold mt-3">{tickets.length ? 'No matching tickets' : 'Your vault is empty'}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">Add a ticket or change your filters.</p>
            {tickets.length > 0 && <button onClick={resetFilters} className="mr-2 px-4 py-2 bg-slate-100 rounded-lg">Clear filters</button>}
            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add ticket</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onView={setSelectedTicketForView} onEdit={setSelectedTicketForEdit} onDelete={setTicketToDelete} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t bg-white/80 py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
          <span className="font-bold text-slate-800">TicketVault · Full-Stack + GenAI</span>
          <span>React · Firebase · Firestore · Gemini AI · Netlify</span>
        </div>
      </footer>

      <TicketModal isOpen={isAddModalOpen} mode="add" onClose={() => setIsAddModalOpen(false)} onSubmit={handleCreateTicket} />
      <TicketModal isOpen={!!selectedTicketForEdit} mode="edit" initialTicket={selectedTicketForEdit} onClose={() => setSelectedTicketForEdit(null)} onSubmit={handleUpdateTicket} />
      <TicketDetailModal isOpen={!!selectedTicketForView} ticket={selectedTicketForView} onClose={() => setSelectedTicketForView(null)} onEdit={(ticket) => { setSelectedTicketForView(null); setSelectedTicketForEdit(ticket); }} onDelete={(ticket) => { setSelectedTicketForView(null); setTicketToDelete(ticket); }} onToggleFavorite={handleToggleFavorite} />
      <DeleteConfirmModal isOpen={!!ticketToDelete} ticket={ticketToDelete} onClose={() => setTicketToDelete(null)} onConfirm={handleDeleteConfirm} loading={isDeleting} />
      <DbInfoModal isOpen={isDbInfoOpen} onClose={() => setIsDbInfoOpen(false)} dbStatus={dbStatus} />
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
