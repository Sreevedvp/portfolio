import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { X, Download, Printer, Copy, Check, ExternalLink, Briefcase, GraduationCap, Code, Layers } from 'lucide-react';
import { HERO_DATA, EXPERIENCE_DATA, CORE_STACK_LIST } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose, onOpenContact }) => {
  const [copied, setCopied] = useState(false);

  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${HERO_DATA.name}
${HERO_DATA.title}
Email: ${HERO_DATA.email} | Location: ${HERO_DATA.location}

## Summary
${HERO_DATA.fullBio}

## Core Stack
${CORE_STACK_LIST.map(s => `- ${s}`).join('\n')}

## Experience
${EXPERIENCE_DATA.map(exp => `### ${exp.company} - ${exp.role} (${exp.period})
${exp.achievements.map(a => `- ${a}`).join('\n')}`).join('\n\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div data-resume-overlay="true" onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Résumé" tabIndex={-1}
        className="bg-[var(--bg-card)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex flex-wrap gap-3 items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]" />
            <h2 className="font-serif text-xl font-medium text-[var(--accent-primary)]">
              Curriculum Vitae — {HERO_DATA.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-color)]"
              title="Copy markdown text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-color)]"
              title="Print resume"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable CV Content */}
        <div data-resume-content="true" className="p-6 sm:p-8 overflow-y-auto space-y-8 print:p-0">
          {/* Header */}
          <div className="border-b border-[var(--border-color)] pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[var(--accent-primary)] mb-1">
              {HERO_DATA.name}
            </h1>
            <p className="text-base text-[var(--accent-secondary)] font-medium mb-3">
              {HERO_DATA.title}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
              <span>Email: <strong className="text-[var(--accent-primary)]">{HERO_DATA.email}</strong></span>
              <span>•</span>
              <span>Location: {HERO_DATA.location}</span>
              <span>•</span>
              <span>Experience: 3.5+ Years</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[var(--accent-primary)] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
              Executive Profile
            </h3>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {HERO_DATA.fullBio}
            </p>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[var(--accent-primary)] mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
              Work History
            </h3>
            {EXPERIENCE_DATA.map((exp, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h4 className="font-serif text-lg font-medium text-[var(--accent-primary)]">{exp.company}</h4>
                    <p className="text-xs font-semibold text-[var(--accent-secondary)] uppercase">{exp.role}</p>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)] pt-1">
                  {exp.achievements.map((ach, aIdx) => (
                    <li key={aIdx} className="leading-relaxed">{ach}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Technical Proficiencies */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[var(--accent-primary)] mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
              Technical Proficiencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {CORE_STACK_LIST.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]" />
                  <span className="text-[var(--text-primary)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span>© 2026 Sreeved V P</span>
          <button
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="text-[var(--accent-primary)] font-semibold hover:underline"
          >
            Contact Candidate →
          </button>
        </div>
      </div>
    </div>
  );
};
