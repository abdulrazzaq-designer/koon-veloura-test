/* Veloura V84 — class-scoped glass/dark bridge. */
(() => {
  'use strict';

  const VERSION = 'v84';
  const THEME = 'veloura-theme';
  const MATERIAL = 'veloura-glass';
  const LIGHT = 'veloura-glass--light';
  const DARK = 'veloura-glass--dark';
  const PANEL = 'veloura-panel';
  const STYLE_ID = 'veloura-shadow-style';
  const SEARCH_STYLE_ID = 'veloura-search-shadow-style';
  const observedRoots = new WeakSet();
  const queued = new WeakSet();

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

  const COMPONENT_SELECTOR = COMPONENTS.join(',');
  const PANEL_SELECTORS = [
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
    "[part~='panel']",
    "[part~='content']",
    "[role='dialog']"
  ];

  const LEGACY_HOST_ATTRIBUTES = [
    'data-veloura-dark',
    'data-veloura-glass',
    'data-veloura-inline-search',
    'data-veloura-search-dark',
    'data-veloura-search-inline'
  ];

  const LEGACY_INLINE_PROPERTIES = [
    '--veloura-primary',
    '--veloura-secondary',
    '--veloura-surface',
    '--veloura-solid',
    '--veloura-edge-top',
    '--veloura-edge-bottom',
    '--veloura-filter',
    '--veloura-shadow',
    '--veloura-search-runtime-bg',
    '--veloura-search-runtime-text',
    '--veloura-search-runtime-muted'
  ];

  const componentCss = `
    :host(.${THEME}) {
      --veloura-primary-text: var(--color-text, #111827);
      --veloura-secondary-text: var(--color-grey, #64748b);
      --veloura-surface: rgba(228, 231, 235, .66);
      --veloura-edge-top: rgba(100, 116, 139, .12);
      --veloura-edge-bottom: rgba(100, 116, 139, .06);
      --veloura-shadow: rgba(15, 23, 42, .045);
      --veloura-filter: blur(22px) saturate(118%);
    }

    :host(.${THEME}.${DARK}) {
      --veloura-surface: color-mix(
        in srgb,
        var(--veloura-dark-secondary-bg, #010612) 92%,
        transparent
      );
      --veloura-edge-top: rgba(255, 255, 255, .07);
      --veloura-edge-bottom: rgba(255, 255, 255, .03);
      --veloura-shadow: rgba(0, 0, 0, .16);
      --veloura-primary-text: var(--veloura-dark-primary-text, #ffffff);
      --veloura-secondary-text: var(--veloura-dark-secondary-text, #cccccc);
      color-scheme: dark;
    }

    .${MATERIAL} {
      box-sizing: border-box !important;
      background: var(--veloura-surface) !important;
      background-color: var(--veloura-surface) !important;
      background-image: none !important;
      border-top: 1px solid var(--veloura-edge-top) !important;
      border-bottom: 1px solid var(--veloura-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-filter) !important;
      backdrop-filter: var(--veloura-filter) !important;
      box-shadow: 0 8px 24px var(--veloura-shadow) !important;
    }

    .${PANEL}.${DARK} :is(
      h1, h2, h3, h4, h5, h6,
      .s-modal-title,
      .s-login-modal-title,
      .s-user-menu-title,
      [part~='title']
    ):not(button *):not([class*='badge']):not([class*='promo']) {
      color: var(--veloura-primary-text) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    .${PANEL}.${DARK} :is(
      p, small, label,
      .text-gray-400, .text-gray-500, .text-gray-600,
      .text-muted,
      [part~='description']
    ):not(button *):not([class*='badge']):not([class*='promo']) {
      color: var(--veloura-secondary-text) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    .${PANEL}.${MATERIAL} :is(
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
      [part~='panel'],
      [part~='content'],
      [role='dialog']
    ):not(.${PANEL}) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
  `;

  const searchCss = `
    :host(.veloura-search-host) {
      display: block !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      color: var(--veloura-primary-text, #111827) !important;
      --color-text: var(--veloura-primary-text, #111827) !important;
      --color-muted: var(--veloura-secondary-text, #64748b) !important;
      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;
    }

    .veloura-search-clear {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    .veloura-search-material {
      box-sizing: border-box !important;
      background: var(--veloura-surface) !important;
      background-color: var(--veloura-surface) !important;
      background-image: none !important;
      border-top: 1px solid var(--veloura-edge-top) !important;
      border-bottom: 1px solid var(--veloura-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-filter) !important;
      backdrop-filter: var(--veloura-filter) !important;
      box-shadow: 0 8px 24px var(--veloura-shadow) !important;
      color: var(--veloura-primary-text) !important;
    }

    :host(.${DARK}) input,
    :host(.${DARK}) .s-search-input {
      color: var(--veloura-primary-text) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    :host(.${DARK}) input::placeholder,
    :host(.${DARK}) .s-search-input::placeholder {
      color: var(--veloura-secondary-text) !important;
      -webkit-text-fill-color: currentColor !important;
      opacity: .78 !important;
    }

    :host(.${DARK}) .veloura-search-material :is(
      h1, h2, h3, h4, h5, h6,
      .s-search-title,
      [part~='title']
    ) {
      color: var(--veloura-primary-text) !important;
    }
  `;

  function isDarkMode() {
    const html = document.documentElement;
    const body = document.body;
    return Boolean(
      html.classList.contains('dark') ||
      body?.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      body?.getAttribute('data-theme') === 'dark'
    );
  }

  function generalGlassEnabled() {
    return Boolean(document.body?.classList.contains('veloura-glass-effect'));
  }

  function setMode(element) {
    if (!element?.classList) return;
    const dark = isDarkMode();
    element.classList.add(THEME);
    element.classList.toggle(DARK, dark);
    element.classList.toggle(LIGHT, !dark);
  }

  function markMaterial(element, role) {
    if (!element?.classList) return;
    setMode(element);
    element.classList.add(MATERIAL);
    if (role) element.classList.add(role);
  }

  function unmarkMaterial(element) {
    if (!element?.classList) return;
    element.classList.remove(MATERIAL, PANEL);
  }

  function clearLegacyHost(host) {
    LEGACY_HOST_ATTRIBUTES.forEach((name) => host.removeAttribute(name));
    LEGACY_INLINE_PROPERTIES.forEach((name) => host.style?.removeProperty(name));
  }

  function upsertStyle(root, id, css) {
    if (!root?.querySelector) return;
    [
      '#veloura-component-style',
      '#veloura-search-style',
      'style[data-veloura-dark-search-v71]',
      'style[data-veloura-search-glass-v72]',
      'style[data-veloura-search-clean-v76]'
    ].forEach((selector) => root.querySelectorAll(selector).forEach((node) => node.remove()));

    let style = root.querySelector(`#${id}`);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      root.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;
  }

  function isInlineSearch(host) {
    return Boolean(
      host?.classList?.contains('veloura-header-search-component') ||
      host?.closest?.('.veloura-search-surface')
    );
  }

  function cleanSearchClasses(root) {
    root.querySelectorAll?.('.veloura-search-clear, .veloura-search-material').forEach((node) => {
      node.classList.remove(
        'veloura-search-clear',
        'veloura-search-material',
        DARK,
        LIGHT
      );
    });
  }

  function searchSurfaceCandidate(root) {
    const selectors = [
      'form',
      '.s-search-form',
      "[part~='form']",
      '.s-search-container',
      '.s-search-wrapper',
      "[part~='container']",
      "[part~='wrapper']"
    ];
    for (const selector of selectors) {
      const found = root.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  function paintSearchRoot(host, root) {
    const inline = isInlineSearch(host);
    const dark = isDarkMode();
    cleanSearchClasses(root);

    const internals = root.querySelectorAll(`
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
    `);

    if (inline) {
      internals.forEach((node) => node.classList.add('veloura-search-clear'));
    } else {
      const surface = searchSurfaceCandidate(root);
      if (surface) {
        surface.classList.add('veloura-search-material', dark ? DARK : LIGHT);
      }
    }

    root.querySelectorAll(`
      .s-search-results,
      .s-search-results-wrapper,
      .s-search-result-panel,
      [part~='results'],
      [part~='panel']
    `).forEach((node) => {
      node.classList.add('veloura-search-material', dark ? DARK : LIGHT);
    });
  }

  function findPanel(root) {
    for (const selector of PANEL_SELECTORS) {
      const element = root.querySelector?.(selector);
      if (element) return element;
    }
    return null;
  }

  function paintComponentPanel(host, root) {
    root.querySelectorAll?.(`.${PANEL}`).forEach((node) => {
      node.classList.remove(PANEL, MATERIAL, DARK, LIGHT, THEME);
    });

    const panel = findPanel(root);
    if (!panel) return;

    setMode(panel);
    panel.classList.add(PANEL);
    if (generalGlassEnabled()) panel.classList.add(MATERIAL);
  }

  function observeRoot(root) {
    if (!root || observedRoots.has(root) || typeof MutationObserver !== 'function') return;
    const observer = new MutationObserver(() => syncSoon());
    observer.observe(root, { childList: true, subtree: true });
    observedRoots.add(root);
  }

  function decorateHost(host) {
    if (!host) return;
    clearLegacyHost(host);
    setMode(host);

    if (host.matches('salla-search')) {
      host.classList.add('veloura-search-host');
    }

    const apply = () => {
      const root = host.shadowRoot;
      if (!root) return;

      upsertStyle(root, STYLE_ID, componentCss);
      if (host.matches('salla-search')) {
        upsertStyle(root, SEARCH_STYLE_ID, searchCss);
        paintSearchRoot(host, root);
      } else {
        paintComponentPanel(host, root);
      }

      observeRoot(root);
      scan(root);
    };

    apply();

    if (typeof host.componentOnReady === 'function' && !host.__velouraV84Ready) {
      host.__velouraV84Ready = true;
      Promise.resolve(host.componentOnReady()).then(apply).catch(() => {});
    }
  }

  function scheduleHost(host) {
    if (!host || queued.has(host)) return;
    queued.add(host);
    window.requestAnimationFrame(() => {
      queued.delete(host);
      decorateHost(host);
    });
  }

  function markDocumentSurfaces(scope = document) {
    const body = document.body;
    if (!body) return;

    const outerHeaderSelector =
      '.veloura-header-tabs-stack.veloura-header-tabs-stack--blur > .veloura-header-tabs-stack__container > .veloura-header-tabs-stack__surface';
    const fallbackHeaderSelector =
      '.store-header.veloura-top-enabled.veloura-top-blur #mainnav.main-nav-container > .inner';
    const outerHeaders = Array.from(document.querySelectorAll(outerHeaderSelector));
    const fallbackHeaders = Array.from(document.querySelectorAll(fallbackHeaderSelector));

    if (outerHeaders.length) {
      outerHeaders.forEach((element) => markMaterial(element, 'veloura-header'));
      fallbackHeaders.forEach((element) => {
        element.classList.remove(
          MATERIAL,
          'veloura-header',
          THEME,
          LIGHT,
          DARK
        );
      });
    } else {
      fallbackHeaders.forEach((element) => markMaterial(element, 'veloura-header'));
    }

    scope.querySelectorAll?.('.veloura-search-surface').forEach((element) => {
      const enabled = Boolean(
        element.closest('.veloura-header-tabs-stack--blur') ||
        element.closest('.store-header.veloura-top-blur') ||
        generalGlassEnabled()
      );
      if (enabled) markMaterial(element, 'veloura-search-shell');
      else unmarkMaterial(element);
    });
scope.querySelectorAll?.('.mm-ocd.mm-ocd--open .mm-ocd__content').forEach((element) => {
      const sideGlass =
        document.documentElement.classList.contains('veloura-side-cats-glass') ||
        body.classList.contains('veloura-side-cats-glass');
      if (sideGlass) markMaterial(element, 'veloura-side-menu');
      else unmarkMaterial(element);
    });

    const customPanels = [
      '.veloura-popup__box',
      '.swal2-popup:not(.swal2-toast)',
      '.modal-content'
    ];
    scope.querySelectorAll?.(customPanels.join(',')).forEach((element) => {
      setMode(element);
      element.classList.add(PANEL);
      if (generalGlassEnabled()) element.classList.add(MATERIAL);
      else element.classList.remove(MATERIAL);
    });

    scope.querySelectorAll?.('.veloura-quick-view-modal__dialog, .veloura-qv-full__dialog').forEach((element) => {
      setMode(element);
      element.classList.add(PANEL);
      if (generalGlassEnabled() || body.classList.contains('veloura-quick-view-overlay-blur')) {
        element.classList.add(MATERIAL);
      } else {
        element.classList.remove(MATERIAL);
      }
    });

    scope.querySelectorAll?.('.veloura-product-page .sticky-product-bar.veloura-product-sticky-bar').forEach((element) => {
      const fixed =
        body.classList.contains('veloura-product-sticky-active') ||
        body.classList.contains('is-sticky-product-bar') ||
        element.closest('.veloura-product-mobile-sticky-enabled');
      if (generalGlassEnabled() && fixed) markMaterial(element, 'veloura-sticky-product');
      else unmarkMaterial(element);
    });

    /* Product cards are an explicit exclusion boundary. */
    scope.querySelectorAll?.('.s-product-card-entry').forEach((card) => {
      card.classList.remove(THEME, MATERIAL, LIGHT, DARK, PANEL);
      card.querySelectorAll(`.${MATERIAL}, .${THEME}, .${PANEL}`).forEach((node) => {
        node.classList.remove(THEME, MATERIAL, LIGHT, DARK, PANEL);
      });
    });
  }

  function scan(scope = document) {
    markDocumentSurfaces(scope);
    if (scope.matches?.(COMPONENT_SELECTOR)) scheduleHost(scope);
    scope.querySelectorAll?.(COMPONENT_SELECTOR).forEach(scheduleHost);
  }

  function syncSoon() {
    [0, 50, 160, 380, 850, 1600].forEach((delay) => {
      window.setTimeout(() => scan(document), delay);
    });
  }

  function registerSallaHooks() {
    const api = window.Salla || window.salla;
    if (!api?.onReady) return;
    api.onReady(() => {
      const hooks = api.hooks;
      if (hooks?.registerHook) {
        COMPONENTS.forEach((component) => {
          try {
            hooks.registerHook(component, 'componentDidLoad', (element) => {
              decorateHost(element);
              syncSoon();
            });
          } catch (_) {}
        });
      }
      syncSoon();
    });
  }

  function init() {
    document.documentElement.dataset.velouraGlassBridge = VERSION;
    registerSallaHooks();
    syncSoon();

    if (typeof MutationObserver === 'function') {
      const domObserver = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node.nodeType === 1) scan(node);
          });
        });
      });
      domObserver.observe(document.documentElement, { childList: true, subtree: true });

      const modeObserver = new MutationObserver(syncSoon);
      modeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      if (document.body) {
        modeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class', 'data-theme']
        });
      }
    }

    document.addEventListener('theme::ready', syncSoon);
    window.addEventListener('veloura:theme-changed', syncSoon);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();