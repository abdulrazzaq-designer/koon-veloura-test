import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
            productSku: '.product-sku',
        });

        this.initVelouraProductPageState();
        this.initVelouraDetailsOrder();
        this.initVelouraProductSliders();
        this.initVelouraProductThumbnails();
        this.initProductOptionValidations();
        this.initVelouraPurchaseButtons();
        this.initVelouraReadMore();

        /* Veloura V38 performance-safe zoom */ const velouraProductPage = document.querySelector('.veloura-product-page'); const velouraZoomControlled = Boolean(velouraProductPage && velouraProductPage.classList.contains('veloura-product-enabled')); const themeZoomEnabled = velouraZoomControlled ? velouraProductPage.classList.contains('veloura-product-zoom-enabled') : (typeof imageZoom !== 'undefined' && imageZoom); const velouraFinePointer = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches; if (themeZoomEnabled && velouraFinePointer && !this.__velouraZoomInitialized) { this.__velouraZoomInitialized = true; this.initImagesZooming(); }
    }

    initVelouraProductPageState() {
        const page = document.querySelector('.veloura-product-page');

        if (!page) {
            return;
        }

        document.documentElement.classList.add('veloura-is-product-page');
        document.body.classList.add('veloura-is-product-page');

        const rawSticky = page.getAttribute('data-veloura-sticky');
        const stickyEnabled =
            rawSticky === 'true' ||
            (rawSticky !== 'false' && page.classList.contains('veloura-product-mobile-sticky-enabled'));

        document.body.classList.toggle('veloura-sticky-enabled', stickyEnabled);
        document.body.classList.toggle('veloura-sticky-disabled', !stickyEnabled);
        document.body.classList.toggle('veloura-product-sticky-active', stickyEnabled);

        if (!stickyEnabled) {
            document.body.classList.remove('is-sticky-product-bar');
        }
    }

    initVelouraDetailsOrder() {
        const page = document.querySelector('.veloura-product-page');
        const main = page?.querySelector('.main-content');

        if (!page || !main) {
            return;
        }

        const attributes = {
            title: 'data-v42-order-title',
            price: 'data-v42-order-price',
            status: 'data-v42-order-status',
            description: 'data-v42-order-description',
            data: 'data-v42-order-data',
            extras: 'data-v42-order-extras',
            options: 'data-v42-order-options',
            quick: 'data-v42-order-quick',
            payments: 'data-v42-order-payments',
        };

        const nodes = Array.from(main.children).filter((node) => {
            if (!(node instanceof HTMLElement)) return false;
            const group = node.getAttribute('data-v42-group');
            return Boolean(group && attributes[group]);
        });

        if (!nodes.length) {
            return;
        }

        const enabled = page.getAttribute('data-v42-order-enabled') === 'true';

        const readOrder = (group) => {
            const value = Number(page.getAttribute(attributes[group]));
            if (!Number.isFinite(value)) return 10;
            return Math.max(1, Math.min(10, Math.round(value)));
        };

        /*
         * V99:
         * Never move the product form or any Salla Web Component in the DOM.
         * Detaching/re-attaching salla-product-options / salla-add-product-button
         * can re-run component lifecycle and desynchronize native cart/quick-buy
         * state. .main-content is a flex column, so CSS order is sufficient.
         */
        nodes.forEach((node, index) => {
            if (!node.hasAttribute('data-v42-original-index')) {
                node.setAttribute('data-v42-original-index', String(index));
            }

            if (enabled) {
                const group = node.getAttribute('data-v42-group');
                node.style.setProperty('order', String(readOrder(group)), 'important');
            } else {
                node.style.removeProperty('order');
            }
        });

        main.classList.toggle('veloura-details-order-enabled', enabled);
        page.dataset.velouraOrderApplied = enabled ? 'css-v99' : 'native';
    }

    initVelouraProductSliders() {
        const settings = window.velouraProductSliderSettings || {};

        const clamp = (value, min, max, fallback) => {
            const number = Number(value);
            if (!Number.isFinite(number)) return fallback;
            return Math.max(min, Math.min(max, Math.round(number)));
        };

        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const buildConfig = (mobile, desktop) => ({
            slidesPerView: mobile,
            slidesPerGroup: 1,
            spaceBetween: 12,
            watchOverflow: true,
            allowTouchMove: true,
            simulateTouch: true,
            grabCursor: true,
            breakpoints: {
                768: {
                    slidesPerView: desktop,
                    slidesPerGroup: 1,
                    spaceBetween: 16,
                },
            },
        });

        const injectShadowStyle = (root, id, css) => {
            if (!root || root.getElementById?.(id)) return;

            const style = document.createElement('style');
            style.id = id;
            style.textContent = css;
            root.appendChild(style);
        };

        const applyInnerSlider = async (inner, config, hideArrows, marker) => {
            if (!inner) return false;

            try {
                inner.sliderConfig = config;
                inner.slidesPerView = String(config.slidesPerView);
                inner.showControls = !hideArrows;
            } catch (_) {}

            inner.setAttribute('slider-config', JSON.stringify(config));
            inner.setAttribute('slides-per-view', String(config.slidesPerView));
            inner.setAttribute('show-controls', hideArrows ? 'false' : 'true');
            inner.dataset.velouraSliderMode = marker;

            try {
                if (typeof inner.componentOnReady === 'function') {
                    await inner.componentOnReady();
                }
            } catch (_) {}

            if (hideArrows && inner.shadowRoot) {
                injectShadowStyle(
                    inner.shadowRoot,
                    `veloura-${marker}-hide-controls`,
                    `
                    .s-slider-next,
                    .s-slider-prev,
                    .swiper-button-next,
                    .swiper-button-prev,
                    [part~="next"],
                    [part~="prev"] {
                      display: none !important;
                      opacity: 0 !important;
                      visibility: hidden !important;
                      pointer-events: none !important;
                    }
                    `
                );
            }

            try {
                await inner.updateSlides?.();
                await inner.updateSlidesClasses?.();
                await inner.update?.();
            } catch (_) {}

            return true;
        };

        const waitForInnerSlider = async (host, tries = 30) => {
            for (let i = 0; i < tries; i += 1) {
                const inner =
                    host?.querySelector?.('salla-slider') ||
                    host?.shadowRoot?.querySelector?.('salla-slider');

                if (inner) return inner;
                await sleep(80);
            }

            return null;
        };

        const applyProductsSlider = async (host, options = {}) => {
            if (!host || host.dataset.velouraSliderApplying === 'true') return;

            const mobile = clamp(options.mobile, 1, 3, 2);
            const desktop = clamp(options.desktop, 1, 6, 4);
            const hideArrows = Boolean(options.hideArrows);
            const config = buildConfig(mobile, desktop);
            const marker = options.marker || 'products';

            host.dataset.velouraSliderApplying = 'true';
            host.dataset.velouraSliderMode = marker;
            host.dataset.velouraSliderMobile = String(mobile);
            host.dataset.velouraSliderDesktop = String(desktop);
            host.dataset.velouraSliderHideArrows = hideArrows ? 'true' : 'false';

            try {
                /*
                 * Current Salla products-slider supports sliderConfig and passes
                 * it to its internal salla-slider. Set property + attribute so
                 * both initial and late component renders receive the config.
                 */
                try {
                    host.sliderConfig = config;
                } catch (_) {}

                host.setAttribute('slider-config', JSON.stringify(config));

                try {
                    if (typeof host.componentOnReady === 'function') {
                        await host.componentOnReady();
                    }
                } catch (_) {}

                let inner = await waitForInnerSlider(host);

                if (inner) {
                    await applyInnerSlider(inner, config, hideArrows, marker);
                }

                /*
                 * Products can render after the host reports ready. Observe only
                 * this host and re-apply when the internal slider is replaced.
                 */
                if (!host.__velouraSliderObserver && typeof MutationObserver === 'function') {
                    host.__velouraSliderObserver = new MutationObserver(async () => {
                        const nextInner =
                            host.querySelector?.('salla-slider') ||
                            host.shadowRoot?.querySelector?.('salla-slider');

                        if (nextInner && nextInner !== host.__velouraLastInnerSlider) {
                            host.__velouraLastInnerSlider = nextInner;
                            await applyInnerSlider(nextInner, config, hideArrows, marker);
                        }
                    });

                    host.__velouraSliderObserver.observe(host, {
                        childList: true,
                        subtree: true,
                    });
                }

                host.__velouraLastInnerSlider = inner;
            } finally {
                host.dataset.velouraSliderApplying = 'false';
            }
        };

        /* ==========================================================
         * 1) Products you may like
         * ========================================================== */
        const relatedSection = document.querySelector('[data-veloura-related-section]');
        const relatedHost = relatedSection?.querySelector(
            'salla-products-slider[data-veloura-related-slider]'
        );

        if (relatedSection && relatedHost) {
            const related = settings.related || {};
            const mobile = clamp(
                relatedSection.dataset.velouraRelatedMobile ?? related.mobileColumns,
                1,
                3,
                2
            );
            const desktop = clamp(
                relatedSection.dataset.velouraRelatedDesktop ?? related.desktopColumns,
                1,
                6,
                4
            );
            const hideArrows =
                relatedSection.dataset.velouraRelatedHideArrows === 'true' ||
                related.hideArrows === true;
            const centerTitle =
                relatedSection.dataset.velouraRelatedCenterTitle === 'true' ||
                related.centerTitle === true;

            relatedSection.classList.toggle('is-title-centered', centerTitle);
            relatedSection.classList.toggle('is-arrows-hidden', hideArrows);

            applyProductsSlider(relatedHost, {
                mobile,
                desktop,
                hideArrows,
                marker: 'related-v100',
            }).catch(() => {});
        }

        /* ==========================================================
         * 2) Recently viewed
         * ========================================================== */
        const recent = settings.recent || {};
        const recentHide = Boolean(recent.hide);
        const recentCustomize = Boolean(recent.customize);
        const recentMobile = clamp(recent.mobileColumns, 1, 3, 2);
        const recentDesktop = clamp(recent.desktopColumns, 1, 6, 4);
        const recentCenterTitle = Boolean(recent.centerTitle);

        const normalizeText = (value) =>
            String(value || '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

        const elementSignature = (element) => {
            if (!element || element.nodeType !== 1) return '';

            const attrs = [
                'id',
                'class',
                'block-title',
                'sub-title',
                'title',
                'aria-label',
                'data-title',
                'data-section-title',
                'data-testid',
            ];

            const parts = attrs.map((name) => element.getAttribute?.(name) || '');

            if (element.children?.length < 20) {
                parts.push(element.textContent || '');
            }

            return normalizeText(parts.join(' '));
        };

        const isRecentSignature = (value) => {
            const text = normalizeText(value);

            return (
                /شاهدتها\s*مؤخ/.test(text) ||
                /شوهدت\s*مؤخ/.test(text) ||
                /شاهدت.{0,16}مؤخ/.test(text) ||
                /recent(?:ly)?[\s_-]*viewed/.test(text) ||
                /recent[\s_-]*products/.test(text)
            );
        };

        const findRecentWrapper = (host) => {
            let node = host;

            for (let depth = 0; node && depth < 9; depth += 1) {
                if (isRecentSignature(elementSignature(node))) {
                    return node;
                }

                node = node.parentElement;
            }

            return host;
        };

        const isRecentHost = (host) => {
            if (!host || host.matches?.('[data-veloura-related-slider]')) return false;

            if (isRecentSignature(elementSignature(host))) return true;

            let node = host.parentElement;
            for (let depth = 0; node && depth < 8; depth += 1) {
                if (isRecentSignature(elementSignature(node))) return true;
                node = node.parentElement;
            }

            return false;
        };

        const centerRecentTitle = (wrapper) => {
            if (!wrapper || !recentCenterTitle) return;

            wrapper.classList?.add('veloura-recent-title-centered');

            wrapper
                .querySelectorAll?.(
                    'h1,h2,h3,h4,.s-block__title,.s-slider-block__title,[class*="title"]'
                )
                .forEach((title) => {
                    if (!isRecentSignature(elementSignature(title)) &&
                        !isRecentSignature(title.textContent)) {
                        return;
                    }

                    title.style.setProperty('width', '100%', 'important');
                    title.style.setProperty('text-align', 'center', 'important');
                    title.style.setProperty('justify-content', 'center', 'important');
                    title.style.setProperty('margin-inline', 'auto', 'important');
                });
        };

        const patchRecentHost = async (host) => {
            if (!isRecentHost(host)) return false;

            const wrapper = findRecentWrapper(host);
            host.dataset.velouraRecentDetected = 'true';
            wrapper?.classList?.add('veloura-recent-stable-section');

            if (recentHide) {
                (wrapper || host).style.setProperty('display', 'none', 'important');
                host.dataset.velouraRecentMode = 'hidden-v100';
                return true;
            }

            (wrapper || host).style.removeProperty('display');
            centerRecentTitle(wrapper || host);

            if (recentCustomize && host.tagName === 'SALLA-PRODUCTS-SLIDER') {
                await applyProductsSlider(host, {
                    mobile: recentMobile,
                    desktop: recentDesktop,
                    hideArrows: false,
                    marker: 'recent-v100',
                });
            }

            host.dataset.velouraRecentMode = recentCustomize
                ? 'custom-v100'
                : 'native-v100';

            return true;
        };

        const scanRecent = async (root = document) => {
            const hosts = Array.from(
                root.querySelectorAll?.('salla-products-slider,salla-products-list') || []
            );

            for (const host of hosts) {
                await patchRecentHost(host);
            }
        };

        scanRecent().catch(() => {});

        /*
         * Recently viewed can be injected after load. Observe the page and keep
         * the scan scoped to actual products components.
         */
        if (!window.__velouraRecentProductsObserver && typeof MutationObserver === 'function') {
            window.__velouraRecentProductsObserver = new MutationObserver((mutations) => {
                let shouldScan = false;

                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (!(node instanceof Element)) continue;

                        if (
                            node.matches?.('salla-products-slider,salla-products-list') ||
                            node.querySelector?.('salla-products-slider,salla-products-list')
                        ) {
                            shouldScan = true;
                            break;
                        }
                    }

                    if (shouldScan) break;
                }

                if (shouldScan) {
                    scanRecent().catch(() => {});
                }
            });

            window.__velouraRecentProductsObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        /*
         * Salla component hooks/events catch cases where the host existed before
         * its title/products were populated.
         */
        const registerHooks = () => {
            if (window.__velouraRecentProductsHooksRegistered) return;

            const api = window.Salla || window.salla;
            if (!api?.hooks?.registerHook) return;

            window.__velouraRecentProductsHooksRegistered = true;

            ['salla-products-slider', 'salla-products-list'].forEach((tagName) => {
                api.hooks.registerHook(tagName, 'componentDidLoad', () => {
                    scanRecent().catch(() => {});
                });
            });
        };

        if (window.salla?.onReady) {
            salla.onReady(registerHooks);
        } else {
            registerHooks();
        }

        document.addEventListener('salla-products-slider::products.fetched', () => {
            scanRecent().catch(() => {});
        });

        /*
         * Bounded retries only; enough for editor/late Salla hydration without
         * leaving a permanent timer.
         */
        [250, 700, 1400, 2600, 4200].forEach((delay) => {
            window.setTimeout(() => {
                scanRecent().catch(() => {});
            }, delay);
        });
    }

    initVelouraProductThumbnails() {
        const page = document.querySelector('.veloura-product-page');
        const slider = page?.querySelector('salla-slider.details-slider.image-slider');
        const nativeThumbs = slider?.querySelector(':scope > [slot="thumbs"]');

        if (!page || !slider || !nativeThumbs || slider.dataset.velouraV48ThumbsReady === '1') {
            return;
        }

        slider.dataset.velouraV48ThumbsReady = '1';
        slider.dataset.velouraV42ThumbsReady = '1';
        slider.dataset.velouraThumbsReady = '1';
        nativeThumbs.hidden = false;
        nativeThumbs.classList.remove('veloura-native-thumbs');
        nativeThumbs.classList.add('veloura-native-thumbs', 'veloura-scrollable-thumbs');

        slider.removeAttribute('vertical-thumbs');
        slider.removeAttribute('thumbs-position');
        slider.removeAttribute('data-veloura-thumbs-layout');

        const horizontalConfig = {
            direction: 'horizontal',
            slidesPerView: 'auto',
            spaceBetween: 12,
            watchSlidesProgress: true,
            slideToClickedSlide: true,
            allowTouchMove: true,
            freeMode: { enabled: true, sticky: false },
        };

        slider.setAttribute('thumbs-config', JSON.stringify(horizontalConfig));
        nativeThumbs.style.setProperty('display', 'flex', 'important');
        nativeThumbs.style.setProperty('flex-wrap', 'nowrap', 'important');
        nativeThumbs.style.setProperty('gap', '12px', 'important');
        nativeThumbs.style.setProperty('width', '100%', 'important');
        nativeThumbs.style.setProperty('max-width', '100%', 'important');
        nativeThumbs.style.setProperty('overflow-x', 'auto', 'important');
        nativeThumbs.style.setProperty('overflow-y', 'hidden', 'important');
        nativeThumbs.style.setProperty('touch-action', 'pan-x', 'important');
        nativeThumbs.style.setProperty('scroll-behavior', 'smooth', 'important');
        nativeThumbs.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
        Array.from(nativeThumbs.children).forEach((thumb) => {
            thumb.style.setProperty('flex', '0 0 auto', 'important');
            thumb.style.removeProperty('transform');
        });

        let pointerDown = false;
        let moved = false;
        let startX = 0;
        let startScroll = 0;
        nativeThumbs.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            pointerDown = true;
            moved = false;
            startX = event.clientX;
            startScroll = nativeThumbs.scrollLeft;
            try { nativeThumbs.setPointerCapture(event.pointerId); } catch (error) {}
        });
        nativeThumbs.addEventListener('pointermove', (event) => {
            if (!pointerDown) return;
            const delta = event.clientX - startX;
            if (Math.abs(delta) > 4) moved = true;
            if (moved) nativeThumbs.scrollLeft = startScroll - delta;
        });
        const release = () => { pointerDown = false; };
        nativeThumbs.addEventListener('pointerup', release);
        nativeThumbs.addEventListener('pointercancel', release);
        nativeThumbs.addEventListener('pointerleave', release);
        nativeThumbs.addEventListener('click', (event) => {
            if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
        }, true);

        const apply = () => {
            try {
                slider.verticalThumbs = false;
                slider.thumbsConfig = horizontalConfig;
                const root = slider.shadowRoot;
                const candidates = root ? root.querySelectorAll('.swiper, [class*="thumb"] .swiper, .swiper-thumbs') : [];
                candidates.forEach((node) => {
                    const swiper = node.swiper;
                    if (!swiper || !swiper.params) return;
                    swiper.allowTouchMove = true;
                    swiper.params.allowTouchMove = true;
                    swiper.params.watchOverflow = false;
                    swiper.params.slidesPerView = 'auto';
                    swiper.params.spaceBetween = 12;
                    swiper.params.freeMode = { enabled: true, sticky: false };
                    if (swiper.originalParams) {
                        swiper.originalParams.allowTouchMove = true;
                        swiper.originalParams.watchOverflow = false;
                        swiper.originalParams.slidesPerView = 'auto';
                        swiper.originalParams.spaceBetween = 12;
                        swiper.originalParams.freeMode = { enabled: true, sticky: false };
                    }
                    if (typeof swiper.update === 'function') swiper.update();
                });
            } catch (error) {
                console.warn('Veloura horizontal thumbnails recovery failed:', error);
            }
        };

        if (window.customElements?.whenDefined) {
            window.customElements.whenDefined('salla-slider').then(() => {
                apply();
                window.setTimeout(apply, 160);
                window.setTimeout(apply, 650);
            }).catch(apply);
        } else {
            apply();
        }
    }
    initProductOptionValidations() {
        document.querySelector('.product-form')?.addEventListener('change', function () {
            this.reportValidity() && salla.product.getPrice(new FormData(this));
        });
    }

    initImagesZooming() {
        const slider = document.querySelector('salla-slider.details-slider');

        if (!slider) {
            return;
        }

        const existingZoom = document.querySelector(
            '.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass'
        );

        if (window.innerWidth < 1024 || existingZoom) {
            return;
        }

        setTimeout(() => {
            const image = document.querySelector(
                '.image-slider .magnify-wrapper.swiper-slide-active img'
            );

            if (!image || !image.id) {
                return;
            }

            zoom(image.id, 2);
        }, 250);

        if (slider.dataset.velouraZoomReady === '1') {
            return;
        }

        slider.dataset.velouraZoomReady = '1';

        slider.addEventListener('slideChange', () => {
            setTimeout(() => {
                const existingZoom = document.querySelector(
                    '.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass'
                );

                if (window.innerWidth < 1024 || existingZoom) {
                    return;
                }

                const image = document.querySelector(
                    '.image-slider .magnify-wrapper.swiper-slide-active img'
                );

                if (!image || !image.id) {
                    return;
                }

                zoom(image.id, 2);
            }, 250);
        });
    }


    initVelouraPurchaseButtons() {
        const button = document.querySelector(
            '.veloura-product-page salla-add-product-button.sticky-product-bar__btn'
        );

        if (!button) return;

        /*
         * V99:
         * Salla owns Add to cart, Quick Buy / Buy now, validation and option
         * synchronization. Do not alter children, hidden state, display,
         * click handlers, or component properties here.
         */
        button.dataset.velouraPurchaseMode = 'native-v100';
    }

    initVelouraReadMore() {
        const button = document.querySelector('#btn-show-more');
        const content = document.querySelector('#more-content');

        if (!button || !content || button.dataset.velouraReadMoreReady === '1') {
            return;
        }

        button.dataset.velouraReadMoreReady = '1';

        const textNode = button.querySelector('.veloura-product-read-more__text');
        const moreText = button.dataset.moreText || 'عرض المزيد';
        const lessText = button.dataset.lessText || 'عرض أقل';
        const rootFontSize = parseFloat(
            window.getComputedStyle(document.documentElement).fontSize
        ) || 16;
        const collapsedHeight = 8.5 * rootFontSize;

        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 440ms cubic-bezier(.22, .61, .36, 1)';
        content.style.maxHeight = `${collapsedHeight}px`;

        const setButtonText = (expanded) => {
            if (textNode) {
                textNode.textContent = expanded ? lessText : moreText;
            } else {
                button.textContent = expanded ? lessText : moreText;
            }

            button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();

            const willExpand = !button.classList.contains('is-expanded');
            const currentHeight = content.getBoundingClientRect().height;

            content.style.maxHeight = `${currentHeight}px`;
            void content.offsetHeight;

            button.classList.toggle('is-expanded', willExpand);
            content.classList.toggle('is-expanded', willExpand);
            setButtonText(willExpand);

            window.requestAnimationFrame(() => {
                const targetHeight = willExpand
                    ? content.scrollHeight
                    : collapsedHeight;

                content.style.maxHeight = `${targetHeight}px`;
            });
        });

        content.addEventListener('transitionend', (event) => {
            if (event.propertyName !== 'max-height') {
                return;
            }

            if (button.classList.contains('is-expanded')) {
                content.style.maxHeight = `${content.scrollHeight}px`;
            }
        });

        window.addEventListener('resize', () => {
            content.style.maxHeight = button.classList.contains('is-expanded')
                ? `${content.scrollHeight}px`
                : `${collapsedHeight}px`;
        });
    }


    registerEvents() {
        salla.event.on('product::price.updated.failed', () => {
            document.querySelectorAll('.price-wrapper').forEach((el) => el.classList.add('hidden'));

            const outOfStock = app.element('.out-of-stock');

            if (!outOfStock) {
                return;
            }

            outOfStock.classList.remove('hidden');
            outOfStock.classList.remove('scale-pulse');

            void outOfStock.offsetWidth;

            outOfStock.classList.add('scale-pulse');
        });

        salla.product.event.onPriceUpdated((res) => {
            document.querySelectorAll('.out-of-stock').forEach((el) => el.classList.add('hidden'));
            document.querySelectorAll('.price-wrapper').forEach((el) => el.classList.remove('hidden'));

            const data = res.data;
            const price = Number(data.price || 0);
            const regularPrice = Number(data.regular_price || 0);
            const isOnSale = Boolean(data.has_sale_price || regularPrice > price) && regularPrice > price;

            app.startingPriceTitle?.classList.add('hidden');

            app.productWeight.forEach((el) => {
                el.innerHTML = data.weight || '';
            });

            app.totalPrice.forEach((el) => {
                el.innerHTML = salla.money(data.price);
            });

            app.beforePrice.forEach((el) => {
                el.innerHTML = salla.money(data.regular_price);
                el.classList.toggle('hidden', !isOnSale);
            });

            app.productSku.forEach((el) => {
                el.innerHTML = data.sku || '';
            });

    
            document.querySelectorAll('.total-price, .product-weight').forEach(el => {
                el.classList.remove('scale-pulse');
                void el.offsetWidth;
                el.classList.add('scale-pulse');
            });
        });


    }
}

Product.initiateWhenReady(['product.single']);
