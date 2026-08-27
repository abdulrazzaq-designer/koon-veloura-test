import BasePage from '../base-page';

/* Veloura Final Unified Product Card Contract 2026 */
const VELOURA_CARD_CONTRACT_STYLE_ID = 'veloura-card-contract-style-2026';
const VELOURA_CARD_BODY_CLASS_PREFIXES = [
  'veloura-product-card-',
  'veloura-product-image-ratio-',
  'veloura-product-title-',
  'veloura-pc-',
  'veloura-quick-view-position-'
];

const VELOURA_CARD_VARIABLE_NAMES = [
  '--veloura-product-card-bg',
  '--veloura-product-card-radius',
  '--veloura-product-image-radius',
  '--veloura-product-image-padding-top',
  '--veloura-product-image-padding-x',
  '--veloura-product-image-outside-offset',
  '--veloura-product-title-size',
  '--veloura-product-price-size',
  '--veloura-product-button-radius',
  '--veloura-product-button-margin-x',
  '--veloura-product-button-margin-bottom',
  '--veloura-product-button-height',
  '--veloura-product-button-bg',
  '--veloura-product-button-text',
  '--veloura-pc-promo-bg',
  '--veloura-pc-promo-text',
  '--veloura-pc-promo-size',
  '--veloura-pc-promo-radius',
  '--veloura-pc-overlay-offset',
  '--veloura-pc-actions-gap',
  '--veloura-product-action-size',
  '--veloura-quick-view-button-bg',
  '--veloura-quick-view-button-text',
  '--veloura-quick-view-button-radius',
  '--veloura-quick-view-button-height'
];

