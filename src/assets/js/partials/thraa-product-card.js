/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎯 THRAA PRODUCT CARD - Professional Web Component
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * أسلوب احترافي مستوحى من أفضل قوالب سلة (Aali, Angel)
 * يستخدم Web Components API مع Salla SDK
 * 
 * المميزات:
 * ✅ تحكم كامل في HTML
 * ✅ لا يحتاج !important
 * ✅ يستخدم Salla APIs للوظائف
 * ✅ سهل الصيانة والتخصيص
 * ✅ أداء محسّن
 * 
 * الاستخدام:
 * <thraa-product-card product='{"id": 123, "name": "...", ...}'></thraa-product-card>
 * 
 * أو مع salla-products-list/slider (يتم التحويل تلقائياً)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ThraaProductCard extends HTMLElement {
    constructor() {
        super();
        this.product = null;
        this.isInWishlist = false;
    }

    /**
     * يتم استدعاؤها عند إضافة العنصر للصفحة
     */
    connectedCallback() {
        // جلب بيانات المنتج من الـ attribute
        const productAttr = this.getAttribute('product');
        if (productAttr) {
            try {
                // محاولة تحويل JSON
                this.product = JSON.parse(productAttr);
            } catch (e) {
                console.error('Thraa: Invalid product data - trying to parse as object', e);
                // قد يكون النص بالفعل object من Twig
                this.product = productAttr;
                return;
            }
        }

        if (!this.product) {
            console.warn('Thraa: No product data provided');
            return;
        }

        // تحقق من جاهزية Salla SDK
        if (typeof salla !== 'undefined' && salla.config) {
            // Salla متاح
            if (window.app?.status === 'ready') {
                this.init();
            } else {
                document.addEventListener('theme::ready', () => this.init());
                // Fallback - إذا لم يأتي الحدث خلال 2 ثانية، ابدأ على أي حال
                setTimeout(() => {
                    if (!this._initialized) {
                        console.log('Thraa: Initializing without theme::ready event');
                        this.init();
                    }
                }, 2000);
            }
        } else {
            // Salla غير متاح - استخدم الوضع الأساسي
            console.log('Thraa: Salla SDK not available, using basic mode');
            this.initBasic();
        }
    }

    /**
     * تهيئة المكون (مع Salla SDK)
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;

        // جلب الخصائص (variants)
        this.getProps();

        // جلب الإعدادات من سلة
        try {
            this.settings = {
                fitType: salla.config.get('store.settings.product.fit_type') || 'cover',
                placeholder: salla.url.asset(salla.config.get('theme.settings.placeholder')) || '',
                currency: salla.config.currency() || 'SAR',
                isGuest: salla.config.isGuest()
            };
        } catch (e) {
            this.settings = {
                fitType: 'cover',
                placeholder: '',
                currency: 'SAR',
                isGuest: true
            };
        }

        // تحقق من المفضلة
        try {
            if (!this.settings.isGuest) {
                const wishlist = salla.storage.get('salla::wishlist', []);
                this.isInWishlist = wishlist.includes(Number(this.product.id));
            }
        } catch (e) {
            this.isInWishlist = false;
        }

        // جلب الترجمات
        this.translations = {
            addToCart: 'أضف للسلة',
            outOfStock: 'نفدت الكمية',
            remained: 'متبقي',
            quickView: 'عرض سريع'
        };

        try {
            salla.lang.onLoaded(() => {
                this.translations = {
                    addToCart: salla.lang.get('pages.cart.add_to_cart') || 'أضف للسلة',
                    outOfStock: salla.lang.get('pages.products.out_of_stock') || 'نفدت الكمية',
                    remained: salla.lang.get('pages.products.remained') || 'متبقي',
                    quickView: 'عرض سريع'
                };
                this.render();
            });
        } catch (e) {
            // استخدم الترجمات الافتراضية
        }

        // render أولي
        this.render();

        // استمع لتغييرات المفضلة
        this.setupWishlistListener();
    }

    /**
     * تهيئة المكون (بدون Salla SDK - الوضع الأساسي)
     */
    initBasic() {
        if (this._initialized) return;
        this._initialized = true;

        // جلب الخصائص
        this.getProps();

        // إعدادات افتراضية
        this.settings = {
            fitType: 'cover',
            placeholder: '',
            currency: 'ر.س',
            isGuest: true
        };

        // ترجمات افتراضية
        this.translations = {
            addToCart: 'أضف للسلة',
            outOfStock: 'نفدت الكمية',
            remained: 'متبقي',
            quickView: 'عرض سريع'
        };

        // render
        this.render();
    }

    /**
     * جلب الخصائص (Variants)
     */
    getProps() {
        // بطاقة أفقية
        this.isHorizontal = this.hasAttribute('horizontal');

        // بطاقة بصورة كاملة
        this.isFullImage = this.hasAttribute('fullImage') || this.hasAttribute('full-image');

        // بطاقة مصغرة
        this.isMinimal = this.hasAttribute('minimal');

        // ظل عند الهوفر
        this.shadowOnHover = this.hasAttribute('shadowOnHover') || this.hasAttribute('shadow-on-hover');

        // بطاقة خاصة (مع عداد)
        this.isSpecial = this.hasAttribute('isSpecial') || this.hasAttribute('is-special');

        // إخفاء زر الإضافة
        this.hideAddBtn = this.hasAttribute('hideAddBtn') || this.hasAttribute('hide-add-btn');
    }

    /**
     * استماع لتغييرات المفضلة
     */
    setupWishlistListener() {
        salla.event.on('wishlist::added', (id) => {
            if (id == this.product.id) {
                this.isInWishlist = true;
                this.updateWishlistButton();
            }
        });

        salla.event.on('wishlist::removed', (id) => {
            if (id == this.product.id) {
                this.isInWishlist = false;
                this.updateWishlistButton();
            }
        });
    }

    /**
     * تحديث زر المفضلة
     */
    updateWishlistButton() {
        const btn = this.querySelector('.thraa-card__wishlist');
        if (btn) {
            btn.classList.toggle('is-active', this.isInWishlist);
        }
    }

    /**
     * تنسيق السعر
     */
    formatPrice(price) {
        if (!price || price === 0) {
            return salla.config.get('store.settings.product.show_price_as_dash') ? '-' : '';
        }
        return salla.money(price);
    }

    /**
     * حساب نسبة الخصم
     */
    getDiscountPercentage() {
        if (!this.product.is_on_sale || !this.product.regular_price) return 0;
        const discount = ((this.product.regular_price - this.product.sale_price) / this.product.regular_price) * 100;
        return Math.round(discount);
    }

    /**
     * الحصول على شارة المنتج
     */
    getBadge() {
        // شارة الطلب المسبق
        if (this.product.preorder?.label) {
            return `<span class="thraa-card__badge thraa-card__badge--preorder">${this.product.preorder.label}</span>`;
        }

        // شارة الترويج
        if (this.product.promotion_title) {
            return `<span class="thraa-card__badge thraa-card__badge--promo">${this.product.promotion_title}</span>`;
        }

        // شارة نفاد الكمية
        if (this.product.is_out_of_stock) {
            return `<span class="thraa-card__badge thraa-card__badge--out">${this.translations?.outOfStock || 'نفدت الكمية'}</span>`;
        }

        return '';
    }

    /**
     * الحصول على HTML السعر
     */
    getPriceHTML() {
        // منتج بخصم
        if (this.product.is_on_sale) {
            const discount = this.getDiscountPercentage();
            return `
                <div class="thraa-card__prices">
                    <span class="thraa-card__price-old">${this.formatPrice(this.product.regular_price)}</span>
                    <div class="thraa-card__price-row">
                        <span class="thraa-card__price-current">${this.formatPrice(this.product.sale_price)}</span>
                        ${discount ? `<span class="thraa-card__discount">-${discount}%</span>` : ''}
                    </div>
                </div>
            `;
        }

        // سعر يبدأ من
        if (this.product.starting_price) {
            return `
                <div class="thraa-card__prices">
                    <span class="thraa-card__price-starting">يبدأ من</span>
                    <span class="thraa-card__price-current">${this.formatPrice(this.product.starting_price)}</span>
                </div>
            `;
        }

        // سعر عادي
        return `
            <div class="thraa-card__prices">
                <span class="thraa-card__price-current">${this.formatPrice(this.product.price)}</span>
            </div>
        `;
    }

    /**
     * الحصول على HTML التقييم
     */
    getRatingHTML() {
        if (!this.product.rating?.stars) return '';

        return `
            <div class="thraa-card__rating">
                <i class="sicon-star2"></i>
                <span class="thraa-card__rating-value">${this.product.rating.stars}</span>
                <span class="thraa-card__rating-count">(${this.product.rating.count || 0})</span>
            </div>
        `;
    }

    /**
     * Render الرئيسي
     */
    render() {
        if (!this.product) return;

        // إضافة الكلاسات بناءً على النوع
        this.className = 'thraa-card';
        if (this.isFullImage) this.classList.add('thraa-card--full-image');
        if (this.isMinimal) this.classList.add('thraa-card--minimal');
        if (this.isHorizontal) this.classList.add('thraa-card--horizontal');
        if (this.shadowOnHover) this.classList.add('thraa-card--shadow');
        if (this.isSpecial) this.classList.add('thraa-card--special');
        if (this.product.is_out_of_stock) this.classList.add('is-out-of-stock');
        this.setAttribute('data-product-id', this.product.id);

        // اختيار القالب المناسب
        if (this.isFullImage) {
            this.renderFullImage();
        } else if (this.isMinimal) {
            this.renderMinimal();
        } else if (this.isHorizontal) {
            this.renderHorizontal();
        } else {
            this.renderDefault();
        }

        // تحديث الصور الـ lazy
        if (document.lazyLoadInstance) {
            document.lazyLoadInstance.update(this.querySelectorAll('.lazy'));
        }
    }

    /**
     * قالب البطاقة الافتراضية (العمودية)
     */
    renderDefault() {
        this.innerHTML = `
            <!-- ═══ قسم الصورة ═══ -->
            <div class="thraa-card__media">
                <a href="${this.product.url}" class="thraa-card__image-link" aria-label="${this.escapeHTML(this.product.name)}">
                    <img 
                        class="thraa-card__image lazy"
                        src="${this.settings?.placeholder || ''}"
                        data-src="${this.product.image?.url || this.product.thumbnail || ''}"
                        alt="${this.escapeHTML(this.product.image?.alt || this.product.name)}"
                        loading="lazy"
                    />
                </a>
                
                <!-- زر المفضلة -->
                <button 
                    type="button"
                    class="thraa-card__wishlist ${this.isInWishlist ? 'is-active' : ''}"
                    onclick="salla.wishlist.toggle(${this.product.id})"
                    aria-label="إضافة للمفضلة"
                    data-id="${this.product.id}">
                    <i class="sicon-heart"></i>
                </button>
                
                <!-- الشارة -->
                ${this.getBadge()}
                
                <!-- أزرار التفاعل -->
                ${!this.hideAddBtn ? `
                <div class="thraa-card__actions">
                    <salla-add-product-button
                        product-id="${this.product.id}"
                        product-status="${this.product.status}"
                        product-type="${this.product.type}"
                        class="thraa-card__add-btn">
                        <i class="sicon-shopping-bag"></i>
                    </salla-add-product-button>
                </div>
                ` : ''}
            </div>
            
            <!-- ═══ قسم المحتوى ═══ -->
            <div class="thraa-card__content">
                ${this.getRatingHTML()}
                ${this.product.brand?.name ? `<span class="thraa-card__brand">${this.product.brand.name}</span>` : ''}
                <h3 class="thraa-card__title">
                    <a href="${this.product.url}">${this.escapeHTML(this.product.name)}</a>
                </h3>
                ${this.getPriceHTML()}
            </div>
        `;
    }

    /**
     * قالب بطاقة الصورة الكاملة (Full Image)
     */
    renderFullImage() {
        this.innerHTML = `
            <a href="${this.product.url}" class="thraa-card__full-link" aria-label="${this.escapeHTML(this.product.name)}">
                <img 
                    class="thraa-card__image lazy"
                    src="${this.settings?.placeholder || ''}"
                    data-src="${this.product.image?.url || this.product.thumbnail || ''}"
                    alt="${this.escapeHTML(this.product.image?.alt || this.product.name)}"
                    loading="lazy"
                />
                
                <!-- Overlay للمحتوى -->
                <div class="thraa-card__overlay">
                    <!-- زر المفضلة -->
                    <button 
                        type="button"
                        class="thraa-card__wishlist ${this.isInWishlist ? 'is-active' : ''}"
                        onclick="event.preventDefault(); salla.wishlist.toggle(${this.product.id})"
                        aria-label="إضافة للمفضلة"
                        data-id="${this.product.id}">
                        <i class="sicon-heart"></i>
                    </button>
                    
                    <!-- الشارة -->
                    ${this.getBadge()}
                    
                    <!-- المحتوى أسفل الصورة -->
                    <div class="thraa-card__overlay-content">
                        <h3 class="thraa-card__title">${this.escapeHTML(this.product.name)}</h3>
                        ${this.getPriceHTML()}
                        
                        ${!this.hideAddBtn ? `
                        <salla-add-product-button
                            product-id="${this.product.id}"
                            product-status="${this.product.status}"
                            product-type="${this.product.type}"
                            onclick="event.preventDefault(); event.stopPropagation();"
                            class="thraa-card__add-btn thraa-card__add-btn--full">
                            <i class="sicon-shopping-bag"></i>
                            <span>${this.translations?.addToCart || 'أضف للسلة'}</span>
                        </salla-add-product-button>
                        ` : ''}
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * قالب البطاقة المصغرة (Minimal)
     */
    renderMinimal() {
        this.innerHTML = `
            <div class="thraa-card__mini-wrapper">
                <!-- الصورة -->
                <a href="${this.product.url}" class="thraa-card__mini-image">
                    <img 
                        class="thraa-card__image lazy"
                        src="${this.settings?.placeholder || ''}"
                        data-src="${this.product.image?.url || this.product.thumbnail || ''}"
                        alt="${this.escapeHTML(this.product.image?.alt || this.product.name)}"
                        loading="lazy"
                    />
                </a>
                
                <!-- المحتوى -->
                <div class="thraa-card__mini-content">
                    ${this.product.brand?.name ? `<span class="thraa-card__brand">${this.product.brand.name}</span>` : ''}
                    <h3 class="thraa-card__title">
                        <a href="${this.product.url}">${this.escapeHTML(this.product.name)}</a>
                    </h3>
                    ${this.getRatingHTML()}
                    ${this.getPriceHTML()}
                </div>
                
                <!-- الأزرار -->
                <div class="thraa-card__mini-actions">
                    <button 
                        type="button"
                        class="thraa-card__wishlist ${this.isInWishlist ? 'is-active' : ''}"
                        onclick="salla.wishlist.toggle(${this.product.id})"
                        aria-label="إضافة للمفضلة"
                        data-id="${this.product.id}">
                        <i class="sicon-heart"></i>
                    </button>
                    
                    ${!this.hideAddBtn ? `
                    <salla-add-product-button
                        product-id="${this.product.id}"
                        product-status="${this.product.status}"
                        product-type="${this.product.type}"
                        class="thraa-card__add-btn">
                        <i class="sicon-shopping-bag"></i>
                    </salla-add-product-button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * قالب البطاقة الأفقية (Horizontal)
     */
    renderHorizontal() {
        this.innerHTML = `
            <div class="thraa-card__horizontal-wrapper">
                <!-- الصورة -->
                <a href="${this.product.url}" class="thraa-card__horizontal-image">
                    <img 
                        class="thraa-card__image lazy"
                        src="${this.settings?.placeholder || ''}"
                        data-src="${this.product.image?.url || this.product.thumbnail || ''}"
                        alt="${this.escapeHTML(this.product.image?.alt || this.product.name)}"
                        loading="lazy"
                    />
                    ${this.getBadge()}
                </a>
                
                <!-- المحتوى -->
                <div class="thraa-card__horizontal-content">
                    ${this.product.brand?.name ? `<span class="thraa-card__brand">${this.product.brand.name}</span>` : ''}
                    <h3 class="thraa-card__title">
                        <a href="${this.product.url}">${this.escapeHTML(this.product.name)}</a>
                    </h3>
                    ${this.getRatingHTML()}
                    ${this.getPriceHTML()}
                    
                    <!-- الأزرار -->
                    <div class="thraa-card__horizontal-actions">
                        ${!this.hideAddBtn ? `
                        <salla-add-product-button
                            product-id="${this.product.id}"
                            product-status="${this.product.status}"
                            product-type="${this.product.type}"
                            class="thraa-card__add-btn thraa-card__add-btn--wide">
                            <i class="sicon-shopping-bag"></i>
                            <span>${this.translations?.addToCart || 'أضف للسلة'}</span>
                        </salla-add-product-button>
                        ` : ''}
                        
                        <button 
                            type="button"
                            class="thraa-card__wishlist ${this.isInWishlist ? 'is-active' : ''}"
                            onclick="salla.wishlist.toggle(${this.product.id})"
                            aria-label="إضافة للمفضلة"
                            data-id="${this.product.id}">
                            <i class="sicon-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * تجنب XSS
     */
    escapeHTML(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// تسجيل المكون
// ═══════════════════════════════════════════════════════════════════════════
customElements.define('thraa-product-card', ThraaProductCard);

// ═══════════════════════════════════════════════════════════════════════════
// تحويل بطاقات salla-products-list تلقائياً
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // استمع لحدث render المنتجات
    if (typeof salla !== 'undefined') {
        salla.event.on('products::list.render', (data) => {
            // يمكنك هنا تحويل البطاقات الافتراضية إلى بطاقاتك المخصصة
            // هذا اختياري - إذا أردت استخدام المكون مباشرة في Twig
        });
    }
});

console.log('✅ Thraa Product Card Component Loaded');




// <i class="sicon-check"></i>