import React from 'react';
import { Database, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import type { DatabaseStatus } from '../types';

interface Props { isOpen: boolean; onClose: () => void; dbStatus: DatabaseStatus | null; }

export const DbInfoModal: React.FC<Props> = ({ isOpen, onClose, dbStatus }) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
      <div className="flex justify-between items-center"><div className="flex gap-3 items-center"><Database className="w-6 h-6 text-indigo-600"/><div><h3 className="font-bold">Firebase Database</h3><p className="text-xs text-slate-500">Cloud Firestore</p></div></div><button onClick={onClose}><X/></button></div>
      <div className="mt-5 rounded-xl bg-emerald-50 p-4"><div className="font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>Firebase integration enabled</div><p className="text-sm text-slate-600 mt-2">{dbStatus?.message ?? 'Tickets are stored in your private Firestore account.'}</p></div>
      <div className="mt-4 text-sm text-slate-600 flex items-start gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0"/><p>Firestore rules restrict ticket reads and writes to the authenticated owner. Never switch to public read/write rules in production.</p></div>
      <button onClick={onClose} className="mt-6 w-full rounded-lg bg-indigo-600 text-white py-2 font-semibold">Close</button>
    </div>
  </div>;
};
