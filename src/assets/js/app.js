import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import Anime from './partials/anime';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";
import EnhancedLazyLoad from './partials/enhanced-lazy-load';

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if (header_is_sticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    this.initAttachWishlistListeners();
    this.changeMenuDirection()
    initTootTip();
    this.loadModalImgOnclick();
    this.initiateAccessibility();
    this.initiateSmoothScroll();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
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

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
      btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
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

    this.isElementLoaded('#mobile-menu').then((menu) => {


      const mobileMenu = new MobileMenu(menu, "(max-width: 1024px)", "( slidingSubmenus: false)");

      salla.lang.onLoaded(() => {
        mobileMenu.navigation({ title: salla.lang.get('blocks.header.main_menu') });
      });
      const drawer = mobileMenu.offcanvas({ position: salla.config.get('theme.is_rtl') ? "right" : 'left' });

      this.onClick("a[href='#mobile-menu']", event => {
        document.body.classList.add('menu-opened');
        event.preventDefault() || drawer.close() || drawer.open()

      });
      this.onClick(".close-mobile-menu", event => {
        document.body.classList.remove('menu-opened');
        event.preventDefault() || drawer.close()
      });
    });

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
    this.onClick('.dropdown__trigger', ({ target: btn }) => {
      btn.parentElement.classList.toggle('is-opened');
      document.body.classList.toggle('dropdown--is-opened');
      // Click Outside || Click on close btn
      window.addEventListener('click', ({ target: element }) => {
        if (!element.closest('.dropdown__menu') && element !== btn || element.classList.contains('dropdown__close')) {
          btn.parentElement.classList.remove('is-opened');
          document.body.classList.remove('dropdown--is-opened');
        }
      });
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
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      document.querySelectorAll('[data-cart-count]').forEach(el => el.innerText = salla.helpers.number(summary.count));
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      app.element('salla-cart-summary').animateToCart(app.element(`#product-${prodId} img`));
    });
  }

  /**
   * تحسينات الوصولية (Accessibility)
   * إضافة ARIA labels وتحسين التنقل بالكيبورد
   */
  initiateAccessibility() {
    // إضافة ARIA labels للأزرار بدون نص
    document.querySelectorAll('button:not([aria-label]):not(:has(span, img))').forEach(btn => {
      const icon = btn.querySelector('i, svg');
      if (icon && !btn.textContent.trim()) {
        const iconClass = icon.className || '';
        // محاولة استخراج وصف من class الأيقونة
        if (iconClass.includes('search')) btn.setAttribute('aria-label', salla.lang.get('blocks.header.search') || 'بحث');
        else if (iconClass.includes('cart')) btn.setAttribute('aria-label', salla.lang.get('blocks.header.cart') || 'السلة');
        else if (iconClass.includes('menu')) btn.setAttribute('aria-label', salla.lang.get('blocks.header.main_menu') || 'القائمة');
        else if (iconClass.includes('close')) btn.setAttribute('aria-label', 'إغلاق');
        else if (iconClass.includes('heart') || iconClass.includes('wishlist')) btn.setAttribute('aria-label', 'إضافة للمفضلة');
      }
    });

    // تحسين التنقل بالكيبورد في القوائم
    document.querySelectorAll('.dropdown__menu, .sub-menu').forEach(menu => {
      const items = menu.querySelectorAll('a, button');
      items.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = items[index + 1] || items[0];
            next?.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = items[index - 1] || items[items.length - 1];
            prev?.focus();
          } else if (e.key === 'Escape') {
            menu.closest('.dropdown')?.classList.remove('is-opened');
            menu.previousElementSibling?.focus();
          }
        });
      });
    });

    // إضافة skip to content link
    if (!document.querySelector('.skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-to-content';
      skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
      skipLink.style.cssText = 'position: absolute; left: -9999px; z-index: 9999; padding: 1em; background: var(--color-primary); color: white; text-decoration: none;';
      skipLink.addEventListener('focus', function() {
        this.style.left = '50%';
        this.style.transform = 'translateX(-50%)';
        this.style.top = '1em';
      });
      skipLink.addEventListener('blur', function() {
        this.style.left = '-9999px';
      });
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  /**
   * تحسين التمرير السلس
   */
  initiateSmoothScroll() {
    // تحسين smooth scroll للروابط الداخلية
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

salla.onReady(() => (new App).loadTheApp());


































window.tharaa = window.tharaa || {};

// 1. فتح وإغلاق القائمة الجانبية للأقسام
window.tharaa.toggleCategorySidebar = function () {
  const sidebar = document.getElementById('th-category-sidebar');
  const overlay = document.querySelector('.th-cat-sidebar-overlay');
  const body = document.body;

  sidebar.classList.toggle('is-open');
  overlay.classList.toggle('is-open');

  // منع السكرول في الخلفية
  if (sidebar.classList.contains('is-open')) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
};

// 2. الأكورديون للقوائم الفرعية (عند الضغط على السهم)
window.tharaa.toggleSubMenu = function (btn) {
  // الزر موجود داخل div، نحتاج القائمة التي تليه في الهيكل
  // الهيكل: li -> (row > button) + ul
  const submenu = btn.closest('li').querySelector('.th-cat-submenu');

  if (submenu) {
    // تبديل العرض
    if (submenu.style.display === 'none' || submenu.style.display === '') {
      // فتح
      submenu.style.display = 'block';
      btn.classList.add('is-expanded');
      // أنيميشن بسيط يمكن إضافته هنا أو عبر CSS max-height
    } else {
      // إغلاق
      submenu.style.display = 'none';
      btn.classList.remove('is-expanded');
    }
  }
};