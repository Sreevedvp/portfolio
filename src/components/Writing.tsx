import React from 'react';
import { WRITING_DATA } from '../data/portfolioData';
import { ArticleItem } from '../types';
import { BookOpen, ArrowUpRight, Clock } from 'lucide-react';

interface WritingProps {
  onSelectArticle: (article: ArticleItem) => void;
}

export const Writing: React.FC<WritingProps> = ({ onSelectArticle }) => {
  return (
    <section id="writing" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="pb-4 flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--border-hover)' }}>
        <h2 className="font-serif text-3xl md:text-[32px] font-medium" style={{ color: 'var(--emerald-primary)' }}>
          Writing
        </h2>
        <span className="text-xs font-mono tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          06 // Notes
        </span>
      </div>

      {/* Articles List */}
      <div className="space-y-5">
        {WRITING_DATA.map((article) => (
          <button
            type="button" aria-haspopup="dialog"
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="emerald-card w-full text-left rounded-xl p-6 md:p-7 cursor-pointer group flex flex-col justify-between transition-all duration-300"
          >
            <div>
              {/* Category & Platform Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
                  style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--emerald-secondary)' }}
                >
                  {article.category}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>•</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {article.platform}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>•</span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              {/* Title */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-serif text-2xl md:text-[25px] font-medium transition-colors leading-snug" style={{ color: 'var(--emerald-primary)' }}>
                  {article.title}
                </h3>
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0 group-hover:scale-110"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--emerald-primary)',
                  }}
                >
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Description */}
              <p className="text-[15.5px] md:text-[16px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span className="text-xs font-medium flex items-center gap-1 group-hover:underline" style={{ color: 'var(--emerald-primary)' }}>
                <BookOpen className="w-3.5 h-3.5" />
                Read Article Preview
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {article.date}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
