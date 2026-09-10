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

/* Salla's description is HTML. It is read as text, never inserted as markup. */
const plain = value => text(value)
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

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
    /* The short subtitle if the merchant wrote one, otherwise the product's
       own description with its markup stripped — the strip is why the
       paragraph came out empty on the store: a list product carries a
       description full of tags and no `subtitle` at all. */
    excerpt: text(product.subtitle || product.promotion_title || plain(product.description) || '').trim(),
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
  /* innerHTML, not textContent: salla.money() returns MARKUP for currencies
     that have a glyph — SAR comes back as `<i class="sicon-sar"></i>`, which
     as text rendered the tag itself on the page. The string is Salla's own
     output, never anything a visitor typed. */
  set('data-vfp-price', el => { el.innerHTML = product.price; });

  set('data-vfp-image', el => {
    if (!product.image) return;
    el.src = product.image;
    el.alt = product.name;
  });

  set('data-vfp-old', el => {
    el.innerHTML = product.oldPrice;
    el.hidden = !product.oldPrice;
  });

  set('data-vfp-discount', el => {
    el.textContent = product.discount ? `خصم ${product.discount}%` : '';
    el.hidden = !product.discount;
  });

  paintExcerpt(section, product.excerpt);

  set('data-vfp-rating', el => {
    if (!product.rating) return;
    const stars = Math.round(product.rating.stars);
    el.innerHTML =
      `<span class="fp2__stars" aria-hidden="true">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 5 - stars))}</span>` +
      `<span class="fp2__rating-count">(${product.rating.count || 0})</span>`;
    el.hidden = false;
  });

  set('data-vfp-add', el => {
    el.setAttribute('product-id', product.id);
    el.setAttribute('product-status', product.status);
    el.setAttribute('product-type', product.type);
  });

  paintThumbs(section, product.images);
};

/* The gallery is a second request on purpose.

   salla.product.api.fetch is a LIST endpoint: every product it returns carries
   a single `image`, never the `images` array — which is why the thumbnail strip
   stayed empty on the store no matter what the setting said. The details
   endpoint is the one that has the gallery, so it is asked for separately,
   after the card is already painted, and its absence costs nothing. */
const loadGallery = async (section, product) => {
  const wantsThumbs = Boolean(section.querySelector('[data-vfp-thumbs]')) && product.images.length <= 1;
  const wantsText = Boolean(section.querySelector('[data-vfp-excerpt]')) && !product.excerpt;
  if (!wantsThumbs && !wantsText) return;

  try {
    const response = await salla.product.getDetails(product.id, ['images']);
    const details = response?.data || response;

    if (wantsThumbs) {
      const images = (details?.images || [])
        .filter(i => (i.type || 'image') === 'image')
        .map(imageUrl)
        .filter(Boolean)
        .slice(0, 8);

      if (images.length > 1) paintThumbs(section, images);
    }

    if (wantsText) {
      const description = plain(details?.description || details?.subtitle || '');
      if (description) paintExcerpt(section, description);
    }
  } catch (_) {}
};

/* Two lines under the name; "عرض المزيد" is a link to the product page, so
   there is nothing to measure or toggle here — only the text to fill in and the
   wrapper to reveal once there is one. */
const paintExcerpt = (section, description) => {
  const wrap = section.querySelector('[data-vfp-excerpt-wrap]');
  const paragraph = section.querySelector('[data-vfp-excerpt]');
  if (!wrap || !paragraph) return;

  paragraph.textContent = description || '';
  wrap.hidden = !description;
};

