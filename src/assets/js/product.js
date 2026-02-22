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

    registerEvents() {
      salla.event.on('product::price.updated.failed',()=>{
        app.element('.price-wrapper').classList.add('hidden');
        app.element('.out-of-stock').classList.remove('hidden')
        app.anime('.out-of-stock', { scale: [0.88, 1] });
      })
      salla.product.event.onPriceUpdated((res) => {

        app.element('.out-of-stock').classList.add('hidden')
        app.element('.price-wrapper').classList.remove('hidden')

        let data = res.data,
            is_on_sale = data.has_sale_price && data.regular_price > data.price;

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});

        app.toggleClassIf('.price_is_on_sale','showed','hidden', ()=> is_on_sale)
        app.toggleClassIf('.starting-or-normal-price','hidden','showed', ()=> is_on_sale)

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
          const readMoreLabel = trigger.dataset.labelMore || salla.lang.get('pages.products.read_more');
          const readLessLabel = trigger.dataset.labelLess || 'إظهار أقل';
          label.textContent = expanded ? readLessLabel : readMoreLabel;
        }

        content.style.maxHeight = expanded ? `${content.scrollHeight}px` : '5.25rem';
      });
    }

    initProductTabs() {
      const tabsRoot = document.getElementById('product-details-tabs');
      if (!tabsRoot) return;

      const buttons = Array.from(tabsRoot.querySelectorAll('.product-details-tabs__btn'));
      const panels = Array.from(tabsRoot.querySelectorAll('.product-details-tabs__panel'));
      if (!buttons.length || !panels.length) return;

      const activate = (targetName, { updateHash = true } = {}) => {
        buttons.forEach((button) => {
          const isActive = button.dataset.target === targetName;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-selected', isActive ? 'true' : 'false');
          button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach((panel) => {
          panel.hidden = !panel.id.endsWith(targetName);
        });

        if (updateHash) {
          const targetHash = targetName === 'reviews' ? '#reviews' : '#description';
          window.history.replaceState(null, '', targetHash);
        }
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => activate(button.dataset.target));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();

          let nextIndex = index;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = buttons.length - 1;
          if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
          if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;

          const nextButton = buttons[nextIndex];
          nextButton?.focus();
          if (nextButton?.dataset.target) activate(nextButton.dataset.target);
        });
      });

      const hashTarget = window.location.hash.replace('#', '');
      if (hashTarget === 'reviews' && buttons.some((button) => button.dataset.target === 'reviews')) {
        activate('reviews', { updateHash: false });
      } else {
        activate('description', { updateHash: false });
      }
    }
}

Product.initiateWhenReady(['product.single']);
