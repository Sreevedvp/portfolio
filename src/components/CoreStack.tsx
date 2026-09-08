import React, { useState, useRef, useCallback } from 'react';
import { CORE_STACK_CATEGORIES, CORE_STACK_LIST } from '../data/portfolioData';
import { Code2, Cpu, LineChart, Radio, Boxes, Server, Sparkles, LayoutGrid, List } from 'lucide-react';

const CATEGORY_COLORS = [
  'var(--accent-primary)',    // Frameworks — red
  'var(--accent-secondary)',  // Systems — purple
  'var(--neon-blue)',         // Visualization — cyan
  'var(--accent-tertiary)',   // Real-time — magenta
  'var(--neon-purple)',       // Architecture — violet
  'var(--accent-primary)',    // Infra — red
];

const TiltCard: React.FC<{ children: React.ReactNode; className?: string; accentColor: string }> = ({ children, className = '', accentColor }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card || document.documentElement.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  }, []);

  return (
    <div ref={cardRef} className={`tilt-card relative ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', '--tilt-accent': accentColor } as React.CSSProperties}>
      <div className="tilt-card-shine" />
      {children}
    </div>
  );
};

export const CoreStack: React.FC = () => {
  const [viewMode, setViewMode] = useState<'bento' | 'list'>('bento');

  const getCategoryIcon = (iconName: string, color: string) => {
    const style = { color };
    switch (iconName) {
      case 'code': return <Code2 className="w-5 h-5" style={style} />;
      case 'memory': return <Cpu className="w-5 h-5" style={style} />;
      case 'monitoring': return <LineChart className="w-5 h-5" style={style} />;
      case 'sync_alt': return <Radio className="w-5 h-5" style={style} />;
      case 'account_tree': return <Boxes className="w-5 h-5" style={style} />;
      case 'dns': return <Server className="w-5 h-5" style={style} />;
      default: return <Sparkles className="w-5 h-5" style={style} />;
    }
  };

  return (
    <section id="stack" className="scroll-mt-24 space-y-8 relative">
      <p className="comic-label">03 / TOOLS OF THE TRADE</p>
      <div className="pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-hover)' }}>
        <h2 className="comic-heading" style={{ color: 'var(--text-primary)' }}>WEAPONS OF <em>CREATIVE CHOICE.</em></h2>
        <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--border-color)' }}>
          <button aria-label="Grid view" aria-pressed={viewMode === 'bento'} onClick={() => setViewMode('bento')} className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all"
            style={{ backgroundColor: viewMode === 'bento' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'bento' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            <LayoutGrid className="w-3.5 h-3.5" /><span className="hidden sm:inline">Grid</span>
          </button>
          <button aria-label="List view" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')} className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all"
            style={{ backgroundColor: viewMode === 'list' ? 'var(--bg-card)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            <List className="w-3.5 h-3.5" /><span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {viewMode === 'bento' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_STACK_CATEGORIES.map((cat, idx) => {
            const accent = CATEGORY_COLORS[idx] || 'var(--accent-primary)';
            return (
              <TiltCard key={idx} className="miles-card miles-card-stripe p-6 rounded-xl flex flex-col justify-between gap-4 cursor-default" accentColor={accent}>
                <div className="relative z-10 flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-hover)' }}>
                    {getCategoryIcon(cat.icon, accent)}
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded border" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>0{idx + 1}</span>
                </div>
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl font-bold mb-2" style={{ color: accent }}>{cat.title}</h3>
                  <p className="text-sm leading-snug mb-3" style={{ color: 'var(--text-secondary)' }}>{cat.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {cat.items.map((item, iIdx) => (
                      <span key={iIdx} className="text-xs px-2 py-0.5 rounded font-medium border"
                        style={{ backgroundColor: 'var(--bg-primary)', color: accent, borderColor: 'var(--border-color)' }}>{item}</span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      ) : (
        <div className="miles-card rounded-xl p-8">
          <ul className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {CORE_STACK_LIST.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 py-1 group">
                <span className="w-2 h-2 rounded-full group-hover:scale-150 transition-transform" style={{ backgroundColor: 'var(--accent-primary)' }} />
                <span className="text-[16px] group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
