import BasePage from './base-page';
import MobileMenu from 'mmenu-light';

class Products extends BasePage {
    onReady() {
        const productsList = app.element('salla-products-list');
        const productFilter = app.element('#product-filter');
        const urlParams = new URLSearchParams(window.location.search);

        if (productFilter && urlParams.has('sort')) {
            productFilter.value = urlParams.get('sort');
        }

        if (productFilter && productsList) {
            app.on('change', '#product-filter', async event => {
                window.history.replaceState(
                    null,
                    null,
                    salla.helpers.addParamToUrl('sort', event.currentTarget.value)
                );

                productsList.sortBy = event.currentTarget.value;
                await productsList.reload();
                productsList.setAttribute(
                    'filters',
                    `{"sort": "${event.currentTarget.value}"}`
                );
            });
        }

        this.initVelouraCategoryPage(productsList);
        this.initiateMobileMenu();
    }

    initVelouraCategoryPage(productsList) {
        const page = document.querySelector('.veloura-category-page');

        if (!page) {
            return;
        }

        const settings = window.velouraCategoryPageSettings || {};
        const title = document.querySelector('#page-main-title');

        const syncTitle = response => {
            if (!title) {
                return;
            }

            if (settings.hideProductCount && settings.categoryTitle) {
                title.textContent = settings.categoryTitle;
                return;
            }

            if (response?.title) {
                title.innerHTML = response.title;
            }
        };

        if (settings.hideProductCount && settings.categoryTitle) {
            syncTitle();
        }

        if (productsList && window.salla?.event?.on) {
            salla.event.on('salla-products-list::products.fetched', syncTitle);
        }

        this.applyVelouraCategoryMappedImages(page, settings);
        this.initVelouraCategoryCompactRail(page);
        this.syncVelouraCategoryHeaderMaterial(page);
        this.initVelouraCategorySearchCollapse(page);
        this.initVelouraCategorySticky(page, settings);
        this.initVelouraCategoryInlineSwitch(page, productsList, settings);
    }

    initVelouraCategorySearchCollapse(page) {
        const stack = document.querySelector('[data-veloura-header-tabs-stack]');
        const header = stack?.querySelector('.store-header.veloura-top-enabled') ||
            document.querySelector('.store-header.veloura-top-enabled');

        if (!header) {
            return;
        }

        let frame = 0;

        const update = () => {
            frame = 0;

            const isMobile = window.matchMedia('(max-width: 1023px)').matches;

            // Category pages intentionally reuse the existing "bar -> icon on
            // scroll" search behaviour even when the merchant selected the
            // always-visible bar. Icon-only modes are left untouched.
            const categoryBarMode = isMobile
                ? (
                    header.classList.contains('veloura-mobile-search-bar') ||
                    header.classList.contains('veloura-mobile-search-bar_sticky_icon')
                )
                : (
                    header.classList.contains('veloura-desktop-search-bar') ||
                    header.classList.contains('veloura-desktop-search-bar_sticky_icon')
                );

            const scrolled = Math.max(
                0,
                window.scrollY || window.pageYOffset || 0
            ) > 4;
            const collapsed = categoryBarMode && scrolled;

            document.body?.classList.toggle(
                'veloura-vcat-search-collapsed',
                collapsed
            );
            header.classList.toggle(
                'veloura-vcat-search-collapsed',
                collapsed
            );
            stack?.classList.toggle(
                'veloura-vcat-search-collapsed',
                collapsed
            );
            page.classList.toggle(
                'veloura-category-search-collapsed',
                collapsed
            );
        };

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(update);
        };

        update();

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        window.addEventListener('orientationchange', schedule, { passive: true });
        document.addEventListener('veloura:header:layout', schedule);
        document.addEventListener('veloura:header:state', schedule);
        document.addEventListener('veloura:header:position', schedule);

