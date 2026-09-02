import React from 'react';
import { EXPERIENCE_DATA } from '../data/portfolioData';
import { Briefcase, ChevronRight, Calendar, MapPin } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="border-b border-[#004c22]/15 pb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
          Experience
        </h2>
        <span className="text-xs font-mono text-[#707a6f] tracking-wider uppercase">
          07 // Career
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {EXPERIENCE_DATA.map((exp, idx) => (
          <div
            key={idx}
            className="relative pl-6 sm:pl-8 border-l-2 border-[#004c22]/20 space-y-4"
          >
            {/* Timeline node */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#004c22] ring-4 ring-[#f4fbf4]" />

            {/* Header info */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-serif text-2xl font-medium text-[#004c22]">
                  {exp.company}
                </h3>
                <p className="text-xs font-semibold text-[#006d3e] tracking-wider uppercase mt-0.5">
                  {exp.role}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#707a6f] font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {exp.period}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {exp.location}
                </span>
              </div>
            </div>

            {/* Role Summary */}
            <p className="text-sm text-[#404940] leading-relaxed italic">
              {exp.summary}
            </p>

            {/* Accomplishments Bullets */}
            <div className="bg-white/80 rounded-xl p-6 border border-[#004c22]/8 shadow-[0_2px_12px_rgba(0,76,34,0.03)]">
              <ul className="space-y-3">
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2.5 text-[15px] text-[#161d19] leading-relaxed">
                    <span className="text-[#006d3e] font-bold mt-0.5 shrink-0 text-xs">▸</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies Pill Row */}
              <div className="mt-6 pt-4 border-t border-[#004c22]/8 flex flex-wrap gap-1.5">
                {exp.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4fbf4] text-[#004c22] font-medium border border-[#004c22]/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
