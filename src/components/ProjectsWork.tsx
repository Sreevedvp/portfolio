import React from 'react';
import { PROJECT_SECTIONS } from '../data/portfolioData';
import { ProjectItem } from '../types';
import { ArrowUpRight, ArrowRight, Layers, Box, GitBranch, Terminal } from 'lucide-react';

interface ProjectsWorkProps { onSelectProject: (project: ProjectItem) => void; }
const featuredIds = ['angular-mfe', 'd3-three-engine', 'rust-retrieval', 'k8s-helm'];
const projects = PROJECT_SECTIONS.flatMap(section => section.items);

function ProjectVisual({ index }: { index: number }) {
  if (index === 1 || index === 2) return <div className="comic-project-image"><img loading="lazy" src={`${import.meta.env.BASE_URL}assets/comic/${index === 1 ? 'network' : 'radar'}.jpg`} alt={index === 1 ? 'Concept artwork of a neon data visualization interface' : 'Concept artwork of a real-time systems radar'} width="720" height="420" /><span className="comic-preview-note">CONCEPT VISUAL // {index === 1 ? 'DATA IN MOTION' : 'SYSTEMS ONLINE'}</span></div>;
  const deployment = index === 3;
  return <div className={`comic-diagram ${deployment ? 'diagram-pipeline' : ''}`} aria-label={deployment ? 'Deployment flow from source to pipeline to cluster' : 'Micro-frontend architecture with a shared shell and independent apps'}>
    <div className="diagram-topline"><span>{deployment ? 'DEPLOYMENT CONTROL' : 'NX / MODULE FEDERATION'}</span><span>● LIVE ARCHITECTURE</span></div>
    <div className="diagram-root">{deployment ? <GitBranch size={24} /> : <Layers size={24} />}<span>{deployment ? 'GITLAB CI/CD' : 'APPLICATION SHELL'}</span></div>
    <div className="diagram-connectors" aria-hidden="true" />
    <div className="diagram-children">{(deployment ? ['BUILD', 'VALIDATE', 'DEPLOY'] : ['ANALYTICS', 'WORKSPACE', 'SHARED UI']).map(label => <span key={label}><Box size={18} />{label}</span>)}</div>
    <div className="diagram-bottom"><Terminal size={13} /><span>{deployment ? 'helm upgrade → rolling deployment' : 'Independent domains. Shared foundations.'}</span><ArrowRight size={14} /></div>
  </div>;
}

export const ProjectsWork: React.FC<ProjectsWorkProps> = ({ onSelectProject }) => (
  <section id="work" className="comic-work">
    <div className="comic-section-heading"><div><p className="comic-label yellow">02 / FIELD NOTES FROM THE BUILD</p><h2 className="comic-heading chromatic">FEATURED <em>MISSIONS & LABS</em></h2></div><p>Scalable platforms, real-time interfaces, and the systems that keep them running. A few problems I've enjoyed solving.</p></div>
    <div className="comic-project-grid">{featuredIds.map((id,index) => { const item=projects.find(project => project.id === id)!; return <button type="button" key={id} id={`project-${id}`} className={`comic-project accent-${index}`} onClick={() => onSelectProject(item)} aria-haspopup="dialog"><div className="comic-project-top"><span>MISSION 0{index + 1} / {item.tags?.[0]}</span><ArrowUpRight size={17} /></div><ProjectVisual index={index} /><div className="comic-project-body"><div className="comic-project-tags">{item.tags?.slice(0,3).map(tag => <span key={tag}>{tag}</span>)}</div><h3>{item.title}</h3><p>{item.description}</p><div className="comic-project-bottom"><span>{item.architectureDetails?.metrics?.[0]}</span><span>OPEN CASE STUDY ↗</span></div></div></button>; })}</div>
    <details className="comic-more-work"><summary>MORE FROM THE ARCHIVE <span>{projects.length - featuredIds.length} MORE PROJECTS <span aria-hidden="true">＋</span></span></summary><div className="comic-archive-grid">{projects.filter(item => !featuredIds.includes(item.id)).map(item => <button type="button" key={item.id} id={`project-${item.id}`} onClick={() => onSelectProject(item)} aria-haspopup="dialog"><span className="comic-issue">{item.tags?.[0]}</span><h3>{item.title} <ArrowUpRight size={17} /></h3><p>{item.description}</p></button>)}</div></details>
  </section>
);
