import BasePage from '../base-page';

/**
 * Tharaa - Custom Product Card
 * - Keeps original behavior (badges, wishlist, add-to-cart, donation/options hooks, special cards).
 * - Applies Tharaa skin ONLY for the default vertical card (the one used in sliders/lists) to match the reference design.
 * - Adds a safe slider patch (6 cards on desktop) scoped to sliders marked with `.th-products-slider`.
 */
class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  /* -------------------------------------------------------------------------- */
  /* Styles (Injected once, fully scoped)                                        */
  /* -------------------------------------------------------------------------- */

  static injectOnceStyles() {
    if (document.getElementById('tharaa-product-card-style')) return;

    const style = document.createElement('style');
    style.id = 'tharaa-product-card-style';
    style.textContent = `
      /* ===================== Tharaa Product Card (SCOPED) ===================== */
      custom-salla-product-card.th-product-card{
        display:block;
        background:#fff !important;
        border:1px solid rgba(0,0,0,.06) !important;
        border-radius:14px !important;
        overflow:hidden !important;
        box-shadow:0 10px 24px rgba(0,0,0,.04) !important;
        transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;
      }
      custom-salla-product-card.th-product-card:hover{
        transform:translateY(-2px);
        box-shadow:0 16px 30px rgba(0,0,0,.07) !important;
        border-color:rgba(0,0,0,.10) !important;
      }

      /* Media */
      custom-salla-product-card.th-product-card .th-card-image{
        position:relative;
        background:#fff;
        padding:14px 14px 10px;
        min-height:190px;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      custom-salla-product-card.th-product-card .th-card-image a{
        display:flex;
        align-items:center;
        justify-content:center;
        width:100%;
        height:100%;
      }
      custom-salla-product-card.th-product-card .th-card-image img{
        width:100% !important;
        max-height:170px;
        object-fit:contain !important;
      }

      /* Wishlist button (top-start) */
      custom-salla-product-card.th-product-card .s-product-card-wishlist-btn{
        position:absolute;
        inset-block-start:10px;
        inset-inline-start:10px;
        width:36px;
        height:36px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        background:#fff !important;
        border:1px solid rgba(0,0,0,.10) !important;
        box-shadow:0 10px 22px rgba(0,0,0,.08);
        z-index:3;
      }

      /* Promo badge (top-end) */
      custom-salla-product-card.th-product-card .s-product-card-promotion-title,
      custom-salla-product-card.th-product-card .s-product-card-quantity,
      custom-salla-product-card.th-product-card .s-product-card-out-badge{
        position:absolute;
        inset-block-start:10px;
        inset-inline-end:10px;
        z-index:3;
        padding:5px 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        line-height:1;
        letter-spacing:.2px;
        max-width:70%;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      custom-salla-product-card.th-product-card .s-product-card-promotion-title,
      custom-salla-product-card.th-product-card .s-product-card-quantity{
        background:#ff4b8b;
        color:#fff;
      }
      custom-salla-product-card.th-product-card .s-product-card-out-badge{
        background:#eef2f7;
        color:#111;
      }

      /* Floating cart button (mid-start) */
      custom-salla-product-card.th-product-card .th-fab-cart{
        position:absolute;
        inset-inline-start:10px;
        inset-block-end:14px;
        z-index:3;
      }
      custom-salla-product-card.th-product-card salla-add-product-button.btn-floating-cart{
        display:flex;
        width:44px;
        height:44px;
        align-items:center;
        justify-content:center;
        border-radius:12px;
        background:#fff;
        border:1px solid rgba(0,0,0,.12);
        box-shadow:0 10px 22px rgba(0,0,0,.08);
      }
      custom-salla-product-card.th-product-card salla-add-product-button.btn-floating-cart i{
        font-size:18px;
      }

      /* Rating pill (bottom-end) */
      custom-salla-product-card.th-product-card .th-rating-pill{
        position:absolute;
        inset-inline-end:10px;
        inset-block-end:14px;
        z-index:3;
        display:flex;
        align-items:center;
        gap:6px;
        padding:7px 10px;
        border-radius:999px;
        background:#fff;
        border:1px solid rgba(0,0,0,.10);
        box-shadow:0 10px 22px rgba(0,0,0,.08);
        font-size:12px;
        font-weight:800;
        color:#111;
        white-space:nowrap;
      }
      custom-salla-product-card.th-product-card .th-rating-pill i{ font-size:14px; }
      custom-salla-product-card.th-product-card .th-rating-pill .th-rating-count{
        font-weight:700;
        color:#6b7280;
      }

      /* Body */
      custom-salla-product-card.th-product-card .th-card-content{
        padding:12px 14px 14px;
      }
      custom-salla-product-card.th-product-card .th-title{
        margin:0 0 10px;
        font-size:13px;
        font-weight:800;
        line-height:1.35;
        color:#111;
        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;
        overflow:hidden;
        min-height:36px;
      }
      custom-salla-product-card.th-product-card .th-title a{
        color:inherit;
        text-decoration:none;
      }

      custom-salla-product-card.th-product-card .th-price-row{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:10px;
      }

      custom-salla-product-card.th-product-card .th-price-now,
      custom-salla-product-card.th-product-card .th-price-normal{
        font-weight:900;
        font-size:16px;
        line-height:1;
      }
      custom-salla-product-card.th-product-card .th-price-now{ color:#ff2d6f; }
      custom-salla-product-card.th-product-card .th-price-normal{ color:#111; }

      custom-salla-product-card.th-product-card .th-price-old{
        font-size:12px;
        color:#9aa0a6;
        text-decoration:line-through;
        line-height:1;
        margin-top:6px;
        display:block;
      }

      custom-salla-product-card.th-product-card .th-discount-chip{
        background:#ffe3ea;
        color:#ff2d6f;
        padding:4px 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        line-height:1;
        flex:0 0 auto;
      }

      /* Hide the options component visually (keeps behavior intact when needed) */
      custom-salla-product-card.th-product-card .th-hidden-options{
        display:none !important;
      }

      /* ===================== Tharaa Products Slider (SCOPED) ================== */
      salla-products-slider.th-products-slider .swiper-wrapper{
        padding:0;
      }
      salla-products-slider.th-products-slider .s-products-slider-card{
        box-sizing:border-box;
        padding-inline:10px;
      }
      salla-products-slider.th-products-slider .swiper{
        margin-inline:-10px;
      }

      /* 2 cards on mobile, 3 on small, 4 on md, 6 on desktop */
      salla-products-slider.th-products-slider .s-products-slider-card{ width:50% !important; }
      @media (min-width: 640px){
        salla-products-slider.th-products-slider .s-products-slider-card{ width:33.3333% !important; }
      }
      @media (min-width: 768px){
        salla-products-slider.th-products-slider .s-products-slider-card{ width:25% !important; }
      }
      @media (min-width: 1024px){
        salla-products-slider.th-products-slider .s-products-slider-card{ width:16.6667% !important; }
      }

      /* Optional: reduce huge heights that some themes enforce */
      salla-products-slider.th-products-slider custom-salla-product-card.th-product-card{
        height:auto !important;
      }
    `;

    document.head.appendChild(style);
  }

  /* -------------------------------------------------------------------------- */
  /* Slider patch (6 cards desktop)                                             */
  /* -------------------------------------------------------------------------- */

  static patchTharaaSlidersOnce() {
    if (window.__tharaaProductsSliderPatched) return;
    window.__tharaaProductsSliderPatched = true;

    const patch = () => {
      document.querySelectorAll('salla-products-slider.th-products-slider').forEach((slider) => {
        const apply = () => {
          slider.querySelectorAll('.s-products-slider-card').forEach((slide) => {
            slide.classList.add('th-products-slide');
          });
        };

        apply();
        const obs = new MutationObserver(() => apply());
        obs.observe(slider, { childList: true, subtree: true });
      });
    };

    if (window.app?.status === 'ready') patch();
    else document.addEventListener('theme::ready', patch, { once: true });
  }

  /* -------------------------------------------------------------------------- */
  /* Lifecycle                                                                  */
  /* -------------------------------------------------------------------------- */

  connectedCallback() {
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product'));

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady());
    }
  }

  onReady() {
    ProductCard.injectOnceStyles();
    ProductCard.patchTharaaSlidersOnce();

    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    this.source = salla.config.get('page.slug');
    // If the card is in the landing page, hide the add button and show the quantity
    if (this.source == 'landing-page') {
      this.hideAddBtn = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      // Language
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');

      // re-render to update translations
      this.render();
    });

    this.render();
  }

  /* -------------------------------------------------------------------------- */
  /* Original helpers                                                           */
  /* -------------------------------------------------------------------------- */

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
    let price = '';

    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`;
    } else {
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`;
    }

    return price;
  }

  getAddButtonLabel() {
    if (this.product.has_preorder_campaign) {
      return salla.lang.get('pages.products.pre_order_now');
    }

    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now');
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
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

  /* -------------------------------------------------------------------------- */
  /* Tharaa-specific helpers                                                    */
  /* -------------------------------------------------------------------------- */

  getDiscountPercent() {
    const regular = Number(this.product?.regular_price || 0);
    const sale = Number(this.product?.sale_price || 0);

    if (!this.product?.is_on_sale || !regular || !sale || sale >= regular) return null;

    return Math.round((1 - sale / regular) * 100);
  }

  getTharaaPriceRow() {
    // Donation products keep original flow
    if (this.product?.donation?.can_donate) return '';

    if (this.product?.is_on_sale) {
      const p = this.getDiscountPercent();
      return `
        <div class="th-price-row">
          ${p ? `<span class="th-discount-chip">-${p}%</span>` : ``}
          <div>
            <span class="th-price-now">${this.getPriceFormat(this.product.sale_price)}</span>
            <span class="th-price-old">${this.getPriceFormat(this.product?.regular_price)}</span>
          </div>
        </div>
      `;
    }

    if (this.product?.starting_price) {
      return `
        <div class="th-price-row">
          <div>
            <span class="th-price-normal">${this.getPriceFormat(this.product?.starting_price)}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="th-price-row">
        <div>
          <span class="th-price-normal">${this.getPriceFormat(this.product?.price)}</span>
        </div>
      </div>
    `;
  }

  getTharaaRatingPill() {
    const stars = this.product?.rating?.stars;
    if (!stars) return '';

    const count = this.product?.rating?.count || 0;
    const countTxt = count ? `(${salla.helpers.number(count)})` : '';

    return `
      <div class="th-rating-pill" aria-label="rating">
        <span class="th-rating-count">${countTxt}</span>
        <i class="sicon-star2"></i>
        <span>${stars}</span>
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /* Rendering                                                                  */
  /* -------------------------------------------------------------------------- */

  render() {
    // Always keep base behavior classes
    this.classList.add('s-product-card-entry');
    this.setAttribute('id', this.product.id);

    // state classes (original)
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

    // Tharaa skin is applied only for the default vertical card
    const shouldUseTharaaSkin =
      !this.horizontal && !this.fullImage && !this.minimal && !this.isSpecial && !this.product?.donation;

    if (shouldUseTharaaSkin) {
      this.renderTharaa();
    } else {
      this.renderClassic();
    }

    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));

    if (this.product?.quantity && this.isSpecial) {
      this.initCircleBar();
    }
  }

  renderTharaa() {
    this.classList.add('th-product-card');

    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const imgAlt = this.escapeHTML(this.product?.image?.alt || this.product?.name || '');
    const imgUrl = this.product?.image?.url || this.product?.thumbnail || '';
    const productName = this.escapeHTML(this.product?.name || '');

    const wishlistBtn = `
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
      </salla-button>
    `;

    const promoBadge = this.getProductBadge();

    const cartFab = !this.hideAddBtn
      ? `
        <div class="th-fab-cart">
          <salla-add-product-button
            fill="outline"
            product-id="${this.product.id}"
            product-status="${this.product.status}"
            product-type="${this.product.type}"
            class="btn-floating-cart"
            aria-label="${this.escapeHTML(this.getAddButtonLabel())}">
            <i class="sicon-shopping-bag"></i>
          </salla-add-product-button>
        </div>
      `
      : '';

    const ratingPill = this.getTharaaRatingPill();

    // Keep options component (invisible) so card add-to-cart stays compatible with optioned products
    const optionsComponent = this.product?.options?.length
      ? `<salla-product-options
           class="th-hidden-options"
           options='${JSON.stringify(this.product.options)}'
           product-id="${this.product.id}"
           product-status="${this.product.status}"
           product-type="${this.product.type}">
         </salla-product-options>`
      : '';

    this.innerHTML = `
      <div class="th-card-image">
        <a href="${this.product?.url}" aria-label="${imgAlt || productName}">
          <img
            class="lazy"
            src="${this.placeholder}"
            alt="${imgAlt || productName}"
            data-src="${imgUrl}"
          />
        </a>

        ${wishlistBtn}
        ${promoBadge}
        ${cartFab}
        ${ratingPill}
      </div>

      <div class="th-card-content">
        <h3 class="th-title">
          <a href="${this.product?.url}">${productName}</a>
        </h3>

        ${this.getTharaaPriceRow()}
        ${optionsComponent}
      </div>
    `;
  }

  renderClassic() {
    // Classic markup from the original card to avoid breaking any special cases
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

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

          ${!this.horizontal && !this.fullImage ?
            `<salla-button
              shape="icon"
              fill="outline"
              color="light"
              name="product-name-${this.product.id}"
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart"></i>
            </salla-button>` : ``
          }

          ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}

          ${!this.hideAddBtn && !this.horizontal && !this.fullImage ?
            `<div class="s-product-card-floating-btn">
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
            : ``
          }

          ${this.fullImage ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>` : ''}
        </div>

        <div class="s-product-card-content">
          <div class="s-product-card-meta">
             ${this.product?.rating?.stars ?
              `<div class="s-product-card-rating">
                <i class="sicon-star2"></i>
                <span>${this.product.rating.stars}</span>
                <span class="text-gray-400 text-xs">(${this.product.rating.count || 0})</span>
              </div>`
              : `<div class="s-product-card-rating empty"></div>`}
             ${this.product?.brand?.name ? `<span class="s-product-card-brand">${this.escapeHTML(this.product.brand.name)}</span>` : ''}
          </div>

          <h3 class="s-product-card-content-title">
            <a href="${this.product?.url}">${this.escapeHTML(this.product?.name)}</a>
          </h3>

          <div class="s-product-card-price-row">
            ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
          </div>

          ${this.product?.donation && !this.minimal && !this.fullImage ?
            `<salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
            <div class="s-product-card-donation-input">
              ${this.product?.donation?.can_donate ?
                `<label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
                <input
                  type="text"
                  id="donation-amount-${this.product.id}"
                  name="donating_amount"
                  class="s-form-control"
                  placeholder="${this.donationAmount}" />`
              : ``}
            </div>`
          : ''}

          ${this.isSpecial && this.product.discount_ends
            ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true} labeled=${true} />`
            : ``}
        </div>
      `;

    // Donation input binding (original behavior)
    this.querySelectorAll('[name="donating_amount"]').forEach((element) => {
      element.addEventListener('input', (e) => {
        salla.helpers.inputDigitsOnly(e.target);
        e.target
          .closest('.s-product-card-content')
          ?.querySelector('salla-add-product-button')
          ?.setAttribute('donating-amount', e.target.value);
      });
    });
  }
}

// Prevent double-definition in hot reload
if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
