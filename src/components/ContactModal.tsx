import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, Copy, Check, ExternalLink, MessageSquare } from 'lucide-react';
import { HERO_DATA } from '../data/portfolioData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(HERO_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#004c22]/15 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#004c22]/10 bg-[#f4fbf4]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004c22]" />
            <h2 className="font-serif text-xl font-medium text-[#004c22]">
              Get in Touch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#404940] hover:bg-[#eef5ee] hover:text-[#004c22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Direct Email Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#eef5ee] border border-[#004c22]/10">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#004c22]" />
              <span className="text-sm font-medium text-[#004c22] font-mono">
                {HERO_DATA.email}
              </span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white text-[#004c22] font-medium border border-[#004c22]/15 hover:bg-[#f4fbf4] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#006d3e] mx-auto animate-bounce" />
              <h3 className="font-serif text-2xl font-medium text-[#004c22]">
                Message Received
              </h3>
              <p className="text-sm text-[#404940] max-w-xs mx-auto">
                Thank you, {name}. I will review your message and reply to <strong className="text-[#004c22]">{email}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="mt-4 text-xs font-medium text-[#004c22] underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                  Project or Architecture Inquiry
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your architectural challenge, engineering team, or opportunity..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#004c22] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#166534] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}

          {/* Social Profiles */}
          <div className="pt-4 border-t border-[#004c22]/10 flex justify-center gap-6 text-xs text-[#404940]">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004c22] transition-colors"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004c22] transition-colors"
            >
              GitHub ↗
            </a>
            <a
              href="https://read.cv"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#004c22] transition-colors"
            >
              ReadCV ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
