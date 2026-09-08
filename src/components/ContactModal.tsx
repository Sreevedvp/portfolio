import React, { useRef, useState } from 'react';
import { X, Mail, ArrowUpRight, Copy, Check, MapPin, Send, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { useDialog } from '../hooks/useDialog';
import { submitContact } from '../services/contact';

interface ContactModalProps { isOpen: boolean; onClose: () => void; }
export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const ref = useDialog(isOpen, onClose);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Engineering opportunity');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'submitted' | 'error' | 'activation'>('idle');
  const [copied, setCopied] = useState(false);
  const submitting = useRef(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(HERO_DATA.email); setCopied(true); }
    catch { setNotice(`Copy this address: ${HERO_DATA.email}`); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setStatus('sending'); setNotice('');
    try {
      const result = await submitContact({ name, email, subject, message, website });
      setStatus(result.kind); setNotice(result.message);
    } catch (error) {
      setStatus('error'); setNotice(error instanceof Error ? error.message : 'Something went wrong. Please email me directly.');
    } finally {
      submitting.current = false;
      requestAnimationFrame(() => noticeRef.current?.focus());
    }
  };
  const emailDraft = `mailto:${HERO_DATA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Sreeved,\n\n${message}\n\n${name}\n${email}`)}`;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} className="dialog-panel contact-dialog" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-4 mb-6"><div><p className="comic-label mb-3">LET'S MAKE SOMETHING HAPPEN</p><h2 id="contact-title" className="text-4xl">Drop a line.</h2></div><button onClick={onClose} aria-label="Close contact" className="p-2 rounded-lg secondary-button !p-2"><X size={20} /></button></div>
        <div className="contact-email-banner"><a href={`mailto:${HERO_DATA.email}`}><Mail size={16} />{HERO_DATA.email}</a><button onClick={copyEmail}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}</button></div>
        {status === 'submitted' ? <div className="contact-success" ref={noticeRef} role="status" tabIndex={-1}><div className="contact-success-mark"><CheckCircle2 size={36} /></div><span className="comic-label yellow">TRANSMISSION COMPLETE</span><h3>Message submitted.</h3><p>Thanks, {name.trim().split(' ')[0]}. Your message is on its way through the contact service.</p><button className="primary-button" onClick={() => { setStatus('idle'); setNotice(''); setMessage(''); }}>Write another message <ArrowUpRight size={16} /></button></div> : <form onSubmit={submit} className="space-y-4" aria-busy={status === 'sending'}>
          <fieldset disabled={status === 'sending'} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4"><label className="contact-label">Your name<input name="name" autoComplete="name" className="contact-field" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" /></label><label className="contact-label">Email address<input name="email" type="email" autoComplete="email" className="contact-field" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" /></label></div>
            <label className="contact-label block">What would you like to discuss?<select name="subject" className="contact-field" value={subject} onChange={e => setSubject(e.target.value)}><option>Engineering opportunity</option><option>Project collaboration</option><option>Technical consultation</option><option>Just saying hello</option></select></label>
            <label className="contact-label block">Your message<textarea name="message" className="contact-field min-h-28" required minLength={10} maxLength={5000} value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Tell me about the project, role, or idea you have in mind…" /></label>
            <label className="contact-honeypot" aria-hidden="true">Leave this empty<input name="_honey" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
            <div className="contact-form-note"><span>Your details are used only to reply.</span><span>{message.length.toLocaleString()} / 5,000</span></div>
            <button type="submit" className="primary-button w-full">{status === 'sending' ? <><LoaderCircle size={17} className="animate-spin" />Sending your message…</> : <><Send size={17} />Send message <ArrowUpRight size={17} /></>}</button>
          </fieldset>
          <div ref={noticeRef} role={status === 'error' || status === 'activation' ? 'alert' : 'status'} tabIndex={-1} className={`contact-notice ${status === 'error' || status === 'activation' ? 'has-error' : ''}`}>{notice && <><AlertCircle size={17} /><span>{notice}</span></>}</div>
          <a href={emailDraft} className="contact-direct-link">Prefer your email app? Send directly <ArrowUpRight size={13} /></a>
        </form>}
        <div className="mt-5 pt-5 border-t border-[var(--border-color)] flex flex-wrap justify-between gap-4 text-sm text-[var(--text-muted)]"><span className="flex gap-2 items-center"><MapPin size={14} />{HERO_DATA.location}</span><div className="flex gap-4"><a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div>
      </div>
    </div>
  );
};
