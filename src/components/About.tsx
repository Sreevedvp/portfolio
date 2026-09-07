import React from 'react';
import { HERO_DATA } from '../data/portfolioData';
import { ShieldCheck, Cpu, Zap, Layers } from 'lucide-react';
export const About: React.FC = () => {
  const principles = [
    { icon: Layers, title: 'Modular by design', description: 'Independent domains. Shared foundations. Interfaces that grow with the product.', tags: ['MICRO-FRONTENDS', 'DESIGN SYSTEMS', 'WEB COMPONENTS'] },
    { icon: Zap, title: 'Fast by intention', description: 'Smooth rendering, stable memory, and real-time data that never gets in the way.', tags: ['RENDERING', 'PROFILING', 'REAL-TIME UI'] },
    { icon: Cpu, title: 'Systems underneath', description: 'Memory-safe services and async concurrency behind every responsive experience.', tags: ['RUST', 'TOKIO', 'AXUM'] },
    { icon: ShieldCheck, title: 'Ready to ship', description: 'Repeatable deployments and reliable pipelines, from the first commit to production.', tags: ['KUBERNETES', 'HELM', 'CI/CD'] },
  ];
  return <section id="about" className="comic-about"><div className="comic-section-heading"><div><p className="comic-label">01 / THE PERSON BEHIND THE PIXELS</p><h2 className="comic-heading">FRONTEND CRAFT.<br /><em>SYSTEMS THINKING.</em></h2></div><p>{HERO_DATA.fullBio}</p></div><div className="comic-principles">{principles.map(({ icon: Icon, title, description, tags },index) => <div key={title} className={`comic-principle accent-${index}`}><div className="comic-principle-title"><span>0{index + 1} / ENGINEERING DNA</span><Icon size={18} /></div><h3>{title}</h3><p>{description}</p><div>{tags.map(tag => <span key={tag} className="comic-principle-tag"><i />{tag}</span>)}</div></div>)}</div><p className="comic-about-note">{HERO_DATA.secondaryBio}</p></section>;
};
