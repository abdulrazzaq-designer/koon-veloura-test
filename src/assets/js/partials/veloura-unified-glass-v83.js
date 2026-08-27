/* Veloura V83 — one bridge for Salla search/modals and their shadow roots. */
(() => {
  'use strict';

  const VERSION = 'v83';
  const STYLE_ID = 'veloura-component-style';
  const SEARCH_STYLE_ID = 'veloura-search-style';
  const observedRoots = new WeakSet();
  const queuedHosts = new WeakSet();

  const COMPONENTS = [
    'salla-search',
    'salla-login-modal',
    'salla-localization-modal',
    'salla-user-menu',
    'salla-scopes',
    'salla-offer-modal',
    'salla-modal',
    'salla-sheet'
  ];

  const SELECTOR = COMPONENTS.join(',');
  const PANEL_SELECTOR = [
    '.s-salla-modal-body',
    '.s-modal-body',
    '.s-modal-content',
    '.s-sheet-container',
    '.s-sheet-body',
    '.s-sheet-content',
    '.s-user-menu-wrapper',
    '.s-user-menu-dropdown',
    '.s-localization-modal',
    '.s-login-modal',
    '.s-scopes',
    '.s-offer-modal',
    "[part~='dialog']",
    "[part~='content']",
    "[part~='body']",
    "[part~='panel']",
    "[role='dialog']"
  ].join(',');

  const searchCss = `
    :host([data-veloura-inline-search='true']) {
      display: block !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      color: var(--veloura-primary, #111827) !important;
      --color-text: var(--veloura-primary, #111827) !important;
      --color-muted: var(--veloura-secondary, #64748b) !important;
      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;
    }

    :host([data-veloura-inline-search='true']) :is(
      form,
      input,
      button,
      .s-search-input,
      .s-search-container,
      .s-search-wrapper,
      .s-search-form,
      [part~='input'],
      [part~='form'],
      [part~='container'],
      [part~='wrapper']
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      color: var(--veloura-primary, #111827) !important;
    }

    :host([data-veloura-inline-search='true']) input {
      -webkit-text-fill-color: currentColor !important;
    }

    :host input::placeholder,
    :host .s-search-input::placeholder {
      color: var(--veloura-secondary, #64748b) !important;
      -webkit-text-fill-color: currentColor !important;
      opacity: .78 !important;
    }

    :host :is(
      .s-search-results,
      .s-search-results-wrapper,
      .s-search-result-panel,
      [part~='results'],
      [part~='panel']
    ) {
      box-sizing: border-box !important;
      background: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-color: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-image: none !important;
      border-top: 1px solid var(--veloura-edge-top, rgba(100,116,139,.18)) !important;
      border-bottom: 1px solid var(--veloura-edge-bottom, rgba(100,116,139,.10)) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      box-shadow: 0 8px 24px var(--veloura-shadow, rgba(15,23,42,.045)) !important;
      color: var(--veloura-primary, #111827) !important;
    }

    :host([data-veloura-inline-search='false']) :is(
      form,
      .s-search-input,
      .s-search-container,
      .s-search-wrapper,
      .s-search-form,
      [part~='input'],
      [part~='form'],
      [part~='container'],
      [part~='wrapper']
    ) {
      box-sizing: border-box !important;
      background: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-color: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-image: none !important;
      border-top: 1px solid var(--veloura-edge-top, rgba(100,116,139,.18)) !important;
      border-bottom: 1px solid var(--veloura-edge-bottom, rgba(100,116,139,.10)) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      box-shadow: 0 8px 24px var(--veloura-shadow, rgba(15,23,42,.045)) !important;
      color: var(--veloura-primary, #111827) !important;
    }
  `;

  const componentCss = `
    :host([data-veloura-dark='true']) {
      color: var(--veloura-primary, #fff) !important;
      --color-text: var(--veloura-primary, #fff) !important;
      --color-muted: var(--veloura-secondary, #ccc) !important;
      --color-grey: var(--veloura-secondary, #ccc) !important;
      --color-grey-dark: var(--veloura-primary, #fff) !important;
      --color-grey-darker: var(--veloura-primary, #fff) !important;
    }

    :host([data-veloura-glass='true']) [data-veloura-panel='true'] {
      box-sizing: border-box !important;
      background: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-color: var(--veloura-surface, rgba(238,240,243,.64)) !important;
      background-image: none !important;
      border-top: 1px solid var(--veloura-edge-top, rgba(100,116,139,.18)) !important;
      border-bottom: 1px solid var(--veloura-edge-bottom, rgba(100,116,139,.10)) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      backdrop-filter: var(--veloura-filter, blur(22px) saturate(118%)) !important;
      color: var(--veloura-primary, #111827) !important;
      box-shadow: 0 8px 24px var(--veloura-shadow, rgba(15,23,42,.045)) !important;
    }

    :host([data-veloura-glass='true']) :is(
      .s-salla-modal-body,
      .s-modal-body,
      .s-modal-content,
      .s-sheet-container,
      .s-sheet-body,
      .s-sheet-content,
      .s-user-menu-wrapper,
      .s-user-menu-dropdown,
      .s-localization-modal,
      .s-login-modal,
      .s-scopes,
      .s-offer-modal,
      [part~='dialog'],
      [part~='content'],
      [part~='body'],
      [part~='panel'],
      [role='dialog']
    ):not([data-veloura-panel='true']) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    :host([data-veloura-dark='true']) :is(
      h1, h2, h3, h4, h5, h6,
      .s-modal-title,
      .s-login-modal-title,
      .s-user-menu-title,
      [part~='title']
    ) {
      color: var(--veloura-primary, #fff) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    :host([data-veloura-dark='true']) :is(
      p, small, label,
      .text-gray-400, .text-gray-500, .text-gray-600,
      .text-muted,
      [part~='description']
    ) {
      color: var(--veloura-secondary, #ccc) !important;
      -webkit-text-fill-color: currentColor !important;
    }
  `;

  function isDark() {
    const html = document.documentElement;
    const body = document.body;
    return Boolean(
      html.classList.contains('dark') ||
      body?.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      body?.getAttribute('data-theme') === 'dark'
    );
  }

  function glassEnabledFor(host) {
    if (host?.matches?.('salla-search') && isInlineSearch(host)) {
      return Boolean(
        host.closest('.veloura-header-tabs-stack--blur') ||
        host.closest('.store-header.veloura-top-blur') ||
        document.body?.classList.contains('veloura-glass-effect')
      );
    }

    return Boolean(document.body?.classList.contains('veloura-glass-effect'));
  }

  /* Body is intentionally checked before :root. Dark variables can be scoped
     on body.dark; reading :root first was the V82 reason for light/grey values
     being copied inline into dark Salla components. */
  function token(name, fallback) {
    const sources = [document.body, document.documentElement].filter(Boolean);
    for (const source of sources) {
      const value = window.getComputedStyle(source).getPropertyValue(name).trim();
      if (value) return value;
    }
    return fallback;
  }

  function setImportant(element, property, value) {
    element?.style?.setProperty(property, value, 'important');
  }

  function upsertStyle(root, id, css) {
    if (!root || typeof root.querySelector !== 'function') return;
    let style = root.querySelector(`#${id}`);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      root.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;
  }

  function syncTokens(host) {
    if (!host?.style) return;

    const dark = isDark();
    host.setAttribute('data-veloura-dark', dark ? 'true' : 'false');
    host.setAttribute('data-veloura-glass', glassEnabledFor(host) ? 'true' : 'false');

    const primary = dark
      ? token('--veloura-dark-primary-text', '#ffffff')
      : token('--color-text', '#111827');
    const secondary = dark
      ? token('--veloura-dark-secondary-text', '#cccccc')
      : token('--color-grey', '#64748b');

    setImportant(host, '--veloura-primary', primary);
    setImportant(host, '--veloura-secondary', secondary);
    setImportant(host, '--veloura-surface', token('--veloura-surface', dark ? '#010612' : 'rgba(238,240,243,.64)'));
    setImportant(host, '--veloura-solid', token('--veloura-solid', dark ? '#010612' : '#eef0f3'));
    setImportant(host, '--veloura-edge-top', token('--veloura-edge-top', dark ? 'rgba(255,255,255,.09)' : 'rgba(100,116,139,.18)'));
    setImportant(host, '--veloura-edge-bottom', token('--veloura-edge-bottom', dark ? 'rgba(255,255,255,.045)' : 'rgba(100,116,139,.10)'));
    setImportant(host, '--veloura-filter', token('--veloura-filter', 'blur(22px) saturate(118%)'));
    setImportant(host, '--veloura-shadow', token('--veloura-shadow', dark ? 'rgba(0,0,0,.16)' : 'rgba(15,23,42,.045)'));
  }

  function isInlineSearch(host) {
    return Boolean(
      host?.classList?.contains('veloura-header-search-component') ||
      host?.closest?.('.veloura-search-surface')
    );
  }

  function clearInlineSearchHost(host) {
    if (!isInlineSearch(host)) return;

    host.setAttribute('data-veloura-inline-search', 'true');
    [
      '--s-search-bg',
      '--s-search-input-bg',
      '--s-search-input-background',
      '--search-input-bg',
      '--search-background'
    ].forEach((name) => setImportant(host, name, 'transparent'));

    setImportant(host, 'background', 'transparent');
    setImportant(host, 'background-color', 'transparent');
    setImportant(host, 'background-image', 'none');
    setImportant(host, 'box-shadow', 'none');
  }

  function paintSearchRoot(host, root) {
    const inline = isInlineSearch(host);
    host.setAttribute('data-veloura-inline-search', inline ? 'true' : 'false');

    if (inline) {
      root.querySelectorAll(`
        form,
        input,
        button,
        .s-search-input,
        .s-search-container,
        .s-search-wrapper,
        .s-search-form,
        [part~='input'],
        [part~='form'],
        [part~='container'],
        [part~='wrapper']
      `).forEach((element) => {
        setImportant(element, 'background', 'transparent');
        setImportant(element, 'background-color', 'transparent');
        setImportant(element, 'background-image', 'none');
        setImportant(element, 'border-color', 'transparent');
        setImportant(element, 'box-shadow', 'none');
      });
    }
  }

  function markPanel(scope) {
    if (!scope || typeof scope.querySelectorAll !== 'function') return;

    const panels = Array.from(scope.querySelectorAll(PANEL_SELECTOR));
    panels.forEach((panel) => panel.removeAttribute('data-veloura-panel'));
    if (!panels.length) return;

    const depth = (element) => {
      let value = 0;
      let current = element;
      while (current?.parentElement) {
        value += 1;
        current = current.parentElement;
      }
      return value;
    };

    const maxDepth = Math.max(...panels.map(depth));
    panels
      .filter((panel) => depth(panel) === maxDepth)
      .forEach((panel) => panel.setAttribute('data-veloura-panel', 'true'));
  }

  function observeRoot(root) {
    if (!root || observedRoots.has(root) || typeof MutationObserver !== 'function') return;
    const observer = new MutationObserver(() => scanSoon());
    observer.observe(root, { childList: true, subtree: true });
    observedRoots.add(root);
  }

  function decorate(host) {
    if (!host) return;
    syncTokens(host);
    markPanel(host);

    if (host.matches('salla-search')) clearInlineSearchHost(host);

    const applyShadow = () => {
      const root = host.shadowRoot;
      if (!root) return;

      markPanel(root);
      upsertStyle(root, STYLE_ID, componentCss);
      if (host.matches('salla-search')) {
        upsertStyle(root, SEARCH_STYLE_ID, searchCss);
        paintSearchRoot(host, root);
      }

      observeRoot(root);
      scan(root);
    };

    applyShadow();

    if (typeof host.componentOnReady === 'function' && !host.__velouraV83Ready) {
      host.__velouraV83Ready = true;
      Promise.resolve(host.componentOnReady())
        .then(() => {
          syncTokens(host);
          if (host.matches('salla-search')) clearInlineSearchHost(host);
          applyShadow();
        })
        .catch(() => {});
    }
  }

  function schedule(host) {
    if (!host || queuedHosts.has(host)) return;
    queuedHosts.add(host);
    window.requestAnimationFrame(() => {
      queuedHosts.delete(host);
      decorate(host);
    });
  }

  function scan(scope = document) {
    if (!scope || typeof scope.querySelectorAll !== 'function') return;
    if (scope.matches?.(SELECTOR)) schedule(scope);
    scope.querySelectorAll(SELECTOR).forEach(schedule);
  }

  function scanSoon() {
    [0, 60, 180, 420, 900, 1800].forEach((delay) => {
      window.setTimeout(() => scan(document), delay);
    });
  }

  function registerSallaHooks() {
    const api = window.Salla || window.salla;
    if (!api?.onReady) return false;

    api.onReady(() => {
      const hooks = api.hooks;
      if (hooks?.registerHook) {
        COMPONENTS.forEach((component) => {
          try {
            hooks.registerHook(component, 'componentDidLoad', (element) => {
              decorate(element);
              scanSoon();
            });
          } catch (_) {
            /* MutationObserver remains the fallback for unsupported hooks. */
          }
        });
      }
      scanSoon();
    });

    return true;
  }

  function init() {
    document.documentElement.dataset.velouraGlassBridge = VERSION;
    registerSallaHooks();
    scanSoon();

    if (typeof MutationObserver === 'function') {
      const domObserver = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node.nodeType === 1) scan(node);
          });
        });
      });
      domObserver.observe(document.documentElement, { childList: true, subtree: true });

      const themeObserver = new MutationObserver(scanSoon);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      if (document.body) {
        themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class', 'data-theme']
        });
      }
    }

    document.addEventListener('theme::ready', scanSoon);
    document.addEventListener('veloura:theme-changed', scanSoon);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
