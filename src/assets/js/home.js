import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initPromoHeroProducts();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            });
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    initPromoHeroProducts() {
        document.querySelectorAll('.th-promo-hero').forEach(section => {
            if (section.dataset.promoHeroInitialized === 'true') return;
            section.dataset.promoHeroInitialized = 'true';

            this.initPromoCountdown(section);
            this.initPromoProductsScroll(section);
        });
    }

    initPromoCountdown(section) {
        const timer = section.querySelector('[data-th-promo-countdown]');
        if (!timer) return;

        const endValue = (timer.getAttribute('data-end') || '').trim();
        if (!endValue) return;

        const expiredText = timer.getAttribute('data-expired-text') || 'Offer has ended';
        const expiredLabel = section.querySelector('[data-th-promo-expired]');
        const parseDate = (value) => {
            const directDate = new Date(value);
            if (!Number.isNaN(directDate.getTime())) return directDate;

            const normalizedDate = new Date(value.replace(' ', 'T'));
            return Number.isNaN(normalizedDate.getTime()) ? null : normalizedDate;
        };

        const endDate = parseDate(endValue);
        if (!endDate) return;

        const field = part => timer.querySelector(`[data-part="${part}"]`);
        const pad = value => String(value).padStart(2, '0');

        const updateTimer = () => {
            const remaining = endDate.getTime() - Date.now();

            if (remaining <= 0) {
                timer.setAttribute('hidden', '');
                if (expiredLabel) {
                    expiredLabel.hidden = false;
                    expiredLabel.textContent = expiredText;
                }
                clearInterval(intervalId);
                return;
            }

            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);

            field('days') && (field('days').textContent = pad(days));
            field('hours') && (field('hours').textContent = pad(hours));
            field('minutes') && (field('minutes').textContent = pad(minutes));
            field('seconds') && (field('seconds').textContent = pad(seconds));
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();
    }

    initPromoProductsScroll(section) {
        const track = section.querySelector('[data-th-promo-products-track]');
        const thumb = section.querySelector('[data-th-promo-scroll-thumb]');
        const trackBar = section.querySelector('[data-th-promo-scroll-track]');
        if (!track || !thumb || !trackBar) return;

        const getDirection = () => {
            const scopedDir = section.closest('[dir]')?.getAttribute('dir');
            const docDir = document.documentElement.getAttribute('dir') || document.dir;
            return (scopedDir || docDir || 'ltr').toLowerCase();
        };

        const isRTL = () => getDirection() === 'rtl';
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        const maxScroll = () => Math.max(track.scrollWidth - track.clientWidth, 0);

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

        const rtlMode = isRTL() ? detectRTLScrollMode() : 'default';
        const getLogicalScroll = () => {
            const max = maxScroll();
            if (!isRTL()) return clamp(track.scrollLeft, 0, max);
            if (rtlMode === 'negative') return clamp(-track.scrollLeft, 0, max);
            if (rtlMode === 'reverse') return clamp(max - track.scrollLeft, 0, max);
            return clamp(track.scrollLeft, 0, max);
        };

        const updateThumb = () => {
            const max = maxScroll();
            if (max <= 0) {
                trackBar.style.display = 'none';
                thumb.style.transform = 'translateX(0)';
                return;
            }

            trackBar.style.display = '';
            const ratio = getLogicalScroll() / max;
            const visualRatio = isRTL() ? 1 - ratio : ratio;
            const travel = trackBar.clientWidth - thumb.clientWidth;
            thumb.style.transform = `translateX(${visualRatio * travel}px)`;
        };

        let ticking = false;
        track.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                updateThumb();
                ticking = false;
            });
        }, { passive: true });

        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(updateThumb);
            resizeObserver.observe(track);
            resizeObserver.observe(trackBar);
        } else {
            window.addEventListener('resize', updateThumb);
        }

        updateThumb();
    }
}

Home.initiateWhenReady(['index']);
