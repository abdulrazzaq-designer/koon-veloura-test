import './partials/veloura-exact-dark-light-plus3-v86';
import initVelouraCartBanners from './partials/veloura-cart-banners';
import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

/* The block below is placed immediately after the imports ON PURPOSE.

   Appended at the end of this file it would be the LAST thing to run, so any
   earlier failure anywhere in the bundle would take it down with it. The
   product-page integration styling should not depend on the rest of the file
   surviving, so it registers first and then waits for the DOM by itself. */
/* ==========================================================================
   VELOURA — Salla add-on blocks on the product page follow the store colours

   CSS alone is not enough here, for two reasons that only show up on a real
   store:

   1. These components hydrate AFTER the product data arrives. A stylesheet
      does apply to them when they appear, so that part is fine — but the
      list of components is not knowable in advance. A merchant can install a
      Salla app tomorrow that renders a block this theme has never heard of.

   2. Some of them paint their surface INSIDE shadow DOM, where a page
      stylesheet cannot reach at all. Only a style sheet injected into that
      shadow root can touch it.

   So instead of matching names, this looks for what is actually PAINTED: any
   Salla block inside the product page carrying a background of its own gets
   the store's secondary colour and loses its frame. New apps are covered the
   day they are installed, with no list to maintain.
   ========================================================================== */
/* ==========================================================================
   VELOURA — the header must not clip an open submenu

   The header surface and the menu wrapper both use overflow:hidden (the
   surface is a rounded shell, the wrapper stops a long menu spilling
   sideways). Measured on the real header, those two clip .sub-menu, so a
   category with children opened INSIDE the header instead of below it.

   The CSS in header-order.scss opens the clip with :has() while a submenu is
   hovered. This does the same with a class, which covers browsers without
   :has() and — more importantly — keyboard users, who never trigger :hover
   at all. Both paths close again the moment the menu is left, so the rounded
   shell keeps clipping the rest of the time.
   ========================================================================== */
/* --------------------------------------------------------------------------
   velouraHeaderGlassRoot

   An element that carries backdrop-filter becomes a BACKDROP ROOT: every
   descendant's own backdrop-filter can then only sample what is painted
   inside it. The header surface carried the filter, so the submenu — its
   descendant — was blurring a flat panel colour, which is a no-op. That is
   why the dropdown had no glass.

   The stylesheet moves the filter to surface::before, where it is a root for
   nothing. This runtime exists only because that stylesheet rule was measured
   losing on the live store to a rule in a cross-origin sheet the page would
   not let us read. Inline !important outranks every stylesheet, so this makes
   the outcome independent of whose CSS loads last.

   It touches ONE property on ONE element. Everything else stays in CSS.
   -------------------------------------------------------------------------- */
