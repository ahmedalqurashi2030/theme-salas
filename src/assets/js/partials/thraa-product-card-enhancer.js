/**
 * Thraa Product Card Enhancer
 * - يحوّل عناصر المنتج الحالية التي تُرسل attribute "product" إلى <thraa-product-card>
 * - ينسخ جميع attributes (باستثناء بعض الحالات إن أردت استبعادها)
 * - ينتظر حتى يتم تعريف "thraa-product-card" لضمان عمل replace بأمان
 *
 * ضع هذا الملف بعد تحميل thraa-product-card.js في master.twig (defer).
 */

(function () {
    const TAGS_TO_REPLACE = [
      'salla-product-card',
      'custom-salla-product-card',
      'salla-product-card', // احتياط
      'thraa-product-card'  // idempotent (يتجاهل العناصر التي بالفعل thraa)
    ];
  
    function replaceElementsWithThraa() {
      try {
        TAGS_TO_REPLACE.forEach(tag => {
          // نبحث فقط عن العناصر التي تحتوي attribute product (JSON) أو data-product
          const selector = `${tag}[product], ${tag}[data-product]`;
          document.querySelectorAll(selector).forEach(oldEl => {
            // إذا العنصر هو بالفعل thraa-product-card لا نفعل شيئاً
            if (oldEl.tagName.toLowerCase() === 'thraa-product-card') return;
  
            // احصل على قيمة product (قد تكون HTML-encoded JSON)
            const productAttr = oldEl.getAttribute('product') || oldEl.getAttribute('data-product') || null;
  
            // أنشئ العنصر الجديد
            const newEl = document.createElement('thraa-product-card');
  
            // انسخ جميع attributes من القديم إلى الجديد (ما عدا بعض السمات حساسة إن أردت)
            Array.from(oldEl.attributes).forEach(attr => {
              try {
                // إذا attr هو "is" أو عُنوان بيانات أخرى اتركها كما هي
                newEl.setAttribute(attr.name, attr.value);
              } catch (e) {
                // تجاوز أي خطأ بإعداد attribute غير صالح
                console.warn('thraa-enhancer: failed to copy attribute', attr.name, e);
              }
            });
  
            // إذا كان productAttr موجودًا وتأكدنا أنه ليس خالياً، أضعه أيضاً
            if (productAttr && !newEl.getAttribute('product')) {
              newEl.setAttribute('product', productAttr);
            }
  
            // انسخ الـ dataset كوسيلة إضافية
            // استبدل العنصر القديم بالجديد
            oldEl.replaceWith(newEl);
          });
        });
      } catch (err) {
        console.error('thraa-enhancer error', err);
      }
    }
  
    // wait for thraa-product-card custom element (max timeout fallback)
    function waitForCustomAndRun(tagName, cb, timeout = 3000) {
      if (customElements.get(tagName)) {
        cb();
        return;
      }
      const observer = new MutationObserver(() => {
        if (customElements.get(tagName)) {
          observer.disconnect();
          cb();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
  
      // fallback timeout: إذا لم يُعرّف العنصر بعد timeout نفذ العملية على أي حال
      setTimeout(() => {
        try {
          if (!customElements.get(tagName)) {
            console.warn('thraa-enhancer: custom element not defined within timeout, proceeding anyway.');
          }
        } finally {
          cb();
        }
      }, timeout);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        waitForCustomAndRun('thraa-product-card', replaceElementsWithThraa);
      });
    } else {
      waitForCustomAndRun('thraa-product-card', replaceElementsWithThraa);
    }
  })();