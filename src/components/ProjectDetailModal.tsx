import { useDialog } from '../hooks/useDialog';
import React, { useState } from 'react';
import { X, Code2, Copy, Check } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const dialogRef = useDialog(!!project, onClose);

  if (!project) return null;

  const details = project.architectureDetails;

  const handleCopyCode = () => {
    if (details?.codeSnippet) {
      navigator.clipboard.writeText(details.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={project.title} tabIndex={-1}
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-slide-up"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-hover)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--emerald-primary)' }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Architectural Deep Dive
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close project"
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-medium mb-2" style={{ color: 'var(--emerald-primary)' }}>
              {project.title}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          </div>

          {/* Metric Badges if available */}
          {details?.metrics && details.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {details.metrics.map((metric, mIdx) => (
                <div
                  key={mIdx}
                  className="p-3.5 rounded-xl border text-center"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="font-serif text-lg font-medium block" style={{ color: 'var(--emerald-primary)' }}>
                    {metric}
                  </span>
                  <span className="text-[11px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                    Key Benchmark
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Problem vs Solution */}
          {details && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(127,29,29,0.1)' }}>
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase mb-1.5 flex items-center gap-1.5" style={{ color: '#991b1b' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#b91c1c' }} />
                  Engineering Challenge
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {details.challenge}
                </p>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--emerald-primary)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--emerald-primary)' }} />
                  Architectural Solution & Impact
                </h4>
                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                  {details.solution}
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--emerald-secondary)' }}>
                  Outcome: {details.outcome}
                </p>
              </div>
            </div>
          )}

          {/* Code Snippet if present */}
          {details?.codeSnippet && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5" style={{ color: 'var(--emerald-primary)' }}>
                  <Code2 className="w-3.5 h-3.5" />
                  Implementation Pattern
                </h4>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {copiedCode ? (
                    <><Check className="w-3 h-3" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <pre
                className="p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border"
                style={{
                  backgroundColor: 'var(--bg-code)',
                  color: 'var(--emerald-accent)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <code>{details.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Technologies */}
          {details?.technologies && (
            <div className="pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="text-xs font-mono uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {details.technologies.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--emerald-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t flex justify-end"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close project"
            className="px-5 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'var(--emerald-primary)',
              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0a0f0c' : '#ffffff',
            }}
          >
            Close Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
};
