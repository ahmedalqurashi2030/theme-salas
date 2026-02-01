import BasePage from '../base-page';
/**
 * Tharaa - Product Card Skin (SAFE)
 * - Keeps Salla original markup/behavior (maximum compatibility)
 * - Applies Tharaa look using CSS on top of the ORIGINAL classes
 * - Adds ONE discount percent badge (no duplicates)
 * - Slider sizing scoped to .th-products-slider
 */
class ProductCard extends HTMLElement {
  static STYLE_VERSION = 'v4';

  /* -------------------------------------------------------------------------- */
  /* Styles (Injected + updatable)                                              */
  /* -------------------------------------------------------------------------- */
  static injectOnceStyles() {
    return;
  }

  /* -------------------------------------------------------------------------- */
  /* Lifecycle                                                                  */
  /* -------------------------------------------------------------------------- */
  connectedCallback() {
    this.product = this.product || JSON.parse(this.getAttribute('product'));

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady(), { once: true });
    }
  }

  onReady() {
    ProductCard.injectOnceStyles();

    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get('page.slug');
    if (this.source == 'landing-page') {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');
      this.render();
    });

    this.render();
  }

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */
  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  getProps() {
    this.horizontal = this.hasAttribute('horizontal');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
    this.fullImage = this.hasAttribute('fullImage');
    this.minimal = this.hasAttribute('minimal');
    this.isSpecial = this.hasAttribute('isSpecial');
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  escapeHTML(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  getProductBadge() {
    if (this.product?.preorder?.label) {
      return `<div class="s-product-card-promotion-title">${this.escapeHTML(this.product.preorder.label)}</div>`;
    }
    if (this.product.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.escapeHTML(this.product.promotion_title)}</div>`;
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    }
    return '';
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
    }
    return salla.money(price);
  }

  getProductPrice() {
    if (this.product.is_on_sale) {
      return `<div class="s-product-card-sale-price">
        <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
        <span>${this.getPriceFormat(this.product?.regular_price)}</span>
      </div>`;
    }

    if (this.product.starting_price) {
      return `<div class="s-product-card-starting-price">
        <p>${this.startingPrice}</p>
        <h4>${this.getPriceFormat(this.product?.starting_price)}</h4>
      </div>`;
    }

    return `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`;
  }

  getDiscountPercent() {
    const regular = Number(this.product?.regular_price || 0);
    const sale = Number(this.product?.sale_price || 0);
    if (!this.product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round((1 - sale / regular) * 100);
  }

  getDiscountBadgeHtml() {
    const p = this.getDiscountPercent();
    return p ? `<span class="th-product-card-discount-badge">-${p}%</span>` : '';
  }

  getRatingHtml() {
    // 1. Check for Real Rating
    const hasRating = this.product?.rating?.stars;
    const ratingValue = hasRating ? this.product.rating.stars : 5.0;

    // 2. Build 5-star loop
    let starsHtml = '<div class="flex text-amber-400 gap-0.5">';
    for (let i = 1; i <= 5; i++) {
      // If real rating: gray out stars beyond the value
      // If fake (no rating): always gold (as per "fake 5 stars" request)
      const isFilled = hasRating ? (i <= Math.round(ratingValue)) : true;
      starsHtml += `<i class="sicon-star2 ${isFilled ? '' : 'text-gray-200'}"></i>`;
    }
    starsHtml += '</div>';

    return `
      <div class="product-rating text-sm text-gray-400 flex items-center">
        ${starsHtml}
        <span class="font-bold text-gray-600 px-1 pt-0.5">${ratingValue}</span>
      </div>`;
  }

  /* -------------------------------------------------------------------------- */
  /* Rendering                                                                  */
  /* -------------------------------------------------------------------------- */
  render() {
    // reset only what we control
    const toRemove = [
      'th-product-card',
      's-product-card-vertical',
      's-product-card-horizontal',
      's-product-card-fit-height',
      's-product-card-special',
      's-product-card-full-image',
      's-product-card-minimal',
      's-product-card-donation',
      's-product-card-shadow',
      's-product-card-out-of-stock',
    ];
    toRemove.forEach((c) => this.classList.remove(c));

    this.classList.add('s-product-card-entry');
    this.setAttribute('id', this.product.id);

    // original state classes
    !this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal
      ? this.classList.add('s-product-card-fit-height')
      : '';
    this.isSpecial ? this.classList.add('s-product-card-special') : '';
    this.fullImage ? this.classList.add('s-product-card-full-image') : '';
    this.minimal ? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation ? this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover ? this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock ? this.classList.add('s-product-card-out-of-stock') : '';

    // Apply Tharaa skin ONLY to the normal vertical card (most used in sliders/lists)
    const shouldSkin =
      !this.horizontal && !this.fullImage && !this.minimal && !this.isSpecial && !this.product?.donation;
    if (shouldSkin) this.classList.add('th-product-card');

    this.renderClassic();

    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));
  }

  renderClassic() {
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const brandName = this.product?.brand?.name ? this.escapeHTML(this.product.brand.name) : '';
    const discountBadge = this.product?.is_on_sale ? this.getDiscountBadgeHtml() : '';

    // keep options component hidden (safe compatibility if options exist)
    const optionsComponent = this.product?.options?.length
      ? `<salla-product-options
           class="th-hidden-options"
           options="${this.escapeHTML(JSON.stringify(this.product.options))}"
           product-id="${this.product.id}"
           product-status="${this.product.status}"
           product-type="${this.product.type}">
         </salla-product-options>`
      : '';

    // Add to cart button HTML - moved to content area
    const addToCartBtn = !this.hideAddBtn && !this.horizontal && !this.fullImage
      ? `<div class="s-product-card-add-btn">
            <salla-add-product-button
              fill="outline"
              product-id="${this.product.id}"
              product-status="${this.product.status}"
              product-type="${this.product.type}"
              class="btn-floating-cart">
              <i class="sicon-shopping-bag"></i>
            </salla-add-product-button>
          </div>`
      : '';

    this.innerHTML = `
      <div class="${!this.fullImage ? 's-product-card-image' : 's-product-card-image-full'}">
        <a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
          <img
            class="s-product-card-image-${salla.url.is_placeholder(this.product?.image?.url)
        ? 'contain'
        : this.fitImageHeight
          ? this.fitImageHeight
          : 'cover'} lazy"
            src="${this.placeholder}"
            alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
            data-src="${this.product?.image?.url || this.product?.thumbnail || ''}"
          />
        </a>

        ${!this.horizontal && !this.fullImage
        ? `<salla-button
              shape="icon"
              fill="outline"
              color="light"
              name="product-name-${this.product.id}"
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart"></i>
            </salla-button>`
        : ``}

        ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}

        ${this.fullImage ? `<a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product.name)}" class="s-product-card-overlay"></a>` : ''}
      </div>

      <div class="s-product-card-content">
        <!-- Row 1: Rating + Add to Cart Button -->
        <div class="s-product-card-meta">
          ${this.getRatingHtml()}
          ${addToCartBtn}
        </div>

        ${brandName ? `<span class="s-product-card-brand">${brandName}</span>` : ''}

        <h3 class="s-product-card-content-title">
          <a href="${this.product?.url}">${this.escapeHTML(this.product?.name)}</a>
        </h3>

        <div class="s-product-card-price-row">
          ${discountBadge}
          ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
        </div>

        ${optionsComponent}
      </div>
    `;
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
