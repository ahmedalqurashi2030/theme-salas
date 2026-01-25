import BasePage from '../base-page';

/**
 * Tharaa - Custom Product Card
 *
 * تصميم البطاقة مثل الصورة المرجعية (UI):
 * - قلب Wishlist أعلى يسار
 * - شارة أعلى يمين (وردي/أخضر)
 * - زر إضافة للسلة (أيقونة user-plus) يسار سطر التقييم
 * - التقييم يمين السطر نفسه (شكل: (count) ⭐ rating)
 * - اسم الماركة بالوسط + العنوان بالوسط
 * - أسفل: نسبة الخصم يسار + السعر (قديم/جديد) يمين
 *
 * ملاحظة مهمة:
 * - نعزل التخصيص بإضافة class = th-product-card فقط للبطاقات “العادية”
 * - أي وضع آخر (horizontal/special/minimal/donation) يرجع للـ Classic renderer
 */
class ProductCard extends HTMLElement {
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
  /* Props                                                                      */
  /* -------------------------------------------------------------------------- */
  getProps() {
    this.horizontal = this.hasAttribute('horizontal');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
    this.fullImage = this.hasAttribute('fullImage');
    this.minimal = this.hasAttribute('minimal');
    this.isSpecial = this.hasAttribute('isSpecial');
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */
  escapeHTML(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  getBadgeTheme(text = '') {
    const t = String(text).toLowerCase();
    // نخلي "الأكثر مبيعاً" وأشباهها أخضر مثل الصورة
    if (t.includes('الأكثر') || t.includes('الاكثر') || t.includes('best') || t.includes('bestseller')) return 'green';
    return 'pink';
  }

  getProductBadge() {
    if (this.product?.preorder?.label) {
      const theme = this.getBadgeTheme(this.product.preorder.label);
      return `<div class="s-product-card-promotion-title th-badge--${theme}">${this.escapeHTML(this.product.preorder.label)}</div>`;
    }
    if (this.product?.promotion_title) {
      const theme = this.getBadgeTheme(this.product.promotion_title);
      return `<div class="s-product-card-promotion-title th-badge--${theme}">${this.escapeHTML(this.product.promotion_title)}</div>`;
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

  getDiscountPercent() {
    const regular = Number(this.product?.regular_price || 0);
    const sale = Number(this.product?.sale_price || 0);
    if (!this.product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round((1 - sale / regular) * 100);
  }

  /* -------------------------------------------------------------------------- */
  /* Rendering                                                                  */
  /* -------------------------------------------------------------------------- */
  render() {
    // نظف فقط الكلاسات اللي نتحكم فيها
    const toRemove = [
      'th-product-card',
      's-product-card-entry',
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

    // كلاسّات الحالة الأصلية (سلة)
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

    // طبّق UI الجديد فقط للبطاقة العمودية العادية
    const shouldSkin =
      !this.horizontal && !this.fullImage && !this.minimal && !this.isSpecial && !this.product?.donation;

    if (shouldSkin) {
      this.classList.add('th-product-card');
      this.renderTharaaLikeReference();
    } else {
      this.renderClassic();
    }

    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));
  }

  renderTharaaLikeReference() {
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const brandName = this.product?.brand?.name ? this.escapeHTML(this.product.brand.name) : '';

    const ratingStars = this.product?.rating?.stars;
    const ratingCount = this.product?.rating?.count || 0;

    const percent = this.getDiscountPercent();
    const discountPill = percent ? `<span class="th-discount">-${percent}%</span>` : '';

    const nowPrice = this.product?.is_on_sale
      ? this.getPriceFormat(this.product.sale_price)
      : this.product?.starting_price
        ? this.getPriceFormat(this.product.starting_price)
        : this.getPriceFormat(this.product.price);

    const oldPrice = this.product?.is_on_sale ? this.getPriceFormat(this.product.regular_price) : '';

    const cartButton = this.hideAddBtn
      ? ''
      : `<salla-add-product-button
            fill="outline"
            product-id="${this.product.id}"
            product-status="${this.product.status}"
            product-type="${this.product.type}"
            class="th-cart-btn"
            aria-label="${this.escapeHTML(this.product.add_to_cart_label || 'Add to cart')}">
            <i class="sicon-user-plus"></i>
            <i class="sicon-check"></i>
          </salla-add-product-button>`;

    // options component hidden (compat)
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
      <div class="th-media">
        <a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
          <img
            class="lazy"
            src="${this.placeholder}"
            alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
            data-src="${this.product?.image?.url || this.product?.thumbnail || ''}"
          />
        </a>

        <salla-button
          shape="icon"
          fill="none"
          color="light"
          aria-label="Add or remove to wishlist"
          class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
          onclick="salla.wishlist.toggle(${this.product.id})"
          data-id="${this.product.id}">
          <i class="sicon-heart"></i>
        </salla-button>

        ${this.getProductBadge()}
      </div>

      <div class="th-body">
        <div class="th-top-row">
          ${cartButton}

          ${ratingStars
            ? `<div class="th-rating">
                <span class="th-count">(${ratingCount})</span>
                <i class="sicon-star2"></i>
                <span>${ratingStars}</span>
              </div>`
            : `<div class="th-rating"></div>`
          }
        </div>

        ${brandName ? `<div class="th-brand">${brandName}</div>` : ''}

        <h3 class="th-title">
          <a href="${this.product?.url}">${this.escapeHTML(this.product?.name)}</a>
        </h3>

        <div class="th-bottom-row">
          ${discountPill}
          <div class="th-price">
            ${oldPrice ? `<span class="th-old">${oldPrice}</span>` : ``}
            <span class="th-now">${nowPrice}</span>
          </div>
        </div>

        ${optionsComponent}
      </div>
    `;
  }

  /* -------------------------------------------------------------------------- */
  /* Classic renderer (fallback)                                                */
  /* -------------------------------------------------------------------------- */
  renderClassic() {
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const brandName = this.product?.brand?.name ? this.escapeHTML(this.product.brand.name) : '';

    const optionsComponent = this.product?.options?.length
      ? `<salla-product-options
           class="th-hidden-options"
           options="${this.escapeHTML(JSON.stringify(this.product.options))}"
           product-id="${this.product.id}"
           product-status="${this.product.status}"
           product-type="${this.product.type}">
         </salla-product-options>`
      : '';

    const getProductPrice = () => {
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
    };

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
          ${this.product?.donation?.can_donate ? '' : getProductPrice()}
        </div>

        ${optionsComponent}
      </div>
    `;
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
