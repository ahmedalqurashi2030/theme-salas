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
  static quickViewState = {
    lastTrigger: null,
  };

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
    this.showCardRating = this.parseBooleanSetting(salla.config.get('theme.settings.card_show_rating'), true);
    this.showCardDiscountBadge = this.parseBooleanSetting(
      salla.config.get('theme.settings.card_show_discount_badge'),
      true,
    );
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

  isUnavailable(product = this.product) {
    return Boolean(
      product?.is_out_of_stock
      || ['out', 'out-and-notify'].includes(product?.status),
    );
  }

  parseBooleanSetting(value, fallback = true) {
    if (value === undefined || value === null || value === '') return fallback;
    if (Array.isArray(value) && value.length) {
      return this.parseBooleanSetting(value[0]?.value ?? value[0]?.selected ?? value[0], fallback);
    }
    if (typeof value === 'object') {
      return this.parseBooleanSetting(value.value ?? value.selected ?? '', fallback);
    }
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;

    const normalized = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
    return fallback;
  }

  parseOptionSetting(value, fallback = '') {
    if (value === undefined || value === null || value === '') return fallback;
    if (Array.isArray(value) && value.length) {
      return this.parseOptionSetting(value[0]?.value ?? value[0]?.selected ?? value[0], fallback);
    }
    if (typeof value === 'object') {
      return this.parseOptionSetting(value.value ?? value.selected ?? '', fallback);
    }
    return String(value).trim() || fallback;
  }

  getLangText(keys, fallback = '') {
    const keyList = Array.isArray(keys) ? keys : [keys];

    for (const key of keyList) {
      if (!key) continue;
      const value = window.salla?.lang?.get?.(key);
      if (value && value !== key) {
        return value;
      }
    }

    return fallback;
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

  getDiscountPercent(product = this.product) {
    const regular = Number(product?.regular_price || 0);
    const sale = Number(product?.sale_price || 0);
    if (!product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round((1 - sale / regular) * 100);
  }

  getDiscountBadgeHtml(product = this.product, className = 'th-product-card-discount-badge') {
    if (!this.showCardDiscountBadge) return '';
    const p = this.getDiscountPercent(product);
    return p ? `<span class="${className}">-${p}%</span>` : '';
  }

  getQuickViewTopBadgeHtml(product = this.product) {
    if (product?.preorder?.label) {
      return `<span class="th-quick-view-top-badge">${this.escapeHTML(product.preorder.label)}</span>`;
    }

    if (product?.promotion_title) {
      return `<span class="th-quick-view-top-badge">${this.escapeHTML(product.promotion_title)}</span>`;
    }

    return '';
  }

  getQuickViewPriceHtml(product = this.product) {
    if (!product) return '';

    if (product.is_on_sale) {
      const discountChip = this.getDiscountBadgeHtml(product, 'th-quick-view-discount-chip');

      return `<div class="s-product-card-sale-price">
        <div class="th-quick-view-sale-row">
          <h4>${this.getPriceFormat(product.sale_price)}</h4>
          ${discountChip}
        </div>
        <span class="th-quick-view-regular-price">${this.getPriceFormat(product?.regular_price)}</span>
      </div>`;
    }

    if (product.starting_price) {
      return `<div class="s-product-card-starting-price">
        <p>${this.startingPrice}</p>
        <h4>${this.getPriceFormat(product?.starting_price)}</h4>
      </div>`;
    }

    return `<h4 class="s-product-card-price">${this.getPriceFormat(product?.price)}</h4>`;
  }

  getRatingHtml() {
    if (!this.showCardRating) return '';
    const ratingValue = Number(this.product?.rating?.stars || 0);
    const ratingCount = Number(this.product?.rating?.count || 0);
    const hasRatingValue = ratingValue > 0;
    const normalizedValue = hasRatingValue
      ? (Number.isInteger(ratingValue) ? ratingValue.toFixed(0) : ratingValue.toFixed(1))
      : '';

    // Style: (Count) Value Star -- RTL: Star Value (Count)
    // Structure: Icon - Value - Count
    return '<div class="s-product-card-rating text-sm flex items-center gap-1">'
      + `<span class="text-gray-400 text-xs">(${salla.helpers.number(ratingCount)})</span>`
      + (hasRatingValue ? `<span class="font-bold text-gray-600">${normalizedValue}</span>` : '')
      + `<i class="sicon-star2 ${hasRatingValue ? 'text-amber-400' : 'text-gray-300'}"></i>`
      + '</div>';
  }

  getQuickViewModal() {
    return document.getElementById('product-quick-view-modal');
  }

  resetQuickViewModalState(modal) {
    modal.classList.remove('is-loading');
  }

  resolveQuickViewProduct() {
    return this.product || null;
  }

  getQuickViewImages(product) {
    const images = [];
    const pushImage = (image) => {
      const url = image?.url || image?.thumbnail || '';
      if (!url || images.some((existingImage) => existingImage.url === url)) return;
      images.push({
        url,
        alt: image?.alt || product?.name || '',
      });
    };

    pushImage(product?.image);
    if (Array.isArray(product?.images)) {
      product.images.forEach(pushImage);
    }
    if (!images.length && product?.thumbnail) {
      pushImage({ url: product.thumbnail, alt: product?.name || '' });
    }

    return images;
  }

  getFocusableElements(modal) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'salla-add-product-button',
    ];

    return Array.from(modal.querySelectorAll(selectors.join(','))).filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.getAttribute('aria-hidden') === 'true') return false;
      return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    });
  }

  focusQuickViewModal(modal) {
    window.requestAnimationFrame(() => {
      const closeButton = modal.querySelector('[data-quick-view="close-btn"]');
      const addButton = modal.querySelector('[data-quick-view="add-button"] salla-add-product-button');
      const firstFocusable = this.getFocusableElements(modal)[0];
      const focusTarget = closeButton || addButton || firstFocusable || modal;
      focusTarget?.focus?.({ preventScroll: true });
    });
  }

  restoreQuickViewFocus() {
    const trigger = ProductCard.quickViewState.lastTrigger;
    ProductCard.quickViewState.lastTrigger = null;
    if (!(trigger instanceof HTMLElement)) return;

    window.setTimeout(() => {
      if (!document.contains(trigger)) return;
      trigger.focus({ preventScroll: true });
    }, 360);
  }

  closeQuickViewModal(modal) {
    if (!modal) return;

    const modalId = '#product-quick-view-modal';
    if (window.app && typeof app?.toggleModal === 'function') {
      app.toggleModal(modalId, false);
    } else {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    this.restoreQuickViewFocus();
  }

  bindQuickViewModalEvents(modal) {
    if (!modal || modal.dataset.quickViewBound === 'true') return;
    modal.dataset.quickViewBound = 'true';

    modal.addEventListener('click', (event) => {
      const clickedElement = event.target instanceof Element ? event.target : null;
      const closeTrigger = clickedElement?.closest?.('[data-close-modal="product-quick-view-modal"]');
      if (!closeTrigger) return;

      event.preventDefault();
      event.stopPropagation();
      this.closeQuickViewModal(modal);
    });

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.closeQuickViewModal(modal);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusables = this.getFocusableElements(modal);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const dragHandle = modal.querySelector('[data-quick-view="drag-handle"]');
    if (dragHandle && dragHandle.dataset.quickViewSwipeBound !== 'true') {
      dragHandle.dataset.quickViewSwipeBound = 'true';
      let startY = 0;
      let startX = 0;
      let deltaY = 0;

      dragHandle.addEventListener('touchstart', (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        startY = touch.clientY;
        startX = touch.clientX;
        deltaY = 0;
      }, { passive: true });

      dragHandle.addEventListener('touchmove', (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        const nextDeltaY = touch.clientY - startY;
        const deltaX = Math.abs(touch.clientX - startX);

        if (nextDeltaY > 0 && nextDeltaY > deltaX) {
          deltaY = nextDeltaY;
        }
      }, { passive: true });

      dragHandle.addEventListener('touchend', () => {
        if (deltaY > 70) {
          this.closeQuickViewModal(modal);
        }
        deltaY = 0;
      }, { passive: true });
    }

    const observer = new MutationObserver(() => {
      if (modal.getAttribute('aria-hidden') === 'true' || modal.classList.contains('hidden')) {
        this.restoreQuickViewFocus();
      }
    });
    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class'],
    });
  }

  openQuickViewModal(triggerElement = null) {
    const modal = this.getQuickViewModal();
    const product = this.resolveQuickViewProduct();
    if (!modal || !product) return;

    this.bindQuickViewModalEvents(modal);
    ProductCard.quickViewState.lastTrigger = triggerElement instanceof HTMLElement
      ? triggerElement
      : document.activeElement;

    modal.dataset.quickViewQty = '1';
    this.resetQuickViewModalState(modal);

    // Populate immediately from available card data (no loading overlay).
    try {
      this.populateQuickViewModal(modal, product);
      this.resetQuickViewModalState(modal);
    } catch (error) {
      this.resetQuickViewModalState(modal);
      if (window.salla?.log) {
        window.salla.log(`ThemeApp(Raed)::Quick view rendering failed ${error?.message ? `- ${error.message}` : ''}`);
      }
    }

    const modalId = '#product-quick-view-modal';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    if (window.app && typeof app?.toggleModal === 'function') {
      app.toggleModal(modalId, true);
    }

    window.requestAnimationFrame(() => {
      this.focusQuickViewModal(modal);
    });
  }


  renderQuickViewGallery(modal, images = [], productName = '') {
    const imageEl = modal.querySelector('[data-quick-view="image"]');
    const galleryEl = modal.querySelector('[data-quick-view="gallery"]');
    if (!imageEl || !galleryEl) return;

    if (!images.length) {
      galleryEl.classList.remove('is-single');
      galleryEl.classList.add('hidden');
      galleryEl.innerHTML = '';
      return;
    }

    imageEl.src = images[0].url;
    imageEl.alt = this.escapeHTML(images[0].alt || productName || '');


    galleryEl.innerHTML = images
      .map((image, index) => `
        <button
          type="button"
          class="th-quick-view-thumb ${index === 0 ? 'is-active' : ''}"
          data-src="${this.escapeHTML(image.url)}"
          data-alt="${this.escapeHTML(image.alt || productName || '')}"
          aria-label="${this.escapeHTML(productName || this.getLangText('common.product_details', 'Product'))} ${index + 1}">
          <img src="${this.escapeHTML(image.url)}" alt="${this.escapeHTML(image.alt || productName || '')}" loading="lazy"/>
        </button>
      `)
      .join('');

    galleryEl.classList.toggle('is-single', images.length === 1);
    galleryEl.classList.remove('hidden');

    if (galleryEl.dataset.boundGallery === 'true') return;
    galleryEl.dataset.boundGallery = 'true';

    galleryEl.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest?.('.th-quick-view-thumb');
      if (!button || !galleryEl.contains(button)) return;

      const src = button.dataset.src;
      if (!src) return;

      imageEl.src = src;
      imageEl.alt = button.dataset.alt || productName || '';

      galleryEl
        .querySelectorAll('.th-quick-view-thumb.is-active')
        .forEach((thumb) => thumb.classList.remove('is-active'));
      button.classList.add('is-active');
    });
  }

  renderQuickViewRating(modal, product) {
    const ratingEl = modal.querySelector('[data-quick-view="rating"]');
    if (!ratingEl) return;

    if (!this.showCardRating) {
      ratingEl.innerHTML = '';
      ratingEl.classList.add('hidden');
      return;
    }

    const ratingValue = Number(product?.rating?.stars || 0);
    const ratingCount = Number(product?.rating?.count || 0);
    const hasRatingValue = ratingValue > 0;
    const normalizedValue = hasRatingValue
      ? (Number.isInteger(ratingValue) ? ratingValue.toFixed(0) : ratingValue.toFixed(1))
      : '';

    ratingEl.classList.remove('hidden');
    ratingEl.innerHTML = `
      <i class="sicon-star2 ${hasRatingValue ? 'text-amber-400' : 'text-gray-300'}" aria-hidden="true"></i>
      ${hasRatingValue ? `<b>${normalizedValue}</b>` : ''}
      <span>(${salla.helpers.number(ratingCount)})</span>
    `;
  }

  renderQuickViewTax(modal, product) {
    const taxEl = modal.querySelector('[data-quick-view="tax"]');
    if (!taxEl) return;

    const isTaxIncluded = Boolean(
      product?.is_taxable || salla.config.get('store.settings.tax.taxable_prices_enabled'),
    );
    const taxText = this.getLangText('pages.products.tax_included', '');
    taxEl.textContent = isTaxIncluded ? taxText : '';
    taxEl.classList.toggle('hidden', !isTaxIncluded || !taxText);
  }

  renderQuickViewNotify(modal, product) {
    const notifyEl = modal.querySelector('[data-quick-view="notify"]');
    if (!notifyEl) return;

    const canNotify = Boolean(product?.notify_availability && this.isUnavailable(product));
    const notifyLabel =
      window.salla?.lang?.get?.('pages.products.notify_me')
      || 'Notify me when available';
    if (!canNotify || !notifyLabel) {
      notifyEl.innerHTML = '';
      notifyEl.classList.add('hidden');
      return;
    }

    notifyEl.innerHTML = `<span>${this.escapeHTML(notifyLabel)}</span>`;
    notifyEl.classList.remove('hidden');
  }

  stripHtml(text = '') {
    return String(text)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  renderQuickViewDescription(modal, product) {
    const descriptionEl = modal.querySelector('[data-quick-view="description"]');
    if (!descriptionEl) return;

    const plainDescription = this.stripHtml(product?.description || '');
    if (!plainDescription) {
      descriptionEl.innerHTML = '';
      descriptionEl.classList.add('hidden');
      descriptionEl.classList.remove('is-expanded');
      return;
    }

    const htmlLang = document?.documentElement?.lang || '';
    const isArabic = htmlLang.toLowerCase().startsWith('ar');
    const maxLength = 235;
    const isLong = plainDescription.length > maxLength;
    const shortDescription = isLong ? `${plainDescription.slice(0, maxLength).trim()}...` : plainDescription;
    const sectionTitle = this.getLangText('common.product_details', isArabic ? '\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C' : 'Product details');
    const readMoreText = this.getLangText([
      'components.product_tabs.read_more',
      'common.read_more',
    ], isArabic ? '\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0632\u064A\u062F' : 'Read more');
    const readLessText = this.getLangText('components.product_tabs.read_less', isArabic ? '\u0639\u0631\u0636 \u0623\u0642\u0644' : 'Read less');

    descriptionEl.innerHTML = `
      <h4 class="th-quick-view-description-title">${this.escapeHTML(sectionTitle)}</h4>
      <p class="th-quick-view-description-text">${this.escapeHTML(shortDescription)}</p>
      ${isLong ? `<button type="button" class="th-quick-view-description-toggle" data-quick-view="description-toggle" aria-expanded="false">${this.escapeHTML(readMoreText)}</button>` : ''}
    `;
    descriptionEl.classList.remove('hidden');
    descriptionEl.classList.remove('is-expanded');

    if (!isLong) return;
    const toggleButton = descriptionEl.querySelector('[data-quick-view="description-toggle"]');
    if (!toggleButton || toggleButton.dataset.boundToggle === 'true') return;

    toggleButton.dataset.boundToggle = 'true';
    toggleButton.addEventListener('click', () => {
      const isExpanded = descriptionEl.classList.toggle('is-expanded');
      const textEl = descriptionEl.querySelector('.th-quick-view-description-text');
      if (textEl) {
        textEl.textContent = isExpanded ? plainDescription : shortDescription;
      }
      toggleButton.textContent = isExpanded ? readLessText : readMoreText;
      toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  }

  getQuickViewQuantity(modal) {
    const parsed = Number(modal?.dataset?.quickViewQty || 1);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.round(parsed);
  }

  setQuickViewQuantity(modal, value) {
    const normalized = Math.min(99, Math.max(1, Math.round(Number(value) || 1)));
    modal.dataset.quickViewQty = String(normalized);

    const quantityComponent = modal.querySelector('[data-quick-view="qty-input"]');
    const quantityInput = quantityComponent?.querySelector?.('input[name="quantity"], input');

    if (quantityInput) {
      const currentValue = Number(quantityInput.value || 0);
      if (currentValue !== normalized) {
        if (typeof quantityComponent?.setValue === 'function') {
          quantityComponent.setValue(normalized, false);
        } else {
          quantityInput.value = String(normalized);
          quantityComponent?.setAttribute?.('value', String(normalized));
        }
      }
    } else if (quantityComponent) {
      quantityComponent.setAttribute('value', String(normalized));
    }

    const addButton = modal.querySelector('[data-quick-view="add-button"] salla-add-product-button');
    if (addButton) {
      addButton.setAttribute('quantity', String(normalized));
    }
  }

  bindQuickViewQuantityControls(modal) {
    if (!modal || modal.dataset.quickViewQtyBound === 'true') return;
    modal.dataset.quickViewQtyBound = 'true';

    const quantityComponent = modal.querySelector('[data-quick-view="qty-input"]');
    if (!quantityComponent) return;

    const syncQuantity = (nextValue) => {
      this.setQuickViewQuantity(modal, nextValue);
    };

    const bindQuantityInput = () => {
      const quantityInput = quantityComponent.querySelector('input[name="quantity"], input');
      if (!quantityInput || quantityInput.dataset.quickViewQtyInputBound === 'true') return;

      quantityInput.dataset.quickViewQtyInputBound = 'true';
      syncQuantity(quantityInput.value);

      ['change', 'input'].forEach((eventName) => {
        quantityInput.addEventListener(eventName, (event) => {
          syncQuantity(event.target?.value || quantityInput.value);
        });
      });
    };

    bindQuantityInput();

    if (quantityComponent.dataset.quickViewQtyComponentBound !== 'true') {
      quantityComponent.dataset.quickViewQtyComponentBound = 'true';
      quantityComponent.addEventListener('change', () => {
        const quantityInput = quantityComponent.querySelector('input[name="quantity"], input');
        syncQuantity(quantityInput?.value || quantityComponent.getAttribute('value') || 1);
      });
    }

    const observer = new MutationObserver(() => {
      bindQuantityInput();
      const quantityInput = quantityComponent.querySelector('input[name="quantity"], input');
      if (quantityInput) {
        syncQuantity(quantityInput.value);
      }
    });

    observer.observe(quantityComponent, { childList: true, subtree: true });
  }

  populateQuickViewModal(modal, product = this.product) {
    const imageEl = modal.querySelector('[data-quick-view="image"]');
    const titleEl = modal.querySelector('[data-quick-view="title"]');
    const brandEl = modal.querySelector('[data-quick-view="brand"]');
    const priceEl = modal.querySelector('[data-quick-view="price"]');
    const badgeEl = modal.querySelector('[data-quick-view="badge"]');
    const addBtnContainer = modal.querySelector('[data-quick-view="add-button"]');
    const linkEl = modal.querySelector('[data-quick-view="link"]');
    const stockEl = modal.querySelector('[data-quick-view="stock"]');
    const wishlistBtn = modal.querySelector('[data-quick-view="wishlist-btn"]');
    const shareEl = modal.querySelector('[data-quick-view="share"]');
    const shareTrigger = modal.querySelector('[data-quick-view="share-trigger"]');
    const quantityWrap = modal.querySelector('.th-quick-view-qty-wrap');

    const images = this.getQuickViewImages(product);
    if (!images.length && imageEl) {
      imageEl.src = product?.image?.url || product?.thumbnail || this.placeholder || imageEl.src;
      imageEl.alt = this.escapeHTML(product?.image?.alt || product?.name || '');
    }
    this.renderQuickViewGallery(modal, images, product?.name || '');

    if (titleEl) {
      titleEl.textContent = product?.name || '';
    }

    if (brandEl) {
      const brandName = product?.brand?.name || '';
      brandEl.textContent = brandName;
      brandEl.classList.toggle('hidden', !brandName);
    }

    if (badgeEl) {
      const topBadgeHtml = this.getQuickViewTopBadgeHtml(product);
      badgeEl.innerHTML = topBadgeHtml;
      badgeEl.classList.toggle('hidden', !topBadgeHtml);
    }

    const priceHtml = product?.donation?.can_donate ? '' : this.getQuickViewPriceHtml(product);

    if (priceEl) {
      priceEl.innerHTML = priceHtml;
      priceEl.closest('.th-quick-view-price-box')?.classList.toggle('hidden', !priceHtml);
    }

    const primaryActionsEl = modal.querySelector('[data-quick-view="primary-actions"]');
    const isOutOfStock = this.isUnavailable(product);
    const isDonationProduct = Boolean(product?.donation?.can_donate);
    const canShowAddButton = !isDonationProduct && !isOutOfStock;
    const outOfStockLabel = this.escapeHTML(
      this.outOfStock || this.getLangText('pages.products.out_of_stock', 'Out of stock'),
    );

    quantityWrap?.classList.toggle('hidden', !canShowAddButton);

    if (addBtnContainer) {
      if (isOutOfStock && !isDonationProduct) {
        addBtnContainer.innerHTML = `
          <salla-button
            type="button"
            fill="solid"
            disabled
            aria-disabled="true"
            class="w-full th-quick-view-add-btn th-quick-view-add-btn--disabled">
            ${outOfStockLabel}
          </salla-button>
        `;
        primaryActionsEl?.classList.remove('is-link-only');
      } else if (!canShowAddButton) {
        addBtnContainer.innerHTML = '';
        primaryActionsEl?.classList.add('is-link-only');
      } else {
        const notifyChannels = Array.isArray(product?.notify_availability?.channels)
          ? product.notify_availability.channels.join(',')
          : '';
        const notifySubscribedOptions = product?.notify_availability?.subscribed_options
          ? this.escapeHTML(JSON.stringify(product.notify_availability.subscribed_options))
          : '';
        const notifyAttributes = [
          product?.notify_availability?.subscribed ? 'is-subscribed' : '',
          notifyChannels ? `channels="${this.escapeHTML(notifyChannels)}"` : '',
          notifySubscribedOptions ? `subscribed-options="${notifySubscribedOptions}"` : '',
          product?.notify_availability?.options ? 'notify-options-availability' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const buttonLabel = this.escapeHTML(
          product?.add_to_cart_label
          || this.getLangText([
            'common.add_to_cart',
            'pages.products.add_to_cart',
          ], 'Add to Cart'),
        );

        addBtnContainer.innerHTML = `
          <salla-add-product-button
            fill="solid"
            product-id="${product.id}"
            product-status="${product.status}"
            product-type="${product.type}"
            class="w-full th-quick-view-add-btn"
            quantity="${this.getQuickViewQuantity(modal)}"
            ${notifyAttributes}>
            ${buttonLabel}
          </salla-add-product-button>
        `;
        primaryActionsEl?.classList.remove('is-link-only');
      }
    }
    if (linkEl) {
      linkEl.href = product?.url || '#';
    }

    if (stockEl) {
      stockEl.textContent = isOutOfStock ? this.outOfStock || '' : '';
      stockEl.classList.toggle('hidden', !isOutOfStock);
    }

    this.renderQuickViewRating(modal, product);
    this.renderQuickViewTax(modal, product);
    this.renderQuickViewNotify(modal, product);
    this.renderQuickViewDescription(modal, product);
    this.bindQuickViewQuantityControls(modal);
    this.setQuickViewQuantity(modal, this.getQuickViewQuantity(modal));

    if (wishlistBtn) {
      wishlistBtn.dataset.productId = product.id;
      const wishlistItems = salla.storage.get('salla::wishlist', []);
      const isInWishlist = Array.isArray(wishlistItems) && wishlistItems.includes(Number(product.id));
      wishlistBtn.classList.toggle('is-active', isInWishlist);
      wishlistBtn.setAttribute('aria-pressed', isInWishlist ? 'true' : 'false');

      if (!wishlistBtn.dataset.boundWishlist) {
        wishlistBtn.dataset.boundWishlist = 'true';
        wishlistBtn.addEventListener('click', () => {
          const id = Number(wishlistBtn.dataset.productId);
          if (!id || !window.salla?.wishlist?.toggle) return;
          window.salla.wishlist.toggle(id);
        });
      }
    }

    if (shareEl) {
      const shareUrl = product?.url || window.location.href;
      const shareTitle = product?.name || document.title;
      shareEl.setAttribute('url', shareUrl);
      shareEl.setAttribute('url-name', shareTitle);
      if (typeof shareEl.refresh === 'function') {
        shareEl.refresh();
      }
    }

    if (shareEl && shareTrigger && shareTrigger.dataset.boundShareTrigger !== 'true') {
      shareTrigger.dataset.boundShareTrigger = 'true';
      shareTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        shareEl.open?.();
      });
    }
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
    const ratingHtml = this.getRatingHtml();
    const metaRowHtml = (ratingHtml || addToCartBtn)
      ? `<div class="s-product-card-meta">
          ${ratingHtml}
          ${addToCartBtn}
        </div>`
      : '';
    const quickViewBtn = !this.horizontal && !this.fullImage
      ? `<button
            type="button"
            class="th-product-quick-view"
            aria-label="${this.escapeHTML(this.product?.name || '')}">
            <i class="sicon-eye"></i>
         </button>`
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

        ${quickViewBtn}

        ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}

        ${this.fullImage ? `<a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product.name)}" class="s-product-card-overlay"></a>` : ''}
      </div>

      <div class="s-product-card-content">
        <!-- Row 1: Rating + Add to Cart Button -->
        ${metaRowHtml}

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

    const quickViewTrigger = this.querySelector('.th-product-quick-view');
    if (quickViewTrigger && !quickViewTrigger.dataset.boundQuickView) {
      quickViewTrigger.dataset.boundQuickView = 'true';
      quickViewTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openQuickViewModal(event.currentTarget);
      });
    }
  }
}

if (!customElements.get('custom-salla-product-card')) {
  customElements.define('custom-salla-product-card', ProductCard);
}

