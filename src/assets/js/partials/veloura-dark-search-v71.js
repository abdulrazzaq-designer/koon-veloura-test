/* ========================================================================
   Veloura V71 — Salla search dark-mode shadow DOM bridge.

   The header search already receives injected layout rules. This module adds
   color/surface rules to every Salla search host, including the global search
   modal opened from the search icon or floating mobile menu.
   ======================================================================== */

const STYLE_ID = 'veloura-dark-search-v71';

const DARK_SEARCH_CSS = `
  :host([data-veloura-dark='true']) {
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-text: var(--veloura-dark-primary-text, #ffffff);
    --color-text-reverse: var(--veloura-dark-body-bg, #010202);
    --color-muted: var(--veloura-dark-secondary-text, #ededed);
    --s-search-input-bg: transparent;
    --search-input-bg: transparent;
  }

  :host([data-veloura-dark='true']) form,
  :host([data-veloura-dark='true']) input,
  :host([data-veloura-dark='true']) .s-search-input,
  :host([data-veloura-dark='true']) [part~='input'],
  :host([data-veloura-dark='true']) [part~='form'] {
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    background: color-mix(
      in srgb,
      var(--veloura-dark-glass-tint, #18181b) 88%,
      transparent
    ) !important;
    background-color: color-mix(
      in srgb,
      var(--veloura-dark-glass-tint, #18181b) 88%,
      transparent
    ) !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :host([data-veloura-dark='true']) input::placeholder,
  :host([data-veloura-dark='true']) .s-search-input::placeholder {
    color: color-mix(
      in srgb,
      var(--veloura-dark-secondary-text, #ededed) 72%,
      transparent
    ) !important;
  }

  :host([data-veloura-dark='true']) .s-search-modal,
  :host([data-veloura-dark='true']) .s-search-container,
  :host([data-veloura-dark='true']) .s-search-wrapper,
  :host([data-veloura-dark='true']) .s-search-results,
  :host([data-veloura-dark='true']) .s-search-results-wrapper,
  :host([data-veloura-dark='true']) .s-search-result,
  :host([data-veloura-dark='true']) .s-search-result-item,
  :host([data-veloura-dark='true']) [part~='container'],
  :host([data-veloura-dark='true']) [part~='results'] {
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    background: var(--veloura-dark-secondary-bg, #010612) !important;
    background-color: var(--veloura-dark-secondary-bg, #010612) !important;
    border-color: transparent !important;
  }

  :host([data-veloura-dark='true']) .s-search-overlay,
  :host([data-veloura-dark='true']) [part~='overlay'] {
    background: rgba(0, 0, 0, .62) !important;
    -webkit-backdrop-filter: blur(5px) !important;
    backdrop-filter: blur(5px) !important;
  }

  :host([data-veloura-dark='true']) a,
  :host([data-veloura-dark='true']) button,
  :host([data-veloura-dark='true']) h1,
  :host([data-veloura-dark='true']) h2,
  :host([data-veloura-dark='true']) h3,
  :host([data-veloura-dark='true']) h4,
  :host([data-veloura-dark='true']) p,
  :host([data-veloura-dark='true']) span,
  :host([data-veloura-dark='true']) i,
  :host([data-veloura-dark='true']) svg {
    color: inherit !important;
  }
`;

const observedHosts = new WeakSet();

function isDark() {
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}

function applyHostTheme(host) {
  if (!host) return;
  host.setAttribute('data-veloura-dark', isDark() ? 'true' : 'false');
}

function installShadowStyle(host) {
  if (!host) return;

  const apply = () => {
    applyHostTheme(host);

    const root = host.shadowRoot;
    if (!root) return;

    let style = root.querySelector(`style[data-${STYLE_ID}]`);

    if (!style) {
      style = document.createElement('style');
      style.setAttribute(`data-${STYLE_ID}`, 'true');
      root.appendChild(style);
    }

    if (style.textContent !== DARK_SEARCH_CSS) {
      style.textContent = DARK_SEARCH_CSS;
    }

    if (!observedHosts.has(host) && typeof MutationObserver === 'function') {
      const observer = new MutationObserver(() => {
        let current = root.querySelector(`style[data-${STYLE_ID}]`);

        if (!current) {
          current = document.createElement('style');
          current.setAttribute(`data-${STYLE_ID}`, 'true');
          root.appendChild(current);
        }

        if (current.textContent !== DARK_SEARCH_CSS) {
          current.textContent = DARK_SEARCH_CSS;
        }
      });

      observer.observe(root, { childList: true });
      observedHosts.add(host);
    }
  };

  apply();

  if (typeof host.componentOnReady === 'function') {
    host.componentOnReady().then(apply).catch(() => {});
  }
}

function syncSearchHosts(scope = document) {
  scope.querySelectorAll?.('salla-search').forEach(installShadowStyle);
}

function syncTheme() {
  document.querySelectorAll('salla-search').forEach(applyHostTheme);
  syncSearchHosts();
}

document.addEventListener('DOMContentLoaded', syncTheme);
document.addEventListener('theme::ready', syncTheme);
window.addEventListener('veloura:theme-changed', syncTheme);

if (typeof MutationObserver === 'function') {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;

        if (node.matches?.('salla-search')) {
          installShadowStyle(node);
        }

        syncSearchHosts(node);
      }
    }
  });

  const start = () => {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    syncTheme();
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
}

export default syncTheme;
