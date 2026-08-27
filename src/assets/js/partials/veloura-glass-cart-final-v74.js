/* ========================================================================
   Veloura V74
   - Runtime glass-class synchronization.
   - Strong Salla-search secondary-color bridge.
   - Product-card add-to-cart clickable-shadow repair and safe fallback.
   ======================================================================== */

const SEARCH_STYLE_ID = 'veloura-search-secondary-v74';
const CART_STYLE_ID = 'veloura-cart-click-v74';

const watchedSearchRoots = new WeakSet();
const watchedCartRoots = new WeakSet();

function isDark() {
  return (
    document.documentElement.classList.contains('dark') ||
    document.body?.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark'
  );
}

function important(element, name, value) {
  element?.style?.setProperty(name, value, 'important');
}

function syncGlassClasses() {
  const html = document.documentElement;
  const body = document.body;
  if (!body) return;

  const sideSettings = window.velouraSideCategoriesSettings || {};
  const sideGlass =
    sideSettings.glass === true ||
    sideSettings.glass === 'true' ||
    html.classList.contains('veloura-side-cats-glass') ||
    body.classList.contains('veloura-side-cats-glass');

  html.classList.toggle('veloura-side-cats-glass', sideGlass);
  body.classList.toggle('veloura-side-cats-glass', sideGlass);
}

/* ------------------------------------------------------------------------
   Search
   ------------------------------------------------------------------------ */

const SEARCH_STYLE = `
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
    color: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-text: var(--veloura-dark-primary-text, #ffffff) !important;
    --color-muted: var(--veloura-dark-secondary-text, #b7c3cf) !important;
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
`;

function inlineSearch(host) {
  return (
    host.classList.contains('veloura-header-search-component') ||
    Boolean(host.closest('.veloura-search-surface'))
  );
}

function ensureShadowStyle(root, id, text) {
  let style = root.querySelector(`style[data-${id}]`);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute(`data-${id}`, 'true');
    root.appendChild(style);
  }
  if (style.textContent !== text) style.textContent = text;
}

function styleSearch(host) {
  if (!host) return;

  const inline = inlineSearch(host);
  host.setAttribute('data-veloura-inline', inline ? 'true' : 'false');
  host.setAttribute('data-veloura-dark', isDark() ? 'true' : 'false');

  [
    '--s-search-input-bg',
    '--s-search-input-background',
    '--s-search-bg',
    '--search-input-bg',
    '--search-background',
    '--color-grey',
    '--color-grey-light',
    '--color-grey-lighter',
  ].forEach((name) => important(host, name, 'transparent'));

  if (inline) {
    important(host, 'background', 'transparent');
    important(host, 'background-color', 'transparent');
    important(host, 'box-shadow', 'none');
  }

  const root = host.shadowRoot;
  if (!root) return;

  ensureShadowStyle(root, SEARCH_STYLE_ID, SEARCH_STYLE);

  if (inline) {
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
      important(element, 'background', 'transparent');
      important(element, 'background-color', 'transparent');
      important(element, 'background-image', 'none');
      important(element, 'border-color', 'transparent');
      important(element, 'box-shadow', 'none');
    });
  }

  if (!watchedSearchRoots.has(root)) {
    const observer = new MutationObserver(() => styleSearch(host));
    observer.observe(root, { childList: true, subtree: true });
    watchedSearchRoots.add(root);
  }
}

function watchSearch(host) {
  styleSearch(host);
  if (typeof host.componentOnReady === 'function') {
    host.componentOnReady().then(() => styleSearch(host)).catch(() => {});
  }
}

/* ------------------------------------------------------------------------
   Product-card add-to-cart click repair
   ------------------------------------------------------------------------ */

const CART_STYLE = `
  :host {
    position: relative !important;
    z-index: 60 !important;
    display: flex !important;
    width: 100% !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    touch-action: manipulation !important;
  }

  salla-button,
  salla-quick-buy,
  salla-mini-checkout-widget,
  button,
  .s-button-element,
  .s-button-btn,
  [part~='button'] {
    position: relative !important;
    z-index: 80 !important;
    display: flex !important;
    width: 100% !important;
    min-height: inherit !important;
    pointer-events: auto !important;
    cursor: pointer !important;
    touch-action: manipulation !important;
  }
`;

