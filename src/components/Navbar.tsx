import React from 'react';
import { Ticket as TicketIcon, Plus, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import type { DatabaseStatus } from '../types';

interface NavbarProps {
  onOpenAddModal: () => void;
  dbStatus: DatabaseStatus | null;
  onOpenDbInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal, dbStatus, onOpenDbInfo }) => {
  const isConnected = dbStatus?.connected;
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm"><TicketIcon className="w-5 h-5 text-indigo-400" /></div>
            <div><span className="text-xl font-bold tracking-tight text-slate-900">Ticket<span className="text-indigo-600">Vault</span></span><p className="text-xs text-slate-500 hidden md:block">Your personal ticket manager</p></div>
          </div>
          <div className="flex items-center space-x-3">
            <button id="btn-db-status" onClick={onOpenDbInfo} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${isConnected?'bg-emerald-50 text-emerald-800 border-emerald-200':'bg-slate-50 text-slate-700 border-slate-200'}`} title="Firebase Firestore status">
              <Database className="w-3.5 h-3.5" /><span className="hidden xs:inline">{isConnected?'Firestore Active':'Checking Firestore'}</span>
              {isConnected?<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/>:<AlertCircle className="w-3.5 h-3.5 text-amber-500"/>}
            </button>
            <button id="btn-add-ticket-header" onClick={onOpenAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"><Plus className="w-4 h-4"/><span>Add Ticket</span></button>
          </div>
        </div>
      </div>
    </header>
  );
};
