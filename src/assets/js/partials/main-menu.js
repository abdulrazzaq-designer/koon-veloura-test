class NavigationMenu extends HTMLElement {
    connectedCallback() {
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
    getDesktopMenu(menu, isRootMenu, additionalClasses = '') {
        return `
        <li class="${this.getDesktopClasses(menu, isRootMenu)} ${additionalClasses}" ${menu.attrs} data-menu-item>
            <a href="${menu.url}" aria-label="${menu.title || 'category'}" ${menu.link_attrs}>
                <span>${menu.title}</span>
            </a>
            ${this.hasChildren(menu) ? `
                <div class="sub-menu veloura-submenu-surface ${this.hasProducts(menu) ? 'w-full left-0 flex' : 'w-56'}">
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
