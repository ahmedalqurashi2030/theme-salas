(() => {
  const TAG = 'custom-salla-product-card';

  function calcDiscountPercent(product) {
    const regular = Number(product?.regular_price || product?.price || 0);
    const sale = Number(product?.sale_price || 0);
    if (!product?.is_on_sale || !regular || !sale || sale >= regular) return null;
    return Math.round((1 - sale / regular) * 100);
  }

  function enhance(cardEl) {
    if (!cardEl || !cardEl.querySelector) return;

    // Hook class (اختياري للستايل)
    cardEl.classList.add('th-product-card');

    // 1) نقل البراند تحت التقييم (بدون كسر)
    const meta = cardEl.querySelector('.s-product-card-meta');
    const title = cardEl.querySelector('.s-product-card-content-title');
    const brand = cardEl.querySelector('.s-product-card-brand');
    if (meta && title && brand && meta.contains(brand)) {
      meta.removeChild(brand);
      title.parentNode.insertBefore(brand, title); // يصير قبل العنوان مباشرة
    }

    // 2) إضافة بادج نسبة الخصم (لو المنتج Sale)
    const product = cardEl.product;
    if (!product) return;
    if (product?.donation?.can_donate) return; // لا نعبث بمنتجات التبرع

    const percent = calcDiscountPercent(product);
    if (!percent || percent <= 0) return;

    const priceRow =
      cardEl.querySelector('.s-product-card-price-row') ||
      cardEl.querySelector('.s-product-card-content');

    if (!priceRow) return;

    // تجنب التكرار
    if (!cardEl.querySelector('.th-product-card-discount-badge')) {
      const badge = document.createElement('span');
      badge.className = 'th-product-card-discount-badge';
      badge.textContent = `-${percent}%`;
      priceRow.prepend(badge);
    }
  }

  function patchRender() {
    const Ctor = customElements.get(TAG);
    if (!Ctor?.prototype?.render) return;

    if (Ctor.prototype.__tharaaPatched) return;
    Ctor.prototype.__tharaaPatched = true;

    const originalRender = Ctor.prototype.render;

    Ctor.prototype.render = function (...args) {
      const res = originalRender.apply(this, args);
      try { enhance(this); } catch (_) {}
      return res;
    };
  }

  if (customElements.get(TAG)) patchRender();
  else customElements.whenDefined(TAG).then(patchRender);

  // في حال كانت فيه بطاقات انعرضت قبل تحميل الملف
  document.addEventListener('theme::ready', () => {
    document.querySelectorAll(TAG).forEach((el) => {
      try { enhance(el); } catch (_) {}
    });
  });
})();
