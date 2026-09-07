import { useDialog } from '../hooks/useDialog';
import React from 'react';
import { X, Clock, Share2, BookOpen, ArrowLeft } from 'lucide-react';
import { ArticleItem } from '../types';

interface ArticleModalProps {
  article: ArticleItem | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const dialogRef = useDialog(!!article, onClose);

  if (!article) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Article preview" tabIndex={-1}
        className="bg-[var(--bg-card)] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-secondary)] text-xs font-semibold">
              {article.category}
            </span>
            <span className="text-xs text-[var(--text-muted)]">• {article.platform}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <h2 className="font-serif text-3xl font-medium text-[var(--accent-primary)] leading-tight mb-3">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              <span>•</span>
              <span>Published {article.date}</span>
            </div>
          </div>

          <p className="text-base text-[var(--text-secondary)] italic border-l-2 border-[var(--accent-secondary)] pl-4 py-1 bg-[var(--bg-primary)]">
            {article.summary}
          </p>

          <div className="prose text-[var(--text-primary)] text-base leading-relaxed space-y-4">
            {article.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span>Article by Sreeved V P</span>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--accent-primary)] font-semibold hover:underline"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
