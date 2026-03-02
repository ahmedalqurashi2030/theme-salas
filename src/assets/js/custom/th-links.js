/**
 * =====================================================
 * Tharaa Theme - Links Components JavaScript
 * =====================================================
 * Components: th-links-circle, th-links-square, th-links-rect
 * Features: Slider, Layout Switching, Progress Bar, Navigation, Drag to Scroll
 * Compatible with: Salla Platform
 * Version: 2.0.0
 * =====================================================
 */

(function () {
  'use strict';

  const SECTION_SELECTOR = '.tharaa-links-section';
  const SECTION_STATE = new WeakMap();

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getSectionDirection = (section) => {
    const parentWithDir = section.closest('[dir]');
    const scopedDir = section.getAttribute('dir')
      || section.dataset.thLinksDir
      || (parentWithDir ? parentWithDir.getAttribute('dir') : '');
    const documentDir = document.documentElement.getAttribute('dir') || document.dir;

    return (scopedDir || documentDir || 'ltr').toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
  };

  const createScrollModel = (track, direction) => {
    const isRTL = direction === 'rtl';

    const getMaxScroll = () => Math.max(track.scrollWidth - track.clientWidth, 0);

    const detectRTLScrollMode = () => {
      const previous = track.scrollLeft;

      track.scrollLeft = -1;
      if (track.scrollLeft < 0) {
        track.scrollLeft = previous;
        return 'negative';
      }

      track.scrollLeft = 1;
      const mode = track.scrollLeft === 0 ? 'reverse' : 'default';
      track.scrollLeft = previous;
      return mode;
    };

    const rtlMode = isRTL ? detectRTLScrollMode() : 'default';

    const getLogicalScroll = () => {
      const maxScroll = getMaxScroll();

      if (!isRTL) {
        return clamp(track.scrollLeft, 0, maxScroll);
      }

      if (rtlMode === 'negative') {
        return clamp(-track.scrollLeft, 0, maxScroll);
      }

      if (rtlMode === 'reverse') {
        return clamp(maxScroll - track.scrollLeft, 0, maxScroll);
      }

      return clamp(track.scrollLeft, 0, maxScroll);
    };

    const setLogicalScroll = (value, behavior = 'auto') => {
      const maxScroll = getMaxScroll();
      const logicalValue = clamp(value, 0, maxScroll);

      if (!isRTL) {
        track.scrollTo({ left: logicalValue, behavior });
        return;
      }

      let rawValue = logicalValue;
      if (rtlMode === 'negative') {
        rawValue = -logicalValue;
      } else if (rtlMode === 'reverse') {
        rawValue = maxScroll - logicalValue;
      }

      track.scrollTo({ left: rawValue, behavior });
    };

    return {
      isRTL,
      getMaxScroll,
      getLogicalScroll,
      setLogicalScroll,
    };
  };

  const getScrollStep = (track) => {
    const firstCard = track.querySelector('.tharaa-card');
    const fallback = track.clientWidth * 0.72;

    if (!firstCard) {
      return fallback;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;

    return Math.max(cardWidth + gap, fallback);
  };

  const destroySection = (section) => {
    const state = SECTION_STATE.get(section);
    if (!state) {
      section.dataset.tharaaLinksInitialized = 'false';
      return;
    }

    state.destroy();
  };

  const initSection = (section) => {
    if (!section) return;

    // Re-init safely if component was already initialized.
    destroySection(section);
    section.dataset.tharaaLinksInitialized = 'true';

    const track = section.querySelector('[data-th-links-track], .tharaa-track');
    if (!track) {
      console.warn('Tharaa Links: Track not found in section', section);
      section.dataset.tharaaLinksInitialized = 'false';
      return;
    }

    const prevBtn = section.querySelector('.btn-prev');
    const nextBtn = section.querySelector('.btn-next');
    const progressContainer = section.querySelector('.tharaa-progress');
    const progressBar = section.querySelector('.tharaa-progress__bar');
    const autoplayEnabled = section.dataset.autoplay === 'true';

    const direction = getSectionDirection(section);
    const scrollModel = createScrollModel(track, direction);

    const cleanups = [];
    let autoplayTimer = null;
    let interactionLocked = false;

    let isDraggingPointer = false;
    let activePointerId = null;
    let startPointerX = 0;
    let startScrollLogical = 0;
    let dragged = false;
    let suppressClickUntil = 0;

    const addListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    };

    const setButtonVisibility = (button, visible) => {
      if (!button) return;
      button.classList.toggle('is-visible', visible);
      button.setAttribute('aria-hidden', visible ? 'false' : 'true');
      button.tabIndex = visible ? 0 : -1;
    };

    const updateUI = () => {
      if (section.classList.contains('mode-grid')) {
        section.classList.remove('th-links-is-scrollable');
        if (progressContainer) progressContainer.style.opacity = '0';
        setButtonVisibility(prevBtn, false);
        setButtonVisibility(nextBtn, false);
        return;
      }

      const maxScroll = scrollModel.getMaxScroll();
      const currentScroll = scrollModel.getLogicalScroll();
      const hasOverflow = maxScroll > 2;

      section.classList.toggle('th-links-is-scrollable', hasOverflow);

      if (progressContainer) {
        progressContainer.style.opacity = hasOverflow ? '1' : '0';
      }

      if (!hasOverflow) {
        if (progressBar) {
          progressBar.style.width = '0px';
          progressBar.style.transform = 'translate3d(0, 0, 0)';
        }

        setButtonVisibility(prevBtn, false);
        setButtonVisibility(nextBtn, false);
        return;
      }

      if (progressBar && progressContainer) {
        const containerWidth = progressContainer.clientWidth;
        const widthRatio = track.scrollWidth > 0 ? (track.clientWidth / track.scrollWidth) : 0;
        const thumbWidth = clamp(containerWidth * widthRatio, 20, containerWidth);
        const travel = Math.max(containerWidth - thumbWidth, 0);
        const ratio = maxScroll > 0 ? (currentScroll / maxScroll) : 0;
        const visualRatio = scrollModel.isRTL ? (1 - ratio) : ratio;

        progressBar.style.width = `${thumbWidth}px`;
        progressBar.style.transform = `translate3d(${travel * visualRatio}px, 0, 0)`;
      }

      setButtonVisibility(prevBtn, currentScroll > 6);
      setButtonVisibility(nextBtn, currentScroll < maxScroll - 6);
    };

    let isTicking = false;
    const requestUIUpdate = () => {
      if (isTicking) return;

      isTicking = true;
      window.requestAnimationFrame(() => {
        updateUI();
        isTicking = false;
      });
    };

    const scrollByStep = (directionMultiplier) => {
      const step = getScrollStep(track);
      const target = scrollModel.getLogicalScroll() + (step * directionMultiplier);
      scrollModel.setLogicalScroll(target, 'smooth');
    };

    const startAutoplay = () => {
      if (!autoplayEnabled || autoplayTimer || section.classList.contains('mode-grid') || interactionLocked) {
        return;
      }

      if (scrollModel.getMaxScroll() <= 2) {
        return;
      }

      autoplayTimer = window.setInterval(() => {
        const maxScroll = scrollModel.getMaxScroll();
        if (maxScroll <= 2) return;

        const current = scrollModel.getLogicalScroll();
        const next = current + getScrollStep(track);

        if (next >= maxScroll - 4) {
          scrollModel.setLogicalScroll(0, 'smooth');
          return;
        }

        scrollModel.setLogicalScroll(next, 'smooth');
      }, 3200);
    };

    const stopAutoplay = () => {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const pauseAutoplayForInteraction = () => {
      interactionLocked = true;
      stopAutoplay();
    };

    const resumeAutoplayAfterInteraction = () => {
      interactionLocked = false;
      startAutoplay();
    };

    const handlePointerDown = (event) => {
      if (section.classList.contains('mode-grid')) return;
      if (event.pointerType === 'touch') return; // Keep native touch scroll.
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest('.tharaa-nav-btn')) return;
      if (event.target.closest('input, textarea, select, button')) return;

      isDraggingPointer = true;
      dragged = false;
      activePointerId = event.pointerId;
      startPointerX = event.clientX;
      startScrollLogical = scrollModel.getLogicalScroll();

      track.classList.add('is-dragging');
      if (typeof track.setPointerCapture === 'function') {
        track.setPointerCapture(event.pointerId);
      }
      pauseAutoplayForInteraction();

      event.preventDefault();
    };

    const handlePointerMove = (event) => {
      if (!isDraggingPointer || event.pointerId !== activePointerId) return;

      const deltaX = event.clientX - startPointerX;
      if (Math.abs(deltaX) > 3) {
        dragged = true;
      }

      const nextScroll = startScrollLogical - (deltaX * 1.25);
      scrollModel.setLogicalScroll(nextScroll, 'auto');

      if (dragged) {
        event.preventDefault();
      }
    };

    const stopPointerDrag = (event) => {
      if (!isDraggingPointer) return;
      if (event && activePointerId !== null && event.pointerId !== activePointerId) return;

      if (dragged) {
        suppressClickUntil = Date.now() + 260;
      }

      isDraggingPointer = false;
      activePointerId = null;
      dragged = false;
      track.classList.remove('is-dragging');
      resumeAutoplayAfterInteraction();
    };

    const preventClickAfterDrag = (event) => {
      if (Date.now() > suppressClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const handleTrackKeydown = (event) => {
      if (section.classList.contains('mode-grid')) return;

      if (event.key === 'Home') {
        scrollModel.setLogicalScroll(0, 'smooth');
        event.preventDefault();
        return;
      }

      if (event.key === 'End') {
        scrollModel.setLogicalScroll(scrollModel.getMaxScroll(), 'smooth');
        event.preventDefault();
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      const step = Math.max(track.clientWidth * 0.45, getScrollStep(track) * 0.8);
      const isArrowRight = event.key === 'ArrowRight';
      const delta = isArrowRight
        ? (scrollModel.isRTL ? -step : step)
        : (scrollModel.isRTL ? step : -step);

      scrollModel.setLogicalScroll(scrollModel.getLogicalScroll() + delta, 'smooth');
      event.preventDefault();
    };

    const handleDragStart = (event) => {
      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    };

    if (nextBtn) {
      addListener(nextBtn, 'click', () => {
        pauseAutoplayForInteraction();
        scrollByStep(1);
        resumeAutoplayAfterInteraction();
      });
    }

    if (prevBtn) {
      addListener(prevBtn, 'click', () => {
        pauseAutoplayForInteraction();
        scrollByStep(-1);
        resumeAutoplayAfterInteraction();
      });
    }

    addListener(track, 'scroll', requestUIUpdate, { passive: true });
    addListener(track, 'keydown', handleTrackKeydown);
    addListener(track, 'pointerdown', handlePointerDown);
    addListener(track, 'pointermove', handlePointerMove);
    addListener(track, 'pointerup', stopPointerDrag);
    addListener(track, 'pointercancel', stopPointerDrag);
    addListener(track, 'lostpointercapture', stopPointerDrag);
    addListener(track, 'click', preventClickAfterDrag, true);
    addListener(track, 'dragstart', handleDragStart);

    if (autoplayEnabled) {
      if (window.matchMedia('(hover: hover)').matches) {
        addListener(section, 'mouseenter', pauseAutoplayForInteraction);
        addListener(section, 'mouseleave', resumeAutoplayAfterInteraction);
      }

      addListener(section, 'focusin', pauseAutoplayForInteraction);
      addListener(section, 'focusout', resumeAutoplayAfterInteraction);

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              resumeAutoplayAfterInteraction();
            } else {
              pauseAutoplayForInteraction();
            }
          });
        }, { threshold: 0.15 });

        observer.observe(section);
        cleanups.push(() => observer.disconnect());
      }
    }

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(requestUIUpdate);
      resizeObserver.observe(track);
      if (progressContainer) {
        resizeObserver.observe(progressContainer);
      }
      cleanups.push(() => resizeObserver.disconnect());
    } else {
      addListener(window, 'resize', requestUIUpdate);
    }

    startAutoplay();
    updateUI();

    const destroy = () => {
      stopAutoplay();
      cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          // Keep destroy safe even if one cleanup fails.
        }
      });

      track.classList.remove('is-dragging');
      section.classList.remove('th-links-is-scrollable');
      section.dataset.tharaaLinksInitialized = 'false';
      SECTION_STATE.delete(section);
    };

    SECTION_STATE.set(section, { destroy, updateUI });
  };

  const initAllSections = () => {
    const sections = document.querySelectorAll(SECTION_SELECTOR);
    if (!sections.length) return;

    sections.forEach((section) => {
      if (section.dataset.tharaaLinksInitialized === 'true' && SECTION_STATE.has(section)) {
        return;
      }

      initSection(section);
    });
  };

  const TharaaLinksUI = {
    init: initAllSections,

    refresh: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      initSection(section);
    },

    destroy: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      destroySection(section);
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections, { once: true });
  } else {
    initAllSections();
  }

  if (typeof salla !== 'undefined' && salla.event && typeof salla.event.on === 'function') {
    // Re-init after dynamic block rendering in preview/customizer.
    salla.event.on('theme::preview::rendered', initAllSections);
    salla.event.on('theme::component::loaded', initAllSections);
  }

  window.TharaaLinksUI = TharaaLinksUI;
})();
