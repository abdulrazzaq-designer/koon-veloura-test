
/* Veloura Quick View - Phase 2
   - أيقونة بجانب المفضلة
   - أو زر تحت أضف للسلة
   - يحاول جلب تفاصيل المنتج عبر Salla SDK
   - يعتمد على بيانات الكارد كـ fallback
*/

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

    const position = config.buttonPosition || 'wishlist_icon';

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim();
    }

    function stripHtml(value) {
      const div = document.createElement('div');
      div.innerHTML = value || '';
      return cleanText(div.textContent || div.innerText || '');
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

      const price =
        root.querySelector('.s-product-card-sale-price') ||
        root.querySelector('.s-product-card-price') ||
        root.querySelector('.s-product-card-content-price') ||
        root.querySelector('[class*="price"]') ||
        root.querySelector('[class*="Price"]');

      const url = titleLink && titleLink.href ? titleLink.href : '#';

      return {
        id: getProductId(root, url),
        name: cleanText(titleLink && titleLink.textContent) || 'المنتج',
        url: url,
        image: image && (image.currentSrc || image.src) ? image.currentSrc || image.src : '',
        price: cleanText(price && price.textContent) || '',
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
        product.price ||
        product.sale_price ||
        product.regular_price ||
        product.formatted_price ||
        product.price_format ||
        '';

      const url = product.url || product.html_url || product.link || '';

      return {
        id: product.id || product.product_id || '',
        name: product.name || product.title || '',
        url: typeof url === 'string' ? url : '',
        image: typeof image === 'string' ? image : image && image.url ? image.url : '',
        price: typeof price === 'string' ? price : price && price.amount ? price.amount : '',
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
        } catch (error) {
          // نكمل تجربة صيغة ثانية
        }
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

    const price =
      jsonProduct &&
      jsonProduct.offers &&
      (jsonProduct.offers.price || jsonProduct.offers.lowPrice);

    return {
      name: cleanText(title),
      url: url,
      image: image || '',
      price: price ? cleanText(String(price)) : '',
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

      if (!cardData.id) {
        renderModal(cardData, false);
        return;
      }

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

      const showIcon = config.showIcon !== false && config.showIcon !== 'false';
      const iconClass = config.icon || 'sicon-eye';

      if (position === 'wishlist_icon') {
        button.classList.add('is-icon-only');
        button.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
      } else {
        button.classList.add('is-under-cart');
        button.innerHTML = `
          ${showIcon ? `<i class="${iconClass}" aria-hidden="true"></i>` : ''}
          <span>${config.buttonText || 'عرض سريع'}</span>
        `;
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        openModal(getProductData(card));
      });

      return button;
    }

    function findWishlistArea(root) {
      return (
        root.querySelector('.s-product-card-wishlist-btn') ||
        root.querySelector('[class*="wishlist"]') ||
        root.querySelector('[class*="Wishlist"]') ||
        root.querySelector('button[aria-label*="المفضلة"]') ||
        root.querySelector('button[aria-label*="مفضلة"]') ||
        root.querySelector('salla-button[aria-label*="المفضلة"]') ||
        null
      );
    }

    function injectButton(card) {
  const root = getCardRoot(card);

  if (!root || root.querySelector('.veloura-quick-view-btn')) {
    return;
  }

  const button = createButton(root);
  const imageBox = root.querySelector('.s-product-card-image');

  if (imageBox) {
    imageBox.classList.add('veloura-quick-view-image-host');
  }

  /**
   * الخيار الثاني:
   * زر تحت أضف للسلة
   */
  if (position === 'below_add_to_cart') {
    button.classList.remove('is-icon-only');
    button.classList.add('is-under-cart');

    const footer = root.querySelector('.s-product-card-content-footer');
    const addToCart = root.querySelector('salla-add-product-button');

    const target =
      footer ||
      (addToCart ? addToCart.closest('.s-product-card-content-footer') : null) ||
      addToCart;

    if (target && target.parentNode) {
      target.parentNode.insertBefore(button, target.nextSibling);
    } else {
      const content = root.querySelector('.s-product-card-content') || root;
      content.appendChild(button);
    }

    return;
  }

  /**
   * الخيار الأول:
   * أيقونة فقط بجانب زر المفضلة
   */
  button.classList.add('is-icon-only');

  if (imageBox) {
    imageBox.appendChild(button);
  } else {
    root.appendChild(button);
  }
}

    function scanCards() {
      document
        .querySelectorAll('product-card, .s-product-card-entry')
        .forEach(function (card) {
          injectButton(card);
        });
    }

    scanCards();

    const observer = new MutationObserver(scanCards);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();