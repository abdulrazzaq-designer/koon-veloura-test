/* ========================================================================
   Veloura V72 — robust Salla search glass bridge.

   V71 injected dark styles, but some Salla builds repaint the input after
   hydration or expose a different internal wrapper. V72:
   - sets every relevant search CSS variable on the host
   - injects context-aware shadow CSS
   - directly paints known shadow elements after every component rebuild
   - synchronizes light/dark changes and newly-created search modals
   ======================================================================== */

const STYLE_ID = 'veloura-search-glass-v72';
const observedRoots = new WeakSet();
const scheduledHosts = new WeakSet();

const SEARCH_STYLE = `
  :host {
    --veloura-light-control: rgba(238, 244, 249, .72);
    --veloura-dark-control: color-mix(
      in srgb,
      var(--veloura-dark-glass-tint, #18181b) 34%,
      #1e2a38 66%
    );
    --veloura-control-bg: var(--veloura-light-control);
    --veloura-control-text: #1f2937;
    --veloura-control-muted: rgba(71, 85, 105, .72);
    --veloura-top: rgba(255, 255, 255, .78);
    --veloura-bottom: rgba(15, 23, 42, .11);
    --veloura-shadow: rgba(15, 23, 42, .08);
    color: var(--veloura-control-text) !important;
  }

  :host([data-veloura-theme='dark']) {
    --veloura-control-bg: color-mix(
      in srgb,
      var(--veloura-dark-control) 84%,
      transparent
    );
    --veloura-control-text: var(
      --veloura-dark-primary-text,
      #ffffff
    );
    --veloura-control-muted: color-mix(
      in srgb,
      var(--veloura-dark-secondary-text, #b7c3cf) 72%,
      transparent
    );
    --veloura-top: rgba(255, 255, 255, .17);
    --veloura-bottom: rgba(2, 8, 15, .34);
    --veloura-shadow: rgba(0, 0, 0, .25);
    color-scheme: dark;
  }

  :host([data-veloura-context='inline']) form,
  :host([data-veloura-context='inline']) input,
  :host([data-veloura-context='inline']) .s-search-input,
  :host([data-veloura-context='inline']) .s-search-wrapper,
  :host([data-veloura-context='inline']) .s-search-container,
  :host([data-veloura-context='inline']) [part~='input'],
  :host([data-veloura-context='inline']) [part~='form'],
  :host([data-veloura-context='inline']) [part~='container'] {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
    color: var(--veloura-control-text) !important;
  }

  :host([data-veloura-context='modal']) form,
  :host([data-veloura-context='modal']) input,
  :host([data-veloura-context='modal']) .s-search-input,
  :host([data-veloura-context='modal']) [part~='input'],
  :host([data-veloura-context='modal']) [part~='form'] {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, .045),
        rgba(0, 0, 0, .018)
      ),
      var(--veloura-control-bg) !important;
    background-color: var(--veloura-control-bg) !important;
    border-top: 1px solid var(--veloura-top) !important;
    border-bottom: 1px solid var(--veloura-bottom) !important;
    border-inline: 1px solid rgba(255, 255, 255, .045) !important;
    box-shadow:
      inset 0 1px 0 color-mix(
        in srgb,
        var(--veloura-top) 54%,
        transparent
      ),
      inset 0 -1px 0 color-mix(
        in srgb,
        var(--veloura-bottom) 52%,
        transparent
      ),
      0 8px 28px var(--veloura-shadow) !important;
    -webkit-backdrop-filter:
      blur(20px) saturate(128%) brightness(101%) !important;
    backdrop-filter:
      blur(20px) saturate(128%) brightness(101%) !important;
    color: var(--veloura-control-text) !important;
  }

  :host([data-veloura-theme='dark']) .s-search-modal,
  :host([data-veloura-theme='dark']) .s-search-results,
  :host([data-veloura-theme='dark']) .s-search-results-wrapper,
  :host([data-veloura-theme='dark']) .s-search-result,
  :host([data-veloura-theme='dark']) .s-search-result-item,
  :host([data-veloura-theme='dark']) [part~='panel'],
  :host([data-veloura-theme='dark']) [part~='results'] {
    background: var(--veloura-dark-secondary-bg, #101820) !important;
    background-color: var(--veloura-dark-secondary-bg, #101820) !important;
    color: var(--veloura-control-text) !important;
    border-color: transparent !important;
  }

  input::placeholder,
  .s-search-input::placeholder {
    color: var(--veloura-control-muted) !important;
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

function isInline(host) {
  return (
    host.classList.contains('veloura-header-search-component') ||
    Boolean(host.closest('.veloura-search-surface'))
  );
}

function setImportant(element, property, value) {
  element?.style?.setProperty(property, value, 'important');
}

function syncHostVariables(host) {
  const dark = isDark();
  const context = isInline(host) ? 'inline' : 'modal';

  host.setAttribute('data-veloura-theme', dark ? 'dark' : 'light');
  host.setAttribute('data-veloura-context', context);

  const darkBase =
    'color-mix(in srgb, var(--veloura-dark-glass-tint, #18181b) 34%, #1e2a38 66%)';
  const control = dark
    ? `color-mix(in srgb, ${darkBase} 84%, transparent)`
    : 'rgba(238, 244, 249, .72)';
  const text = dark
    ? 'var(--veloura-dark-primary-text, #ffffff)'
    : '#1f2937';
  const muted = dark
    ? 'var(--veloura-dark-secondary-text, #b7c3cf)'
    : '#64748b';

  [
    '--s-search-input-bg',
    '--search-input-bg',
    '--s-search-bg',
  ].forEach((name) => setImportant(host, name, context === 'inline' ? 'transparent' : control));

  [
    '--color-text',
    '--s-color-text',
    '--s-search-text-color',
  ].forEach((name) => setImportant(host, name, text));

  [
    '--color-muted',
    '--s-color-muted',
    '--s-search-placeholder-color',
  ].forEach((name) => setImportant(host, name, muted));

  setImportant(
    host,
    '--s-search-modal-bg',
    dark ? 'var(--veloura-dark-secondary-bg, #101820)' : '#ffffff'
  );
  setImportant(
    host,
    '--s-modal-bg',
    dark ? 'var(--veloura-dark-secondary-bg, #101820)' : '#ffffff'
  );
  setImportant(host, 'color', text);
  setImportant(host, 'background-color', 'transparent');
}

function ensureStyle(root) {
  let style = root.querySelector(`style[data-${STYLE_ID}]`);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute(`data-${STYLE_ID}`, 'true');
    root.appendChild(style);
  }

  if (style.textContent !== SEARCH_STYLE) {
    style.textContent = SEARCH_STYLE;
  }
}

function paintShadow(host) {
  syncHostVariables(host);

  const root = host.shadowRoot;
  if (!root) return;

  ensureStyle(root);

  const dark = isDark();
  const context = isInline(host) ? 'inline' : 'modal';
  const control = dark
    ? 'color-mix(in srgb, color-mix(in srgb, var(--veloura-dark-glass-tint, #18181b) 34%, #1e2a38 66%) 84%, transparent)'
    : 'rgba(238, 244, 249, .72)';
  const text = dark
    ? 'var(--veloura-dark-primary-text, #ffffff)'
    : '#1f2937';

  root.querySelectorAll(`
    form,
    input,
    .s-search-input,
    .s-search-wrapper,
    [part~='input'],
    [part~='form']
  `).forEach((element) => {
    setImportant(element, 'color', text);
    setImportant(element, 'border-color', 'transparent');
    setImportant(element, 'background-image', 'none');

    if (context === 'inline') {
      setImportant(element, 'background', 'transparent');
      setImportant(element, 'background-color', 'transparent');
      setImportant(element, 'box-shadow', 'none');
      setImportant(element, '-webkit-backdrop-filter', 'none');
      setImportant(element, 'backdrop-filter', 'none');
    } else {
      setImportant(
        element,
        'background',
        `linear-gradient(180deg, rgba(255,255,255,.045), rgba(0,0,0,.018)), ${control}`
      );
      setImportant(element, 'background-color', control);
      setImportant(
        element,
        'box-shadow',
        'inset 0 1px 0 rgba(255,255,255,.11), inset 0 -1px 0 rgba(0,0,0,.18), 0 8px 28px rgba(0,0,0,.18)'
      );
      setImportant(element, '-webkit-backdrop-filter', 'blur(20px) saturate(128%)');
      setImportant(element, 'backdrop-filter', 'blur(20px) saturate(128%)');
    }
  });

  if (dark) {
    root.querySelectorAll(`
      .s-search-modal,
      .s-search-results,
      .s-search-results-wrapper,
      .s-search-result,
      .s-search-result-item,
      [part~='panel'],
      [part~='results']
    `).forEach((element) => {
      setImportant(
        element,
        'background',
        'var(--veloura-dark-secondary-bg, #101820)'
      );
      setImportant(
        element,
        'background-color',
        'var(--veloura-dark-secondary-bg, #101820)'
      );
      setImportant(element, 'color', text);
      setImportant(element, 'border-color', 'transparent');
    });
  }
}

function schedulePaint(host) {
  if (!host || scheduledHosts.has(host)) return;
  scheduledHosts.add(host);

  requestAnimationFrame(() => {
    scheduledHosts.delete(host);
    paintShadow(host);
  });
}

function observeHost(host) {
  if (!host) return;

  syncHostVariables(host);
  schedulePaint(host);

  const ready = typeof host.componentOnReady === 'function'
    ? host.componentOnReady()
    : Promise.resolve();

  ready.then(() => {
    paintShadow(host);

    const root = host.shadowRoot;
    if (!root || observedRoots.has(root)) return;

    const observer = new MutationObserver(() => schedulePaint(host));
    observer.observe(root, {
      childList: true,
      subtree: true,
    });
    observedRoots.add(root);
  }).catch(() => {});
}

function scan(scope = document) {
  if (scope.matches?.('salla-search')) observeHost(scope);
  scope.querySelectorAll?.('salla-search').forEach(observeHost);
}

function syncAll() {
  document.querySelectorAll('salla-search').forEach(observeHost);
}

function start() {
  scan(document);

  const documentObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      });
    });
  });

  if (document.body) {
    documentObserver.observe(document.body, {
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export default syncAll;
