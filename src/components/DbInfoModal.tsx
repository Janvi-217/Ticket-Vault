import React from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, X } from 'lucide-react';
import { DatabaseStatus } from '../types.ts';
interface DbInfoModalProps { isOpen: boolean; onClose: () => void; dbStatus: DatabaseStatus | null; }
export const DbInfoModal: React.FC<DbInfoModalProps> = ({ isOpen, onClose, dbStatus }) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;
  const isConnected = dbStatus?.connected;
  const exampleEnv = `FIREBASE_PROJECT_ID=ticket-vault-a0426
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
PORT=5000`;
  const handleCopy = () => { navigator.clipboard.writeText(exampleEnv); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div id="modal-db-info" className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200"><div className="flex items-center space-x-2.5"><div className={`p-2 rounded-xl border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}><Database className="w-5 h-5" /></div><div><h3 className="text-base font-bold text-slate-900">Database Connection</h3><p className="text-xs text-slate-500">Firebase Cloud Firestore</p></div></div><button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
      <div className="mt-4 p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connection Status</span><span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{isConnected ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>Connected to Firestore</span></> : <><AlertCircle className="w-3.5 h-3.5" /><span>Not connected</span></>}</span></div><p className="text-xs text-slate-600 leading-relaxed">{dbStatus?.message || 'Firestore connection status is not available yet.'}</p></div>
      <div className="mt-4 space-y-3"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Backend environment variables</h4><p className="text-xs text-slate-600 leading-relaxed">Add these values to your backend host settings. Never put the service-account private key in frontend code or commit it to GitHub.</p><div className="relative"><pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-normal">{exampleEnv}</pre><button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-2xs inline-flex items-center space-x-1">{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? 'Copied' : 'Copy'}</span></button></div></div>
      <div className="mt-6 flex justify-end"><button type="button" onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm">Got it</button></div>
    </div></div>;
};
