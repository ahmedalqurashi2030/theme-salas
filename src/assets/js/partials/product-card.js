import BasePage from '../base-page';

/**
 * ════════════════════════════════════════════════════════════════
 * Tharaa — Product Card & Quick View (معايير سلة الرسمية)
 * ════════════════════════════════════════════════════════════════
 *
 * المكوّنات الرسمية المستخدمة:
 *  • salla-add-product-button  → الإضافة للسلة
 *  • salla-quantity-input      → التحكم في الكمية (يحل محل HTML مخصص)
 *  • salla-product-availability→ الإشعار عند التوفر (يحل محل HTML مخصص)
 *  • salla-button              → أزرار متعددة الاستخدام
 *  • salla-product-options     → خيارات المنتج
 *
 * حقوق سلة الطيب:
 *  • salla.wishlist.toggle()   → تبديل المفضلة
 *  • salla.wishlist.event.*    → أحداث المفضلة
 *  • salla.money()             → تنسيق الأسعار
 *  • salla.helpers.number()    → تنسيق الأرقام
 *  • salla.lang.get()          → الترجمات
 *  • salla.storage.get()       → التخزين المحلي
 *  • app.toggleModal()         → فتح/إغلاق المودال
 * ════════════════════════════════════════════════════════════════
 */
class ProductCard extends HTMLElement {
  static STYLE_VERSION = 'v6';
  static quickViewState = { lastTrigger: null };

