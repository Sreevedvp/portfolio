import { useEffect, useState, useCallback, useRef } from 'react';
import type { ArticleItem } from '../types';
import snapshot from '../data/medium-snapshot.json';
import { fetchMediumArticles, FEED_REFRESH_MS, mediumUrl } from '../services/medium';

const CACHE_KEY = 'portfolio-medium-v1';
function initialArticles(): { articles: ArticleItem[]; updatedAt: number } {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (data && Array.isArray(data.articles) && data.articles.every((a: ArticleItem) => mediumUrl(a.url) && typeof a.title === 'string' && typeof a.summary === 'string' && typeof a.id === 'string' && typeof a.date === 'string' && typeof a.category === 'string' && typeof a.platform === 'string' && Array.isArray(a.content) && a.content.every(text => typeof text === 'string')) && Number.isFinite(data.updatedAt) && data.updatedAt <= Date.now() && Date.now() - data.updatedAt < 7 * 86400000) return data;
  } catch { /* Cached stories are optional. */ }
  return { articles: snapshot.articles as ArticleItem[], updatedAt: 0 };
}
export function useMediumArticles() {
  const [data, setData] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const updatedRef = useRef(data.updatedAt);
  const requestRef = useRef<AbortController | null>(null);
  const refresh = useCallback(async (force = false) => {
    if (requestRef.current || (!force && Date.now() - updatedRef.current < FEED_REFRESH_MS)) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    const timeout = setTimeout(() => controller.abort('timeout'), 12000);
    try {
      const articles = await fetchMediumArticles(controller.signal);
      if (controller.signal.aborted) return;
      const next = { articles, updatedAt: Date.now() };
      updatedRef.current = next.updatedAt;
      setData(next); setError(false);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* Still show fresh stories. */ }
    } catch {
      if (controller.signal.reason !== 'unmount') setError(true);
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
      if (controller.signal.reason !== 'unmount') setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const onVisible = () => { if (!document.hidden) void refresh(); };
    const timer = setInterval(onVisible, FEED_REFRESH_MS);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      requestRef.current?.abort('unmount'); requestRef.current = null;
    };
  }, [refresh]);
  return { ...data, loading, error, refresh };
}
