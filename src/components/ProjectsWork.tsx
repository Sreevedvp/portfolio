import React from 'react';
import { PROJECT_SECTIONS } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { ArrowUpRight, Layers, Gauge, Network, Server, Workflow } from 'lucide-react';

interface ProjectsWorkProps { onSelectProject: (project: ProjectItem) => void; }
const icons = [Layers, Gauge, Network, Server, Workflow];
export const ProjectsWork: React.FC<ProjectsWorkProps> = ({ onSelectProject }) => (
  <section id="work" className="space-y-12">
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
      <div><p className="hero-kicker mb-3">01 / Selected work</p><h2 className="text-4xl md:text-5xl">Built for the real world.</h2></div>
      <span className="text-sm text-[var(--text-muted)]">Architecture, performance & everything between.</span>
    </div>
    {PROJECT_SECTIONS.map((section, index) => {
      const Icon = icons[index];
      return <div key={section.id} className="space-y-5">
        <div className="flex items-center gap-3"><Icon size={18} className="text-[var(--accent-primary)]" /><h3 className="!font-sans text-base font-semibold tracking-tight">{section.title}</h3><span className="ml-auto text-xs font-mono text-[var(--text-muted)]">0{index + 1}</span></div>
        <div className="grid md:grid-cols-2 gap-5">
          {section.items.map(item => <button key={item.id} id={`project-${item.id}`} onClick={() => onSelectProject(item)} aria-haspopup="dialog" className={`project-card emerald-card rounded-xl p-6 md:p-8 group flex flex-col ${item.fullWidth ? 'md:col-span-2 !min-h-0' : ''}`}>
            <div className="flex items-start gap-4 justify-between mb-4"><h4 className="text-xl md:text-2xl font-semibold tracking-tight max-w-lg">{item.title}</h4><span className="project-arrow w-9 h-9 rounded-full shrink-0 border border-[var(--border-color)] flex items-center justify-center transition-colors"><ArrowUpRight size={18} /></span></div>
            <p className="text-base leading-relaxed text-[var(--text-secondary)] max-w-3xl mb-6">{item.description}</p>
            {item.architectureDetails?.metrics?.[0] && <p className="project-metric mb-5">↗ {item.architectureDetails.metrics[0]}</p>}
            <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-2">{item.tags?.map(tag => <span key={tag} className="text-xs text-[var(--text-muted)] rounded border border-[var(--border-color)] px-2.5 py-1">{tag}</span>)}</div>
            <span className="text-sm mt-5 text-[var(--accent-primary)]">Explore the architecture <span aria-hidden="true">↗</span></span>
          </button>)}
        </div>
      </div>;
    })}
  </section>
);