(function velouraHeaderGlassRoot() {
  var STACK = '.veloura-header-tabs-stack--blur';
  var SURFACE = '.veloura-header-tabs-stack__surface';

  function apply() {
    var stack = document.querySelector(STACK);
    if (!stack) return;
    var surface = stack.querySelector(SURFACE);
    if (!surface) return;

    // Only act when the browser really is applying a filter here; otherwise
    // leave the element alone so nothing is fought that is not a problem.
    var live = window.getComputedStyle(surface).backdropFilter
      || window.getComputedStyle(surface).webkitBackdropFilter;

    if (live && live !== 'none') {
      surface.style.setProperty('backdrop-filter', 'none', 'important');
      surface.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      surface.style.setProperty('background-color', 'transparent', 'important');
      surface.style.setProperty('background-image', 'none', 'important');
    }
  }

  function start() {
    apply();
    // The header is re-rendered by the theme on scroll-compact and on tab
    // switches, and Salla's own CSS can arrive after first paint.
    try {
      var mo = new MutationObserver(apply);
      mo.observe(document.documentElement, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ['class', 'style']
      });
    } catch (e) { /* observer unavailable: the timed passes still cover it */ }
    [300, 1000, 2500].forEach(function (t) { setTimeout(apply, t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());

(function velouraHeaderSubmenuClip() {
  const OPEN = 'veloura-submenu-open';

  const stackOf = (el) => el.closest('.veloura-header-tabs-stack');

  const open = (el) => {
    const stack = stackOf(el);
    if (stack) stack.classList.add(OPEN);
  };

  const close = (el) => {
    const stack = stackOf(el);
    if (!stack) return;
    /* Only close once nothing in the menu is hovered or focused any more, so
       moving the pointer between a parent and its own submenu never flickers. */
    if (stack.querySelector('li.has-children:hover, li.has-children:focus-within')) return;
    stack.classList.remove(OPEN);
  };

  const bind = () => {
    document.querySelectorAll('li.has-children, li.root-level').forEach((li) => {
      if (li.dataset.velouraSubmenuBound === '1') return;
      li.dataset.velouraSubmenuBound = '1';
      li.addEventListener('mouseenter', () => open(li));
      li.addEventListener('mouseleave', () => window.setTimeout(() => close(li), 60));
      li.addEventListener('focusin', () => open(li));
      li.addEventListener('focusout', () => window.setTimeout(() => close(li), 60));
    });
  };

  const start = () => {
    bind();
    /* The menu is rendered by a web component, so it can arrive late and be
       replaced; watching the header keeps the bindings correct. */
    const host = document.querySelector('.veloura-header-tabs-stack') || document.body;
    new MutationObserver(bind).observe(host, { childList: true, subtree: true });
    [500, 1500, 3000].forEach((d) => window.setTimeout(bind, d));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

(function velouraProductIntegrations() {
  const PAGE = '.veloura-product-page';

  /* Controls and media own their appearance — they are not surfaces. */
  const SKIP_TAGS = new Set([
    'salla-add-product-button', 'salla-mini-checkout-widget', 'salla-button',
    'salla-quantity-input', 'salla-slider', 'salla-product-options',
    'salla-social-share', 'salla-search', 'salla-cart-summary',
    'salla-breadcrumb', 'salla-modal', 'salla-tooltip', 'salla-loader',
    'salla-tabs', 'salla-tab-header', 'salla-rating-stars', 'salla-price',
    'salla-conditional-fields', 'salla-count-down', 'salla-progress-bar',
  ]);

  const TRANSPARENT = /^(transparent|rgba\(0,\s*0,\s*0,\s*0\)|color\(srgb 0 0 0 \/ 0\))$/i;

  const isPainted = (cs) => {
    const bg = (cs.backgroundColor || '').trim();
    if (!bg || TRANSPARENT.test(bg)) return false;
    /* rgba(...,0) in any notation means nothing is drawn. */
    const m = bg.match(/\/\s*(0?\.\d+|0|1)\s*\)$/) || bg.match(/,\s*(0?\.\d+|0|1)\s*\)$/);
    if (m && parseFloat(m[1]) === 0) return false;
    return true;
  };

  const hasContent = (el) => {
    /* Content can live in three places, and all three count: a shadow root,
       plain text on the component itself, or child elements. Checking only
       for child elements missed both the components that render entirely
       inside shadow DOM and the ones whose whole body is a line of text. */
    if (el.shadowRoot && el.shadowRoot.childElementCount) return true;
    if ((el.textContent || '').trim()) return true;
    if (!el.children.length) return false;
    for (const c of el.children) {
      if (c.children.length || (c.textContent || '').trim()) return true;
    }
    return false;
  };

  /* A component that paints inside its shadow root looks transparent from
     the outside, so the shadow content has to be inspected as well. */
  const shadowPaints = (el) => {
    if (!el.shadowRoot) return false;
    for (const c of el.shadowRoot.querySelectorAll('*')) {
      const cs = getComputedStyle(c);
      if (isPainted(cs)) return true;
      if (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none') return true;
    }
    return false;
  };

  /* A style sheet dropped into an open shadow root — the only way past the
     boundary. It reads the same custom properties, which inherit through the
     shadow boundary, so light and dark keep working by themselves. */
  const SHADOW_CSS = `
    :host{
      background: var(--veloura-integration-bg) !important;
      border: 0 !important;
      box-shadow: none !important;
      border-radius: var(--veloura-integration-radius, 0) !important;
      overflow: hidden !important;
    }
    [class*="wrapper"], [class*="container"], [class*="banner"],
    [class*="entry"], [class*="card"], [class*="box"], [class*="content"]{
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
    }
  `;

  const dressShadow = (host) => {
    const root = host.shadowRoot;
    if (!root || root.querySelector('style[data-veloura-integration]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-veloura-integration', '');
    style.textContent = SHADOW_CSS;
    root.appendChild(style);
  };

  const dress = (el) => {
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (el.closest('salla-add-product-button, salla-slider, salla-product-options')) return;
    if (!hasContent(el)) return;

    const rect = el.getBoundingClientRect();
    if (rect.height < 24 || rect.width < 120) return;

    const cs = getComputedStyle(el);
    const painted = isPainted(cs)
      || (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none')
      || (cs.boxShadow && cs.boxShadow !== 'none')
      || shadowPaints(el);

    if (!painted && !el.classList.contains('veloura-integration-surface')) return;

    el.classList.add('veloura-integration-surface');

    /* Clear any surface the component painted on its own wrappers, so the
       store never ends up with a panel drawn inside another panel. */
    [...el.children].forEach((child) => {
      const ccs = getComputedStyle(child);
      if (isPainted(ccs) || (ccs.borderTopWidth !== '0px' && ccs.borderTopStyle !== 'none')) {
        child.classList.add('veloura-integration-surface-inner');
      }
    });

    dressShadow(el);
  };

  const sweep = () => {
    const page = document.querySelector(PAGE);
    if (!page) return;
    page.querySelectorAll('*').forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const cls = String(el.className || '');
      /* Salla's own building blocks only: custom elements, or s- classes. */
      if (!tag.startsWith('salla-') && !tag.includes('-') && !/(^|\s)s-/.test(cls)) return;
      dress(el);
    });
  };

  const start = () => {
    if (!document.querySelector(PAGE)) return;
    sweep();

    /* These components arrive late and in waves, so the page is watched
       rather than swept once. */
    const observer = new MutationObserver(() => {
      window.clearTimeout(start._t);
      start._t = window.setTimeout(sweep, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    /* Salla hydration finishes at its own pace; a few spaced passes cover
       anything that settles after the observer has gone quiet. */
    [400, 1200, 2500, 5000].forEach((d) => window.setTimeout(sweep, d));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


// Veloura: avoid no-op writes to body.class. Chromium still delivers an
// attribute mutation for some DOMTokenList.remove() calls even when the token
// is already absent. Bottom-nav observers watch body.class, so repeated no-op
// writes can form a feedback loop while the side menu is opening/closing.
const removeBodyClassesIfPresent = (...tokens) => {
  const body = document.body;
  if (!body || !tokens.length) return false;

  const present = tokens.filter(token => token && body.classList.contains(token));
  if (!present.length) return false;

  body.classList.remove(...present);
  return true;
};


/* ========================================================================
   Veloura Bottom Navigation
   No custom runtime controller.
   Search/Login/Categories are delegated directly from master.twig to the
   same native triggers already used by Theme Raed / the current header.
   ======================================================================== */



/* ========================================================================
   Veloura Footer Controller — embedded in the existing app.js
   No additional JavaScript file is required.
   ======================================================================== */
const initVelouraFooter = (() => {
  /*
   * Veloura footer controller
   * - Builds one clean contact-card list from Salla contacts and social links.
   * - Removes duplicate platforms.
   * - Detects application badges and updates footer layout classes.
   * - Keeps App Store and Google Play badges side by side.
   */

  const SVG = {
          phone: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M6.6 10.8c1.6 3.1 3.5 5 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2C10.6 21.4 2.6 13.4 2.6 3.4c0-.7.5-1.2 1.2-1.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4 .1.4 0 .9-.3 1.2l-2.2 2.2Z"/></svg>',
          whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.4a9.4 9.4 0 0 0-8.1 14.2L2.7 21.6l5.1-1.2A9.4 9.4 0 1 0 12 2.4Zm0 17.1c-1.4 0-2.8-.4-4-1.1l-.3-.2-3 .7.7-2.9-.2-.3A7.6 7.6 0 1 1 12 19.5Zm4.3-5.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.2-.2-.4-.3Z"/></svg>',
          email: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2Zm8 8.1L4.4 8.2V17h15.2V8.2L12 13.1Zm0-2L19.1 7H4.9L12 11.1Z"/></svg>',
          telegram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.7 3.6 18.4 20c-.2 1-.8 1.2-1.6.7l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.9 14.1 2.5 12.7c-1-.3-1-1 .2-1.4L20 4.6c.8-.3 1.5.2 1.7 1Z"/></svg>',
          instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7.5 2.8h9A4.7 4.7 0 0 1 21.2 7.5v9a4.7 4.7 0 0 1-4.7 4.7h-9a4.7 4.7 0 0 1-4.7-4.7v-9a4.7 4.7 0 0 1 4.7-4.7Zm0 2A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9ZM12 7.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5-2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg>',
          twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4 3.5h4.1l4.4 6.1 5.3-6.1h2.3l-6.5 7.5 7.1 9.5h-4.1l-4.8-6.5-5.7 6.5H3.8l6.9-8L4 3.5Zm3.1 1.7 10.4 13.6h1L8.2 5.2H7.1Z"/></svg>',
          youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.6 7.2c-.2-.8-.8-1.4-1.6-1.6C18.6 5.2 12 5.2 12 5.2s-6.6 0-8 .4c-.8.2-1.4.8-1.6 1.6C2 8.6 2 12 2 12s0 3.4.4 4.8c.2.8.8 1.4 1.6 1.6 1.4.4 8 .4 8 .4s6.6 0 8-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-4.8.4-4.8s0-3.4-.4-4.8ZM10 14.9V9.1l5.2 2.9L10 14.9Z"/></svg>',
          tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M15.4 3c.4 2.6 1.9 4.2 4.5 4.4v3.1c-1.5.1-2.9-.4-4.4-1.3v6.2c0 3.1-2.1 5.4-5.2 5.6-2.8.2-5.3-1.7-5.8-4.4-.7-3.8 2.5-7 6.2-6.3v3.2c-.5-.2-1-.3-1.5-.2-1.2.2-2 1.2-1.9 2.4.1 1.2 1.1 2.1 2.3 2.1 1.5 0 2.4-1 2.4-2.7V3h3.4Z"/></svg>',
          facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14 8.1V6.3c0-.9.2-1.3 1.4-1.3H17V2.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.1v2H8v3.1h2.6V22H14V11.2h2.7l.4-3.1H14Z"/></svg>',
          snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2.5c3 0 5 2.2 5 5.4v2.3c.3.2.8.1 1.2 0 .6-.2 1 .5.6 1-.4.5-.9.8-1.4 1 .2 1.1 1.1 2.4 3.1 3 .7.2.7 1.1.1 1.4-.9.4-1.8.5-2.6.6-.3.5-.8 1-1.5 1-.6 0-1.1-.2-1.7-.4-.7.7-1.6 1.2-2.8 1.2s-2.1-.5-2.8-1.2c-.6.2-1.1.4-1.7.4-.7 0-1.2-.5-1.5-1-.8-.1-1.7-.2-2.6-.6-.6-.3-.6-1.2.1-1.4 2-.6 2.9-1.9 3.1-3-.5-.2-1-.5-1.4-1-.4-.5 0-1.2.6-1 .4.1.9.2 1.2 0V7.9c0-3.2 2-5.4 5-5.4Z"/></svg>',
          website: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.2c-.1-2-.6-3.8-1.4-5.2A8 8 0 0 1 18.9 11ZM12 4.1c.7 1 1.5 3.3 1.7 6.9h-3.4c.2-3.6 1-5.9 1.7-6.9ZM4.3 13h3.2c.1 2 .6 3.8 1.4 5.2A8 8 0 0 1 4.3 13Zm3.2-2H4.3a8 8 0 0 1 4.6-5.2C8.1 7.2 7.6 9 7.5 11ZM12 19.9c-.7-1-1.5-3.3-1.7-6.9h3.4c-.2 3.6-1 5.9-1.7 6.9Zm3.1-1.7c.8-1.4 1.3-3.2 1.4-5.2h3.2a8 8 0 0 1-4.6 5.2Z"/></svg>',
          contact: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.6V20h14v-1.4C19 16 16 14 12 14Z"/></svg>'
        };

  const labelMap = {
          phone: 'جوال',
          whatsapp: 'واتساب',
          email: 'إيميل',
          telegram: 'تلجرام',
          instagram: 'انستغرام',
          twitter: 'إكس',
          youtube: 'يوتيوب',
          snapchat: 'سناب',
          tiktok: 'تيك توك',
          facebook: 'فيسبوك',
          website: 'الموقع',
          contact: 'تواصل'
        };

  let eventsBound = false;
  let resizeTimer = null;

  function cleanText(element) {
    return (element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function detectKind(link, sourceType) {
    const href = (link.getAttribute('href') || '').toLowerCase();
    const aria = (link.getAttribute('aria-label') || '').toLowerCase();
    const title = (link.getAttribute('title') || '').toLowerCase();
    const classes = Array.from(link.querySelectorAll('[class]'))
      .map(element => element.className || '')
      .join(' ')
      .toLowerCase();
    const text = cleanText(link).toLowerCase();
    const source = [href, aria, title, classes, text].join(' ');

    if (/wa\.me|whatsapp|واتساب/.test(source)) return 'whatsapp';
    if (/mailto:|email|mail|إيميل|بريد|envelope/.test(source)) return 'email';
    if (/t\.me|telegram|تلجرام|paper-plane/.test(source)) return 'telegram';
    if (/instagram|انستغرام/.test(source)) return 'instagram';
    if (/twitter|x\.com|إكس/.test(source)) return 'twitter';
    if (/youtube|youtu\.be|يوتيوب/.test(source)) return 'youtube';
    if (/snapchat|snap|سناب/.test(source)) return 'snapchat';
    if (/tiktok|تيك/.test(source)) return 'tiktok';
    if (/facebook|فيسبوك/.test(source)) return 'facebook';
    if (/tel:|phone|mobile|call|هاتف|جوال/.test(source)) return 'phone';
    if (sourceType === 'social') return 'website';
    if (/https?:\/\//.test(source)) return 'website';

    return 'contact';
  }

  function copySafeAttributes(source, target) {
    Array.from(source.attributes || []).forEach(attribute => {
      if (['id', 'class', 'style', 'hidden'].includes(attribute.name)) return;
      target.setAttribute(attribute.name, attribute.value);
    });
  }

  function createContactCard(source, kind) {
    const isLink = source.tagName === 'A' && source.getAttribute('href');
    const card = document.createElement(isLink ? 'a' : 'button');
    const label = labelMap[kind] || labelMap.contact;
    const icon = SVG[kind] || SVG.contact;

    copySafeAttributes(source, card);

    if (!isLink) {
      card.type = 'button';
      card.addEventListener('click', event => {
        event.preventDefault();
        source.click();
      });
    }

    card.className = `veloura-footer-contact-card veloura-footer-contact-kind-${kind}`;
    card.dataset.velouraFooterKind = kind;
    card.setAttribute('aria-label', source.getAttribute('aria-label') || label);
    card.innerHTML = `
      <span class="veloura-footer-contact-card__icon" aria-hidden="true">${icon}</span>
      <span class="veloura-footer-contact-card__text">${label}</span>
    `;

    return card;
  }

  function renderContactCards(footer) {
    const contactWrap = footer.querySelector('.veloura-footer-contact-wrap');
    if (!contactWrap) return;

    const mergeSocial = footer.classList.contains('veloura-footer-merge-social');
    const selector = mergeSocial
      ? '[data-veloura-footer-contacts] a[href], [data-veloura-footer-social] a[href], [data-veloura-footer-social] button'
      : '[data-veloura-footer-contacts] a[href], [data-veloura-footer-contacts] button';

    const sources = Array.from(contactWrap.querySelectorAll(selector));

    if (!sources.length) {
      contactWrap.classList.remove('veloura-footer-contact-ready');
      contactWrap.querySelector(':scope > .veloura-footer-contact-cards')?.remove();
      return;
    }

    const seen = new Set();
    const cards = [];

    sources.forEach(source => {
      const sourceType = source.closest('[data-veloura-footer-social]')
        ? 'social'
        : 'contact';
      const kind = detectKind(source, sourceType);
      const href = (source.getAttribute('href') || '').trim().toLowerCase();
      const key = kind === 'contact' ? `${kind}:${href || cleanText(source)}` : kind;

      if (!key || seen.has(key)) return;

      seen.add(key);
      cards.push(createContactCard(source, kind));
    });

    if (!cards.length) return;

    let cardsRoot = contactWrap.querySelector(':scope > .veloura-footer-contact-cards');

    if (!cardsRoot) {
      cardsRoot = document.createElement('div');
      cardsRoot.className = 'veloura-footer-contact-cards';
      cardsRoot.dataset.velouraFooterContactCards = '1';
      contactWrap.appendChild(cardsRoot);
    }

    cardsRoot.replaceChildren(...cards);
    contactWrap.classList.add('veloura-footer-contact-ready');
  }


  function renderDetachedSocialCards(footer) {
    if (!footer || footer.classList.contains('veloura-footer-merge-social')) return;

    footer.querySelectorAll('.veloura-footer-social-contact[data-veloura-footer-social]').forEach(socialRoot => {
      const sources = Array.from(
        socialRoot.querySelectorAll('salla-social a[href], salla-social button')
      );

      let cardsRoot = socialRoot.querySelector(':scope > .veloura-footer-social-cards');

      if (!sources.length) {
        cardsRoot?.remove();
        socialRoot.classList.remove('veloura-footer-social-ready');
        return;
      }

      const seen = new Set();
      const cards = [];

      sources.forEach(source => {
        const kind = detectKind(source, 'social');
        const href = (source.getAttribute('href') || '').trim().toLowerCase();
        const key = `${kind}:${href || cleanText(source)}`;
        if (!key || seen.has(key)) return;

        seen.add(key);
        const card = createContactCard(source, kind);
        card.classList.add('veloura-footer-social-card');
        cards.push(card);
      });

      if (!cards.length) return;

      if (!cardsRoot) {
        cardsRoot = document.createElement('div');
        cardsRoot.className = 'veloura-footer-social-cards';
        cardsRoot.dataset.velouraFooterSocialCards = '1';
        socialRoot.appendChild(cardsRoot);
      }

      cardsRoot.replaceChildren(...cards);
      socialRoot.classList.add('veloura-footer-social-ready');
    });
  }

  function restoreImages(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;

    root.querySelectorAll('img').forEach(image => {
      const dataSrc = image.getAttribute('data-src');
      const dataSrcset = image.getAttribute('data-srcset');

      if (!image.getAttribute('src') && dataSrc) image.setAttribute('src', dataSrc);
      if (!image.getAttribute('srcset') && dataSrcset) image.setAttribute('srcset', dataSrcset);

      image.hidden = false;
      image.style.removeProperty('display');
      image.style.removeProperty('visibility');
      image.style.removeProperty('opacity');
    });
  }

  function setImportant(element, property, value) {
    if (!element?.style) return;
    element.style.setProperty(property, value, 'important');
  }

  function getApplicationRoots(appsBlock) {
    const component = appsBlock?.querySelector('salla-apps-icons');
    const roots = [appsBlock, component].filter(Boolean);

    if (component?.shadowRoot) roots.push(component.shadowRoot);

    return { component, roots };
  }

  function rootHasApplications(root) {
    if (!root || typeof root.querySelector !== 'function') return false;

    return Boolean(root.querySelector(
      'a[href], img[src]:not([src=""]), img[data-src]'
    ));
  }

  function arrangeApplications(footer) {
    const appsBlock = footer.querySelector('[data-veloura-footer-apps]');

    if (!appsBlock) {
      footer.classList.remove('veloura-footer-has-apps', 'veloura-footer-layout-detecting');
      footer.classList.add('veloura-footer-no-apps');
      return;
    }

    restoreImages(appsBlock);

    const { component, roots } = getApplicationRoots(appsBlock);
    const centered =
      footer.classList.contains('veloura-footer-center-all') ||
      footer.dataset.velouraFooterCenterAll === 'true';

    roots.forEach(root => {
      if (!root) return;

      const host = root.host || root;
      setImportant(host, 'width', '100%');
      setImportant(host, 'direction', centered ? 'ltr' : 'rtl');

      if (typeof root.querySelectorAll !== 'function') return;

      root.querySelectorAll(
        'div, ul, ol, nav, section, [class*="apps"], ' +
        '[class*="wrapper"], [class*="icons"]'
      ).forEach(wrapper => {
        if (wrapper.querySelectorAll('a[href], img').length < 2) return;

        setImportant(wrapper, 'display', 'flex');
        setImportant(wrapper, 'direction', centered ? 'ltr' : 'rtl');
        setImportant(wrapper, 'flex-direction', 'row');
        setImportant(wrapper, 'flex-wrap', window.innerWidth <= 560 ? 'wrap' : 'nowrap');
        setImportant(wrapper, 'align-items', 'center');
        setImportant(wrapper, 'justify-content', centered ? 'center' : 'flex-start');
        setImportant(wrapper, 'gap', '10px');
        setImportant(wrapper, 'margin', '0');
        setImportant(wrapper, 'padding', '0');
      });

      root.querySelectorAll('a[href]').forEach(link => {
        setImportant(link, 'display', 'inline-flex');
        setImportant(link, 'flex', '0 0 auto');
        setImportant(link, 'align-items', 'center');
        setImportant(link, 'justify-content', 'center');
        setImportant(link, 'width', 'auto');
        setImportant(link, 'min-width', '0');
        setImportant(link, 'max-width', '150px');
        setImportant(link, 'margin', '0');
      });

      root.querySelectorAll('img').forEach(image => {
        setImportant(image, 'display', 'block');
        setImportant(image, 'visibility', 'visible');
        setImportant(image, 'opacity', '1');
        setImportant(image, 'width', 'auto');
        setImportant(image, 'height', '38px');
        setImportant(image, 'max-width', '150px');
        setImportant(image, 'max-height', '38px');
        setImportant(image, 'object-fit', 'contain');
        setImportant(image, 'margin', '0');
      });
    });

    const hasApps = roots.some(rootHasApplications);

    appsBlock.hidden = !hasApps;
    appsBlock.setAttribute('aria-hidden', hasApps ? 'false' : 'true');
    footer.classList.toggle('veloura-footer-has-apps', hasApps);
    footer.classList.toggle('veloura-footer-no-apps', !hasApps);
    footer.classList.remove('veloura-footer-layout-detecting');

    if (
      component &&
      typeof component.componentOnReady === 'function' &&
      component.dataset.velouraFooterReadyWatch !== '1'
    ) {
      component.dataset.velouraFooterReadyWatch = '1';

      component.componentOnReady().then(() => {
        restoreImages(appsBlock);
        arrangeApplications(footer);
      }).catch(() => {});
    }
  }

  function observeContactSources(footer) {
    footer.querySelectorAll(
      '[data-veloura-footer-contacts], [data-veloura-footer-social]'
    ).forEach(sourceRoot => {
      if (sourceRoot.dataset.velouraFooterObserver === '1') return;

      sourceRoot.dataset.velouraFooterObserver = '1';
      let scheduled = false;

      const observer = new MutationObserver(records => {
        const hasSourceMutation = records.some(record =>
          !record.target?.closest?.('[data-veloura-footer-social-cards]') &&
          !record.target?.closest?.('[data-veloura-footer-contact-cards]')
        );

        if (!hasSourceMutation || scheduled) return;
        scheduled = true;

        window.requestAnimationFrame(() => {
          scheduled = false;
          renderContactCards(footer);
          renderDetachedSocialCards(footer);
        });
      });

      observer.observe(sourceRoot, { childList: true, subtree: true });

      window.setTimeout(() => observer.disconnect(), 8000);
    });
  }

  function observeApplications(footer) {
    const appsBlock = footer.querySelector('[data-veloura-footer-apps]');
    if (!appsBlock || appsBlock.dataset.velouraFooterObserver === '1') return;

    appsBlock.dataset.velouraFooterObserver = '1';
    let scheduled = false;

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;

      window.requestAnimationFrame(() => {
        scheduled = false;
        restoreImages(appsBlock);
        arrangeApplications(footer);
      });
    });

    observer.observe(appsBlock, { childList: true, subtree: true });

    window.setTimeout(() => {
      observer.disconnect();
      arrangeApplications(footer);
    }, 8000);
  }

  function initFooter(footer) {
    if (!footer) return;

    restoreImages(footer);
    renderContactCards(footer);
    renderDetachedSocialCards(footer);
    arrangeApplications(footer);
    observeContactSources(footer);
    observeApplications(footer);
  }

  function initAllFooters() {
    document
      .querySelectorAll('.store-footer.veloura-footer-enabled')
      .forEach(initFooter);
  }

  function initVelouraFooter() {
    if (eventsBound) {
      initAllFooters();
      return;
    }

    eventsBound = true;

    document.addEventListener('theme::ready', initAllFooters);

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(initAllFooters, 150);
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllFooters, { once: true });
    } else {
      initAllFooters();
    }

    [300, 900, 1800, 3500].forEach(delay => {
      window.setTimeout(initAllFooters, delay);
    });
  }

  return initVelouraFooter;
})();

/* ========================================================================
   Veloura Neutral Frosted Glass V3 Runtime
   Injects glass styles into open Shadow DOM components without ever applying
   backdrop-filter to full-screen hosts, wrappers or backdrops.
   ======================================================================== */
const initVelouraGlobalGlass = (() => {
  const STYLE_ID = 'veloura-global-glass-shadow-style';
  const HOST_SELECTOR = [
    'salla-localization-modal',
    'salla-user-menu',
    'salla-scopes',
    'salla-gifting'
  ].join(',');

  const SHADOW_CSS = `
    :host {
      --veloura-shadow-glass-bg: var(--veloura-global-glass-bg, rgba(255, 255, 255, .64));
      --veloura-shadow-glass-layer: var(--veloura-global-glass-layer, linear-gradient(145deg, rgba(255, 255, 255, .22), rgba(229, 231, 235, .08)));
      --veloura-shadow-glass-edge-top: var(--veloura-global-glass-edge-top, rgba(148, 163, 184, .24));
      --veloura-shadow-glass-edge-bottom: var(--veloura-global-glass-edge-bottom, rgba(148, 163, 184, .085));
      --veloura-shadow-glass-shadow: var(--veloura-global-glass-shadow, rgba(15, 23, 42, .07));
      --veloura-shadow-glass-filter: var(--veloura-global-glass-filter, blur(17px) saturate(36%) brightness(104%) contrast(98%));
      --veloura-shadow-glass-overlay: var(--veloura-global-glass-overlay, rgba(15, 23, 42, .12));
      --veloura-shadow-glass-control: var(--veloura-global-glass-control, rgba(255, 255, 255, .52));
    }

    /* Full-screen hosts and wrappers must remain completely non-glass. */
    :host,
    .s-modal-wrapper,
    .s-modal-container,
    .s-login-modal,
    .s-auth-modal,
    .login-modal,
    .auth-modal,
    [part~='wrapper'],
    [part~='container'] {
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
      background-image: none !important;
      border-color: transparent !important;
    }

    /* The page behind the dialog is dimmed only; it is never blurred. */
    .s-salla-modal-overlay,
    .s-modal-overlay,
    .s-modal-backdrop,
    .modal-backdrop,
    .backdrop,
    [part~='overlay'],
    [part~='backdrop'] {
      background: var(--veloura-shadow-glass-overlay) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
      box-shadow: none !important;
      transition-property: opacity, visibility, background-color !important;
      transition-delay: 0s !important;
    }

    /* Only the visible dialog panel receives the glass material. */
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
    [part~='surface'] {
      background: var(--veloura-shadow-glass-layer), var(--veloura-shadow-glass-bg) !important;
      background-color: var(--veloura-shadow-glass-bg) !important;
      border-top: 1px solid var(--veloura-shadow-glass-edge-top) !important;
      border-bottom: 1px solid var(--veloura-shadow-glass-edge-bottom) !important;
      border-inline: 0 !important;
      -webkit-backdrop-filter: var(--veloura-shadow-glass-filter) !important;
      backdrop-filter: var(--veloura-shadow-glass-filter) !important;
      filter: none !important;
      box-shadow:
        inset 0 1px 0 var(--veloura-shadow-glass-edge-top),
        inset 0 -1px 0 var(--veloura-shadow-glass-edge-bottom),
        0 8px 26px var(--veloura-shadow-glass-shadow) !important;
      transition-property: opacity, transform, visibility !important;
      transition-delay: 0s !important;
    }

    input,
    select,
    textarea,
    .form-input,
    .s-form-control {
      background: var(--veloura-shadow-glass-control) !important;
      border-color: color-mix(in srgb, var(--veloura-shadow-glass-edge-top) 70%, transparent) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
  `;

  function isEnabled() {
    return Boolean(document.body && document.body.classList.contains('veloura-glass-effect'));
  }

  function injectIntoShadowRoot(shadowRoot) {
    if (!shadowRoot) return;

    const previousStyle = shadowRoot.getElementById(STYLE_ID);
    if (previousStyle) previousStyle.remove();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = SHADOW_CSS;
    shadowRoot.appendChild(style);

    shadowRoot.querySelectorAll(HOST_SELECTOR).forEach(markHost);
  }

  function markHost(host) {
    if (!host || host.nodeType !== 1) return;
    if (host.matches?.('[data-vbn-native], salla-login-modal[data-vbn-native-login]')) return;
    if (host.closest?.('[data-vbn-native]')) return;

    host.setAttribute('data-veloura-glass-host', 'true');
    host.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    host.style.setProperty('backdrop-filter', 'none', 'important');
    host.style.setProperty('filter', 'none', 'important');

    if (host.shadowRoot) {
      injectIntoShadowRoot(host.shadowRoot);
    }
  }

  function scan(scope = document) {
    if (!isEnabled() || !scope || typeof scope.querySelectorAll !== 'function') return;

    if (scope.matches && scope.matches(HOST_SELECTOR)) markHost(scope);
    scope.querySelectorAll(HOST_SELECTOR).forEach(markHost);
  }

  function scheduleScan() {
    [0, 80, 220, 500, 1000, 1800].forEach(delay => {
      window.setTimeout(() => scan(document), delay);
    });
  }

  function init() {
    if (!isEnabled()) return;

    scheduleScan();

    document.addEventListener('theme::ready', scheduleScan);
    document.addEventListener('click', event => {
      if (event.target.closest('.veloura-login-btn, [data-login], [data-open-login], .s-login-modal-trigger')) {
        scheduleScan();
      }
    }, true);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) scan(node);
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  return init;
})();

/* ========================================================================
   Veloura Header Controls
   - Opens the single official Salla localization component from the mobile icon.
   - Uses the documented open() method instead of clicking the web-component host.
   ======================================================================== */
const initVelouraHeaderControls = (() => {
  let eventsBound = false;

  const openLocalization = async trigger => {
    const modal = document.querySelector('salla-localization-modal');

    if (!modal) {
      trigger?.setAttribute('aria-disabled', 'true');
      return;
    }

    try {
      if (window.customElements?.whenDefined) {
        await window.customElements.whenDefined('salla-localization-modal');
      }

      if (typeof modal.open === 'function') {
        await modal.open();
        return;
      }

      const nativeTrigger = modal.shadowRoot?.querySelector(
        'button, [role="button"], [part~="trigger"]'
      );

      nativeTrigger?.click();
    } catch (error) {
      salla.logger?.error?.('veloura-header::localization-open', error);
    }
  };

  return () => {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-veloura-localization-trigger]');
      if (!trigger) return;

      event.preventDefault();
      event.stopPropagation();
      openLocalization(trigger);
    }, true);
  };
})();

/* ========================================================================
   Veloura V55 adaptive header controller
   - Measures the rendered controls instead of assuming a fixed icon count.
   - Uses a tight state first, then a two-tier fallback only when required.
   - Mirrors the secondary/glass search contract inside Salla's shadow root.
   ======================================================================== */
const initVelouraAdaptiveHeaderLayout = (() => {
  let initialized = false;
  const searchObservers = new WeakMap();

  const searchShadowCss = `
    :host {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: var(--veloura-search-height, 36px) !important;
      height: var(--veloura-search-height, 36px) !important;
      max-height: var(--veloura-search-height, 36px) !important;
      border-radius: var(--veloura-search-radius, 24px) !important;

      /* Single-layer search:
         .veloura-search-surface in light DOM owns all glass paint. */
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
      overflow: visible !important;

      --s-search-bg: transparent !important;
      --s-search-input-bg: transparent !important;
      --s-search-input-background: transparent !important;
      --search-input-bg: transparent !important;
      --search-background: transparent !important;
    }

    form,
    .s-search,
    .s-search-container,
    .s-search-wrapper,
    .s-search-input-wrapper,
    .s-search-input,
    .s-search-field,
    input,
    [part~="form"],
    [part~="container"],
    [part~="wrapper"],
    [part~="input-wrapper"],
    [part~="input"],
    [part~="field"] {
      width: 100% !important;
      min-width: 0 !important;
      min-height: var(--veloura-search-height, 36px) !important;
      height: var(--veloura-search-height, 36px) !important;
      max-height: var(--veloura-search-height, 36px) !important;
      box-sizing: border-box !important;
      border: 0 !important;
      border-color: transparent !important;
      border-radius: var(--veloura-search-radius, 24px) !important;

      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;

      color: var(--veloura-top-text, currentColor) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      filter: none !important;
    }

    form::before,
    form::after,
    .s-search-container::before,
    .s-search-container::after,
    .s-search-wrapper::before,
    .s-search-wrapper::after,
    .s-search-input-wrapper::before,
    .s-search-input-wrapper::after,
    .s-search-input::before,
    .s-search-input::after {
      background: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    .s-search-results,
    [part~="results"] {
      border-radius: var(--veloura-search-radius, 24px) !important;
      overflow: hidden !important;
    }
  `;

  const ensureSearchShadowStyle = (host) => {
    if (!host) return;

    const apply = () => {
      const root = host.shadowRoot;
      if (!root) return;

      root.querySelectorAll('style[data-veloura-search-v55]').forEach(node => node.remove());

      let style = root.querySelector('style[data-veloura-search-v60]');
      if (!style) {
        style = document.createElement('style');
        style.dataset.velouraSearchV60 = 'true';
        root.appendChild(style);
      }
      if (style.textContent !== searchShadowCss) {
        style.textContent = searchShadowCss;
      }

      if (!searchObservers.has(host) && typeof MutationObserver === 'function') {
        const observer = new MutationObserver(() => {
          root.querySelectorAll('style[data-veloura-search-v55]').forEach(node => node.remove());
          let current = root.querySelector('style[data-veloura-search-v60]');
          if (!current) {
            current = document.createElement('style');
            current.dataset.velouraSearchV60 = 'true';
            root.appendChild(current);
          }
          if (current.textContent !== searchShadowCss) {
            current.textContent = searchShadowCss;
          }
        });
        observer.observe(root, { childList: true });
        searchObservers.set(host, observer);
      }
    };

    apply();
    if (typeof host.componentOnReady === 'function') {
      host.componentOnReady().then(apply).catch(() => {});
    }
  };

  return () => {
    if (initialized) return;
    initialized = true;

    const stack = document.querySelector('[data-veloura-header-tabs-stack]');
    const header = stack?.querySelector('.store-header.veloura-top-enabled');
    const grid = header?.querySelector('.veloura-header-grid');
    if (!stack || !header || !grid) return;

    const styleSearches = (scope = stack) => {
      scope.querySelectorAll?.('salla-search.veloura-header-search-component')
        .forEach(ensureSearchShadowStyle);
    };

    const overlaps = (first, second, safety = 5) => {
      if (!first || !second) return false;
      const verticalOverlap = first.bottom > second.top + 2 && second.bottom > first.top + 2;
      if (!verticalOverlap) return false;
      return first.right + safety > second.left && second.right + safety > first.left;
    };

    const needsMoreRoom = () => {
      const logo = header.querySelector('.veloura-header-logo');
      const left = header.querySelector('.veloura-header-left');
      const right = header.querySelector('.veloura-header-right');
      if (!logo || !left || !right) return false;

      const gridRect = grid.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const hasScrollOverflow = grid.scrollWidth > grid.clientWidth + 2;
      const outside = leftRect.left < gridRect.left - 2 || rightRect.right > gridRect.right + 2;
      const logoCollision = overlaps(logoRect, leftRect) || overlaps(logoRect, rightRect);

      return hasScrollOverflow || outside || logoCollision;
    };

    let layoutFrame = 0;
    let secondFrame = 0;

    const updateLayout = () => {
      layoutFrame = 0;
      header.classList.remove('veloura-header-layout-tight', 'veloura-header-layout-two-tier');

      requestAnimationFrame(() => {
        if (!needsMoreRoom()) {
          document.dispatchEvent(new CustomEvent('veloura:header:layout', {
            detail: { mode: 'single-row' }
          }));
          return;
        }

        header.classList.add('veloura-header-layout-tight');

        secondFrame = requestAnimationFrame(() => {
          secondFrame = 0;
          if (needsMoreRoom()) {
            header.classList.add('veloura-header-layout-two-tier');
          }

          document.dispatchEvent(new CustomEvent('veloura:header:layout', {
            detail: {
              mode: header.classList.contains('veloura-header-layout-two-tier')
                ? 'two-tier'
                : 'tight'
            }
          }));
        });
      });
    };

    const scheduleLayout = () => {
      if (layoutFrame) cancelAnimationFrame(layoutFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      layoutFrame = requestAnimationFrame(updateLayout);
    };

    styleSearches();
    scheduleLayout();

    document.addEventListener('veloura:menu:ready', scheduleLayout);
    window.addEventListener('resize', scheduleLayout, { passive: true });
    window.addEventListener('orientationchange', scheduleLayout, { passive: true });
    window.addEventListener('load', () => setTimeout(scheduleLayout, 80), { once: true });

    header.querySelectorAll('img,video').forEach((media) => {
      if (media.complete || media.readyState >= 2) return;
      media.addEventListener('load', scheduleLayout, { once: true });
      media.addEventListener('loadedmetadata', scheduleLayout, { once: true });
    });

    document.fonts?.ready?.then(scheduleLayout).catch(() => {});

    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches?.('salla-search.veloura-header-search-component')) {
              ensureSearchShadowStyle(node);
            }
            styleSearches(node);
          });
        });
        scheduleLayout();
      });
      observer.observe(stack, { childList: true, subtree: true });
    }
  };
})();

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    initVelouraFooter();
    // V85: legacy Shadow DOM glass runtime disabled; V85 owns this bridge.
    initVelouraHeaderControls();
    initVelouraAdaptiveHeaderLayout();
    this.initiateNotifier();
    this.initiateMobileMenu();
    // V4: initialize the whole header system even when sticky is disabled,
    // because floating / blur / compact modes are independent settings.
    this.initiateStickyMenu();
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    
    // Ensure #more-menu-dropdown exists before running changeMenuDirection
    const menuDirInterval = setInterval(() => {
      if (document.querySelector('#more-menu-dropdown')) {
        this.changeMenuDirection();
        clearInterval(menuDirInterval);
      }
    }, 100);

    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

    changeMenuDirection() {
      setTimeout(() => {
        app.all('.root-level.has-children', item => {
          if (item.classList.contains('change-menu-dir')) return;
          app.on('mouseover', item, () => {
            let allSubMenus = item.querySelectorAll('.sub-menu');
            allSubMenus.forEach((submenu, idx) => {
              if (idx === 0) return;
              let rect = submenu.getBoundingClientRect();
              if (rect.left < 10 || rect.right > window.innerWidth - 10) {
                app.addClass(item, 'change-menu-dir');
              }
            });
          });
        });
      }, 1000);
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

isElementLoaded(selector){
  return new Promise((resolve=>{
    const interval=setInterval(()=>{
    if(document.querySelector(selector)){
      clearInterval(interval)
      return resolve(document.querySelector(selector))
    }
   },160)
}))

  
  };

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
    btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (window.enable_add_product_toast && data?.data?.googleTags?.event === "addToCart") {
        return;
      }
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }

  initiateMobileMenu() {
    /**
     * Veloura V128 — isolated native side-menu runtime.
     *
     * The side categories drawer must own one off-canvas instance and one
     * state. It is deliberately isolated from the product filters drawer and
     * from the mobile bottom navigation.
     */
    if (window.__velouraNativeMobileMenuInitPromise) {
      return window.__velouraNativeMobileMenuInitPromise;
    }

    window.__velouraNativeMobileMenuInitPromise =
      this.isElementLoaded('#mobile-menu').then((menu) => {
        if (!menu) {
          window.__velouraNativeMobileMenuInitPromise = null;
          return null;
        }

        if (menu.dataset.velouraMmenuReady === '1') {
          return window.__velouraNativeMobileMenuDrawer || null;
        }

        menu.dataset.velouraMmenuReady = '1';

        // Keep mmenu-light initialized at every viewport width. Visibility is
        // controlled by the header setting: on mobile it is always available,
        // while on laptop/desktop it is available only when the merchant chose
        // "hamburger / menu like mobile" instead of desktop category links.
        const mobileMenu = new MobileMenu(
          menu,
          '(min-width: 0px)',
          '( slidingSubmenus: false)'
        );

        salla.lang.onLoaded(() => {
          mobileMenu.navigation({
            title: salla.lang.get('blocks.header.main_menu')
          });
        });

        const drawer = mobileMenu.offcanvas({
          position: salla.config.get('theme.is_rtl') ? 'right' : 'left'
        });

        // offcanvas() moves #mobile-menu into its generated .mm-ocd wrapper.
        const drawerRoot = menu.closest('.mm-ocd');
        const drawerContent = drawerRoot?.querySelector('.mm-ocd__content') || null;
        const drawerBackdrop = drawerRoot?.querySelector('.mm-ocd__backdrop') || null;

        drawerRoot?.classList.add('veloura-side-menu-drawer');
        menu.dataset.velouraDrawerRole = 'side-menu';

        window.__velouraNativeMobileMenuDrawer = drawer;
        window.__velouraNativeMobileMenuRoot = drawerRoot;

        const isMobileRange = () => window.matchMedia('(max-width: 1023.98px)').matches;
        const isDesktopHamburgerMode = () => Boolean(
          document.querySelector('.store-header.veloura-desktop-menu-hamburger')
        );
        const isMenuAllowedAtCurrentWidth = () => (
          isMobileRange() || isDesktopHamburgerMode()
        );
        const isNativeMenuOpen = () => Boolean(
          drawerRoot?.classList.contains('mm-ocd--open') ||
          document.body.classList.contains('menu-opened')
        );

        const suppressBottomNav = (suppressed) => {
          const bottomNav = document.querySelector('[data-vbn]');
          if (!bottomNav) return;

          bottomNav.classList.toggle('is-side-menu-suppressed', suppressed);

          if (suppressed) {
            bottomNav.setAttribute('aria-hidden', 'true');
          } else {
            bottomNav.removeAttribute('aria-hidden');
          }
        };

        const closeOtherOffcanvas = () => {
          // Product filters use a second mmenu-light instance. Never leave both
          // drawers open because mmenu-light uses one global body lock class.
          try {
            window.__velouraFiltersDrawer?.close?.();
          } catch (_) {}

          removeBodyClassesIfPresent('filters-opened');

          document.querySelectorAll('.mm-ocd.mm-ocd--open').forEach(root => {
            if (root !== drawerRoot) {
              root.classList.remove('mm-ocd--open');
            }
          });
        };

        const clearBottomOverlayState = () => {
          removeBodyClassesIfPresent(
            'veloura-bottom-nav-search-open',
            'veloura-bottom-nav-login-open'
          );

          document.querySelectorAll(
            '[id^="veloura-bottom-search-panel"], [id^="veloura-bottom-search-backdrop"]'
          ).forEach(node => {
            node.hidden = true;
            node.setAttribute('aria-hidden', 'true');
          });
        };

        const forceOpenState = () => {
          if (!drawerRoot) return;

          drawerRoot.classList.add('mm-ocd--open');
          document.body.classList.add('mm-ocd-opened');
          menu.style.setProperty('display', 'block', 'important');

          if (drawerContent) {
            drawerContent.style.setProperty('visibility', 'visible', 'important');
            drawerContent.style.setProperty('opacity', '1', 'important');
            drawerContent.style.setProperty('pointer-events', 'auto', 'important');
            drawerContent.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');
          }
        };

        const releaseForcedState = () => {
          menu.style.removeProperty('display');

          if (drawerContent) {
            drawerContent.style.removeProperty('visibility');
            drawerContent.style.removeProperty('opacity');
            drawerContent.style.removeProperty('pointer-events');
            drawerContent.style.removeProperty('transform');
          }
        };

        const closeNativeMenu = () => {
          removeBodyClassesIfPresent(
            'menu-opened',
            'veloura-bottom-nav-categories-open'
          );

          try {
            drawer.close();
          } catch (_) {
            drawerRoot?.classList.remove('mm-ocd--open');
          }

          drawerRoot?.classList.remove('mm-ocd--open');
          releaseForcedState();
          suppressBottomNav(false);

          // Do not keep a dead scroll lock when no mmenu drawer is open.
          if (!document.querySelector('.mm-ocd.mm-ocd--open')) {
            removeBodyClassesIfPresent('mm-ocd-opened');
          }

          document.dispatchEvent(new CustomEvent('veloura:mobile-menu:closed'));
          return false;
        };

        const openNativeMenu = () => {
          if (!isMenuAllowedAtCurrentWidth()) {
            closeNativeMenu();
            return false;
          }

          closeOtherOffcanvas();
          clearBottomOverlayState();
          document.dispatchEvent(new CustomEvent('veloura:mobile-menu:opening'));

          document.body.classList.add(
            'menu-opened',
            'veloura-bottom-nav-categories-open'
          );
          suppressBottomNav(true);

          try {
            drawer.open();
          } catch (_) {
            // The visual/state guard below can still recover the generated
            // wrapper; if there is no wrapper, roll everything back.
          }

          forceOpenState();

          return true;
        };

        const toggleNativeMenu = () => {
          if (isNativeMenuOpen()) {
            return closeNativeMenu();
          }
          return openNativeMenu();
        };

        window.__velouraOpenNativeMobileMenu = openNativeMenu;
        window.__velouraCloseNativeMobileMenu = closeNativeMenu;
        window.__velouraToggleNativeMobileMenu = toggleNativeMenu;

        if (!window.__velouraNativeMobileMenuEventsBound) {
          window.__velouraNativeMobileMenuEventsBound = true;

          // Header trigger only. The bottom navigation uses its own BUTTON and
          // calls the same toggle API, so one physical tap can never hit two
          // #mobile-menu anchor listeners.
          this.onClick("a[href='#mobile-menu']:not([data-vbn-key='categories'])", event => {
            event.preventDefault();
            toggleNativeMenu();
          });

          menu.querySelectorAll('.close-mobile-menu').forEach(button => {
            button.addEventListener('click', event => {
              event.preventDefault();
              closeNativeMenu();
            });
          });

          drawerBackdrop?.addEventListener('click', event => {
            event.preventDefault();
            closeNativeMenu();
          });

          const mobileGuard = window.matchMedia('(max-width: 1023.98px)');
          const syncResponsiveMenu = () => {
            if (!isMenuAllowedAtCurrentWidth()) closeNativeMenu();
          };

          if (typeof mobileGuard.addEventListener === 'function') {
            mobileGuard.addEventListener('change', syncResponsiveMenu);
          } else if (typeof mobileGuard.addListener === 'function') {
            mobileGuard.addListener(syncResponsiveMenu);
          }

          window.addEventListener('orientationchange', () => {
            window.setTimeout(() => {
              if (!isMenuAllowedAtCurrentWidth()) closeNativeMenu();
            }, 50);
          }, { passive: true });

          window.addEventListener('pageshow', () => {
            if (!isMenuAllowedAtCurrentWidth()) closeNativeMenu();
          });
        }

        return drawer;
      });

    return window.__velouraNativeMobileMenuInitPromise;
  }

  initiateStickyMenu() {
    const stack = this.element('[data-veloura-header-tabs-stack]');
    const storeHeader = this.element('.store-header');
    const nav = this.element('#mainnav');
    const inner = this.element('#mainnav .inner');
    const tabs = this.element('[data-veloura-home-tabs]');

    if (!stack || !storeHeader || !nav || !inner || stack.dataset.velouraStackV14Ready === 'true') {
      return;
    }

    stack.dataset.velouraStackV14Ready = 'true';
    document.documentElement.classList.add('veloura-header-stack-v14-loaded');

    const toBoolean = (value, fallback = false) => {
      if (value === undefined || value === null || value === '') return fallback;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      return ['true', '1', 'on', 'yes'].includes(String(value).trim().toLowerCase());
    };

    const config = window.velouraHeaderConfig || {};
    const stickyEnabled = toBoolean(
      stack.dataset.velouraSticky,
      toBoolean(config.sticky, toBoolean(window.header_is_sticky, true))
    );
    const floatingEnabled = toBoolean(config.floating, storeHeader.dataset.velouraFloating === 'true');
    // V12: compact is independent from floating and starts on the first scroll pixel.
    const compactEnabled = toBoolean(config.compact, storeHeader.dataset.velouraCompact === 'true');
    const blurEnabled = toBoolean(config.blur, storeHeader.dataset.velouraBlur === 'true');
    const hideHeaderOnScroll = toBoolean(
      stack.dataset.velouraHideHeader,
      toBoolean(config.hideOnScroll, false)
    );
    const hideTabsOnScroll = Boolean(tabs) && toBoolean(
      stack.dataset.velouraHideTabs,
      toBoolean(tabs?.dataset.velouraTabsHideScroll, false)
    );

    stack.classList.toggle('veloura-header-tabs-stack--sticky', stickyEnabled);
    stack.classList.toggle('veloura-header-tabs-stack--floating', floatingEnabled);
    stack.classList.toggle('veloura-header-tabs-stack--blur', blurEnabled);
    stack.classList.toggle('veloura-header-tabs-stack--compact-enabled', compactEnabled);
    stack.classList.toggle('veloura-header-tabs-stack--compact-disabled', !compactEnabled);
    stack.dataset.velouraSticky = stickyEnabled ? 'true' : 'false';
    stack.dataset.velouraHideHeader = hideHeaderOnScroll ? 'true' : 'false';
    stack.dataset.velouraHideTabs = hideTabsOnScroll ? 'true' : 'false';
    stack.dataset.velouraCompact = compactEnabled ? 'true' : 'false';

    storeHeader.classList.toggle('veloura-top-floating', floatingEnabled);
    storeHeader.classList.toggle('veloura-top-compact-on-scroll', compactEnabled);
    storeHeader.classList.toggle('veloura-top-blur', blurEnabled);
    storeHeader.classList.toggle('veloura-hide-top-on-scroll', hideHeaderOnScroll);
    storeHeader.dataset.velouraStickyEnabled = stickyEnabled ? 'true' : 'false';
    storeHeader.dataset.velouraHideScroll = hideHeaderOnScroll ? 'true' : 'false';

    nav.classList.remove('fixed-pinned', 'fixed-header', 'animated', 'veloura-force-sticky');
    nav.style.removeProperty('height');
    inner.style.removeProperty('position');
    inner.style.removeProperty('top');
    inner.style.removeProperty('right');
    inner.style.removeProperty('left');
    inner.style.removeProperty('width');
    inner.style.removeProperty('transform');
    inner.style.removeProperty('opacity');
    inner.style.removeProperty('visibility');

    let triggerTop = Math.max(0, stack.offsetTop || 0);
    let lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    let frame = 0;
    let headerHidden = false;
    let tabsHidden = false;

    const dispatchState = (sticky, scrolled) => {
      const surface = stack.querySelector('.veloura-header-tabs-stack__surface') || stack;
      const rect = surface.getBoundingClientRect();
      const detail = {
        sticky,
        hidden: headerHidden,
        tabsHidden,
        scrolled,
        height: Math.max(0, Math.ceil(rect.height)),
        top: rect.top,
        bottom: rect.bottom
      };
      document.dispatchEvent(new CustomEvent('veloura:header:position', { detail }));
      document.dispatchEvent(new CustomEvent('veloura:header:state', { detail }));
    };

    const applyVisibility = () => {
      if (!hideHeaderOnScroll) {
        headerHidden = false;
        storeHeader.classList.remove('veloura-top-hidden');
        storeHeader.removeAttribute('aria-hidden');
      }

      if (!hideTabsOnScroll) {
        tabsHidden = false;
        if (tabs) {
          tabs.hidden = false;
          tabs.removeAttribute('aria-hidden');
        }
      }

      stack.classList.toggle('veloura-hide-header-now', hideHeaderOnScroll && headerHidden);
      stack.classList.toggle('veloura-hide-tabs-now', hideTabsOnScroll && tabsHidden);
    };

    const update = () => {
      frame = 0;

      const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const delta = currentY - lastScrollY;
      const stuck = stickyEnabled && currentY >= triggerTop;
      // First downward movement compacts immediately; top position stays full-size.
      const scrolled = compactEnabled && currentY > 0;

      stack.classList.toggle('veloura-stack-is-stuck', stuck);
      stack.classList.toggle('veloura-stack-is-scrolled', scrolled);
      storeHeader.classList.toggle('veloura-top-scrolled', scrolled);
      storeHeader.classList.toggle('veloura-sticky-active', stuck);

      const returnedToHeaderTop = currentY <= Math.max(4, triggerTop + 2);

      if (returnedToHeaderTop) {
        headerHidden = false;
        tabsHidden = false;
      } else if (delta > 4) {
        if (hideHeaderOnScroll) headerHidden = true;
        if (hideTabsOnScroll) tabsHidden = true;
      }

      applyVisibility();
      lastScrollY = currentY;
      dispatchState(stuck, scrolled);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const remeasure = () => {
      triggerTop = Math.max(0, stack.offsetTop || 0);
      schedule();
    };

    let resizeFrame = 0;
    let resizeTimer = 0;
    let lastViewportWidth = Math.round(window.innerWidth || 0);

    const handleViewportResize = () => {
      const nextViewportWidth = Math.round(window.innerWidth || 0);
      document.documentElement.classList.add('veloura-viewport-resizing');

      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;

        if (Math.abs(nextViewportWidth - lastViewportWidth) > 1) {
          lastViewportWidth = nextViewportWidth;
          remeasure();
        } else {
          schedule();
        }
      });

      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        document.documentElement.classList.remove('veloura-viewport-resizing');
      }, 160);
    };

    window.addEventListener('load', () => window.setTimeout(remeasure, 100), { once: true });
    window.addEventListener('resize', handleViewportResize, { passive: true });
    window.addEventListener('orientationchange', handleViewportResize, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure).catch(() => {});
    }

    applyVisibility();
    update();
  }

  setHeaderHeight() {
    const inner = this.element('#mainnav .inner');
    const nav = this.element('#mainnav');
    if (!inner || !nav) return;

    nav.style.height = `${Math.max(1, Math.ceil(inner.getBoundingClientRect().height))}px`;
  }

  initiateDropdowns() {
    this.onClick('.dropdown__trigger', ({ target: btn }) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({ target: element }) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          removeBodyClassesIfPresent('dropdown--is-opened');
        }
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        if (!content) return;

        const state = { isOpen: false }

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen;
          this.toggleElementClassIf([content, trigger], 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const { isOpen } = state;
          toggleState(isOpen);
        });
      });
  }

  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }
}

