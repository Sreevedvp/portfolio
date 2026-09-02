import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HERO_DATA } from '../data/portfolioData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Architecture & Engineering Inquiry');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(HERO_DATA.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleDirectMailto = () => {
    const encodedSubject = encodeURIComponent(subject || 'Inquiry via Portfolio');
    const encodedBody = encodeURIComponent(
      `Hi Sreeved,\n\n${message || 'I would like to discuss an engineering opportunity or architectural collaboration.'}\n\nBest regards,\n${name || 'Portfolio Visitor'} (${email || 'Email not provided'})`
    );
    window.location.href = `mailto:${HERO_DATA.email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);

    // Simulate async network submission delay & trigger success feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      // Confetti celebration on message send
      confetti({
        particleCount: 36,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#86efac', '#166534', '#004c22', '#a7f3d0'],
        disableForReducedMotion: true,
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#004c22]/15 flex flex-col overflow-hidden z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#004c22]/10 bg-[#f4fbf4]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-serif text-xl font-medium text-[#004c22]">
              Get in Touch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#404940] hover:bg-[#eef5ee] hover:text-[#004c22] transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Quick Direct Email Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#eef5ee] border border-[#004c22]/10">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#004c22]" />
              <span className="text-sm font-medium text-[#004c22] font-mono">
                {HERO_DATA.email}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white text-[#004c22] font-medium border border-[#004c22]/15 hover:bg-[#f4fbf4] transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Email' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDirectMailto}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-[#004c22] text-white font-medium hover:bg-[#166534] transition-colors shadow-2xs"
                title="Open in your default email client"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Mail</span>
              </button>
            </div>
          </div>

          {/* Form / Success Screen */}
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-[#eef5ee] rounded-full flex items-center justify-center mx-auto text-[#004c22]">
                <CheckCircle2 className="w-8 h-8 text-[#006d3e]" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#004c22]">
                Message Sent Successfully
              </h3>
              <p className="text-sm text-[#404940] max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-[#161d19]">{name}</strong>. Your message regarding <em className="text-[#004c22]">{subject}</em> has been received. I will review and reply to <strong className="text-[#004c22]">{email}</strong> shortly.
              </p>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="text-xs font-medium px-4 py-2 rounded-lg bg-[#eef5ee] text-[#004c22] hover:bg-[#dde4de] transition-colors"
                >
                  Send another message
                </button>
                <button
                  onClick={onClose}
                  className="text-xs font-medium px-4 py-2 rounded-lg bg-[#004c22] text-white hover:bg-[#166534] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30 transition-all"
                >
                  <option value="Architecture & Engineering Inquiry">Architecture & Engineering Inquiry</option>
                  <option value="Frontend Development / Contract">Frontend Development / Contract</option>
                  <option value="Full-time / Hiring Opportunity">Full-time / Hiring Opportunity</option>
                  <option value="Technical Consultation">Technical Consultation</option>
                  <option value="General Hello">General Hello</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#004c22] uppercase tracking-wider mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about your project, engineering team, or architectural challenge..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#f4fbf4] border border-[#004c22]/15 text-sm text-[#161d19] focus:outline-none focus:ring-2 focus:ring-[#004c22]/30 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDirectMailto}
                  className="text-xs text-[#707a6f] hover:text-[#004c22] underline font-medium"
                >
                  Prefer email client? Click here
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#004c22] text-white rounded-lg text-sm font-medium hover:bg-[#166534] disabled:opacity-50 transition-all flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Social Profiles & Availability Details */}
          <div className="pt-4 border-t border-[#004c22]/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-[#707a6f]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006d3e]" />
                <span>{HERO_DATA.location}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#006d3e]" />
                <span>Typically responds within 24 hours</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-xs font-medium text-[#404940] pt-1">
              <a
                href={HERO_DATA.socials.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#004c22] transition-colors flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={HERO_DATA.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#004c22] transition-colors flex items-center gap-1"
              >
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={HERO_DATA.socials.readcv}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#004c22] transition-colors flex items-center gap-1"
              >
                ReadCV <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