  /* ──────────────────────────────────────────────────────────────
     Lifecycle
  ─────────────────────────────────────────────────────────────── */
  connectedCallback() {
    this.product = this.product || JSON.parse(this.getAttribute('product'));

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady(), { once: true });
    }
  }

  onReady() {
    this.fitImageHeight        = salla.config.get('store.settings.product.fit_type');
    this.placeholder           = salla.url.asset(salla.config.get('theme.settings.placeholder'));
    this.showCardRating        = this._parseBool(salla.config.get('theme.settings.card_show_rating'), true);
    this.showCardDiscountBadge = this._parseBool(salla.config.get('theme.settings.card_show_discount_badge'), true);
    this.getProps();

    this.source = salla.config.get('page.slug');
    if (this.source === 'landing-page') {
      this.hideAddBtn   = true;
      this.showQuantity = window.showQuantity;
    }

    salla.lang.onLoaded(() => {
      this.remained       = salla.lang.get('pages.products.remained');
      this.donationAmount = salla.lang.get('pages.products.donation_amount');
      this.startingPrice  = salla.lang.get('pages.products.starting_price');
      this.outOfStock     = salla.lang.get('pages.products.out_of_stock');
      this.render();
    });

    this.render();
  }

  /* ──────────────────────────────────────────────────────────────
     Props
  ─────────────────────────────────────────────────────────────── */
  getProps() {
    this.horizontal    = this.hasAttribute('horizontal');
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
    this.hideAddBtn    = this.hasAttribute('hideAddBtn');
    this.fullImage     = this.hasAttribute('fullImage');
    this.minimal       = this.hasAttribute('minimal');
    this.isSpecial     = this.hasAttribute('isSpecial');
    this.showQuantity  = this.hasAttribute('showQuantity');
  }

  /* ──────────────────────────────────────────────────────────────
     Helpers
  ─────────────────────────────────────────────────────────────── */
  _parseBool(value, fallback = true) {
    if (value === undefined || value === null || value === '') return fallback;
    if (Array.isArray(value) && value.length) {
      return this._parseBool(value[0]?.value ?? value[0]?.selected ?? value[0], fallback);
    }
    if (typeof value === 'object')  return this._parseBool(value.value ?? value.selected ?? '', fallback);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number')  return value === 1;
    const s = String(value).trim().toLowerCase();
    if (['1','true','yes','on'].includes(s))  return true;
    if (['0','false','no','off'].includes(s)) return false;
    return fallback;
  }

  /** تأمين النص من XSS */
  _esc(str = '') {
    return String(str)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /** إزالة HTML */
  _strip(text = '') {
    return String(text).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  }

  /* ──────────────────────────────────────────────────────────────
     Card HTML builders
  ─────────────────────────────────────────────────────────────── */
  _getProductBadge() {
    if (this.product?.preorder?.label)
      return `<div class="s-product-card-promotion-title">${this._esc(this.product.preorder.label)}</div>`;
    if (this.product.promotion_title)
      return `<div class="s-product-card-promotion-title">${this._esc(this.product.promotion_title)}</div>`;
    if (this.showQuantity && this.product?.quantity)
      return `<div class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product.quantity)}</div>`;
    if (this.showQuantity && this.product?.is_out_of_stock)
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`;
    return '';
  }

  _getPriceFormat(price) {
    if (!price || price == 0)
      return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
    return salla.money(price);
  }

  _getProductPrice() {
    if (this.product.is_on_sale) {
      return `<div class="s-product-card-sale-price">
        <h4>${this._getPriceFormat(this.product.sale_price)}</h4>
        <span>${this._getPriceFormat(this.product?.regular_price)}</span>
      </div>`;
    }
    if (this.product.starting_price) {
      return `<div class="s-product-card-starting-price">
        <p>${this.startingPrice}</p>
        <h4>${this._getPriceFormat(this.product?.starting_price)}</h4>
      </div>`;
    }
    return `<h4 class="s-product-card-price">${this._getPriceFormat(this.product?.price)}</h4>`;
  }

  _getDiscountPercent() {
    const reg  = Number(this.product?.regular_price || 0);
    const sale = Number(this.product?.sale_price    || 0);
    if (!this.product?.is_on_sale || !reg || !sale || sale >= reg) return null;
    return Math.round((1 - sale / reg) * 100);
  }

  _getDiscountBadge() {
    if (!this.showCardDiscountBadge) return '';
    const p = this._getDiscountPercent();
    return p ? `<span class="th-product-card-discount-badge">-${p}%</span>` : '';
  }

  _getRatingHtml() {
    if (!this.showCardRating) return '';
    const stars = Number(this.product?.rating?.stars || 5.0);
    const count = this.product?.rating?.count || 2;
    return `
      <div class="s-product-card-rating text-sm flex items-center gap-1">
        <i class="sicon-star2 text-amber-400 text-xs"></i>
        <span class="font-bold text-gray-600">${Number.isInteger(stars) ? stars : stars.toFixed(1)}</span>
        <span class="text-gray-400 text-xs">(${salla.helpers.number(count)})</span>
      </div>`;
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — modal & product helpers
  ─────────────────────────────────────────────────────────────── */
  _modal()   { return document.getElementById('product-quick-view-modal'); }
  _product() { return this.product || null; }

  /* ──────────────────────────────────────────────────────────────
     Quick View — cross-fade image swap
  ─────────────────────────────────────────────────────────────── */
  _swapMainImage(imgEl, src, alt) {
    if (!imgEl || !src) return;
    imgEl.style.transition = 'opacity .18s ease';
    imgEl.style.opacity    = '0';
    setTimeout(() => {
      imgEl.src = src;
      imgEl.alt = alt;
      const show = () => { imgEl.style.opacity = '1'; };
      (imgEl.complete && imgEl.naturalWidth > 0) ? show() : (imgEl.onload = imgEl.onerror = show);
    }, 185);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — collect product images
  ─────────────────────────────────────────────────────────────── */
  _collectImages(product) {
    const images = [], seen = new Set();
    const push = img => {
      const url = img?.url || img?.thumbnail || '';
      if (!url || seen.has(url)) return;
      seen.add(url);
      images.push({ url, alt: img?.alt || product?.name || '' });
    };
    push(product?.image);
    if (Array.isArray(product?.images)) product.images.forEach(push);
    if (!images.length && product?.thumbnail) push({ url: product.thumbnail, alt: product?.name || '' });
    return images;
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — a11y: focus management
  ─────────────────────────────────────────────────────────────── */
  _focusableEls(modal) {
    const selectors = [
      'a[href]', 'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      '[tabindex]:not([tabindex="-1"])',
      'salla-add-product-button', 'salla-quantity-input',
    ];
    return Array.from(modal.querySelectorAll(selectors.join(','))).filter(el => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  _focusModal(modal) {
    requestAnimationFrame(() => {
      const target =
        modal.querySelector('[data-close-modal]') ||
        modal.querySelector('salla-add-product-button') ||
        this._focusableEls(modal)[0] ||
        modal;
      target?.focus?.({ preventScroll: true });
    });
  }

  _restoreFocus() {
    const trigger = ProductCard.quickViewState.lastTrigger;
    ProductCard.quickViewState.lastTrigger = null;
    if (!(trigger instanceof HTMLElement)) return;
    setTimeout(() => {
      if (document.contains(trigger)) trigger.focus({ preventScroll: true });
    }, 360);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — open / close
  ─────────────────────────────────────────────────────────────── */
  _closeModal(modal) {
    if (!modal) return;
    if (window.app && typeof app.toggleModal === 'function') {
      app.toggleModal('#product-quick-view-modal', false);
    } else {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
    this._restoreFocus();
  }

  openQuickViewModal(triggerEl = null) {
    const modal   = this._modal();
    const product = this._product();
    if (!modal || !product) return;

    this._bindModalEvents(modal);

    ProductCard.quickViewState.lastTrigger =
      triggerEl instanceof HTMLElement ? triggerEl : document.activeElement;

    try {
      this._populate(modal, product);
    } catch (err) {
      if (window.salla?.log) salla.log(`ThemeApp(Tharaa)::QuickView error — ${err?.message}`);
    }

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    if (window.app && typeof app.toggleModal === 'function') {
      app.toggleModal('#product-quick-view-modal', true);
    }

    this._focusModal(modal);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — bind modal events (once)
  ─────────────────────────────────────────────────────────────── */
  _bindModalEvents(modal) {
    if (modal.dataset.qvBound === 'true') return;
    modal.dataset.qvBound = 'true';

    /* ─ إغلاق بالنقر ─ */
    modal.addEventListener('click', e => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-close-modal="product-quick-view-modal"]')) {
        e.preventDefault();
        e.stopPropagation();
        this._closeModal(modal);
      }
    });

    /* ─ Escape + Tab trap ─ */
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this._closeModal(modal);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = this._focusableEls(modal);
      if (!focusable.length) { e.preventDefault(); return; }
      const [first, last] = [focusable[0], focusable.at(-1)];
      const active = document.activeElement;
      if (e.shiftKey  && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last)  { e.preventDefault(); first.focus(); }
    });

    /* ─ سحب للإغلاق (موبايل) ─ */
    const handle = modal.querySelector('[data-quick-view="drag-handle"]');
    if (handle && !handle.dataset.swipeBound) {
      handle.dataset.swipeBound = 'true';
      let startY = 0, deltaY = 0;
      handle.addEventListener('touchstart', e => { startY = e.touches?.[0]?.clientY ?? 0; deltaY = 0; }, { passive: true });
      handle.addEventListener('touchmove',  e => { const dy = (e.touches?.[0]?.clientY ?? startY) - startY; if (dy > 0) deltaY = dy; }, { passive: true });
      handle.addEventListener('touchend',   ()  => { if (deltaY > 65) this._closeModal(modal); deltaY = 0; }, { passive: true });
    }

    /* ─ MutationObserver: استعادة الفوكس عند الإغلاق ─ */
    new MutationObserver(() => {
      if (modal.getAttribute('aria-hidden') === 'true' || modal.classList.contains('hidden')) {
        this._restoreFocus();
      }
    }).observe(modal, { attributes: true, attributeFilter: ['aria-hidden', 'class'] });
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — render gallery
  ─────────────────────────────────────────────────────────────── */
  _renderGallery(modal, images, productName) {
    const imgEl     = modal.querySelector('[data-quick-view="image"]');
    const galleryEl = modal.querySelector('[data-quick-view="gallery"]');
    if (!imgEl || !galleryEl) return;

    // إعادة التهيئة لكل منتج
    delete galleryEl.dataset.galleryBound;

    if (!images.length) {
      galleryEl.classList.add('hidden');
      galleryEl.innerHTML = '';
      return;
    }

    imgEl.src           = images[0].url;
    imgEl.alt           = this._esc(images[0].alt || productName || '');
    imgEl.style.opacity = '1';

    if (images.length < 2) {
      galleryEl.classList.add('hidden');
      galleryEl.innerHTML = '';
      return;
    }

    galleryEl.innerHTML = images.map((img, i) => `
      <button
        type="button"
        role="listitem"
        class="th-quick-view-thumb${i === 0 ? ' is-active' : ''}"
        data-src="${this._esc(img.url)}"
        data-alt="${this._esc(img.alt || productName || '')}"
        aria-pressed="${i === 0 ? 'true' : 'false'}"
        aria-label="${this._esc(productName || '')} ${i + 1}">
        <img src="${this._esc(img.url)}" alt="" loading="lazy" aria-hidden="true"/>
      </button>`).join('');

    galleryEl.classList.remove('hidden');
    galleryEl.dataset.galleryBound = 'true';

    galleryEl.addEventListener('click', e => {
      const btn = (e.target instanceof Element ? e.target : null)?.closest('.th-quick-view-thumb');
      if (!btn?.dataset.src) return;
      this._swapMainImage(imgEl, btn.dataset.src, btn.dataset.alt || productName || '');
      galleryEl.querySelectorAll('.th-quick-view-thumb').forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — render rating (sicon-star2)
  ─────────────────────────────────────────────────────────────── */
  _renderRating(modal, product) {
    const el  = modal.querySelector('[data-quick-view="rating"]');
    if (!el) return;
    const val = Number(product?.rating?.stars || 0);
    const cnt = Number(product?.rating?.count || 0);
    if (!val) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    const display = Number.isInteger(val) ? String(val) : val.toFixed(1);
    el.classList.remove('hidden');
    el.innerHTML = `
      <i class="sicon-star2" aria-hidden="true"></i>
      <b>${display}</b>
      <span>(${salla.helpers.number(cnt)})</span>`;
    el.setAttribute('aria-label', `${display} / 5 (${cnt})`);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — render tax
  ─────────────────────────────────────────────────────────────── */
  _renderTax(modal, product) {
    const el = modal.querySelector('[data-quick-view="tax"]');
    if (!el) return;
    const taxed    = Boolean(product?.is_taxable || salla.config.get('store.settings.tax.taxable_prices_enabled'));
    const taxLabel = salla.lang.get('pages.products.tax_included') || '';
    el.textContent = taxed ? taxLabel : '';
    el.classList.toggle('hidden', !taxed || !taxLabel);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — render description
  ─────────────────────────────────────────────────────────────── */
  _renderDescription(modal, product) {
    const el = modal.querySelector('[data-quick-view="description"]');
    if (!el) return;
    const plain = this._strip(product?.description || '');
    if (!plain) { el.innerHTML = ''; el.classList.add('hidden'); return; }

    const maxLen    = 240;
    const isLong    = plain.length > maxLen;
    const shortText = isLong ? `${plain.slice(0, maxLen).trimEnd()}…` : plain;
    const isRtl     = salla.config.get('theme.is_rtl');

    const titleLabel = salla.lang.get('common.product_details') || (isRtl ? 'تفاصيل المنتج' : 'Product details');
    const moreLabel  = salla.lang.get('common.read_more')        || (isRtl ? 'اقرأ المزيد'    : 'Read more');

    el.innerHTML = `
      <h4 class="th-quick-view-description-title">${this._esc(titleLabel)}</h4>
      <p class="th-quick-view-description-text text-sm">${this._esc(shortText)}</p>
      ${isLong ? `<button type="button" class="th-quick-view-description-toggle" data-quick-view="desc-toggle">${this._esc(moreLabel)}</button>` : ''}`;
    el.classList.remove('hidden');

    if (!isLong) return;
    const btn = el.querySelector('[data-quick-view="desc-toggle"]');
    if (!btn || btn.dataset.boundToggle) return;
    btn.dataset.boundToggle = 'true';
    btn.addEventListener('click', () => {
      const expanded = el.classList.toggle('is-expanded');
      const textEl   = el.querySelector('.th-quick-view-description-text');
      if (textEl) textEl.textContent = expanded ? plain : shortText;
      btn.textContent = expanded ? (isRtl ? 'إخفاء' : 'Show less') : moreLabel;
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — salla-product-availability (مكوّن رسمي)
  ─────────────────────────────────────────────────────────────── */
  _renderAvailability(modal, product) {
    const el = modal.querySelector('[data-quick-view="availability"]');
    if (!el) return;

    const canNotify = Boolean(product?.notify_availability && product?.is_out_of_stock);
    if (!canNotify) {
      el.classList.add('hidden');
      return;
    }

    // تعيين الـ attributes المطلوبة لـ salla-product-availability
    el.setAttribute('product-id', product.id);

    if (product?.notify_availability?.subscribed) {
      el.setAttribute('is-subscribed', '');
    } else {
      el.removeAttribute('is-subscribed');
    }

    const channels = Array.isArray(product?.notify_availability?.channels)
      ? product.notify_availability.channels.join(',')
      : 'sms,email';
    el.setAttribute('channels', channels);

    if (product?.notify_availability?.options) {
      el.setAttribute('notify-options-availability', '');
    }

    el.classList.remove('hidden');
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — salla-quantity-input (مكوّن رسمي)
  ─────────────────────────────────────────────────────────────── */
  _bindQtyInput(modal) {
    const qtyEl = modal.querySelector('[data-quick-view="qty-input"]');
    if (!qtyEl) return;

    // إعادة القيمة إلى 1 عند كل فتح
    qtyEl.value = '1';

    // ربط الحدث مرة واحدة فقط
    if (!qtyEl.dataset.qtyBound) {
      qtyEl.dataset.qtyBound = 'true';

      // salla-quantity-input يرسل حدث 'change' أو 'salla:quantity:change'
      const syncQty = (qty) => {
        const addBtn = modal.querySelector('[data-quick-view="add-button"] salla-add-product-button');
        if (addBtn) addBtn.setAttribute('quantity', String(qty));
        modal.dataset.qvQty = String(qty);
      };

      // حدث الكمية الرسمي من salla-quantity-input
      qtyEl.addEventListener('change', e => {
        const qty = parseInt(e.detail?.quantity ?? e.target?.value ?? 1, 10);
        if (Number.isFinite(qty) && qty >= 1) syncQty(qty);
      });

      // دعم احتياطي لـ input event
      qtyEl.addEventListener('input', e => {
        const qty = parseInt(e.target?.value ?? 1, 10);
        if (Number.isFinite(qty) && qty >= 1) syncQty(qty);
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — populate modal
  ─────────────────────────────────────────────────────────────── */
  _populate(modal, product) {

    /* ─ إعادة الكمية ─ */
    modal.dataset.qvQty = '1';
    const qtyEl = modal.querySelector('[data-quick-view="qty-input"]');
    if (qtyEl) qtyEl.value = '1';

    /* ─ الصور + المعرض ─ */
    const images  = this._collectImages(product);
    const imageEl = modal.querySelector('[data-quick-view="image"]');
    if (!images.length && imageEl) {
      imageEl.src            = product?.image?.url || product?.thumbnail || this.placeholder || imageEl.src;
      imageEl.alt            = this._esc(product?.name || '');
      imageEl.style.opacity  = '1';
    }
    this._renderGallery(modal, images, product?.name || '');

    /* ─ الاسم ─ */
    const titleEl = modal.querySelector('[data-quick-view="title"]');
    if (titleEl) titleEl.textContent = product?.name || '';

    /* ─ الماركة ─ */
    const brandEl = modal.querySelector('[data-quick-view="brand"]');
    if (brandEl) {
      const brand = product?.brand?.name || '';
      brandEl.textContent = brand;
      brandEl.classList.toggle('hidden', !brand);
    }

    /* ─ شارة الخصم ─ */
    const badgeEl = modal.querySelector('[data-quick-view="badge"]');
    if (badgeEl) badgeEl.innerHTML = product?.is_on_sale ? this._getDiscountBadge() : '';

    /* ─ السعر ─ */
    const priceEl = modal.querySelector('[data-quick-view="price"]');
    if (priceEl) priceEl.innerHTML = product?.donation?.can_donate ? '' : this._getProductPrice();

    /* ─ زر الإضافة (salla-add-product-button) ─ */
    const addSlot = modal.querySelector('[data-quick-view="add-button"]');
    if (addSlot) {
      if (product?.donation?.can_donate) {
        addSlot.innerHTML = '';
      } else {
        const label = this._esc(
          product?.add_to_cart_label ||
          salla.lang.get('pages.products.add_to_cart') || ''
        );
        addSlot.innerHTML = `
          <salla-add-product-button
            fill="solid"
            product-id="${product.id}"
            product-status="${this._esc(String(product.status))}"
            product-type="${this._esc(String(product.type))}"
            class="w-full th-quick-view-add-btn"
            quantity="${String(modal.dataset.qvQty || 1)}">
            ${label}
          </salla-add-product-button>`;
      }
    }

    /* ─ الرابط ─ */
    const linkEl = modal.querySelector('[data-quick-view="link"]');
    if (linkEl) linkEl.href = product?.url || '#';

    /* ─ نفاد المخزون ─ */
    const stockEl = modal.querySelector('[data-quick-view="stock"]');
    if (stockEl) {
      const isOut = Boolean(product?.is_out_of_stock);
      stockEl.textContent = isOut ? (this.outOfStock || '') : '';
      stockEl.classList.toggle('hidden', !isOut || !this.outOfStock);
    }

    /* ─ المكوّنات الفرعية ─ */
    this._renderRating(modal, product);
    this._renderTax(modal, product);
    this._renderAvailability(modal, product);  // salla-product-availability
    this._renderDescription(modal, product);

    /* ─ ربط الكمية (salla-quantity-input) ─ */
    this._bindQtyInput(modal);

    /* ─ المفضلة ─ */
    this._bindWishlist(modal, product);

    /* ─ المشاركة ─ */
    this._bindShare(modal, product);
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — wishlist (salla.wishlist.toggle)
  ─────────────────────────────────────────────────────────────── */
  _bindWishlist(modal, product) {
    const btn = modal.querySelector('[data-quick-view="wishlist-btn"]');
    if (!btn) return;

    btn.dataset.productId = product.id;
    const list       = salla.storage.get('salla::wishlist', []);
    const inList     = Array.isArray(list) && list.includes(Number(product.id));
    btn.classList.toggle('is-active', inList);
    btn.setAttribute('aria-pressed', inList ? 'true' : 'false');

    if (btn.dataset.wishlistBound) return;
    btn.dataset.wishlistBound = 'true';

    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.productId);
      if (id && window.salla?.wishlist?.toggle) salla.wishlist.toggle(id);
    });

    salla.wishlist.event.onAdded((_, id) => {
      if (Number(id) === Number(btn.dataset.productId)) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      }
    });

    salla.wishlist.event.onRemoved((_, id) => {
      if (Number(id) === Number(btn.dataset.productId)) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Quick View — share (navigator.share → clipboard fallback)
  ─────────────────────────────────────────────────────────────── */
  _bindShare(modal, product) {
    const btn = modal.querySelector('[data-quick-view="share-btn"]');
    if (!btn) return;

    btn.dataset.productUrl   = product?.url || window.location.href;
    btn.dataset.productTitle = product?.name || document.title;

    if (btn.dataset.shareBound) return;
    btn.dataset.shareBound = 'true';

    btn.addEventListener('click', async () => {
      const url   = btn.dataset.productUrl   || window.location.href;
      const title = btn.dataset.productTitle || document.title;
      try {
        if (navigator.share) { await navigator.share({ title, url }); return; }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          salla.notify?.success?.(title, salla.lang.get('common.copied') || '');
        }
      } catch (_) { /* silent */ }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     Card rendering
  ─────────────────────────────────────────────────────────────── */
  render() {
    const classes = [
      'th-product-card', 's-product-card-vertical', 's-product-card-horizontal',
      's-product-card-fit-height', 's-product-card-special', 's-product-card-full-image',
      's-product-card-minimal', 's-product-card-donation', 's-product-card-shadow',
      's-product-card-out-of-stock',
    ];
    classes.forEach(c => this.classList.remove(c));

    this.classList.add('s-product-card-entry');
    this.setAttribute('id', this.product.id);

    if (!this.horizontal && !this.fullImage && !this.minimal) this.classList.add('s-product-card-vertical');
    if ( this.horizontal && !this.fullImage && !this.minimal) this.classList.add('s-product-card-horizontal');
    if (this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal) this.classList.add('s-product-card-fit-height');
    if (this.isSpecial)                this.classList.add('s-product-card-special');
    if (this.fullImage)                this.classList.add('s-product-card-full-image');
    if (this.minimal)                  this.classList.add('s-product-card-minimal');
    if (this.product?.donation)        this.classList.add('s-product-card-donation');
    if (this.shadowOnHover)            this.classList.add('s-product-card-shadow');
    if (this.product?.is_out_of_stock) this.classList.add('s-product-card-out-of-stock');

    const skin = !this.horizontal && !this.fullImage && !this.minimal && !this.isSpecial && !this.product?.donation;
    if (skin) this.classList.add('th-product-card');

    this._renderCard();
    document.lazyLoadInstance?.update(this.querySelectorAll('.lazy'));
  }

  _renderCard() {
    this.isInWishlist =
      !salla.config.isGuest() &&
      salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));

    const brand         = this.product?.brand?.name ? this._esc(this.product.brand.name) : '';
    const discountBadge = this.product?.is_on_sale   ? this._getDiscountBadge() : '';

    const optionsComp = this.product?.options?.length
      ? `<salla-product-options
           class="th-hidden-options"
           options="${this._esc(JSON.stringify(this.product.options))}"
           product-id="${this.product.id}"
           product-status="${this.product.status}"
           product-type="${this.product.type}">
         </salla-product-options>`
      : '';

    const addBtn = !this.hideAddBtn && !this.horizontal && !this.fullImage
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

    const ratingHtml  = this._getRatingHtml();
    const metaRow     = (ratingHtml || addBtn)
      ? `<div class="s-product-card-meta">${ratingHtml}${addBtn}</div>`
      : '';

    // زر Quick View — يستخدم الدلالة الصحيحة
    const quickViewBtn = !this.horizontal && !this.fullImage
      ? `<button
           type="button"
           class="th-product-quick-view"
           aria-haspopup="dialog"
           aria-label="${this._esc(this.product?.name || '')}">
           <i class="sicon-eye" aria-hidden="true"></i>
         </button>`
      : '';

    const imgClass = salla.url.is_placeholder(this.product?.image?.url)
      ? 'contain'
      : (this.fitImageHeight || 'cover');

    this.innerHTML = `
      <div class="${this.fullImage ? 's-product-card-image-full' : 's-product-card-image'}">
        <a href="${this.product?.url}" aria-label="${this._esc(this.product?.image?.alt || this.product.name)}">
          <img
            class="s-product-card-image-${imgClass} lazy"
            src="${this.placeholder}"
            alt="${this._esc(this.product?.image?.alt || this.product.name)}"
            data-src="${this.product?.image?.url || this.product?.thumbnail || ''}"/>
        </a>

        ${!this.horizontal && !this.fullImage ? `
          <salla-button
            shape="icon" fill="outline" color="light"
            name="product-name-${this.product.id}"
            aria-label="${this._esc(salla.lang.get('pages.products.add_to_wishlist') || 'Wishlist')}"
            class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
            onclick="salla.wishlist.toggle(${this.product.id})"
            data-id="${this.product.id}">
            <i class="sicon-heart"></i>
          </salla-button>` : ''}

        ${quickViewBtn}

        ${!this.fullImage && !this.minimal ? this._getProductBadge() : ''}

        ${this.fullImage ? `<a href="${this.product?.url}" aria-label="${this._esc(this.product.name)}" class="s-product-card-overlay"></a>` : ''}
      </div>

      <div class="s-product-card-content">
        ${metaRow}
        ${brand ? `<span class="s-product-card-brand">${brand}</span>` : ''}
        <h3 class="s-product-card-content-title">
          <a href="${this.product?.url}">${this._esc(this.product?.name)}</a>
        </h3>
        <div class="s-product-card-price-row">
          ${discountBadge}
          ${this.product?.donation?.can_donate ? '' : this._getProductPrice()}
        </div>
        ${optionsComp}
      </div>`;

    /* ربط زر Quick View */
    const qvBtn = this.querySelector('.th-product-quick-view');
    if (qvBtn && !qvBtn.dataset.qvBound) {
      qvBtn.dataset.qvBound = 'true';
      qvBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.openQuickViewModal(e.currentTarget);
      });
    }
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}
