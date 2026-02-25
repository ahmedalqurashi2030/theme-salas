import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

const appRoot = document.getElementById('app');
const parseBooleanSetting = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value !== 'string') return false;
  const normalizedValue = value.trim().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(normalizedValue);
};
const headerIsSticky = parseBooleanSetting(appRoot?.dataset.headerIsSticky);


class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if (headerIsSticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    this.initAttachWishlistListeners();
    this.changeMenuDirection()
    this.initTharaaHeaderMenu();
    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }



  initTharaaHeaderMenu() {
    const header = document.querySelector('.th-header');
    if (!header) return;

    const tabs = header.querySelectorAll('[data-mega-tab]');
    const panes = header.querySelectorAll('.th-mega-pane');

    if (!tabs.length || !panes.length) return;

    const activate = (id) => {
      panes.forEach((pane) => pane.classList.toggle('active', pane.id === id));
      tabs.forEach((tab) => {
        const isActive = tab.dataset.megaTab === id;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('mouseenter', () => activate(tab.dataset.megaTab));
      tab.addEventListener('focus', () => activate(tab.dataset.megaTab));
      tab.addEventListener('click', () => activate(tab.dataset.megaTab));
    });
  }

  // fix Menu Direction at the third level >> The menu at the third level was popping off the page
  changeMenuDirection() {
    app.all('.root-level.has-children', item => {
      if (item.classList.contains('change-menu-dir')) return;
      app.on('mouseover', item, () => {
        let submenu = item.querySelector('.sub-menu .sub-menu');
        if (submenu) {
          let rect = submenu.getBoundingClientRect();
          (rect.left < 10 || rect.right > window.innerWidth - 10) && app.addClass(item, 'change-menu-dir')
        }
      })
    })
  }

  loadModalImgOnclick() {
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

  isElementLoaded(selector) {
    return new Promise((resolve => {
      const interval = setInterval(() => {
        if (document.querySelector(selector)) {
          clearInterval(interval)
          return resolve(document.querySelector(selector))
        }
      }, 160)
    }))


  };

  async copyToClipboard(event) {
    event.preventDefault();
    const btn = event.currentTarget;
    const textToCopy = btn?.dataset?.content ?? '';

    if (!navigator.clipboard?.writeText) {
      this.log('Clipboard API is unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
      setTimeout(() => {
        this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
      }, 1000);
    } catch (error) {
      this.log('Copy to clipboard failed');
    }
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }


  initiateMobileMenu() {
    let menuElement = this.element("#mobile-menu");

    // custom-main-menu renders #mobile-menu asynchronously after fetching API menus
    if (!menuElement) {
      customElements.whenDefined('custom-main-menu').then(() => {
        setTimeout(() => this.initiateMobileMenu(), 150);
      });
      return;
    }

    // prevent duplicate initialization
    if (menuElement.dataset.mmInitialized === 'true') {
      return;
    }
    menuElement.dataset.mmInitialized = 'true';

    const menu = new MobileMenu(menuElement, "(max-width: 1024px)", "( slidingSubmenus: false)");
    salla.lang.onLoaded(() => {
      menu.navigation({ title: salla.lang.get('blocks.header.main_menu') });
    });
    const drawer = menu.offcanvas({ position: salla.config.get('theme.is_rtl') ? "right" : 'left' });

    this.onClick("a[href='#mobile-menu']", event => event.preventDefault() || drawer.close() || drawer.open());
    this.onClick(".close-mobile-menu", event => event.preventDefault() || drawer.close());
  }

  initAttachWishlistListeners() {
    let isListenerAttached = false;

    function toggleFavoriteIcon(id, isAdded = true) {
      document.querySelectorAll('.s-product-card-wishlist-btn[data-id="' + id + '"]').forEach(btn => {
        app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => isAdded);
        app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => isAdded);
      });
    }

    if (!isListenerAttached) {
      salla.wishlist.event.onAdded((event, id) => toggleFavoriteIcon(id));
      salla.wishlist.event.onRemoved((event, id) => toggleFavoriteIcon(id, false));
      isListenerAttached = true; // Mark the listener as attached
    }
  }

  initiateStickyMenu() {
    let header = this.element('#mainnav'),
      height = this.element('#mainnav .inner')?.clientHeight;
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    window.addEventListener('scroll', () => {
      window.scrollY >= header.offsetTop + height ? header.classList.add('fixed-pinned', 'animated') : header.classList.remove('fixed-pinned');
      window.scrollY >= 200 ? header.classList.add('fixed-header') : header.classList.remove('fixed-header', 'animated');
    }, { passive: true });
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  initiateDropdowns() {
    let activeTrigger = null;

    const closeActiveDropdown = () => {
      if (!activeTrigger) return;
      activeTrigger.parentElement?.classList.remove('is-opened');
      document.body.classList.remove('dropdown--is-opened');
      activeTrigger = null;
    };

    this.onClick('.dropdown__trigger', ({ currentTarget: btn, target }) => {
      const clickedElement = target instanceof Element ? target : btn;
      const trigger = clickedElement.closest('.dropdown__trigger') || btn;
      const parent = trigger.parentElement;
      const shouldOpen = !parent.classList.contains('is-opened');

      closeActiveDropdown();

      if (shouldOpen) {
        parent.classList.add('is-opened');
        document.body.classList.add('dropdown--is-opened');
        activeTrigger = trigger;
      }
    });

    window.addEventListener('click', ({ target: element }) => {
      if (!activeTrigger) return;

      const clickedElement = element instanceof Element ? element : null;
      if (!clickedElement) {
        closeActiveDropdown();
        return;
      }

      const isTrigger = !!clickedElement.closest('.dropdown__trigger');
      const isInsideMenu = !!clickedElement.closest('.dropdown__menu');
      const isCloseButton = clickedElement.classList?.contains('dropdown__close');

      if (isCloseButton || (!isTrigger && !isInsideMenu)) {
        closeActiveDropdown();
      }
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        const state = { isOpen: false }

        const onOpen = () => anime({
          targets: content,
          duration: 225,
          height: content.scrollHeight,
          opacity: [0, 1],
          easing: 'easeOutQuart',
        });

        const onClose = () => anime({
          targets: content,
          duration: 225,
          height: 0,
          opacity: [1, 0],
          easing: 'easeOutQuart',
        })

        const toggleState = (isOpen) => {
          state.isOpen = !isOpen
          this.toggleElementClassIf([content, trigger], 'is-closed', 'is-opened', () => isOpen);
        }

        trigger.addEventListener('click', () => {
          const { isOpen } = state
          toggleState(isOpen)
          isOpen ? onClose() : onOpen();
        })
      });
  }


  /**
   * Workaround for seeking to simplify & clean, There are three ways to use this method:
   * 1- direct call: `this.anime('.my-selector')` - will use default values
   * 2- direct call with overriding defaults: `this.anime('.my-selector', {duration:3000})`
   * 3- return object to play it letter: `this.anime('.my-selector', false).duration(3000).play()` - will not play animation unless calling play method.
   * @param {string|HTMLElement} selector
   * @param {object|undefined|null|null} options - in case there is need to set attributes one by one set it `false`;
   * @return {Anime|*}
   */
  anime(selector, options = null) {
    let anime = new Anime(selector, options);
    return options === false ? anime : anime.play();
  }

  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => {
        const span = el.querySelector('span') || el;
        span.innerHTML = salla.money(summary.total);
      });
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }
}

salla.onReady(() => (new App).loadTheApp());
