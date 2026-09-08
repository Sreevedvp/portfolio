import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MessageCircle, Send, Sparkles, Square, Trash2, X } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';
import { ChatMessage, ChatSource, conversationForRequest, sendChat } from '../services/chat';

type Entry = ChatMessage & { sources?: ChatSource[] };
interface Props { isOpen: boolean; onOpen: () => void; onClose: () => void; hidden: boolean }
const suggestions = ['Tell me about Sreeved', 'What has he built?', 'What are his strongest skills?'];

export function PersonalChat({ isOpen, onOpen, onClose, hidden }: Props) {
  const [messages, setMessages] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const panel = useDialog(isOpen, onClose);

  useEffect(() => { if (!isOpen) request.current?.abort(); }, [isOpen]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (isOpen) end.current?.scrollIntoView({ block: 'nearest' }); }, [messages, pending, error, isOpen]);

  async function send(question = draft) {
    const text = question.trim();
    if (!text || text.length > 1500 || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setDraft(text); setPending(text); setError('');
    const timeout = window.setTimeout(() => controller.abort('timeout'), 85000);
    try {
      const reply = await sendChat(conversationForRequest(messages, text), controller.signal);
      if (controller.signal.aborted) return;
      setMessages(previous => [...previous, { role: 'user', content: text }, { role: 'assistant', content: reply.answer, sources: reply.sources }]);
      setDraft('');
    } catch (failure) {
      if (controller.signal.reason === 'timeout') setError('The reply took too long. Your question is saved below; please try again.');
      else if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.');
    } finally {
      window.clearTimeout(timeout);
      request.current = null; setPending(null);
      input.current?.focus();
    }
  }

  return <>
    {!hidden && <button className="chat-launcher" onClick={onOpen} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls="personal-chat"><MessageCircle size={21} /><span>Ask about me</span><Sparkles size={15} /></button>}
    {isOpen && <div className="chat-backdrop" onClick={onClose}>
      <div id="personal-chat" ref={panel} className="personal-chat" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabIndex={-1} onClick={event => event.stopPropagation()}>
        <header className="chat-header">
          <div className="chat-avatar" aria-hidden="true"><Sparkles size={23} /></div>
          <div className="chat-heading"><h2 id="chat-title">Meet Sreeved.</h2><p>His work, in conversation.</p></div>
          <button className="chat-icon-button" disabled={!!pending || !messages.length} onClick={() => { setMessages([]); setDraft(''); setError(''); input.current?.focus(); }} aria-label="Clear conversation" title="Clear conversation"><Trash2 size={17} /></button>
          <button className="chat-icon-button" onClick={onClose} aria-label="Close chat"><X size={21} /></button>
        </header>
        <div className="chat-transcript" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
          <div className="chat-welcome"><span className="chat-eyebrow">THE PERSON BEHIND THE PIXELS</span><h3>What would you<br />like to know?</h3><p>I’m Sreeved’s AI guide. Ask me about his projects, experience, skills, or writing.</p><div className="chat-suggestions">{suggestions.map(question => <button key={question} disabled={!!pending} onClick={() => void send(question)}>{question}<ArrowUpRight size={15} /></button>)}</div></div>
          {messages.map((message, index) => <article key={index} className={`chat-message ${message.role}`}><span className="chat-speaker">{message.role === 'user' ? 'YOU' : 'AI GUIDE'}</span><p>{message.content}</p>{!!message.sources?.length && <details className="chat-sources"><summary>Retrieved sources · {message.sources.length}</summary><ul>{message.sources.map((source, i) => <li key={i}>{source.url ? <a href={source.url} target={source.url.startsWith('#') ? undefined : '_blank'} rel="noreferrer" onClick={() => { if (source.url?.startsWith('#')) onClose(); }}>{source.title}<ArrowUpRight size={13} /></a> : <span>{source.title}</span>}</li>)}</ul></details>}</article>)}
          {pending && <><article className="chat-message user"><span className="chat-speaker">YOU</span><p>{pending}</p></article><p className="chat-thinking" role="status"><Sparkles size={16} />Looking through Sreeved’s notes…</p></>}
          <div ref={end} />
        </div>
        <form className="chat-composer" onSubmit={event => { event.preventDefault(); void send(); }}>
          {error && <p className="chat-error" role="alert">{error}</p>}
          <label className="sr-only" htmlFor="chat-question">Ask about Sreeved</label>
          <div className="chat-input-row"><textarea id="chat-question" ref={input} value={draft} onChange={event => setDraft(event.target.value)} maxLength={1500} rows={2} disabled={!!pending} placeholder="Ask about Sreeved…" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />{pending ? <button type="button" className="chat-send" onClick={() => request.current?.abort()} aria-label="Stop reply"><Square size={18} /></button> : <button type="submit" className="chat-send" disabled={!draft.trim()} aria-label="Send question"><Send size={19} /></button>}</div>
          <p className="chat-disclosure">AI answers from portfolio notes may be incomplete. Messages are sent to AI services.</p>
        </form>
      </div>
    </div>}
  </>;
}
