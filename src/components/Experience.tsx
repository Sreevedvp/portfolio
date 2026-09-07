import React from 'react';
import { EXPERIENCE_DATA } from '../data/portfolioData';
import { Calendar, MapPin } from 'lucide-react';

export const Experience: React.FC = () => {
  return (
    <section id="experience" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="pb-4 flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--border-hover)' }}>
        <h2 className="font-serif text-3xl md:text-[32px] font-medium" style={{ color: 'var(--emerald-primary)' }}>
          Experience
        </h2>
        <span className="text-xs font-mono tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          05 // Career
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {EXPERIENCE_DATA.map((exp, idx) => (
          <div
            key={idx}
            className="relative pl-6 sm:pl-8 space-y-4"
            style={{ borderLeft: '2px solid var(--border-hover)' }}
          >
            {/* Timeline node */}
            <div
              className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full"
              style={{
                backgroundColor: 'var(--emerald-primary)',
                boxShadow: '0 0 0 4px var(--bg-primary)',
              }}
            />

            {/* Header info */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-serif text-2xl font-medium" style={{ color: 'var(--emerald-primary)' }}>
                  {exp.company}
                </h3>
                <p className="text-xs font-semibold tracking-wider uppercase mt-0.5" style={{ color: 'var(--emerald-secondary)' }}>
                  {exp.role}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
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
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
              {exp.summary}
            </p>

            {/* Accomplishments Bullets */}
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <ul className="space-y-3">
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold mt-0.5 shrink-0 text-xs" style={{ color: 'var(--emerald-secondary)' }}>▸</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies Pill Row */}
              <div className="mt-6 pt-4 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--border-color)' }}>
                {exp.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--emerald-primary)',
                      borderColor: 'var(--border-color)',
                    }}
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
