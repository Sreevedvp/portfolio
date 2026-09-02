import React from 'react';
import { X, Clock, Share2, BookOpen, ArrowLeft } from 'lucide-react';
import { ArticleItem } from '../types';

interface ArticleModalProps {
  article: ArticleItem | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#004c22]/15 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#004c22]/10 bg-[#f4fbf4]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#eef5ee] text-[#006d3e] text-xs font-semibold">
              {article.category}
            </span>
            <span className="text-xs text-[#707a6f]">• {article.platform}</span>
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
            <h2 className="font-serif text-3xl font-medium text-[#004c22] leading-tight mb-3">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#707a6f] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              <span>•</span>
              <span>Published {article.date}</span>
            </div>
          </div>

          <p className="text-base text-[#404940] italic border-l-2 border-[#006d3e] pl-4 py-1 bg-[#f4fbf4]">
            {article.summary}
          </p>

          <div className="prose text-[#161d19] text-base leading-relaxed space-y-4">
            {article.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#004c22]/10 bg-[#f4fbf4] flex justify-between items-center text-xs text-[#707a6f]">
          <span>Article by Sreeved V P</span>
          <button
            onClick={onClose}
            className="text-[#004c22] font-semibold hover:underline"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};
