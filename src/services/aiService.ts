import { auth } from '../firebase/config';

export type AiTask = 'classify' | 'summarize' | 'checklist' | 'assistant';

export async function askTicketAI(task: AiTask, text: string): Promise<string> {
  if (!text.trim()) throw new Error('Enter ticket details before asking AI.');
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in before using TicketVault AI.');
  const idToken = await user.getIdToken();
  const response = await fetch('/.netlify/functions/ai-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ task, text: text.trim() }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'AI request failed.');
  return String(payload.result ?? '');
}