const VELOURA_CARD_CONTRACT_CSS = `
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-self: stretch !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  box-sizing: border-box !important;
  background: var(--veloura-product-card-bg, #fff) !important;
  border-radius: var(--veloura-product-card-radius, 16px) !important;
  overflow: hidden !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image {
  position: relative !important;
  flex: 0 0 auto !important;
  width: calc(100% - (var(--veloura-product-image-padding-x, 0px) * 2)) !important;
  margin: var(--veloura-product-image-padding-top, 0px) auto 0 !important;
  border-radius: var(--veloura-product-image-radius, 16px) !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image::before,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image::after {
  content: none !important;
  display: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image img:not([src]),
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image img[src=""],
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image img[src="#"] {
  display: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image > a,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image img,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image .s-product-card-image-cover {
  display: block !important;
  width: 100% !important;
  border-radius: inherit !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-square .s-product-card-image,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-square .s-product-card-image > a {
  aspect-ratio: 1 / 1 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-portrait_3_4 .s-product-card-image,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-portrait_3_4 .s-product-card-image > a {
  aspect-ratio: 3 / 4 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-landscape_5_4 .s-product-card-image,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-landscape_5_4 .s-product-card-image > a {
  aspect-ratio: 5 / 4 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled:not(.veloura-product-image-ratio-auto) .s-product-card-image img {
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-auto .s-product-card-image,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-auto .s-product-card-image > a {
  aspect-ratio: auto !important;
  height: auto !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-image-ratio-auto .s-product-card-image img {
  height: auto !important;
  object-fit: contain !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-image-outside {
  overflow: visible !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-image-outside::before {
  content: "" !important;
  position: absolute !important;
  inset: var(--veloura-product-image-outside-offset, 20px) 0 0 !important;
  z-index: 0 !important;
  pointer-events: none !important;
  background: var(--veloura-product-card-bg, #fff) !important;
  border-radius: var(--veloura-product-card-radius, 16px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-image-outside > * {
  position: relative !important;
  z-index: 1 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content {
  display: flex !important;
  flex: 1 1 auto !important;
  flex-direction: column !important;
  width: 100% !important;
  min-height: 0 !important;
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-main {
  flex: 0 0 auto !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-card-bottom {
  display: flex !important;
  flex: 0 0 auto !important;
  flex-direction: column !important;
  width: 100% !important;
  margin-top: auto !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-sub {
  flex: 0 0 auto !important;
  width: 100% !important;
  margin: 0 !important;
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-title,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-title a {
  font-size: var(--veloura-product-title-size, 15px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-price,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-sale-price,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-sub {
  font-size: var(--veloura-product-price-size, 15px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-title-one-line .s-product-card-content-title,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-title-one-line .s-product-card-content-title a {
  display: -webkit-box !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 1 !important;
  overflow: hidden !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-title-two-lines .s-product-card-content-title,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-title-two-lines .s-product-card-content-title a {
  display: -webkit-box !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 2 !important;
  overflow: hidden !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content-main,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content-title,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content-title a,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content-subtitle,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-center-text .s-product-card-content-sub {
  width: 100% !important;
  text-align: center !important;
  justify-content: center !important;
  align-items: center !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content-main,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content-title,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content-title a,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content-subtitle,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-product-card-align-right .s-product-card-content-sub {
  width: 100% !important;
  text-align: right !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  direction: rtl !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-footer {
  display: flex !important;
  flex: 0 0 auto !important;
  align-items: stretch !important;
  justify-content: center !important;
  gap: 8px !important;
  width: calc(
    100% + var(--veloura-card-content-padding-start, 0px) +
    var(--veloura-card-content-padding-end, 0px) -
    (var(--veloura-product-button-margin-x, 0px) * 2)
  ) !important;
  max-width: none !important;
  min-width: 0 !important;
  margin-inline-start: calc(
    0px - var(--veloura-card-content-padding-start, 0px) +
    var(--veloura-product-button-margin-x, 0px)
  ) !important;
  margin-inline-end: calc(
    0px - var(--veloura-card-content-padding-end, 0px) +
    var(--veloura-product-button-margin-x, 0px)
  ) !important;
  margin-top: 10px !important;
  margin-bottom: var(--veloura-product-button-margin-bottom, 0px) !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-footer > salla-add-product-button {
  flex: 1 1 auto !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-content-footer > salla-button {
  flex: 0 0 auto !important;
  width: auto !important;
  margin: 0 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled salla-add-product-button.veloura-card-add-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: var(--veloura-product-button-height, 42px) !important;
  min-height: var(--veloura-product-button-height, 42px) !important;
  padding: 0 14px !important;
  box-sizing: border-box !important;
  background: var(--veloura-product-button-bg, #004d65) !important;
  background-color: var(--veloura-product-button-bg, #004d65) !important;
  border: 1px solid var(--veloura-product-button-bg, #004d65) !important;
  border-radius: var(--veloura-product-button-radius, 16px) !important;
  color: var(--veloura-product-button-text, #fff) !important;
  line-height: 1 !important;
  overflow: hidden !important;
  opacity: 1 !important;
  visibility: visible !important;
  --color-primary: var(--veloura-product-button-bg, #004d65) !important;
  --color-primary-reverse: var(--veloura-product-button-text, #fff) !important;
  --button-background-color: var(--veloura-product-button-bg, #004d65) !important;
  --button-border-color: var(--veloura-product-button-bg, #004d65) !important;
  --button-text-color: var(--veloura-product-button-text, #fff) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled salla-add-product-button.veloura-card-add-button > span,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled salla-add-product-button.veloura-card-add-button > i,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled salla-add-product-button.veloura-card-add-button svg {
  color: inherit !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-cart .s-product-card-content-footer,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-cart salla-add-product-button {
  display: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-wish .s-product-card-wishlist-btn,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-wish .veloura-pc-native-wish {
  display: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-promo .veloura-pc-native-promo,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-hide-promo .s-product-card-promotion-title {
  display: none !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .s-product-card-image,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-quick-view-image-host {
  position: relative !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-pc-native-wish,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-pc-native-quick {
  position: absolute !important;
  z-index: 80 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: var(--veloura-product-action-size, 42px) !important;
  height: var(--veloura-product-action-size, 42px) !important;
  min-width: var(--veloura-product-action-size, 42px) !important;
  min-height: var(--veloura-product-action-size, 42px) !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: var(--veloura-quick-view-button-radius, 999px) !important;
  overflow: hidden !important;
  background: #fff !important;
  color: #111827 !important;
  border: 1px solid rgba(15,23,42,.08) !important;
  box-shadow: 0 10px 24px rgba(15,23,42,.12) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-glass .veloura-pc-native-wish,
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-glass .veloura-pc-native-quick {
  background: rgba(255,255,255,.26) !important;
  color: #0f172a !important;
  border-color: rgba(255,255,255,.38) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-right_stack .veloura-pc-native-wish {
  right: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-right_stack .veloura-pc-native-quick {
  right: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: calc(var(--veloura-pc-overlay-offset, 10px) + var(--veloura-product-action-size, 42px) + var(--veloura-pc-actions-gap, 8px)) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-left_stack .veloura-pc-native-wish {
  left: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-left_stack .veloura-pc-native-quick {
  left: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: calc(var(--veloura-pc-overlay-offset, 10px) + var(--veloura-product-action-size, 42px) + var(--veloura-pc-actions-gap, 8px)) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-bottom_split .veloura-pc-native-wish {
  left: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-actions-bottom_split .veloura-pc-native-quick {
  right: var(--veloura-pc-overlay-offset, 10px) !important;
  bottom: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-pc-native-promo {
  position: absolute !important;
  z-index: 70 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  max-width: calc(100% - (var(--veloura-pc-overlay-offset, 10px) * 2)) !important;
  padding: 7px 12px !important;
  border-radius: var(--veloura-pc-promo-radius, 22px) !important;
  background: var(--veloura-pc-promo-bg, #b91c1c) !important;
  color: var(--veloura-pc-promo-text, #fff) !important;
  font-size: var(--veloura-pc-promo-size, 12px) !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-promo-top_right .veloura-pc-native-promo {
  top: var(--veloura-pc-overlay-offset, 10px) !important;
  right: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-promo-top_left .veloura-pc-native-promo {
  top: var(--veloura-pc-overlay-offset, 10px) !important;
  left: var(--veloura-pc-overlay-offset, 10px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled.veloura-pc-promo-top_center .veloura-pc-native-promo {
  top: var(--veloura-pc-overlay-offset, 10px) !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-quick-view-under-cart-wrap {
  display: block !important;
  flex: 0 0 auto !important;
  width: calc(100% - (var(--veloura-product-button-margin-x, 0px) * 2)) !important;
  max-width: calc(100% - (var(--veloura-product-button-margin-x, 0px) * 2)) !important;
  margin: 8px auto var(--veloura-product-button-margin-bottom, 0px) !important;
}
.s-product-card-entry.veloura-card-contract.veloura-product-card-enabled .veloura-quick-view-under-cart-wrap .veloura-quick-view-btn {
  display: flex !important;
  width: 100% !important;
  min-height: var(--veloura-quick-view-button-height, 42px) !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: var(--veloura-quick-view-button-radius, 999px) !important;
  background: var(--veloura-quick-view-button-bg, #004d65) !important;
  color: var(--veloura-quick-view-button-text, #fff) !important;
  border: 1px solid var(--veloura-quick-view-button-bg, #004d65) !important;
}
`;

function velouraCardStyleContainer(root) {
  if (!root || root === document || root.nodeType === Node.DOCUMENT_NODE) return document.head;
  return root;
}

function ensureVelouraCardContractStyle(root) {
  const container = velouraCardStyleContainer(root);
  if (!container || !container.querySelector) return;
  let style = container.querySelector(`#${VELOURA_CARD_CONTRACT_STYLE_ID}`);
  if (!style) {
    style = document.createElement('style');
    style.id = VELOURA_CARD_CONTRACT_STYLE_ID;
    style.textContent = VELOURA_CARD_CONTRACT_CSS;
    container.appendChild(style);
  }
}

function syncVelouraCardVariables(target) {
  if (!target || !target.style || !window.getComputedStyle) return;

  const rootStyle = window.getComputedStyle(document.documentElement);
  const bodyStyle = document.body ? window.getComputedStyle(document.body) : null;

  VELOURA_CARD_VARIABLE_NAMES.forEach((name) => {
    const value = (bodyStyle && bodyStyle.getPropertyValue(name)) || rootStyle.getPropertyValue(name);
    if (value && value.trim()) target.style.setProperty(name, value.trim());
  });
}

