import React, { useState } from 'react';
import { X, Mail, ArrowUpRight, Copy, Check, MapPin } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';
import { useDialog } from '../hooks/useDialog';

interface ContactModalProps { isOpen: boolean; onClose: () => void; }
export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const ref = useDialog(isOpen, onClose);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Engineering opportunity');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(HERO_DATA.email); setCopied(true); }
    catch { setNotice(`Copy this address: ${HERO_DATA.email}`); }
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Hi Sreeved,\n\n${message}\n\nBest,\n${name}\n${email}`;
    window.location.href = `mailto:${HERO_DATA.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice('Your email app should open with a draft. Send it there to finish. If it does not open, copy the address above and email me directly.');
  };
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="contact-title" tabIndex={-1} className="dialog-panel" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-4 mb-6">
          <div><p className="hero-kicker mb-2">Have something in mind?</p><h2 id="contact-title" className="text-4xl">Let's talk.</h2></div>
          <button onClick={onClose} aria-label="Close contact" className="p-2 rounded-lg secondary-button !p-2"><X size={20} /></button>
        </div>
        <div className="flex flex-wrap justify-between gap-3 items-center p-4 mb-6 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]">
          <a href={`mailto:${HERO_DATA.email}`} className="flex items-center gap-2 text-sm"><Mail size={16} className="text-[var(--accent-primary)]" />{HERO_DATA.email}</a>
          <button onClick={copyEmail} className="flex gap-2 items-center text-sm text-[var(--accent-primary)]">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="contact-label">Your name<input autoComplete="name" className="contact-field" required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" /></label>
            <label className="contact-label">Email address<input type="email" autoComplete="email" className="contact-field" required value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com" /></label>
          </div>
          <label className="contact-label block">What would you like to discuss?<select className="contact-field" value={subject} onChange={e => setSubject(e.target.value)}><option>Engineering opportunity</option><option>Project collaboration</option><option>Technical consultation</option><option>Just saying hello</option></select></label>
          <label className="contact-label block">Your message<textarea className="contact-field min-h-28" required value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Tell me a little about what you're working on…" /></label>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">This form prepares a draft in your email app.</p>
          <button type="submit" className="primary-button w-full">Continue to email <ArrowUpRight size={17} /></button>
          <p role="status" className="text-sm leading-relaxed text-[var(--accent-secondary)]">{notice}</p>
        </form>
        <div className="mt-5 pt-5 border-t border-[var(--border-color)] flex flex-wrap justify-between gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex gap-2 items-center"><MapPin size={14} />{HERO_DATA.location}</span>
          <div className="flex gap-4"><a href={HERO_DATA.socials.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={HERO_DATA.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
        </div>
      </div>
    </div>
  );
};
