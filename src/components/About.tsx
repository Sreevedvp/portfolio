import React from 'react';
import { HERO_DATA } from '../data/portfolioData';
import { ShieldCheck, Cpu, Zap, Layers } from 'lucide-react';

export const About: React.FC = () => {
  const principles = [
    {
      icon: <Layers className="w-4 h-4 text-[#004c22]" />,
      title: "Modular Decoupling",
      description: "Isolating domain logic into independently deployable micro-frontends and robust packages."
    },
    {
      icon: <Zap className="w-4 h-4 text-[#004c22]" />,
      title: "60 FPS Execution",
      description: "Profiling heap allocations, eliminating memory leaks, and crafting high-density visualizers."
    },
    {
      icon: <Cpu className="w-4 h-4 text-[#004c22]" />,
      title: "Systems Precision",
      description: "Leveraging Rust and async concurrency to build zero-overhead backends and microservices."
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-[#004c22]" />,
      title: "Infrastructure as Code",
      description: "Orchestrating resilient deployments with Kubernetes, Helm, and rigid CI/CD approval gates."
    }
  ];

  return (
    <section id="about" className="scroll-mt-24 space-y-8">
      <div className="border-b border-[#004c22]/15 pb-4 flex items-baseline justify-between">
        <h2 className="font-serif text-3xl md:text-[32px] font-medium text-[#004c22]">
          About
        </h2>
        <span className="text-xs font-mono text-[#707a6f] tracking-wider uppercase">
          01 // Philosophy
        </span>
      </div>

      <div className="space-y-6 text-[#161d19] text-base md:text-[17px] leading-relaxed max-w-3xl">
        <p className="text-[#161d19] font-normal leading-[1.7]">
          {HERO_DATA.fullBio}
        </p>
        <p className="text-[#404940] leading-[1.7]">
          {HERO_DATA.secondaryBio}
        </p>
      </div>

      {/* Engineering Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {principles.map((p, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white/70 border border-[#004c22]/8 hover:border-[#004c22]/20 hover:bg-white transition-all duration-200 shadow-[0_2px_12px_rgba(0,76,34,0.03)] group"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-md bg-[#eef5ee] group-hover:bg-[#8cf5b2]/30 transition-colors">
                {p.icon}
              </div>
              <h3 className="font-serif text-lg font-medium text-[#004c22]">
                {p.title}
              </h3>
            </div>
            <p className="text-sm text-[#404940] leading-relaxed">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
