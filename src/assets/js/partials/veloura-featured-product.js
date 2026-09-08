/* ==========================================================================
   المنتج المميز (فيلورا)

   A custom home component gets no Product object in Twig, so the section is
   rendered as a shell and the product is fetched here with
   salla.product.api.fetch — the same endpoint <salla-products-slider> uses,
   which means "the chosen product" and "best seller / newest" are one call
   with a different source.

   Everything degrades: no product, or a failed request, hides the section
   rather than leaving an empty frame on the home page.
   ========================================================================== */

const SELECTOR = '[data-veloura-featured-product]';

const text = value => (value === null || value === undefined ? '' : String(value));

/* Prices arrive as a number, or as {amount, currency}, or already formatted. */
const readAmount = value => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') return readAmount(value.amount ?? value.value ?? value.price);
  const parsed = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const money = value => {
  const amount = readAmount(value);
  if (amount === null) return '';
  try { return salla.money(amount); } catch (_) { return String(amount); }
};

const imageUrl = image => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.src || image.path || '';
};

const normalize = product => {
  if (!product || typeof product !== 'object') return null;

  const images = Array.isArray(product.images) ? product.images.filter(i => (i.type || 'image') === 'image') : [];
  const main = imageUrl(product.image) || imageUrl(images[0]);
  const sale = readAmount(product.sale_price);
  const regular = readAmount(product.regular_price ?? product.price);
  const onSale = Boolean(product.is_on_sale) && sale !== null && regular !== null && regular > sale;

  return {
    id: product.id,
    name: text(product.name),
    url: product.url || '#',
    status: product.status || 'sale',
    type: product.type || 'product',
    image: main,
    images: images.map(imageUrl).filter(Boolean).slice(0, 5),
    price: money(onSale ? sale : (product.price ?? regular)),
    oldPrice: onSale ? money(regular) : '',
    discount: onSale ? Math.round(((regular - sale) / regular) * 100) : 0,
    excerpt: text(product.subtitle || product.promotion_title || '').trim(),
    rating: product.rating && product.rating.stars ? product.rating : null,
    discountEnds: product.discount_ends || '',
  };
};

const fetchProduct = async section => {
  const id = section.dataset.vfpProductId;
  const fallback = section.dataset.vfpFallback || 'sales';

  const request = params => salla.product.api.fetch(params);

  /* The chosen product first; the automatic source is only a safety net, so a
     section whose product was deleted still shows something instead of
     disappearing. */
  const attempts = [];
  if (id) attempts.push({ source: 'selected', source_value: [id], limit: 1 });
  if (fallback !== 'none') attempts.push({ source: fallback, limit: 1 });

  for (const params of attempts) {
    try {
      const response = await request(params);
      const list = response?.data || response?.products || [];
      const product = normalize(Array.isArray(list) ? list[0] : list);
      if (product && product.id) return product;
    } catch (_) {}
  }

  return null;
};

const paint = (section, product) => {
  const set = (attr, fn) => section.querySelectorAll(`[${attr}]`).forEach(fn);

  set('data-vfp-name', el => { el.textContent = product.name; });
  set('data-vfp-link', el => { if (el.tagName === 'A') el.href = product.url; });
  set('data-vfp-price', el => { el.textContent = product.price; });

  set('data-vfp-image', el => {
    if (!product.image) return;
    el.src = product.image;
    el.alt = product.name;
  });

  set('data-vfp-old', el => {
    el.textContent = product.oldPrice;
    el.hidden = !product.oldPrice;
  });

  set('data-vfp-discount', el => {
    el.textContent = product.discount ? `-${product.discount}%` : '';
    el.hidden = !product.discount;
  });

  set('data-vfp-excerpt', el => {
    el.textContent = product.excerpt;
    el.hidden = !product.excerpt;
  });

  set('data-vfp-rating', el => {
    if (!product.rating) return;
    const stars = Math.round(product.rating.stars);
    el.innerHTML =
      `<span class="vfp__stars" aria-hidden="true">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 5 - stars))}</span>` +
      `<span class="vfp__rating-count">(${product.rating.count || 0})</span>`;
    el.hidden = false;
  });

  set('data-vfp-add', el => {
    el.setAttribute('product-id', product.id);
    el.setAttribute('product-status', product.status);
    el.setAttribute('product-type', product.type);
  });

  const thumbs = section.querySelector('[data-vfp-thumbs]');
  if (thumbs && product.images.length > 1) {
    thumbs.innerHTML = product.images
      .map((url, i) => `<button type="button" class="vfp__thumb${i === 0 ? ' is-active' : ''}" data-vfp-thumb="${url}"><img src="${url}" alt="" loading="lazy"></button>`)
      .join('');
    thumbs.hidden = false;

    thumbs.addEventListener('click', event => {
      const button = event.target.closest('[data-vfp-thumb]');
      if (!button) return;
      section.querySelectorAll('[data-vfp-image]').forEach(img => { img.src = button.dataset.vfpThumb; });
      thumbs.querySelectorAll('.vfp__thumb').forEach(b => b.classList.toggle('is-active', b === button));
    });
  }

  section.classList.add('is-loaded');
};

