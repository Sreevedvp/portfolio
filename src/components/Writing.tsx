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
      <div className="border-b border-[#004c22]/15 pb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
          Writing
        </h2>
        <span className="text-xs font-mono text-[#707a6f] tracking-wider uppercase">
          08 // Publication
        </span>
      </div>

      {/* Articles List */}
      <div className="space-y-5">
        {WRITING_DATA.map((article) => (
          <div
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="emerald-card rounded-xl p-6 md:p-7 cursor-pointer group flex flex-col justify-between transition-all duration-300"
          >
            <div>
              {/* Category & Platform Tag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-[#eef5ee] text-[#006d3e] rounded-full text-xs font-semibold tracking-wider">
                  {article.category}
                </span>
                <span className="text-[#404940] text-sm">•</span>
                <span className="text-xs font-medium text-[#404940]">
                  {article.platform}
                </span>
                <span className="text-[#404940] text-sm">•</span>
                <span className="text-xs text-[#707a6f] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              {/* Title */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-serif text-2xl md:text-[25px] font-medium text-[#004c22] group-hover:text-[#006d3e] transition-colors leading-snug">
                  {article.title}
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#f4fbf4] border border-[#004c22]/10 flex items-center justify-center text-[#004c22] group-hover:bg-[#004c22] group-hover:text-white transition-all shrink-0">
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Description */}
              <p className="text-[#404940] text-[15.5px] md:text-[16px] leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#004c22]/5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#004c22] flex items-center gap-1 group-hover:underline">
                <BookOpen className="w-3.5 h-3.5" />
                Read Article Preview
              </span>
              <span className="text-xs text-[#707a6f] font-mono">
                {article.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