function copyVelouraCardClasses(card) {
  if (!card || !document.body) return;
  const previous = card.__velouraCopiedBodyClasses || [];
  previous.forEach((className) => card.classList.remove(className));

  const copied = [];
  document.body.classList.forEach((className) => {
    if (VELOURA_CARD_BODY_CLASS_PREFIXES.some((prefix) => className.indexOf(prefix) === 0)) {
      card.classList.add(className);
      copied.push(className);
    }
  });
  card.__velouraCopiedBodyClasses = copied;
}

function ensureVelouraShadowStyle(root) {
  if (!root || !root.querySelector) return;
  const id = 'veloura-card-add-button-shadow-style-2026';
  let style = root.querySelector(`#${id}`);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    style.textContent = `
      :host {
        display: flex !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        border-radius: var(--veloura-product-button-radius, 16px) !important;
        overflow: hidden !important;
        --color-primary: var(--veloura-product-button-bg, #004d65) !important;
        --color-primary-reverse: var(--veloura-product-button-text, #fff) !important;
        --button-background-color: var(--veloura-product-button-bg, #004d65) !important;
        --button-border-color: var(--veloura-product-button-bg, #004d65) !important;
        --button-text-color: var(--veloura-product-button-text, #fff) !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
      }
      button, .s-button-element, .s-button-btn, [part~="button"] {
        display: flex !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        height: var(--veloura-product-button-height, 42px) !important;
        min-height: var(--veloura-product-button-height, 42px) !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        box-sizing: border-box !important;
        background: var(--veloura-product-button-bg, #004d65) !important;
        background-color: var(--veloura-product-button-bg, #004d65) !important;
        border: 1px solid var(--veloura-product-button-bg, #004d65) !important;
        border-radius: var(--veloura-product-button-radius, 16px) !important;
        color: var(--veloura-product-button-text, #fff) !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
      }
      button *, .s-button-element *, .s-button-btn * {
        color: var(--veloura-product-button-text, #fff) !important;
        fill: var(--veloura-product-button-text, #fff) !important;
        stroke: currentColor !important;
      }
    `;
    root.appendChild(style);
  }
}


const velouraActionObserverState = new WeakMap();

function scheduleVelouraActionStabilize(component) {
  if (!component || !component.isConnected) return;

  let state = velouraActionObserverState.get(component);
  if (!state) {
    state = { frame: 0, timers: [], hostObserver: null, shadowObserver: null };
    velouraActionObserverState.set(component, state);
  }

  if (state.frame) cancelAnimationFrame(state.frame);
  state.frame = requestAnimationFrame(() => {
    state.frame = 0;
    if (component.isConnected) styleVelouraActionComponent(component);
  });

  state.timers.forEach(clearTimeout);
  state.timers = [90, 260].map((delay) => setTimeout(() => {
    if (component.isConnected) styleVelouraActionComponent(component);
  }, delay));
}

function observeVelouraActionComponent(component) {
  if (!component || typeof MutationObserver !== 'function') return;

  let state = velouraActionObserverState.get(component);
  if (!state) {
    state = { frame: 0, timers: [], hostObserver: null, shadowObserver: null };
    velouraActionObserverState.set(component, state);
  }

  if (!state.hostObserver) {
    state.hostObserver = new MutationObserver(() => scheduleVelouraActionStabilize(component));
    state.hostObserver.observe(component, { childList: true, subtree: true });
  }

  const attachShadowObserver = () => {
    const root = component.shadowRoot;
    if (!root || state.shadowObserver) return;

    state.shadowObserver = new MutationObserver(() => scheduleVelouraActionStabilize(component));
    state.shadowObserver.observe(root, { childList: true, subtree: true });
  };

  attachShadowObserver();
  if (typeof component.componentOnReady === 'function') {
    component.componentOnReady().then(attachShadowObserver).catch(() => {});
  }
}

/* VELOURA_V82_NATIVE_CART_SOURCE */
function styleVelouraActionComponent(component, depth = 0) {
  if (!component || depth > 5) return;

  const tagName = component.tagName ? component.tagName.toLowerCase() : '';
  const card = component.closest ? component.closest('.s-product-card-entry') : null;
  if (card) syncVelouraCardVariables(card);
  syncVelouraCardVariables(component);

  component.style.setProperty('display', 'flex', 'important');
  component.style.setProperty('align-items', 'center', 'important');
  component.style.setProperty('justify-content', 'center', 'important');
  component.style.setProperty('width', '100%', 'important');
  component.style.setProperty('max-width', '100%', 'important');
  component.style.setProperty('min-width', '0', 'important');
  component.style.setProperty('height', 'var(--veloura-product-button-height, 42px)', 'important');
  component.style.setProperty('min-height', 'var(--veloura-product-button-height, 42px)', 'important');
  component.style.setProperty('box-sizing', 'border-box', 'important');
  component.style.setProperty('background', 'var(--veloura-product-button-bg, #004d65)', 'important');
  component.style.setProperty('background-color', 'var(--veloura-product-button-bg, #004d65)', 'important');
  component.style.setProperty('border', '1px solid var(--veloura-product-button-bg, #004d65)', 'important');
  component.style.setProperty('border-radius', 'var(--veloura-product-button-radius, 16px)', 'important');
  component.style.setProperty('color', 'var(--veloura-product-button-text, #fff)', 'important');
  component.style.setProperty('overflow', 'hidden', 'important');
  component.style.setProperty('opacity', '1', 'important');
  component.style.setProperty('visibility', 'visible', 'important');
  component.style.setProperty('pointer-events', 'auto', 'important');
  component.style.setProperty('cursor', 'pointer', 'important');
  component.style.setProperty('touch-action', 'manipulation', 'important');
  // V81: stacking belongs to CSS; do not create a synthetic host click layer.

  // fill/width belong to the inner salla-button, not to salla-add-product-button.
  if (tagName === 'salla-button') {
    component.setAttribute('fill', 'solid');
    component.setAttribute('width', 'wide');
    component.setAttribute('color', 'primary');
  }

  const applyShadow = () => {
    if (!component.shadowRoot) return;
    ensureVelouraShadowStyle(component.shadowRoot);
    component.shadowRoot
      .querySelectorAll('button,.s-button-element,.s-button-btn,[part~="button"]')
      .forEach((button) => {
        button.style.setProperty('pointer-events', 'auto', 'important');
        button.style.setProperty('cursor', 'pointer', 'important');
        button.style.setProperty('touch-action', 'manipulation', 'important');
      });
    component.shadowRoot
      .querySelectorAll('salla-button,salla-quick-buy,salla-mini-checkout-widget')
      .forEach((child) => styleVelouraActionComponent(child, depth + 1));
  };

  applyShadow();

  if (typeof component.componentOnReady === 'function') {
    component.componentOnReady().then(applyShadow).catch(() => {});
  }

  observeVelouraActionComponent(component);
}

