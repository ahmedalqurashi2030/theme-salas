/**
 * =====================================================
 * Tharaa Theme — Links Slider Controller
 * =====================================================
 * Components: th-links-circle, th-links-square, th-links-rect
 * Features:
 *   ✅ RTL / LTR aware scrolling & progress bar
 *   ✅ Mouse drag to scroll (pointer events)
 *   ✅ Touch-friendly (native scroll preserved)
 *   ✅ Progress bar hidden until items overflow container
 *   ✅ Nav buttons hidden until items overflow container
 *   ✅ Keyboard accessible (ArrowLeft / ArrowRight / Home / End)
 *   ✅ Autoplay with pause on hover / focus / off-screen
 *   ✅ ResizeObserver keeps UI in sync
 *   ✅ Salla preview hot-reload aware
 * =====================================================
 */

(function () {
  'use strict';

  const SECTION_SELECTOR = '.tharaa-links-section';
  const SECTION_STATE = new WeakMap();

  // ─── Utilities ──────────────────────────────────────────────────────────────

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /**
   * Resolve RTL/LTR direction for a section.
   * Checks: section data attr → nearest ancestor [dir] → documentElement.
   */
  const getDirection = (section) => {
    const attr =
      section.dataset.thLinksDir ||
      section.getAttribute('dir') ||
      section.closest('[dir]')?.getAttribute('dir') ||
      document.documentElement.getAttribute('dir') ||
      document.dir ||
      'ltr';
    return attr.toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
  };

  // ─── RTL-aware scroll model ──────────────────────────────────────────────────

  /**
   * Browsers implement RTL scrollLeft in three incompatible ways.
   * We normalise to a "logical scroll" (0 = start, maxScroll = end)
   * regardless of direction or browser quirks.
   */
  const createScrollModel = (track, direction) => {
    const isRTL = direction === 'rtl';

    const getMaxScroll = () => Math.max(track.scrollWidth - track.clientWidth, 0);

    // Detect which RTL scrollLeft convention this browser uses.
    const detectRTLMode = () => {
      const saved = track.scrollLeft;
      track.scrollLeft = -1;
      if (track.scrollLeft < 0) { track.scrollLeft = saved; return 'negative'; }
      track.scrollLeft = 1;
      const mode = track.scrollLeft === 0 ? 'reverse' : 'default';
      track.scrollLeft = saved;
      return mode;
    };

    const rtlMode = isRTL ? detectRTLMode() : 'default';

    const getLogical = () => {
      const max = getMaxScroll();
      if (!isRTL) return clamp(track.scrollLeft, 0, max);
      if (rtlMode === 'negative') return clamp(-track.scrollLeft, 0, max);
      if (rtlMode === 'reverse') return clamp(max - track.scrollLeft, 0, max);
      return clamp(track.scrollLeft, 0, max);
    };

    const setLogical = (value, behavior = 'auto') => {
      const max = getMaxScroll();
      const logical = clamp(value, 0, max);
      let raw = logical;
      if (isRTL) {
        if (rtlMode === 'negative') raw = -logical;
        else if (rtlMode === 'reverse') raw = max - logical;
      }
      track.scrollTo({ left: raw, behavior });
    };

    return { isRTL, getMaxScroll, getLogical, setLogical };
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const getScrollStep = (track) => {
    const card = track.querySelector('.tharaa-card');
    const fallback = track.clientWidth * 0.72;
    if (!card) return fallback;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
    return Math.max(card.getBoundingClientRect().width + gap, fallback);
  };

  // ─── Section lifecycle ───────────────────────────────────────────────────────

  const destroySection = (section) => {
    SECTION_STATE.get(section)?.destroy();
    section.dataset.tharaaLinksInitialized = 'false';
  };

  const initSection = (section) => {
    if (!section) return;

    destroySection(section);
    section.dataset.tharaaLinksInitialized = 'true';

    const track = section.querySelector('[data-th-links-track], .tharaa-track');
    if (!track) {
      console.warn('Tharaa Links: track not found', section);
      section.dataset.tharaaLinksInitialized = 'false';
      return;
    }

    const prevBtn = section.querySelector('.btn-prev');
    const nextBtn = section.querySelector('.btn-next');
    const progressWrap = section.querySelector('.tharaa-progress');
    const progressBar = section.querySelector('.tharaa-progress__bar');
    const autoplayEnabled = section.dataset.autoplay === 'true';

    const direction = getDirection(section);
    const sm = createScrollModel(track, direction);

    const cleanups = [];
    let autoplayTimer = null;
    let interactionLocked = false;
    let isTicking = false;

    // Drag state
    let dragging = false;
    let activePtr = null;
    let startX = 0;
    let startScroll = 0;
    let hasDragged = false;
    let suppressClickUntil = 0;

    // ── Event wiring helper ------------------------------------------------
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      cleanups.push(() => el.removeEventListener(ev, fn, opts));
    };

    // ── UI update -----------------------------------------------------------
    const updateUI = () => {
      // Grid mode — nothing to animate.
      if (section.classList.contains('mode-grid')) {
        section.classList.remove('th-links-is-scrollable');
        if (progressWrap) progressWrap.style.opacity = '0';
        setBtn(prevBtn, false);
        setBtn(nextBtn, false);
        return;
      }

      const max = sm.getMaxScroll();
      const cur = sm.getLogical();
      const hasOverflow = max > 4;

      section.classList.toggle('th-links-is-scrollable', hasOverflow);

      // Progress bar — show/hide based on overflow
      if (progressWrap) {
        progressWrap.style.opacity = hasOverflow ? '1' : '0';
      }

      if (!hasOverflow) {
        // All items visible — full-width bar, no nav needed.
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.transform = 'translate3d(0,0,0)';
        }
        setBtn(prevBtn, false);
        setBtn(nextBtn, false);
        return;
      }

      // Thumb width proportional to visible / total content.
      if (progressBar && progressWrap) {
        const wrapW = progressWrap.clientWidth;
        const ratio = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 0;
        const thumbW = clamp(wrapW * ratio, 18, wrapW);
        const travel = Math.max(wrapW - thumbW, 0);
        const progress = max > 0 ? cur / max : 0;

        // For RTL: thumb moves right-to-left, so invert when tracking LTR translateX.
        // The progress bar element always starts at left:0 in CSS.
        // In RTL, when scroll is at start (0), bar should be at END visually.
        const visualProgress = sm.isRTL ? 1 - progress : progress;

        progressBar.style.width = `${thumbW}px`;
        progressBar.style.transform = `translate3d(${travel * visualProgress}px,0,0)`;
      }

      setBtn(prevBtn, cur > 6);
      setBtn(nextBtn, cur < max - 6);
    };

    const setBtn = (btn, visible) => {
      if (!btn) return;
      btn.classList.toggle('is-visible', visible);
      btn.setAttribute('aria-hidden', visible ? 'false' : 'true');
      btn.tabIndex = visible ? 0 : -1;
    };

    const scheduleUpdate = () => {
      if (isTicking) return;
      isTicking = true;
      requestAnimationFrame(() => { updateUI(); isTicking = false; });
    };

    // ── Scroll step ---------------------------------------------------------
    const scrollStep = (mult) => {
      sm.setLogical(sm.getLogical() + getScrollStep(track) * mult, 'smooth');
    };

    // ── Autoplay ------------------------------------------------------------
    const startAutoplay = () => {
      if (!autoplayEnabled || autoplayTimer || section.classList.contains('mode-grid') || interactionLocked) return;
      if (sm.getMaxScroll() <= 4) return;
      autoplayTimer = setInterval(() => {
        const max = sm.getMaxScroll();
        if (max <= 4) return;
        const next = sm.getLogical() + getScrollStep(track);
        sm.setLogical(next >= max - 4 ? 0 : next, 'smooth');
      }, 3200);
    };

    const stopAutoplay = () => { clearInterval(autoplayTimer); autoplayTimer = null; };
    const pauseAP = () => { interactionLocked = true; stopAutoplay(); };
    const resumeAP = () => { interactionLocked = false; startAutoplay(); };

    // ── Drag (pointer events — desktop mice & stylus only) ------------------
    // Touch devices use native scroll (touch-action: pan-y in CSS).
    const onPointerDown = (e) => {
      if (section.classList.contains('mode-grid')) return;
      if (e.pointerType === 'touch') return;
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest('.tharaa-nav-btn, input, textarea, select, button')) return;

      dragging = true;
      hasDragged = false;
      activePtr = e.pointerId;
      startX = e.clientX;
      startScroll = sm.getLogical();

      track.classList.add('is-dragging');
      track.setPointerCapture?.(e.pointerId);
      pauseAP();
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== activePtr) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) hasDragged = true;
      // Positive dx = moving right = scrolling left (towards start in LTR).
      sm.setLogical(startScroll - dx * 1.3, 'auto');
      if (hasDragged) e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!dragging) return;
      if (e && activePtr !== null && e.pointerId !== activePtr) return;
      if (hasDragged) suppressClickUntil = Date.now() + 280;
      dragging = false; activePtr = null; hasDragged = false;
      track.classList.remove('is-dragging');
      resumeAP();
    };

    const onClickCapture = (e) => {
      if (Date.now() < suppressClickUntil) { e.preventDefault(); e.stopPropagation(); }
    };

    const onDragStart = (e) => { if (e.target instanceof HTMLImageElement) e.preventDefault(); };

    // ── Keyboard navigation -------------------------------------------------
    const onKeydown = (e) => {
      if (section.classList.contains('mode-grid')) return;

      if (e.key === 'Home') { sm.setLogical(0, 'smooth'); e.preventDefault(); return; }
      if (e.key === 'End') { sm.setLogical(sm.getMaxScroll(), 'smooth'); e.preventDefault(); return; }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const step = Math.max(track.clientWidth * 0.4, getScrollStep(track) * 0.8);
      // In RTL, ArrowRight = scroll toward start (negative logical direction).
      const mult = (e.key === 'ArrowRight') === !sm.isRTL ? 1 : -1;
      sm.setLogical(sm.getLogical() + step * mult, 'smooth');
      e.preventDefault();
    };

    // ── Wire events ---------------------------------------------------------
    if (nextBtn) on(nextBtn, 'click', () => { pauseAP(); scrollStep(1); resumeAP(); });
    if (prevBtn) on(prevBtn, 'click', () => { pauseAP(); scrollStep(-1); resumeAP(); });

    on(track, 'scroll', scheduleUpdate, { passive: true });
    on(track, 'keydown', onKeydown);
    on(track, 'pointerdown', onPointerDown);
    on(track, 'pointermove', onPointerMove);
    on(track, 'pointerup', onPointerUp);
    on(track, 'pointercancel', onPointerUp);
    on(track, 'lostpointercapture', onPointerUp);
    on(track, 'click', onClickCapture, true);
    on(track, 'dragstart', onDragStart);

    // Autoplay suspend on hover / focus / off-screen.
    if (autoplayEnabled) {
      if (window.matchMedia('(hover: hover)').matches) {
        on(section, 'mouseenter', pauseAP);
        on(section, 'mouseleave', resumeAP);
      }
      on(section, 'focusin', pauseAP);
      on(section, 'focusout', resumeAP);

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => entries.forEach((e) => (e.isIntersecting ? resumeAP() : pauseAP())),
          { threshold: 0.15 }
        );
        io.observe(section);
        cleanups.push(() => io.disconnect());
      }
    }

    // Keep UI in sync when container or window resizes.
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(scheduleUpdate);
      ro.observe(track);
      if (progressWrap) ro.observe(progressWrap);
      cleanups.push(() => ro.disconnect());
    } else {
      on(window, 'resize', scheduleUpdate);
    }

    startAutoplay();
    updateUI();

    // ── Destroy -------------------------------------------------------------
    const destroy = () => {
      stopAutoplay();
      cleanups.forEach((fn) => { try { fn(); } catch (_) { } });
      track.classList.remove('is-dragging');
      section.classList.remove('th-links-is-scrollable');
      section.dataset.tharaaLinksInitialized = 'false';
      SECTION_STATE.delete(section);
    };

    SECTION_STATE.set(section, { destroy, updateUI });
  };

  // ─── Boot ────────────────────────────────────────────────────────────────────

  const initAll = () => {
    document.querySelectorAll(SECTION_SELECTOR).forEach((section) => {
      if (section.dataset.tharaaLinksInitialized === 'true' && SECTION_STATE.has(section)) return;
      initSection(section);
    });
  };

  const TharaaLinksUI = {
    init: initAll,
    refresh: (id) => initSection(document.getElementById(id)),
    destroy: (id) => destroySection(document.getElementById(id)),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }

  // Salla theme preview hot-reload.
  if (typeof salla !== 'undefined' && salla.event?.on) {
    salla.event.on('theme::preview::rendered', initAll);
    salla.event.on('theme::component::loaded', initAll);
  }

  window.TharaaLinksUI = TharaaLinksUI;
})();
