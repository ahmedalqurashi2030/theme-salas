/**
 * Thraa Product Card — lightweight custom element
 * Usage: <thraa-product-card product='{"id":1,"name":"X","image":{"url":"..."},"price":{"formatted":"₪ 15"},"rating":{"stars":4.9},"discount_percent":27,"promotion_title":"ينتهي بعد"}'></thraa-product-card>
 * Or in Twig: <thraa-product-card product="{{ product|json_encode | e('html_attr') }}"></thraa-product-card>
 *
 * Important: component uses light DOM (no shadow) so external SCSS applies.
 */

(function () {
    class ThraaProductCard extends HTMLElement {
      constructor() {
        super();
        this.product = null;
        this.handleWishlist = this.handleWishlist.bind(this);
      }
  
      static get observedAttributes() {
        return ['product', 'minimal', 'fullimage', 'shadow-on-hover'];
      }
  
      attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'product' && oldVal !== newVal) {
          this.parseProduct();
          this.render();
        }
      }
  
      connectedCallback() {
        if (!this.product) this.parseProduct();
        this.render();
      }
  
      parseProduct() {
        const raw = this.getAttribute('product') || this.dataset.product || null;
        if (!raw) return;
        try {
          // If product is passed as JSON string
          this.product = typeof raw === 'string' && (raw.trim().startsWith('{') || raw.trim().startsWith('['))
            ? JSON.parse(raw)
            : raw;
        } catch (e) {
          // fallback: attempt decode HTML entities then parse
          try {
            const txt = document.createElement('textarea');
            txt.innerHTML = raw;
            this.product = JSON.parse(txt.value);
          } catch (err) {
            // as last resort store raw
            this.product = raw;
          }
        }
      }
  
      escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
  
      handleWishlist(e) {
        e.preventDefault();
        // simple toggle visual (merchant-specific wishlist logic should be integrated with platform APIs)
        const btn = e.currentTarget;
        btn.classList.toggle('is-active');
        // If platform provides wishlist API, integrate here
      }
  
      render() {
        const p = this.product || {};
        const name = this.escapeHTML(p.name || '');
        const img = (p.image && p.image.url) ? p.image.url : (window.__placeholderImage || '');
        const imgAlt = this.escapeHTML((p.image && p.image.alt) || p.name || 'product');
        const price = (p.price && p.price.formatted) ? this.escapeHTML(p.price.formatted) : '';
        const rating = p.rating && p.rating.stars ? this.escapeHTML(p.rating.stars) : '';
        const reviews = p.reviews_count || p.reviews || 0;
        const discount = p.discount_percent || p.discount || '';
        const promotion = p.promotion_title || '';
  
        // Build innerHTML (light DOM) — matches SCSS classes
        this.innerHTML = `
          <div class="thraa-product-card s-product-card" role="group" aria-label="${name}">
            <div class="s-product-card-image">
              ${promotion ? `<div class="s-product-badge-timer">${this.escapeHTML(promotion)}</div>` : ''}
              <div class="s-product-card-wishlist" role="button" aria-pressed="false" title="أضف للمفضلة" tabindex="0">
                <i class="sicon-heart" aria-hidden="true"></i>
              </div>
              <a href="${this.escapeHTML(p.url || '#')}" class="s-product-card-link" aria-label="${name}">
                <img src="${this.escapeHTML(img)}" alt="${imgAlt}" loading="lazy" />
              </a>
              <div class="s-product-card-add" title="أضف إلى السلة" aria-hidden="false">
                <!-- keep platform add-button for safety -->
                ${p.id ? `<salla-add-product-button product-id="${this.escapeHTML(p.id)}" class="thraa-add-btn" aria-label="أضف إلى السلة"></salla-add-product-button>` : `<button class="thraa-fallback-add">+</button>`}
              </div>
            </div>
  
            <div class="s-product-card-content">
              <div class="s-product-card-title">${name}</div>
              <div class="s-product-card-meta">
                ${rating ? `<span class="rating" aria-hidden="true"><i class="sicon-star2"></i> ${rating}</span>` : ''}
                <span class="comments-count" aria-hidden="true">(${this.escapeHTML(reviews)})</span>
              </div>
  
              <div class="s-product-card-bottom">
                <div class="s-product-card-discount">${discount ? '-' + this.escapeHTML(discount) + '%' : ''}</div>
                <div class="s-product-card-price">${price}</div>
              </div>
            </div>
          </div>
        `;
  
        // Attach event handlers for wishlist button
        const wishlistBtn = this.querySelector('.s-product-card-wishlist');
        if (wishlistBtn) {
          wishlistBtn.removeEventListener('click', this.handleWishlist);
          wishlistBtn.addEventListener('click', this.handleWishlist);
          wishlistBtn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              this.handleWishlist(ev);
            }
          });
        }
      }
    }
  
    if (!customElements.get('thraa-product-card')) {
      customElements.define('thraa-product-card', ThraaProductCard);
    }
  })();