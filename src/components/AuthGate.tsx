import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import { Ticket, Mail, Lock } from 'lucide-react';
import { auth, firebaseConfigured } from '../firebase.ts';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setChecking(false);
  }), []);

  if (checking) {
    return <div className="min-h-screen grid place-items-center bg-slate-100 text-slate-600">Checking your session...</div>;
  }

  if (user) return <>{children}</>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
        'auth/weak-password': 'Choose a password with at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
      };
      setError(messages[code || ''] || (err instanceof Error ? err.message : 'Authentication failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-7">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white grid place-items-center"><Ticket className="w-5 h-5 text-indigo-300" /></div>
          <div><h1 className="text-2xl font-extrabold text-slate-900">Ticket<span className="text-indigo-600">Vault</span></h1><p className="text-sm text-slate-500">Your personal ticket collection</p></div>
        </div>
        {!firebaseConfigured && <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">Firebase configuration is missing. Add all six VITE_FIREBASE variables in Netlify environment settings.</div>}
        <h2 className="text-xl font-bold text-slate-900">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{isRegister ? 'Sign up to create your private ticket vault.' : 'Sign in to access your saved tickets.'}</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Email address
            <span className="relative block mt-1"><Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" /></span>
          </label>
          <label className="block text-sm font-medium text-slate-700">Password
            <span className="relative block mt-1"><Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="password" required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="At least 6 characters" /></span>
          </label>
          {error && <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={busy || !firebaseConfigured} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5">{busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="text-sm text-center text-slate-600 mt-6">{isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}<button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="font-semibold text-indigo-600 hover:text-indigo-800">{isRegister ? 'Sign in' : 'Create account'}</button></p>
      </section>
    </main>
  );
}
