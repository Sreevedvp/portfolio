export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatSource { title: string; url?: string }
export interface ChatReply { answer: string; sources: ChatSource[] }

export function conversationForRequest(history: ChatMessage[], question: string): ChatMessage[] {
  const recent = history.slice(-10).map(({ role, content }) => ({ role, content }));
  while (recent.length && recent.reduce((sum, message) => sum + message.content.length, question.length) > 10000) recent.splice(0, 2);
  return [...recent, { role: 'user', content: question }];
}

function safeSource(value: unknown): value is ChatSource {
  const source = value as ChatSource;
  if (!source || typeof source.title !== 'string') return false;
  if (source.url === undefined) return true;
  if (typeof source.url !== 'string') return false;
  if (/^#[a-z][a-z0-9-]*$/i.test(source.url)) return true;
  try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

export async function sendChat(messages: ChatMessage[], signal: AbortSignal, endpoint = import.meta.env.VITE_CHAT_API_URL || '/api/chat'): Promise<ChatReply> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }),
      signal, credentials: 'omit',
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('Could not reach the AI guide. Check your connection and try again.');
  }
  if (response.status === 429) throw new Error('The chat has reached its request limit. Please try again later.');
  if (response.status >= 500) throw new Error('The AI guide is temporarily unavailable. Your question is saved; please try again later.');
  if (response.status === 404 || response.status === 405 || !response.headers.get('content-type')?.includes('application/json')) throw new Error('The AI guide is not connected yet. You can still explore the portfolio or contact Sreeved directly.');
  if (!response.ok) throw new Error(response.status === 503 ? 'The AI guide is unavailable or still being set up. Please try again later.' : 'The message could not be sent. Try a shorter question.');
  const body = await response.json();
  if (typeof body?.answer !== 'string' || !body.answer.trim() || !Array.isArray(body.sources)) throw new Error('The AI guide returned an incomplete reply. Please try again.');
  return { answer: body.answer, sources: body.sources.filter(safeSource).slice(0, 6) };
}