salla.onReady(() => (new App).loadTheApp());

document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.veloura-counter');

  const animateCounter = (element) => {
    if (element.dataset.animated) return;

    element.dataset.animated = 'true';

    const originalText = element.textContent.trim();
    const match = originalText.match(/(\d+)/);

    if (!match) return;

    const target = parseInt(match[1], 10);
    const prefix = originalText.slice(0, match.index);
    const suffix = originalText.slice(match.index + match[1].length);

    const duration = 4000;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * target);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = originalText;
      }
    };

    requestAnimationFrame(update);
  };

  counters.forEach((counter) => {
    const startOnView = counter.dataset.startOnView === 'true';

    if (!startOnView) {
      animateCounter(counter);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    observer.observe(counter);
  });
});

document.addEventListener('click', function (e) {
  const button = e.target.closest('.veloura-faq__question');
  if (!button) return;

  const item = button.closest('.veloura-faq__item');
  const answer = item.querySelector('.veloura-faq__answer');

  if (!item || !answer) return;

  const isOpen = item.classList.contains('is-open');

  if (isOpen) {
    answer.style.height = answer.scrollHeight + 'px';

    requestAnimationFrame(() => {
      item.classList.remove('is-open');
      answer.style.height = '0px';
    });
  } else {
    item.classList.add('is-open');
    answer.style.height = answer.scrollHeight + 'px';

    answer.addEventListener('transitionend', function handler() {
      if (item.classList.contains('is-open')) {
        answer.style.height = 'auto';
      }
      answer.removeEventListener('transitionend', handler);
    });
  }
});

function initVelouraTitleNextSection() {
  document.querySelectorAll('.veloura-title.is-title-next-section').forEach((titleBlock) => {
    let next = titleBlock.nextElementSibling;

    while (next && (!next.classList || !next.classList.contains('s-block'))) {
      next = next.nextElementSibling;
    }

    if (!next) return;

    next.classList.add('has-veloura-title-before');

    next.style.setProperty('margin-top', '1rem', 'important');
    next.style.setProperty('padding-top', '0', 'important');

    const sectionTitle = next.querySelector('.section-main-title, .s-block__title');

    if (sectionTitle) {
      sectionTitle.style.setProperty('display', 'none', 'important');
      sectionTitle.style.setProperty('margin', '0', 'important');
      sectionTitle.style.setProperty('padding', '0', 'important');
    }
  });
}

document.addEventListener('DOMContentLoaded', initVelouraTitleNextSection);
document.addEventListener('theme::ready', initVelouraTitleNextSection);
setTimeout(initVelouraTitleNextSection, 500);
setTimeout(initVelouraTitleNextSection, 1500);

/* ================================
   Veloura Dark Mode Controller V69
================================ */

