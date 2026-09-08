import React from 'react';
import { ArrowUpRight, Rss, RefreshCw, BookOpen } from 'lucide-react';
import type { ArticleItem } from '../types';
import { MEDIUM_PROFILE } from '../services/medium';
interface WritingProps { articles: ArticleItem[]; loading: boolean; error: boolean; updatedAt: number; onRefresh: () => void; }
export const Writing: React.FC<WritingProps> = ({ articles, loading, error, updatedAt, onRefresh }) => (
  <section id="writing" className="scroll-mt-24 space-y-8">
    <div className="comic-section-heading"><div><p className="comic-label">06 / FRESH FROM MEDIUM</p><h2 className="comic-heading chromatic">NOTES FROM <em>THE NETWORK.</em></h2></div><div className="writing-feed-meta"><a href={MEDIUM_PROFILE} target="_blank" rel="noreferrer"><Rss size={16} />Follow on Medium <ArrowUpRight size={15} /></a><div role="status" className="feed-status"><span className={error ? 'feed-dot stale' : 'feed-dot'} />{loading ? 'Checking for new stories…' : error ? 'Showing saved stories' : updatedAt ? 'Latest stories from Medium' : 'Recent stories from Medium'}</div>{error && <button type="button" onClick={onRefresh} disabled={loading}><RefreshCw size={14} />Retry sync</button>}</div></div>
    {articles.length > 0 ? <div className="comic-writing-grid">{articles.slice(0, 6).map((article, index) => <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className={`writing-story emerald-card accent-${index % 4}`}><div className="writing-story-top"><span>{article.category}</span><span>0{index + 1}</span></div><h3>{article.title}</h3><p>{article.summary}</p><div className="writing-story-footer"><span><BookOpen size={14} />Read on Medium <ArrowUpRight size={14} /></span><time dateTime={article.publishedAt}>{article.date}</time></div></a>)}</div> : <div className="writing-empty"><Rss size={24} /><h3>New stories are on their way.</h3><p>My next Medium article will appear here automatically.</p></div>}
    <a className="secondary-button writing-all" href={MEDIUM_PROFILE} target="_blank" rel="noreferrer">All stories on Medium <ArrowUpRight size={16} /></a>
  </section>
);
