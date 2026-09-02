import React from 'react';
import { PROJECT_SECTIONS } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { ArrowUpRight, Code, Layers, Sparkles } from 'lucide-react';

interface ProjectsWorkProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const ProjectsWork: React.FC<ProjectsWorkProps> = ({ onSelectProject }) => {
  return (
    <div id="work" className="space-y-[100px]">
      {PROJECT_SECTIONS.map((section, sIdx) => (
        <section key={section.id} className="scroll-mt-24 space-y-8">
          {/* Section Heading */}
          <div className="border-b border-[#004c22]/15 pb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
              {section.title}
            </h2>
            <span className="text-xs font-mono text-[#707a6f] tracking-wider uppercase">
              0{sIdx + 2} // Domain
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {section.items.map((item) => {
              const isFull = item.fullWidth;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectProject(item)}
                  className={`emerald-card rounded-xl p-7 md:p-8 cursor-pointer group flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isFull ? 'md:col-span-2' : ''
                  }`}
                >
                  {/* Subtle top-right accent hover glow */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#86efac]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-serif text-2xl md:text-[25px] font-medium text-[#004c22] group-hover:text-[#064e3b] transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <div className="w-8 h-8 rounded-full bg-[#f4fbf4] border border-[#004c22]/10 flex items-center justify-center text-[#004c22] group-hover:bg-[#004c22] group-hover:text-white transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    <p className="text-[#404940] text-[15.5px] md:text-[16px] leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Tags & Deep Dive Trigger */}
                  <div className="pt-4 border-t border-[#004c22]/8 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4fbf4] text-[#006d3e] font-medium border border-[#004c22]/8"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-medium text-[#004c22] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>View Architecture</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
