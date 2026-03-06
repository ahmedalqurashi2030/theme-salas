(function () {
  const patchProductCardQuickView = () => {
    const ProductCard = customElements.get('custom-salla-product-card');
    if (!ProductCard || ProductCard.prototype.__quickViewUxPatched === 'true') {
      return;
    }

    ProductCard.prototype.__quickViewUxPatched = 'true';

    ProductCard.prototype.renderQuickViewDescription = function renderQuickViewDescription(modal, product) {
      const descriptionEl = modal.querySelector('[data-quick-view="description"]');
      if (!descriptionEl) return;

      const plainDescription = this.stripHtml(product?.description || '');
      if (!plainDescription) {
        descriptionEl.innerHTML = '';
        descriptionEl.classList.add('hidden');
        descriptionEl.classList.remove('is-expanded');
        return;
      }

      const maxLength = 235;
      const isLong = plainDescription.length > maxLength;
      const shortDescription = isLong ? `${plainDescription.slice(0, maxLength).trim()}...` : plainDescription;
      const sectionTitle =
        window.salla?.lang?.get?.('common.product_details')
        || 'Product details';
      const readMoreText =
        window.salla?.lang?.get?.('components.product_tabs.read_more')
        || window.salla?.lang?.get?.('common.read_more')
        || 'Read more';
      const readLessText =
        window.salla?.lang?.get?.('components.product_tabs.read_less')
        || 'Read less';

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
    };

    ProductCard.prototype.setQuickViewQuantity = function setQuickViewQuantity(modal, value) {
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
    };

    ProductCard.prototype.bindQuickViewQuantityControls = function bindQuickViewQuantityControls(modal) {
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
    };

    const originalPopulateQuickViewModal = ProductCard.prototype.populateQuickViewModal;
    ProductCard.prototype.populateQuickViewModal = function populateQuickViewModal(modal, product = this.product) {
      originalPopulateQuickViewModal.call(this, modal, product);

      const priceEl = modal.querySelector('[data-quick-view="price"]');
      const priceBox = modal.querySelector('.th-quick-view-price-box');
      const hasPrice = Boolean(priceEl && priceEl.innerHTML && priceEl.innerHTML.trim());
      priceBox?.classList.toggle('hidden', !hasPrice);

      const primaryActionsEl = modal.querySelector('[data-quick-view="primary-actions"]');
      const addButton = modal.querySelector('[data-quick-view="add-button"] salla-add-product-button');
      primaryActionsEl?.classList.toggle('hidden', !addButton);
    };
  };

  if (customElements.get('custom-salla-product-card')) {
    patchProductCardQuickView();
    return;
  }

  customElements.whenDefined('custom-salla-product-card')
    .then(patchProductCardQuickView)
    .catch(() => {});
}());