import React, { useState } from 'react';
import { CORE_STACK_CATEGORIES, CORE_STACK_LIST } from '../data/portfolioData';
import { 
  Code2, 
  Cpu, 
  LineChart, 
  Radio, 
  Boxes, 
  Server, 
  Sparkles,
  LayoutGrid,
  List
} from 'lucide-react';

export const CoreStack: React.FC = () => {
  const [viewMode, setViewMode] = useState<'bento' | 'list'>('bento');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'code':
        return <Code2 className="w-5 h-5 text-[#006d3e]" />;
      case 'memory':
        return <Cpu className="w-5 h-5 text-[#006d3e]" />;
      case 'monitoring':
        return <LineChart className="w-5 h-5 text-[#006d3e]" />;
      case 'sync_alt':
        return <Radio className="w-5 h-5 text-[#006d3e]" />;
      case 'account_tree':
        return <Boxes className="w-5 h-5 text-[#006d3e]" />;
      case 'dns':
        return <Server className="w-5 h-5 text-[#006d3e]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#006d3e]" />;
    }
  };

  return (
    <section id="stack" className="scroll-mt-24 space-y-8">
      {/* Section Header */}
      <div className="border-b border-[#004c22]/15 pb-4 flex items-center justify-between">
        <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
          Core Stack
        </h2>
        
        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-[#eef5ee] p-1 rounded-lg border border-[#004c22]/10">
          <button
            onClick={() => setViewMode('bento')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'bento'
                ? 'bg-white text-[#004c22] shadow-xs'
                : 'text-[#404940] hover:text-[#004c22]'
            }`}
            title="Bento Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bento Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-[#004c22] shadow-xs'
                : 'text-[#404940] hover:text-[#004c22]'
            }`}
            title="Concise List View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {/* Bento Grid View (Image 4) */}
      {viewMode === 'bento' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_STACK_CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="emerald-card p-6 rounded-xl flex flex-col justify-between gap-4 cursor-default group"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#eef5ee] group-hover:bg-[#8cf5b2]/30 flex items-center justify-center transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-[11px] font-mono text-[#707a6f] bg-[#f4fbf4] px-2 py-0.5 rounded border border-[#004c22]/10">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-medium text-[#004c22] mb-1">
                  {cat.title}
                </h3>
                <p className="text-sm text-[#404940] leading-snug mb-3 font-normal">
                  {cat.subtitle}
                </p>

                {/* Sub-item pills */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#004c22]/5">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#f4fbf4] text-[#006d3e] font-medium border border-[#004c22]/8"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Concise Card List View (Image 2) */
        <div className="emerald-card rounded-xl p-8 shadow-[0_4px_20px_rgba(0,76,34,0.04)]">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {CORE_STACK_LIST.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 py-1 group">
                <span className="w-2 h-2 rounded-full bg-[#006d3e] group-hover:scale-150 transition-transform" />
                <span className="text-[16px] text-[#161d19] font-normal group-hover:text-[#004c22] transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
