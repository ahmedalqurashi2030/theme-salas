/**
 * =====================================================
 * Tharaa Theme - Links Components JavaScript
 * =====================================================
 * Components: th-links-circle, th-links-square, th-links-rect
 * Features: Slider, Layout Switching, Progress Bar, Navigation, Drag to Scroll
 * Compatible with: Salla Platform
 * Version: 1.0.0
 * =====================================================
 */

(function () {
  'use strict';

  /**
   * Tharaa Links UI Manager
   * Namespaced to avoid conflicts with other scripts
   */
  const TharaaLinksUI = {
    /**
     * Initialize all link sections on the page
     */
    init: function () {
      // Find all link sections
      const sections = document.querySelectorAll('.tharaa-links-section');

      if (sections.length === 0) {
        return; // No sections found, exit early
      }

      // Initialize each section
      sections.forEach(section => {
        this.initSection(section);
      });
    },

    /**
     * Initialize a single section
     * @param {HTMLElement} section - The section element
     */
    initSection: function (section) {
      if (section.dataset.tharaaLinksInitialized === 'true') {
        return;
      }
      section.dataset.tharaaLinksInitialized = 'true';

      const track = section.querySelector('.tharaa-track');
      const prevBtn = section.querySelector('.btn-prev');
      const nextBtn = section.querySelector('.btn-next');
      const progressBar = section.querySelector('.tharaa-progress__bar');
      const progressContainer = section.querySelector('.tharaa-progress');

      if (!track) {
        console.warn('Tharaa Links: Track not found in section', section);
        return;
      }

      // Get autoplay setting from data attribute
      const autoplay = section.dataset.autoplay === 'true';
      let autoplayInterval = null;

      const isRTLDocument = () => document.dir === 'rtl' || document.documentElement.dir === 'rtl';
      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      const getMaxScroll = () => Math.max(track.scrollWidth - track.clientWidth, 0);

      /**
       * Detect RTL scroll model used by current browser:
       * - negative: 0 at start and negative values while scrolling forward
       * - reverse: max at start and 0 at end
       * - default: 0 at start and positive values while scrolling forward
       */
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

      const rtlScrollMode = isRTLDocument() ? detectRTLScrollMode() : 'default';

      /**
       * Return a direction-agnostic logical scroll position (0..max).
       */
      const getLogicalScrollLeft = () => {
        const maxScroll = getMaxScroll();

        if (!isRTLDocument()) {
          return clamp(track.scrollLeft, 0, maxScroll);
        }

        if (rtlScrollMode === 'negative') {
          return clamp(-track.scrollLeft, 0, maxScroll);
        }

        if (rtlScrollMode === 'reverse') {
          return clamp(maxScroll - track.scrollLeft, 0, maxScroll);
        }

        return clamp(track.scrollLeft, 0, maxScroll);
      };

      /**
       * Set logical scroll position and convert it to browser-native raw value.
       */
      const setLogicalScrollLeft = (value, behavior = 'auto') => {
        const maxScroll = getMaxScroll();
        const logical = clamp(value, 0, maxScroll);

        if (!isRTLDocument()) {
          track.scrollTo({ left: logical, behavior });
          return;
        }

        let rawTarget = logical;
        if (rtlScrollMode === 'negative') {
          rawTarget = -logical;
        } else if (rtlScrollMode === 'reverse') {
          rawTarget = maxScroll - logical;
        }

        track.scrollTo({ left: rawTarget, behavior });
      };

      /**
       * Update UI state (progress bar, navigation buttons)
       */
      const updateUI = () => {
        // Skip update if in grid mode
        if (section.classList.contains('mode-grid')) {
          if (progressContainer) progressContainer.style.opacity = '0';
          if (prevBtn) prevBtn.classList.remove('is-visible');
          if (nextBtn) nextBtn.classList.remove('is-visible');
          return;
        }

        // Calculate scroll position
        const isRTL = isRTLDocument();
        const maxScroll = getMaxScroll();
        const scrollLeft = getLogicalScrollLeft();

        // Hide UI if content fits in viewport
        if (maxScroll <= 5) {
          if (progressContainer) progressContainer.style.opacity = '0';
          if (prevBtn) prevBtn.classList.remove('is-visible');
          if (nextBtn) nextBtn.classList.remove('is-visible');
          return;
        }

        // Show progress container
        if (progressContainer) progressContainer.style.opacity = '1';

        // Update progress bar
        if (progressBar) {
          const thumbPercent = Math.max((track.clientWidth / track.scrollWidth) * 100, 18);
          const clampedThumbPercent = Math.min(thumbPercent, 100);
          const travelPercent = Math.max(100 - clampedThumbPercent, 0);
          const ratio = maxScroll > 0 ? (scrollLeft / maxScroll) : 0;
          const offset = isRTL ? (1 - ratio) * travelPercent : ratio * travelPercent;

          progressBar.style.width = `${clampedThumbPercent}%`;
          progressBar.style.transform = `translateX(${offset}%)`;
        }

        // Update navigation buttons visibility
        if (prevBtn) {
          scrollLeft > 20
            ? prevBtn.classList.add('is-visible')
            : prevBtn.classList.remove('is-visible');
        }

        if (nextBtn) {
          scrollLeft < maxScroll - 20
            ? nextBtn.classList.add('is-visible')
            : nextBtn.classList.remove('is-visible');
        }
      };

      /**
       * Scroll Event Handler (Throttled via requestAnimationFrame)
       */
      let ticking = false;
      track.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateUI();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      /**
       * Navigation Button Handlers
       */
      const getScrollAmount = () => {
        return track.clientWidth * 0.7; // Scroll 70% of viewport
      };

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const scrollAmount = getScrollAmount();
          const currentScroll = getLogicalScrollLeft();
          setLogicalScrollLeft(currentScroll + scrollAmount, 'smooth');
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const scrollAmount = getScrollAmount();
          const currentScroll = getLogicalScrollLeft();
          setLogicalScrollLeft(currentScroll - scrollAmount, 'smooth');
        });
      }

      /**
       * Drag to Scroll (Mouse & Touch)
       */
      let isDown = false;
      let startX;
      let scrollLeft;

      // Mouse events
      track.addEventListener('mousedown', (e) => {
        if (section.classList.contains('mode-grid')) return;

        isDown = true;
        track.classList.add('is-dragging');
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;

        // Prevent text selection while dragging
        e.preventDefault();
      });

      track.addEventListener('mouseleave', () => {
        isDown = false;
        track.classList.remove('is-dragging');
      });

      track.addEventListener('mouseup', () => {
        isDown = false;
        track.classList.remove('is-dragging');
      });

      track.addEventListener('mousemove', (e) => {
        if (!isDown) return;

        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 2.5; // Scroll speed multiplier
        track.scrollLeft = scrollLeft - walk;
      });

      // Touch events (mobile)
      let touchStartX = 0;
      let touchScrollLeft = 0;

      track.addEventListener('touchstart', (e) => {
        if (section.classList.contains('mode-grid')) return;

        touchStartX = e.touches[0].pageX - track.offsetLeft;
        touchScrollLeft = track.scrollLeft;
      }, { passive: true });

      track.addEventListener('touchmove', (e) => {
        if (section.classList.contains('mode-grid')) return;

        const x = e.touches[0].pageX - track.offsetLeft;
        const walk = (x - touchStartX) * 2;
        track.scrollLeft = touchScrollLeft - walk;
      }, { passive: true });

      /**
       * Autoplay Functionality
       */
      if (autoplay) {
        const startAutoplay = () => {
          // Don't autoplay in grid mode
          if (section.classList.contains('mode-grid')) return;

          autoplayInterval = setInterval(() => {
            const maxScroll = getMaxScroll();
            const currentScroll = getLogicalScrollLeft();

            // Check if reached end
            if (currentScroll >= maxScroll - 10) {
              // Reset to start
              setLogicalScrollLeft(0, 'smooth');
            } else {
              // Scroll forward
              setLogicalScrollLeft(currentScroll + 200, 'smooth');
            }
          }, 3000); // Scroll every 3 seconds
        };

        // Pause autoplay on hover (desktop only)
        if (window.matchMedia('(hover: hover)').matches) {
          section.addEventListener('mouseenter', () => {
            if (autoplayInterval) {
              clearInterval(autoplayInterval);
              autoplayInterval = null;
            }
          });

          section.addEventListener('mouseleave', () => {
            if (!autoplayInterval && !section.classList.contains('mode-grid')) {
              startAutoplay();
            }
          });
        }

        // Start autoplay
        startAutoplay();
      }

      /**
       * Resize Observer - Update UI on window resize
       */
      const resizeObserver = new ResizeObserver(() => {
        updateUI();
      });

      resizeObserver.observe(track);

      /**
       * Intersection Observer - Pause autoplay when out of view
       */
      if (autoplay && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting && autoplayInterval) {
              // Section is out of view, pause autoplay
              clearInterval(autoplayInterval);
              autoplayInterval = null;
            } else if (entry.isIntersecting && autoplay && !autoplayInterval && !section.classList.contains('mode-grid')) {
              // Section is in view, resume autoplay
              autoplayInterval = setInterval(() => {
                const currentScroll = getLogicalScrollLeft();
                setLogicalScrollLeft(currentScroll + 200, 'smooth');
              }, 3000);
            }
          });
        }, { threshold: 0.1 });

        observer.observe(section);
      }

      /**
       * Initial UI Update
       */
      updateUI();

      /**
       * Cleanup on unload (prevent memory leaks)
       */
      window.addEventListener('unload', () => {
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      });
    },

    /**
     * Public method to refresh a specific section
     * @param {string} sectionId - The section ID
     */
    refresh: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        section.dataset.tharaaLinksInitialized = 'false';
        this.initSection(section);
      }
    },

    /**
     * Public method to destroy a section (cleanup)
     * @param {string} sectionId - The section ID
     */
    destroy: function (sectionId) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      section.dataset.tharaaLinksInitialized = 'false';

      // Remove event listeners and intervals
      const track = section.querySelector('.tharaa-track');
      if (track) {
        // Clone and replace to remove all event listeners
        const newTrack = track.cloneNode(true);
        track.parentNode.replaceChild(newTrack, track);
      }
    }
  };

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      TharaaLinksUI.init();
    });
  } else {
    // DOM is already ready
    TharaaLinksUI.init();
  }

  /**
   * Expose to global scope for external access
   * This allows calling TharaaLinksUI.refresh() or TharaaLinksUI.destroy() from outside
   */
  window.TharaaLinksUI = TharaaLinksUI;

  /**
   * Salla Integration - Re-initialize after dynamic content updates
   * Listen for Salla's custom events if needed
   */
  if (typeof salla !== 'undefined') {
    // Example: Re-initialize when products are updated
    // salla.event.on('product:updated', () => {
    //   TharaaLinksUI.init();
    // });
  }

})();
