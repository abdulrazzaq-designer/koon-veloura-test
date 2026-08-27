/* ========================================================================
   Veloura V73 — final Salla search surface override.

   Reapplies transparent inline-search internals after every hydration and
   forces all known Salla search background variables away from grey.
   ======================================================================== */

const STYLE_ID = 'veloura-search-glass-v73';
const roots = new WeakSet();
const queued = new WeakSet();

const STYLE = `
  :host {
    --s-search-input-bg: transparent !important;
    --s-search-input-background: transparent !important;
    --s-search-bg: transparent !important;
    --search-input-bg: transparent !important;
    --search-background: transparent !important;
    --color-grey: transparent !important;
    --color-grey-light: transparent !important;
    --color-grey-lighter: transparent !important;
  }

  :host([data-veloura-inline='true']),
  :host([data-veloura-inline='true']) form,
  :host([data-veloura-inline='true']) input,
  :host([data-veloura-inline='true']) .s-search-input,
  :host([data-veloura-inline='true']) .s-search-wrapper,
  :host([data-veloura-inline='true']) .s-search-container,
  :host([data-veloura-inline='true']) [part~='input'],
  :host([data-veloura-inline='true']) [part~='form'],
  :host([data-veloura-inline='true']) [part~='container'] {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :host([data-veloura-dark='true']) {
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-text: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-muted: var(--veloura-dark-secondary-text, #b7c3cf) !important;
  }

  :host([data-veloura-dark='true']) input,
  :host([data-veloura-dark='true']) .s-search-input {
    color: var(--veloura-dark-primary-text, #ffffff) !important;
  }

  :host([data-veloura-dark='true']) input::placeholder,
  :host([data-veloura-dark='true']) .s-search-input::placeholder {
    color: color-mix(
      in srgb,
      var(--veloura-dark-secondary-text, #b7c3cf) 72%,
      transparent
    ) !important;
    opacity: 1 !important;
  }
`;

function darkMode() {
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}

function inlineSearch(host) {
  return (
    host.classList.contains('veloura-header-search-component') ||
    Boolean(host.closest('.veloura-search-surface'))
  );
}

function important(element, property, value) {
  element?.style?.setProperty(property, value, 'important');
}

function setVariables(host) {
  const inline = inlineSearch(host);
  const dark = darkMode();

  host.setAttribute('data-veloura-inline', inline ? 'true' : 'false');
  host.setAttribute('data-veloura-dark', dark ? 'true' : 'false');

  const transparentNames = [
    '--s-search-input-bg',
    '--s-search-input-background',
    '--s-search-bg',
    '--search-input-bg',
    '--search-background',
    '--color-grey',
    '--color-grey-light',
    '--color-grey-lighter',
  ];

  if (inline) {
    transparentNames.forEach((name) => important(host, name, 'transparent'));
    important(host, 'background', 'transparent');
    important(host, 'background-color', 'transparent');
    important(host, 'box-shadow', 'none');
  }

  if (dark) {
    important(host, '--color-text', 'var(--veloura-dark-primary-text, #ffffff)');
    important(host, '--color-muted', 'var(--veloura-dark-secondary-text, #b7c3cf)');
    important(host, 'color', 'var(--veloura-dark-primary-text, #ffffff)');
  }
}

function ensureStyle(root) {
  let style = root.querySelector(`style[data-${STYLE_ID}]`);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute(`data-${STYLE_ID}`, 'true');
    root.appendChild(style);
  }

  if (style.textContent !== STYLE) style.textContent = STYLE;
}

function paint(host) {
  setVariables(host);

  const root = host.shadowRoot;
  if (!root) return;

  ensureStyle(root);

  if (inlineSearch(host)) {
    root.querySelectorAll(`
      form,
      input,
      .s-search-input,
      .s-search-wrapper,
      .s-search-container,
      [part~='input'],
      [part~='form'],
      [part~='container']
    `).forEach((element) => {
      important(element, 'background', 'transparent');
      important(element, 'background-color', 'transparent');
      important(element, 'background-image', 'none');
      important(element, 'border-color', 'transparent');
      important(element, 'box-shadow', 'none');
      important(element, '-webkit-backdrop-filter', 'none');
      important(element, 'backdrop-filter', 'none');
    });
  }
}

function queue(host) {
  if (!host || queued.has(host)) return;
  queued.add(host);

  requestAnimationFrame(() => {
    queued.delete(host);
    paint(host);
  });
}

function watch(host) {
  if (!host) return;

  setVariables(host);
  queue(host);

  const ready = typeof host.componentOnReady === 'function'
    ? host.componentOnReady()
    : Promise.resolve();

  ready.then(() => {
    paint(host);
    const root = host.shadowRoot;

    if (!root || roots.has(root)) return;

    const observer = new MutationObserver(() => queue(host));
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    roots.add(root);
  }).catch(() => {});
}

function scan(scope = document) {
  if (scope.matches?.('salla-search')) watch(scope);
  scope.querySelectorAll?.('salla-search').forEach(watch);
}

function sync() {
  document.querySelectorAll('salla-search').forEach(watch);
}

function start() {
  scan(document);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    });
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const themeObserver = new MutationObserver(sync);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
  }

  window.addEventListener('veloura:theme-changed', sync);
  document.addEventListener('theme::ready', sync);

  /* Salla may rebuild the input shortly after page hydration. These limited
     retries are inexpensive and stop automatically. */
  [250, 700, 1500, 3000, 6000].forEach((delay) => {
    window.setTimeout(sync, delay);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export default sync;
