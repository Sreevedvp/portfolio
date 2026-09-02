import React from 'react';
import { X, ArrowUpRight, CheckCircle, Code2, Cpu, TrendingUp, Layers } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const details = project.architectureDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#004c22]/15 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#004c22]/10 bg-[#f4fbf4]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004c22]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#707a6f]">
              Architectural Deep Dive
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#404940] hover:bg-[#eef5ee] hover:text-[#004c22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-medium text-[#004c22] mb-2">
              {project.title}
            </h2>
            <p className="text-[#404940] text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Metric Badges if available */}
          {details?.metrics && details.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {details.metrics.map((metric, mIdx) => (
                <div key={mIdx} className="p-3.5 rounded-xl bg-[#f4fbf4] border border-[#004c22]/10 text-center">
                  <span className="font-serif text-lg font-medium text-[#004c22] block">
                    {metric}
                  </span>
                  <span className="text-[11px] font-mono text-[#707a6f] uppercase">
                    Key Benchmark
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Problem vs Solution */}
          {details && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50/40 border border-red-900/10">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-red-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
                  Engineering Challenge
                </h4>
                <p className="text-sm text-[#161d19] leading-relaxed">
                  {details.challenge}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#eef5ee] border border-[#004c22]/10">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#004c22] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#004c22]" />
                  Architectural Solution & Impact
                </h4>
                <p className="text-sm text-[#161d19] leading-relaxed mb-2">
                  {details.solution}
                </p>
                <p className="text-xs font-medium text-[#006d3e]">
                  Outcome: {details.outcome}
                </p>
              </div>
            </div>
          )}

          {/* Code Snippet if present */}
          {details?.codeSnippet && (
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#004c22] mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#004c22]" />
                Implementation Pattern
              </h4>
              <pre className="p-4 rounded-xl bg-[#161d19] text-[#86efac] font-mono text-xs overflow-x-auto leading-relaxed border border-[#004c22]/20">
                <code>{details.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Technologies */}
          {details?.technologies && (
            <div className="pt-2 border-t border-[#004c22]/10">
              <h4 className="text-xs font-mono text-[#707a6f] uppercase mb-2">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {details.technologies.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4fbf4] text-[#004c22] font-medium border border-[#004c22]/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#004c22]/10 bg-[#f4fbf4] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#004c22] text-white px-5 py-1.5 rounded-md text-xs font-medium hover:bg-[#166534] transition-colors"
          >
            Close Deep Dive
          </button>
        </div>
      </div>
    </div>
  );
};
