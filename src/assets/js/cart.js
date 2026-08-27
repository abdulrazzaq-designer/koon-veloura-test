import BasePage from './base-page';
import {validateProductOptions} from './partials/validate-product-options';
class Cart extends BasePage {
    onReady() {
        // keep update the dom base in the events
        salla.event.cart.onUpdated(data => this.updateCartPageInfo(data));

        app.watchElements({
            subTotal: '#sub-total',
            orderOptionsTotal: '#cart-options-total',
            totalDiscount: '#total-discount',
            taxAmount: '#tax-amount',
            shippingCost: '#shipping-cost',
            freeShipping: '#free-shipping',
            freeShippingBar: '#free-shipping-bar',
            freeShippingMsg: '#free-shipping-msg',
            freeShipApplied: '#free-shipping-applied',
            cartGifting: '#cart-gifting',
            sallaGifting:'#salla-gifting'
        });

        this.initSubmitCart();
        validateProductOptions();
        this.initVelouraCartVisualContract();
    }

    initVelouraCartVisualContract() {
        const page = document.querySelector('.veloura-cart-page.veloura-cart-surfaces-enabled');

        if (!page) {
            return;
        }

        const STYLE_ID = 'veloura-cart-shadow-v115';

        const shadowCss = {
            'SALLA-PRODUCT-OPTIONS': `
                :host {
                    display: block !important;
                    width: 100% !important;
                    color: var(--veloura-cart-text, #111827) !important;
                }

                .s-product-options-wrapper {
                    width: 100% !important;
                    margin: 0 !important;

                    background:
                        var(--veloura-cart-primary-bg, #ffffff) !important;

                    background-color:
                        var(--veloura-cart-primary-bg, #ffffff) !important;

                    color:
                        var(--veloura-cart-text, #111827) !important;

                    border: 0 !important;

                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;

                    box-shadow: none !important;
                }

                .s-product-options-option-label,
                .s-form-label {
                    color:
                        var(--veloura-cart-text, #111827) !important;
                }

                select,
                input:not([type="hidden"]),
                textarea,
                .s-form-control,
                .s-input {
                    background:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    background-color:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    color:
                        var(--veloura-cart-text, #111827) !important;

                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;

                    box-shadow: none !important;
                }
            `,

            'SALLA-QUANTITY-INPUT': `
                :host {
                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;
                }

                .s-quantity-input-container {
                    background:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    background-color:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    color:
                        var(--veloura-cart-text, #111827) !important;

                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;

                    overflow: hidden !important;
                    box-shadow: none !important;
                }

                .s-quantity-input-button,
                .s-quantity-input-input {
                    background:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    background-color:
                        var(--veloura-cart-secondary-bg, #f8fafc) !important;

                    color:
                        var(--veloura-cart-text, #111827) !important;

                    border-radius: 0 !important;
                }

                .s-quantity-input-button {
                    fill:
                        var(--veloura-cart-text, #111827) !important;
                }
            `,

            'SALLA-BUTTON': `
                button,
                .s-button-btn,
                .s-button-element {
                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;
                }
            `,

            'SALLA-CART-COUPONS': `
                button,
                input,
                select,
                textarea,
                .s-button-btn,
                .s-button-element,
                .s-form-control,
                .s-input {
                    border-radius:
                        var(--veloura-cart-real-radius, 0px) !important;
                }
            `,
        };

        const injectShadowStyle = async (element) => {
            if (!element) {
                return;
            }

            try {
                if (typeof element.componentOnReady === 'function') {
                    await element.componentOnReady();
                }
            } catch (_) {
                // Light-DOM rules still apply.
            }

            const root = element.shadowRoot;

            if (!root || root.getElementById(STYLE_ID)) {
                return;
            }

            const css = shadowCss[element.tagName];

            if (!css) {
                return;
            }

            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = css;
            root.appendChild(style);
        };

        const sync = (scope = page) => {
            const selector = [
                'salla-product-options',
                'salla-quantity-input',
                'salla-button',
                'salla-cart-coupons',
            ].join(',');

            if (scope.matches?.(selector)) {
                injectShadowStyle(scope);
            }

            scope.querySelectorAll?.(selector).forEach((element) => {
                injectShadowStyle(element);
            });
        };

        sync();

        if (!page.__velouraCartVisualObserver && window.MutationObserver) {
            let scheduled = false;
            const addedRoots = new Set();

            page.__velouraCartVisualObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            addedRoots.add(node);
                        }
                    });
                });

                if (!addedRoots.size || scheduled) {
                    return;
                }

                scheduled = true;

                requestAnimationFrame(() => {
                    scheduled = false;

                    addedRoots.forEach((node) => sync(node));
                    addedRoots.clear();
                });
            });

            page.__velouraCartVisualObserver.observe(page, {
                childList: true,
                subtree: true,
            });
        }
    }

    initSubmitCart() {
        let submitBtn = document.querySelector('#cart-submit');
        
        if (!submitBtn) {
            return;
        }
        
        app.onClick(submitBtn, event => {
            let cartForms = document.querySelectorAll('form[id^="item-"]');
            let isValid = true;
            cartForms.forEach(form => {
                isValid = isValid && form.reportValidity();
                if (!isValid) {
                    event.preventDefault();
                    salla.notify.error(salla.lang.get('common.messages.required_fields'));
                    return;
                }
            });
    
            if (isValid) {
                /** @type HTMLSallaButtonElement */
                let btn = event.currentTarget;
                if (salla.config.get('user.type') !== 'guest') {
                    btn.load();
                    // Keep loading state until page redirects
                    new MutationObserver(() => {
                        if (!btn.hasAttribute('loading')) {
                            btn.setAttribute('loading', '');
                        }
                    }).observe(btn, { attributes: true, attributeFilter: ['loading'] });
                }
                salla.cart.submit();
            }
        });
    }

    updateCartOptions(options) {
      if (!options || !options.length) return;

      const arrayTwoId = options.map((item) => (item.id));

      document.querySelectorAll('.cart-options form')?.forEach((form) => {
        if (!arrayTwoId.includes(form.id.value)) {
          form.remove();
        }
      })
    }
    
    /**
     * @param {import("@salla.sa/twilight/types/api/cart").CartSummary} cartData
     */
    updateCartPageInfo(cartData) {
        //if item deleted & there is no more items, just reload the page
        if (!cartData.count) {
            // clear cart options from the dom before page reload
            document.querySelector('.cart-options')?.remove();
            return window.location.reload();
        }
        // toggle physical gifting depned on giftable flag
        app.toggleElementClassIf(app.cartGifting, 'active', 'hidden', () => cartData?.gift?.enabled);
        // Use toggleAttribute to handle the `physical-products` attribute
        app.sallaGifting?.toggleAttribute('physical-products', cartData?.gift?.type === 'physical');
        app.sallaGifting?.toggleAttribute('digital-products', cartData?.gift?.type === 'digital');

        // update the dom for cart options
        this.updateCartOptions(cartData?.options);
        // update each item data
        cartData.items?.forEach(item => this.updateItemInfo(item));

        app.subTotal.innerHTML = salla.money(cartData.sub_total);
        if(app.taxAmount) 
          app.taxAmount.innerHTML = salla.money(cartData.tax_amount);
        if (app.orderOptionsTotal) app.orderOptionsTotal.innerHTML = salla.money(cartData.options_total);
        
        app.toggleElementClassIf(app.totalDiscount, 'discounted', 'hidden', () => !!cartData.total_discount)
            .toggleElementClassIf(app.shippingCost, 'has_shipping', 'hidden', () => !!cartData.real_shipping_cost && !cartData.free_shipping_bar?.has_free_shipping) 
            .toggleElementClassIf(app.freeShipping, 'has_free', 'hidden', () => !!cartData.free_shipping_bar);

        app.totalDiscount.querySelector('b').innerHTML = '- ' + salla.money(cartData.total_discount);
        app.shippingCost.querySelector('b').innerHTML = salla.money(cartData.real_shipping_cost);

        if (!cartData.free_shipping_bar) {
            return;
        }

        let isFree = cartData.free_shipping_bar.has_free_shipping;
        app.toggleElementClassIf(app.freeShippingBar, 'active', 'hidden', () => !isFree)
            .toggleElementClassIf(app.freeShipApplied, 'active', 'hidden', () => isFree);

        app.freeShippingMsg.innerHTML = isFree
            ? salla.lang.get('pages.cart.has_free_shipping')
            : salla.lang.get('pages.cart.free_shipping_alert', { amount: salla.money(cartData.free_shipping_bar.remaining) });
        app.freeShippingBar.children[0].style.width = cartData.free_shipping_bar.percent + '%';

    }

    /**
     * @param {import("@salla.sa/twilight/types/api/cart").CartItem} item
     */
    updateItemInfo(item) {
        // lets get the elements for this item
        let cartItem = document.querySelector('#item-' + item.id);
        if (!cartItem) {
            salla.log(`Can't get the cart item dom for ${item.id}!`);
            return;
        }
        let totalElement = cartItem.querySelector('.item-total'),
            priceElement = cartItem.querySelector('.item-price'),
            regularPriceElement = cartItem.querySelector('.item-regular-price'),
            itemOriginalPrice = cartItem.querySelector('.item-original-price'),
            weightRow = cartItem.querySelector('.item-weight-row'),
            weightElement = cartItem.querySelector('.item-weight'),
            offerElement = cartItem.querySelector('.offer-name'),
            oldOffers = cartItem.querySelector('.old-offers'),
            freeRibbon = cartItem.querySelector('.free-ribbon'),
            offerIconElement = cartItem.querySelector('.offer-icon'),
            hasSpecialPrice = item.offer || item.special_price > 0,
            hasSalePrice = item.is_on_sale,
            newOffersActive = item.detailed_offers?.length > 0 ;
        let item_total = item.detailed_offers?.length > 0 ? item.total_special_price : item.total;
        let total = salla.money(item_total);
        if (total !== totalElement.innerHTML) {
            totalElement.innerHTML = total;
            // app.anime(totalElement, { scale: [.88, 1] });
        }

        app.toggleElementClassIf([offerElement, oldOffers], 'offer-applied', 'hidden', () => hasSpecialPrice && !newOffersActive)
            .toggleElementClassIf([regularPriceElement, offerIconElement], 'offer-applied', 'hidden', () => hasSpecialPrice)
            .toggleElementClassIf([itemOriginalPrice], 'offer-applied', 'hidden', () => hasSalePrice)
            .toggleElementClassIf(priceElement, 'text-red-400', 'text-sm text-gray-400', () => hasSpecialPrice)
            .toggleElementClassIf(freeRibbon, 'active', 'hidden', () => item.price == 0);

        priceElement.innerHTML = salla.money(item.price);

        if (weightElement) {
            weightElement.innerHTML = item.weight_label || '';
        }
        app.toggleElementClassIf(weightRow, 'has-weight', 'hidden', () => !!item.weight_label);

        // Update original price when item is on sale
        if (hasSalePrice) {
            itemOriginalPrice.innerHTML = salla.money(item.original_price);
        }

        if (!hasSpecialPrice){return;}
        if (!newOffersActive) {offerElement.innerHTML = item.offer.names;}
        regularPriceElement.innerHTML = salla.money(item.product_price);
    }
}

Cart.initiateWhenReady(['cart']);
