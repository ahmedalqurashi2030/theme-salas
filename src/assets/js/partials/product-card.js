import BasePage from '../base-page';

/**
 * Tharaa Product Card - Hybrid Version
 * يجمع بين كود سلة الأصلي (للحماية والوظائف الكاملة)
 * وبين التصميم الجديد (للمظهر الاحترافي)
 */
class ProductCard extends HTMLElement {
  constructor() {
    super();
  }

  /* -------------------------------------------------------------------------- */
  /* 1. حقن ستايل التصميم الجديد (CSS)                                         */
  /* -------------------------------------------------------------------------- */
  static injectStyles() {
    if (document.getElementById('tharaa-card-style')) return;

    const style = document.createElement('style');
    style.id = 'tharaa-card-style';
    style.textContent = `
      /* --- تصميم ثراء الجديد (يطبق فقط عند وجود كلاس th-product-card) --- */
      custom-salla-product-card.th-product-card {
        display: block;
        background: #fff;
        border: 1px solid #f0f0f0;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        transition: all 0.3s ease;
        height: 100%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.02);
      }
      custom-salla-product-card.th-product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        border-color: #e5e5e5;
      }

      /* الصورة */
      .th-card-image {
        position: relative;
        width: 100%;
        padding-top: 100%; /* مربع */
        background: #fff;
        overflow: hidden;
      }
      .th-card-image img {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        object-fit: contain; padding: 5px;
        transition: 0.4s;
      }
      custom-salla-product-card.th-product-card:hover .th-card-image img {
        transform: scale(1.05);
      }

      /* الأزرار العائمة */
      .th-btn-wishlist {
        position: absolute; top: 8px; inset-inline-end: 8px;
        width: 32px; height: 32px; border-radius: 50%;
        background: #fff; border: 1px solid #f0f0f0;
        display: flex; align-items: center; justify-content: center;
        z-index: 5; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .th-btn-wishlist i { font-size: 16px; color: #ccc; }
      .th-btn-wishlist.added i { color: #ff4b8b; }

      /* زر السلة العائم */
      .th-fab-cart {
        position: absolute; bottom: 8px; inset-inline-start: 8px;
        z-index: 6;
      }
      .th-fab-cart .s-add-product-button-btn {
        width: 36px !important; height: 36px !important;
        border-radius: 50% !important; padding: 0 !important;
        background: #fff !important; border: 1px solid #eee !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.1) !important;
        color: #333 !important; min-width: auto !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
      }
      .th-fab-cart .s-add-product-button-btn:hover {
        background: #333 !important; color: #fff !important; border-color: #333 !important;
      }

      /* البادجات */
      .th-badges { position: absolute; top: 8px; inset-inline-start: 8px; z-index: 5; display:flex; flex-direction:column; gap:4px; }
      .th-badge { background: #ff4b8b; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
      .th-badge.out { background: #999; }

      /* المحتوى */
      .th-card-content { padding: 10px; }
      .th-meta { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; font-size: 11px; }
      .th-rating { color: #ffc107; display: flex; align-items: center; }
      .th-rating span { color: #999; margin-inline-start: 2px; }
      
      .th-title { font-size: 13px; font-weight: 400; color: #000; margin: 0 0 8px; height: 38px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }
      .th-title a { text-decoration: none; color: inherit; }

      /* السعر */
      .th-price-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: auto; }
      .th-price-now { font-size: 15px; font-weight: 800; color: #ff4b8b; }
      .th-price-old { font-size: 12px; color: #aaa; text-decoration: line-through; }
      .th-discount { background: #ffeef4; color: #ff4b8b; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-inline-start: auto; }

      /* إخفاء الخيارات */
      .th-hidden-ops { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  /* -------------------------------------------------------------------------- */
  /* 2. Lifecycle & Init                                                        */
  /* -------------------------------------------------------------------------- */
  connectedCallback() {
    this.product = this.product || JSON.parse(this.getAttribute('product'));
    
    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady());
    }
  }

  onReady() {
    ProductCard.injectStyles();
    this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
    this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.getProps();

    salla.lang.onLoaded(() => {
      // تحميل النصوص للغة
      this.remained = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice = salla.lang.get('pages.products.starting_price');
      this.addToCart = salla.lang.get('pages.cart.add_to_cart');
      this.outOfStock = salla.lang.get('pages.products.out_of_stock');
      this.render();
    });

    this.render();
  }

  getProps() {
    this.horizontal = this.hasAttribute('horizontal');
    this.showQuantity = this.hasAttribute('showQuantity');
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
    this.fullImage = this.hasAttribute('fullImage');
    this.minimal = this.hasAttribute('minimal');
    this.isSpecial = this.hasAttribute('isSpecial');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
  }

  /* -------------------------------------------------------------------------- */
  /* 3. Original Helpers (استرجاع الدوال الأصلية)                               */
  /* -------------------------------------------------------------------------- */
  
  // دالة الدائرة للمنتجات الخاصة
  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    if (bar) bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  // تنسيق التاريخ للعداد
  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  // بادجات سلة الأصلية
  getProductBadge() {
    if (this.product?.promotion_title) {
      return `<div class="s-product-card-promotion-title">${this.product.promotion_title}</div>`;
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`;
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    }
    return '';
  }

  // تنسيق السعر الأصلي
  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
    }
    return salla.money(price);
  }

  // HTML السعر الأصلي
  getProductPrice() {
    if (this.product.is_on_sale) {
      return `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    } else if (this.product.starting_price) {
      return `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`;
    } else {
      return `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`;
    }
  }

  // نص زر الإضافة
  getAddButtonLabel() {
    if (this.product.status === 'sale' && this.product.type === 'booking') return salla.lang.get('pages.cart.book_now');
    if (this.product.status === 'sale') return salla.lang.get('pages.cart.add_to_cart');
    if (this.product.type !== 'donating') return salla.lang.get('pages.products.out_of_stock');
    return salla.lang.get('pages.products.donation_exceed');
  }

  /* -------------------------------------------------------------------------- */
  /* 4. New Design Helpers (دوال التصميم الجديد)                                */
  /* -------------------------------------------------------------------------- */
  getDiscountPercent() {
    const regular = parseFloat(this.product?.regular_price?.amount || this.product?.regular_price || 0);
    const sale = parseFloat(this.product?.sale_price?.amount || this.product?.sale_price || 0);
    if (!this.product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round(((regular - sale) / regular) * 100);
  }

  /* -------------------------------------------------------------------------- */
  /* 5. Render Logic                                                            */
  /* -------------------------------------------------------------------------- */
  render() {
    this.classList.add('s-product-card-entry');
    this.setAttribute('id', this.product.id);

    // التحقق من المفضلة
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(this.product.id);

    // الشرط: نستخدم التصميم الجديد فقط للكروت العمودية العادية
    // ونستخدم التصميم الأصلي للكروت الأفقية والخاصة (مثل التبرع)
    const isStandardCard = !this.horizontal && !this.fullImage && !this.minimal && !this.isSpecial && !this.product.donation;

    if (isStandardCard) {
      this.renderNewDesign(); // التصميم الجديد (نايس ون)
    } else {
      this.renderOriginalDesign(); // التصميم الأصلي (سلة)
    }

    // تفعيل التبرع إذا وجد (للتصميم الأصلي)
    if (this.product?.donation) {
        this.querySelectorAll('[name="donating_amount"]').forEach((element) => {
            element.addEventListener('input', (e) => {
                salla.helpers.inputDigitsOnly(e.target);
                e.target.closest('.s-product-card-content')?.querySelector('salla-add-product-button')?.setAttribute('donating-amount', e.target.value);
            });
        });
    }

    // تفعيل العداد
    if (this.product?.quantity && this.isSpecial) this.initCircleBar();
    
    // Lazy Load
    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));
  }

  /**
   * التصميم الجديد (مطابق للصورة تماماً)
   */
  renderNewDesign() {
    this.classList.add('th-product-card');

    const imgUrl = this.product?.image?.url || this.product?.thumbnail || this.placeholder;
    const name = this.product?.name;
    const url = this.product?.url;
    const discount = this.getDiscountPercent();

    // 1. بادجات
    let badges = '';
    if (this.product.is_out_of_stock) {
        badges = `<span class="th-badge out">${this.outOfStock || 'نفذت الكمية'}</span>`;
    } else if (this.product.promotion_title) {
        badges = `<span class="th-badge">${this.product.promotion_title}</span>`;
    }

    // 2. السعر
    let priceHtml = '';
    if (this.product.is_on_sale) {
        priceHtml = `
            <div class="th-price-now">${this.getPriceFormat(this.product.sale_price)}</div>
            <div class="th-price-old">${this.getPriceFormat(this.product.regular_price)}</div>
            ${discount ? `<div class="th-discount">-${discount}%</div>` : ''}
        `;
    } else {
        priceHtml = `<div class="th-price-now" style="color:#333">${this.getPriceFormat(this.product.price || this.product.starting_price)}</div>`;
    }

    // 3. التقييم
    const ratingHtml = this.product.rating?.stars ? `
        <div class="th-rating">
            <i class="sicon-star2"></i> ${this.product.rating.stars} <span>(${this.product.rating.count})</span>
        </div>
    ` : '';

    this.innerHTML = `
      <div class="th-card-image">
        <a href="${url}" aria-label="${name}">
            <img class="lazy" src="${this.placeholder}" data-src="${imgUrl}" alt="${name}">
        </a>
        
        <!-- زر المفضلة -->
        <salla-button shape="icon" fill="none" class="th-btn-wishlist ${this.isInWishlist ? 'added' : ''}"
            onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}">
            <i class="${this.isInWishlist ? 'sicon-heart-fill' : 'sicon-heart'}"></i>
        </salla-button>

        <div class="th-badges">${badges}</div>

        <!-- زر السلة العائم -->
        ${!this.hideAddBtn && !this.product.is_out_of_stock ? `
        <div class="th-fab-cart">
            <salla-add-product-button fill="none" product-id="${this.product.id}"
                product-status="${this.product.status}" product-type="${this.product.type}">
                <i class="sicon-shopping-bag"></i>
            </salla-add-product-button>
        </div>` : ''}
      </div>

      <div class="th-card-content">
        <div class="th-meta">
            ${ratingHtml}
            ${this.product.brand?.name ? `<span class="th-brand">${this.product.brand.name}</span>` : ''}
        </div>
        
        <h3 class="th-title"><a href="${url}">${name}</a></h3>
        
        <div class="th-price-row">${priceHtml}</div>

        <!-- خيارات مخفية لضمان العمل -->
        ${this.product.options?.length ? `
        <salla-product-options class="th-hidden-ops" 
            options='${JSON.stringify(this.product.options)}' 
            product-id="${this.product.id}"></salla-product-options>` : ''}
      </div>
    `;
  }

  /**
   * التصميم الأصلي (للحفاظ على باقي وظائف الثيم)
   * هذا هو الكود الأصلي الذي كان موجوداً في الملف، تمت استعادته هنا.
   */
  renderOriginalDesign() {
    // إضافة كلاسات الحالة الأصلية
    !this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal ? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial ? this.classList.add('s-product-card-special') : '';
    this.fullImage ? this.classList.add('s-product-card-full-image') : '';
    this.minimal ? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation ? this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover ? this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock ? this.classList.add('s-product-card-out-of-stock') : '';

    this.innerHTML = `
      <div class="${!this.fullImage ? 's-product-card-image' : 's-product-card-image-full'}">
        <a href="${this.product.url}">
          <img class="lazy" src="${this.placeholder}" data-src="${this.product.image?.url || this.product.thumbnail}" alt="${this.product.name}" />
        </a>
        ${!this.horizontal && !this.fullImage ? `
        <salla-button shape="icon" fill="outline" color="light" class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 'added pulse-anime' : ''}"
            onclick="salla.wishlist.toggle(${this.product.id})" data-id="${this.product.id}">
            <i class="sicon-heart"></i>
        </salla-button>` : ''}
        ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}
        ${!this.hideAddBtn && !this.horizontal && !this.fullImage ? `
        <div class="s-product-card-floating-btn">
            <salla-add-product-button fill="outline" product-id="${this.product.id}" product-status="${this.product.status}" product-type="${this.product.type}" class="btn-floating-cart">
                <i class="sicon-shopping-bag"></i> <i class="sicon-check"></i>
            </salla-add-product-button>
        </div>` : ''}
      </div>
      <div class="s-product-card-content">
        <div class="s-product-card-meta">
            ${this.product.rating?.stars ? `<div class="s-product-card-rating"><i class="sicon-star2"></i> <span>${this.product.rating.stars}</span></div>` : ''}
            ${this.product.brand?.name ? `<span class="s-product-card-brand">${this.product.brand.name}</span>` : ''}
        </div>
        <h3 class="s-product-card-content-title"><a href="${this.product.url}">${this.product.name}</a></h3>
        <div class="s-product-card-price-row">${this.product.donation?.can_donate ? '' : this.getProductPrice()}</div>
        ${this.product.donation && !this.minimal ? `
        <salla-progress-bar donation=${JSON.stringify(this.product.donation)}></salla-progress-bar>
        <div class="s-product-card-donation-input">
            <label>${this.donationAmount} <span>*</span></label>
            <input type="text" name="donating_amount" class="s-form-control" placeholder="${this.donationAmount}" />
        </div>` : ''}
        ${this.isSpecial && this.product.discount_ends ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true} labeled=${true} />` : ''}
      </div>
    `;
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}