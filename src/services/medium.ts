import type { ArticleItem } from '../types';

export const MEDIUM_PROFILE = 'https://medium.com/@sreevedvp';
export const MEDIUM_FEED = 'https://medium.com/feed/@sreevedvp';
export const MEDIUM_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED)}`;
export const FEED_REFRESH_MS = 10 * 60 * 1000;

export function plainText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const entities: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
  return value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return entities[entity] ?? match;
    const code = entity.startsWith('#x') ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '';
  }).replace(/\s+/g, ' ').trim();
}

export function mediumUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !(url.hostname === 'medium.com' || url.hostname.endsWith('.medium.com')) || url.username || url.password) return null;
    url.search = ''; url.hash = '';
    return url.href;
  } catch { return null; }
}

export function parseMediumFeed(payload: unknown): ArticleItem[] {
  const data = payload as { status?: string; items?: Record<string, unknown>[] };
  if (!data || data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('Medium feed is unavailable.');
  const unique = new Map<string, ArticleItem>();
  for (const item of data.items.slice(0, 30)) {
    const url = mediumUrl(item.link);
    const title = plainText(item.title).slice(0, 250);
    const rawDate = typeof item.pubDate === 'string' ? item.pubDate : '';
    const published = new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(rawDate) ? rawDate.replace(' ', 'T') + 'Z' : rawDate);
    if (!url || !title || !Number.isFinite(published.getTime())) continue;
    const text = plainText(item.description || item.content).replace(title, '').trim();
    const summary = text.length > 220 ? text.slice(0, 220).replace(/\s+\S*$/, '') + '…' : text;
    unique.set(url, { id: url, title, url, publishedAt: published.toISOString(), category: Array.isArray(item.categories) ? plainText(item.categories[0]) || 'Engineering' : 'Engineering', platform: 'Medium', readTime: '', date: published.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }), summary: summary || 'Read the full story on Medium.', content: [summary || 'Read the full story on Medium.'] });
  }
  if (data.items.length > 0 && unique.size === 0) throw new Error('Medium returned no readable stories.');
  return [...unique.values()].sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
}

export async function fetchMediumArticles(signal?: AbortSignal): Promise<ArticleItem[]> {
  const response = await fetch(MEDIUM_ENDPOINT, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Medium could not be reached.');
  return parseMediumFeed(await response.json());
}
