// Dark / light site theme. The inline script in <head> applies the saved choice
// before first paint; this wires up the switcher and remembers the choice.
const KEY = 'arte:site';

export function getSiteTheme() {
  return document.documentElement.dataset.site === 'light' ? 'light' : 'dark';
}

export function initSiteTheme() {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-site-set]');
  const sync = () => buttons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.siteSet === getSiteTheme()));
  sync();
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      root.dataset.site = b.dataset.siteSet;
      try { localStorage.setItem(KEY, b.dataset.siteSet); } catch { /* storage unavailable */ }
      sync();
      document.dispatchEvent(new CustomEvent('site:theme'));
    })
  );
}
