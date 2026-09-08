import { toggleTheme } from '../theme';
import { useDialog } from '../hooks/useDialog';
import { ProjectItem, ArticleItem } from '../types';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ArrowRight, Hash, FileText, Briefcase, Code2, Pen, X } from 'lucide-react';
import { PROJECT_SECTIONS, CORE_STACK_CATEGORIES, EXPERIENCE_DATA } from '../data/portfolioData';

interface CommandPaletteProps {
  articles: ArticleItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onSelectArticle: (article: ArticleItem) => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ articles, isOpen, onClose, onSelectProject, onSelectArticle }) => {
  const dialogRef = useDialog(isOpen, onClose);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build searchable command list
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation sections
    const sections = [
      { name: 'Hero', href: '#hero' },
      { name: 'About', href: '#about' },
      { name: 'Core Stack', href: '#stack' },
      { name: 'Work & Projects', href: '#work' },
      { name: 'D3 Visualizer', href: '#visualizer' },
      { name: 'Experience', href: '#experience' },
      { name: 'Writing', href: '#writing' },
    ];

    sections.forEach(section => {
      items.push({
        id: `nav-${section.name}`,
        label: `Go to ${section.name}`,
        category: 'Navigation',
        icon: <Hash className="w-4 h-4" />,
        action: () => {
          document.querySelector(section.href)?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      });
    });

    // Projects
    PROJECT_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        items.push({
          id: `project-${item.id}`,
          label: item.title,
          category: 'Projects',
          icon: <Code2 className="w-4 h-4" />,
          action: () => {
            onClose();
            onSelectProject(item);
          },
        });
      });
    });

    // Tech Stack
    CORE_STACK_CATEGORIES.forEach(cat => {
      items.push({
        id: `stack-${cat.title}`,
        label: `${cat.title}: ${cat.subtitle}`,
        category: 'Stack',
        icon: <Briefcase className="w-4 h-4" />,
        action: () => {
          document.getElementById('stack')?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      });
    });

    // Experience
    EXPERIENCE_DATA.forEach(exp => {
      items.push({
        id: `exp-${exp.company}`,
        label: `${exp.role} at ${exp.company}`,
        category: 'Experience',
        icon: <Briefcase className="w-4 h-4" />,
        action: () => {
          document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
          onClose();
        },
      });
    });

    // Articles
    articles.forEach(article => {
      items.push({
        id: `article-${article.id}`,
        label: article.title,
        category: 'Writing',
        icon: <Pen className="w-4 h-4" />,
        action: () => {
          onClose();
          onSelectArticle(article);
        },
      });
    });

    // Theme toggle
    items.push({
      id: 'toggle-theme',
      label: 'Toggle Dark / Light Theme',
      category: 'Actions',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        toggleTheme();
        onClose();
      },
    });

    return items;
  }, [articles, onClose, onSelectProject, onSelectArticle]);

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      cmd => cmd.label.toLowerCase().includes(lower) || cmd.category.toLowerCase().includes(lower)
    );
  }, [query, commands]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {


      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, Math.min(prev + 1, filtered.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && e.target === inputRef.current) {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelectorAll<HTMLElement>('[data-command]')[selectedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group by category
  const grouped: Record<string, CommandItem[]> = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Palette */}
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search portfolio" tabIndex={-1}
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl border overflow-hidden animate-slide-up"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-hover)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            aria-label="Search projects, skills, and sections"
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, skills, sections…"
            className="flex-1 bg-transparent text-base outline-none placeholder:opacity-50"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono border"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {category}
                  </span>
                </div>
                {items.map(item => {
                  const idx = globalIdx++;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-command="true"
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors"
                      style={{
                        background: isSelected ? 'var(--surface-hover)' : 'transparent',
                        color: isSelected ? 'var(--emerald-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ color: 'var(--emerald-secondary)' }}>{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--emerald-primary)' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-2.5 border-t text-[11px] flex items-center justify-between" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          <span>↑↓ Navigate · ↵ Select · Esc Close</span>
          <span className="font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
};