(function initVelouraDarkModeController() {
  if (window.__velouraDarkModeControllerReady) return;
  window.__velouraDarkModeControllerReady = true;

  const root = document.documentElement;
  const config = Object.assign(
    {
      enabled: false,
      mode: 'light',
      toggleEnabled: true,
      storageKey: 'veloura_dark_mode'
    },
    window.velouraDarkConfig || {}
  );

  const systemQuery = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  let savedPreference = readPreference();
  let lastApplied = null;

  function readPreference() {
    if (!config.toggleEnabled) return null;

    try {
      const value = localStorage.getItem(config.storageKey);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function savePreference(value) {
    savedPreference = value === 'dark' || value === 'light' ? value : null;

    if (!config.toggleEnabled) return;

    try {
      if (savedPreference) {
        localStorage.setItem(config.storageKey, savedPreference);
      } else {
        localStorage.removeItem(config.storageKey);
      }
    } catch (error) {}
  }

  function resolveDarkState() {
    if (!config.enabled) return false;
    if (savedPreference) return savedPreference === 'dark';
    if (config.mode === 'auto') return Boolean(systemQuery && systemQuery.matches);
    return config.mode === 'dark';
  }

  function updateLogos(isDark) {
    document.querySelectorAll('.veloura-store-logo[data-light-logo]').forEach((logo) => {
      const lightLogo = logo.dataset.lightLogo;
      const darkLogo = logo.dataset.darkLogo;
      const nextLogo = isDark && darkLogo ? darkLogo : lightLogo;

      if (!nextLogo || logo.getAttribute('src') === nextLogo) return;

      logo.setAttribute('src', nextLogo);

      if (logo.tagName === 'VIDEO' && typeof logo.load === 'function') {
        logo.load();
        const playPromise = logo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    });
  }

  function updateButtons(isDark) {
    document.querySelectorAll('.veloura-dark-toggle').forEach((button) => {
      button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      button.setAttribute(
        'aria-label',
        isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'
      );
      button.setAttribute(
        'title',
        isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'
      );
    });

    document.querySelectorAll('.veloura-dark-toggle__icon').forEach((icon) => {
      icon.classList.remove('sicon-moon', 'sicon-sun');
      icon.classList.add(isDark ? 'sicon-sun' : 'sicon-moon');
    });
  }

  function applyTheme(isDark, reason = 'sync') {
    const body = document.body;

    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.style.colorScheme = isDark ? 'dark' : 'light';

    if (body) {
      body.classList.toggle('dark', isDark);
      body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      body.style.colorScheme = isDark ? 'dark' : 'light';
    }

    updateLogos(isDark);
    updateButtons(isDark);

    requestAnimationFrame(() => {
      root.classList.add('veloura-theme-ready');
      if (document.body) document.body.classList.add('veloura-theme-ready');
    });

    if (lastApplied !== isDark) {
      lastApplied = isDark;
      window.dispatchEvent(
        new CustomEvent('veloura:theme-changed', {
          detail: { theme: isDark ? 'dark' : 'light', reason }
        })
      );
    }
  }

  function sync(reason = 'sync') {
    applyTheme(resolveDarkState(), reason);
  }

  function setPreference(mode) {
    if (mode !== 'dark' && mode !== 'light' && mode !== 'auto') return;

    savePreference(mode === 'auto' ? null : mode);
    sync('user');
  }

  function togglePreference() {
    if (!config.enabled || !config.toggleEnabled) return;
    setPreference(resolveDarkState() ? 'light' : 'dark');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.veloura-dark-toggle');
    if (!button) return;

    event.preventDefault();
    togglePreference();
  });

  document.addEventListener('DOMContentLoaded', () => sync('dom-ready'));
  document.addEventListener('theme::ready', () => sync('theme-ready'));

  if (systemQuery) {
    const onSystemChange = () => {
      if (config.mode === 'auto' && !savedPreference) sync('system');
    };

    if (typeof systemQuery.addEventListener === 'function') {
      systemQuery.addEventListener('change', onSystemChange);
    } else if (typeof systemQuery.addListener === 'function') {
      systemQuery.addListener(onSystemChange);
    }
  }

  window.velouraDarkMode = {
    sync,
    toggle: togglePreference,
    set: setPreference,
    reset() {
      savePreference(null);
      sync('reset');
    },
    isDark: resolveDarkState,
    getPreference() {
      return savedPreference || 'auto';
    }
  };

  sync('initial');
})();

/* ================================
   Veloura Cart Total Hide Only
   تم حذف سكربت درج اللابتوب القديم لأنه يتعارض مع قائمة الجوال الأصلية
================================ */

document.addEventListener('DOMContentLoaded', () => {
  function velouraHideCartTotal() {
    document.querySelectorAll('.veloura-cart-hide-total').forEach((cart) => {
      cart.querySelectorAll('.s-cart-summary-total, .s-cart-summary-content').forEach((item) => {
        item.style.setProperty('display', 'none', 'important');
      });
    });
  }

  velouraHideCartTotal();

  const observer = new MutationObserver(() => {
    velouraHideCartTotal();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

/* ================================
   Veloura Side Categories Settings Hook V5
   يمنع صورة التخفيضات من أخذ مكان صورة الرابط المخصصة
================================ */

(function () {
  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeKey(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/[?#].*$/, '')
      .replace(/\/+$/, '');
  }

  function getSettings() {
    return window.velouraSideCategoriesSettings || {};
  }

  function findMobileMenu() {
    return document.querySelector('#mobile-menu.mm-spn');
  }

  function getMainList(menu) {
    return menu && menu.querySelector('ul.main-menu');
  }

  function normalizeCollection(collection) {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;

    if (typeof collection === 'object') {
      if (Array.isArray(collection.value)) return collection.value;
      if (Array.isArray(collection.selected)) return collection.selected;
      if (Array.isArray(collection.items)) return collection.items;
      if (Array.isArray(collection.data)) return collection.data;

      return Object.keys(collection).map(function (key) {
        return collection[key];
      });
    }

    return [];
  }

  function extractImageUrl(value) {
    if (!value) return '';

    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        var found = extractImageUrl(value[i]);
        if (found) return found;
      }
    }

    if (typeof value === 'object') {
      return (
        value.url ||
        value.src ||
        value.path ||
        value.image ||
        value.cdn ||
        value.value ||
        ''
      );
    }

    return '';
  }

  function allowSideImages(settings) {
    var value = String(
      settings.categoryImagesLocation ||
      settings.imageDisplayLocation ||
      'sidebar_and_page'
    );

    return (
      value === 'sidebar_and_page' ||
      value === 'sidebar_only' ||
      value === 'sidebar_and_related' ||
      value === 'side_and_category' ||
      value === 'side'
    );
  }

  function syncVisualModes(settings) {
    document.documentElement.classList.toggle(
      'veloura-side-cats-img-auto-width',
      settings.imageAutoWidth === true || settings.imageAutoWidth === 'true'
    );

    document.documentElement.classList.toggle(
      'veloura-side-cats-glass',
      settings.glass === true || settings.glass === 'true'
    );

    document.documentElement.classList.toggle(
      'veloura-side-cats-compact',
      settings.compact === true || settings.compact === 'true'
    );
  }

  function createImage(src, extraClass) {
    if (!src) return null;

    var img = document.createElement('img');
    img.className = 'veloura-side-menu-img ' + (extraClass || '');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';

    return img;
  }

  function removeExistingImages(link) {
    link.querySelectorAll('img').forEach(function (img) {
      img.remove();
    });
  }

  function setImageOnLink(link, src, type) {
    if (!link || !src) return;

    removeExistingImages(link);

    var img = createImage(src, type === 'custom-link' ? 'veloura-side-menu-img-custom-link' : 'veloura-side-menu-img-custom');

    if (!img) return;

    link.insertBefore(img, link.firstChild);

    if (type === 'custom-link') {
      link.dataset.velouraOwnImage = '1';
    }

    if (type === 'mapped') {
      link.dataset.velouraMappedImage = '1';
    }

    if (type === 'special') {
      link.dataset.velouraSpecialImage = '1';
    }
  }

  function markNativeCategoryImages(menu) {
    menu.querySelectorAll('li > a > img, li > span > img').forEach(function (img) {
      img.classList.add('veloura-side-menu-img', 'veloura-side-menu-img-native');
    });
  }

  function getItemImage(item) {
    if (!item || typeof item !== 'object') return '';

    return extractImageUrl(
      item.veloura_map_image ||
      item.image ||
      item.img ||
      item.photo ||
      item.url ||
      ''
    );
  }

  function collectPrimitiveTokens(value, tokens) {
    tokens = tokens || [];

    function add(v) {
      var key = normalizeKey(v);
      if (key && tokens.indexOf(key) === -1) {
        tokens.push(key);
      }
    }

    if (value === null || value === undefined) return tokens;

    if (typeof value === 'string' || typeof value === 'number') {
      add(value);
      return tokens;
    }

    if (Array.isArray(value)) {
      value.forEach(function (item) {
        collectPrimitiveTokens(item, tokens);
      });
      return tokens;
    }

    if (typeof value === 'object') {
      [
        'label',
        'name',
        'title',
        'value',
        'id',
        'key',
        'url',
        'link',
        'slug',
        'selected',
        'items',
        'data'
      ].forEach(function (prop) {
        if (value[prop] !== undefined) {
          collectPrimitiveTokens(value[prop], tokens);
        }
      });
    }

    return tokens;
  }

  function getItemCategoryTokens(item) {
    if (!item || typeof item !== 'object') return [];

    var categories =
      item.veloura_map_categories ||
      item.veloura_badge_categories ||
      item.categories ||
      item.category ||
      item.selected ||
      item.value ||
      [];

    return collectPrimitiveTokens(categories, []);
  }

  function getLinkTokens(link) {
    var li = link.closest('li');
    var tokens = [];

    function add(value) {
      var key = normalizeKey(value);
      if (key && tokens.indexOf(key) === -1) {
        tokens.push(key);
      }
    }

    add(link.textContent);
    add(link.getAttribute('href'));
    add(link.href);

    if (li) {
      add(li.id);
      add(li.getAttribute('id'));
      add(li.getAttribute('data-id'));
      add(li.getAttribute('data-category-id'));
      add(li.getAttribute('data-slug'));
      add(li.getAttribute('data-url'));
      add(li.getAttribute('data-menu-item'));
    }

    return tokens;
  }

  function isSameCategory(link, categoryTokens) {
    var linkTokens = getLinkTokens(link);

    return categoryTokens.some(function (categoryToken) {
      return linkTokens.some(function (linkToken) {
        if (!categoryToken || !linkToken) return false;
        if (linkToken === categoryToken) return true;

        if (linkToken.length >= 2 && categoryToken.length >= 2) {
          return (
            linkToken.indexOf(categoryToken) !== -1 ||
            categoryToken.indexOf(linkToken) !== -1
          );
        }

        return false;
      });
    });
  }

  function applyMappedCategoryImages(menu, settings) {
    var map = normalizeCollection(settings.categoryImagesMap);

    if (!map.length || !allowSideImages(settings)) return;

    var links = menu.querySelectorAll('li > a, li > span');

    map.forEach(function (item) {
      var image = getItemImage(item);
      var categoryTokens = getItemCategoryTokens(item);

      if (!image || !categoryTokens.length) return;

      links.forEach(function (link) {
        if (isSameCategory(link, categoryTokens)) {
          setImageOnLink(link, image, 'mapped');
        }
      });
    });
  }

  function enhanceSpecialImages(menu, settings) {
    if (!allowSideImages(settings)) return;

    menu.querySelectorAll('li > a, li > span').forEach(function (link) {
      if (link.dataset.velouraOwnImage === '1') return;
      if (link.dataset.velouraMappedImage === '1') return;

      var text = normalizeText(link.textContent);

      if (
        settings.discountImage &&
        /تخفيض|تخفيضات|خصم|خصومات|عروض|العروض|عرض|offer|offers|discount|sale/i.test(text)
      ) {
        setImageOnLink(link, settings.discountImage, 'special');
      }

      if (
        settings.blogImage &&
        /مدونة|المدونة|blog/i.test(text)
      ) {
        setImageOnLink(link, settings.blogImage, 'special');
      }
    });
  }


  function applyCategoryBadges(menu, settings) {
  if (!menu) return;

  menu.querySelectorAll('.veloura-side-category-badge')
    .forEach(function (badge) {
      badge.remove();
    });
}

  function appendCustomLinks(menu, settings) {
    var list = getMainList(menu);
    var links = normalizeCollection(settings.customLinks);

    if (!list || !links.length || list.dataset.velouraCustomLinksReady === '1') {
      return;
    }

    links.forEach(function (item, index) {
      if (!item) return;

      var label = normalizeText(item.label || item.title || item.name);
      var url = normalizeText(item.url || item.link);
      var image = extractImageUrl(item.image || item.img || item.photo || item.veloura_link_image);

      if (!label || !url) return;

      var li = document.createElement('li');
      li.className = 'veloura-side-custom-link';
      li.setAttribute('data-veloura-custom-link-index', String(index));

      var a = document.createElement('a');
      a.href = url;
      a.textContent = label;

      if (item.new_tab === true || item.new_tab === 'true') {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      li.appendChild(a);
      list.appendChild(li);

      if (image && allowSideImages(settings)) {
        setImageOnLink(a, image, 'custom-link');
      }
    });

    list.dataset.velouraCustomLinksReady = '1';
  }

  // V128 stability guard: old builds referenced hideMatchingLinks without
  // defining it. Keep the hook total/no-throw; the current Twilight source does
  // not expose those legacy hide toggles, so no DOM removal is performed here.
  function hideMatchingLinks(menu, settings) {
    if (!menu || !settings) return;
  }

  function applySideCategoriesSettings() {
    var menu = findMobileMenu();
    var settings = getSettings();

    syncVisualModes(settings);

    if (!menu) return;

    markNativeCategoryImages(menu);

    applyMappedCategoryImages(menu, settings);
    appendCustomLinks(menu, settings);
    enhanceSpecialImages(menu, settings);
    applyCategoryBadges(menu, settings);
    hideMatchingLinks(menu, settings);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applySideCategoriesSettings();
    setTimeout(applySideCategoriesSettings, 300);
    setTimeout(applySideCategoriesSettings, 900);
    setTimeout(applySideCategoriesSettings, 1800);
  });

  document.addEventListener('theme::ready', function () {
    applySideCategoriesSettings();
    setTimeout(applySideCategoriesSettings, 500);
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest("a[href='#mobile-menu']")) {
      setTimeout(applySideCategoriesSettings, 120);
      setTimeout(applySideCategoriesSettings, 500);
      setTimeout(applySideCategoriesSettings, 1200);
    }
  }, true);
})();

/* ================================
   Veloura Product Card Native Actions Safe Sync
   لا ينقل أزرار المفضلة والعرض السريع - فقط يضيف كلاسات للتحكم بالشكل
================================ */
(function () {
  function markCleanParents(el) {
    if (!el) return;

    var p = el.parentElement;
    var rounds = 0;

    while (p && rounds < 2) {
      if (
        !p.classList.contains('s-product-card-image') &&
        !p.classList.contains('s-product-card-entry')
      ) {
        p.classList.add('veloura-pc-action-parent-clean');
      }

      p = p.parentElement;
      rounds++;
    }
  }

  function pickRoot(el) {
    if (!el) return null;

    return (
      el.closest('.s-product-card-wishlist-btn') ||
      el.closest('.veloura-quick-view-btn') ||
      el.closest('.veloura-quick-view-button') ||
      el.closest('button') ||
      el.closest('a') ||
      el.closest('salla-button') ||
      el.closest('.s-button-element') ||
      el
    );
  }

  function markCard(card) {
    if (!card) return;

    var imageBox =
      card.querySelector('.s-product-card-image') ||
      card.querySelector('.veloura-quick-view-image-host') ||
      card;

    var wishlistRaw =
      card.querySelector('.s-product-card-wishlist-btn') ||
      card.querySelector('[class*="wishlist"]') ||
      card.querySelector('[class*="favorite"]') ||
      card.querySelector('[aria-label*="المفضلة"]') ||
      card.querySelector('[aria-label*="الأمنيات"]') ||
      card.querySelector('[aria-label*="wishlist"]');

    var quickRaw =
      card.querySelector('.veloura-quick-view-btn') ||
      card.querySelector('.veloura-quick-view-button') ||
      card.querySelector('[data-veloura-quick-view]') ||
      card.querySelector('[class*="quick-view"]');

    var wishlist = pickRoot(wishlistRaw);
    var quick = pickRoot(quickRaw);

    if (wishlist && !wishlist.closest('salla-add-product-button')) {
      wishlist.classList.add('veloura-pc-native-wish');
      markCleanParents(wishlist);
    }

    if (quick && !quick.closest('salla-add-product-button')) {
      quick.classList.add('veloura-pc-native-quick');
      markCleanParents(quick);
    }

    var promos = card.querySelectorAll(
      '.s-product-card-image [class*="promotion"], .s-product-card-image [class*="promo"], .s-product-card-image [class*="badge"], .s-product-card-image [class*="ribbon"]'
    );

    promos.forEach(function (promo) {
      promo.classList.add('veloura-pc-native-promo');
    });

    imageBox.classList.add('veloura-pc-image-actions-host');
  }

  function scanCards() {
    document.querySelectorAll('product-card, .s-product-card-entry').forEach(function (node) {
      var card = node.classList && node.classList.contains('s-product-card-entry')
        ? node
        : node.querySelector && node.querySelector('.s-product-card-entry');

      markCard(card || node);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    scanCards();
    setTimeout(scanCards, 300);
    setTimeout(scanCards, 900);
    setTimeout(scanCards, 1800);

    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(scanCards, 140);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(function () {
      observer.disconnect();
    }, 10000);
  });

  document.addEventListener('theme::ready', function () {
    scanCards();
    setTimeout(scanCards, 500);
  });
})();

/* ================================
   Veloura Quick View Full Product Modal
   نافذة عرض سريع كاملة: سعر، خصم، كمية، سلة، مفضلة، مشاركة، وصف منسق
================================ */
(function () {
  var state = {
    product: null,
    sourceCard: null,
    qty: 1,
    busy: false
  };

  function config() {
    return window.velouraQuickView || {};
  }

  function setting(name, fallback) {
    var value = config()[name];
    if (value === undefined || value === null || value === '') return fallback;
    if (value === 'false') return false;
    if (value === 'true') return true;
    return value;
  }

  function decodeHtml(value) {
    var text = String(value || '');

    if (!/[&<>]/.test(text)) {
      return text;
    }

    var textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value || text;
  }

  function stripHtmlText(value) {
    var text = String(value || '');

    // Salla currency icon sometimes arrives as text, encoded HTML, or real HTML.
    text = text
      .replace(/&lt;\s*i[^&]*sicon-sar[^&]*&gt;\s*&lt;\s*\/\s*i\s*&gt;/gi, ' ر.س ')
      .replace(/<\s*i[^>]*sicon-sar[^>]*>\s*<\s*\/\s*i\s*>/gi, ' ر.س ')
      .replace(/&lt;[^&]*&gt;/g, ' ')
      .replace(/<[^>]*>/g, ' ');

    return text;
  }

  function cleanText(value) {
    var text = decodeHtml(value);
    text = stripHtmlText(text);

    return String(text || '')
      .replace(/sicon-sar/gi, ' ر.س ')
      .replace(/SAR/gi, ' ر.س ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function firstValue() {
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  function readMoneyValue(value) {
    if (value === undefined || value === null || value === '') return '';

    if (typeof value === 'object') {
      return firstValue(
        value.amount,
        value.value,
        value.price,
        value.formatted,
        value.currency_amount,
        ''
      );
    }

    return value;
  }

  function formatMoney(value) {
    value = readMoneyValue(value);

    if (value === undefined || value === null || value === '') return '';

    if (typeof value === 'string' && /[ر$€£]|SAR|USD|AED/i.test(value)) {
      return cleanText(value);
    }

    var numeric = Number(String(value).replace(/[^0-9.]/g, ''));

    if (!Number.isNaN(numeric) && numeric > 0 && window.salla && salla.money) {
      try {
        return salla.money(numeric);
      } catch (error) {}
    }

    return cleanText(value);
  }

  function extractIdFromText(value) {
    value = String(value || '');
    var match = value.match(/(?:product-|product_id=|products\/|p)(\d{2,})/i);
    return match ? match[1] : '';
  }

  function getProductId(card, button) {
    var candidates = [
      button && button.dataset && button.dataset.productId,
      button && button.dataset && button.dataset.id,
      card && card.dataset && card.dataset.productId,
      card && card.dataset && card.dataset.id,
      card && card.getAttribute && card.getAttribute('product-id'),
      card && card.getAttribute && card.getAttribute('data-product-id'),
      card && card.id,
      card && card.querySelector && card.querySelector('[data-product-id]') && card.querySelector('[data-product-id]').dataset.productId,
      card && card.querySelector && card.querySelector('salla-add-product-button') && card.querySelector('salla-add-product-button').getAttribute('product-id'),
      card && card.querySelector && card.querySelector('salla-add-product-button') && card.querySelector('salla-add-product-button').getAttribute('product-id')
    ];

    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i]) {
        var direct = String(candidates[i]).replace(/[^0-9]/g, '');
        if (direct) return direct;
      }
    }

    var link = getProductUrl(card);
    return extractIdFromText(link);
  }

  function getProductUrl(card) {
    if (!card) return '#';

    var selectors = [
      'a.s-product-card-image',
      '.s-product-card-content-title a',
      '.s-product-card-content-main a',
      'a[href*="/products/"]',
      'a[href*="/product/"]',
      'a[href]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var link = card.querySelector(selectors[i]);
      if (link && link.href && link.getAttribute('href') !== '#') return link.href;
    }

    return '#';
  }

  function getImage(card) {
    if (!card) return '';

    var img = card.querySelector('.s-product-card-image img') || card.querySelector('img');

    if (!img) return '';

    return (
      img.currentSrc ||
      img.src ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-lazy-src') ||
      ''
    );
  }

  function getTitle(card) {
    if (!card) return '';

    var selectors = [
      '.s-product-card-content-title',
      '.s-product-card-title',
      '[class*="product-card"][class*="title"]',
      'h3',
      'h2',
      'a[title]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = card.querySelector(selectors[i]);
      if (!el) continue;
      var text = cleanText(el.getAttribute('title') || el.textContent);
      if (text) return text;
    }

    return 'المنتج';
  }

  function getCardDescription(card) {
    if (!card) return '';

    var selectors = [
      '.s-product-card-content-subtitle',
      '.s-product-card-content-description',
      '.s-product-card-description',
      '[class*="description"]',
      '[class*="subtitle"]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = card.querySelector(selectors[i]);
      if (!el) continue;
      var text = cleanText(el.textContent);
      if (text) return text;
    }

    return '';
  }

  function cleanPriceString(value) {
    var text = cleanText(value);

    text = text
      .replace(/<\/?[^>]+>/g, ' ')
      .replace(/&lt;\/?[^&]+&gt;/g, ' ')
      .replace(/class\s*=\s*['"]?sicon-sar['"]?/gi, ' ')
      .replace(/sicon-sar/gi, ' ر.س ')
      .replace(/SAR/gi, ' ر.س ')
      .replace(/\bi\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Fix duplicated currency words if any.
    text = text.replace(/(ر\.س\s*){2,}/g, 'ر.س ');

    return text;
  }

  function getCardPrice(card) {
    if (!card) return { price: '', regularPrice: '' };

    var priceText = '';
    var regularText = '';

    var oldEl =
      card.querySelector('del') ||
      card.querySelector('.s-product-card-price-old') ||
      card.querySelector('[class*="old-price"]') ||
      card.querySelector('[class*="regular-price"]');

    if (oldEl) regularText = cleanText(oldEl.textContent);

    var priceSelectors = [
      '.s-product-card-price',
      '.s-product-card-sale-price',
      '[class*="price"]'
    ];

    for (var i = 0; i < priceSelectors.length; i++) {
      var el = card.querySelector(priceSelectors[i]);
      if (!el) continue;
      var text = cleanText(el.textContent);
      if (text && text !== regularText) {
        priceText = text;
        break;
      }
    }

    priceText = cleanPriceString(priceText);
    regularText = cleanPriceString(regularText);

    return {
      price: priceText,
      regularPrice: regularText
    };
  }

  function readProductObject(response) {
    if (!response) return null;

    if (response.data && response.data.product) return response.data.product;
    if (response.data) return response.data;
    if (response.product) return response.product;

    return response;
  }

  function normalizeProductResponse(response) {
    var product = readProductObject(response);
    if (!product || typeof product !== 'object') return null;

    var image = '';
    if (product.image) {
      image = typeof product.image === 'string'
        ? product.image
        : firstValue(product.image.url, product.image.src, product.image.path);
    }

    if (!image && product.images && product.images.length) {
      var firstImage = product.images[0];
      image = typeof firstImage === 'string'
        ? firstImage
        : firstValue(firstImage.url, firstImage.src, firstImage.path);
    }

    var price = firstValue(
      readMoneyValue(product.sale_price),
      readMoneyValue(product.price),
      readMoneyValue(product.price_amount),
      readMoneyValue(product.price_after_discount)
    );

    var regularPrice = firstValue(
      readMoneyValue(product.regular_price),
      readMoneyValue(product.original_price),
      readMoneyValue(product.before_price),
      readMoneyValue(product.price_before),
      readMoneyValue(product.old_price)
    );

    return {
      id: firstValue(product.id, product.product_id, product.sku),
      name: cleanText(firstValue(product.name, product.title, product.product_name)),
      url: firstValue(product.url, product.link, product.product_url),
      image: image,
      price: formatMoney(price),
      regularPrice: formatMoney(regularPrice),
      sku: firstValue(product.sku, product.code, ''),
      description: cleanText(firstValue(product.description, product.short_description, product.subtitle, '')),
      raw: product
    };
  }

  async function fetchProductDetails(productId) {
    if (!productId || !window.salla || !salla.product || !salla.product.getDetails) return null;

    var attempts = [
      function () { return salla.product.getDetails(productId); },
      function () { return salla.product.getDetails({ id: productId }); },
      function () { return salla.product.getDetails({ product_id: productId }); }
    ];

    for (var i = 0; i < attempts.length; i++) {
      try {
        var response = await attempts[i]();
        var normalized = normalizeProductResponse(response);
        if (normalized) return normalized;
      } catch (error) {}
    }

    return null;
  }

  function parseJsonLd(doc) {
    var product = null;

    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
      try {
        var parsed = JSON.parse(script.textContent || '{}');
        var items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach(function (item) {
          if (item && item['@type'] === 'Product') product = item;
          if (item && Array.isArray(item['@graph'])) {
            var found = item['@graph'].find(function (node) {
              return node && node['@type'] === 'Product';
            });
            if (found) product = found;
          }
        });
      } catch (error) {}
    });

    return product;
  }

  function getMeta(doc, selector) {
    var el = doc.querySelector(selector);
    return el ? el.getAttribute('content') : '';
  }

  async function fetchProductFromPage(url) {
    if (!url || url === '#') return null;

    try {
      var response = await fetch(url, { credentials: 'same-origin' });
      var html = await response.text();
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var jsonProduct = parseJsonLd(doc);
      var offers = jsonProduct && jsonProduct.offers;

      if (Array.isArray(offers)) offers = offers[0];

      var title =
        jsonProduct && jsonProduct.name ||
        cleanText(doc.querySelector('h1') && doc.querySelector('h1').textContent) ||
        getMeta(doc, 'meta[property="og:title"]');

      var description =
        jsonProduct && jsonProduct.description ||
        cleanText(doc.querySelector('.product__description, .s-product-description, [itemprop="description"], .content-entry') && doc.querySelector('.product__description, .s-product-description, [itemprop="description"], .content-entry').textContent) ||
        getMeta(doc, 'meta[property="og:description"]') ||
        getMeta(doc, 'meta[name="description"]');

      var image =
        jsonProduct && jsonProduct.image && (Array.isArray(jsonProduct.image) ? jsonProduct.image[0] : jsonProduct.image) ||
        getMeta(doc, 'meta[property="og:image"]') ||
        getMeta(doc, 'meta[name="twitter:image"]');

      var pageAddBtn = doc.querySelector('salla-add-product-button[product-id], [data-product-id]');
      var pageProductId = pageAddBtn && (pageAddBtn.getAttribute('product-id') || pageAddBtn.getAttribute('data-product-id'));

      var price = offers && firstValue(offers.price, offers.lowPrice);
      var regularPrice = '';

      var oldPriceEl = doc.querySelector('del, .old-price, .regular-price, [class*="old-price"], [class*="regular-price"]');
      if (oldPriceEl) regularPrice = cleanText(oldPriceEl.textContent);

      return {
        id: pageProductId || extractIdFromText(url),
        name: cleanText(title),
        url: url,
        image: image || '',
        price: formatMoney(price),
        regularPrice: cleanPriceString(regularPrice),
        description: cleanText(description)
      };
    } catch (error) {
      return null;
    }
  }

  function getCardData(button) {
    var card = button.closest('.s-product-card-entry') || button.closest('product-card');
    var cardPrice = getCardPrice(card);

    return {
      id: getProductId(card, button),
      name: getTitle(card),
      url: getProductUrl(card),
      image: getImage(card),
      price: cardPrice.price,
      regularPrice: cardPrice.regularPrice,
      description: getCardDescription(card),
      sourceCard: card
    };
  }

  function ensureStyles() {
    if (document.getElementById('veloura-qv-full-styles')) return;

    var style = document.createElement('style');
    style.id = 'veloura-qv-full-styles';
    style.textContent = `
      /* Veloura Quick View Direct CSS V11 */
      .veloura-qv-full{
        position:fixed!important;
        inset:0!important;
        z-index:2147483400!important;
        display:none;
        align-items:center!important;
        justify-content:center!important;
        padding:24px!important;
        direction:rtl!important;
      }
      .veloura-qv-full.is-open{display:flex!important}
      .veloura-qv-full__overlay{
        position:absolute!important;
        inset:0!important;
        background:rgba(15,23,42,.58)!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
      }
      .veloura-qv-full__dialog{
        position:relative!important;
        width:min(1040px,calc(100vw - 88px))!important;
        max-height:min(650px,88vh)!important;
        overflow:hidden!important;
        background:var(--veloura-quick-view-modal-bg,#fff)!important;
        color:var(--veloura-quick-view-modal-text,#111827)!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        box-shadow:0 28px 100px rgba(15,23,42,.32)!important;
        padding:0!important;
        animation:velouraQvFullZoom .22s ease both;
      }
      body.veloura-quick-view-animation-fade .veloura-qv-full__dialog{animation-name:velouraQvFullFade}
      body.veloura-quick-view-animation-slide_up .veloura-qv-full__dialog,
      body.veloura-quick-view-animation-slide-up .veloura-qv-full__dialog{animation-name:velouraQvFullSlide}

      .veloura-qv-full__close{
        position:absolute!important;
        top:16px!important;
        inset-inline-start:16px!important;
        width:46px!important;
        height:46px!important;
        border:0!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        background:rgba(255,255,255,.95)!important;
        color:#111827!important;
        font-size:24px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        cursor:pointer!important;
        z-index:7!important;
        box-shadow:0 10px 26px rgba(15,23,42,.16)!important;
      }

      .veloura-qv-full__grid{
        display:grid!important;
        direction:ltr!important;
        grid-template-columns:minmax(0,62%) minmax(280px,38%)!important;
        grid-template-areas:"content media"!important;
        min-height:560px!important;
        max-height:min(650px,88vh)!important;
        width:100%!important;
      }

      .veloura-qv-full__media{
        grid-area:media!important;
        position:relative!important;
        overflow:hidden!important;
        background:rgba(15,23,42,.045)!important;
        min-height:560px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
      }
      .veloura-qv-full__image{
        width:100%!important;
        height:100%!important;
        min-height:560px!important;
        object-fit:var(--veloura-quick-view-image-fit,contain)!important;
        object-position:center!important;
        display:block!important;
      }

      .veloura-qv-full__content{
        grid-area:content!important;
        direction:rtl!important;
        padding:34px 32px 26px!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        min-width:0!important;
        overflow:hidden!important;
        width:100%!important;
        box-sizing:border-box!important;
      }

      .veloura-qv-full__top{
        position:relative!important;
        min-height:58px!important;
        display:block!important;
        margin-bottom:4px!important;
        direction:rtl!important;
        width:100%!important;
      }
      .veloura-qv-full__top>div:first-child{
        width:100%!important;
        padding-left:122px!important;
        padding-right:0!important;
        box-sizing:border-box!important;
        text-align:right!important;
        direction:rtl!important;
      }
      .veloura-qv-full__actions{
        position:absolute!important;
        top:0!important;
        left:0!important;
        right:auto!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        z-index:2!important;
      }
      .veloura-qv-full__circle{
        width:48px!important;
        height:48px!important;
        border:0!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        cursor:pointer!important;
        font-size:18px!important;
        box-shadow:0 12px 28px rgba(15,23,42,.14)!important;
      }
      .veloura-qv-full__loading{font-size:12px!important;opacity:.65!important;display:none}
      .veloura-qv-full.is-loading .veloura-qv-full__loading{display:inline-flex!important}

      .veloura-qv-full__title{
        margin:0!important;
        font-size:31px!important;
        font-weight:900!important;
        line-height:1.3!important;
        color:inherit!important;
        text-align:right!important;
      }
      .veloura-qv-full__sku{display:none!important}

      .veloura-qv-full__price-row,
      .veloura-qv-full__mini-price{
        display:flex!important;
        align-items:baseline!important;
        gap:10px!important;
        flex-wrap:wrap!important;
        justify-content:flex-start!important;
        direction:rtl!important;
        min-height:32px!important;
      }
      .veloura-qv-full__price,
      .veloura-qv-full__mini-current{
        font-size:27px!important;
        font-weight:900!important;
        color:#ef4444!important;
      }
      .veloura-qv-full__regular,
      .veloura-qv-full__mini-regular{
        font-size:16px!important;
        opacity:.65!important;
        text-decoration:line-through!important;
      }

      .veloura-qv-full__divider{
        height:1px!important;
        background:currentColor!important;
        opacity:.16!important;
        margin:1px 0!important;
      }
      .veloura-qv-full__divider--bottom{margin-top:10px!important}

      .veloura-qv-full__desc{
        margin:0!important;
        font-size:15px!important;
        line-height:1.75!important;
        opacity:.88!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
        max-height:86px!important;
        overflow:auto!important;
        padding-inline-end:2px!important;
        text-align:right!important;
      }

      .veloura-qv-full__read-more{
        align-self:flex-start!important;
        height:38px!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        border:1px solid rgba(148,163,184,.42)!important;
        padding:0 18px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        color:inherit!important;
        font-weight:900!important;
        text-decoration:none!important;
        font-size:13px!important;
        opacity:.96!important;
        background:rgba(255,255,255,.04)!important;
        margin-top:0!important;
      }

      .veloura-qv-full__bottom{
        margin-top:auto!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        padding-top:6px!important;
      }

      .veloura-qv-full__row{
        display:grid!important;
        grid-template-columns:minmax(160px,max-content) 1fr!important;
        align-items:center!important;
        gap:14px!important;
        direction:ltr!important;
      }

      .veloura-qv-full__label{
        display:block!important;
        font-size:15px!important;
        font-weight:900!important;
        margin:0!important;
        opacity:.92!important;
        text-align:right!important;
        justify-self:end!important;
        direction:rtl!important;
      }

      .veloura-qv-full__qty{
        display:grid!important;
        grid-template-columns:50px 66px 50px!important;
        height:46px!important;
        border:1px solid rgba(148,163,184,.58)!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        overflow:hidden!important;
        width:max-content!important;
        max-width:100%!important;
      }
      .veloura-qv-full__qty button{
        border:0!important;
        background:transparent!important;
        color:inherit!important;
        font-size:24px!important;
        font-weight:800!important;
        cursor:pointer!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
      }
      .veloura-qv-full__qty input{
        border:0!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        text-align:center!important;
        font-size:18px!important;
        font-weight:900!important;
        width:100%!important;
      }

      .veloura-qv-full__add{
        height:50px!important;
        border:0!important;
        border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        background:var(--veloura-quick-view-button-bg,#004d65)!important;
        color:var(--veloura-quick-view-button-text,#fff)!important;
        font-weight:900!important;
        font-size:15px!important;
        cursor:pointer!important;
        width:100%!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
        box-shadow:0 12px 30px rgba(0,77,101,.18)!important;
      }
      .veloura-qv-full__add.is-busy{opacity:.68!important;pointer-events:none!important}

      .veloura-qv-full__link{display:none!important}
      .veloura-qv-full__hidden{display:none!important}

      @media(max-width:767px){
        .veloura-qv-full{
          padding:18px 24px!important;
          align-items:flex-start!important;
          justify-content:center!important;
          overflow-y:auto!important;
        }
        .veloura-qv-full__dialog{
          width:100%!important;
          max-width:430px!important;
          max-height:86vh!important;
          overflow:auto!important;
          border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
          margin:0 auto!important;
        }
        .veloura-qv-full__grid{
          display:grid!important;
          direction:ltr!important;
          grid-template-columns:1fr!important;
          grid-template-areas:"media" "content"!important;
          min-height:0!important;
          max-height:none!important;
          width:100%!important;
        }
        .veloura-qv-full__media{
          grid-area:media!important;
          width:100%!important;
          min-height:285px!important;
          height:315px!important;
          max-height:315px!important;
          overflow:hidden!important;
          border-radius:var(--veloura-quick-view-modal-radius,26px) var(--veloura-quick-view-modal-radius,26px) 0 0!important;
        }
        .veloura-qv-full__image{
          min-height:0!important;
          height:100%!important;
          max-height:none!important;
          width:100%!important;
          object-fit:var(--veloura-quick-view-image-fit,contain)!important;
          object-position:center!important;
        }
        .veloura-qv-full__close{
          top:14px!important;
          inset-inline-start:14px!important;
          width:42px!important;
          height:42px!important;
          font-size:22px!important;
        }
        .veloura-qv-full__content{
          grid-area:content!important;
          direction:rtl!important;
          padding:15px 18px 17px!important;
          overflow:visible!important;
          gap:8px!important;
          width:100%!important;
        }
        .veloura-qv-full__top{
          min-height:44px!important;
          margin-bottom:1px!important;
        }
        .veloura-qv-full__top>div:first-child{
          width:100%!important;
          padding-left:98px!important;
          padding-right:0!important;
          box-sizing:border-box!important;
          text-align:right!important;
        }
        .veloura-qv-full__actions{
          top:0!important;
          left:0!important;
          right:auto!important;
          gap:8px!important;
        }
        .veloura-qv-full__circle{
          width:40px!important;
          height:40px!important;
          font-size:16px!important;
        }
        .veloura-qv-full__title{
          font-size:24px!important;
          line-height:1.25!important;
        }
        .veloura-qv-full__price,
        .veloura-qv-full__mini-current{
          font-size:22px!important;
          line-height:1.2!important;
        }
        .veloura-qv-full__regular,
        .veloura-qv-full__mini-regular{font-size:14px!important}
        .veloura-qv-full__desc{
          max-height:78px!important;
          font-size:14px!important;
          line-height:1.65!important;
          overflow:hidden!important;
          scrollbar-width:none!important;
        }
        .veloura-qv-full__read-more{
          height:34px!important;
          padding:0 14px!important;
          font-size:13px!important;
        }
        .veloura-qv-full__bottom{
          margin-top:4px!important;
          padding-top:2px!important;
          gap:8px!important;
        }
        .veloura-qv-full__row{
          display:grid!important;
          grid-template-columns:minmax(130px,max-content) 1fr!important;
          align-items:center!important;
          gap:10px!important;
          direction:ltr!important;
        }
        .veloura-qv-full__label{
          order:initial!important;
          align-self:auto!important;
          justify-self:end!important;
          text-align:right!important;
          font-size:14px!important;
          margin:0!important;
          direction:rtl!important;
        }
        .veloura-qv-full__qty{
          width:150px!important;
          height:42px!important;
          grid-template-columns:40px 70px 40px!important;
          justify-self:start!important;
        }
        .veloura-qv-full__qty button{font-size:22px!important}
        .veloura-qv-full__qty input{font-size:17px!important}
        .veloura-qv-full__mini-price{
          justify-content:flex-start!important;
          justify-self:start!important;
          min-height:24px!important;
        }
        .veloura-qv-full__add{
          height:46px!important;
          font-size:14px!important;
          border-radius:var(--veloura-quick-view-modal-radius,26px)!important;
        }
        .veloura-qv-full__divider--bottom{margin-top:6px!important}
      }

      @media(max-width:420px){
        .veloura-qv-full{padding-left:20px!important;padding-right:20px!important}
        .veloura-qv-full__media{height:285px!important;max-height:285px!important;min-height:195px!important}
        .veloura-qv-full__row{grid-template-columns:minmax(112px,max-content) 1fr!important;gap:9px!important}
        .veloura-qv-full__qty{width:144px!important;grid-template-columns:38px 68px 38px!important}
      }


      /* ============================================================
         V104 — final Quick View material + automatic Light/Dark text
         ============================================================ */

      html body .veloura-qv-full .veloura-qv-full__dialog {
        background:
          var(--veloura-quick-view-modal-bg, #ffffff) !important;
        background-color:
          var(--veloura-quick-view-modal-bg, #ffffff) !important;
        background-image: none !important;
        color: var(--veloura-quick-view-modal-text-light, var(--color-text, #111827)) !important;
      }

      html body .veloura-qv-full
      :is(
        .veloura-qv-full__media,
        .veloura-qv-full__content
      ) {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }

      html body .veloura-qv-full .veloura-qv-full__dialog
      :is(
        .veloura-qv-full__title,
        .veloura-qv-full__desc,
        .veloura-qv-full__label,
        .veloura-qv-full__loading,
        .veloura-qv-full__read-more
      ) {
        color: inherit !important;
        -webkit-text-fill-color: currentColor !important;
      }

      html body.veloura-quick-view-overlay-blur
      .veloura-qv-full
      .veloura-qv-full__dialog {
        background:
          var(--veloura-quick-view-modal-bg, #ffffff) !important;
        background-color:
          var(--veloura-quick-view-modal-bg, #ffffff) !important;
        border-top:
          1px solid var(--veloura-edge-top, rgba(100,116,139,.11)) !important;
        border-bottom:
          1px solid var(--veloura-edge-bottom, rgba(100,116,139,.05)) !important;
        border-inline: 0 !important;
        -webkit-backdrop-filter:
          blur(24px) saturate(200%) !important;
        backdrop-filter:
          blur(24px) saturate(200%) !important;
      }

      @supports (
        background:
          color-mix(in srgb, white 60%, transparent)
      ) {
        html body.veloura-quick-view-overlay-blur
        .veloura-qv-full
        .veloura-qv-full__dialog {
          background:
            color-mix(
              in srgb,
              var(--veloura-quick-view-modal-bg, #ffffff) 62%,
              transparent
            ) !important;
          background-color:
            color-mix(
              in srgb,
              var(--veloura-quick-view-modal-bg, #ffffff) 62%,
              transparent
            ) !important;
        }
      }

      html.dark body
      .veloura-qv-full
      .veloura-qv-full__dialog,
      html body.dark
      .veloura-qv-full
      .veloura-qv-full__dialog {
        background:
          var(--veloura-dark-secondary-bg, #010612) !important;
        background-color:
          var(--veloura-dark-secondary-bg, #010612) !important;
        background-image: none !important;
        color:
          var(--veloura-dark-primary-text, #ffffff) !important;
      }

      html.dark body.veloura-quick-view-overlay-blur
      .veloura-qv-full
      .veloura-qv-full__dialog,
      html body.dark.veloura-quick-view-overlay-blur
      .veloura-qv-full
      .veloura-qv-full__dialog {
        background:
          var(--veloura-dark-secondary-bg, #010612) !important;
        background-color:
          var(--veloura-dark-secondary-bg, #010612) !important;
        color:
          var(--veloura-dark-primary-text, #ffffff) !important;
        border-top:
          1px solid var(--veloura-edge-top, rgba(255,255,255,.12)) !important;
        border-bottom:
          1px solid var(--veloura-edge-bottom, rgba(255,255,255,.055)) !important;
        border-inline: 0 !important;
        -webkit-backdrop-filter:
          blur(24px) saturate(200%) !important;
        backdrop-filter:
          blur(24px) saturate(200%) !important;
      }

      @supports (
        background:
          color-mix(in srgb, black 60%, transparent)
      ) {
        html.dark body.veloura-quick-view-overlay-blur
        .veloura-qv-full
        .veloura-qv-full__dialog,
        html body.dark.veloura-quick-view-overlay-blur
        .veloura-qv-full
        .veloura-qv-full__dialog {
          background:
            color-mix(
              in srgb,
              var(--veloura-dark-secondary-bg, #010612) 62%,
              transparent
            ) !important;
          background-color:
            color-mix(
              in srgb,
              var(--veloura-dark-secondary-bg, #010612) 62%,
              transparent
            ) !important;
        }
      }

      html body .veloura-qv-full .veloura-qv-full__close {
        color: var(--veloura-quick-view-modal-text-light, var(--color-text, #111827)) !important;
        background: rgba(255,255,255,.90) !important;
      }

      html.dark body .veloura-qv-full .veloura-qv-full__close,
      html body.dark .veloura-qv-full .veloura-qv-full__close {
        color:
          var(--veloura-dark-primary-text, #ffffff) !important;
        background:
          color-mix(
            in srgb,
            var(--veloura-dark-secondary-bg, #010612) 84%,
            white 8%
          ) !important;
      }

      html body .veloura-qv-full .veloura-qv-full__overlay {
        background: rgba(15,23,42,.32) !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        filter: none !important;
      }


      html body .veloura-qv-full .veloura-qv-full__dialog
      :is(
        .veloura-qv-full__title,
        .veloura-qv-full__desc,
        .veloura-qv-full__label,
        .veloura-qv-full__loading,
        .veloura-qv-full__read-more,
        .veloura-qv-full__circle,
        .veloura-qv-full__close,
        .veloura-qv-full__qty,
        .veloura-qv-full__qty button,
        .veloura-qv-full__qty input
      ) {
        color:
          var(
            --veloura-quick-view-modal-text-light,
            var(--color-text, #111827)
          ) !important;
      }

      html.dark body .veloura-qv-full .veloura-qv-full__dialog
      :is(
        .veloura-qv-full__title,
        .veloura-qv-full__desc,
        .veloura-qv-full__label,
        .veloura-qv-full__loading,
        .veloura-qv-full__read-more,
        .veloura-qv-full__circle,
        .veloura-qv-full__close,
        .veloura-qv-full__qty,
        .veloura-qv-full__qty button,
        .veloura-qv-full__qty input
      ),
      html body.dark .veloura-qv-full .veloura-qv-full__dialog
      :is(
        .veloura-qv-full__title,
        .veloura-qv-full__desc,
        .veloura-qv-full__label,
        .veloura-qv-full__loading,
        .veloura-qv-full__read-more,
        .veloura-qv-full__circle,
        .veloura-qv-full__close,
        .veloura-qv-full__qty,
        .veloura-qv-full__qty button,
        .veloura-qv-full__qty input
      ) {
        color:
          var(--veloura-dark-primary-text, #ffffff) !important;
      }


      /* V12: تكبير صورة الجوال وإخفاء سكرول الوصف */
      @media(max-width:767px){
        .veloura-qv-full__media{
          background:rgba(15,23,42,.035)!important;
        }

        .veloura-qv-full__image{
          transform:none!important;
          transform-origin:center!important;
        }

        .veloura-qv-full__desc{
          overflow:hidden!important;
          scrollbar-width:none!important;
          -ms-overflow-style:none!important;
        }

        .veloura-qv-full__desc::-webkit-scrollbar{
          display:none!important;
          width:0!important;
          height:0!important;
        }
      }

      @media(max-width:420px){
        .veloura-qv-full__image{
          transform:scale(1.14)!important;
        }
      }

      @keyframes velouraQvFullZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      @keyframes velouraQvFullFade{from{opacity:0}to{opacity:1}}
      @keyframes velouraQvFullSlide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      html.veloura-qv-full-lock{overflow:hidden!important}
    `;

    document.head.appendChild(style);
    console.info('[Veloura] Quick View Direct CSS V12 loaded');
  }

  function ensureModal() {
    ensureStyles();

    var modal = document.querySelector('.veloura-qv-full');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'veloura-qv-full';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="veloura-qv-full__overlay" data-veloura-qv-full-close></div>
      <div class="veloura-qv-full__dialog" role="dialog" aria-modal="true">
        <button type="button" class="veloura-qv-full__close" data-veloura-qv-full-close aria-label="إغلاق">×</button>
        <div class="veloura-qv-full__grid">
          <div class="veloura-qv-full__media">
            <img class="veloura-qv-full__image" src="" alt="">
          </div>
          <div class="veloura-qv-full__content">
            <div class="veloura-qv-full__top">
              <div>
                <h3 class="veloura-qv-full__title"></h3>
                <span class="veloura-qv-full__loading">جاري تحميل التفاصيل...</span>
              </div>
              <div class="veloura-qv-full__actions">
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-share aria-label="مشاركة"><i class="sicon-share"></i></button>
                <button type="button" class="veloura-qv-full__circle" data-veloura-qv-wishlist aria-label="المفضلة"><i class="sicon-heart"></i></button>
              </div>
            </div>
            <span class="veloura-qv-full__sku"></span>
            <div class="veloura-qv-full__price-row">
              <strong class="veloura-qv-full__price"></strong>
              <span class="veloura-qv-full__regular"></span>
            </div>
            <div class="veloura-qv-full__divider"></div>
            <p class="veloura-qv-full__desc"></p>
            <a class="veloura-qv-full__read-more" href="#">عرض المزيد</a>
            <div class="veloura-qv-full__bottom">
              <div class="veloura-qv-full__row veloura-qv-full__row--qty">
                <div class="veloura-qv-full__qty">
                  <button type="button" data-veloura-qv-qty-minus>−</button>
                  <input type="number" min="1" value="1" data-veloura-qv-qty>
                  <button type="button" data-veloura-qv-qty-plus>+</button>
                </div>
                <span class="veloura-qv-full__label">الكمية</span>
              </div>
              <div class="veloura-qv-full__row veloura-qv-full__row--price">
                <div class="veloura-qv-full__mini-price">
                  <strong class="veloura-qv-full__mini-current"></strong>
                  <span class="veloura-qv-full__mini-regular"></span>
                </div>
                <span class="veloura-qv-full__label">السعر</span>
              </div>
              <button type="button" class="veloura-qv-full__add" data-veloura-qv-add>
                <i class="sicon-shopping-bag"></i>
                <span>إضافة للسلة</span>
              </button>
              <div class="veloura-qv-full__divider veloura-qv-full__divider--bottom"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-veloura-qv-full-close]')) closeModal();
      if (event.target.closest('[data-veloura-qv-qty-minus]')) changeQty(-1);
      if (event.target.closest('[data-veloura-qv-qty-plus]')) changeQty(1);
      if (event.target.closest('[data-veloura-qv-add]')) addCurrentToCart();
      if (event.target.closest('[data-veloura-qv-wishlist]')) triggerWishlist();
      if (event.target.closest('[data-veloura-qv-share]')) shareCurrentProduct();
    });

    modal.addEventListener('input', function (event) {
      if (event.target.matches('[data-veloura-qv-qty]')) {
        state.qty = Math.max(1, parseInt(event.target.value || '1', 10));
        event.target.value = state.qty;
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeModal();
    });

    return modal;
  }

  function toggle(el, show) {
    if (!el) return;
    el.classList.toggle('veloura-qv-full__hidden', !show);
  }

  function render(data, loading) {
    var modal = ensureModal();
    state.product = data;

    modal.classList.toggle('is-loading', !!loading);

    var image = modal.querySelector('.veloura-qv-full__image');
    var title = modal.querySelector('.veloura-qv-full__title');
    var sku = modal.querySelector('.veloura-qv-full__sku');
    var price = modal.querySelector('.veloura-qv-full__price');
    var regular = modal.querySelector('.veloura-qv-full__regular');
    var desc = modal.querySelector('.veloura-qv-full__desc');
    var readMore = modal.querySelector('.veloura-qv-full__read-more');
    var actions = modal.querySelector('.veloura-qv-full__actions');
    var bottom = modal.querySelector('.veloura-qv-full__bottom');
    var qtyWrap = modal.querySelector('.veloura-qv-full__row--qty');
    var add = modal.querySelector('.veloura-qv-full__add');
    var miniPrice = modal.querySelector('.veloura-qv-full__row--price');
    var miniCurrent = modal.querySelector('.veloura-qv-full__mini-current');
    var miniRegular = modal.querySelector('.veloura-qv-full__mini-regular');

    title.textContent = data.name || 'المنتج';
    var cleanSku = cleanText(data.sku || '').replace(/^-+|-+$/g, '');
    sku.textContent = cleanSku ? ('SKU: ' + cleanSku) : '';
    data.price = cleanPriceString(data.price || '');
    data.regularPrice = cleanPriceString(data.regularPrice || '');

    price.textContent = data.price || '';
    regular.textContent = data.regularPrice && data.regularPrice !== data.price ? data.regularPrice : '';
    miniCurrent.textContent = data.price || '';
    miniRegular.textContent = data.regularPrice && data.regularPrice !== data.price ? data.regularPrice : '';
    desc.textContent = data.description || '';
    image.src = data.image || '';
    image.alt = data.name || '';
    readMore.href = data.url || '#';

    toggle(price.parentElement, setting('showPrice', true) && !!(data.price || data.regularPrice));
    toggle(regular, setting('showDiscount', true) && !!regular.textContent);
    toggle(desc, setting('showDescription', true) && !!data.description);
    toggle(readMore, setting('showProductLink', true));
    toggle(actions.querySelector('[data-veloura-qv-wishlist]'), setting('showWishlist', true));
    toggle(actions.querySelector('[data-veloura-qv-share]'), setting('showShare', true));
    toggle(actions, setting('showWishlist', true) || setting('showShare', true));
    toggle(bottom, setting('showAddToCart', true) || setting('showPrice', true));
    toggle(qtyWrap, setting('showAddToCart', true) && setting('showQuantity', true));
    toggle(miniPrice, setting('showPrice', true) && !!(data.price || data.regularPrice));
    toggle(add, setting('showAddToCart', true));
  }

  function openModal() {
    var modal = ensureModal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('veloura-qv-full-lock');
  }

  function closeModal() {
    var modal = document.querySelector('.veloura-qv-full');
    if (!modal) return;
    modal.classList.remove('is-open', 'is-loading');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('veloura-qv-full-lock');
    state.busy = false;
  }

  function changeQty(delta) {
    var modal = ensureModal();
    var input = modal.querySelector('[data-veloura-qv-qty]');
    state.qty = Math.max(1, (state.qty || 1) + delta);
    input.value = state.qty;
  }

  async function addCurrentToCart() {
    if (state.busy || !state.product) return;

    var product = state.product;
    var modal = ensureModal();
    var button = modal.querySelector('[data-veloura-qv-add]');
    var qty = Math.max(1, state.qty || 1);

    if (!product.id) {
      if (product.url && product.url !== '#') window.location.href = product.url;
      return;
    }

    state.busy = true;
    button.classList.add('is-busy');

    var attempts = [];

    if (window.salla && salla.cart && salla.cart.addItem) {
      attempts.push(function () { return salla.cart.addItem(product.id, qty); });
      attempts.push(function () { return salla.cart.addItem({ id: product.id, quantity: qty }); });
      attempts.push(function () { return salla.cart.addItem({ product_id: product.id, quantity: qty }); });
    }

    if (window.salla && salla.product && salla.product.addToCart) {
      attempts.push(function () { return salla.product.addToCart(product.id, qty); });
      attempts.push(function () { return salla.product.addToCart({ id: product.id, quantity: qty }); });
    }

    for (var i = 0; i < attempts.length; i++) {
      try {
        await attempts[i]();
        if (window.salla && salla.notify) {
          salla.notify.success('تمت إضافة المنتج للسلة');
        }
        state.busy = false;
        button.classList.remove('is-busy');
        return;
      } catch (error) {}
    }

    state.busy = false;
    button.classList.remove('is-busy');

    if (window.salla && salla.notify) {
      salla.notify.warning('افتح صفحة المنتج لاختيار الخيارات ثم الإضافة للسلة');
    }

    if (product.url && product.url !== '#') {
      window.location.href = product.url;
    }
  }

  function triggerWishlist() {
    if (state.sourceCard) {
      var wishlist =
        state.sourceCard.querySelector('.s-product-card-wishlist-btn') ||
        state.sourceCard.querySelector('[class*="wishlist"]') ||
        state.sourceCard.querySelector('[class*="favorite"]') ||
        state.sourceCard.querySelector('[aria-label*="المفضلة"]') ||
        state.sourceCard.querySelector('[aria-label*="wishlist"]');

      if (wishlist) {
        wishlist.click();
        return;
      }
    }

    if (window.salla && salla.notify) {
      salla.notify.info('أضف المنتج للمفضلة من صفحة المنتج');
    }
  }

  async function shareCurrentProduct() {
    if (!state.product) return;

    var data = {
      title: state.product.name || document.title,
      text: state.product.name || '',
      url: state.product.url || window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {}
    }

    try {
      await navigator.clipboard.writeText(data.url);
      if (window.salla && salla.notify) salla.notify.success('تم نسخ رابط المنتج');
    } catch (error) {
      window.prompt('انسخ رابط المنتج', data.url);
    }
  }

  async function openQuickView(button) {
    var cardData = getCardData(button);
    state.sourceCard = cardData.sourceCard;
    state.qty = 1;

    render(cardData, !!(cardData.id || cardData.url));
    openModal();

    var details = null;

    if (cardData.id) {
      details = await fetchProductDetails(cardData.id);
    }

    if (!details && cardData.url && cardData.url !== '#') {
      details = await fetchProductFromPage(cardData.url);
    }

    if (details) {
      render({
        id: firstValue(details.id, cardData.id),
        name: firstValue(details.name, cardData.name),
        url: firstValue(details.url, cardData.url),
        image: firstValue(details.image, cardData.image),
        price: firstValue(details.price, cardData.price),
        regularPrice: firstValue(details.regularPrice, cardData.regularPrice),
        sku: firstValue(details.sku, ''),
        description: firstValue(details.description, cardData.description),
        sourceCard: cardData.sourceCard
      }, false);
    } else {
      render(cardData, false);
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest(
      '.veloura-quick-view-btn, .veloura-quick-view-button, [data-veloura-quick-view], .veloura-pc-native-quick'
    );

    if (!button) return;
    if (button.closest('.veloura-qv-full')) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openQuickView(button);
  }, true);
})();

/* VELOURA HOME TABS CONTROLLER START 2026 */
const initVelouraHomeTabs = (() => {
  let frame = 0;
  let standaloneListenersBound = false;
  let lateSyncTimer = 0;

  const normalizeTabName = value => String(value || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ar');

  const syncVisualMode = bar => {
    const header = document.querySelector('.store-header');
    if (!bar || !header) return;

    const floating = header.classList.contains('veloura-top-floating');
    const blur = header.classList.contains('veloura-top-blur');

    bar.classList.toggle('veloura-home-tabs--header-floating', floating);
    bar.classList.toggle('veloura-home-tabs--header-blur', blur);

    ['sharp', 'soft', 'medium', 'large'].forEach(radius => {
      bar.classList.toggle(
        `veloura-home-tabs--radius-${radius}`,
        header.classList.contains(`veloura-top-border-${radius}`)
      );
    });
  };

  const getVisibleFixedHeaderBottom = () => {
    const header = document.querySelector('.store-header');
    const navInner = document.querySelector('#mainnav > .inner, #mainnav .inner');

    if (!header || !navInner || header.classList.contains('veloura-top-hidden')) return 0;
    if (window.getComputedStyle(navInner).position !== 'fixed') return 0;

    const rect = navInner.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return 0;

    return Math.max(0, rect.bottom);
  };

  const updateStickyOffset = bar => {
    if (!bar) return;

    syncVisualMode(bar);

    if (bar.closest('[data-veloura-header-tabs-stack]')) {
      bar.style.setProperty('--veloura-tabs-sticky-top', '0px');
      bar.classList.add('veloura-home-tabs--below-header');
      bar.classList.remove('veloura-home-tabs--first-surface');
      return;
    }

    if (!bar.classList.contains('veloura-home-tabs--sticky')) {
      bar.style.setProperty('--veloura-tabs-sticky-top', '0px');
      return;
    }

    const headerBottom = getVisibleFixedHeaderBottom();
    const floating = bar.classList.contains('veloura-home-tabs--header-floating');
    const rootStyle = window.getComputedStyle(document.documentElement);
    const gap = floating
      ? (parseFloat(rootStyle.getPropertyValue('--veloura-shell-gap-v6')) || 4)
      : 0;
    const standaloneTop = floating
      ? (parseFloat(rootStyle.getPropertyValue('--veloura-shell-top-v6')) || 10)
      : 0;
    const belowHeader = headerBottom > 0;
    const top = Math.max(0, Math.round(belowHeader ? headerBottom + gap : standaloneTop));

    bar.style.setProperty('--veloura-tabs-sticky-top', `${top}px`);
    bar.classList.toggle('veloura-home-tabs--below-header', belowHeader);
    bar.classList.toggle('veloura-home-tabs--first-surface', !belowHeader);
  };

  const scheduleOffsetUpdate = () => {
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const bar = document.querySelector('[data-veloura-home-tabs]');
      if (bar) updateStickyOffset(bar);
    });
  };

  const setupStickyOffset = bar => {
    updateStickyOffset(bar);

    // The current Koon implementation places tabs in the same sticky stack.
    // Avoid ResizeObserver and global transition listeners in this mode:
    // they caused repeated layout work while changing preview breakpoints.
    if (bar.closest('[data-veloura-header-tabs-stack]')) return;

    if (!standaloneListenersBound) {
      standaloneListenersBound = true;
      window.addEventListener('scroll', scheduleOffsetUpdate, { passive: true });
      window.addEventListener('resize', scheduleOffsetUpdate, { passive: true });
      document.addEventListener('veloura:header:position', scheduleOffsetUpdate);
    }
  };

  const collectComponents = () => Array.from(
    document.querySelectorAll('[data-veloura-home-tab]')
  );

  const setActiveTab = (bar, requested, focusButton = false) => {
    const buttons = Array.from(bar.querySelectorAll('[data-veloura-tab-target]'));
    if (!buttons.length) return;

    const buttonMap = new Map();
    buttons.forEach(button => {
      const key = normalizeTabName(button.dataset.velouraTabTarget);
      if (key && !buttonMap.has(key)) buttonMap.set(key, button);
    });

    /* The active tab is identified by its ELEMENT, not by its name.
       Keying on the name broke whenever a merchant gave two tabs the same
       label: every button whose name matched was marked selected, so all of
       them took the active colour and none took the inactive one.
       Callers may still pass a name (restoring state, keyboard) — that
       resolves to the first button carrying it, as before. */
    const activeButton = (requested instanceof Element && bar.contains(requested))
      ? requested
      : (buttonMap.get(normalizeTabName(requested)) || buttons[0]);

    const activeKey = normalizeTabName(activeButton.dataset.velouraTabTarget);
    if (!activeKey) return;

    buttons.forEach(button => {
      const active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });

    collectComponents().forEach(component => {
      const assigned = normalizeTabName(component.dataset.velouraHomeTab);
      const show = !assigned || assigned === 'always' || !buttonMap.has(assigned) || assigned === activeKey;

      component.hidden = !show;
      component.classList.toggle('veloura-home-tab-is-hidden', !show);
      component.setAttribute('aria-hidden', show ? 'false' : 'true');
    });

    bar.dataset.velouraActiveTab = activeKey;
    document.dispatchEvent(new CustomEvent('veloura:home-tabs:change', {
      detail: { tab: activeKey }
    }));
  };

  const bindKeyboard = (bar, event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const buttons = Array.from(bar.querySelectorAll('[data-veloura-tab-target]'));
    const currentIndex = buttons.indexOf(document.activeElement);
    if (currentIndex < 0 || !buttons.length) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = buttons.length - 1;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const rtl = document.documentElement.dir === 'rtl';
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const visualStep = rtl ? -step : step;
      nextIndex = (currentIndex + visualStep + buttons.length) % buttons.length;
    }

    setActiveTab(bar, buttons[nextIndex], true);
  };

  const syncCurrentTab = () => {
    const currentBar = document.querySelector('[data-veloura-home-tabs]');
    if (!currentBar) return;
    setActiveTab(currentBar, currentBar.dataset.velouraActiveTab);
  };

  const init = () => {
    const bar = document.querySelector('[data-veloura-home-tabs]');
    document.documentElement.classList.add('veloura-home-tabs-v18-loaded');

    if (!bar) {
      collectComponents().forEach(component => {
        component.hidden = false;
        component.classList.remove('veloura-home-tab-is-hidden');
        component.setAttribute('aria-hidden', 'false');
      });
      return;
    }

    if (!bar.dataset.velouraTabsReady) {
      bar.dataset.velouraTabsReady = 'true';

      bar.addEventListener('click', event => {
        const button = event.target.closest('[data-veloura-tab-target]');
        if (!button || !bar.contains(button)) return;
        setActiveTab(bar, button);
      });

      bar.addEventListener('keydown', event => bindKeyboard(bar, event));
    }

    setupStickyOffset(bar);

    const firstTarget = bar.querySelector('[data-veloura-tab-target]')?.dataset.velouraTabTarget;
    setActiveTab(bar, bar.dataset.velouraActiveTab || firstTarget);

    // Two bounded re-syncs cover late custom-element hydration without keeping
    // a subtree MutationObserver alive during responsive preview changes.
    window.clearTimeout(lateSyncTimer);
    lateSyncTimer = window.setTimeout(syncCurrentTab, 350);
    window.setTimeout(syncCurrentTab, 1100);

    scheduleOffsetUpdate();
  };

  return init;
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVelouraHomeTabs, { once: true });
} else {
  initVelouraHomeTabs();
}
document.addEventListener('theme::ready', initVelouraHomeTabs);
/* VELOURA HOME TABS CONTROLLER END 2026 */

document.addEventListener('DOMContentLoaded', () => initVelouraCartBanners());

document.addEventListener('DOMContentLoaded', () => initVelouraCartBanners());

/* Semantic desktop search sizing: CSS owns layout, JS only measures visible tools. */
const initVelouraInlineSearchSizing = (() => {
  let frame = 0;

  const update = () => {
    frame = 0;
    const header = document.querySelector('.store-header.veloura-top-enabled');
    const grid = header?.querySelector('.veloura-header-grid');
    const tools = grid?.querySelector(':scope > .veloura-header__tools');
    if (!header || !grid || !tools || window.matchMedia('(max-width: 1023px)').matches) return;

    const visibleControls = Array.from(
      tools.querySelectorAll(':scope > .veloura-header__actions > *, :scope > .veloura-header__menu > *')
    ).filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0.5;
    });
    const gap = parseFloat(window.getComputedStyle(tools).gap) || 12;
    const width = visibleControls.reduce((total, node) => total + Math.ceil(node.getBoundingClientRect().width), 0)
      + Math.max(0, visibleControls.length - 1) * gap;
    grid.style.setProperty('--veloura-header-tools-width', `${Math.max(180, Math.min(width, 420))}px`);
  };

  const schedule = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };

  const start = () => {
    schedule();
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    document.addEventListener('veloura:menu:ready', schedule);
    document.fonts?.ready?.then(schedule).catch(() => {});
  };

  return start;
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVelouraInlineSearchSizing, { once: true });
} else {
  initVelouraInlineSearchSizing();
}
document.addEventListener('theme::ready', initVelouraInlineSearchSizing);

