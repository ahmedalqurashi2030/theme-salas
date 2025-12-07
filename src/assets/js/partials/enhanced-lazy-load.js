/**
 * Enhanced Lazy Loading System
 * نظام محسّن لتحميل الصور بشكل كسول لتحسين الأداء
 */

class EnhancedLazyLoad {
  constructor() {
    this.imageObserver = null;
    this.intersectionOptions = {
      root: null,
      rootMargin: '50px', // بدء التحميل قبل 50px من ظهور الصورة
      threshold: 0.01
    };
    this.init();
  }

  init() {
    // استخدام Intersection Observer API إذا كان متاحاً
    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      // Fallback للمتصفحات القديمة
      this.initFallback();
    }

    // تحميل الصور المرئية فوراً
    this.loadVisibleImages();
  }

  initIntersectionObserver() {
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, this.intersectionOptions);

    // مراقبة جميع الصور مع class lazy أو lazy-load (تجنب الصور التي تم تحميلها بالفعل)
    document.querySelectorAll('img.lazy, img.lazy-load, img[data-src]').forEach(img => {
      // تجنب الصور التي تم تحميلها بالفعل أو التي تستخدم نظام سلة
      if (!img.dataset.loaded && !img.classList.contains('swiper-lazy')) {
        this.imageObserver.observe(img);
      }
    });
  }

  initFallback() {
    // للمتصفحات القديمة - تحميل جميع الصور بعد تحميل الصفحة
    window.addEventListener('load', () => {
      document.querySelectorAll('img.lazy, img.lazy-load, img[data-src]').forEach(img => {
        this.loadImage(img);
      });
    });
  }

  loadVisibleImages() {
    // تحميل الصور المرئية فوراً بدون انتظار (تجنب الصور التي تستخدم نظام سلة)
    const images = document.querySelectorAll('img.lazy, img.lazy-load, img[data-src]');
    images.forEach(img => {
      // تجنب الصور التي تستخدم نظام lazy loading الخاص بسلة
      if (!img.classList.contains('swiper-lazy') && !img.dataset.loaded) {
        if (this.isElementInViewport(img)) {
          this.loadImage(img);
        }
      }
    });
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  loadImage(img) {
    // تجنب إعادة التحميل
    if (img.dataset.loaded === 'true') {
      return;
    }

    const dataSrc = img.dataset.src || img.getAttribute('data-src');
    if (!dataSrc) {
      return;
    }

    // إضافة class للتحميل
    img.classList.add('lazy-loading');

    // إنشاء صورة جديدة للتحقق من التحميل
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = dataSrc;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      img.dataset.loaded = 'true';
      
      // إزالة data-src بعد التحميل
      img.removeAttribute('data-src');
      
      // إرسال حدث مخصص
      img.dispatchEvent(new CustomEvent('lazyloaded', { detail: { img } }));
    };

    imageLoader.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      console.warn('Failed to load image:', dataSrc);
    };

    // بدء تحميل الصورة
    imageLoader.src = dataSrc;
  }

  // تحديث الصور الجديدة (مفيد عند إضافة محتوى ديناميكي)
  update(newImages = null) {
    const images = newImages || document.querySelectorAll('img.lazy, img.lazy-load, img[data-src]:not([data-loaded="true"])');
    
    images.forEach(img => {
      if (this.imageObserver) {
        this.imageObserver.observe(img);
      } else if (this.isElementInViewport(img)) {
        this.loadImage(img);
      }
    });
  }

  // إعادة تحميل صورة معينة
  reload(img) {
    if (img.dataset.src) {
      img.dataset.loaded = 'false';
      img.src = img.dataset.placeholder || 'images/s-empty.png';
      img.classList.remove('lazy-loaded', 'lazy-error');
      this.loadImage(img);
    }
  }
}

// تصدير للاستخدام في ملفات أخرى
export default EnhancedLazyLoad;

// تم تعطيل التهيئة التلقائية لتجنب التعارض مع نظام lazy loading الخاص بسلة
// لتفعيله يدوياً، استخدم: window.enhancedLazyLoad = new EnhancedLazyLoad();
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => {
//     window.enhancedLazyLoad = new EnhancedLazyLoad();
//   });
// } else {
//   window.enhancedLazyLoad = new EnhancedLazyLoad();
// }