function findClickable(root, depth = 0) {
  if (!root || depth > 5) return null;

  const direct = root.querySelector?.(
    'button:not([disabled]), .s-button-element:not([disabled]), ' +
    '.s-button-btn:not([disabled]), [part~="button"]:not([disabled])'
  );
  if (direct) return direct;

  const nested = root.querySelectorAll?.(
    'salla-button, salla-quick-buy, salla-mini-checkout-widget'
  ) || [];

  for (const component of nested) {
    if (component.shadowRoot) {
      const found = findClickable(component.shadowRoot, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function styleCartComponent(component) {
  if (!component) return;

  important(component, 'position', 'relative');
  important(component, 'z-index', '60');
  important(component, 'pointer-events', 'auto');
  important(component, 'cursor', 'pointer');
  important(component, 'touch-action', 'manipulation');

  const card = component.closest?.('.s-product-card-entry');
  const footer = component.closest?.('.s-product-card-content-footer');

  if (card) {
    important(card, 'isolation', 'isolate');
  }

  if (footer) {
    important(footer, 'position', 'relative');
    important(footer, 'z-index', '60');
    important(footer, 'pointer-events', 'auto');
  }

  const root = component.shadowRoot;
  if (!root) return;

  ensureShadowStyle(root, CART_STYLE_ID, CART_STYLE);

  root.querySelectorAll(
    'salla-button, salla-quick-buy, salla-mini-checkout-widget, ' +
    'button, .s-button-element, .s-button-btn, [part~="button"]'
  ).forEach((element) => {
    important(element, 'position', 'relative');
    important(element, 'z-index', '80');
    important(element, 'pointer-events', 'auto');
    important(element, 'cursor', 'pointer');
    important(element, 'touch-action', 'manipulation');
  });

  if (!watchedCartRoots.has(root)) {
    const observer = new MutationObserver(() => styleCartComponent(component));
    observer.observe(root, { childList: true, subtree: true });
    watchedCartRoots.add(root);
  }
}

function watchCart(component) {
  styleCartComponent(component);
  if (typeof component.componentOnReady === 'function') {
    component.componentOnReady()
      .then(() => styleCartComponent(component))
      .catch(() => {});
  }
}

async function fallbackAddToCart(host) {
  if (!host || host.dataset.velouraV74Adding === '1') return;

  const status = String(host.getAttribute('product-status') || '').toLowerCase();
  if (status && status !== 'sale') return;

  const productId = host.getAttribute('product-id');
  if (!productId) return;

  const productType = String(
    host.getAttribute('product-type') || 'product'
  ).toLowerCase();

  const card = host.closest('.s-product-card-entry');
  const productUrl = card?.querySelector(
    '.s-product-card-image a, .s-product-card-content-title a'
  )?.href;

  /* Complex product types must open the product page for option selection. */
  if (['booking', 'donation', 'auction'].includes(productType)) {
    if (productUrl) window.location.href = productUrl;
    return;
  }

  const api = window.salla || window.Salla;
  const addItem = api?.cart?.addItem;

  if (typeof addItem !== 'function') {
    if (productUrl) window.location.href = productUrl;
    return;
  }

  host.dataset.velouraV74Adding = '1';
  host.setAttribute('loading', 'true');

  try {
    await addItem.call(api.cart, Number(productId), 1);
  } catch (firstError) {
    try {
      await addItem.call(api.cart, {
        id: Number(productId),
        quantity: 1,
      });
    } catch (secondError) {
      if (productUrl) window.location.href = productUrl;
    }
  } finally {
    host.dataset.velouraV74Adding = '0';
    host.removeAttribute('loading');
  }
}

function installFallbackClick() {
  if (window.__velouraV74CartFallbackReady) return;
  window.__velouraV74CartFallbackReady = true;

  document.addEventListener('click', (event) => {
    const path = event.composedPath?.() || [];
    const host = path.find(
      (node) =>
        node?.tagName === 'SALLA-ADD-PRODUCT-BUTTON' &&
        node.closest?.('.s-product-card-entry')
    );

    if (!host) return;

    styleCartComponent(host);

    /* If Salla rendered a real clickable button, let its native handler run. */
    const clickable = host.shadowRoot
      ? findClickable(host.shadowRoot)
      : null;

    if (clickable) return;

    event.preventDefault();
    event.stopPropagation();
    fallbackAddToCart(host);
  }, true);
}

/* ------------------------------------------------------------------------
   Runtime scanning
   ------------------------------------------------------------------------ */

function scan(scope = document) {
  if (scope.matches?.('salla-search')) watchSearch(scope);
  if (scope.matches?.('salla-add-product-button')) watchCart(scope);

  scope.querySelectorAll?.('salla-search').forEach(watchSearch);
  scope.querySelectorAll?.(
    '.s-product-card-entry salla-add-product-button'
  ).forEach(watchCart);
}

function syncAll() {
  syncGlassClasses();
  scan(document);
}

function start() {
  syncAll();
  installFallbackClick();

  const observer = new MutationObserver((records) => {
    syncGlassClasses();

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

  [250, 700, 1500, 3000, 6000].forEach((delay) => {
    window.setTimeout(syncAll, delay);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export default syncAll;
