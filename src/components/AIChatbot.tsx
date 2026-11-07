import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Sparkles, LoaderCircle, Trash2, MessageCircle, Ticket as TicketIcon } from 'lucide-react';
import { auth } from '../firebase.ts';
import type { Ticket } from '../types.ts';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Props = { tickets: Ticket[] };

const suggestions = [
  'What events are coming up next?',
  'Summarize my ticket collection',
  'Which tickets have I marked as favorites?',
];

export function AIChatbot({ tickets }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy, open]);

  const sendMessage = async (value = input) => {
    const prompt = value.trim();
    if (!prompt || busy) return;
    const user = auth.currentUser;
    if (!user) {
      setError('Please sign in again to use the AI assistant.');
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setBusy(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
          tickets: tickets.slice(0, 50).map((ticket) => ({
            eventName: ticket.eventName,
            eventType: ticket.eventType,
            date: ticket.date,
            venue: ticket.venue,
            ticketNumber: ticket.ticketNumber,
            favorite: ticket.favorite,
            notes: ticket.notes || '',
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The AI assistant could not respond. Please try again.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Gemini returned an empty response. Please try again.');
      }
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          aria-label="Open TicketVault AI assistant"
        >
          <Sparkles className="h-5 w-5" /> Ask TicketVault AI
        </button>
      )}

      {open && (
        <section className="fixed bottom-4 right-4 z-50 flex h-[min(680px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <header className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500"><Bot className="h-6 w-6" /></div>
              <div>
                <h2 className="font-bold">TicketVault AI</h2>
                <p className="text-xs text-slate-300">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearChat} title="Clear conversation" className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><Trash2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => setOpen(false)} title="Close assistant" className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
          </header>

          <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs text-indigo-900">
            <TicketIcon className="h-4 w-4 shrink-0" />
            <span>Ticket-aware assistant · {tickets.length} ticket{tickets.length === 1 ? '' : 's'} in your vault</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && (
              <div className="pt-5">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-700"><Sparkles className="h-7 w-7" /></div>
                <h3 className="text-center text-lg font-bold text-slate-900">Hi! I'm your TicketVault AI.</h3>
                <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-slate-500">Ask me about your saved tickets, upcoming events, favorites, or anything else you need help with.</p>
                <div className="mt-6 space-y-2">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" disabled={busy} onClick={() => void sendMessage(suggestion)} className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50">{suggestion}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6 shadow-sm ${message.role === 'user' ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                  {message.role === 'assistant' && <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600"><Sparkles className="h-3 w-3" /> GEMINI</div>}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin text-indigo-600" /> Gemini is thinking...</div>
              </div>
            )}
            {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-slate-50 p-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }}
                rows={1}
                maxLength={1200}
                placeholder="Ask anything about your tickets..."
                aria-label="Message TicketVault AI"
                className="max-h-28 min-h-9 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Check important ticket details.</p>
          </form>
        </section>
      )}
    </>
  );
}
