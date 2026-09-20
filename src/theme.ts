export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#fbe4e4' : '#241d1e');
  try { localStorage.setItem('portfolio-editorial-theme', next); } catch { /* Theme still works when storage is unavailable. */ }
  window.dispatchEvent(new Event('portfolio-theme-change'));
}
