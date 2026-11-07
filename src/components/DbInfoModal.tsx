import React from 'react';
import { Database, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { DatabaseStatus } from '../types.ts';

interface DbInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: DatabaseStatus | null;
}

export const DbInfoModal: React.FC<DbInfoModalProps> = ({ isOpen, onClose, dbStatus }) => {
  if (!isOpen) return null;
  const isConnected = dbStatus?.connected;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5"><div className="p-2 rounded-xl border bg-indigo-50 text-indigo-700 border-indigo-200"><Database className="w-5 h-5" /></div><div><h3 className="text-base font-bold text-slate-900">Database Connection</h3><p className="text-xs text-slate-500">Firebase Cloud Firestore</p></div></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="mt-4 p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connection Status</span><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{isConnected ? <><CheckCircle2 className="w-3.5 h-3.5" />Ready</> : <><AlertCircle className="w-3.5 h-3.5" />Not configured</>}</span></div>
          <p className="text-xs text-slate-600 leading-relaxed">{dbStatus?.message || 'Firestore status is not available.'}</p>
        </div>
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
          <p className="font-semibold">Your data is separated by account</p>
          <p className="mt-1 text-xs leading-relaxed">TicketVault uses Firebase Authentication and the Firestore Web SDK. Each signed-in account can access only its own tickets, enforced by Firestore security rules. No separate backend server or Firebase Admin key is needed.</p>
        </div>
        <div className="mt-6 flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">Close</button></div>
      </div>
    </div>
  );
};
