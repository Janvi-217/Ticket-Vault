import React, { useState } from 'react';
import { LockKeyhole, Mail, Ticket, UserRound, Sparkles } from 'lucide-react';
import { login, register, resetPassword } from '../services/authService';

export function AuthScreen() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'register') {
        if (password.length < 6) throw new Error('Password must contain at least 6 characters.');
        if (!name.trim()) throw new Error('Please enter your name.');
        await register(email, password, name);
      } else await login(email, password);
    } catch (e) { setError(e instanceof Error ? e.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }

  async function forgotPassword() {
    if (!email.trim()) { setError('Enter your email first.'); return; }
    try { await resetPassword(email); setMessage('Password reset email sent. Check your inbox.'); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send reset email.'); }
  }

  return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center mb-4"><Ticket className="w-7 h-7"/></div>
        <h1 className="text-3xl font-black">Ticket<span className="text-indigo-400">Vault</span></h1>
        <p className="text-slate-400 mt-2">Your personal event-ticket vault, powered by AI</p>
      </div>
      <form onSubmit={submit} className="bg-white text-slate-900 rounded-2xl p-7 shadow-2xl space-y-4">
        <div><h2 className="text-xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="text-sm text-slate-500">Your tickets are private to your account.</p></div>
        {mode === 'register' && <label className="block text-sm font-medium">Full name<div className="relative mt-1"><UserRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg p-3 pl-10" placeholder="Your name"/></div></label>}
        <label className="block text-sm font-medium">Email<div className="relative mt-1"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg p-3 pl-10" placeholder="you@example.com"/></div></label>
        <label className="block text-sm font-medium">Password<div className="relative mt-1"><LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-slate-400"/><input required type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg p-3 pl-10" placeholder="At least 6 characters"/></div></label>
        {error && <p className="text-sm text-rose-600">{error}</p>}{message && <p className="text-sm text-emerald-700">{message}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        {mode === 'login' && <button type="button" onClick={forgotPassword} className="w-full text-sm text-indigo-600 hover:underline">Forgot password?</button>}
        <p className="text-sm text-center text-slate-600">{mode === 'login' ? 'New to TicketVault?' : 'Already have an account?'} <button type="button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setMessage('');}} className="font-semibold text-indigo-600">{mode==='login'?'Create account':'Sign in'}</button></p>
      </form>
      <p className="text-center text-xs text-slate-500 mt-5 flex items-center justify-center gap-1"><Sparkles className="w-3 h-3"/> Smart ticket insights with Gemini AI</p>
    </div>
  </main>;
}
