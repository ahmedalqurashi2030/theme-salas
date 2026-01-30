/**
 * Tharaa Product Card Web Component
 * Version: 2.0.0
 */

class TharaaProductCard extends HTMLElement {
  
  static CONFIG = {
    version: '2.0.0',
    debug: false,
    enableDiscountBadge: true
  };

  constructor() {
    super();
    this.product = null;
  }

  connectedCallback() {
    // Wait for theme ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    const productData = this.getAttribute('product');
    if (!productData) return;

    try {
      this.product = JSON.parse(productData);
      this.addDiscountBadge();
      this.updateLazyLoad();
    } catch (error) {
      if (TharaaProductCard.CONFIG.debug) {
        console.error('[TharaaProductCard]', error);
      }
    }
  }

  addDiscountBadge() {
    if (!TharaaProductCard.CONFIG.enableDiscountBadge) return;
    if (!this.product?.is_on_sale) return;
    
    const discount = this.calculateDiscount();
    if (!discount) return;

    const badge = document.createElement('div');
    badge.className = 'th-discount-badge';
    badge.textContent = `-${discount}%`;

    const card = this.querySelector('.salla-product-card, .s-product-card-entry');
    if (card) {
      const imageContainer = card.querySelector('.product-entry__image, > a:first-child');
      if (imageContainer) {
        imageContainer.style.position = 'relative';
        imageContainer.appendChild(badge);
      }
    }
  }

  calculateDiscount() {
    const { regular_price, sale_price } = this.product;
    if (!regular_price || !sale_price) return null;
    
    return Math.round(((regular_price - sale_price) / regular_price) * 100);
  }

  updateLazyLoad() {
    setTimeout(() => {
      const images = this.querySelectorAll('img.lazy');
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.getAttribute('data-src');
              if (src) {
                img.src = src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
              }
            }
          });
        });

        images.forEach(img => observer.observe(img));
      } else {
        images.forEach(img => {
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
          }
        });
      }
    }, 100);
  }

  log(message, data) {
    if (TharaaProductCard.CONFIG.debug) {
      console.log(`[TharaaProductCard v${TharaaProductCard.CONFIG.version}]`, message, data);
    }
  }
}

// Register Web Component
if ('customElements' in window) {
  customElements.define('custom-salla-product-card', TharaaProductCard);
}

export default TharaaProductCard;