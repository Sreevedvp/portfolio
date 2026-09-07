export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f5f3ee' : '#0a0a0f');
  try { localStorage.setItem('portfolio-theme', next); } catch { /* Theme still works when storage is unavailable. */ }
  window.dispatchEvent(new Event('portfolio-theme-change'));
}
