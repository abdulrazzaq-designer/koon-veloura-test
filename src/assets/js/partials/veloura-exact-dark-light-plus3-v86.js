/* Veloura V86 — root dark contract bridge for Salla Shadow DOM only. */
(() => {
  'use strict';

  const STYLE_ID = 'veloura-shadow-contract';
  const DOCUMENT_STYLE_ID = 'veloura-document-contract';
  const DOCUMENT_CSS = "/* ========================================================================\n   Veloura V86 — exact dark secondary + light glass +3%\n\n   Architecture:\n   1) The root html/body .dark class is the only light-DOM theme switch.\n   2) Light selectors are mirrored by html.dark body / html body.dark selectors.\n   3) Each glass component has one visible paint owner; nested wrappers are clear.\n   4) Product-card badges and solid action buttons keep their own configured colors.\n   5) Salla Shadow DOM components are handled by the V86 bridge, using the same\n      root state and the same material tokens.\n   ======================================================================== */\n\n:root,\nhtml body {\n  /* Neutral light glass: silver enough to separate from white, still translucent. */\n  --veloura-glass-surface: rgba(230, 232, 235, .69);\n  --veloura-glass-solid: #e6e8eb;\n  --veloura-edge-top: rgba(100, 116, 139, .11);\n  --veloura-edge-bottom: rgba(100, 116, 139, .0495);\n  --veloura-shadow: rgba(15, 23, 42, .055);\n  --veloura-overlay: rgba(15, 23, 42, .16);\n  --veloura-control: rgba(255, 255, 255, .48);\n  --veloura-primary-text: var(--color-text, #111827);\n  --veloura-secondary-text: var(--color-grey, #64748b);\n  --veloura-filter: blur(20px) saturate(124%) brightness(101%);\n\n  /* Redirect every older glass consumer to the same V86 contract. */\n  --veloura-glass-source: #e6e8eb;\n  --veloura-glass-surface: var(--veloura-glass-surface);\n  --veloura-glass-edge-top: var(--veloura-edge-top);\n  --veloura-glass-edge-bottom: var(--veloura-edge-bottom);\n  --veloura-glass-shadow: var(--veloura-shadow);\n  --veloura-glass-filter: var(--veloura-filter);\n  --veloura-global-glass-bg: var(--veloura-glass-surface);\n  --veloura-global-glass-layer: none;\n  --veloura-global-glass-edge-top: var(--veloura-edge-top);\n  --veloura-global-glass-edge-bottom: var(--veloura-edge-bottom);\n  --veloura-global-glass-shadow: var(--veloura-shadow);\n  --veloura-global-glass-filter: var(--veloura-filter);\n  --veloura-global-glass-overlay: var(--veloura-overlay);\n  --veloura-global-glass-control: var(--veloura-control);\n}\n\nhtml.dark,\nhtml.dark body,\nhtml body.dark {\n  /* Telegram-like dark glass: preserve the configured secondary hue, but keep\n     enough transparency for real backdrop blur and subtle edge separation. */\n  --veloura-dark-source: var(--veloura-dark-secondary-bg, #010612);\n\n  /* Telegram-like dark tint:\n     preserve the configured secondary hue, lift it only slightly so floating\n     glass never disappears into a similar dark page, then add real alpha. */\n  --veloura-dark-tint: color-mix(\n    in srgb,\n    var(--veloura-dark-source) 94%,\n    white 6%\n  );\n  --veloura-glass-surface: color-mix(\n    in srgb,\n    var(--veloura-dark-tint) 60%,\n    transparent\n  );\n  --veloura-glass-solid: var(--veloura-dark-source);\n\n  /* Top edge is deliberately more transparent than the bottom edge. */\n  --veloura-edge-top: rgba(255, 255, 255, .040);\n  --veloura-edge-bottom: rgba(255, 255, 255, .085);\n  --veloura-shadow: rgba(0, 0, 0, .27);\n  --veloura-overlay: rgba(0, 0, 0, .30);\n  --veloura-filter: blur(24px) saturate(200%);\n  --veloura-control: color-mix(\n    in srgb,\n    var(--veloura-dark-tint) 82%,\n    transparent\n  );\n  --veloura-primary-text: var(--veloura-dark-primary-text, #ffffff);\n  --veloura-secondary-text: var(--veloura-dark-secondary-text, #cccccc);\n\n  --veloura-glass-source: var(--veloura-dark-source);\n  --veloura-glass-surface: var(--veloura-glass-surface);\n  --veloura-glass-edge-top: var(--veloura-edge-top);\n  --veloura-glass-edge-bottom: var(--veloura-edge-bottom);\n  --veloura-glass-shadow: var(--veloura-shadow);\n  --veloura-global-glass-bg: var(--veloura-glass-surface);\n  --veloura-global-glass-edge-top: var(--veloura-edge-top);\n  --veloura-global-glass-edge-bottom: var(--veloura-edge-bottom);\n  --veloura-global-glass-shadow: var(--veloura-shadow);\n  --veloura-global-glass-overlay: var(--veloura-overlay);\n  --veloura-global-glass-control: var(--veloura-control);\n}\n\n/* ------------------------------------------------------------------------\n   One shared material. These selectors point only at the visible surface.\n   No gradient edge, no duplicate inset border, no full-screen blur.\n   ------------------------------------------------------------------------ */\nhtml body :is(\n  .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface,\n  .veloura-search-surface,\n  .veloura-glass,\n  .veloura-glass-surface,\n  .veloura-popup .veloura-popup__box,\n  .swal2-container .swal2-popup:not(.swal2-toast),\n  .s-modal .s-salla-modal-body,\n  .s-modal .s-modal-body,\n  .s-modal .s-modal-content,\n  .s-salla-modal-body,\n  .s-modal-body,\n  .s-modal-content\n),\nhtml.veloura-side-cats-glass body .mm-ocd.mm-ocd--open .mm-ocd__content,\nhtml body.veloura-side-cats-glass .mm-ocd.mm-ocd--open .mm-ocd__content {\n  box-sizing: border-box !important;\n  background: var(--veloura-glass-surface) !important;\n  background-color: var(--veloura-glass-surface) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline-start: 0 !important;\n  border-inline-end: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  filter: none !important;\n  box-shadow: 0 8px 24px var(--veloura-shadow) !important;\n}\n\n\n\n/* Quick-view rules use the exact parent chain to beat the late inline V27 style. */\nhtml body.veloura-quick-view-overlay-blur\n  .veloura-qv-full\n  .veloura-qv-full__dialog,\nhtml body.veloura-quick-view-overlay-blur\n  .veloura-quick-view-modal\n  .veloura-quick-view-modal__dialog {\n  box-sizing: border-box !important;\n  background: var(--veloura-glass-surface) !important;\n  background-color: var(--veloura-glass-surface) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline-start: 0 !important;\n  border-inline-end: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  filter: none !important;\n  box-shadow: 0 8px 24px var(--veloura-shadow) !important;\n}\n\n/* Product-page sticky bar receives glass only while its sticky mode is active. */\n@media (max-width: 767px) {\n  html body.veloura-glass-effect.is-sticky-product-bar\n    .veloura-product-page\n    .sticky-product-bar.veloura-product-sticky-bar,\n  html body.veloura-glass-effect.veloura-product-sticky-active\n    .veloura-product-page\n    .sticky-product-bar.veloura-product-sticky-bar,\n  html body.veloura-glass-effect\n    .veloura-product-page.veloura-product-mobile-sticky-enabled\n    .sticky-product-bar.veloura-product-sticky-bar {\n    background: var(--veloura-glass-surface) !important;\n    background-color: var(--veloura-glass-surface) !important;\n    background-image: none !important;\n    border-top: 1px solid var(--veloura-edge-top) !important;\n    border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n    border-inline: 0 !important;\n    -webkit-backdrop-filter: var(--veloura-filter) !important;\n    backdrop-filter: var(--veloura-filter) !important;\n    box-shadow: 0 -8px 24px var(--veloura-shadow) !important;\n  }\n}\n\n/* ------------------------------------------------------------------------\n   Header: the stack surface owns the material. Every nested Theme Raed / \n   Veloura layer is transparent, so an old gray background cannot cover it.\n   ------------------------------------------------------------------------ */\nhtml body .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface :is(\n  .store-header,\n  #mainnav.main-nav-container,\n  #mainnav.main-nav-container > .inner,\n  .main-nav-container,\n  .main-nav-container > .inner,\n  .veloura-header-container,\n  .veloura-header-grid,\n  .veloura-home-tabs,\n  .veloura-home-tabs__inner\n) {\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  border-color: transparent !important;\n  box-shadow: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n/* Header/search decorative pseudo layers must not paint a second material. */\nhtml body .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface::before,\nhtml body .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface::after,\nhtml body .veloura-search-surface::before,\nhtml body .veloura-search-surface::after {\n  content: none !important;\n  display: none !important;\n  background: none !important;\n  border: 0 !important;\n  box-shadow: none !important;\n}\n\n/* ------------------------------------------------------------------------\n   Dark header + detached header search — Telegram-like floating glass.\n   This intentionally does NOT target the bottom-navigation search panel.\n   ------------------------------------------------------------------------ */\n/* Dark header always inherits the merchant's secondary hue. */\nhtml.dark body .veloura-header-tabs-stack,\nhtml body.dark .veloura-header-tabs-stack {\n  --veloura-header-solid-bg: var(--veloura-dark-secondary-bg, #010612) !important;\n}\n\n/* Glass option ON: Telegram-like tinted glass. */\nhtml.dark body .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface,\nhtml body.dark .veloura-header-tabs-stack--blur .veloura-header-tabs-stack__surface,\nhtml.dark body .veloura-header-tabs-stack--blur .veloura-detached-search.veloura-search-surface,\nhtml body.dark .veloura-header-tabs-stack--blur .veloura-detached-search.veloura-search-surface {\n  box-sizing: border-box !important;\n  background: var(--veloura-glass-surface) !important;\n  background-color: var(--veloura-glass-surface) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  filter: none !important;\n  box-shadow:\n    0 10px 28px var(--veloura-shadow),\n    inset 0 1px 0 rgba(255,255,255,.018) !important;\n}\n\n/* Glass option OFF: exact secondary color, no blur. */\nhtml.dark body .veloura-header-tabs-stack:not(.veloura-header-tabs-stack--blur) .veloura-header-tabs-stack__surface,\nhtml body.dark .veloura-header-tabs-stack:not(.veloura-header-tabs-stack--blur) .veloura-header-tabs-stack__surface,\nhtml.dark body .veloura-header-tabs-stack:not(.veloura-header-tabs-stack--blur) .veloura-detached-search.veloura-search-surface,\nhtml body.dark .veloura-header-tabs-stack:not(.veloura-header-tabs-stack--blur) .veloura-detached-search.veloura-search-surface {\n  background: var(--veloura-dark-secondary-bg, #010612) !important;\n  background-color: var(--veloura-dark-secondary-bg, #010612) !important;\n  background-image: none !important;\n  border-top: 1px solid rgba(255,255,255,.035) !important;\n  border-bottom: 1px solid rgba(255,255,255,.060) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n/* Only the outer stack/search surfaces paint glass; old nested gray layers stay clear. */\nhtml.dark body .veloura-header-tabs-stack__surface :is(\n  .store-header,\n  #mainnav.main-nav-container,\n  #mainnav.main-nav-container > .inner,\n  .main-nav-container,\n  .main-nav-container > .inner,\n  .veloura-header-container,\n  .veloura-header-grid,\n  .veloura-home-tabs,\n  .veloura-home-tabs__inner\n),\nhtml body.dark .veloura-header-tabs-stack__surface :is(\n  .store-header,\n  #mainnav.main-nav-container,\n  #mainnav.main-nav-container > .inner,\n  .main-nav-container,\n  .main-nav-container > .inner,\n  .veloura-header-container,\n  .veloura-header-grid,\n  .veloura-home-tabs,\n  .veloura-home-tabs__inner\n) {\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  border-color: transparent !important;\n  box-shadow: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n/* The detached header search owns one glass layer. Its Salla input stays transparent. */\nhtml.dark body .veloura-search-surface,\nhtml body.dark .veloura-search-surface {\n  --veloura-search-inner-bg: transparent !important;\n  --veloura-top-text: var(--veloura-dark-primary-text, #ffffff) !important;\n  --color-text: var(--veloura-dark-primary-text, #ffffff) !important;\n  --color-muted: var(--veloura-dark-secondary-text, #cccccc) !important;\n  --s-search-bg: transparent !important;\n  --s-search-input-bg: transparent !important;\n  --s-search-input-background: transparent !important;\n  --search-input-bg: transparent !important;\n  --search-background: transparent !important;\n}\n\nhtml.dark body .veloura-search-surface > salla-search.veloura-header-search-component,\nhtml body.dark .veloura-search-surface > salla-search.veloura-header-search-component {\n  --veloura-search-inner-bg: transparent !important;\n  --veloura-top-text: var(--veloura-dark-primary-text, #ffffff) !important;\n  background: transparent !important;\n  background-color: transparent !important;\n  border: 0 !important;\n  box-shadow: none !important;\n  filter: none !important;\n}\n\n/* ------------------------------------------------------------------------\n   Search: outer .veloura-search-surface is the only painted input surface.\n   The web-component host and exposed parts remain transparent.\n   ------------------------------------------------------------------------ */\nhtml body .veloura-search-surface {\n  color: var(--veloura-primary-text) !important;\n  overflow: hidden;\n  --color-text: var(--veloura-primary-text) !important;\n  --color-muted: var(--veloura-secondary-text) !important;\n  --s-search-bg: transparent !important;\n  --s-search-input-bg: transparent !important;\n  --s-search-input-background: transparent !important;\n  --search-input-bg: transparent !important;\n  --search-background: transparent !important;\n}\n\nhtml body .veloura-search-surface > salla-search,\nhtml body .veloura-search-surface salla-search.veloura-header-search-component {\n  display: block !important;\n  width: 100% !important;\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  border: 0 !important;\n  box-shadow: none !important;\n  color: inherit !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n}\n\nhtml body .veloura-search-surface salla-search::part(form),\nhtml body .veloura-search-surface salla-search::part(container),\nhtml body .veloura-search-surface salla-search::part(wrapper),\nhtml body .veloura-search-surface salla-search::part(input) {\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  border-color: transparent !important;\n  box-shadow: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n}\n\nhtml.dark body .veloura-search-surface,\nhtml body.dark .veloura-search-surface {\n  color: var(--veloura-dark-primary-text, #ffffff) !important;\n  --color-text: var(--veloura-dark-primary-text, #ffffff) !important;\n  --color-muted: var(--veloura-dark-secondary-text, #cccccc) !important;\n}\n\nhtml.dark body .veloura-search-surface :is(input, textarea),\nhtml body.dark .veloura-search-surface :is(input, textarea) {\n  background: transparent !important;\n  background-color: transparent !important;\n  border-color: transparent !important;\n  color: var(--veloura-dark-primary-text, #ffffff) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body .veloura-search-surface :is(input, textarea)::placeholder,\nhtml body.dark .veloura-search-surface :is(input, textarea)::placeholder {\n  color: var(--veloura-dark-secondary-text, #cccccc) !important;\n  -webkit-text-fill-color: currentColor !important;\n  opacity: .78 !important;\n}\n\n/* ------------------------------------------------------------------------\n   Side menu — dark material contract.\n   Glass ON: use the exact dark-secondary source and the same Telegram-like\n   material as the header. The dedicated side-menu dark background is used\n   only when glass is OFF.\n   ------------------------------------------------------------------------ */\nhtml.dark.veloura-side-cats-glass body .mm-ocd.mm-ocd--open .mm-ocd__content,\nhtml.dark body.veloura-side-cats-glass .mm-ocd.mm-ocd--open .mm-ocd__content,\nhtml body.dark.veloura-side-cats-glass .mm-ocd.mm-ocd--open .mm-ocd__content {\n  --veloura-side-dark-glass-source: var(--veloura-dark-secondary-bg, #010612);\n  --veloura-side-dark-glass-tint: color-mix(\n    in srgb,\n    var(--veloura-side-dark-glass-source) 94%,\n    white 6%\n  );\n  --veloura-side-dark-glass-surface: color-mix(\n    in srgb,\n    var(--veloura-side-dark-glass-tint) 60%,\n    transparent\n  );\n\n  background: var(--veloura-side-dark-glass-surface) !important;\n  background-color: var(--veloura-side-dark-glass-surface) !important;\n  background-image: none !important;\n  border-top: 1px solid rgba(255, 255, 255, .040) !important;\n  border-bottom: 1px solid rgba(255, 255, 255, .085) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: blur(24px) saturate(200%) !important;\n  backdrop-filter: blur(24px) saturate(200%) !important;\n  filter: none !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, .27),\n    inset 0 1px 0 rgba(255, 255, 255, .018) !important;\n  color: var(--veloura-dark-side-menu-text, #ffffff) !important;\n}\n\nhtml.dark:not(.veloura-side-cats-glass) body .mm-ocd.mm-ocd--open .mm-ocd__content,\nhtml.dark body:not(.veloura-side-cats-glass) .mm-ocd.mm-ocd--open .mm-ocd__content,\nhtml body.dark:not(.veloura-side-cats-glass) .mm-ocd.mm-ocd--open .mm-ocd__content {\n  background: var(\n    --veloura-dark-side-menu-bg,\n    var(--veloura-dark-secondary-bg, #010612)\n  ) !important;\n  background-color: var(\n    --veloura-dark-side-menu-bg,\n    var(--veloura-dark-secondary-bg, #010612)\n  ) !important;\n  background-image: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  color: var(--veloura-dark-side-menu-text, #ffffff) !important;\n}\n\nhtml.dark body .mm-ocd.mm-ocd--open .mm-ocd__content :is(\n  a,\n  button,\n  span,\n  i,\n  svg,\n  .mm-spn--open,\n  .mm-spn--navbar\n),\nhtml body.dark .mm-ocd.mm-ocd--open .mm-ocd__content :is(\n  a,\n  button,\n  span,\n  i,\n  svg,\n  .mm-spn--open,\n  .mm-spn--navbar\n) {\n  color: var(--veloura-dark-side-menu-text, #ffffff) !important;\n  fill: currentColor !important;\n}\n\n/* ------------------------------------------------------------------------\n   Dialog text roles. Scope is limited to real dialog panels; no global recolor.\n   ------------------------------------------------------------------------ */\nhtml.dark body :is(\n  .veloura-popup__box,\n  .swal2-popup,\n  .s-salla-modal-body,\n  .s-modal-body,\n  .s-modal-content,\n  .veloura-qv-full__dialog,\n  .veloura-quick-view-modal__dialog\n) :is(\n  h1, h2, h3, h4, h5, h6,\n  .s-modal-title,\n  .veloura-qv-full__title,\n  .veloura-quick-view-modal__title\n):not(.s-product-card-promotion-title),\nhtml body.dark :is(\n  .veloura-popup__box,\n  .swal2-popup,\n  .s-salla-modal-body,\n  .s-modal-body,\n  .s-modal-content,\n  .veloura-qv-full__dialog,\n  .veloura-quick-view-modal__dialog\n) :is(\n  h1, h2, h3, h4, h5, h6,\n  .s-modal-title,\n  .veloura-qv-full__title,\n  .veloura-quick-view-modal__title\n):not(.s-product-card-promotion-title) {\n  color: var(--veloura-dark-primary-text, #ffffff) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body :is(\n  .veloura-popup__box,\n  .swal2-popup,\n  .s-salla-modal-body,\n  .s-modal-body,\n  .s-modal-content,\n  .veloura-qv-full__dialog,\n  .veloura-quick-view-modal__dialog\n) :is(\n  p, small, label,\n  .description,\n  .text-muted,\n  .veloura-qv-full__description,\n  .veloura-quick-view-modal__description,\n  .veloura-quick-view-modal__loading\n),\nhtml body.dark :is(\n  .veloura-popup__box,\n  .swal2-popup,\n  .s-salla-modal-body,\n  .s-modal-body,\n  .s-modal-content,\n  .veloura-qv-full__dialog,\n  .veloura-quick-view-modal__dialog\n) :is(\n  p, small, label,\n  .description,\n  .text-muted,\n  .veloura-qv-full__description,\n  .veloura-quick-view-modal__description,\n  .veloura-quick-view-modal__loading\n) {\n  color: var(--veloura-dark-secondary-text, #cccccc) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\n/* Backdrops dim only. They never blur the whole page. */\nhtml body.veloura-glass-effect :is(\n  .s-salla-modal-overlay,\n  .s-modal-overlay,\n  .s-modal-backdrop,\n  .modal-backdrop,\n  .veloura-qv-full__overlay,\n  .veloura-quick-view-modal__overlay,\n  .veloura-popup__overlay,\n  .swal2-container.swal2-backdrop-show\n) {\n  background: var(--veloura-overlay) !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n  box-shadow: none !important;\n}\n\n/* ------------------------------------------------------------------------\n   Product-card exclusion boundary: dark mode may style the card body/text,\n   but it must never replace promotional or solid action colors.\n   ------------------------------------------------------------------------ */\nhtml.dark body .s-product-card-entry :is(\n  .s-product-card-promotion-title,\n  .s-product-card-quantity,\n  .s-product-card-out-badge,\n  .veloura-pc-native-promo\n),\nhtml body.dark .s-product-card-entry :is(\n  .s-product-card-promotion-title,\n  .s-product-card-quantity,\n  .s-product-card-out-badge,\n  .veloura-pc-native-promo\n) {\n  background: var(--veloura-pc-promo-bg, var(--color-primary, #004d65)) !important;\n  background-color: var(--veloura-pc-promo-bg, var(--color-primary, #004d65)) !important;\n  background-image: none !important;\n  color: var(--veloura-pc-promo-text, #ffffff) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body .s-product-card-entry :is(\n  .s-product-card-promotion-title,\n  .s-product-card-quantity,\n  .s-product-card-out-badge,\n  .veloura-pc-native-promo\n) *,\nhtml body.dark .s-product-card-entry :is(\n  .s-product-card-promotion-title,\n  .s-product-card-quantity,\n  .s-product-card-out-badge,\n  .veloura-pc-native-promo\n) * {\n  color: inherit !important;\n  fill: currentColor !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body .s-product-card-entry salla-add-product-button.veloura-card-add-button,\nhtml body.dark .s-product-card-entry salla-add-product-button.veloura-card-add-button {\n  --color-primary: var(--veloura-product-button-bg, #004d65) !important;\n  --color-primary-reverse: var(--veloura-product-button-text, #ffffff) !important;\n  --button-background-color: var(--veloura-product-button-bg, #004d65) !important;\n  --button-border-color: var(--veloura-product-button-bg, #004d65) !important;\n  --button-text-color: var(--veloura-product-button-text, #ffffff) !important;\n  background: var(--veloura-product-button-bg, #004d65) !important;\n  background-color: var(--veloura-product-button-bg, #004d65) !important;\n  border-color: var(--veloura-product-button-bg, #004d65) !important;\n  color: var(--veloura-product-button-text, #ffffff) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body .s-product-card-entry .veloura-quick-view-btn,\nhtml body.dark .s-product-card-entry .veloura-quick-view-btn {\n  background: var(--veloura-quick-view-button-bg, #004d65) !important;\n  background-color: var(--veloura-quick-view-button-bg, #004d65) !important;\n  border-color: var(--veloura-quick-view-button-bg, #004d65) !important;\n  color: var(--veloura-quick-view-button-text, #ffffff) !important;\n  -webkit-text-fill-color: currentColor !important;\n}\n\nhtml.dark body .s-product-card-entry .veloura-quick-view-btn *,\nhtml body.dark .s-product-card-entry .veloura-quick-view-btn * {\n  color: inherit !important;\n  fill: currentColor !important;\n}\n\n/* Salla parts exposed to light DOM use the same exact material. */\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(body),\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(content),\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(panel),\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(surface) {\n  background: var(--veloura-glass-surface) !important;\n  background-color: var(--veloura-glass-surface) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  box-shadow: 0 8px 24px var(--veloura-shadow) !important;\n}\n\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(overlay),\nhtml body.veloura-glass-effect :is(\n  salla-localization-modal,\n  salla-user-menu,\n  salla-scopes,\n  salla-offer-modal,\n)::part(backdrop) {\n  background: var(--veloura-overlay) !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n}\n\n/* ========================================================================\n   V87 Dark Telegram Glass — Header + detached header search\n   ======================================================================== */\nhtml.dark body.dark.veloura-glass-effect #veloura-header-tabs-stack,\nhtml.dark body.veloura-glass-effect #veloura-header-tabs-stack,\nhtml body.dark.veloura-glass-effect #veloura-header-tabs-stack {\n  --veloura-header-solid-bg: var(--veloura-dark-secondary-bg, #010612) !important;\n  --veloura-source: var(--veloura-dark-secondary-bg, #010612);\n  --veloura-tint: color-mix(in srgb, var(--veloura-source) 94%, white 6%);\n  --veloura-glass: color-mix(in srgb, var(--veloura-tint) 60%, transparent);\n  --veloura-edge-top: rgba(255,255,255,.040);\n  --veloura-edge-bottom: rgba(255,255,255,.085);\n  --veloura-filter: blur(24px) saturate(200%);\n  --veloura-shadow: rgba(0,0,0,.27);\n}\n\n/* The header stack surface is the single glass paint owner in dark mode. */\nhtml.dark body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface,\nhtml.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface,\nhtml body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface {\n  background: var(--veloura-glass) !important;\n  background-color: var(--veloura-glass) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  filter: none !important;\n  box-shadow: 0 10px 30px var(--veloura-shadow), inset 0 1px 0 rgba(255,255,255,.018) !important;\n}\n\n/* Clear every old header paint layer so gray cannot cover the glass surface. */\nhtml.dark body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface :is(.store-header,#mainnav.main-nav-container,#mainnav.main-nav-container>.inner,.main-nav-container,.main-nav-container>.inner,.veloura-header-container,.veloura-header-grid,.veloura-home-tabs,.veloura-home-tabs__inner),\nhtml.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface :is(.store-header,#mainnav.main-nav-container,#mainnav.main-nav-container>.inner,.main-nav-container,.main-nav-container>.inner,.veloura-header-container,.veloura-header-grid,.veloura-home-tabs,.veloura-home-tabs__inner),\nhtml body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface :is(.store-header,#mainnav.main-nav-container,#mainnav.main-nav-container>.inner,.main-nav-container,.main-nav-container>.inner,.veloura-header-container,.veloura-header-grid,.veloura-home-tabs,.veloura-home-tabs__inner) {\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  border-color: transparent !important;\n  box-shadow: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n/* Detached mobile/desktop header search: separate floating glass pill. */\nhtml.dark body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface,\nhtml.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface,\nhtml body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface {\n  --veloura-search-inner-bg: transparent !important;\n  --veloura-top-text: var(--veloura-dark-primary-text,#fff) !important;\n  --s-search-bg: transparent !important;\n  --s-search-input-bg: transparent !important;\n  --s-search-input-background: transparent !important;\n  --search-input-bg: transparent !important;\n  --search-background: transparent !important;\n  background: var(--veloura-glass) !important;\n  background-color: var(--veloura-glass) !important;\n  background-image: none !important;\n  border-top: 1px solid var(--veloura-edge-top) !important;\n  border-bottom: 1px solid var(--veloura-edge-bottom) !important;\n  border-inline: 0 !important;\n  -webkit-backdrop-filter: var(--veloura-filter) !important;\n  backdrop-filter: var(--veloura-filter) !important;\n  filter: none !important;\n  box-shadow: 0 8px 24px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.018) !important;\n}\n\nhtml.dark body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface > salla-search,\nhtml.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface > salla-search,\nhtml body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface > salla-search {\n  background: transparent !important;\n  background-color: transparent !important;\n  border: 0 !important;\n  box-shadow: none !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n/* If glass is disabled, keep exact dark secondary as a solid surface. */\nhtml.dark body:not(.veloura-glass-effect) #veloura-header-tabs-stack .veloura-header-tabs-stack__surface,\nhtml body.dark:not(.veloura-glass-effect) #veloura-header-tabs-stack .veloura-header-tabs-stack__surface,\nhtml.dark body:not(.veloura-glass-effect) #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface,\nhtml body.dark:not(.veloura-glass-effect) #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface {\n  background: var(--veloura-dark-secondary-bg,#010612) !important;\n  background-color: var(--veloura-dark-secondary-bg,#010612) !important;\n  -webkit-backdrop-filter: none !important;\n  backdrop-filter: none !important;\n  filter: none !important;\n}\n\n@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {\n  :root,\n  html body {\n    --veloura-glass-surface: var(--veloura-glass-solid);\n  }\n}\n";
  const THEME_ATTR = 'data-veloura-theme';
  const ROLE_ATTR = 'data-veloura-role';
  const INLINE_ATTR = 'data-veloura-inline';

  const COMPONENTS = [
    'salla-login-modal',
    'salla-localization-modal',
    'salla-user-menu',
    'salla-scopes',
    'salla-offer-modal',
    'salla-gifting'
  ];

  const COMPONENT_SELECTOR = COMPONENTS.join(',');
  const observedShadowRoots = new WeakSet();
  let scanQueued = false;

  const LEGACY_STYLE_SELECTORS = [
    '#veloura-global-glass-shadow-style',
    '#veloura-shadow-style',
    '#veloura-search-shadow-style',
    '#veloura-component-style',
    '#veloura-search-style',
    'style[data-veloura-dark-search-v71]',
    'style[data-veloura-search-glass-v72]',
    'style[data-veloura-search-clean-v76]'
  ];

  const SHADOW_CSS = `
    :host {
      --v86-surface: rgba(230, 232, 235, .69);
      --v86-solid: #e6e8eb;
      --v86-edge-top: rgba(100, 116, 139, .11);
      --v86-edge-bottom: rgba(100, 116, 139, .0495);
      --v86-shadow: rgba(15, 23, 42, .055);
      --v86-overlay: rgba(15, 23, 42, .16);
      --v86-control: rgba(255, 255, 255, .48);
      --v86-primary: var(--color-text, #111827);
      --v86-secondary: var(--color-grey, #64748b);
      --v86-filter: blur(20px) saturate(124%) brightness(101%);
      color: var(--v86-primary);
    }

    :host([${THEME_ATTR}='dark']) {
      --v86-dark-source: var(--veloura-dark-secondary-bg, #010612);
      --v86-dark-tint: color-mix(in srgb, var(--v86-dark-source) 94%, white 6%);
      --v86-surface: color-mix(in srgb, var(--v86-dark-tint) 60%, transparent);
      --v86-solid: var(--v86-dark-source);
      --v86-edge-top: rgba(255, 255, 255, .040);
      --v86-edge-bottom: rgba(255, 255, 255, .085);
      --v86-shadow: rgba(0, 0, 0, .27);
      --v86-overlay: rgba(0, 0, 0, .30);
      --v86-filter: blur(24px) saturate(200%);
      --v86-control: color-mix(in srgb, var(--v86-dark-tint) 82%, transparent);
      --v86-primary: var(--veloura-dark-primary-text, #ffffff);
      --v86-secondary: var(--veloura-dark-secondary-text, #cccccc);
      color: var(--v86-primary);
      color-scheme: dark;
    }

    /* Hosts and full-screen wrappers never own the blur. */
    :host,
    .s-modal-wrapper,
    .s-modal-container,
    .s-login-modal,
    .s-auth-modal,
    .login-modal,
    .auth-modal,
    [part~='wrapper'],
    [part~='container'] {
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
      box-shadow: none !important;
    }

    .s-modal-wrapper,
    .s-modal-container,
    .s-login-modal,
    .s-auth-modal,
    .login-modal,
    .auth-modal,
    [part~='wrapper'],
    [part~='container'] {
      background: transparent !important;
      background-color: transparent !important;
      border-color: transparent !important;
    }

    .s-salla-modal-overlay,
    .s-modal-overlay,
    .s-modal-backdrop,
    .modal-backdrop,
    .backdrop,
    [part~='overlay'],
    [part~='backdrop'] {
      background: var(--v86-overlay) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
      box-shadow: none !important;
    }

    /* One real dialog/menu surface. */
    :host(:not([${ROLE_ATTR}='search'])) :is(
      .s-salla-modal-body,
      .s-modal-body,
      .s-modal-content,
      .modal-content,
      .s-sheet-container,
      .s-sheet-body,
      .s-sheet-content,
      .s-login-modal__body,
      .s-login-modal__content,
      .s-auth-modal__body,
      .s-auth-modal__content,
      .s-user-menu-wrapper,
      .s-user-menu-dropdown,
      .s-localization-modal,
      .s-scopes,
      .s-offer-modal,
      [part~='body'],
      [part~='content'],
      [part~='panel'],
      [part~='surface'],
      [part~='dialog'],
      [role='dialog']
    ) {
      box-sizing: border-box !important;
      background: var(--v86-surface) !important;
      background-color: var(--v86-surface) !important;
      background-image: none !important;
      border-top: 1px solid var(--v86-edge-top) !important;
      border-bottom: 1px solid var(--v86-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--v86-filter) !important;
      backdrop-filter: var(--v86-filter) !important;
      filter: none !important;
      box-shadow: 0 8px 24px var(--v86-shadow) !important;
      color: var(--v86-primary) !important;
    }

    :host([${THEME_ATTR}='dark']:not([${ROLE_ATTR}='search'])) :is(
      .s-salla-modal-body,
      .s-modal-body,
      .s-modal-content,
      .modal-content,
      .s-sheet-container,
      .s-sheet-body,
      .s-sheet-content,
      .s-login-modal__body,
      .s-login-modal__content,
      .s-auth-modal__body,
      .s-auth-modal__content,
      .s-user-menu-wrapper,
      .s-user-menu-dropdown,
      .s-localization-modal,
      .s-scopes,
      .s-offer-modal,
      [part~='body'],
      [part~='content'],
      [part~='panel'],
      [part~='surface'],
      [part~='dialog'],
      [role='dialog']
    ) :is(h1, h2, h3, h4, h5, h6, strong, [part~='title']) {
      color: var(--v86-primary) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    :host([${THEME_ATTR}='dark']:not([${ROLE_ATTR}='search'])) :is(
      .s-salla-modal-body,
      .s-modal-body,
      .s-modal-content,
      .modal-content,
      .s-sheet-container,
      .s-sheet-body,
      .s-sheet-content,
      .s-login-modal__body,
      .s-login-modal__content,
      .s-auth-modal__body,
      .s-auth-modal__content,
      .s-user-menu-wrapper,
      .s-user-menu-dropdown,
      .s-localization-modal,
      .s-scopes,
      .s-offer-modal,
      [part~='body'],
      [part~='content'],
      [part~='panel'],
      [part~='surface'],
      [part~='dialog'],
      [role='dialog']
    ) :is(p, small, label, .text-muted, [part~='description']) {
      color: var(--v86-secondary) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    /* Inline search: the outer light-DOM wrapper owns the material. */
    :host([${ROLE_ATTR}='search']) {
      display: block !important;
      width: 100% !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      color: var(--v86-primary) !important;
      --color-text: var(--v86-primary) !important;
      --color-muted: var(--v86-secondary) !important;
      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;
    }

    :host([${ROLE_ATTR}='search']) :is(
      form,
      .s-search-form,
      .s-search-container,
      .s-search-wrapper,
      .s-search-input-wrapper,
      [part~='form'],
      [part~='container'],
      [part~='wrapper'],
      [part~='input-wrapper']
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    :host([${ROLE_ATTR}='search']) :is(input, textarea, .s-search-input, [part~='input']) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      color: var(--v86-primary) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    :host([${ROLE_ATTR}='search']) :is(input, textarea, .s-search-input, [part~='input'])::placeholder {
      color: var(--v86-secondary) !important;
      -webkit-text-fill-color: currentColor !important;
      opacity: .78 !important;
    }

    /* Detached/global search needs its own visible form material. */
    :host([${ROLE_ATTR}='search'][${INLINE_ATTR}='false']) :is(
      form,
      .s-search-form,
      [part~='form']
    ) {
      background: var(--v86-surface) !important;
      background-color: var(--v86-surface) !important;
      border-top: 1px solid var(--v86-edge-top) !important;
      border-bottom: 1px solid var(--v86-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--v86-filter) !important;
      backdrop-filter: var(--v86-filter) !important;
      box-shadow: 0 8px 24px var(--v86-shadow) !important;
    }

    /* Results/dropdowns use the same material and text roles. */
    :host([${ROLE_ATTR}='search']) :is(
      .s-search-results,
      .s-search-results-container,
      .s-search-dropdown,
      [part~='results'],
      [part~='dropdown'],
      [role='listbox']
    ) {
      background: var(--v86-surface) !important;
      background-color: var(--v86-surface) !important;
      background-image: none !important;
      border-top: 1px solid var(--v86-edge-top) !important;
      border-bottom: 1px solid var(--v86-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--v86-filter) !important;
      backdrop-filter: var(--v86-filter) !important;
      box-shadow: 0 8px 24px var(--v86-shadow) !important;
      color: var(--v86-primary) !important;
    }

    input,
    select,
    textarea,
    .form-input,
    .s-form-control {
      color: var(--v86-primary) !important;
    }

    :host(:not([${ROLE_ATTR}='search'])) :is(
      input,
      select,
      textarea,
      .form-input,
      .s-form-control
    ) {
      background: var(--v86-control) !important;
      border-color: var(--v86-edge-top) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }



    /* ---------------------------------------------------------------
       Login modal contract
       - remove the native white block behind the close X
       - keep nested login wrappers transparent so one glass surface owns paint
       - in dark mode use translucent dark glass, not a white/opaque inner sheet
       --------------------------------------------------------------- */
    :host(salla-login-modal) {
      --v86-login-surface: rgba(230, 232, 235, .76);
      --v86-login-control: rgba(255, 255, 255, .44);
    }

    :host(salla-login-modal[${THEME_ATTR}='dark']) {
      --v86-login-surface: color-mix(
        in srgb,
        var(--veloura-dark-secondary-bg, #010612) 84%,
        transparent
      );
      --v86-login-control: color-mix(
        in srgb,
        var(--veloura-dark-secondary-bg, #010612) 72%,
        transparent
      );
    }

    :host(salla-login-modal) :is(
      .s-salla-modal-body,
      .s-modal-body,
      .s-modal-content,
      .modal-content,
      .s-login-modal__body,
      .s-login-modal__content,
      .s-auth-modal__body,
      .s-auth-modal__content,
      [part~='body'],
      [part~='content'],
      [part~='panel'],
      [part~='surface'],
      [part~='dialog'],
      [role='dialog']
    ) {
      background: var(--v86-login-surface) !important;
      background-color: var(--v86-login-surface) !important;
      background-image: none !important;
      border-color: var(--v86-edge-top) !important;
      -webkit-backdrop-filter: var(--v86-filter) !important;
      backdrop-filter: var(--v86-filter) !important;
      box-shadow: 0 10px 30px var(--v86-shadow) !important;
      color: var(--v86-primary) !important;
    }

    /* Native inner sheets are what created the large white rectangle. */
    :host(salla-login-modal) :is(
      .s-login-modal__body,
      .s-login-modal__content,
      .s-auth-modal__body,
      .s-auth-modal__content,
      [part~='body'],
      [part~='content']
    ) :is(
      form,
      .s-login-modal__form,
      .s-auth-modal__form,
      .bg-white,
      .bg-gray-50,
      .bg-gray-100
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    :host(salla-login-modal) :is(
      input,
      select,
      textarea,
      .form-input,
      .s-form-control
    ) {
      background: var(--v86-login-control) !important;
      background-color: var(--v86-login-control) !important;
      color: var(--v86-primary) !important;
      border-color: var(--v86-edge-top) !important;
    }

    /* Close X: never render a white square behind the icon. */
    :host(salla-login-modal) :is(
      .s-salla-modal-close,
      .s-modal-close,
      .s-login-modal__close,
      .s-login-modal-close,
      .modal-close,
      [part~='close'],
      button[aria-label='Close'],
      button[aria-label='close'],
      button[aria-label*='إغلاق']
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    :host(salla-login-modal) :is(
      .s-salla-modal-close,
      .s-modal-close,
      .s-login-modal__close,
      .s-login-modal-close,
      .modal-close,
      [part~='close'],
      button[aria-label='Close'],
      button[aria-label='close'],
      button[aria-label*='إغلاق']
    ) :is(svg, i, span) {
      background: transparent !important;
      box-shadow: none !important;
    }
    @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      :host { --v86-surface: var(--v86-solid); }
    }
  `;

  function installDocumentStyle() {
    const parent = document.body || document.head || document.documentElement;
    if (!parent) return;

    let style = document.getElementById(DOCUMENT_STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = DOCUMENT_STYLE_ID;
    }

    if (style.textContent !== DOCUMENT_CSS) style.textContent = DOCUMENT_CSS;

    /* Keep V86 after late inline/runtime styles so it remains the final contract. */
    if (style.parentNode !== parent || parent.lastElementChild !== style) {
      parent.appendChild(style);
    }
  }

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

  function removeLegacyState(host, shadowRoot) {
    [
      'veloura-theme',
      'veloura-glass',
      'veloura-glass--light',
      'veloura-glass--dark',
      'veloura-search-host',
      'veloura-panel'
    ].forEach((className) => host.classList.remove(className));

    [
      'data-veloura-dark',
      'data-veloura-glass',
      'data-veloura-inline-search',
      'data-veloura-search-dark',
      'data-veloura-search-inline',
      'data-veloura-glass-host'
    ].forEach((name) => host.removeAttribute(name));

    if (!shadowRoot?.querySelectorAll) return;
    LEGACY_STYLE_SELECTORS.forEach((selector) => {
      shadowRoot.querySelectorAll(selector).forEach((node) => node.remove());
    });
  }

  function installStyle(shadowRoot) {
    if (!shadowRoot) return;
    let style = shadowRoot.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      shadowRoot.appendChild(style);
    }
    if (style.textContent !== SHADOW_CSS) style.textContent = SHADOW_CSS;
  }

  function syncHost(host) {
    if (!host || host.nodeType !== 1) return;
    if (host.matches?.('[data-vbn-native]')) return;
    if (host.closest?.('[data-vbn-native]')) return;

    const isSearch = host.matches('salla-search');
    const inlineSearch = isSearch && Boolean(host.closest('.veloura-search-surface'));
    const shadowRoot = host.shadowRoot;

    host.setAttribute(THEME_ATTR, isDarkMode() ? 'dark' : 'light');
    host.setAttribute(ROLE_ATTR, isSearch ? 'search' : 'panel');
    if (isSearch) host.setAttribute(INLINE_ATTR, inlineSearch ? 'true' : 'false');
    else host.removeAttribute(INLINE_ATTR);

    removeLegacyState(host, shadowRoot);

    /* Keep the state attributes after legacy cleanup. */
    host.setAttribute(THEME_ATTR, isDarkMode() ? 'dark' : 'light');
    host.setAttribute(ROLE_ATTR, isSearch ? 'search' : 'panel');
    if (isSearch) host.setAttribute(INLINE_ATTR, inlineSearch ? 'true' : 'false');

    if (shadowRoot) {
      installStyle(shadowRoot);
      observeShadowRoot(shadowRoot);
    }
  }

  function scan(scope = document) {
    if (!scope) return;
    if (scope.nodeType === 1 && scope.matches?.(COMPONENT_SELECTOR)) syncHost(scope);
    scope.querySelectorAll?.(COMPONENT_SELECTOR).forEach(syncHost);
  }

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      installDocumentStyle();
      scan(document);
    });
  }

  function observeShadowRoot(shadowRoot) {
    if (!shadowRoot || observedShadowRoots.has(shadowRoot)) return;
    observedShadowRoots.add(shadowRoot);
    const observer = new MutationObserver(() => {
      installStyle(shadowRoot);
    });
    observer.observe(shadowRoot, { childList: true, subtree: true });
  }

  function scheduleScans() {
    installDocumentStyle();
    [0, 60, 180, 420, 900, 1600, 2800].forEach((delay) => {
      window.setTimeout(() => scan(document), delay);
    });
  }

  function init() {
    installDocumentStyle();
    scheduleScans();

    window.addEventListener('veloura:theme-changed', scheduleScans);
    document.addEventListener('theme::ready', scheduleScans);

    const rootObserver = new MutationObserver((mutations) => {
      let requiresScan = false;
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          requiresScan = true;
          break;
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            requiresScan = true;
            break;
          }
        }
        if (requiresScan) break;
      }
      if (requiresScan) queueScan();
    });

    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
      childList: true,
      subtree: true
    });

    if (document.body) {
      rootObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

/* ==========================================================================
   Veloura V88 — Dark Telegram Glass single-layer refinement
   - Dark glass stays genuinely translucent.
   - saturation is fixed at 200%.
   - top edge is visibly stronger than bottom edge.
   - detached header search has exactly ONE painted glass layer.
   ========================================================================== */
(() => {
  'use strict';

  const STYLE_ID = 'veloura-dark-glass-single-layer';

  const CSS = `
    html.dark,
    html.dark body,
    html body.dark {
      /* Keep the same configured dark-secondary hue and the current high transparency. */
      --veloura-source: var(--veloura-dark-secondary-bg, #010612);
      --veloura-tint: color-mix(in srgb, var(--veloura-source) 94%, white 6%);
      --veloura-glass: color-mix(in srgb, var(--veloura-tint) 60%, transparent);

      /* Search is intentionally clearer than header/nav so map/product imagery
         stays visibly present behind the pill instead of turning into a flat block. */
      --veloura-search-glass: color-mix(
        in srgb,
        var(--veloura-tint) 40%,
        transparent
      );
      --veloura-search-filter: blur(18px) saturate(200%);

      /* Telegram-like edge hierarchy:
         TOP is deliberately more visible; BOTTOM remains present but softer. */
      --veloura-edge-top: rgba(255, 255, 255, .120);
      --veloura-edge-bottom: rgba(255, 255, 255, .055);
      --veloura-glass-edge-top: var(--veloura-edge-top);
      --veloura-glass-edge-bottom: var(--veloura-edge-bottom);
      --veloura-global-glass-edge-top: var(--veloura-edge-top);
      --veloura-global-glass-edge-bottom: var(--veloura-edge-bottom);

      --veloura-filter: blur(24px) saturate(200%);
      --veloura-glass-filter: var(--veloura-filter);
      --veloura-global-glass-filter: var(--veloura-filter);
    }

    html.dark body.veloura-glass-effect #veloura-header-tabs-stack,
    html body.dark.veloura-glass-effect #veloura-header-tabs-stack {
      --veloura-header-solid-bg: var(--veloura-dark-secondary-bg, #010612) !important;
      --veloura-glass: var(--veloura-glass) !important;
      --veloura-edge-top: rgba(255, 255, 255, .120) !important;
      --veloura-edge-bottom: rgba(255, 255, 255, .055) !important;
      --veloura-filter: blur(24px) saturate(200%) !important;
    }

    /* V142 — Side menu glass refinement.
       - 24px blur for the side menu in both light and dark.
       - Dark keeps the exact V88/V87 header material.
       - Category rows receive very subtle mode-aware separators.
       - The navbar title pseudo-element follows the configured side-menu text color. */
    /* Light side-menu glass: keep the existing light material, but raise blur to 24px. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark) .mm-ocd.mm-ocd--open .mm-ocd__content {
      -webkit-backdrop-filter: blur(24px) saturate(124%) brightness(101%) !important;
      backdrop-filter: blur(24px) saturate(124%) brightness(101%) !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open .mm-ocd__content,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open .mm-ocd__content,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open .mm-ocd__content {
      background: var(--veloura-glass) !important;
      background-color: var(--veloura-glass) !important;
      background-image: none !important;
      border-top: 1px solid rgba(255, 255, 255, .120) !important;
      border-bottom: 1px solid rgba(255, 255, 255, .055) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      filter: none !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, .24),
        inset 0 1px 0 rgba(255,255,255,.025) !important;
      color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    /* Dark side-menu text follows its dedicated dark text option.
       Keep the category badge independent: its primary-store color rules stay intact. */
    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li,
    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > a,
    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > span,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > a,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > span,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > a,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > span,
    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .mm-spn--navbar,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .mm-spn--navbar,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .mm-spn--navbar {
      color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    /* The visible navbar title is ::after and has an older hard-coded dark color.
       Override the pseudo-element explicitly so "القائمة الرئيسية" follows the
       merchant's dark side-menu text option too. */
    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after {
      color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    /* Subtle row separators.
       Light mode uses a soft light edge; dark mode uses a transparent dark edge. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark)
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, .34) !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child),
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child),
    html body.dark.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child) {
      border-bottom: 1px solid rgba(0, 0, 0, .16) !important;
    }

    /* V143 — visual alignment + stronger navigation chrome.
       - Arabic row content is optically centered between separators.
       - Separators are the same subtle dark tone in light and dark.
       - Navbar title/back arrow are always 100% opaque and follow the proper text option. */
    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span),
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span) {
      padding-block-start: 0 !important;
      padding-block-end: 4px !important;
    }

    /* Keep badges and branch arrows optically aligned with the shifted row text. */
    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .veloura-side-category-badge,
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .veloura-side-category-badge,
    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li:has(> ul)::before,
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li:has(> ul)::before {
      margin-top: -2px !important;
    }

    /* Light separators: dark/translucent, matching the dark-mode separator tone. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark)
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child) {
      border-bottom-color: rgba(0, 0, 0, .16) !important;
    }

    /* Main/submenu navbar title: full opacity, no legacy rgba fade. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark)
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after {
      opacity: 1 !important;
      color: var(--veloura-side-cats-text, #111827) !important;
      -webkit-text-fill-color: var(--veloura-side-cats-text, #111827) !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar::after {
      opacity: 1 !important;
      color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
      -webkit-text-fill-color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
    }

    /* Real mmenu back arrow (::before): full opacity in both modes. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark)
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar:not(.mm-spn--main)::before {
      opacity: 1 !important;
      color: var(--veloura-side-cats-text, #111827) !important;
      border-color: currentColor !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar:not(.mm-spn--main)::before,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar:not(.mm-spn--main)::before,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn.mm-spn--navbar:not(.mm-spn--main)::before {
      opacity: 1 !important;
      color: var(--veloura-dark-side-menu-text, var(--veloura-dark-primary-text, #ffffff)) !important;
      border-color: currentColor !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span) svg,
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span) svg,
    html body.dark.veloura-side-cats-glass.veloura-glass-effect .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span) svg {
      color: inherit !important;
      fill: currentColor !important;
      stroke: currentColor !important;
    }


    /* V146 — لا يوجد ارتفاع ثابت لعناصر القائمة.
       قيمة المسافة تتوزع داخليًا بالتساوي: نصفها أعلى ونصفها أسفل،
       لذلك يبقى النص/الصورة في المنتصف مهما تغيّر حجم الصورة. */
    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span),
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span) {
      padding-block-start: calc(var(--veloura-side-cats-gap, 0px) / 2) !important;
      padding-block-end: calc(var(--veloura-side-cats-gap, 0px) / 2) !important;
      transform: none !important;
    }

    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li:has(> ul)::before,
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li:has(> ul)::before {
      margin-top: 0 !important;
    }

    /* Badge remains vertically centered inside its own row. */
    html.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .veloura-side-category-badge,
    html body.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn .veloura-side-category-badge {
      margin-top: 0 !important;
    }

    /* V145 separators: light mode is intentionally much softer;
       dark mode keeps a subtle dark divider. */
    html.veloura-side-cats-glass:not(.dark) body.veloura-glass-effect:not(.dark)
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child) {
      border-bottom-color: rgba(15, 23, 42, .055) !important;
    }

    html.dark.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child),
    html.dark.veloura-side-cats-glass body.dark.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child),
    html body.dark.veloura-side-cats-glass.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn ul > li:not(:last-child) {
      border-bottom-color: rgba(0, 0, 0, .10) !important;
    }

    /* V137 reserves left/right room for an absolutely-positioned badge. On image rows
       that reservation was shrinking percentage-based auto-width images. The badge is
       already absolutely positioned, so image rows do not need that large padding. */
    [dir="rtl"] html.veloura-side-cats-img-auto-width.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span):has(> img):has(> .veloura-side-category-badge),
    html[dir="rtl"].veloura-side-cats-img-auto-width.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span):has(> img):has(> .veloura-side-category-badge) {
      padding-left: 18px !important;
    }

    [dir="ltr"] html.veloura-side-cats-img-auto-width.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span):has(> img):has(> .veloura-side-category-badge),
    html[dir="ltr"].veloura-side-cats-img-auto-width.veloura-side-cats-glass body.veloura-glass-effect
      .mm-ocd.mm-ocd--open #mobile-menu.mm-spn li > :is(a, span):has(> img):has(> .veloura-side-category-badge) {
      padding-right: 18px !important;
    }

    /* V145 image sizing: the Badge must never affect image geometry.
       Fixed-width mode already uses exact width/height variables in header.scss.
       Auto-width mode now uses one identical rule for EVERY category image, with
       a viewport-based max width so row padding/Badge presence cannot shrink it. */
    html.veloura-side-cats-img-auto-width .mm-ocd.mm-ocd--open #mobile-menu.mm-spn
      li > :is(a, span) > img,
    html.veloura-side-cats-img-auto-width .mm-ocd.mm-ocd--open #mobile-menu.mm-spn
      img.veloura-side-menu-img,
    html.veloura-side-cats-img-auto-width .mm-ocd.mm-ocd--open #mobile-menu.mm-spn
      .veloura-side-menu-img {
      width: auto !important;
      min-width: 0 !important;
      max-width: min(45vw, 180px) !important;
      height: var(--veloura-side-cats-img-h, 60px) !important;
      min-height: var(--veloura-side-cats-img-h, 60px) !important;
      max-height: var(--veloura-side-cats-img-h, 60px) !important;
      flex: 0 0 auto !important;
      flex-shrink: 0 !important;
    }


    /* Header: one paint owner. */
    html.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface,
    html body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface {
      background: var(--veloura-glass) !important;
      background-color: var(--veloura-glass) !important;
      background-image: none !important;
      border-top: 1px solid rgba(255, 255, 255, .120) !important;
      border-bottom: 1px solid rgba(255, 255, 255, .055) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
      backdrop-filter: blur(24px) saturate(200%) !important;
      filter: none !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, .24),
        inset 0 1px 0 rgba(255,255,255,.025) !important;
    }

    /* Never let nested header wrappers paint over the glass. */
    html.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface :is(
      .store-header,
      #mainnav.main-nav-container,
      #mainnav.main-nav-container > .inner,
      .main-nav-container,
      .main-nav-container > .inner,
      .veloura-header-container,
      .veloura-header-grid,
      .veloura-home-tabs,
      .veloura-home-tabs__inner
    ),
    html body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-header-tabs-stack__surface :is(
      .store-header,
      #mainnav.main-nav-container,
      #mainnav.main-nav-container > .inner,
      .main-nav-container,
      .main-nav-container > .inner,
      .veloura-header-container,
      .veloura-header-grid,
      .veloura-home-tabs,
      .veloura-home-tabs__inner
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }

    /* Detached-search SHELL is layout only. It must never create layer #1. */
    html.dark body #veloura-header-tabs-stack .veloura-detached-search-shell,
    html body.dark #veloura-header-tabs-stack .veloura-detached-search-shell {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }

    html.dark body #veloura-header-tabs-stack .veloura-detached-search-shell::before,
    html.dark body #veloura-header-tabs-stack .veloura-detached-search-shell::after,
    html body.dark #veloura-header-tabs-stack .veloura-detached-search-shell::before,
    html body.dark #veloura-header-tabs-stack .veloura-detached-search-shell::after {
      content: none !important;
      display: none !important;
      background: none !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    /* Search surface is the SINGLE glass paint owner. */
    html.dark body.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface,
    html body.dark.veloura-glass-effect #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface {
      --veloura-search-inner-bg: transparent !important;
      --veloura-top-text: var(--veloura-dark-primary-text, #fff) !important;

      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;

      background: var(--veloura-search-glass) !important;
      background-color: var(--veloura-search-glass) !important;
      background-image: none !important;

      border-top: 1px solid rgba(255, 255, 255, .120) !important;
      border-bottom: 1px solid rgba(255, 255, 255, .055) !important;
      border-inline: 0 !important;

      -webkit-backdrop-filter: var(--veloura-search-filter) !important;
      backdrop-filter: var(--veloura-search-filter) !important;
      filter: none !important;

      box-shadow:
        0 8px 24px rgba(0,0,0,.20),
        inset 0 1px 0 rgba(255,255,255,.025) !important;
    }

    /* Salla host is transparent; app.js V88 also clears its Shadow DOM wrappers. */
    html.dark body #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface > salla-search.veloura-header-search-component,
    html body.dark #veloura-header-tabs-stack .veloura-detached-search.veloura-search-surface > salla-search.veloura-header-search-component {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;

      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;
    }

    html.dark body #veloura-header-tabs-stack .veloura-search-surface salla-search::part(form),
    html.dark body #veloura-header-tabs-stack .veloura-search-surface salla-search::part(container),
    html.dark body #veloura-header-tabs-stack .veloura-search-surface salla-search::part(wrapper),
    html.dark body #veloura-header-tabs-stack .veloura-search-surface salla-search::part(input-wrapper),
    html.dark body #veloura-header-tabs-stack .veloura-search-surface salla-search::part(input),
    html body.dark #veloura-header-tabs-stack .veloura-search-surface salla-search::part(form),
    html body.dark #veloura-header-tabs-stack .veloura-search-surface salla-search::part(container),
    html body.dark #veloura-header-tabs-stack .veloura-search-surface salla-search::part(wrapper),
    html body.dark #veloura-header-tabs-stack .veloura-search-surface salla-search::part(input-wrapper),
    html body.dark #veloura-header-tabs-stack .veloura-search-surface salla-search::part(input) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }

/* V89 search transparency guard:
   the detached shell and Salla field chrome can never paint a second layer. */
html.dark body #veloura-header-tabs-stack .veloura-detached-search-shell,
html body.dark #veloura-header-tabs-stack .veloura-detached-search-shell,
html.dark body #veloura-header-tabs-stack .veloura-detached-search-shell > *,
html body.dark #veloura-header-tabs-stack .veloura-detached-search-shell > * {
  --veloura-search-inner-bg: transparent !important;
}

html.dark body #veloura-header-tabs-stack .veloura-search-surface > salla-search,
html body.dark #veloura-header-tabs-stack .veloura-search-surface > salla-search {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 0 !important;
  box-shadow: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  filter: none !important;
}

  `;

  function install() {
    if (!document.head) return;
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }

  window.addEventListener('veloura:theme-changed', install);
  document.addEventListener('theme::ready', install);
})();