const paintThumbs = (section, images) => {
  const thumbs = section.querySelector('[data-vfp-thumbs]');
  const gallery = section.querySelector('[data-vfp-gallery]');

  if (thumbs && images.length > 1) {
    if (gallery) gallery.hidden = false;
    thumbs.innerHTML = images
      .map((url, i) => `<button type="button" class="fp2__thumb${i === 0 ? ' is-active' : ''}" data-vfp-thumb="${url}"><img src="${url}" alt="" loading="lazy"></button>`)
      .join('');
    thumbs.hidden = false;

    thumbs.addEventListener('click', event => {
      /* A drag ends in a click; ignore that one. */
      if (thumbs.dataset.vfpDragged === '1') { thumbs.dataset.vfpDragged = '0'; return; }

      /* elementFromPoint as well as the event's own target: while a pointer is
         captured the click is delivered to the scroller rather than to the
         thumbnail under the cursor, which is what left the desktop strip stuck
         on the first picture. */
      const button = event.target.closest('[data-vfp-thumb]')
        || document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-vfp-thumb]');
      if (!button) return;
      section.querySelectorAll('[data-vfp-image]').forEach(img => { img.src = button.dataset.vfpThumb; });
      thumbs.querySelectorAll('.fp2__thumb').forEach(b => b.classList.toggle('is-active', b === button));
    }, { once: false });

    /* Moving the strip.

       Direction first: scrollLeft counts DOWN from zero in a right-to-left
       scroller, so "towards the end" is a negative delta there and a positive
       one in English — reading it off the computed direction is what makes the
       forward arrow do anything at all instead of clamping at zero.

       Then the arrows are only offered while there is something to reach, and
       the strip can be dragged and flicked as well, which is what a visitor
       tries first on a row of pictures. */
    const prev = section.querySelector('[data-vfp-thumb-prev]');
    const next = section.querySelector('[data-vfp-thumb-next]');

    const horizontal = () => getComputedStyle(thumbs).flexDirection.indexOf('row') === 0;

    /* Which way scrollLeft counts is measured, not assumed: browsers have
       disagreed about right-to-left scrollers, and guessing wrong is exactly
       how one arrow ends up doing nothing while the other works. The probe
       moves the strip by a pixel and puts it back before anything is painted. */
    let endSign = 0;
    const towardsEnd = () => {
      if (endSign) return endSign;
      if (getComputedStyle(thumbs).direction !== 'rtl') return (endSign = 1);
      /* Smooth scrolling animates an assignment, so the read-back would be the
         old value and the probe would answer wrongly; it is switched off for
         the two lines it takes. */
      const was = thumbs.scrollLeft;
      const behavior = thumbs.style.scrollBehavior;
      thumbs.style.scrollBehavior = 'auto';
      thumbs.scrollLeft = -1;
      endSign = thumbs.scrollLeft < 0 ? -1 : 1;
      thumbs.scrollLeft = was;
      thumbs.style.scrollBehavior = behavior;
      return endSign;
    };

    const step = () => {
      const first = thumbs.querySelector('.fp2__thumb');
      const box = first && first.getBoundingClientRect();
      return (box ? (horizontal() ? box.width : box.height) : 80) + 8;
    };

    /* sign: -1 walks back towards the first thumbnail (the right-hand arrow in
       Arabic), +1 walks on towards the last (the left-hand one), which moves
       the pictures the other way — press left, the row travels right. */
    const scrollStrip = sign => {
      thumbs.scrollBy(horizontal()
        ? { left: sign * step() * towardsEnd(), behavior: 'smooth' }
        : { top: sign * step(), behavior: 'smooth' });
    };

    const sync = () => {
      const room = horizontal()
        ? thumbs.scrollWidth - thumbs.clientWidth
        : thumbs.scrollHeight - thumbs.clientHeight;
      const at = horizontal() ? Math.abs(thumbs.scrollLeft) : thumbs.scrollTop;
      if (prev) prev.disabled = at <= 1;
      if (next) next.disabled = at >= room - 1;
    };

    prev?.addEventListener('click', () => scrollStrip(-1));
    next?.addEventListener('click', () => scrollStrip(1));
    thumbs.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    requestAnimationFrame(sync);

    /* Drag to scroll. The pointer is captured only once the cursor has actually
       travelled: capturing on pointerdown would send every following click to
       this element, and a plain click on a thumbnail would never reach it. */
    let down = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    thumbs.addEventListener('pointerdown', event => {
      if (!horizontal() || event.button !== 0) return;
      down = true;
      dragged = false;
      startX = event.clientX;
      startScroll = thumbs.scrollLeft;
    });

    thumbs.addEventListener('pointermove', event => {
      if (!down) return;
      const moved = event.clientX - startX;
      if (!dragged && Math.abs(moved) < 5) return;

      if (!dragged) {
        dragged = true;
        thumbs.classList.add('is-dragging');
        try { thumbs.setPointerCapture(event.pointerId); } catch (_) {}
      }

      thumbs.scrollLeft = startScroll - moved;
    });

    const endDrag = event => {
      if (!down) return;
      down = false;
      if (!dragged) return;
      thumbs.dataset.vfpDragged = '1';
      thumbs.classList.remove('is-dragging');
      try { thumbs.releasePointerCapture(event.pointerId); } catch (_) {}
    };

    thumbs.addEventListener('pointerup', endDrag);
    thumbs.addEventListener('pointercancel', endDrag);
  }
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
  section.classList.add('is-loaded');
  startCountdown(section, product);
  setupSticky(section);
  loadGallery(section, product);
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