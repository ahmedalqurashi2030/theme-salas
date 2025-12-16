import BasePage from '../base-page';

class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  /* ===========================
   * 1) Inject CSS Once (SAFE)
   * =========================== */
  static injectOnceStyles() {
    if (document.getElementById('tharaa-product-card-style')) return;

    const style = document.createElement('style');
    style.id = 'tharaa-product-card-style';
    style.textContent = `
/* ===========================
   Tharaa Product Card Skin
   Scoped ONLY to custom-salla-product-card
   =========================== */

/* ===== 1) Card Wrapper ===== */
custom-salla-product-card.s-product-card-entry{
  background:#fff !important;
  border:1px solid #f1f1f1 !important;
  border-radius:16px !important;
  box-shadow:0 4px 10px rgba(15, 23, 42, 0.04) !important;
  padding:10px 10px 14px !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:space-between !important;
  min-height:260px !important;
  transition:transform .2s ease, box-shadow .2s ease !important;
}
custom-salla-product-card.s-product-card-entry:hover{
  transform:translateY(-2px) !important;
  box-shadow:0 8px 20px rgba(15, 23, 42, 0.10) !important;
}

/* ===== 2) Image Area ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-image,
custom-salla-product-card.s-product-card-entry .s-product-card-image-full{
  position:relative !important;
  padding:8px 8px 4px !important;
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  min-height:160px !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-image a,
custom-salla-product-card.s-product-card-entry .s-product-card-image-full a{
  display:flex !important;
  width:100% !important;
  justify-content:center !important;
  align-items:center !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-image img,
custom-salla-product-card.s-product-card-entry .s-product-card-image-full img{
  max-height:140px !important;
  width:auto !important;
  object-fit:contain !important;
}

/* ===== 3) Wishlist (Top Left in RTL) ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-wishlist-btn{
  position:absolute !important;
  top:8px !important;
  inset-inline-end:8px !important; /* RTL => left */
  width:32px !important;
  height:32px !important;
  border-radius:999px !important;
  z-index:5 !important;
  opacity:1 !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-wishlist-btn button{
  width:32px !important;
  height:32px !important;
  border-radius:999px !important;
  background:#fff !important;
  border:1px solid rgba(0,0,0,.08) !important;
  box-shadow:0 6px 18px rgba(0,0,0,.06) !important;
  padding:0 !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-wishlist-btn i{
  font-size:16px !important;
  color:#9ca3af !important;
}

/* ===== 4) Promo Badge (Top Right in RTL) ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-promotion-title,
custom-salla-product-card.s-product-card-entry .s-product-card-quantity,
custom-salla-product-card.s-product-card-entry .s-product-card-out-badge{
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
  max-width:calc(100% - 60px) !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
  white-space:nowrap !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-promotion-title.th-badge-green{
  background:#16a34a !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-out-badge{
  background:#eef2f7 !important;
  color:#111 !important;
}

/* ===== 5) Floating Cart (Left middle like screenshot) ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-floating-btn{
  position:absolute !important;
  inset-inline-end:10px !important;  /* RTL => left */
  top:58% !important;
  transform:translateY(-50%) !important;
  z-index:6 !important;
}

/* Force icon-only circle */
custom-salla-product-card.s-product-card-entry .s-product-card-floating-btn salla-add-product-button{
  display:block !important;
  width:36px !important;
  height:36px !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-floating-btn salla-button,
custom-salla-product-card.s-product-card-entry .s-product-card-floating-btn button{
  width:36px !important;
  height:36px !important;
  border-radius:999px !important;
  background:#fff !important;
  border:1px solid rgba(0,0,0,.10) !important;
  box-shadow:0 8px 20px rgba(0,0,0,.08) !important;
  padding:0 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-floating-btn i{
  font-size:16px !important;
}

/* ===== 6) Content ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-content{
  padding-top:6px !important;
}

/* Rating row -> stacked like screenshot (rating top, brand under) */
custom-salla-product-card.s-product-card-entry .s-product-card-meta{
  display:flex !important;
  flex-direction:column !important;
  align-items:flex-end !important;
  gap:2px !important;
  margin-bottom:2px !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-rating{
  display:inline-flex !important;
  align-items:center !important;
  gap:4px !important;
  font-size:12px !important;
  color:#6b7280 !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-rating i{
  font-size:13px !important;
  color:#f59e0b !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-rating.empty{
  display:none !important;
}

/* Brand */
custom-salla-product-card.s-product-card-entry .s-product-card-brand{
  display:block !important;
  font-size:12px !important;
  font-weight:600 !important;
  color:#4b5563 !important;
  text-align:end !important;
}

/* Title */
custom-salla-product-card.s-product-card-entry .s-product-card-content-title{
  font-size:12px !important;
  font-weight:400 !important;
  color:#111827 !important;
  margin:6px 0 !important;
  line-height:1.4 !important;
  text-align:end !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-content-title a{
  color:inherit !important;
  text-decoration:none !important;
}

/* ===== 7) Price Row (discount pill + prices) ===== */
custom-salla-product-card.s-product-card-entry .s-product-card-price-row{
  margin-top:6px !important;
}
custom-salla-product-card.s-product-card-entry .th-price-line{
  display:flex !important;
  align-items:flex-end !important;
  justify-content:flex-end !important;
  gap:8px !important;
}
custom-salla-product-card.s-product-card-entry .th-price-line.has-discount{
  justify-content:space-between !important;
}

/* Discount pill like screenshot */
custom-salla-product-card.s-product-card-entry .th-discount-badge{
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  padding:2px 8px !important;
  border-radius:999px !important;
  background:#ffe3ea !important;
  color:#ff2d6f !important;
  font-size:11px !important;
  font-weight:700 !important;
  line-height:1.2 !important;
  white-space:nowrap !important;
}

/* Sale price block */
custom-salla-product-card.s-product-card-entry .s-product-card-sale-price{
  display:flex !important;
  align-items:flex-end !important;
  justify-content:flex-end !important;
  gap:6px !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-sale-price h4,
custom-salla-product-card.s-product-card-entry .s-product-card-price{
  font-size:15px !important;
  font-weight:700 !important;
  color:#ff4b8b !important;
  line-height:1.2 !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-sale-price span{
  font-size:11px !important;
  color:#9ca3af !important;
  text-decoration:line-through !important;
  line-height:1 !important;
}
custom-salla-product-card.s-product-card-entry .s-product-card-price{
  text-align:end !important;
}

/* ===========================
   Slider: 6 cards on Desktop
   Works when slider has class "th-products-slider"
   =========================== */
salla-products-slider.th-products-slider .s-products-slider-card.swiper-slide{
  width:50% !important;
}
@media (min-width:768px){
  salla-products-slider.th-products-slider .s-products-slider-card.swiper-slide{
    width:33.3333% !important;
  }
}
@media (min-width:1024px){
  salla-products-slider.th-products-slider .s-products-slider-card.swiper-slide{
    width:16.6667% !important; /* 6 */
  }
}
`;
    document.head.appendChild(style);
  }

  connectedCallback() {
    // Safe parsing
    if (!this.product) {
      const raw = this.getAttribute('product');
      try {
        this.product = raw ? JSON.parse(raw) : {};
      } catch (e) {
        this.product = {};
      }
    }

    if (window.app?.status === 'ready') this.onReady();
    else document.addEventListener('theme::ready', () => this.onReady(), { once: true });
  }

  onReady() {
    ProductCard.injectOnceStyles();

    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get("page.slug");
    if (this.source == "landing-page") {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');
      this.render();
    });

    this.render();
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;

    if (bar) bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  escapeHTML(str = '') {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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

  getProductBadge() {
    // preorder
    if (this.product?.preorder?.label) {
      return `<div class="s-product-card-promotion-title">${this.escapeHTML(this.product.preorder.label)}</div>`;
    }

    // promotion title (color map)
    if (this.product?.promotion_title) {
      const t = String(this.product.promotion_title || '');
      const isMost = t.includes('الأكثر') || t.toLowerCase().includes('best');
      return `<div class="s-product-card-promotion-title ${isMost ? 'th-badge-green' : ''}">${this.escapeHTML(t)}</div>`;
    }

    // quantity / out of stock
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

  getDiscountPercent() {
    const regular = Number(this.product?.regular_price || 0);
    const sale = Number(this.product?.sale_price || 0);
    if (!this.product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round((1 - sale / regular) * 100);
  }

  getDiscountBadge() {
    const p = this.getDiscountPercent();
    if (!p) return '';
    return `<span class="th-discount-badge">-${p}%</span>`;
  }

  getProductPrice() {
    let price = '';

    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4>${this.getPriceFormat(this.product?.starting_price)}</h4>
              </div>`;
    } else {
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`;
    }

    return price;
  }

  render() {
    this.classList.add('s-product-card-entry');
    this.setAttribute('id', this.product.id);

    !this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial ? this.classList.add('s-product-card-special') : '';
    this.fullImage ? this.classList.add('s-product-card-full-image') : '';
    this.minimal ? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation ? this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover ? this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock ? this.classList.add('s-product-card-out-of-stock') : '';

    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const hasDiscount = !!this.getDiscountPercent();

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

        ${!this.horizontal && !this.fullImage ? `
          <salla-button
            shape="icon"
            fill="outline"
            color="light"
            name="product-name-${this.product.id}"
            aria-label="Add or remove to wishlist"
            class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
            onclick="salla.wishlist.toggle(${this.product.id})"
            data-id="${this.product.id}">
            <i class="sicon-heart"></i>
          </salla-button>` : ``}

        ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}

        ${!this.hideAddBtn && !this.horizontal && !this.fullImage ? `
          <div class="s-product-card-floating-btn">
            <salla-add-product-button
              fill="outline"
              product-id="${this.product.id}"
              product-status="${this.product.status}"
              product-type="${this.product.type}"
              class="btn-floating-cart">
              <i class="sicon-shopping-bag"></i>
              <i class="sicon-check"></i>
            </salla-add-product-button>
          </div>` : ``}

        ${this.fullImage ? `<a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product.name)}" class="s-product-card-overlay"></a>` : ''}
      </div>

      <div class="s-product-card-content">

        <div class="s-product-card-meta">
          ${this.product?.rating?.stars ? `
            <div class="s-product-card-rating">
              <i class="sicon-star2"></i>
              <span>${this.product.rating.stars}</span>
              <span>(${this.product.rating.count || 0})</span>
            </div>` : ``}

          ${this.product?.brand?.name ? `<span class="s-product-card-brand">${this.escapeHTML(this.product.brand.name)}</span>` : ''}
        </div>

        <h3 class="s-product-card-content-title">
          <a href="${this.product?.url}">${this.escapeHTML(this.product?.name)}</a>
        </h3>

        <div class="s-product-card-price-row">
          ${this.product?.donation?.can_donate ? '' : `
            <div class="th-price-line ${hasDiscount ? 'has-discount' : ''}">
              ${hasDiscount ? this.getDiscountBadge() : ''}
              ${this.getProductPrice()}
            </div>
          `}
        </div>

        ${this.product?.donation && !this.minimal && !this.fullImage ? `
          <salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${this.product?.donation?.can_donate ? `
              <label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
              <input
                type="text"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />` : ``}
          </div>` : ''}

        ${this.isSpecial && this.product.discount_ends
          ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true} labeled=${true} />`
          : ``}
      </div>
    `;

    // Donation binding (original behavior)
    this.querySelectorAll('[name="donating_amount"]').forEach((element) => {
      element.addEventListener('input', (e) => {
        salla.helpers.inputDigitsOnly(e.target);
        e.target
          .closest(".s-product-card-content")
          ?.querySelector("salla-add-product-button")
          ?.setAttribute("donating-amount", e.target.value);
      });
    });

    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));

    if (this.product?.quantity && this.isSpecial) this.initCircleBar();
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
