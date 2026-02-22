import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

const appRoot = document.getElementById('app');
const parseBooleanSetting = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value !== 'string') return false;
    const normalizedValue = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(normalizedValue);
};
const imageZoomEnabled = parseBooleanSetting(appRoot?.dataset.imageZoom);

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
        });

        this.initProductOptionValidations();
        this.initProductGalleryUX();
        this.initProductTabs();
        this.initDescriptionReadMore();
        this.initProductReviewsPanelUX();

        if (imageZoomEnabled) {
            // call the function when the page is ready
            this.initImagesZooming();
            // listen to screen resizing
            window.addEventListener('resize', () => this.initImagesZooming());
        }
    }

    initProductOptionValidations() {
      document.querySelector('.product-form')?.addEventListener('change', function(){
        this.reportValidity() && salla.product.getPrice(new FormData(this));
      });
    }

    initImagesZooming() {
      const slider = document.querySelector('salla-slider.details-slider');
      if (!slider) return;

      const addZoomToActiveSlide = () => {
        const zoomGlass = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass');
        if (window.innerWidth < 1024 || zoomGlass) return;

        const image = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active img');
        zoom(image?.id, 2);
      };

      setTimeout(addZoomToActiveSlide, 250);

      if (slider.dataset.zoomListenerAttached === 'true') return;
      slider.dataset.zoomListenerAttached = 'true';

      slider.addEventListener('slideChange', () => {
        setTimeout(addZoomToActiveSlide, 250);
      });
    }

    initProductGalleryUX() {
      const slider = document.querySelector('salla-slider.details-slider');
      const thumbsSlot = slider?.querySelector('[slot="thumbs"]');
      if (!slider || !thumbsSlot) return;

      const thumbs = Array.from(thumbsSlot.querySelectorAll('.product-thumb-item'));
      if (!thumbs.length) return;

      const imageLabel = salla.lang.get('common.image') || 'Image';

      thumbs.forEach((thumb, index) => {
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('aria-label', `${imageLabel} ${index + 1}`);

        thumb.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          thumb.click();
        });
      });

      const keepActiveThumbVisible = () => {
        const activeThumb = slider.querySelector('.s-slider-thumbs .swiper-slide-thumb-active, .s-slider-thumbs .swiper-slide-active');
        if (!activeThumb) return;
        activeThumb.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      };

      slider.addEventListener('slideChange', () => setTimeout(keepActiveThumbVisible, 60));
      keepActiveThumbVisible();
    }

    initDescriptionReadMore() {
      const trigger = document.getElementById('btn-show-more');
      const content = document.getElementById('more-content');
      if (!trigger || !content) return;

      const collapsedHeight = Number.parseInt(content.dataset.collapsedHeight || '84', 10) || 84;
      let resizeTimer = null;

      const updateReadMoreVisibility = () => {
        const isExpanded = trigger.classList.contains('is-expanded');
        const hasOverflow = content.scrollHeight > collapsedHeight + 6;

        trigger.classList.toggle('hidden', !hasOverflow);
        trigger.setAttribute('aria-hidden', hasOverflow ? 'false' : 'true');

        if (!hasOverflow) {
          trigger.classList.remove('is-expanded');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = 'none';
          return;
        }

        content.style.maxHeight = isExpanded ? `${content.scrollHeight}px` : `${collapsedHeight}px`;
      };

      updateReadMoreVisibility();

      window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(updateReadMoreVisibility, 120);
      });
    }

    initProductReviewsPanelUX() {
      const tabsRoot = document.getElementById('product-details-tabs');
      const reviewsPanel = document.getElementById('product-panel-reviews');
      const reviewsWrapper = reviewsPanel?.querySelector('.product-details-tabs__reviews');
      const commentsElement = reviewsPanel?.querySelector('salla-comments');
      if (!tabsRoot || !reviewsPanel || !reviewsWrapper || !commentsElement) return;

      if (commentsElement.dataset.emptyStateReady === 'true') return;
      commentsElement.dataset.emptyStateReady = 'true';

      const reviewsCount = Number.parseInt(tabsRoot.dataset.reviewsCount || '0', 10) || 0;
      const emptyTitle = reviewsPanel.dataset.emptyTitle || salla.lang.get('components.product_tabs.reviews_empty_title') || 'No reviews yet';
      const emptyHint = reviewsPanel.dataset.emptyHint || salla.lang.get('components.product_tabs.reviews_empty_hint') || 'Be the first to review this product.';
      const emptyCta = reviewsPanel.dataset.emptyCta || salla.lang.get('components.product_tabs.write_review') || 'Write review';

      const createEmptyState = () => {
        const block = document.createElement('div');
        block.className = 'product-details-tabs__reviews-empty';
        const icon = document.createElement('i');
        icon.className = 'sicon-commenting-o';
        icon.setAttribute('aria-hidden', 'true');

        const title = document.createElement('h3');
        title.textContent = emptyTitle;

        const hint = document.createElement('p');
        hint.textContent = emptyHint;

        const ctaButton = document.createElement('button');
        ctaButton.type = 'button';
        ctaButton.className = 'btn btn--primary btn--small';
        ctaButton.textContent = emptyCta;

        block.append(icon, title, hint, ctaButton);

        ctaButton.addEventListener('click', () => {
          salla.event.dispatch('rating::open');
        });

        return block;
      };

      const hasRenderedReviews = () => {
        const selectors = [
          '.s-comments-item',
          '.s-comments-list-item',
          '[data-comment-id]',
          '[data-review-id]',
          '.s-comments-review-item',
        ];

        return selectors.some((selector) => commentsElement.querySelector(selector));
      };

      const hasNativeEmpty = () => {
        const selectors = [
          '.s-comments-empty',
          '.s-comments-empty-state',
          '.s-comments-no-results',
          '.s-comments-placeholder',
        ];

        return selectors.some((selector) => commentsElement.querySelector(selector));
      };

      const syncEmptyState = () => {
        const currentEmptyState = reviewsWrapper.querySelector('.product-details-tabs__reviews-empty');
        const shouldUseCustomEmpty = !hasNativeEmpty() && !hasRenderedReviews() && reviewsCount === 0;

        reviewsWrapper.classList.toggle('is-custom-empty', shouldUseCustomEmpty);

        if (!shouldUseCustomEmpty) {
          currentEmptyState?.remove();
          return;
        }

        if (!currentEmptyState) {
          reviewsWrapper.prepend(createEmptyState());
        }
      };

      window.setTimeout(syncEmptyState, 450);
      const observer = new MutationObserver(() => syncEmptyState());
      observer.observe(commentsElement, { childList: true, subtree: true });
    }

    registerEvents() {
      salla.event.on('product::price.updated.failed',()=>{
        const priceWrapper = app.element('.price-wrapper');
        const outOfStock = app.element('.out-of-stock');

        priceWrapper?.classList.add('hidden');
        outOfStock?.classList.remove('hidden');
        app.anime('.out-of-stock', { scale: [0.88, 1] });
      })
      salla.product.event.onPriceUpdated((res) => {

        const priceWrapper = app.element('.price-wrapper');
        const outOfStock = app.element('.out-of-stock');

        outOfStock?.classList.add('hidden');
        priceWrapper?.classList.remove('hidden');

        let data = res.data,
            is_on_sale = data.has_sale_price && data.regular_price > data.price;

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});

        app.toggleClassIf('.price_is_on_sale', 'block', 'hidden', () => is_on_sale);
        app.toggleClassIf('.starting-or-normal-price', 'flex', 'hidden', () => !is_on_sale);

        app.anime('.total-price, .product-weight', { scale: [0.88, 1] });
      });

      app.onClick('#btn-show-more', e => {
        const trigger = e.currentTarget;
        const content = document.querySelector('#more-content');
        if (!trigger || !content) return;

        const expanded = trigger.classList.toggle('is-expanded');
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');

        const label = trigger.querySelector('span');
        if (label) {
          const readMoreLabel = trigger.dataset.labelMore || salla.lang.get('components.product_tabs.read_more') || 'Read more';
          const readLessLabel = trigger.dataset.labelLess || salla.lang.get('components.product_tabs.read_less') || 'Read less';
          label.textContent = expanded ? readLessLabel : readMoreLabel;
        }

        const collapsedHeight = Number.parseInt(content.dataset.collapsedHeight || '84', 10) || 84;
        content.style.maxHeight = expanded ? `${content.scrollHeight}px` : `${collapsedHeight}px`;
      });
    }

    initProductTabs() {
      const tabsRoot = document.getElementById('product-details-tabs');
      if (!tabsRoot) return;

      const buttons = Array.from(tabsRoot.querySelectorAll('.product-details-tabs__btn'));
      const panels = Array.from(tabsRoot.querySelectorAll('.product-details-tabs__panel'));
      if (!buttons.length || !panels.length) return;
      const hasReviewsTab = buttons.some((button) => button.dataset.target === 'reviews');
      const isRtl = document.documentElement.dir === 'rtl';
      const getSafeTarget = (targetName) => {
        if (targetName === 'reviews' && !hasReviewsTab) return 'description';
        return targetName === 'reviews' ? 'reviews' : 'description';
      };

      const activate = (targetName, { updateHash = true } = {}) => {
        const safeTarget = getSafeTarget(targetName);

        buttons.forEach((button) => {
          const isActive = button.dataset.target === safeTarget;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-selected', isActive ? 'true' : 'false');
          button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach((panel) => {
          panel.hidden = panel.dataset.panel !== safeTarget;
        });

        tabsRoot.dataset.activeTab = safeTarget;
        tabsRoot.classList.toggle('is-reviews-active', safeTarget === 'reviews');

        if (updateHash) {
          const targetHash = safeTarget === 'reviews' ? '#reviews' : '#description';
          window.history.replaceState(null, '', targetHash);
        }
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => activate(button.dataset.target || 'description'));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();

          let nextIndex = index;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = buttons.length - 1;
          if (event.key === 'ArrowRight') nextIndex = isRtl
            ? (index - 1 + buttons.length) % buttons.length
            : (index + 1) % buttons.length;
          if (event.key === 'ArrowLeft') nextIndex = isRtl
            ? (index + 1) % buttons.length
            : (index - 1 + buttons.length) % buttons.length;

          const nextButton = buttons[nextIndex];
          nextButton?.focus();
          if (nextButton?.dataset.target) activate(nextButton.dataset.target);
        });
      });

      const hashTarget = window.location.hash.replace('#', '');
      if (hashTarget === 'reviews' && hasReviewsTab) {
        activate('reviews', { updateHash: false });
      } else {
        activate('description', { updateHash: false });
      }
    }
}

Product.initiateWhenReady(['product.single']);
