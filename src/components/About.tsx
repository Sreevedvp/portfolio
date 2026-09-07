import React from 'react';
import { HERO_DATA } from '../data/portfolioData';
import { ShieldCheck, Cpu, Zap, Layers } from 'lucide-react';

export const About: React.FC = () => {
  const principles = [
    { icon: <Layers className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />, title: "Modular Decoupling", description: "Isolating domain logic into independently deployable micro-frontends and robust packages." },
    { icon: <Zap className="w-4 h-4" style={{ color: 'var(--accent-tertiary)' }} />, title: "60 FPS Execution", description: "Profiling heap allocations, eliminating memory leaks, and crafting high-density visualizers." },
    { icon: <Cpu className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />, title: "Systems Precision", description: "Leveraging Rust and async concurrency to build zero-overhead backends and microservices." },
    { icon: <ShieldCheck className="w-4 h-4" style={{ color: 'var(--neon-blue)' }} />, title: "Infrastructure as Code", description: "Orchestrating resilient deployments with Kubernetes, Helm, and rigid CI/CD approval gates." },
  ];

  return (
    <section id="about" className="scroll-mt-24 space-y-8 relative">
      <span className="section-number">01</span>
      <div className="pb-4 flex items-baseline justify-between" style={{ borderBottom: '1px solid var(--border-hover)' }}>
        <h2 className="font-heading text-3xl md:text-[34px] font-bold" style={{ color: 'var(--text-primary)' }}>About</h2>
        <span className="text-xs font-mono tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>02 / Philosophy</span>
      </div>
      <div className="space-y-5 text-base md:text-[17px] leading-relaxed max-w-3xl">
        <p style={{ color: 'var(--text-primary)' }}>{HERO_DATA.fullBio}</p>
        <p style={{ color: 'var(--text-secondary)' }}>{HERO_DATA.secondaryBio}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {principles.map((p, idx) => (
          <div key={idx} className="miles-card holo-border p-5 rounded-xl group">
            <div className="relative z-10 flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-md" style={{ backgroundColor: 'var(--surface-hover)' }}>{p.icon}</div>
              <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
            </div>
            <p className="relative z-10 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
