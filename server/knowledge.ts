import { createHash } from 'node:crypto';
import { HERO_DATA, CORE_STACK_LIST, CORE_STACK_CATEGORIES, PROJECT_SECTIONS, EXPERIENCE_DATA } from '../src/data/portfolioData';
import snapshot from '../src/data/medium-snapshot.json';
import personal from '../knowledge/personal.json';

export interface KnowledgeDocument { id: string; title: string; text: string; url?: string }
export interface KnowledgeChunk { id: string; data: string; metadata: { title: string; url?: string } }

export function personalDocuments(value: unknown): KnowledgeDocument[] {
  if (!Array.isArray(value)) throw new Error('knowledge/personal.json must contain an array.');
  return value.map((doc, index) => {
    if (!doc || typeof doc.title !== 'string' || !doc.title.trim() || doc.title.length > 150 ||
        typeof doc.text !== 'string' || !doc.text.trim() || doc.text.length > 50000 ||
        (doc.url !== undefined && !safeSourceUrl(doc.url))) {
      throw new Error(`Invalid personal knowledge entry ${index + 1}. Use title, text, and an optional HTTPS URL or section anchor.`);
    }
    return { id: `personal-${index}`, title: doc.title.trim(), text: doc.text.trim(), url: doc.url };
  });
}

export function safeSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (/^#[a-z][a-z0-9-]*$/i.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}

export const documents: KnowledgeDocument[] = [
  { id: 'profile', title: 'About Sreeved', url: '#about', text: [HERO_DATA.name, HERO_DATA.title, HERO_DATA.shortBio, HERO_DATA.fullBio, HERO_DATA.secondaryBio].join('\n') },
  { id: 'contact', title: 'Contact & profiles', url: '#hero', text: `${HERO_DATA.name} is based in ${HERO_DATA.location}. Public email: ${HERO_DATA.email}.\n${Object.entries(HERO_DATA.socials).filter(([, url]) => url).map(([name, url]) => `${name}: ${url}`).join('\n')}` },
  { id: 'skills', title: 'Technical skills', url: '#stack', text: `${HERO_DATA.name}'s technical skills:\n${CORE_STACK_LIST.join('\n')}\n${CORE_STACK_CATEGORIES.map(category => `${category.title}: ${category.items.join(', ')}`).join('\n')}` },
  ...EXPERIENCE_DATA.map((job, i) => ({ id: `experience-${i}`, title: `${job.role} at ${job.company}`, url: '#experience', text: `${HERO_DATA.name}: ${job.role} at ${job.company}, ${job.period}, ${job.location}.\n${job.summary}\n${job.achievements.join('\n')}\nSkills: ${job.skills.join(', ')}` })),
  ...PROJECT_SECTIONS.flatMap(section => section.items.map(project => ({
    id: `project-${project.id}`, title: project.title, url: '#work',
    text: `${HERO_DATA.name}'s project: ${project.title}\n${project.description}\nTechnologies: ${project.tags?.join(', ') ?? ''}\n${project.architectureDetails ? ['Challenge: ' + project.architectureDetails.challenge, 'Solution: ' + project.architectureDetails.solution, 'Outcome: ' + project.architectureDetails.outcome, 'Technologies: ' + project.architectureDetails.technologies.join(', '), 'Metrics: ' + (project.architectureDetails.metrics?.join(', ') ?? '')].join('\n') : ''}`,
  }))),
  ...snapshot.articles.map((article, i) => ({ id: `writing-${i}`, title: article.title, url: article.url, text: `${HERO_DATA.name} published this Medium article on ${article.date}: ${article.title}.\nTopic: ${article.category}.\nPublic excerpt (not the full article): ${article.summary}` })),
  ...personalDocuments(personal),
];

// Conservative chunks fit the hosted embedding model's input window. No filesystem crawl:
// only the explicitly listed public content above can reach the vector store.
export function chunkDocuments(docs: KnowledgeDocument[]): KnowledgeChunk[] {
  return docs.flatMap(doc => {
    const chunks: KnowledgeChunk[] = [];
    const words = doc.text.trim().split(/\s+/);
    let data = '';
    for (const word of words) {
      // Split even unusually long words instead of silently truncating source text.
      for (let offset = 0; offset < word.length; offset += 900) {
        const part = word.slice(offset, offset + 900);
        if (data.length + part.length + 1 > 1100) { chunks.push(makeChunk(doc, chunks.length, data)); data = ''; }
        data += (data ? ' ' : '') + part;
      }
    }
    if (data) chunks.push(makeChunk(doc, chunks.length, data));
    return chunks;
  });
}
function makeChunk(doc: KnowledgeDocument, index: number, text: string): KnowledgeChunk {
  return { id: `${doc.id}-${index}`, data: `${doc.title}\n${text}`, metadata: { title: doc.title, ...(doc.url ? { url: doc.url } : {}) } };
}
export const knowledgeChunks = chunkDocuments(documents);
// A changed or removed fact gets a new namespace, so an old chunk cannot be retrieved.
export const knowledgeVersion = createHash('sha256').update(JSON.stringify(knowledgeChunks)).digest('hex').slice(0, 16);
export function knowledgeNamespace(prefix = 'sreeved-portfolio') { return `${prefix}-${knowledgeVersion}`; }
