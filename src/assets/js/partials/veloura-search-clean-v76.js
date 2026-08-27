/* ========================================================================
   Veloura V76 — single Salla search bridge

   This is the only post-hydration search controller.
   It does not touch:
   - mmenu geometry
   - the floating menu geometry
   - product-card add-to-cart clicks
   ======================================================================== */

const STYLE_ID = 'veloura-search-clean-v76';
const observedRoots = new WeakSet();
const queuedHosts = new WeakSet();

const SHADOW_STYLE = `
  :host {
    --s-search-input-bg: transparent !important;
    --s-search-input-background: transparent !important;
    --search-input-bg: transparent !important;
    --search-background: transparent !important;
  }

  :host([data-veloura-inline='true']),
  :host([data-veloura-inline='true']) form,
  :host([data-veloura-inline='true']) input,
  :host([data-veloura-inline='true']) .s-search-input,
  :host([data-veloura-inline='true']) .s-search-container,
  :host([data-veloura-inline='true']) .s-search-wrapper,
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
    --color-text: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-muted: var(--veloura-dark-secondary-text, #d7e0e8) !important;
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    color-scheme: dark;
  }

  :host([data-veloura-inline='false']) form,
  :host([data-veloura-inline='false']) input,
  :host([data-veloura-inline='false']) .s-search-input,
  :host([data-veloura-inline='false']) [part~='input'],
  :host([data-veloura-inline='false']) [part~='form'] {
    background: var(--veloura-search-color) !important;
    background-color: var(--veloura-search-color) !important;
    color: var(--veloura-search-text) !important;
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :host([data-veloura-dark='true']) .s-search-results,
  :host([data-veloura-dark='true']) .s-search-results-wrapper,
  :host([data-veloura-dark='true']) .s-search-result,
  :host([data-veloura-dark='true']) .s-search-result-item,
  :host([data-veloura-dark='true']) [part~='results'],
  :host([data-veloura-dark='true']) [part~='panel'] {
    background: var(--veloura-dark-secondary-bg, #010612) !important;
    background-color: var(--veloura-dark-secondary-bg, #010612) !important;
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    border-color: transparent !important;
  }

  input::placeholder,
  .s-search-input::placeholder {
    color: var(--veloura-search-muted) !important;
    opacity: 1 !important;
  }
`;

function isDark() {
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}

function computedVariable(name, fallback) {
  const htmlStyle = getComputedStyle(document.documentElement);
  const bodyStyle = document.body ? getComputedStyle(document.body) : null;

  return (
    htmlStyle.getPropertyValue(name).trim() ||
    bodyStyle?.getPropertyValue(name).trim() ||
    fallback
  );
}

function isInlineSearch(host) {
  return (
    host.classList.contains('veloura-header-search-component') ||
    Boolean(host.closest('.veloura-search-surface'))
  );
}

function setImportant(element, name, value) {
  element?.style?.setProperty(name, value, 'important');
}

function ensureStyle(root) {
  let style = root.querySelector(`style[data-${STYLE_ID}]`);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute(`data-${STYLE_ID}`, 'true');
    root.appendChild(style);
  }

  if (style.textContent !== SHADOW_STYLE) {
    style.textContent = SHADOW_STYLE;
  }
}

function paint(host) {
  if (!host) return;

  const dark = isDark();
  const inline = isInlineSearch(host);

  const secondary = dark
    ? computedVariable('--veloura-dark-secondary-bg', '#010612')
    : computedVariable('--veloura-site-second-bg', '#f4f5f7');

  const text = dark
    ? computedVariable('--veloura-dark-primary-text', '#ffffff')
    : 'inherit';

  const muted = dark
    ? computedVariable('--veloura-dark-secondary-text', '#d7e0e8')
    : '#64748b';

  host.setAttribute('data-veloura-dark', dark ? 'true' : 'false');
  host.setAttribute('data-veloura-inline', inline ? 'true' : 'false');

  setImportant(host, '--veloura-search-color', secondary);
  setImportant(host, '--veloura-search-text', text);
  setImportant(host, '--veloura-search-muted', muted);

  if (inline) {
    [
      '--s-search-input-bg',
      '--s-search-input-background',
      '--s-search-bg',
      '--search-input-bg',
      '--search-background',
    ].forEach((name) => setImportant(host, name, 'transparent'));

    setImportant(host, 'background', 'transparent');
    setImportant(host, 'background-color', 'transparent');
    setImportant(host, 'box-shadow', 'none');
  } else {
    [
      '--s-search-bg',
      '--s-search-modal-bg',
      '--s-modal-bg',
      '--color-grey',
      '--color-grey-light',
      '--color-grey-lighter',
    ].forEach((name) => setImportant(host, name, secondary));
  }

  const root = host.shadowRoot;
  if (!root) return;

  ensureStyle(root);

  root.querySelectorAll(`
    form,
    input,
    .s-search-input,
    .s-search-container,
    .s-search-wrapper,
    [part~='input'],
    [part~='form'],
    [part~='container']
  `).forEach((element) => {
    setImportant(element, 'color', text);
    setImportant(element, 'border-color', 'transparent');
    setImportant(element, 'box-shadow', 'none');

    if (inline) {
      setImportant(element, 'background', 'transparent');
      setImportant(element, 'background-color', 'transparent');
      setImportant(element, 'background-image', 'none');
    } else {
      setImportant(element, 'background', secondary);
      setImportant(element, 'background-color', secondary);
    }
  });

  if (dark) {
    root.querySelectorAll(`
      .s-search-results,
      .s-search-results-wrapper,
      .s-search-result,
      .s-search-result-item,
      [part~='results'],
      [part~='panel']
    `).forEach((element) => {
      setImportant(element, 'background', secondary);
      setImportant(element, 'background-color', secondary);
      setImportant(element, 'color', text);
      setImportant(element, 'border-color', 'transparent');
    });
  }

  if (!observedRoots.has(root)) {
    const observer = new MutationObserver(() => queuePaint(host));
    observer.observe(root, {
      childList: true,
      subtree: true,
    });
    observedRoots.add(root);
  }
}

function queuePaint(host) {
  if (!host || queuedHosts.has(host)) return;

  queuedHosts.add(host);

  requestAnimationFrame(() => {
    queuedHosts.delete(host);
    paint(host);
  });
}

function watch(host) {
  queuePaint(host);

  if (typeof host.componentOnReady === 'function') {
    host.componentOnReady().then(() => paint(host)).catch(() => {});
  }
}

function scan(scope = document) {
  if (scope.matches?.('salla-search')) watch(scope);
  scope.querySelectorAll?.('salla-search').forEach(watch);
}

function syncAll() {
  document.querySelectorAll('salla-search').forEach(watch);
}

function start() {
  scan(document);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  const themeObserver = new MutationObserver(syncAll);

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

  window.addEventListener('veloura:theme-changed', syncAll);
  document.addEventListener('theme::ready', syncAll);

  [250, 900, 1800].forEach((delay) => {
    window.setTimeout(syncAll, delay);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export default syncAll;