function captureVelouraCardContentInsets(card) {
  if (!card || !window.getComputedStyle) return;
  const content = card.querySelector('.s-product-card-content');
  if (!content) return;

  const measure = () => {
    const styles = window.getComputedStyle(content);
    const start = parseFloat(styles.paddingInlineStart || styles.paddingLeft || '0') || 0;
    const end = parseFloat(styles.paddingInlineEnd || styles.paddingRight || '0') || 0;
    card.style.setProperty('--veloura-card-content-padding-start', `${start}px`);
    card.style.setProperty('--veloura-card-content-padding-end', `${end}px`);
  };

  measure();
  if (card.dataset.velouraCardInsetsMeasured !== '1') {
    card.dataset.velouraCardInsetsMeasured = '1';
    requestAnimationFrame(measure);
  }
}

function markVelouraCardNativeParts(card) {
  const image = card.querySelector('.s-product-card-image');
  if (image) {
    image.classList.add('veloura-pc-image-actions-host');
    image.querySelectorAll('img').forEach((img) => {
      if (img.dataset.velouraImageErrorReady === '1') return;
      img.dataset.velouraImageErrorReady = '1';
      img.addEventListener('error', () => {
        img.style.setProperty('display', 'none', 'important');
      }, { once: true });
    });
  }

  const wishlist = card.querySelector('.s-product-card-wishlist-btn');
  if (wishlist) wishlist.classList.add('veloura-pc-native-wish');

  card
    .querySelectorAll('.s-product-card-promotion-title,[class*="promotion"],[class*="promo"],[class*="badge"],[class*="ribbon"]')
    .forEach((promo) => promo.classList.add('veloura-pc-native-promo'));
}

function applyVelouraProductCard(card) {
  if (!card || !card.classList) return;

  copyVelouraCardClasses(card);
  syncVelouraCardVariables(card);

  if (!card.classList.contains('veloura-product-card-enabled')) {
    card.classList.remove('veloura-card-contract');
    card.querySelectorAll('salla-add-product-button').forEach((button) => {
      button.classList.remove('veloura-card-add-button');
    });
    return;
  }

  const root = card.getRootNode ? card.getRootNode() : document;
  ensureVelouraCardContractStyle(root);
  card.classList.add('veloura-card-contract');
  markVelouraCardNativeParts(card);
  captureVelouraCardContentInsets(card);

  const footer = card.querySelector('.s-product-card-content-footer');
  if (footer) footer.classList.add('veloura-card-action-row');

  card.querySelectorAll('salla-add-product-button').forEach((button) => {
    button.classList.add('veloura-card-add-button');
    styleVelouraActionComponent(button);
  });
}

function velouraOpenRoots(start = document, maxDepth = 6) {
  const roots = [];
  const seen = new Set();

  const visit = (root, depth) => {
    if (!root || depth > maxDepth || seen.has(root)) return;
    seen.add(root);
    roots.push(root);
    if (!root.querySelectorAll) return;
    root.querySelectorAll('*').forEach((node) => {
      if (node.shadowRoot) visit(node.shadowRoot, depth + 1);
    });
  };

  visit(start, 0);
  return roots;
}

function applyVelouraProductCardsIn(root = document) {
  velouraOpenRoots(root).forEach((currentRoot) => {
    if (currentRoot.matches && currentRoot.matches('.s-product-card-entry')) {
      applyVelouraProductCard(currentRoot);
    }
    if (!currentRoot.querySelectorAll) return;
    currentRoot.querySelectorAll('.s-product-card-entry').forEach(applyVelouraProductCard);
  });
}

function velouraComposedParent(node) {
  if (!node) return null;
  return node.parentNode || (node.getRootNode && node.getRootNode().host) || null;
}

function velouraClosestComposed(node, selector) {
  let current = node;
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current.matches && current.matches(selector)) return current;
    current = velouraComposedParent(current);
  }
  return null;
}

