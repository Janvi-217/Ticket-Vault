import React, { useState } from 'react';
import { Bot, Sparkles, WandSparkles, Clipboard, Loader2 } from 'lucide-react';
import { askTicketAI, type AiTask } from '../services/aiService';

export function AiAssistantPanel() {
  const [task, setTask] = useState<AiTask>('classify');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true); setError(''); setResult('');
    try { setResult(await askTicketAI(task, input)); }
    catch (e) { setError(e instanceof Error ? e.message : 'AI request failed.'); }
    finally { setBusy(false); }
  }

  return <section className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg">
    <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-white/10"><Bot className="w-5 h-5"/></div><div><h2 className="font-bold text-lg flex items-center gap-2">TicketVault AI <Sparkles className="w-4 h-4 text-amber-300"/></h2><p className="text-xs text-indigo-200">Gemini-powered event ticket intelligence</p></div></div>
    <div className="grid sm:grid-cols-[200px_1fr] gap-3">
      <select value={task} onChange={e=>setTask(e.target.value as AiTask)} className="rounded-lg bg-white text-slate-900 p-3 text-sm">
        <option value="classify">Identify ticket details</option><option value="summarize">Summarize ticket</option><option value="checklist">Create event checklist</option><option value="assistant">Ask TicketVault AI</option>
      </select>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={2} placeholder="Paste ticket text, event details, or your question…" className="rounded-lg bg-white text-slate-900 p-3 text-sm"/>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3"><button onClick={run} disabled={busy||!input.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-semibold px-4 py-2 text-sm disabled:opacity-50">{busy?<Loader2 className="w-4 h-4 animate-spin"/>:<WandSparkles className="w-4 h-4"/>}{busy?'Generating…':'Generate with AI'}</button><span className="text-xs text-indigo-200">Review extracted details before saving them.</span></div>
    {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    {result && <div className="mt-4 rounded-xl bg-white text-slate-800 p-4"><div className="flex justify-between items-center mb-2"><strong className="text-sm">AI response</strong><button onClick={()=>navigator.clipboard.writeText(result)} className="text-xs text-indigo-600 flex items-center gap-1"><Clipboard className="w-3 h-3"/> Copy</button></div><p className="text-sm whitespace-pre-wrap">{result}</p></div>}
  </section>;
}