/* The countdown takes the merchant's date, or the product's own discount_ends
   when they asked for that — a date they never have to keep in sync. */
const startCountdown = (section, product) => {
  const box = section.querySelector('[data-vfp-countdown]');
  if (!box) return;

  let raw = (section.dataset.vfpCountdownDate || '').trim();
  if (!raw && section.dataset.vfpCountdownFallback === '1') raw = product.discountEnds || '';
  if (!raw) return;

  /* "2026-12-31 23:59" is not parsable by Safari; ISO with T is. */
  const end = new Date(raw.replace(' ', 'T')).getTime();
  if (!Number.isFinite(end)) return;

  const units = {
    days: box.querySelector('[data-vfp-days]'),
    hours: box.querySelector('[data-vfp-hours]'),
    minutes: box.querySelector('[data-vfp-minutes]'),
    seconds: box.querySelector('[data-vfp-seconds]'),
  };

  const tick = () => {
    const left = end - Date.now();

    if (left <= 0) {
      box.hidden = true;
      if (section.dataset.vfpCountdownHide === '1') section.hidden = true;
      clearInterval(timer);
      return;
    }

    const seconds = Math.floor(left / 1000);
    if (units.days) units.days.textContent = Math.floor(seconds / 86400);
    if (units.hours) units.hours.textContent = Math.floor((seconds % 86400) / 3600);
    if (units.minutes) units.minutes.textContent = Math.floor((seconds % 3600) / 60);
    if (units.seconds) units.seconds.textContent = seconds % 60;
    box.hidden = false;
  };

  tick();
  const timer = setInterval(tick, 1000);
};

/* The sticky bar is moved to <body>: position:fixed resolves against the
   nearest transformed ancestor, and home sections animate on scroll. */
const setupSticky = section => {
  const bar = section.querySelector('[data-vfp-sticky]');
  if (!bar || section.dataset.vfpStickyEnabled !== '1') return;

  document.body.appendChild(bar);
  bar.removeAttribute('aria-hidden');

  const card = section.querySelector('[data-vfp-card]');
  if (!card || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(([entry]) => {
    /* Visible only while the card is scrolled past, never while the buyer can
       already see the real button. */
    const passed = entry.boundingClientRect.top < 0 && !entry.isIntersecting;
    bar.hidden = !passed;
    bar.classList.toggle('is-visible', passed);
  }, { threshold: 0 }).observe(card);
};

const initSection = async section => {
  if (section.dataset.vfpReady === '1') return;
  section.dataset.vfpReady = '1';

  const product = await fetchProduct(section);

  if (!product) {
    section.hidden = true;
    return;
  }

  paint(section, product);
  startCountdown(section, product);
  setupSticky(section);
};

const initVelouraFeaturedProduct = () => {
  const sections = document.querySelectorAll(SELECTOR);
  if (!sections.length) return;
  sections.forEach(initSection);
};

/* Self-initialising as well as exported.

   home.js only runs its page class on 'index' and only after theme::ready, so
   relying on that alone would leave the section empty anywhere else the
   merchant places it, or if that event fires before this chunk is parsed.
   initSection marks the node, so being called twice costs nothing. */
const boot = () => {
  const run = () => initVelouraFeaturedProduct();
  if (window.salla?.onReady) salla.onReady(run); else run();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export default initVelouraFeaturedProduct;