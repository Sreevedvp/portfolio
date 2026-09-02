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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#004c22]/15 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#004c22]/10 bg-[#f4fbf4]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004c22]" />
            <h2 className="font-serif text-xl font-medium text-[#004c22]">
              Curriculum Vitae — {HERO_DATA.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#004c22] hover:bg-[#eef5ee] transition-colors border border-[#004c22]/15"
              title="Copy markdown text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#004c22] hover:bg-[#eef5ee] transition-colors border border-[#004c22]/15"
              title="Print resume"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#404940] hover:bg-[#eef5ee] hover:text-[#004c22] transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable CV Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 print:p-0">
          {/* Header */}
          <div className="border-b border-[#004c22]/10 pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#004c22] mb-1">
              {HERO_DATA.name}
            </h1>
            <p className="text-base text-[#006d3e] font-medium mb-3">
              {HERO_DATA.title}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-[#404940]">
              <span>Email: <strong className="text-[#004c22]">{HERO_DATA.email}</strong></span>
              <span>•</span>
              <span>Location: {HERO_DATA.location}</span>
              <span>•</span>
              <span>Experience: 3.5+ Years</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[#004c22] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004c22]" />
              Executive Profile
            </h3>
            <p className="text-sm text-[#161d19] leading-relaxed">
              {HERO_DATA.fullBio}
            </p>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[#004c22] mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004c22]" />
              Work History
            </h3>
            {EXPERIENCE_DATA.map((exp, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h4 className="font-serif text-lg font-medium text-[#004c22]">{exp.company}</h4>
                    <p className="text-xs font-semibold text-[#006d3e] uppercase">{exp.role}</p>
                  </div>
                  <span className="text-xs font-mono text-[#707a6f]">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#404940] pt-1">
                  {exp.achievements.map((ach, aIdx) => (
                    <li key={aIdx} className="leading-relaxed">{ach}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Technical Proficiencies */}
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-[#004c22] mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004c22]" />
              Technical Proficiencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {CORE_STACK_LIST.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-[#f4fbf4] border border-[#004c22]/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006d3e]" />
                  <span className="text-[#161d19]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#004c22]/10 bg-[#f4fbf4] flex justify-between items-center text-xs text-[#707a6f]">
          <span>© 2026 Sreeved V P</span>
          <button
            onClick={() => {
              onClose();
              onOpenContact();
            }}
            className="text-[#004c22] font-semibold hover:underline"
          >
            Contact Candidate →
          </button>
        </div>
      </div>
    </div>
  );
};