function registerVelouraCardLifecycle() {
  if (window.__velouraCardContractRegistered) return;
  window.__velouraCardContractRegistered = true;

  const applyVisibleCards = (root = document) => {
    if (!root) return;
    if (root.matches?.('.s-product-card-entry')) applyVelouraProductCard(root);
    if (!root.querySelectorAll) return;
    root.querySelectorAll('.s-product-card-entry').forEach(applyVelouraProductCard);
  };

  let refreshFrame = 0;
  let refreshTimers = [];
  const queueVisibleCardRefresh = () => {
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      applyVisibleCards(document);
    });

    refreshTimers.forEach(clearTimeout);
    refreshTimers = [100, 320].map((delay) => setTimeout(() => {
      applyVisibleCards(document);
    }, delay));
  };

  const installSallaHooks = () => {
    const api = window.Salla || window.salla;
    if (!api) return;

    if (!window.__velouraCardCartEventsRegistered && api.cart?.event) {
      api.cart.event.onUpdated?.(queueVisibleCardRefresh);
      api.cart.event.onItemAdded?.(queueVisibleCardRefresh);
      window.__velouraCardCartEventsRegistered = true;
    }

    if (window.__velouraCardSallaHooksRegistered) return;
    if (!api.hooks || typeof api.hooks.registerHook !== 'function') return;

    try {
      api.hooks.registerHook('salla-add-product-button', 'componentDidLoad', (button) => {
        const card = velouraClosestComposed(button, '.s-product-card-entry');
        if (!card || !card.classList.contains('veloura-product-card-enabled')) return;
        button.classList.add('veloura-card-add-button');
        styleVelouraActionComponent(button);
      });

      api.hooks.registerHook('salla-button', 'componentDidLoad', (button) => {
        const addButton = velouraClosestComposed(button, 'salla-add-product-button');
        const card = velouraClosestComposed(button, '.s-product-card-entry');
        if (!addButton || !card || !card.classList.contains('veloura-product-card-enabled')) return;
        styleVelouraActionComponent(button);
      });

      api.hooks.registerHook('salla-products-slider', 'componentDidLoad', (slider) => {
        applyVisibleCards(slider.shadowRoot || slider);
      });

      api.hooks.registerHook('salla-products-list', 'componentDidLoad', (list) => {
        applyVisibleCards(list.shadowRoot || list);
      });

      window.__velouraCardSallaHooksRegistered = true;
    } catch (error) {
      // The card still initializes itself even if a hook is unavailable.
    }
  };

  const start = () => {
    applyVisibleCards(document);

    const api = window.Salla || window.salla;
    if (api && typeof api.onReady === 'function') {
      try {
        const ready = api.onReady(installSallaHooks);
        if (ready && typeof ready.then === 'function') {
          ready.then(installSallaHooks).catch(() => {});
        }
      } catch (error) {
        installSallaHooks();
      }
    } else {
      installSallaHooks();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  document.addEventListener('veloura:product-card:ready', (event) => {
    const card = event.detail?.card;
    if (card) applyVelouraProductCard(card);
    queueVisibleCardRefresh();
  });

  document.addEventListener('afterInit', (event) => {
    const target = event.target;
    if (!target || !target.matches) return;

    if (target.matches('custom-salla-product-card,.s-product-card-entry')) {
      const card = target.matches('.s-product-card-entry')
        ? target
        : target.querySelector('.s-product-card-entry');
      if (card) applyVelouraProductCard(card);
      return;
    }

    if (target.matches('salla-add-product-button')) {
      const card = velouraClosestComposed(target, '.s-product-card-entry');
      if (card && card.classList.contains('veloura-product-card-enabled')) {
        target.classList.add('veloura-card-add-button');
        styleVelouraActionComponent(target);
      }
    }
  });

  window.VelouraProductCardContract = {
    applyCard: applyVelouraProductCard,
    applyTree: applyVisibleCards,
    styleAction: styleVelouraActionComponent
  };
}

registerVelouraCardLifecycle();


class ProductCard extends HTMLElement {
  constructor(){
    super()
  }
  
  connectedCallback(){
    if (this.__velouraConnected) return;
    this.__velouraConnected = true;

    try {
      this.product = this.product || JSON.parse(this.getAttribute('product') || '{}');
    } catch (error) {
      this.product = this.product || {};
    }

    const ready = () => this.onReady();

    if (window.app?.status === 'ready') {
      ready();
    } else {
      document.addEventListener('theme::ready', ready, { once: true });
    }
  }

  onReady(){
    if (this.__velouraReady) return;
    this.__velouraReady = true;

    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get('page.slug');
    if (this.source === 'landing-page') {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    const renderOnce = () => {
      if (this.__velouraRendered) return;
      this.__velouraRendered = true;

      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');

      this.render();
    };

    if (salla.lang && typeof salla.lang.onLoaded === 'function') {
      salla.lang.onLoaded(renderOnce);
      window.setTimeout(renderOnce, 800);
    } else {
      renderOnce();
    }
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } 

  getProductBadge() {
    if (this.product?.preorder?.label) {
      return `<div class="s-product-card-promotion-title veloura-pc-native-promo">${this.product.preorder.label}</div>`
    }

    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title veloura-pc-native-promo">${this.product.promotion_title}</div>`
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity veloura-pc-native-promo">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge veloura-pc-native-promo">${this.outOfStock}</div>`
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash')?'-':'';
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    }
    else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`
    }
    else{
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`
    }

    return price;
  }

  getAddButtonLabel() {
    if(this.product.has_preorder_campaign) {
        return salla.lang.get('pages.products.pre_order_now');
    }

    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now'); 
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps(){

    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute('horizontal');
  
    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
  
    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
  
    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute('fullImage');
  
    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute('minimal');
  
    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute('isSpecial');
  
    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  }

  render(){
    this.classList.add('s-product-card-entry'); 
    this.setAttribute('id', this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial? this.classList.add('s-product-card-special') : '';
    this.fullImage? this.classList.add('s-product-card-full-image') : '';
    this.minimal? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation?  this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover?  this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock?  this.classList.add('s-product-card-out-of-stock') : '';
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));
      this.innerHTML = `
        <div class="${!this.fullImage ? 's-product-card-image veloura-pc-image-actions-host' : 's-product-card-image-full'}">
          <a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
           <img 
              class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)
                ? 'contain'
                : this.fitImageHeight
                ? this.fitImageHeight
                : 'cover'}"
              src="${this.product?.image?.url || this.product?.thumbnail || this.placeholder || ''}"
              alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
              loading="lazy"
            />
            ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}
          </a>
          ${this.fullImage ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>`:''}
          ${!this.horizontal && !this.fullImage ?
            `<salla-button
              shape="icon"
              fill="outline"
              color="light"
              name="product-name-${this.product.id}"
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn veloura-pc-native-wish animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart"></i>
            </salla-button>` : ``
          }
        </div>
        <div class="s-product-card-content">
          ${this.isSpecial && this.product?.quantity ?
            `<div class="s-product-card-content-pie">
              <span>
                <b>${salla.helpers.number(this.product?.quantity)}</b>
                ${this.remained}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="s-product-card-content-pie-svg">
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-base" />
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-bar" />
              </svg>
            </div>`
            : ``}

          <div class="s-product-card-content-main ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            <h3 class="s-product-card-content-title">
              <a href="${this.product?.url}">${this.product?.name}</a>
            </h3>

            ${this.product?.subtitle && !this.minimal ?
              `<p class="s-product-card-content-subtitle opacity-80">${this.product?.subtitle}</p>`
              : ``}
          </div>
          ${this.product?.donation && !this.minimal && !this.fullImage ?
          `<salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${this.product?.donation?.can_donate && this.product?.donation?.custom_amount_enabled  ?
              `<label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
              <input
                type="text"
                onInput="${e => {
                  salla.helpers.inputDigitsOnly(e.target);
                  this.addBtn.donatingAmount = (e.target).value;
                }}"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />`
              : ``}
          </div>`
            : ''}
          <div class="veloura-card-bottom">
            <div class="s-product-card-content-sub ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
              ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
              ${this.product?.rating?.stars ?
                `<div class="s-product-card-rating">
                  <i class="sicon-star2 before:text-orange-300"></i>
                  <span>${this.product.rating.stars}</span>
                </div>`
                 : ``}
            </div>

            ${this.isSpecial && this.product.discount_ends
              ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true}
                labeled=${true} />`
              : ``}

            ${!this.hideAddBtn ?
              `<div class="s-product-card-content-footer veloura-card-action-row gap-2">
                <salla-add-product-button class="veloura-card-add-button"
                  fill="outline"
                  width="wide"
                  product-id="${this.product.id}"
                  product-status="${this.effectiveStatus}"
                  product-type="${this.product.type}"
                  data-veloura-native-cart="true">
                  ${this.product.status == 'sale' ? 
                      `<i class="text-base sicon-${ this.product.type == 'booking' ? 'calendar-time' : 'shopping-bag'}"></i>` : ``
                    }
                  <span>${this.product.add_to_cart_label ? this.product.add_to_cart_label : this.getAddButtonLabel() }</span>
                </salla-add-product-button>

                ${this.horizontal || this.fullImage ?
                  `<salla-button 
                    shape="icon" 
                    fill="outline" 
                    color="light" 
                    id="card-wishlist-btn-${this.product.id}-horizontal"
                    aria-label="Add or remove to wishlist"
                    class="s-product-card-wishlist-btn veloura-pc-native-wish animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
                    onclick="salla.wishlist.toggle(${this.product.id})"
                    data-id="${this.product.id}">
                    <i class="sicon-heart"></i> 
                  </salla-button>`
                  : ``}
              </div>`
              : ``}
          </div>
        </div>
      `

      this.querySelectorAll('[name="donating_amount"]').forEach((element)=>{
        element.addEventListener('input', (e) => {
          const addButton = this.querySelector("salla-add-product-button");
          if (addButton) addButton.setAttribute("donating-amount", e.target.value);
        });
      })

      if (this.product?.quantity && this.isSpecial) {
        this.initCircleBar();
      }

      applyVelouraProductCard(this);
      this.dispatchEvent(new CustomEvent('veloura:product-card:ready', {
        bubbles: true,
        composed: true,
        detail: { card: this }
      }));

      // Optimistic & Per-card wishlist toggle
      this.querySelectorAll('.s-product-card-wishlist-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const willBeAdded = !btn.classList.contains('s-product-card-wishlist-added');
          app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => willBeAdded);
          app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => willBeAdded);
        });
      });
    }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
















/* Veloura Quick View - Stable Direct Replace */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    const config = window.velouraQuickView || {};

    if (config.enabled === false || config.enabled === 'false') {
      return;
    }

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeSettingValue(value, fallback) {
      if (Array.isArray(value) && value[0]) {
        return value[0].value || value[0].selected || fallback;
      }

      if (value && typeof value === 'object') {
        if (Array.isArray(value.selected) && value.selected[0]) {
          return value.selected[0].value || fallback;
        }

        return value.value || value.selected || fallback;
      }

      return value || fallback;
    }

    function toBool(value, fallback) {
      if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on') {
        return true;
      }

      if (value === false || value === 'false' || value === 0 || value === '0' || value === 'off') {
        return false;
      }

      return fallback;
    }

    function replaceBodyClass(prefix, value) {
      Array.from(document.body.classList).forEach(function (className) {
        if (className.indexOf(prefix) === 0) {
          document.body.classList.remove(className);
        }
      });

      document.body.classList.add(prefix + value);
    }

    function getQuickViewPosition() {
      const raw = String(normalizeSettingValue(config.buttonPosition, 'wishlist_icon'));

      if (
        raw === 'below_add_to_cart' ||
        raw === 'below-add-to-cart' ||
        raw === 'inside_card' ||
        raw === 'inside-card'
      ) {
        return 'below_add_to_cart';
      }

      if (
        document.body.classList.contains('veloura-quick-view-position-below_add_to_cart') ||
        document.body.classList.contains('veloura-quick-view-position-below-add-to-cart') ||
        document.body.classList.contains('veloura-quick-view-position-inside_card')
      ) {
        return 'below_add_to_cart';
      }

      return 'wishlist_icon';
    }

    const position = getQuickViewPosition();

    replaceBodyClass('veloura-quick-view-position-', position);

    Array.from(document.body.classList).forEach(function (className) {
  if (className.indexOf('veloura-quick-view-style-') === 0) {
    document.body.classList.remove(className);
  }
});

    function stripHtml(value) {
      const div = document.createElement('div');
      div.innerHTML = value || '';
      return cleanText(div.textContent || div.innerText || '');
    }

    function formatMoneyValue(value) {
      if (value === 0 || value === '0') {
        return '0';
      }

      if (!value) {
        return '';
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return cleanText(String(value));
      }

      if (typeof value === 'object') {
        return cleanText(
          value.formatted ||
            value.format ||
            value.text ||
            value.display ||
            value.amount_with_currency ||
            value.price_format ||
            value.price ||
            value.sale_price ||
            value.amount ||
            value.value ||
            ''
        );
      }

      return '';
    }

    function extractPriceFromText(text) {
      const value = cleanText(text);

      if (!value) {
        return '';
      }

      const matches = value.match(
        /(?:ر\.?س|SAR|﷼|ريال)?\s*[0-9٠-٩]+(?:[.,٬][0-9٠-٩]+)?\s*(?:ر\.?س|SAR|﷼|ريال)?/gi
      );

      if (matches && matches.length) {
        return cleanText(matches.join(' '));
      }

      return '';
    }

    function getBestPriceText(root) {
      const selectors = [
        '.s-product-card-content-sub',
        '.s-product-card-content-price',
        '.s-product-card-price',
        '.s-product-card-sale-price',
        '.s-product-card-regular-price',
        '[class*="price"]',
        '[class*="Price"]',
        'ins',
        'del'
      ];

      for (const selector of selectors) {
        const elements = root.querySelectorAll(selector);

        for (const element of elements) {
          const text = extractPriceFromText(element.innerText || element.textContent);

          if (text) {
            return text;
          }
        }
      }

      return '';
    }

    function getCardRoot(node) {
      if (!node) return null;

      if (node.classList && node.classList.contains('s-product-card-entry')) {
        return node;
      }

      return node.querySelector('.s-product-card-entry') || node;
    }

    function getAttr(node, names) {
      if (!node) return '';

      for (const name of names) {
        const value = node.getAttribute && node.getAttribute(name);
        if (value) return value;
      }

      return '';
    }

    function getProductId(root, url) {
      const fromRoot =
        getAttr(root, ['product-id', 'data-product-id', 'data-id', 'product']) ||
        (root.dataset && (root.dataset.productId || root.dataset.id));

      if (fromRoot && /^\d+$/.test(String(fromRoot))) {
        return String(fromRoot);
      }

      const addButton = root.querySelector(
        'salla-add-product-button, [product-id], [data-product-id]'
      );

      const fromAddButton =
        getAttr(addButton, ['product-id', 'data-product-id', 'data-id']) ||
        (addButton &&
          addButton.dataset &&
          (addButton.dataset.productId || addButton.dataset.id));

      if (fromAddButton && /^\d+$/.test(String(fromAddButton))) {
        return String(fromAddButton);
      }

      if (url) {
        const match =
          String(url).match(/\/p(\d+)/i) ||
          String(url).match(/[?&]product(?:_id)?=(\d+)/i);

        if (match && match[1]) {
          return match[1];
        }
      }

      return '';
    }

    function getProductData(card) {
      const root = getCardRoot(card);

      const titleLink =
        root.querySelector('.s-product-card-content-title a') ||
        root.querySelector('.s-product-card-content h3 a') ||
        root.querySelector('a[href*="/products/"]') ||
        root.querySelector('a[href*="/p"]');

      const image =
        root.querySelector('.s-product-card-image img') ||
        root.querySelector('img');

      const url = titleLink && titleLink.href ? titleLink.href : '#';

      return {
        id: getProductId(root, url),
        name: cleanText(titleLink && titleLink.textContent) || 'المنتج',
        url: url,
        image: image && (image.currentSrc || image.src) ? image.currentSrc || image.src : '',
        price: getBestPriceText(root),
        description: ''
      };
    }

    function normalizeProductResponse(response) {
      const product = response && (response.data || response.product || response);

      if (!product || typeof product !== 'object') {
        return null;
      }

      const image =
        product.image ||
        product.thumbnail ||
        product.main_image ||
        (Array.isArray(product.images) &&
          product.images[0] &&
          (product.images[0].url || product.images[0].image || product.images[0])) ||
        '';

      const price =
        formatMoneyValue(product.price) ||
        formatMoneyValue(product.sale_price) ||
        formatMoneyValue(product.regular_price) ||
        formatMoneyValue(product.final_price) ||
        formatMoneyValue(product.formatted_price) ||
        formatMoneyValue(product.price_format) ||
        '';

      const url = product.url || product.html_url || product.link || '';

      return {
        id: product.id || product.product_id || '',
        name: product.name || product.title || '',
        url: typeof url === 'string' ? url : '',
        image: typeof image === 'string' ? image : image && image.url ? image.url : '',
        price: price,
        description: stripHtml(
          product.description ||
            product.short_description ||
            product.subtitle ||
            ''
        )
      };
    }

    async function fetchProductDetails(productId) {
      if (!productId || !window.salla || !salla.product || !salla.product.getDetails) {
        return null;
      }

      const attempts = [
        function () {
          return salla.product.getDetails(productId);
        },
        function () {
          return salla.product.getDetails({ id: productId });
        },
        function () {
          return salla.product.getDetails({ product_id: productId });
        }
      ];

      for (const attempt of attempts) {
        try {
          const response = await attempt();
          const normalized = normalizeProductResponse(response);

          if (normalized) {
            return normalized;
          }
        } catch (error) {}
      }

      return null;
    }

    async function fetchProductFromPage(url) {
      if (!url || url === '#') {
        return null;
      }

      try {
        const response = await fetch(url, {
          credentials: 'same-origin'
        });

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        let jsonProduct = null;

        doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
          try {
            const parsed = JSON.parse(script.textContent || '{}');

            if (parsed['@type'] === 'Product') {
              jsonProduct = parsed;
            }

            if (Array.isArray(parsed['@graph'])) {
              const productNode = parsed['@graph'].find(function (item) {
                return item['@type'] === 'Product';
              });

              if (productNode) {
                jsonProduct = productNode;
              }
            }
          } catch (error) {}
        });

        const metaDescription =
          doc.querySelector('meta[property="og:description"]') ||
          doc.querySelector('meta[name="description"]');

        const metaImage =
          doc.querySelector('meta[property="og:image"]') ||
          doc.querySelector('meta[name="twitter:image"]');

        const title =
          (jsonProduct && jsonProduct.name) ||
          cleanText(doc.querySelector('h1') && doc.querySelector('h1').textContent) ||
          '';

        const description =
          (jsonProduct && jsonProduct.description) ||
          (metaDescription && metaDescription.getAttribute('content')) ||
          '';

        const image =
          (jsonProduct && jsonProduct.image && Array.isArray(jsonProduct.image)
            ? jsonProduct.image[0]
            : jsonProduct && jsonProduct.image) ||
          (metaImage && metaImage.getAttribute('content')) ||
          '';

        let price = '';

        if (jsonProduct && jsonProduct.offers) {
          const offers = Array.isArray(jsonProduct.offers)
            ? jsonProduct.offers[0]
            : jsonProduct.offers;

          price =
            formatMoneyValue(offers.price) ||
            formatMoneyValue(offers.lowPrice) ||
            formatMoneyValue(offers.highPrice);
        }

        return {
          name: cleanText(title),
          url: url,
          image: image || '',
          price: price || '',
          description: cleanText(description)
        };
      } catch (error) {
        return null;
      }
    }

    function ensureModal() {
      let modal = document.querySelector('.veloura-quick-view-modal');

      if (modal) {
        return modal;
      }

      modal = document.createElement('div');
      modal.className = 'veloura-quick-view-modal';
      modal.setAttribute('aria-hidden', 'true');

      modal.innerHTML = `
        <div class="veloura-quick-view-modal__overlay" data-veloura-qv-close></div>

        <div class="veloura-quick-view-modal__dialog veloura-glass-surface" role="dialog" aria-modal="true">
          <button type="button" class="veloura-quick-view-modal__close" data-veloura-qv-close aria-label="إغلاق">
            ×
          </button>

          <div class="veloura-quick-view-modal__grid">
            <div class="veloura-quick-view-modal__media">
              <img class="veloura-quick-view-modal__image" src="" alt="">
            </div>

            <div class="veloura-quick-view-modal__content">
              <span class="veloura-quick-view-modal__loading">جاري تحميل التفاصيل...</span>
              <h3 class="veloura-quick-view-modal__title"></h3>
              <div class="veloura-quick-view-modal__price"></div>
              <p class="veloura-quick-view-modal__description"></p>

              <a class="veloura-quick-view-modal__link" href="#">
                ${config.productLinkText || 'عرض تفاصيل المنتج'}
              </a>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.addEventListener('click', function (event) {
        if (event.target && event.target.hasAttribute('data-veloura-qv-close')) {
          closeModal();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeModal();
        }
      });

      return modal;
    }

    function renderModal(data, loading) {
      const modal = ensureModal();

      const image = modal.querySelector('.veloura-quick-view-modal__image');
      const title = modal.querySelector('.veloura-quick-view-modal__title');
      const price = modal.querySelector('.veloura-quick-view-modal__price');
      const description = modal.querySelector('.veloura-quick-view-modal__description');
      const link = modal.querySelector('.veloura-quick-view-modal__link');
      const loadingEl = modal.querySelector('.veloura-quick-view-modal__loading');

      loadingEl.style.display = loading ? '' : 'none';

      title.textContent = data.name || 'المنتج';

      price.textContent = data.price || '';
      price.style.display = data.price ? '' : 'none';

      description.textContent = data.description || '';
      description.style.display = data.description ? '' : 'none';

      link.href = data.url || '#';
      link.textContent = config.productLinkText || 'عرض تفاصيل المنتج';

      if (config.showProductLink === false || config.showProductLink === 'false') {
        link.style.display = 'none';
      } else {
        link.style.display = '';
      }

      if (data.image) {
        image.src = data.image;
        image.alt = data.name || '';
        image.parentElement.style.display = '';
      } else {
        image.removeAttribute('src');
        image.alt = '';
        image.parentElement.style.display = 'none';
      }
    }

    async function openModal(cardData) {
      const modal = ensureModal();

      renderModal(cardData, !!cardData.id);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('veloura-quick-view-lock');

      const details =
        (await fetchProductDetails(cardData.id)) ||
        (await fetchProductFromPage(cardData.url));

      if (details) {
        renderModal(
          {
            id: details.id || cardData.id,
            name: details.name || cardData.name,
            url: details.url || cardData.url,
            image: details.image || cardData.image,
            price: details.price || cardData.price,
            description: details.description || cardData.description
          },
          false
        );
      } else {
        renderModal(cardData, false);
      }
    }

    function closeModal() {
      const modal = document.querySelector('.veloura-quick-view-modal');

      if (!modal) {
        return;
      }

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('veloura-quick-view-lock');
    }

    function createButton(card) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'veloura-quick-view-btn';
      button.setAttribute('aria-label', config.buttonText || 'عرض سريع');

      const showIcon = toBool(config.showIcon, true);
      const iconClass = String(normalizeSettingValue(config.icon, 'sicon-eye') || 'sicon-eye');

      if (position === 'below_add_to_cart') {
        button.classList.add('is-under-cart');

        button.innerHTML = `
          ${showIcon ? `<i class="${iconClass}" aria-hidden="true"></i>` : ''}
          <span>${config.buttonText || 'عرض سريع'}</span>
        `;
      } else {
        button.classList.add('is-icon-only', 'veloura-pc-native-quick', 'veloura-glass-quick');
        button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        openModal(getProductData(card));
      });

      return button;
    }

    function injectButton(card) {
      const root = getCardRoot(card);

      if (!root || root.querySelector('.veloura-quick-view-btn')) {
        return;
      }

      const button = createButton(root);

      if (position === 'below_add_to_cart') {
        const wrapper = document.createElement('div');
        wrapper.className = 'veloura-quick-view-under-cart-wrap';
        wrapper.appendChild(button);

        const footer = root.querySelector('.s-product-card-content-footer');
        const addToCart = root.querySelector('salla-add-product-button');
        const content = root.querySelector('.s-product-card-content') || root;

        if (footer && footer.parentNode) {
          footer.parentNode.insertBefore(wrapper, footer.nextSibling);
        } else if (addToCart && addToCart.parentNode) {
          addToCart.parentNode.insertBefore(wrapper, addToCart.nextSibling);
        } else {
          content.appendChild(wrapper);
        }

        return;
      }

      const imageBox = root.querySelector('.s-product-card-image');

      if (imageBox) {
        imageBox.classList.add('veloura-quick-view-image-host');
        imageBox.appendChild(button);
      } else {
        root.appendChild(button);
      }
    }

    function scanCards(scope) {
      velouraOpenRoots(scope || document).forEach(function (root) {
        if (!root.querySelectorAll) return;
        root.querySelectorAll('.s-product-card-entry').forEach(function (card) {
          injectButton(card);
        });
      });
    }

    scanCards(document);

    document.addEventListener('veloura:product-card:ready', function (event) {
      var card = event.detail && event.detail.card;
      if (card) injectButton(card);
    });

    document.addEventListener('salla::product.cards::loaded', function () {
      scanCards(document);
    });

    document.addEventListener('afterInit', function (event) {
      var target = event.target;
      if (!target || !target.matches) return;
      if (target.matches('salla-products-slider,salla-products-list,salla-slider')) {
        scanCards(target.shadowRoot || target);
      }
    });
  });
})();