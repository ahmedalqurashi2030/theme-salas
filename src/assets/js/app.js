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

    this.initLoadingBarPagination();
    this.initFeaturedProductsStyle3MobilePagination();
    this.initThStoreFeaturesMobilePagination();
    this.initGlobalAnnouncementBars();
    this.initFaqAccordions();
    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded');
  }

  log(message) {
    salla.log(`ThemeApp(Raed)::${message}`);
    return this;
  }

  // --- Start Custom Feature: Loading Bar Pagination for Sliders ---
  initLoadingBarPagination() {
    customElements.whenDefined('salla-slider').then(() => {
      const isCustomerReviewsSlider = (slider) => {
        return slider.classList.contains('th-home-testimonials__slider')
          || slider.classList.contains('s-reviews-testimonials-slider')
          || !!slider.closest('.th-home-testimonials')
          || !!slider.closest('.s-block--testimonials');
      };

      const bindSlider = (slider) => {
        if (!(slider instanceof HTMLElement) || slider.tagName !== 'SALLA-SLIDER') {
          return;
        }
        if (slider.dataset.loadingPaginationBound === 'true') {
          return;
        }
        slider.dataset.loadingPaginationBound = 'true';

        const activateLoadingPagination = () => {
          const swiper = slider.slider;
          const paginationType = swiper?.params?.pagination?.type;
          const hasPagination = !!swiper?.params?.pagination;
          const hasBulletPagination = hasPagination && (!paginationType || paginationType === 'bullets');
          if (!swiper || !hasBulletPagination) {
            return;
          }

          slider.dataset.loadingPaginationReady = 'true';
          slider.classList.add('th-slider-loading-pagination');
          if (isCustomerReviewsSlider(slider)) {
            slider.classList.add('th-testimonials-loading-pagination');
          }

          const touchMediaQuery = window.matchMedia('(max-width: 1024px), (pointer: coarse)');
          const syncTouchSwipe = () => {
            if (!touchMediaQuery.matches) {
              return;
            }

            swiper.params.allowTouchMove = true;
            swiper.params.simulateTouch = true;
            swiper.allowTouchMove = true;
          };
          syncTouchSwipe();

          if (typeof touchMediaQuery.addEventListener === 'function') {
            touchMediaQuery.addEventListener('change', syncTouchSwipe);
          } else if (typeof touchMediaQuery.addListener === 'function') {
            touchMediaQuery.addListener(syncTouchSwipe);
          }

          const hasAutoplay = !!swiper?.params?.autoplay;

          const getActiveDelay = () => {
            if (!hasAutoplay) {
              return 3000;
            }

            const activeSlide =
              swiper?.slides?.[swiper.activeIndex] ||
              slider.querySelector('.swiper-slide-active');
            const perSlideDelay = Number(activeSlide?.getAttribute?.('data-swiper-autoplay'));
            if (Number.isFinite(perSlideDelay) && perSlideDelay > 0) {
              return perSlideDelay;
            }

            const autoplayConfig = swiper?.params?.autoplay;
            if (
              autoplayConfig &&
              typeof autoplayConfig === 'object' &&
              Number.isFinite(Number(autoplayConfig.delay))
            ) {
              return Number(autoplayConfig.delay);
            }

            return 3000;
          };

          const syncDuration = () => {
            slider.style.setProperty('--th-slider-pagination-delay', `${getActiveDelay()}ms`);
          };

          const restartBulletAnimation = () => {
            const activeBullet = slider.querySelector('.swiper-pagination-bullet-active');

            slider
              .querySelectorAll('.swiper-pagination-bullet.is-loading')
              .forEach((bullet) => bullet.classList.remove('is-loading'));

            if (!hasAutoplay || !activeBullet) {
              return;
            }

            // Force reflow so animation restarts reliably after slide changes.
            // eslint-disable-next-line no-unused-expressions
            activeBullet.offsetWidth;
            activeBullet.classList.add('is-loading');
          };

          syncDuration();
          restartBulletAnimation();

          slider.addEventListener('slideChangeTransitionStart', () => {
            syncDuration();
            restartBulletAnimation();
          });

          slider.addEventListener('mouseenter', () => slider.classList.add('is-paused'));
          slider.addEventListener('mouseleave', () => slider.classList.remove('is-paused'));
          slider.addEventListener('focusin', () => slider.classList.add('is-paused'));
          slider.addEventListener('focusout', () => slider.classList.remove('is-paused'));
        };

        if (slider.slider) {
          activateLoadingPagination();
        }

        slider.addEventListener('afterInit', activateLoadingPagination, { once: true });
      };

      document.querySelectorAll('salla-slider').forEach(bindSlider);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return;
            }

            const element = /** @type {HTMLElement} */ (node);
            if (element.matches?.('salla-slider')) {
              bindSlider(element);
            }
            element.querySelectorAll?.('salla-slider').forEach(bindSlider);
          });
        });
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }
  // --- End Custom Feature ---

  initFeaturedProductsStyle3MobilePagination() {
    const blocks = document.querySelectorAll('.s-block--features-products.th-featured-products-style3.two-cols');
    if (!blocks.length) {
      return;
    }

    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const bindBlock = (block) => {
      if (!(block instanceof HTMLElement) || block.dataset.featuredStyle3PaginationBound === 'true') {
        return;
      }
      block.dataset.featuredStyle3PaginationBound = 'true';

      const inner = block.querySelector('.inner');
      const pagination = block.querySelector('[data-featured-style3-pagination]');
      const sections = inner ? Array.from(inner.children).filter((child) => child.tagName === 'SECTION') : [];
      const slideLabel = pagination instanceof HTMLElement ? (pagination.dataset.slideLabel || 'Slide') : 'Slide';

      if (!(inner instanceof HTMLElement) || !(pagination instanceof HTMLElement) || sections.length < 2) {
        return;
      }

      let activePage = 0;
      let pageStarts = sections.map((_, index) => index);
      let scrollTimeout = null;
      let isPointerDown = false;
      let dragStartX = 0;
      let dragStartScrollLeft = 0;
      let hasDragged = false;
      let suppressClick = false;
      let activePointerId = null;

      const isDesktop = () => desktopQuery.matches;
      const getPageSize = () => isDesktop() ? 2 : 1;
      const shouldPaginate = () => isDesktop() ? sections.length > 2 : sections.length > 1;
      const canDrag = () => block.classList.contains('is-scrollable');

      const setActiveDot = (pageIndex) => {
        const dots = Array.from(pagination.querySelectorAll('[data-featured-style3-dot]'));
        const safeIndex = Math.max(0, Math.min(pageIndex, dots.length - 1));
        activePage = safeIndex;

        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === safeIndex;
          dot.classList.toggle('swiper-pagination-bullet-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      };

      const renderDots = () => {
        pagination.innerHTML = '';

        if (pageStarts.length < 2) {
          pagination.hidden = true;
          return;
        }

        const fragment = document.createDocumentFragment();

        pageStarts.forEach((_, pageIndex) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'swiper-pagination-bullet';
          dot.dataset.featuredStyle3Dot = String(pageIndex);
          dot.setAttribute('aria-label', `${slideLabel} ${pageIndex + 1}`);
          fragment.appendChild(dot);
        });

        pagination.appendChild(fragment);
        pagination.hidden = false;
        setActiveDot(Math.min(activePage, pageStarts.length - 1));
      };

      const syncActiveIndexFromScroll = () => {
        if (pagination.hidden || !pageStarts.length) {
          return;
        }

        const containerRect = inner.getBoundingClientRect();
        const isRTL = getComputedStyle(block).direction === 'rtl';

        let nearestPage = activePage;
        let nearestDistance = Number.POSITIVE_INFINITY;

        pageStarts.forEach((sectionIndex, pageIndex) => {
          const section = sections[sectionIndex];
          const sectionRect = section.getBoundingClientRect();
          const distance = isRTL
            ? Math.abs(sectionRect.right - containerRect.right)
            : Math.abs(sectionRect.left - containerRect.left);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestPage = pageIndex;
          }
        });

        setActiveDot(nearestPage);
      };

      const scrollToPage = (pageIndex) => {
        const safeIndex = Math.max(0, Math.min(pageIndex, pageStarts.length - 1));
        const target = sections[pageStarts[safeIndex]];
        if (!target) {
          return;
        }

        setActiveDot(safeIndex);
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      };

      const stopDragging = () => {
        if (!isPointerDown) {
          return;
        }

        isPointerDown = false;
        activePointerId = null;
        block.classList.remove('is-dragging');
        inner.classList.remove('is-dragging');

        if (hasDragged) {
          suppressClick = true;
          window.setTimeout(() => {
            suppressClick = false;
          }, 80);
        }
      };

      const syncPaginationState = () => {
        const pageSize = getPageSize();
        pageStarts = sections.reduce((pages, _section, index) => {
          if (index % pageSize === 0) {
            pages.push(index);
          }
          return pages;
        }, []);

        const shouldEnable = shouldPaginate() && pageStarts.length > 1;
        block.classList.toggle('is-scrollable', shouldEnable);
        block.classList.toggle('is-draggable', shouldEnable);

        const hasOverflow = shouldEnable && Math.ceil(inner.scrollWidth - inner.clientWidth) > 8;
        const enablePagination = shouldEnable && hasOverflow;

        block.classList.toggle('is-scrollable', enablePagination);
        block.classList.toggle('is-draggable', enablePagination);
        block.classList.toggle('has-pagination', enablePagination);

        renderDots();

        if (!enablePagination) {
          pagination.hidden = true;
          activePage = 0;
          stopDragging();
          return;
        }

        window.requestAnimationFrame(syncActiveIndexFromScroll);
      };

      pagination.addEventListener('click', (event) => {
        const dot = event.target.closest('[data-featured-style3-dot]');
        if (!(dot instanceof HTMLElement)) {
          return;
        }

        scrollToPage(Number(dot.dataset.featuredStyle3Dot || 0));
      });

      inner.addEventListener('click', (event) => {
        if (!suppressClick) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }, true);

      inner.addEventListener('pointerdown', (event) => {
        if (!canDrag()) {
          return;
        }

        isPointerDown = true;
        hasDragged = false;
        activePointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartScrollLeft = inner.scrollLeft;
        block.classList.add('is-dragging');
        inner.classList.add('is-dragging');

        if (typeof inner.setPointerCapture === 'function') {
          inner.setPointerCapture(event.pointerId);
        }
      });

      inner.addEventListener('pointermove', (event) => {
        if (!isPointerDown || activePointerId !== event.pointerId || !canDrag()) {
          return;
        }

        const deltaX = event.clientX - dragStartX;
        if (Math.abs(deltaX) > 4) {
          hasDragged = true;
        }

        if (!hasDragged) {
          return;
        }

        inner.scrollLeft = dragStartScrollLeft - deltaX;
        event.preventDefault();
      });

      inner.addEventListener('pointerup', stopDragging);
      inner.addEventListener('pointercancel', stopDragging);
      inner.addEventListener('lostpointercapture', stopDragging);
      inner.addEventListener('pointerleave', (event) => {
        if (isPointerDown && event.pointerType === 'mouse') {
          stopDragging();
        }
      });

      inner.addEventListener('scroll', () => {
        if (!block.classList.contains('is-scrollable')) {
          return;
        }

        if (scrollTimeout) {
          window.clearTimeout(scrollTimeout);
        }
        scrollTimeout = window.setTimeout(syncActiveIndexFromScroll, 80);
      }, { passive: true });

      const handleViewportChange = () => {
        syncPaginationState();
      };

      if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', handleViewportChange);
      } else if (typeof desktopQuery.addListener === 'function') {
        desktopQuery.addListener(handleViewportChange);
      }

      window.addEventListener('resize', handleViewportChange, { passive: true });
      window.requestAnimationFrame(syncPaginationState);
    };

    blocks.forEach(bindBlock);
  }


  initThStoreFeaturesMobilePagination() {
    const sections = document.querySelectorAll('[data-th-store-features]');
    if (!sections.length) {
      return;
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)');

    const debounce = (fn, wait = 120) => {
      let timeout;
      return (...args) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), wait);
      };
    };

    const bindSection = (section) => {
      if (!(section instanceof HTMLElement) || section.dataset.thStoreFeaturesPaginationBound === 'true') {
        return;
      }
      section.dataset.thStoreFeaturesPaginationBound = 'true';

      const track = section.querySelector('[data-th-store-features-track]');
      const pagination = section.querySelector('[data-th-store-features-pagination]');
      const cards = Array.from(section.querySelectorAll('.th-store-features__card'));
      const dots = Array.from(section.querySelectorAll('[data-th-store-features-dot]'));
      if (!track || !pagination || !cards.length || dots.length !== cards.length) {
        return;
      }

      let activeIndex = 0;
      const isMobile = () => mobileQuery.matches;

      const setActiveDot = (index) => {
        activeIndex = Math.max(0, Math.min(index, dots.length - 1));
        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === activeIndex;
          dot.classList.toggle('swiper-pagination-bullet-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      };

      const scrollToCard = (index) => {
        const target = cards[Math.max(0, Math.min(index, cards.length - 1))];
        if (!target) {
          return;
        }
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      };

      const updateFromScroll = debounce(() => {
        if (!isMobile()) {
          return;
        }

        const center = track.getBoundingClientRect().left + track.clientWidth / 2;
        let nearestIndex = activeIndex;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const distance = Math.abs((rect.left + rect.width / 2) - center);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActiveDot(nearestIndex);
      }, 100);

      const syncPaginationVisibility = () => {
        pagination.hidden = !isMobile();
        if (isMobile()) {
          updateFromScroll();
        }
      };

      dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', (event) => {
          event.preventDefault();
          if (!isMobile()) {
            return;
          }
          setActiveDot(dotIndex);
          scrollToCard(dotIndex);
        });
      });

      track.addEventListener('scroll', updateFromScroll, { passive: true });

      if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', syncPaginationVisibility);
      } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(syncPaginationVisibility);
      }

      setActiveDot(0);
      syncPaginationVisibility();
    };

    sections.forEach(bindSection);
  }

  initGlobalAnnouncementBars() {
    document.querySelectorAll('[data-th-global-announcement]').forEach((root) => {
      if (!(root instanceof HTMLElement) || root.dataset.thAnnouncementBound === 'true') {
        return;
      }
      root.dataset.thAnnouncementBound = 'true';

      const dismissible = root.dataset.dismissible === '1';
      const storageKey = root.dataset.dismissKey || 'th-global-announcement-dismissed';
      if (!dismissible) {
        return;
      }

      try {
        if (window.localStorage && localStorage.getItem(storageKey) === '1') {
          root.remove();
          return;
        }
      } catch (error) {
        this.log('Global announcement localStorage unavailable');
      }

      const closeButton = root.querySelector('[data-th-global-announcement-close]');
      if (!closeButton) {
        return;
      }

      closeButton.addEventListener('click', () => {
        root.remove();
        try {
          if (window.localStorage) {
            localStorage.setItem(storageKey, '1');
          }
        } catch (error) {
          this.log('Global announcement dismissal could not be saved');
        }
      });
    });
  }

  initFaqAccordions() {
    document.querySelectorAll('[data-th-faq]').forEach((root) => {
      if (!(root instanceof HTMLElement) || root.dataset.thFaqBound === 'true') {
        return;
      }
      root.dataset.thFaqBound = 'true';

      const detailsNodes = Array.from(root.querySelectorAll('.th-faq__item details'));
      detailsNodes.forEach((target) => {
        target.addEventListener('toggle', () => {
          if (!target.open) {
            return;
          }

          detailsNodes.forEach((node) => {
            if (node !== target) {
              node.removeAttribute('open');
            }
          });
        });
      });
    });
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
      const clickedElement = e.target instanceof Element ? e.target : null;
      const trigger = clickedElement?.closest?.('[data-modal-trigger]') || e.currentTarget;
      const modalId = trigger?.dataset?.modalTrigger;
      if (!modalId) return;

      const id = `#${modalId}`;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); // small amount of time to run animation after hidden is removed
    });

    salla.event.document.onClick("[data-close-modal]", e => {
      const clickedElement = e.target instanceof Element ? e.target : null;
      const trigger = clickedElement?.closest?.('[data-close-modal]') || e.currentTarget || e.target;
      const modalId = trigger?.dataset?.closeModal;
      if (!modalId) return;

      this.toggleModal(`#${modalId}`, false);
    });
  }

  toggleModal(id, isOpen) {
    const modal = document.querySelector(id);
    if (!modal) return this;

    modal.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'ease-out duration-300 opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'ease-out duration-300 opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      setTimeout(() => this.addClass(id, 'hidden'), 350);
    }
    return this;
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