/* ==========================================================================
   Header runtime compatibility
   Keeps current source markup and older Salla preview markup visually aligned.
   ========================================================================== */
const initVelouraHeaderRuntimeCompatibility = (() => {
  let bound = false;
  let observer = null;
  let frame = 0;

  const isVisible = (element) => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity || 1) !== 0
      && rect.width > 0.5
      && rect.height > 0.5;
  };

  const stripAmount = (text) => String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, '')
    .replace(/[0-9٠-٩]/g, '')
    .replace(/^[\s.,،٬٫]+/, '')
    .replace(/[\s.,،٬٫]+$/, '')
    .trim();

  /* salla.money() returns MARKUP, not text: "٠ <i class=sicon-sar></i>" —
     the amount plus an icon element carrying the currency symbol. For SAR
     that icon is the official new riyal mark, which is exactly what should
     appear in the pill, so the element is preserved and only the numeric
     part is removed. Returns '' when Salla gives no symbol at all. */
  const currencyMarkupFromSalla = () => {
    if (!(window.salla && typeof salla.money === 'function')) return '';

    const box = document.createElement('div');
    box.innerHTML = String(salla.money(0) ?? '');

    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    /* Strip the digits, then trim leftover separators from the ENDS only.
       Collapsing every separator used to corrupt the symbol itself: "د.إ" is
       written with a dot, so "٠٫٠٠ د.إ" came out as "د إ". Only the grouping
       and decimal marks left stranded around the number are removed. */
    texts.forEach((node) => {
      node.nodeValue = node.nodeValue
        .replace(/[0-9٠-٩]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/^[\s.,،٬٫]+|[\s.,،٬٫]+$/g, '');
    });

    /* Order: a text symbol, then an icon element, then nothing.

       Text first, because "د.إ", "ر.س" and "$" always render. But an icon is
       still a perfectly good symbol and must be kept when there is no text —
       Salla ships the Saudi riyal as <i class="sicon-sar">, which is the new
       riyal mark and exactly what the pill should show. Dropping it sent the
       pill to the currency CODE instead, so an SAR store read "SAR" while its
       own currency picker showed the proper mark.

       Only the element is carried over, never the surrounding text nodes, so
       nothing but the symbol itself reaches the pill. */
    const symbolText = box.textContent.replace(/\s+/g, ' ').trim();
    if (symbolText) return symbolText;

    const iconEl = box.querySelector('i[class], svg, img');
    if (iconEl) {
      /* Rebuild the element from scratch: tag plus class only. Whatever else
         Salla put on it (inline sizes, data hooks, event bindings) has no
         business in the header pill. */
      const tag = iconEl.tagName.toLowerCase();
      const cls = (iconEl.getAttribute('class') || '').replace(/[^\w\s-]/g, '').trim();
      if (tag === 'i' && cls) {
        return '<i class="' + cls + ' veloura-localization-pill__currency-icon" aria-hidden="true"></i>';
      }
      return iconEl.outerHTML;
    }

    return '';
  };

  /* The currency used to be scraped from the cart-summary total. That text is
     absent whenever the merchant hides the total (icon-only cart) or before
     the cart hydrates, and the fallback was a hardcoded 'د.إ' — the wrong
     currency for most stores. Salla's own money formatter is asked first, so
     the pill carries the store's real currency from the first paint. */
  /* The pill's currency slot must never be empty, and it must never depend on
     whether the merchant shows the cart total — hiding the price in the
     header used to erase the currency with it. Order: Salla's own symbol,
     then the currency code, then the cart text, then a last-resort code. */
  const getCurrencyLabel = (header) => {
    try {
      const markup = currencyMarkupFromSalla();
      if (markup) return markup;
    } catch (e) { /* formatter unavailable */ }

    let code = '';
    try {
      code = (window.salla && salla.config
        && (salla.config.get('user.currency_code') || salla.config.get('store.currency'))) || '';
    } catch (e) { /* config unavailable */ }
    if (code) return String(code).toUpperCase();

    const fromCart = stripAmount(header?.querySelector('.s-cart-summary-total')?.textContent);
    return fromCart || 'SAR';
  };

  const getLanguageLabel = () => {
    const lang = (
      document.documentElement.lang
      || document.documentElement.getAttribute('lang')
      || 'ar'
    ).toLowerCase();
    return lang.startsWith('ar') ? 'العربية' : 'English';
  };

  const renderLocalizationPill = (header) => {
    const button = header?.querySelector('.veloura-lang-desktop[data-veloura-localization-trigger]');
    if (!button) return;

    const language = getLanguageLabel();
    const currency = getCurrencyLabel(header);
    const signature = `${language}|${currency}`;

    button.classList.add('veloura-localization-pill');
    button.classList.toggle('veloura-localization-pill--no-currency', !currency);

    if (button.dataset.velouraLocalizationPill !== signature) {
      button.dataset.velouraLocalizationPill = signature;
      /* With no currency resolved, render the language alone rather than a
         label followed by a divider with nothing after it. */
      button.innerHTML = currency
        ? `
        <span class="veloura-localization-pill__language">${language}</span>
        <span class="veloura-localization-pill__divider" aria-hidden="true"></span>
        <span class="veloura-localization-pill__currency">${currency}</span>
      `
        : `
        <span class="veloura-localization-pill__language">${language}</span>
      `;
    }
  };

  /* THE PILL MUST BE RE-RENDERED ONCE SALLA HAS HYDRATED.

     salla.money() and salla.config are not ready during the first paint, so
     the very first render falls through to the last-resort code and the pill
     can end up showing SAR on a store whose real currency is AED. It then
     stayed wrong for the rest of the visit, because nothing asked again.

     Re-rendering is cheap and self-limiting: renderLocalizationPill compares
     a language|currency signature and only touches the DOM when the value
     actually changed, so these retries are no-ops as soon as the currency
     resolves. */
  const refreshLocalizationPill = () => {
    const header = document.querySelector('.store-header.veloura-top-enabled');
    if (header) renderLocalizationPill(header);
  };

  const scheduleLocalizationRefresh = () => {
    [0, 300, 1000, 2500, 5000].forEach((delay) => {
      window.setTimeout(refreshLocalizationPill, delay);
    });

    try {
      if (window.salla && typeof salla.onReady === 'function') {
        salla.onReady(refreshLocalizationPill);
      }
    } catch (e) { /* Salla not ready to take callbacks */ }

    try {
      if (window.salla && salla.event && typeof salla.event.on === 'function') {
        ['currency::changed', 'language::changed', 'salla::hydrated'].forEach((name) => {
          try { salla.event.on(name, refreshLocalizationPill); } catch (e) { /* unknown event */ }
        });
      }
    } catch (e) { /* no event bus */ }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleLocalizationRefresh, { once: true });
  } else {
    scheduleLocalizationRefresh();
  }

  /* Kept scoped to the legacy .veloura-header__actions wrapper ON PURPOSE.
     header.twig no longer contains it, so this never runs — and it must not.
     Its order is [account, cart, language]; pointing it at the current
     .veloura-header-left moved the account button ahead of the cart, so the
     cart stopped being the outermost control on mobile. Order in the current
     markup is owned by the template and by header-layout.scss, not here. */
  const reorderActions = (actions) => {
    if (!actions || !actions.classList.contains('veloura-header__actions')) return;

    const account = actions.querySelector('.veloura-login-btn');
    const cart = actions.querySelector('salla-cart-summary');
    const language = actions.querySelector('.veloura-lang-desktop');
    const primary = [account, cart, language].filter(Boolean);
    const primarySet = new Set(primary);
    const rest = Array.from(actions.children).filter(node => !primarySet.has(node));

    [...primary, ...rest].forEach(node => actions.appendChild(node));
  };

  const updateMeasuredWidth = (header, grid, tools) => {
    if (!header || !grid || !tools || window.matchMedia('(max-width: 1023px)').matches) return;

    window.requestAnimationFrame(() => {
      const width = Math.ceil(tools.getBoundingClientRect().width);
      if (!width) return;
      const clamped = Math.max(180, Math.min(width, 420));
      grid.style.setProperty('--veloura-header-tools-width', `${clamped}px`);
      grid.style.setProperty('--veloura-v63-side-width', `${clamped}px`);
    });
  };

  const sync = () => {
    frame = 0;

    const header = document.querySelector('.store-header.veloura-top-enabled');
    const grid = header?.querySelector('.veloura-header-grid');
    if (!header || !grid) return;

    /* Localization is independent from the header tools structure.
       Render it before any tools lookup so the desktop language/currency
       control cannot fail silently when the tools wrapper is unavailable. */
    renderLocalizationPill(header);

    const tools = grid.querySelector(':scope > .veloura-header__tools')
      || grid.querySelector(':scope > .veloura-v63-unified-icons');

    if (!tools) return;

    const actions = tools.querySelector(':scope > .veloura-header__actions')
      || tools.querySelector(':scope > .veloura-header-left');

    const menu = tools.querySelector(':scope > .veloura-header__menu')
      || tools.querySelector(':scope > .veloura-header-right');

    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    const navigation = header.querySelector('.veloura-main-menu-desktop, .veloura-menu-links-wrap');
    const navigationVisible = desktop && isVisible(navigation);

    const rectangularSearch = grid.querySelector(':scope > .veloura-desktop-search-bar');
    const rectangularSearchVisible = desktop && isVisible(rectangularSearch);

    header.classList.toggle(
      'veloura-header--desktop-navigation-visible',
      navigationVisible
    );

    header.classList.toggle(
      'veloura-header--rect-search-visible',
      rectangularSearchVisible
    );

    if (desktop) {
      reorderActions(actions);
    }

    if (menu) {
      window.requestAnimationFrame(() => {
        const hasVisibleChild = Array.from(menu.children).some(isVisible);
        menu.classList.toggle('veloura-header__menu--empty', !hasVisibleChild);
      });
    }

    updateMeasuredWidth(header, grid, tools);
  };

  const schedule = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(sync);
  };

  const bind = () => {
    if (bound) {
      schedule();
      return;
    }

    bound = true;
    schedule();

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    document.addEventListener('theme::ready', schedule);
    document.addEventListener('veloura:menu:ready', schedule);

    /* The pill is often built before Salla's money formatter exists, so the
       first render has no currency and the result is cached by signature.
       Nothing re-rendered it afterwards, and the currency stayed missing for
       the life of the page — which is what made it vanish whenever the
       merchant toggled the cart total. These re-syncs cover late hydration
       without keeping an observer alive. */
    [300, 900, 2000].forEach(delay => window.setTimeout(schedule, delay));
    try {
      if (window.salla && salla.event && typeof salla.event.on === 'function') {
        ['salla::ready', 'currency::fetched', 'cart::updated'].forEach(evt => {
          try { salla.event.on(evt, schedule); } catch (e) { /* unknown event */ }
        });
      }
    } catch (e) { /* Salla bus unavailable */ }

    const header = document.querySelector('.store-header.veloura-top-enabled');
    if (header && typeof MutationObserver === 'function') {
      observer = new MutationObserver(schedule);
      observer.observe(header, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'hidden']
      });
    }

    [120, 350, 900, 1800].forEach(delay => {
      window.setTimeout(schedule, delay);
    });
  };

  return bind;
})();

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initVelouraHeaderRuntimeCompatibility,
    { once: true }
  );
} else {
  initVelouraHeaderRuntimeCompatibility();
}
document.addEventListener('theme::ready', initVelouraHeaderRuntimeCompatibility);

