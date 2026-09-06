class NavigationMenu extends HTMLElement {
    connectedCallback() {
        // Whether category images appear beside category names in the desktop
        // dropdown. Read from the attribute header.twig writes, because this
        // element renders itself from JS and never sees the Twig context.
        // Read once here, before any render, so every code path agrees.
        this.showMenuIcons = this.getAttribute('data-veloura-menu-icons') === 'true';

        // Seed a skeleton placeholder shown until the menu data is fetched
        // and render() replaces this innerHTML with the real menu.
        this.innerHTML = `
            <div class="main-menu-skel" aria-hidden="true">
                <span class="header-skel-item header-skel-item--menu" style="width:80px"></span>
                <span class="header-skel-item header-skel-item--menu" style="width:60px"></span>
                <span class="header-skel-item header-skel-item--menu" style="width:90px"></span>
                <span class="header-skel-item header-skel-item--menu" style="width:70px"></span>
                <span class="header-skel-item header-skel-item--menu" style="width:80px"></span>
            </div>`;

        salla.onReady()
            .then(() => salla.lang.onLoaded())
            .then(() => {
                this.menus = [];
                this.displayAllText = salla.lang.get('blocks.home.display_all');
                this.moreText = salla.lang.get('common.titles.more');
                this.visibleMenus = [];
                this.overflowMenus = [];

                return this.fetchMenusWithRetry();
            })
            .then((data) => {
                this.menus = Array.isArray(data) ? data : [];
                this.render();
                this.initializeResponsiveMenu();
            })
            .catch((error) => {
                salla.logger.error('salla-menu::Error fetching menus after retry', error);
                this.renderUnavailableState();
            });
    }

    /**
     * Fetch the menu with a bounded retry. Preview/hydration can expose the
     * component a few milliseconds before the menu endpoint is ready. This
     * retries only twice and never creates a background polling loop.
     * @param {Number} attempt
     * @returns {Promise<Array>}
     */
    fetchMenusWithRetry(attempt = 0) {
        return salla.api.component.getMenus()
            .then(({ data }) => Array.isArray(data) ? data : [])
            .catch((error) => {
                if (attempt >= 2) throw error;
                const delay = attempt === 0 ? 450 : 1100;
                return new Promise(resolve => setTimeout(resolve, delay))
                    .then(() => this.fetchMenusWithRetry(attempt + 1));
            });
    }

    /** 
    * Check if the menu has children
    * @param {Object} menu
    * @returns {Boolean}
    */
    hasChildren(menu) {
        return menu?.children?.length > 0;
    }

    /**
    * Check if the menu has products
    * @param {Object} menu
    * @returns {Boolean}
    */
    hasProducts(menu) {
        return menu?.products?.length > 0;
    }

    /**
    * Get the classes for desktop menu
    * @param {Object} menu
    * @param {Boolean} isRootMenu
    * @returns {String}
    */
    getDesktopClasses(menu, isRootMenu) {
        return `${isRootMenu ? 'root-level' : 'relative'} ${menu.products ? ' mega-menu' : ''}
        ${this.hasChildren(menu) ? ' has-children' : ''}`
    }

    /**
    * Get the mobile menu
    * @param {Object} menu
    * @param {String} displayAllText
    * @returns {String}
    */
    getMobileMenu(menu, displayAllText) {
        const menuImage = menu.image ? `<img src="${menu.image}" class="rounded-full" width="48" height="48" alt="${menu.title}" />` : '';

        return `
        <li class="text-sm font-bold veloura-mobile-menu-item" ${menu.attrs}>
            ${!this.hasChildren(menu) ? `
                <a href="${menu.url}" aria-label="${menu.title || 'category'}" class="text-gray-500 ${menu.image ? '!py-3' : ''}" ${menu.link_attrs}>
                    ${menuImage}
                    <span>${menu.title || ''}</span>
                </a>` :
                `
                <span class="${menu.image ? '!py-3' : ''}">
                    ${menuImage}
                    ${menu.title}
                </span>
                <ul>
                    <li class="text-sm font-bold">
                        <a href="${menu.url}" class="text-gray-500">${displayAllText}</a>
                    </li>
                    ${menu.children.map((subMenu) => this.getMobileMenu(subMenu, displayAllText)).join('')}
                </ul>
            `}
        </li>`;
    }

    /**
    * Get the desktop menu
    * @param {Object} menu
    * @param {Boolean} isRootMenu
    * @param {String} additionalClasses
    * @returns {String}
    */
    /**
    * How many columns a dropdown should use.
    *
    * A single column is right until the list gets long. Past that it runs off
    * the bottom of the screen with no scroll, so the only way to reach the last
    * category is to scroll the whole page — the "40 categories" problem.
    *
    * Columns beat an inner scrollbar here: nothing is hidden behind a gesture,
    * and the eye scans columns faster than it scrolls. Only past 30 items is a
    * height cap plus internal scrolling added on top (see the stylesheet).
    */
    getSubmenuColumns(menu) {
        const n = (menu.children || []).length;
        if (n <= 12) return 1;
        if (n <= 20) return 2;
        return 3;
    }

    /**
    * The category image, for the desktop dropdown.
    *
    * This is Salla's own category image — the same menu.image the mobile menu
    * has always rendered — so nothing extra is uploaded and there is no second
    * list for a merchant to keep in sync.
    *
    * Fixed HEIGHT, automatic width: a tall image shrinks to fit the row instead
    * of stretching it, and a square one stays square. Fixing both dimensions
    * would distort every image that is not already square.
    */
    /**
    * Where a category icon actually comes from.
    *
    * There are TWO separate image systems in this theme and they are easy to
    * confuse — this method reading the wrong one is why the icons never
    * appeared even with the setting switched on:
    *
    *   1. menu.image
    *      Salla's own category image, set in the dashboard's category screen.
    *      Empty on most stores, because most merchants never set it.
    *
    *   2. veloura_category_images_map_v7_2026
    *      The theme's own "صور التصنيفات المرتبطة": upload an image, pick the
    *      categories it belongs to. This is where merchants actually put their
    *      images, and it is what the side menu already uses.
    *
    * The map is handed to the browser by master.twig as
    * window.velouraSideCategoriesSettings.categoryImagesMap, so nothing new
    * has to be passed in. The map wins when it has an entry; menu.image is the
    * fallback, so a store that only uses Salla's images still works.
    *
    * Matching mirrors what app.js already does for the side menu: compare
    * normalised tokens (id, name, title, slug) rather than one fixed field,
    * because the picker stores different shapes depending on how it was set.
    */
    getMappedCategoryImage(menu) {
        if (this._catImageMap === undefined) {
            var settings = window.velouraSideCategoriesSettings || {};
            var raw = settings.categoryImagesMap;
            if (raw && !Array.isArray(raw) && typeof raw === 'object') {
                raw = raw.value || raw.selected || Object.values(raw);
            }
            this._catImageMap = Array.isArray(raw) ? raw : [];
        }
        if (!this._catImageMap.length) return '';

        var norm = function (v) {
            if (v === null || v === undefined) return '';
            return String(typeof v === 'object' ? (v.label || v.name || v.title || v.value || v.id || '') : v)
                .trim().toLowerCase();
        };
        var tokensOf = function (v, out) {
            out = out || [];
            if (v === null || v === undefined) return out;
            if (Array.isArray(v)) { v.forEach(function (x) { tokensOf(x, out); }); return out; }
            var k = norm(v);
            if (k && out.indexOf(k) === -1) out.push(k);
            if (typeof v === 'object') {
                ['id', 'value', 'name', 'label', 'title', 'slug'].forEach(function (f) {
                    var t = norm(v[f]);
                    if (t && out.indexOf(t) === -1) out.push(t);
                });
            }
            return out;
        };

        var mine = tokensOf([menu.id, menu.title, menu.name, menu.slug]);
        if (!mine.length) return '';

        for (var i = 0; i < this._catImageMap.length; i++) {
            var entry = this._catImageMap[i] || {};
            var img = entry.veloura_map_image || entry.image || entry.img || '';
            if (img && typeof img === 'object') img = img.url || img.src || img.path || img.value || '';
            if (!img) continue;

            var theirs = tokensOf(entry.veloura_map_categories || entry.categories || entry.category || []);
            for (var j = 0; j < theirs.length; j++) {
                for (var k2 = 0; k2 < mine.length; k2++) {
                    if (theirs[j] === mine[k2]) return img;
                }
            }
        }
        return '';
    }

    getDesktopIcon(menu) {
        if (!this.showMenuIcons) return '';
        var src = this.getMappedCategoryImage(menu) || menu.image;
        if (!src) return '';
        return `<img src="${src}" class="veloura-menu-icon" alt="" aria-hidden="true" loading="lazy" />`;
    }

    getDesktopMenu(menu, isRootMenu, additionalClasses = '') {
        const cols = this.hasChildren(menu) ? this.getSubmenuColumns(menu) : 1;
        return `
        <li class="${this.getDesktopClasses(menu, isRootMenu)} ${additionalClasses}" ${menu.attrs} data-menu-item>
            <a href="${menu.url}" aria-label="${menu.title || 'category'}" ${menu.link_attrs}>
                ${this.getDesktopIcon(menu)}
                <span>${menu.title}</span>
            </a>
            ${this.hasChildren(menu) ? `
                <div class="sub-menu veloura-submenu-surface ${this.hasProducts(menu) ? 'w-full left-0 flex' : 'w-56'} veloura-submenu--cols-${cols}" data-veloura-count="${(menu.children || []).length}">
                    <ul class="${this.hasProducts(menu) ? 'w-56 shrink-0 m-8 rtl:ml-0 ltr:mr-0' : ''}">
                        ${menu.children.map((subMenu) => this.getDesktopMenu(subMenu, false)).join('\n')}
                    </ul>
                    ${this.hasProducts(menu) ? `
                    <salla-products-list
                    source="selected"
                    shadow-on-hover
                    source-value="[${menu.products}]" />` : ''}
                </div>` : ''}
        </li>`;
    }

    /**
    * Get the menus
    * @returns {String}
    */
    getMenus() {
        return this.menus.map((menu) => `
            ${this.getMobileMenu(menu, this.displayAllText)}
            ${this.getDesktopMenu(menu, true)}
        `).join('\n');
    }

    getDesktopMenus() {
        return this.menus.map((menu) => this.getDesktopMenu(menu, true)).join('\n');
    }

    getMobileMenus() {
        return this.menus.map((menu) => this.getMobileMenu(menu, this.displayAllText)).join('\n');
    }

    /**
    * Create More dropdown menu
    * @returns {String}
    */
    createMoreDropdown() {
        if (this.overflowMenus.length === 0) return '';

        return `
        <li class="!hidden lg:!block root-level lg:!inline-block has-children relative" id="more-menu-dropdown">
            <a href="#" aria-label="${this.moreText}">
                <span>${this.moreText}</span>
            </a>
            <div class="sub-menu veloura-submenu-surface w-56">
                <ul>
                    ${this.overflowMenus.map((menu) => this.getDesktopMenu(menu, false)).join('\n')}
                </ul>
            </div>
        </li>`;
    }

    /*
    * Initialize responsive menu functionality
    */
    initializeResponsiveMenu() {
        const mainMenu = this.querySelector('.veloura-main-menu-desktop');
        if (!mainMenu) return;

        this.dataset.velouraMenuReady = 'true';

        const parseBoolean = (value, fallback = false) => {
            if (value === undefined || value === null || value === '') return fallback;
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value === 1;
            return ['true', '1', 'on', 'yes'].includes(String(value).trim().toLowerCase());
        };

        this._velouraMoreMenuEnabled = parseBoolean(window.enable_more_menu, true);
        const host = this.closest('.veloura-menu-links-wrap');
        host?.classList.toggle('veloura-menu-more-enabled', this._velouraMoreMenuEnabled);
        host?.classList.toggle('veloura-menu-more-disabled', !this._velouraMoreMenuEnabled);

        const update = () => {
            if (window.innerWidth < 1024) return;
            this.checkMenuOverflow();
        };

        // Run after the browser has calculated the dedicated menu row width.
        requestAnimationFrame(() => requestAnimationFrame(update));
        document.fonts?.ready?.then(update).catch(() => {});

        const resizeHandler = this.debounce(update, 180);
        window.addEventListener('resize', resizeHandler, { passive: true });

        this._velouraResizeHandler = resizeHandler;

        requestAnimationFrame(() => {
            document.dispatchEvent(new CustomEvent('veloura:menu:ready', {
                detail: { menu: this }
            }));
        });
    }

    /**
    * Check if menu items overflow and move them to More dropdown
    */
    checkMenuOverflow() {
        const mainMenu = this.querySelector('.veloura-main-menu-desktop');
        const host = this.closest('.veloura-menu-links-wrap') || this;

        if (!mainMenu || !host) return;

        const existingMore = mainMenu.querySelector('#more-menu-dropdown');
        if (existingMore) existingMore.remove();

        const menuItems = Array.from(
            mainMenu.querySelectorAll(':scope > .root-level[data-menu-item]')
        );

        menuItems.forEach(item => {
            item.style.removeProperty('display');
            item.hidden = false;
        });

        this.visibleMenus = [...this.menus];
        this.overflowMenus = [];

        // The links mode has a dedicated full-width row. If "More" is disabled,
        // keep every category visible and let the row scroll only when necessary.
        if (!this._velouraMoreMenuEnabled) {
            return;
        }

        const availableWidth = Math.floor(host.getBoundingClientRect().width || 0);

        // During the first hydration frame the row may still report zero width.
        // Never hide categories in that state.
        if (availableWidth < 160) {
            return;
        }

        const moreReserve = 92;
        let usedWidth = 0;
        let visibleCount = 0;

        menuItems.forEach((item, index) => {
            const itemWidth = Math.ceil(item.getBoundingClientRect().width || item.scrollWidth || 0);
            const reserve = index < menuItems.length - 1 ? moreReserve : 0;

            if (usedWidth + itemWidth + reserve <= availableWidth) {
                usedWidth += itemWidth;
                visibleCount += 1;
                return;
            }

            item.style.setProperty('display', 'none', 'important');

            if (index < this.menus.length) {
                this.overflowMenus.push(this.menus[index]);
            }
        });

        this.visibleMenus = this.menus.slice(0, visibleCount);

        if (this.overflowMenus.length > 0) {
            mainMenu.insertAdjacentHTML('beforeend', this.createMoreDropdown());
        }
    }

    /**
    * Debounce function to limit resize event calls
    * @param {Function} func
    * @param {Number} wait
    * @returns {Function}
    */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    disconnectedCallback() {
        if (this._velouraResizeHandler) {
            window.removeEventListener('resize', this._velouraResizeHandler);
            this._velouraResizeHandler = null;
        }
    }

    /**
    * Render the header menu
    */
    render() {
        this.innerHTML = `
        <nav class="veloura-desktop-main-menu" aria-label="${this.displayAllText || ''}">
            <ul class="main-menu veloura-main-menu-desktop">${this.getDesktopMenus()}</ul>
        </nav>
        <nav id="mobile-menu" class="mobile-menu veloura-mobile-main-menu">
            <ul class="main-menu veloura-main-menu-mobile">${this.getMobileMenus()}</ul>
            <button class="btn--close close-mobile-menu sicon-cancel" aria-label="close"></button>
        </nav>
        <button class="btn--close-sm close-mobile-menu sicon-cancel hidden"></button>`;
    }

    renderUnavailableState() {
        this.innerHTML = `
        <nav class="veloura-desktop-main-menu" aria-label="menu">
            <ul class="main-menu veloura-main-menu-desktop">
                <li class="root-level"><a href="/">الرئيسية</a></li>
            </ul>
        </nav>
        <nav id="mobile-menu" class="mobile-menu veloura-mobile-main-menu">
            <ul class="main-menu veloura-main-menu-mobile">
                <li class="text-sm font-bold veloura-mobile-menu-item"><a href="/">الرئيسية</a></li>
            </ul>
            <button class="btn--close close-mobile-menu sicon-cancel" aria-label="close"></button>
        </nav>`;

        document.dispatchEvent(new CustomEvent('veloura:menu:ready', {
            detail: { menu: this, fallback: true }
        }));
    }
}

customElements.define('custom-main-menu', NavigationMenu);