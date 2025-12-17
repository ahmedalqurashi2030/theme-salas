import BasePage from '../base-page';
/**
 * Tharaa - Product Card Skin (SAFE)
 * - Keeps Salla original markup/behavior (maximum compatibility)
 * - Applies Tharaa look using CSS on top of the ORIGINAL classes
 * - Adds ONE discount percent badge (no duplicates)
 * - Slider sizing scoped to .th-products-slider
 */
class ProductCard extends HTMLElement {
  static STYLE_VERSION = 'v3';

  /* -------------------------------------------------------------------------- */
  /* Styles (Injected + updatable)                                              */
  /* -------------------------------------------------------------------------- */
  static injectOnceStyles() {
    const existing = document.getElementById('tharaa-product-card-style');
    const css = `
/* ===================== Tharaa Product Card (ORIGINAL MARKUP) ===================== */
custom-salla-product-card.th-product-card{
  background-color:#ffffff !important;
  border-radius:16px !important;
  border:1px solid #f1f1f1 !important;
  box-shadow:0 4px 10px rgba(15,23,42,.04) !important;
  padding:10px 10px 14px !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:space-between !important;
  min-height:260px !important;
  transition:transform .2s ease, box-shadow .2s ease !important;
}
custom-salla-product-card.th-product-card:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 20px rgba(15,23,42,.10) !important;
}

/* ----- Image area ----- */
custom-salla-product-card.th-product-card .s-product-card-image,
custom-salla-product-card.th-product-card .s-product-card-image-full{
  position:relative !important;
  padding:8px 8px 4px !important;
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  min-height:140px !important;
  background:#fff !important;
  border-radius:14px !important;
}
custom-salla-product-card.th-product-card .s-product-card-image a,
custom-salla-product-card.th-product-card .s-product-card-image-full a{
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  height:100%;
}
custom-salla-product-card.th-product-card .s-product-card-image img,
custom-salla-product-card.th-product-card .s-product-card-image-full img{
  max-height:130px !important;
  max-width:100% !important;
  width:auto !important;
  object-fit:contain !important;
}

/* ----- Wishlist (TOP-LEFT visually in RTL / TOP-RIGHT in LTR) ----- */
custom-salla-product-card.th-product-card .s-product-card-wishlist-btn{
  position:absolute !important;
  top:8px !important;
  inset-inline-end:8px !important; /* RTL => left, LTR => right (matches reference) */
  width:32px !important;
  height:32px !important;
  border-radius:999px !important;
  z-index:5 !important;
}
custom-salla-product-card.th-product-card .s-product-card-wishlist-btn,
custom-salla-product-card.th-product-card .s-product-card-wishlist-btn button{
  background:#fff !important;
  border:1px solid rgba(0,0,0,.08) !important;
  box-shadow:0 10px 22px rgba(0,0,0,.08) !important;
}
custom-salla-product-card.th-product-card .s-product-card-wishlist-btn button{
  width:32px !important;
  height:32px !important;
  border-radius:999px !important;
}

/* ----- Promo badge (TOP-RIGHT visually in RTL / TOP-LEFT in LTR) ----- */
custom-salla-product-card.th-product-card .s-product-card-promotion-title,
custom-salla-product-card.th-product-card .s-product-card-quantity,
custom-salla-product-card.th-product-card .s-product-card-out-badge{
  position:absolute !important;
  top:8px !important;
  inset-inline-start:8px !important; /* RTL => right */
  background:#ff4b8b !important;
  color:#fff !important;
  font-size:11px !important;
  padding:3px 10px !important;
  border-radius:999px !important;
  font-weight:700 !important;
  z-index:5 !important;
  max-width:80%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

/* ----- Floating cart (BOTTOM-LEFT visually in RTL / BOTTOM-RIGHT in LTR) ----- */
custom-salla-product-card.th-product-card .s-product-card-floating-btn{
  position:absolute !important;
  bottom:6px !important;
  inset-inline-end:10px !important; /* RTL => left */
  z-index:5 !important;
}
custom-salla-product-card.th-product-card salla-add-product-button.btn-floating-cart{
  width:36px !important;
  height:36px !important;
  border-radius:999px !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  background:#fff !important;
  border:1px solid rgba(0,0,0,.10) !important;
  box-shadow:0 10px 22px rgba(0,0,0,.08) !important;
}
custom-salla-product-card.th-product-card salla-add-product-button.btn-floating-cart i{
  font-size:16px !important;
}

/* ----- Content ----- */
custom-salla-product-card.th-product-card .s-product-card-content{
  padding-top:6px !important;
  display:flex !important;
  flex-direction:column !important;
  flex:1 !important;
}

/* Rating row */
custom-salla-product-card.th-product-card .s-product-card-meta{
  display:flex !important;
  align-items:center !important;
  gap:6px !important;
  margin-bottom:2px !important;
}
custom-salla-product-card.th-product-card .s-product-card-rating{
  display:inline-flex !important;
  align-items:center !important;
  gap:4px !important;
  font-size:12px !important;
}
custom-salla-product-card.th-product-card .s-product-card-rating i{
  font-size:13px !important;
  color:#f59e0b !important;
}
custom-salla-product-card.th-product-card .s-product-card-rating span{
  line-height:1 !important;
}

/* Brand line */
custom-salla-product-card.th-product-card .s-product-card-brand{
  display:block !important;
  font-size:12px !important;
  font-weight:700 !important;
  color:#4b5563 !important;
  margin-bottom:2px !important;
}

/* Title */
custom-salla-product-card.th-product-card .s-product-card-content-title{
  font-size:12px !important;
  font-weight:500 !important;
  color:#111827 !important;
  margin-bottom:6px !important;
  line-height:1.4 !important;
}
custom-salla-product-card.th-product-card .s-product-card-content-title a{ color:inherit !important; }

/* Price row (stick to bottom) */
custom-salla-product-card.th-product-card .s-product-card-price-row{
  margin-top:auto !important;
  display:flex !important;
  align-items:flex-end !important;
  justify-content:flex-end !important;
  gap:6px !important;
}
custom-salla-product-card.th-product-card .s-product-card-sale-price{
  display:flex !important;
  align-items:flex-end !important;
  justify-content:flex-end !important;
  gap:6px !important;
}
custom-salla-product-card.th-product-card .s-product-card-sale-price h4,
custom-salla-product-card.th-product-card .s-product-card-price{
  font-size:15px !important;
  font-weight:800 !important;
  color:#ff4b8b !important;
  line-height:1.2 !important;
}
custom-salla-product-card.th-product-card .s-product-card-sale-price span{
  font-size:11px !important;
  color:#9ca3af !important;
  text-decoration:line-through !important;
  line-height:1 !important;
}
custom-salla-product-card.th-product-card .s-product-card-price{
  text-align:end !important;
}

/* Discount percent badge (ONE only) */
custom-salla-product-card.th-product-card .th-product-card-discount-badge{
  display:inline-block !important;
  padding:2px 8px !important;
  border-radius:999px !important;
  background:#ffe3ea !important;
  color:#ff2d6f !important;
  font-size:11px !important;
  font-weight:800 !important;
  line-height:1.2 !important;
}

/* Hide options component inside card (keeps compatibility if present) */
custom-salla-product-card .th-hidden-options{ display:none !important; }

/* ===================== Slider sizing (scoped) ===================== */
salla-products-slider.th-products-slider .s-products-slider-card{ width:50% !important; }
@media (min-width:640px){  salla-products-slider.th-products-slider .s-products-slider-card{ width:33.3333% !important; } }
@media (min-width:768px){  salla-products-slider.th-products-slider .s-products-slider-card{ width:25% !important; } }
@media (min-width:1024px){ salla-products-slider.th-products-slider .s-products-slider-card{ width:16.6667% !important; } }
`;

    if (existing) {
      if (existing.dataset.v === ProductCard.STYLE_VERSION) return;
      existing.textContent = css;
      existing.dataset.v = ProductCard.STYLE_VERSION;
      return;
    }

    const style = document.createElement('style');
    style.id = 'tharaa-product-card-style';
    style.dataset.v = ProductCard.STYLE_VERSION;
    style.textContent = css;
    document.head.appendChild(style);
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

        ${!this.hideAddBtn && !this.horizontal && !this.fullImage
        ? `<div class="s-product-card-floating-btn">
              <salla-add-product-button
                fill="outline"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}"
                class="btn-floating-cart">
                <i class="sicon-shopping-bag"></i>
                <i class="sicon-check"></i>
              </salla-add-product-button>
            </div>`
        : ``}

        ${this.fullImage ? `<a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product.name)}" class="s-product-card-overlay"></a>` : ''}
      </div>

      <div class="s-product-card-content">
        <div class="s-product-card-meta">
          ${this.product?.rating?.stars
        ? `<div class="s-product-card-rating">
                  <i class="sicon-star2"></i>
                  <span>${this.product.rating.stars}</span>
                  <span class="text-gray-400 text-xs">(${this.product.rating.count || 0})</span>
                </div>`
        : `<div class="s-product-card-rating empty"></div>`
      }
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