/* ========================================================================
   Veloura Bottom Nav Search V13 + native Login

   V13 behavior:
   - Salla Search/Login in this storefront expose no OPEN shadowRoot.
   - Therefore V11 does not depend on search.shadowRoot/login.shadowRoot.
   - Search is styled through the host, CSS custom properties and ::part()
     fallbacks, with the OUTER shell as the single visible glass surface.
   - Bottom-nav Login uses the documented <salla-login-modal inline> mode
     inside a Veloura-owned glass shell, so the native modal white sheet and
     its white close-button tile are not used by this bottom-nav flow.
   ======================================================================== */
const initVelouraBottomNavOverlaysV13 = () => {
  const nav = document.querySelector('[data-vbn]');
  if (!nav || nav.dataset.vbnOverlaysV13 === 'true') return;

  const itemSelector = '[data-vbn-item]';
  const searchItem = nav.querySelector(`${itemSelector}[data-vbn-key="search"]`);
  const accountItem = nav.querySelector(`${itemSelector}[data-vbn-key="account"]`);
  const categoriesItem = nav.querySelector(`${itemSelector}[data-vbn-key="categories"]`);
  const navSurface = nav.querySelector('.veloura-bottom-nav__surface');

  if (!searchItem && !accountItem && !categoriesItem) return;
  nav.dataset.vbnOverlaysV13 = 'true';

  const SEARCH_PANEL_ID = 'veloura-bottom-search-panel-v13';
  const SEARCH_BACKDROP_ID = 'veloura-bottom-search-backdrop-v13';
  const STYLE_ID = 'veloura-bottom-overlays-style-v13';
  const LOGIN_OPEN_CLASS = 'veloura-bottom-nav-login-open';

  // V13 never owns the Login modal. Clear any stale class left by V12/HMR.
  removeBodyClassesIfPresent(LOGIN_OPEN_CLASS);

  // Clean all previous bottom-nav experiments. V12 owns search only; login goes
  // back to Salla's native login modal and is styled from the light DOM.
  [
    'veloura-bottom-search-panel',
    'veloura-bottom-search-panel-v2',
    'veloura-bottom-search-panel-v8',
    'veloura-bottom-search-panel-v9',
    'veloura-bottom-search-panel-v10',
    'veloura-bottom-search-panel-v11',
    'veloura-bottom-search-panel-v12',
    'veloura-bottom-search-backdrop-v4',
    'veloura-bottom-search-backdrop-v8',
    'veloura-bottom-search-backdrop-v9',
    'veloura-bottom-search-backdrop-v10',
    'veloura-bottom-search-backdrop-v11',
    'veloura-bottom-search-backdrop-v12',
    'veloura-bottom-login-panel-v10',
    'veloura-bottom-login-backdrop-v10',
    'veloura-bottom-login-panel-v11',
    'veloura-bottom-login-backdrop-v11'
  ].forEach(id => document.getElementById(id)?.remove());

  [
    'veloura-bottom-search-style-v8',
    'veloura-bottom-search-style-v9',
    'veloura-bottom-search-style-v10',
    'veloura-login-glass-v10',
    'veloura-bottom-overlays-style-v11',
    'veloura-bottom-overlays-style-v12',
    'veloura-vbn-top-glass-v4-style',
    'veloura-vbn-top-glass-visual-v5-style',
    'veloura-vbn-search-visual-v6-style',
    'veloura-vbn-search-visual-v7-style'
  ].forEach(id => document.getElementById(id)?.remove());

  document.querySelectorAll('[data-vbn-search-layer], [data-vbn-search-panel]').forEach(node => {
    if (node.id !== SEARCH_PANEL_ID) node.remove();
  });

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (max-width: 767px) {
      #${SEARCH_BACKDROP_ID} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483000 !important;
        display: block !important;
        pointer-events: auto !important;
        background:
          linear-gradient(
            180deg,
            rgba(248,250,252,.12) 0%,
            rgba(230,234,239,.23) 48%,
            rgba(207,214,222,.46) 100%
          ) !important;
        -webkit-backdrop-filter: blur(20px) saturate(122%) contrast(200%) !important;
        backdrop-filter: blur(20px) saturate(122%) contrast(200%) !important;
      }

      #${SEARCH_BACKDROP_ID}[hidden],
      #${SEARCH_PANEL_ID}[hidden] {
        display: none !important;
      }

      #${SEARCH_PANEL_ID} {
        --v12-radius: 24px;
        --v12-dark-surface: var(--veloura-dark-secondary-bg, #001f33);
        position: fixed !important;
        top: calc(env(safe-area-inset-top, 0px) + 14px) !important;
        left: 50% !important;
        right: auto !important;
        z-index: 2147483300 !important;
        width: min(430px, calc(100vw - 32px)) !important;
        max-width: calc(100vw - 32px) !important;
        min-height: 56px !important;
        height: 56px !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: translateX(-50%) !important;
        box-sizing: border-box !important;
        border-radius: var(--v12-radius) !important;
        pointer-events: auto !important;

        /* This is the visible light-mode silver material. */
        background: rgba(221,224,229,.96) !important;
        border: 1px solid rgba(71,85,105,.16) !important;
        box-shadow:
          0 12px 32px rgba(15,23,42,.18),
          inset 0 1px 0 rgba(255,255,255,.72) !important;
        -webkit-backdrop-filter: blur(20px) saturate(120%) contrast(200%) !important;
        backdrop-filter: blur(20px) saturate(120%) contrast(200%) !important;
      }

      #${SEARCH_PANEL_ID} > salla-search {
        display: block !important;
        width: 100% !important;
        height: 56px !important;
        min-height: 56px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: var(--v12-radius) !important;
        background: transparent !important;
        box-shadow: none !important;
        color: #334155 !important;
        pointer-events: auto !important;

        /* The current Salla search has a closed render root. Brightness is
           intentionally applied to the host so its internal white input reads
           as a very light silver without needing shadowRoot access. */
        filter: brightness(.925) saturate(.92) !important;
        -webkit-filter: brightness(.925) saturate(.92) !important;

        --color-text: #334155 !important;
        --color-muted: #64748b !important;
      }

      /* Salla officially exposes an oval property. V12 toggles it from the
         actual bottom-nav radius in JS; these rules cover exposed parts too. */
      #${SEARCH_PANEL_ID} > salla-search::part(form),
      #${SEARCH_PANEL_ID} > salla-search::part(container),
      #${SEARCH_PANEL_ID} > salla-search::part(wrapper),
      #${SEARCH_PANEL_ID} > salla-search::part(input-wrapper),
      #${SEARCH_PANEL_ID} > salla-search::part(input) {
        border-radius: var(--v12-radius) !important;
      }

      body.veloura-bottom-nav-search-open,
      body.${LOGIN_OPEN_CLASS} {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }

      body.veloura-bottom-nav-search-open .veloura-bottom-nav,
      body.${LOGIN_OPEN_CLASS} .veloura-bottom-nav {
        z-index: 2147483500 !important;
        pointer-events: none !important;
      }

      body.veloura-bottom-nav-search-open .veloura-bottom-nav__surface,
      body.veloura-bottom-nav-search-open .veloura-bottom-nav__item,
      body.${LOGIN_OPEN_CLASS} .veloura-bottom-nav__surface,
      body.${LOGIN_OPEN_CLASS} .veloura-bottom-nav__item {
        pointer-events: auto !important;
      }

      /* The login dialog's own material is NOT set here. It is
         .s-modal-body, and veloura-global-overlays.scss already gives that the
         theme's glass so it follows the glass option in the general settings.
         The block that used to sit here painted a hard-coded light surface and
         overrode that. See the note where patchNativeLogin used to live. */

      /* Light bottom nav remains readable over the frosted page. */
      html:not(.dark) body:is(.veloura-bottom-nav-search-open,.${LOGIN_OPEN_CLASS})
        .veloura-bottom-nav__surface {
        color: #0f172a !important;
        background: rgba(239,241,244,.90) !important;
        border: 1px solid rgba(100,116,139,.15) !important;
        box-shadow:
          0 12px 34px rgba(15,23,42,.15),
          inset 0 1px 0 rgba(255,255,255,.82) !important;
        -webkit-backdrop-filter: blur(20px) saturate(124%) contrast(200%) !important;
        backdrop-filter: blur(20px) saturate(124%) contrast(200%) !important;
      }

      html:not(.dark) body:is(.veloura-bottom-nav-search-open,.${LOGIN_OPEN_CLASS})
        .veloura-bottom-nav__item {
        color: #111827 !important;
      }

      html:not(.dark) body:is(.veloura-bottom-nav-search-open,.${LOGIN_OPEN_CLASS})
        .veloura-bottom-nav__item.is-active {
        color: #fff !important;
        background: var(--vbn-active, #00b8ee) !important;
        box-shadow: 0 8px 22px rgba(15,23,42,.20) !important;
      }

      /* Dark mode: never use contrast(200%) on our glass surfaces. */
      html.dark body #${SEARCH_BACKDROP_ID},
      html body.dark #${SEARCH_BACKDROP_ID} {
        background:
          linear-gradient(
            180deg,
            rgba(0,10,18,.24) 0%,
            rgba(0,10,18,.38) 52%,
            rgba(0,10,18,.68) 100%
          ) !important;
        -webkit-backdrop-filter: blur(20px) saturate(114%) !important;
        backdrop-filter: blur(20px) saturate(114%) !important;
      }

      html.dark body #${SEARCH_PANEL_ID},
      html body.dark #${SEARCH_PANEL_ID} {
        background: color-mix(in srgb, var(--v12-dark-surface) 90%, transparent) !important;
        border-color: rgba(255,255,255,.08) !important;
        box-shadow:
          0 14px 36px rgba(0,0,0,.28),
          inset 0 1px 0 rgba(255,255,255,.045) !important;
        -webkit-backdrop-filter: blur(20px) saturate(116%) !important;
        backdrop-filter: blur(20px) saturate(116%) !important;
      }

      html.dark body #${SEARCH_PANEL_ID} > salla-search,
      html body.dark #${SEARCH_PANEL_ID} > salla-search {
        color: var(--veloura-dark-primary-text, #fff) !important;
        filter: none !important;
        -webkit-filter: none !important;
        --color-text: var(--veloura-dark-primary-text, #fff) !important;
        --color-muted: var(--veloura-dark-secondary-text, #cbd5e1) !important;
      }

      html.dark body.${LOGIN_OPEN_CLASS} :is(
        .s-salla-modal-overlay,
        .s-modal-overlay,
        .s-modal-backdrop,
        .modal-backdrop
      ),
      html body.dark.${LOGIN_OPEN_CLASS} :is(
        .s-salla-modal-overlay,
        .s-modal-overlay,
        .s-modal-backdrop,
        .modal-backdrop
      ) {
        background: rgba(0,10,18,.46) !important;
        -webkit-backdrop-filter: blur(20px) saturate(114%) !important;
        backdrop-filter: blur(20px) saturate(114%) !important;
      }

    }
  `;
  document.head.appendChild(style);

  const searchBackdrop = document.createElement('div');
  searchBackdrop.id = SEARCH_BACKDROP_ID;
  searchBackdrop.hidden = true;
  searchBackdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(searchBackdrop);

  let searchPanel = null;
  let search = null;

  if (searchItem) {
    searchPanel = document.createElement('div');
    searchPanel.id = SEARCH_PANEL_ID;
    searchPanel.hidden = true;
    searchPanel.setAttribute('aria-hidden', 'true');
    searchPanel.setAttribute('data-vbn-search-panel', 'v12');

    search = document.createElement('salla-search');
    search.setAttribute('inline', '');
    search.setAttribute('height', '56');
    search.setAttribute('data-vbn-inline-search', 'v12');
    search.setAttribute('data-vbn-native', '');

    searchPanel.appendChild(search);
    document.body.appendChild(searchPanel);

    searchItem.removeAttribute('onclick');
    searchItem.setAttribute('aria-controls', SEARCH_PANEL_ID);
    searchItem.setAttribute('aria-expanded', 'false');
  }

  // V13: leave Login 100% native. The bottom-nav account button uses the same
  // login::open action as the original Twig, and this controller never blocks it.
  if (accountItem) {
    accountItem.setAttribute('onclick', "salla.event.dispatch('login::open')");
    accountItem.removeAttribute('aria-expanded');
  }

  const routeActiveItem =
    nav.querySelector(`${itemSelector}[aria-current="page"]`) ||
    nav.querySelector(`${itemSelector}.is-active`) ||
    null;

  const clearActive = () => {
    nav.querySelectorAll(itemSelector).forEach(item => item.classList.remove('is-active'));
  };

  const setActive = item => {
    if (!item) return;
    clearActive();
    item.classList.add('is-active');
  };

  const restoreRouteActive = () => {
    clearActive();
    const current = nav.querySelector(`${itemSelector}[aria-current="page"]`) || routeActiveItem;
    current?.classList.add('is-active');
  };

  const isSearchOpen = () => Boolean(searchPanel && !searchPanel.hidden);
  const isLoginOpen = () => document.body.classList.contains(LOGIN_OPEN_CLASS);

  const parseRadius = value => {
    const n = parseFloat(String(value || '').replace('px', ''));
    return Number.isFinite(n) ? n : 24;
  };

  const syncRadius = () => {
    const computedSurface = navSurface ? getComputedStyle(navSurface) : null;
    const radius =
      computedSurface?.borderTopLeftRadius ||
      (getComputedStyle(nav).getPropertyValue('--vbn-radius') || '').trim() ||
      '24px';

    const darkSource =
      (getComputedStyle(document.documentElement).getPropertyValue('--veloura-dark-secondary-bg') || '').trim() ||
      (getComputedStyle(document.body).getPropertyValue('--veloura-dark-secondary-bg') || '').trim() ||
      '#001f33';

    if (searchPanel) {
      searchPanel.style.setProperty('--v12-radius', radius);
      searchPanel.style.setProperty('--v12-dark-surface', darkSource);
    }

    // Salla Search officially supports `oval`. Use it when the nav itself is a
    // pill; otherwise leave Salla's normal shape and let our outer panel carry
    // the exact radius.
    if (search) {
      const radiusPx = parseRadius(radius);
      if (radiusPx >= 24) search.setAttribute('oval', '');
      else search.removeAttribute('oval');
    }

  };

  const closeSearch = ({ restore = true } = {}) => {
    if (!searchPanel) return;
    searchPanel.hidden = true;
    searchBackdrop.hidden = true;
    searchPanel.setAttribute('aria-hidden', 'true');
    searchBackdrop.setAttribute('aria-hidden', 'true');
    searchItem?.setAttribute('aria-expanded', 'false');

    // IMPORTANT: body.class is observed below. Chromium can still enqueue an
    // attribute mutation when DOMTokenList.remove() is called for a token that
    // is already absent. Avoid the no-op write entirely so the observer cannot
    // feed itself while the side menu is open.
    if (document.body.classList.contains('veloura-bottom-nav-search-open')) {
      removeBodyClassesIfPresent('veloura-bottom-nav-search-open');
    }

    if (restore && !isLoginOpen()) restoreRouteActive();
  };

  const openSearch = () => {
    if (!searchPanel) return;
    closeNativeLogin({ restore: false });

    if (document.body.classList.contains('menu-opened')) {
      window.__velouraNativeMobileMenuDrawer?.close?.();
      removeBodyClassesIfPresent('menu-opened', 'veloura-bottom-nav-categories-open');
    }

    syncRadius();
    searchPanel.hidden = false;
    searchBackdrop.hidden = false;
    searchPanel.setAttribute('aria-hidden', 'false');
    searchBackdrop.setAttribute('aria-hidden', 'false');
    searchItem.setAttribute('aria-expanded', 'true');
    document.body.classList.add('veloura-bottom-nav-search-open');
    setActive(searchItem);

    requestAnimationFrame(() => search?.focus?.({ preventScroll: true }));
  };

  const isNearWhite = color => {
    const m = String(color || '').match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (!m) return false;
    const [, r, g, b, a] = m;
    return Number(r) >= 225 && Number(g) >= 225 && Number(b) >= 225 && (a === undefined || Number(a) > .45);
  };

  const isTransparent = color =>
    !color || color === 'transparent' || /rgba\([^)]*,\s*0(?:\.0+)?\s*\)/i.test(color);

  const visible = el => {
    if (!(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  };

  /* patchNativeLogin USED TO LIVE HERE — deliberately removed.

     Measured on the live store with the modal open: <salla-login-modal> has
     NO shadow root and ZERO child nodes. It is an empty trigger element. The
     dialog Salla actually renders is a separate <salla-modal class="s-login-modal">
     appended at body level, whose panel is .s-modal-body and whose close
     control is .s-modal-close.

     So every selector this function used that was rooted at salla-login-modal
     could never match anything, and what it did do was worse: it walked the
     dialog, guessed which element was "the surface" by measuring rectangles
     and sniffing class/id/aria text for the word "close", stamped
     data-v12-login-* attributes on its guesses, and painted them from a
     HARD-CODED material (rgba(226,229,233,.90), its own blur, its own border
     and shadow). That is why the login dialog never followed the glass option
     in the general settings — it was not reading the theme's tokens at all.

     .s-modal-body receives the theme's glass material from
     veloura-global-overlays.scss and dark-light.scss if it renders in the
     light DOM, and from SHADOW_CSS in veloura-exact-dark-light-plus3-v86.js
     (COMPONENTS includes 'salla-modal') if it renders inside a shadow root —
     that split existed before but 'salla-modal' had been left out of
     COMPONENTS, so the shadow-root path never actually ran. Deleting the
     engine lets those rules through; the only thing that still needed saying
     is the close button, which is one rule in veloura-global-overlays.scss. */

  /* The login dialog is styled entirely in CSS now; nothing to schedule. */
  const scheduleLoginPatch = () => {};

  const closeNativeLogin = ({ restore = true } = {}) => {
    if (!isLoginOpen()) return;

    const nestedModal = [...document.querySelectorAll('salla-modal')].find(visible);
    const closeButton = document.querySelector('.s-modal-close') ||
      [...document.querySelectorAll('.s-modal button, .s-salla-modal button, salla-login-modal button')]
        .find(el => visible(el) && /close|إغلاق|اغلاق|dismiss/.test(
          `${el.className || ''} ${el.id || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.toLowerCase()
        ));

    try {
      if (typeof nestedModal?.close === 'function') nestedModal.close();
      else closeButton?.click?.();
    } catch (_) {}

    removeBodyClassesIfPresent(LOGIN_OPEN_CLASS);
    accountItem?.setAttribute('aria-expanded', 'false');
    if (restore && !isSearchOpen()) restoreRouteActive();
  };

  const openNativeLogin = () => {
    closeSearch({ restore: false });

    if (document.body.classList.contains('menu-opened')) {
      window.__velouraNativeMobileMenuDrawer?.close?.();
      removeBodyClassesIfPresent('menu-opened', 'veloura-bottom-nav-categories-open');
    }

    syncRadius();
    document.body.classList.add(LOGIN_OPEN_CLASS);
    accountItem?.setAttribute('aria-expanded', 'true');
    setActive(accountItem);

    try {
      // Use Salla's native login workflow. Login docs expose open(); the event
      // is the same native action Theme Raed already uses.
      const loginHost = document.querySelector('salla-login-modal');
      if (loginHost && typeof loginHost.open === 'function') loginHost.open();
      else salla.event.dispatch('login::open');
    } catch (_) {
      try { salla.event.dispatch('login::open'); } catch (_) {}
    }

    scheduleLoginPatch();
  };

  nav.addEventListener('click', event => {
    const item = event.target.closest?.(itemSelector);
    if (!item || !nav.contains(item)) return;

    const key = item.getAttribute('data-vbn-key') || '';

    if (key === 'search' && searchItem) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isSearchOpen()) closeSearch({ restore: true });
      else openSearch();
      return;
    }

    if (key === 'account' && accountItem) {
      // Do NOT preventDefault / stopPropagation here. The original inline
      // salla.event.dispatch('login::open') must reach Salla untouched.
      closeSearch({ restore: false });
      if (document.body.classList.contains('menu-opened')) {
        window.__velouraNativeMobileMenuDrawer?.close?.();
        removeBodyClassesIfPresent('menu-opened', 'veloura-bottom-nav-categories-open');
      }
      setActive(accountItem);
      return;
    }

    if (key === 'categories') {
      event.preventDefault();
      event.stopPropagation();

      closeSearch({ restore: false });
      if (isLoginOpen()) closeNativeLogin({ restore: false });

      const runToggle = () => {
        const toggle = window.__velouraToggleNativeMobileMenu;
        if (typeof toggle !== 'function') {
          restoreRouteActive();
          return;
        }

        const opened = toggle();
        item.setAttribute('aria-expanded', opened ? 'true' : 'false');

        if (opened) setActive(item);
        else window.setTimeout(restoreRouteActive, 80);
      };

      if (typeof window.__velouraToggleNativeMobileMenu === 'function') {
        runToggle();
      } else {
        Promise.resolve(window.app?.initiateMobileMenu?.() || window.__velouraNativeMobileMenuInitPromise)
          .then(runToggle)
          .catch(() => restoreRouteActive());
      }
      return;
    }

    closeSearch({ restore: false });
    if (isLoginOpen()) closeNativeLogin({ restore: false });
    setActive(item);
  }, true);

  searchBackdrop.addEventListener('click', () => closeSearch({ restore: true }));


  document.addEventListener('veloura:mobile-menu:opening', () => {
    closeSearch({ restore: false });
    if (isLoginOpen()) closeNativeLogin({ restore: false });
    if (categoriesItem) {
      categoriesItem.setAttribute('aria-expanded', 'true');
      setActive(categoriesItem);
    }
  });

  document.addEventListener('veloura:mobile-menu:closed', () => {
    categoriesItem?.setAttribute('aria-expanded', 'false');
    if (!isSearchOpen() && !isLoginOpen()) restoreRouteActive();
  });

  // Native login close/backdrop/Escape should restore the bottom-nav state.
  document.addEventListener('click', event => {
    if (!isLoginOpen()) return;
    const target = event.target;
    const isClose = target?.closest?.('.s-modal-close, .s-modal-overlay, .s-salla-modal-overlay, .s-modal-backdrop, .modal-backdrop');
    if (!isClose) return;
    window.setTimeout(() => {
      removeBodyClassesIfPresent(LOGIN_OPEN_CLASS);
      accountItem?.setAttribute('aria-expanded', 'false');
      if (!isSearchOpen()) restoreRouteActive();
    }, 100);
  }, true);

  document.addEventListener('click', event => {
    if (!event.target.closest?.('.close-mobile-menu, .mm-ocd__backdrop')) return;
    window.setTimeout(restoreRouteActive, 120);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (isSearchOpen()) {
      closeSearch({ restore: true });
      return;
    }
    if (isLoginOpen()) {
      window.setTimeout(() => {
        removeBodyClassesIfPresent(LOGIN_OPEN_CLASS);
        accountItem?.setAttribute('aria-expanded', 'false');
        restoreRouteActive();
      }, 80);
    }
  });

  // Re-patch native login if Salla renders/replaces modal nodes asynchronously.
  if (typeof MutationObserver === 'function') {
    const loginObserver = new MutationObserver(() => {
    });
    loginObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Keep Categories active in sync with Raed's mmenu state.
  // Only react when the *menu-opened state itself* changes. The body also gets
  // classes for search/login/mmenu/filters; reacting to every class mutation
  // can create a MutationObserver feedback loop.
  let menuWasOpen = document.body.classList.contains('menu-opened');
  if (typeof MutationObserver === 'function') {
    const bodyObserver = new MutationObserver(() => {
      const menuOpen = document.body.classList.contains('menu-opened');

      // Ignore unrelated body.class mutations while the menu state is stable.
      if (menuOpen === menuWasOpen) return;

      const wasOpen = menuWasOpen;
      // Update first, before any helper below is allowed to touch body.class.
      // Any follow-up mutation will therefore see a stable state and exit.
      menuWasOpen = menuOpen;

      if (menuOpen && categoriesItem) {
        if (isSearchOpen() || document.body.classList.contains('veloura-bottom-nav-search-open')) {
          closeSearch({ restore: false });
        }
        if (isLoginOpen()) closeNativeLogin({ restore: false });
        setActive(categoriesItem);
      } else if (wasOpen && !menuOpen && !isSearchOpen() && !isLoginOpen()) {
        restoreRouteActive();
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  const syncTheme = () => {
    syncRadius();
    if (isLoginOpen()) scheduleLoginPatch();
  };

  window.addEventListener('resize', syncTheme, { passive: true });
  window.addEventListener('orientationchange', syncTheme, { passive: true });
  window.addEventListener('veloura:theme-changed', syncTheme);
  document.addEventListener('theme::ready', syncTheme);

  syncRadius();
  closeSearch({ restore: false });
  restoreRouteActive();

  console.info('[Veloura] Bottom Nav Search V13 ready — Login native');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVelouraBottomNavOverlaysV13, { once: true });
} else {
  initVelouraBottomNavOverlaysV13();
}