        page.__velouraCategorySearchCollapse = schedule;
    }

    syncVelouraCategoryHeaderMaterial(page) {
        const rail = page.querySelector('[data-veloura-category-children]');
        const stack = document.querySelector('[data-veloura-header-tabs-stack]');
        const surface = stack?.querySelector('.veloura-header-tabs-stack__surface');

        if (!rail || !surface) {
            return;
        }

        let frame = 0;

        const copyMaterial = () => {
            frame = 0;

            const style = window.getComputedStyle(surface);
            const backdrop =
                style.backdropFilter ||
                style.webkitBackdropFilter ||
                'none';

            // Copy the browser's FINAL header paint rather than rebuilding
            // it from guessed opacity values. The category keeps one edge
            // only; its old gradient + border + inset stack made the top and
            // bottom lines look visually thicker than the header.
            rail.style.setProperty(
                '--vcat-header-surface',
                style.backgroundColor || 'transparent'
            );
            rail.style.setProperty(
                '--vcat-header-backdrop-filter',
                backdrop
            );
            rail.style.setProperty(
                '--vcat-header-border-top-width',
                style.borderTopWidth || '0px'
            );
            rail.style.setProperty(
                '--vcat-header-border-top-style',
                style.borderTopStyle || 'solid'
            );
            rail.style.setProperty(
                '--vcat-header-border-top-color',
                style.borderTopColor || 'transparent'
            );
            rail.style.setProperty(
                '--vcat-header-border-bottom-width',
                style.borderBottomWidth || '0px'
            );
            rail.style.setProperty(
                '--vcat-header-border-bottom-style',
                style.borderBottomStyle || 'solid'
            );
            rail.style.setProperty(
                '--vcat-header-border-bottom-color',
                style.borderBottomColor || 'transparent'
            );
            rail.dataset.velouraHeaderMaterialSynced = 'true';
        };

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(copyMaterial);
        };

        copyMaterial();
        window.addEventListener('resize', schedule, { passive: true });
        window.addEventListener('orientationchange', schedule, { passive: true });
        document.addEventListener('veloura:header:layout', schedule);
        document.addEventListener('veloura:header:state', schedule);
        document.addEventListener('veloura:header:position', schedule);

        const classObserver = new MutationObserver(schedule);
        classObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style'],
        });

        if (document.body) {
            classObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['class', 'style'],
            });
        }

        page.__velouraCategoryHeaderMaterialObserver = classObserver;
        page.__velouraCategoryHeaderMaterialSync = schedule;
    }

    scrollVelouraCategoryTrackItem(item, behavior = 'auto') {
        const track = item?.closest(
            '.veloura-category-compact__track, .veloura-category-descendants__track'
        );

        if (!track || !item) {
            return;
        }

        requestAnimationFrame(() => {
            const trackRect = track.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const delta =
                ((itemRect.left + itemRect.right) / 2) -
                ((trackRect.left + trackRect.right) / 2);

            if (Math.abs(delta) < 2) {
                return;
            }

            track.scrollBy({
                left: delta,
                behavior,
            });
        });
    }

    initVelouraCategoryCompactRail(page) {
        const rail = page.querySelector('[data-veloura-category-children]');

        if (!rail || rail.querySelector('[data-veloura-category-compact]')) {
            return;
        }

        const sourceItems = Array.from(
            rail.querySelectorAll('[data-veloura-category-switch]')
        );

        if (!sourceItems.length) {
            return;
        }

        const compact = document.createElement('div');
        const track = document.createElement('div');

        compact.className = 'veloura-category-compact';
        compact.dataset.velouraCategoryCompact = '';
        compact.setAttribute('aria-label', 'التصنيفات الفرعية');

        track.className = 'veloura-category-compact__track';
        track.dataset.velouraCategoryCompactTrack = '';

        sourceItems.forEach(source => {
            const link = document.createElement('a');
            const sourceMedia = source.querySelector(
                '.veloura-category-child__media'
            );
            const sourceImage = sourceMedia?.querySelector('img');
            const sourceIcon = sourceMedia?.querySelector('i');
            const title = document.createElement('span');

            link.href = source.getAttribute('href') || '#';
            link.className = 'veloura-category-compact__item';
            link.dataset.velouraCategoryCompactSwitch = '';
            link.dataset.categoryId = source.dataset.categoryId || '';
            link.dataset.categoryName = source.dataset.categoryName || '';
            link.dataset.categoryUrl = source.dataset.categoryUrl || link.href;

            if (source.dataset.categoryRoot === 'true') {
                link.dataset.categoryRoot = 'true';
            }

            if (source.classList.contains('is-active')) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            }

            if (sourceMedia && (sourceImage || sourceIcon)) {
                const media = document.createElement('span');
                media.className = 'veloura-category-compact__media';

                if (sourceImage?.getAttribute('src')) {
                    const image = document.createElement('img');
                    image.src = sourceImage.getAttribute('src');
                    image.alt = sourceImage.getAttribute('alt') || '';
                    image.loading = 'lazy';
                    media.appendChild(image);
                } else if (sourceIcon) {
                    const icon = document.createElement('i');
                    icon.className = sourceIcon.className;
                    icon.setAttribute('aria-hidden', 'true');
                    media.appendChild(icon);
                }

                if (media.childElementCount) {
                    link.appendChild(media);
                }
            }

            title.className = 'veloura-category-compact__title';
            title.textContent =
                source.querySelector('.veloura-category-child__title')?.textContent?.trim() ||
                source.dataset.categoryName ||
                '';

            link.appendChild(title);
            track.appendChild(link);
        });

        compact.appendChild(track);

        const normalContent = rail.querySelector(
            '.veloura-category-children__slider, .veloura-category-children__grid'
        );

        rail.insertBefore(compact, normalContent || rail.firstChild);
    }

    initVelouraCategorySticky(page, settings) {
        const rail = page.querySelector('[data-veloura-category-children]');

        if (!rail) {
            return;
        }

        if (!settings.stickyChildren) {
            rail.classList.remove(
                'veloura-category-children--sticky',
                'is-stuck'
            );
            rail.style.removeProperty('--vcat-flow-compensation');
            page.style.removeProperty('--vcat-sticky-top');
            page.style.removeProperty('--vcat-sticky-height');
            return;
        }

        rail.classList.add('veloura-category-children--sticky');

        const stack = document.querySelector('[data-veloura-header-tabs-stack]');
        const storeHeader = stack?.querySelector('.store-header') ||
            document.querySelector('.store-header');
        const nav = storeHeader?.querySelector('#mainnav') ||
            document.querySelector('#mainnav');
        const navInner = nav?.querySelector('.inner') ||
            document.querySelector('#mainnav > .inner, #mainnav .inner');
        const surface = stack?.querySelector('.veloura-header-tabs-stack__surface');
        const detachedSearch = stack?.querySelector('[data-veloura-detached-search]');
        const fallbackHeader = storeHeader || document.querySelector('header');

        const headerLayers = [
            surface,
            navInner,
            detachedSearch,
            fallbackHeader,
        ].filter((element, index, all) => {
            return element && all.indexOf(element) === index;
        });

        let frame = 0;
        let naturalRailHeight = 0;

        const centerActiveCompactItem = () => {
            const active = rail.querySelector(
                '[data-veloura-category-compact-switch].is-active'
            );

            if (!active) {
                return;
            }

            this.scrollVelouraCategoryTrackItem(active, 'auto');
        };

        const isRendered = element => {
            if (!element || !element.isConnected) {
                return false;
            }

            const style = window.getComputedStyle(element);

            return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                Number.parseFloat(style.opacity || '1') > 0.01;
        };

        const visibleBottom = (element, viewportHeight) => {
            if (!isRendered(element)) {
                return 0;
            }

            const rect = element.getBoundingClientRect();

            // getBoundingClientRect already includes transforms used by the
            // floating / compact / hide-on-scroll header states.
            if (rect.bottom <= 0 || rect.top >= viewportHeight) {
                return 0;
            }

            return Math.min(viewportHeight, Math.max(0, rect.bottom));
        };

        const getVisibleHeaderBottom = () => {
            const viewportHeight = Math.max(
                1,
                window.innerHeight || document.documentElement.clientHeight || 1
            );
            const headerHidden = storeHeader?.classList.contains(
                'veloura-top-hidden'
            );
            let bottom = 0;

            if (!headerHidden) {
                const navInnerIsFixed = navInner &&
                    window.getComputedStyle(navInner).position === 'fixed';

                // This mirrors the header's own sticky-offset logic in app.js:
                // once #mainnav > .inner is fixed, its transformed rect is the
                // real visible surface. Measuring the outer <header>/<stack> at
                // that point reads the old document-flow box and causes the
                // category rail to slide behind the header.
                if (navInnerIsFixed) {
                    bottom = Math.max(
                        bottom,
                        visibleBottom(navInner, viewportHeight)
                    );
                } else {
                    bottom = Math.max(
                        bottom,
                        visibleBottom(surface || storeHeader, viewportHeight)
                    );
                }
            }

            // Detached search is a sibling of the header surface in the Veloura
            // stack. Count it only while it is actually visible in the viewport.
            bottom = Math.max(
                bottom,
                visibleBottom(detachedSearch, viewportHeight)
            );

            if (!bottom && !stack && !headerHidden) {
                bottom = visibleBottom(fallbackHeader, viewportHeight);
            }

            return bottom;
        };

        const update = () => {
            frame = 0;

            const headerBottom = getVisibleHeaderBottom();
            const gap = 8;
            const stickyTop = Math.ceil(headerBottom + gap);
            const railRectBefore = rail.getBoundingClientRect();
            const wasStuck = rail.classList.contains('is-stuck');
            const shouldBeStuck =
                Math.max(0, window.scrollY || window.pageYOffset || 0) > 0 &&
                railRectBefore.top <= stickyTop + 1;

            page.style.setProperty(
                '--vcat-sticky-top',
                `${stickyTop}px`
            );

            if (shouldBeStuck && !wasStuck) {
                naturalRailHeight = Math.ceil(railRectBefore.height);
            }

            rail.classList.toggle('is-stuck', shouldBeStuck);

            if (shouldBeStuck) {
                const compactHeight = Math.ceil(
                    rail.getBoundingClientRect().height
                );
                const compensation = Math.max(
                    0,
                    naturalRailHeight - compactHeight
                );

                rail.style.setProperty(
                    '--vcat-flow-compensation',
                    `${compensation}px`
                );

                if (!wasStuck) {
                    centerActiveCompactItem();
                }
            } else {
                naturalRailHeight = 0;
                rail.style.removeProperty('--vcat-flow-compensation');
            }

            page.style.setProperty(
                '--vcat-sticky-height',
                shouldBeStuck
                    ? `${Math.ceil(rail.getBoundingClientRect().height)}px`
                    : '0px'
            );
        };

        const schedule = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(update);
        };

        update();

        window.addEventListener('resize', schedule, { passive: true });
        window.addEventListener('orientationchange', schedule, { passive: true });
        window.addEventListener('scroll', schedule, { passive: true });

        // Veloura's header controller already emits these whenever its sticky,
        // compact, floating, hidden, or responsive layout changes.
        document.addEventListener('veloura:header:position', schedule);
        document.addEventListener('veloura:header:state', schedule);
        document.addEventListener('veloura:header:layout', schedule);

        if (stack) {
            stack.addEventListener('transitionend', schedule, true);
        }

        if (window.ResizeObserver) {
            const observer = new ResizeObserver(schedule);

            observer.observe(rail);
            headerLayers.forEach(element => observer.observe(element));

            if (stack && !headerLayers.includes(stack)) {
                observer.observe(stack);
            }

            rail.__velouraCategoryStickyObserver = observer;
        }

        if (window.MutationObserver && (stack || storeHeader || nav)) {
            const mutationObserver = new MutationObserver(schedule);
            const mutationRoot = stack || storeHeader || nav;

            mutationObserver.observe(mutationRoot, {
                attributes: true,
                childList: false,
                subtree: true,
                attributeFilter: ['class', 'style', 'hidden'],
            });

            rail.__velouraCategoryStickyMutationObserver = mutationObserver;
        }

        if (document.fonts?.ready) {
            document.fonts.ready.then(schedule).catch(() => {});
        }

        window.addEventListener('load', schedule, { once: true });
    }

    initVelouraCategoryInlineSwitch(page, productsList, settings) {
        if (!settings.inlineSwitch || !productsList) {
            return;
        }

        const rail = page.querySelector('[data-veloura-category-children]');
        const title = page.querySelector('#page-main-title');
        const filters = page.querySelector('#filters-menu');
        const descendantsHost = rail?.querySelector(
            '[data-veloura-category-descendants]'
        );
        const descendantsTrack = descendantsHost?.querySelector(
            '[data-veloura-category-descendants-track]'
        );

        if (!rail) {
            return;
        }

        const items = Array.from(
            rail.querySelectorAll('[data-veloura-category-switch]')
        );
        const compactItems = Array.from(
            rail.querySelectorAll('[data-veloura-category-compact-switch]')
        );

        if (!items.length) {
            return;
        }

        const root = settings.rootCategory || {
            id: rail.dataset.rootCategoryId,
            name: rail.dataset.rootCategoryName,
            url: rail.dataset.rootCategoryUrl,
        };

        let loading = false;
        let activeTitle = settings.categoryTitle || root.name || '';
        let activeTopItem = null;
        let menusPromise = null;
        const pageBranchCache = new Map();

        const asString = value => String(value ?? '').trim();

        const normalizeUrl = value => {
            const raw = asString(value);

            if (!raw) {
                return '';
            }

            try {
                const url = new URL(raw, window.location.origin);
                return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
            } catch (_) {
                return raw.split(/[?#]/)[0].replace(/\/+$/, '');
            }
        };

        const categoryIdFromUrl = value => {
            const normalized = normalizeUrl(value);
            const match = normalized.match(/\/c(\d+)(?:\/)?$/i) ||
                normalized.match(/\/c(\d+)(?:[/?#]|$)/i);

            return match ? match[1] : '';
        };

        const categoryIdFromMenu = menu => {
            // Category URLs in Salla carry the category id as /c123..., while
            // a generic menu.id may represent the menu record itself. Prefer
            // the URL / explicit category fields so products never load with a
            // navigation-item id by mistake.
            const urlId = categoryIdFromUrl(menu?.url);

            if (urlId) {
                return urlId;
            }

            const direct = menu?.category_id ?? menu?.categoryId;

            if (direct !== undefined && direct !== null && direct !== '') {
                return asString(direct);
            }

            const attrs = asString(menu?.attrs);
            const attrsMatch = attrs.match(
                /data-(?:category-)?id=["']?(\d+)/i
            );

            return attrsMatch ? attrsMatch[1] : '';
        };

        const itemById = id => {
            return items.find(item => {
                return asString(item.dataset.categoryId) === asString(id);
            }) || null;
        };

        const setTopActive = item => {
            activeTopItem = item || null;
            const activeId = asString(item?.dataset.categoryId);

            items.forEach(candidate => {
                const active = candidate === item;

                candidate.classList.toggle('is-active', active);

                if (active) {
                    candidate.setAttribute('aria-current', 'page');
                } else {
                    candidate.removeAttribute('aria-current');
                }
            });

            compactItems.forEach(candidate => {
                const active = activeId &&
                    asString(candidate.dataset.categoryId) === activeId;

                candidate.classList.toggle('is-active', active);

                if (active) {
                    candidate.setAttribute('aria-current', 'page');

                    if (rail.classList.contains('is-stuck')) {
                        this.scrollVelouraCategoryTrackItem(candidate, 'smooth');
                    }
                } else {
                    candidate.removeAttribute('aria-current');
                }
            });
        };

        const setDescendantActive = item => {
            if (!descendantsTrack) {
                return;
            }

            descendantsTrack
                .querySelectorAll('[data-veloura-category-descendant-switch]')
                .forEach(candidate => {
                    const active = candidate === item;

                    candidate.classList.toggle('is-active', active);

                    if (active) {
                        candidate.setAttribute('aria-current', 'page');

                        this.scrollVelouraCategoryTrackItem(candidate, 'smooth');
                    } else {
                        candidate.removeAttribute('aria-current');
                    }
                });
        };

        const setVisibleTitle = name => {
            activeTitle = name || root.name || activeTitle;

            if (title && activeTitle) {
                title.textContent = activeTitle;
            }
        };

        const updateUrl = (id, push, parentId = '') => {
            const url = new URL(window.location.href);
            const isRoot = asString(id) === asString(root.id);

            if (isRoot) {
                url.searchParams.delete('vcat');
                url.searchParams.delete('vparent');
            } else {
                url.searchParams.set('vcat', asString(id));

                if (parentId) {
                    url.searchParams.set('vparent', asString(parentId));
                } else {
                    url.searchParams.delete('vparent');
                }
            }

            const method = push ? 'pushState' : 'replaceState';

            window.history[method](
                {
                    velouraCategoryId: asString(id),
                    velouraParentCategoryId: asString(parentId),
                },
                '',
                `${url.pathname}${url.search}${url.hash}`
            );
        };

        const waitForComponent = async component => {
            if (component && typeof component.componentOnReady === 'function') {
                try {
                    await component.componentOnReady();
                } catch (_) {}
            }
        };

        const reloadProducts = async (id, name) => {
            await waitForComponent(productsList);

            productsList.source = 'categories';
            productsList.sourceValue = asString(id);

            productsList.setAttribute('source', 'categories');
            productsList.setAttribute('source-value', asString(id));

            if (typeof productsList.setFilters === 'function') {
                try {
                    await productsList.setFilters({});
                } catch (_) {}
            }

            if (filters && typeof filters.resetFilters === 'function') {
                try {
                    await filters.resetFilters();
                } catch (_) {}
            }

            if (typeof productsList.reload === 'function') {
                await productsList.reload();
            }

            page.dataset.velouraActiveCategoryId = asString(id);
            page.dataset.velouraActiveCategoryName = name || '';

            if (settings.hideProductCount) {
                setVisibleTitle(name);
            }
        };

        const hideDescendants = () => {
            if (!descendantsHost || !descendantsTrack) {
                return;
            }

            descendantsTrack.replaceChildren();
            descendantsHost.hidden = true;
            rail.classList.remove('has-descendants');
        };

        const loadMenus = async () => {
            if (menusPromise) {
                return menusPromise;
            }

            menusPromise = (async () => {
                const customMenu = document.querySelector('custom-main-menu');

                if (Array.isArray(customMenu?.menus) && customMenu.menus.length) {
                    return customMenu.menus;
                }

                const getMenus = window.salla?.api?.component?.getMenus;

                if (typeof getMenus !== 'function') {
                    return [];
                }

                try {
                    const response = await getMenus.call(window.salla.api.component);
                    return Array.isArray(response?.data) ? response.data : [];
                } catch (_) {
                    return [];
                }
            })();

            return menusPromise;
        };

        const walkMenus = (menus, callback) => {
            const list = Array.isArray(menus) ? menus : [];

            for (const menu of list) {
                if (callback(menu)) {
                    return menu;
                }

                const nested = walkMenus(menu?.children, callback);

                if (nested) {
                    return nested;
                }
            }

            return null;
        };

        const menuForTopItem = async item => {
            if (!item || item.dataset.categoryRoot === 'true') {
                return null;
            }

            const id = asString(item.dataset.categoryId);
            const targetUrl = normalizeUrl(item.dataset.categoryUrl || item.href);
            const menus = await loadMenus();

            return walkMenus(menus, menu => {
                const menuId = categoryIdFromMenu(menu);

                if (id && menuId && id === menuId) {
                    return true;
                }

                return targetUrl && normalizeUrl(menu?.url) === targetUrl;
            });
        };

        const resolveImageUrl = value => {
            if (!value) {
                return '';
            }

            if (typeof value === 'string') {
                return asString(value);
            }

            if (typeof value === 'object') {
                return asString(
                    value.url ??
                    value.src ??
                    value.original ??
                    value.medium ??
                    value.thumbnail
                );
            }

            return '';
        };

        const createDescendantLink = ({ id, url, name, image = '' }) => {
            if (!id || !name) {
                return null;
            }

            const link = document.createElement('a');
            const imageUrl = settings.showImages ? resolveImageUrl(image) : '';

            link.href = url || '#';
            link.className = 'veloura-category-descendant';
            link.dataset.velouraCategoryDescendantSwitch = '';
            link.dataset.categoryId = id;
            link.dataset.categoryName = name;
            link.dataset.categoryUrl = url;
            link.setAttribute('role', 'listitem');

            if (imageUrl) {
                const media = document.createElement('span');
                const imageElement = document.createElement('img');

                media.className = 'veloura-category-descendant__media';
                imageElement.src = imageUrl;
                imageElement.alt = '';
                imageElement.loading = 'lazy';
                media.appendChild(imageElement);
                link.appendChild(media);
            }

            const label = document.createElement('span');
            label.className = 'veloura-category-descendant__title';
            label.textContent = name;
            link.appendChild(label);

            return link;
        };

        const buildDescendantLink = menu => {
            const id = categoryIdFromMenu(menu);
            const url = asString(menu?.url);
            const name = asString(menu?.title ?? menu?.name);
            const image = menu?.image ?? menu?.thumbnail ?? menu?.avatar ?? '';

            return createDescendantLink({ id, url, name, image });
        };

        const templateDescendants = parentId => {
            const templates = Array.from(
                rail.querySelectorAll('[data-veloura-category-branch-template]')
            );
            const template = templates.find(candidate => {
                return asString(candidate.dataset.parentCategoryId) ===
                    asString(parentId);
            });

            if (!template) {
                return [];
            }

            return Array.from(
                template.content.querySelectorAll(
                    '[data-veloura-category-descendant-switch]'
                )
            ).map(link => link.cloneNode(true));
        };

        const pageDescendants = async parentItem => {
            const rawUrl = asString(
                parentItem?.dataset.categoryUrl || parentItem?.href
            );

            if (!rawUrl || typeof window.fetch !== 'function') {
                return [];
            }

            let url;

            try {
                url = new URL(rawUrl, window.location.origin);

                if (url.origin !== window.location.origin) {
                    return [];
                }
            } catch (_) {
                return [];
            }

            const key = normalizeUrl(url.href);

            if (!pageBranchCache.has(key)) {
                pageBranchCache.set(key, (async () => {
                    try {
                        const response = await window.fetch(url.href, {
                            credentials: 'same-origin',
                            headers: {
                                Accept: 'text/html',
                            },
                        });

                        if (!response.ok) {
                            return [];
                        }

                        const html = await response.text();
                        const documentCopy = new DOMParser().parseFromString(
                            html,
                            'text/html'
                        );
                        const sourceRail = documentCopy.querySelector(
                            '[data-veloura-category-children]'
                        );

                        if (!sourceRail) {
                            return [];
                        }

                        return Array.from(
                            sourceRail.querySelectorAll(
                                '[data-veloura-category-child]'
                            )
                        ).filter(card => {
                            return card.dataset.categoryRoot !== 'true' &&
                                asString(card.dataset.categoryId);
                        }).map(card => ({
                            id: asString(card.dataset.categoryId),
                            name: asString(card.dataset.categoryName) ||
                                asString(card.textContent),
                            url: asString(card.dataset.categoryUrl) ||
                                asString(card.getAttribute('href')),
                            image: asString(
                                card.querySelector(
                                    '[data-veloura-category-child-image]'
                                )?.getAttribute('src')
                            ),
                        }));
                    } catch (_) {
                        return [];
                    }
                })());
            }

            const children = await pageBranchCache.get(key);

            return children
                .map(child => createDescendantLink(child))
                .filter(Boolean);
        };

        const renderDescendants = async parentItem => {
            if (!descendantsHost || !descendantsTrack || !parentItem ||
                parentItem.dataset.categoryRoot === 'true') {
                hideDescendants();
                return [];
            }

            const parentId = asString(parentItem.dataset.categoryId);
            let links = templateDescendants(parentId);

            if (!links.length) {
                const menu = await menuForTopItem(parentItem);
                const children = Array.isArray(menu?.children) ? menu.children : [];

                links = children
                    .map(buildDescendantLink)
                    .filter(Boolean);
            }

            // A merchant can customize the header menu and omit a category.
            // In that case, fetch the selected category page itself and read its
            // server-rendered direct children instead of navigating the visitor.
            if (!links.length) {
                links = await pageDescendants(parentItem);
            }

            descendantsTrack.replaceChildren(...links);
            descendantsHost.hidden = links.length === 0;
            rail.classList.toggle('has-descendants', links.length > 0);

            return links;
        };

        const startLoading = () => {
            loading = true;
            rail.classList.add('is-loading');
            rail.setAttribute('aria-busy', 'true');
        };

        const stopLoading = () => {
            loading = false;
            rail.classList.remove('is-loading');
            rail.removeAttribute('aria-busy');
        };

        const switchTop = async (
            item,
            { push = true, descendantId = '', descendantName = '' } = {}
        ) => {
            if (!item || loading) {
                return;
            }

            const id = asString(item.dataset.categoryId);
            const name = item.dataset.categoryName || root.name || '';

            if (!id) {
                return;
            }

            startLoading();
            setTopActive(item);
            setVisibleTitle(descendantName || name);

            try {
                const descendantLinks = await renderDescendants(item);
                let targetId = id;
                let targetName = name;
                let descendantItem = null;

                if (descendantId) {
                    descendantItem = descendantLinks.find(link => {
                        return asString(link.dataset.categoryId) ===
                            asString(descendantId);
                    }) || null;

                    if (descendantItem) {
                        targetId = asString(descendantItem.dataset.categoryId);
                        targetName = descendantItem.dataset.categoryName || targetName;
                        setDescendantActive(descendantItem);
                    }
                }

                if (push) {
                    updateUrl(
                        targetId,
                        true,
                        descendantItem ? id : ''
                    );
                }

                setVisibleTitle(targetName);
                await reloadProducts(targetId, targetName);
            } finally {
                stopLoading();
            }
        };

        const switchDescendant = async (item, { push = true } = {}) => {
            if (!item || loading || !activeTopItem) {
                return;
            }

            const id = asString(item.dataset.categoryId);
            const name = item.dataset.categoryName || '';
            const parentId = asString(activeTopItem.dataset.categoryId);

            if (!id || !parentId) {
                return;
            }

            startLoading();
            setDescendantActive(item);
            setVisibleTitle(name);

            if (push) {
                updateUrl(id, true, parentId);
            }

            try {
                await reloadProducts(id, name);
            } finally {
                stopLoading();
            }
        };

        const findParentForDescendant = async descendantId => {
            for (const item of items) {
                if (item.dataset.categoryRoot === 'true') {
                    continue;
                }

                const parentId = asString(item.dataset.categoryId);
                const templateLinks = templateDescendants(parentId);

                if (templateLinks.some(link => {
                    return asString(link.dataset.categoryId) ===
                        asString(descendantId);
                })) {
                    return item;
                }
            }

            await loadMenus();

            for (const item of items) {
                if (item.dataset.categoryRoot === 'true') {
                    continue;
                }

                const menu = await menuForTopItem(item);
                const child = Array.isArray(menu?.children)
                    ? menu.children.find(candidate => {
                        return categoryIdFromMenu(candidate) === asString(descendantId);
                    })
                    : null;

                if (child) {
                    return item;
                }
            }

            return null;
        };

        rail.addEventListener('click', event => {
            const compactLink = event.target.closest(
                '[data-veloura-category-compact-switch]'
            );

            if (compactLink && rail.contains(compactLink)) {
                const sourceItem = itemById(compactLink.dataset.categoryId);

                if (!sourceItem) {
                    return;
                }

                event.preventDefault();
                switchTop(sourceItem, { push: true });
                return;
            }

            const link = event.target.closest('[data-veloura-category-switch]');

            if (!link || !rail.contains(link)) {
                return;
            }

            event.preventDefault();
            switchTop(link, { push: true });
        });

        descendantsTrack?.addEventListener('click', event => {
            const link = event.target.closest(
                '[data-veloura-category-descendant-switch]'
            );

            if (!link || !descendantsTrack.contains(link)) {
                return;
            }

            event.preventDefault();
            switchDescendant(link, { push: true });
        });

        const syncFromUrl = async () => {
            if (loading) {
                return;
            }

            const url = new URL(window.location.href);
            const id = asString(url.searchParams.get('vcat'));
            const parentId = asString(url.searchParams.get('vparent'));

            if (!id || id === asString(root.id)) {
                const rootItem = itemById(root.id);

                if (rootItem) {
                    await switchTop(rootItem, { push: false });
                } else {
                    setTopActive(null);
                    hideDescendants();
                    setVisibleTitle(root.name);

                    startLoading();
                    try {
                        await reloadProducts(root.id, root.name);
                    } finally {
                        stopLoading();
                    }
                }

                return;
            }

            const directTopItem = itemById(id);

            if (directTopItem) {
                await switchTop(directTopItem, { push: false });
                return;
            }

            let parentItem = parentId ? itemById(parentId) : null;

            if (!parentItem) {
                parentItem = await findParentForDescendant(id);
            }

            if (parentItem) {
                await switchTop(parentItem, {
                    push: false,
                    descendantId: id,
                });
            }
        };

        window.addEventListener('popstate', syncFromUrl);

        const initialUrl = new URL(window.location.href);
        const initialId = asString(initialUrl.searchParams.get('vcat'));
        const initialParentId = asString(initialUrl.searchParams.get('vparent'));

        if (initialId && initialId !== asString(root.id)) {
            const directTopItem = itemById(initialId);
            const initialParentItem = initialParentId
                ? itemById(initialParentId)
                : null;

            if (directTopItem) {
                switchTop(directTopItem, { push: false });
            } else if (initialParentItem) {
                switchTop(initialParentItem, {
                    push: false,
                    descendantId: initialId,
                });
            } else {
                findParentForDescendant(initialId).then(parentItem => {
                    if (parentItem) {
                        switchTop(parentItem, {
                            push: false,
                            descendantId: initialId,
                        });
                    }
                });
            }
        } else {
            const rootItem = itemById(root.id);

            if (rootItem) {
                setTopActive(rootItem);
            }

            hideDescendants();
        }

        if (settings.hideProductCount && window.salla?.event?.on) {
            salla.event.on(
                'salla-products-list::products.fetched',
                () => setVisibleTitle(activeTitle)
            );
        }
    }

    applyVelouraCategoryMappedImages(page, settings) {
        if (!settings.useCustomImages) {
            return;
        }

        const map = this.normalizeVelouraCollection(settings.imagesMap);
        const cards = page.querySelectorAll('[data-veloura-category-child]');

        if (!map.length || !cards.length) {
            return;
        }

        map.forEach(item => {
            const image = this.extractVelouraImageUrl(
                item?.veloura_map_image ||
                item?.image ||
                item?.img ||
                item?.photo ||
                ''
            );

            const categoryTokens = this.collectVelouraTokens(
                item?.veloura_map_categories ||
                item?.categories ||
                item?.category ||
                item?.selected ||
                item?.value ||
                []
            );

            if (!image || !categoryTokens.length) {
                return;
            }

            cards.forEach(card => {
                const cardTokens = this.collectVelouraTokens([
                    card.dataset.categoryId,
                    card.dataset.categoryName,
                    card.dataset.categoryUrl,
                    card.dataset.categorySlug,
                    card.getAttribute('href')
                ]);

                if (!this.velouraTokensMatch(cardTokens, categoryTokens)) {
                    return;
                }

                const img = card.querySelector(
                    '[data-veloura-category-child-image]'
                );

                if (img) {
                    img.src = image;
                    img.dataset.velouraMappedImage = 'true';
                }
            });
        });
    }

    normalizeVelouraCollection(collection) {
        if (!collection) return [];
        if (Array.isArray(collection)) return collection;

        if (typeof collection === 'object') {
            if (Array.isArray(collection.selected)) return collection.selected;
            if (Array.isArray(collection.value)) return collection.value;
            if (Array.isArray(collection.items)) return collection.items;
            if (Array.isArray(collection.data)) return collection.data;

            return Object.keys(collection).map(key => collection[key]);
        }

        return [];
    }

    extractVelouraImageUrl(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;

        if (Array.isArray(value)) {
            for (const item of value) {
                const found = this.extractVelouraImageUrl(item);
                if (found) return found;
            }

            return '';
        }

        if (typeof value === 'object') {
            return this.extractVelouraImageUrl(
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

    normalizeVelouraToken(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/[?#].*$/, '')
            .replace(/\/+$/, '');
    }

    collectVelouraTokens(value, tokens = []) {
        const add = raw => {
            const token = this.normalizeVelouraToken(raw);

            if (token && !tokens.includes(token)) {
                tokens.push(token);
            }
        };

        if (value === null || value === undefined) {
            return tokens;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            add(value);
            return tokens;
        }

        if (Array.isArray(value)) {
            value.forEach(item => this.collectVelouraTokens(item, tokens));
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
            ].forEach(prop => {
                if (value[prop] !== undefined) {
                    this.collectVelouraTokens(value[prop], tokens);
                }
            });
        }

        return tokens;
    }

    velouraTokensMatch(leftTokens, rightTokens) {
        return rightTokens.some(right => {
            return leftTokens.some(left => {
                if (!left || !right) return false;
                if (left === right) return true;

                if (left.length >= 2 && right.length >= 2) {
                    return left.includes(right) || right.includes(left);
                }

                return false;
            });
        });
    }

    initiateMobileMenu() {
        let filters = app.element('#filters-menu');
        const trigger = app.element("a[href='#filters-menu']");
        const close = app.element('button.close-filters');

        if (!filters || !trigger || !close) {
            return;
        }

        filters = new MobileMenu(
            filters,
            '(max-width: 1024px)',
            '( slidingSubmenus: false)'
        );

        const drawer = filters.offcanvas({
            position: salla.config.get('theme.is_rtl') ? 'right' : 'left'
        });

        const filterDrawerRoot = filters.closest('.mm-ocd');
        filterDrawerRoot?.classList.add('veloura-filters-drawer');
        filters.dataset.velouraDrawerRole = 'filters';
        window.__velouraFiltersDrawer = drawer;
        window.__velouraFiltersDrawerRoot = filterDrawerRoot;

        trigger.addEventListener('click', event => {
            event.preventDefault();

            // A single mmenu-light drawer may own the global scroll lock.
            // Close the side categories drawer before filters take ownership.
            try {
                window.__velouraCloseNativeMobileMenu?.();
            } catch (_) {}

            document.body.classList.add('filters-opened');
            drawer.open();
        });

        close.addEventListener('click', event => {
            document.body.classList.remove('filters-opened');
            event.preventDefault();
            drawer.close();
        });

        salla.event.on('salla-filters::changed', filtersValue => {
            if (!Object.entries(filtersValue).length) {
                return;
            }

            document.body.classList.remove('filters-opened');
            drawer.close();
        });
    }
}

Products.initiateWhenReady([
    'product.index',
    'product.index.latest',
    'product.index.offers',
    'product.index.search',
    'product.index.tag',
]);
