import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initBeforeAfterHero();
        this.initPromoHeroProducts();
        this.initThBlogFallback();
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

    initThBlogFallback() {
        document.querySelectorAll('.js-th-blog-fallback').forEach(async (section) => {
            if (section.dataset.blogLoaded === 'true') return;
            section.dataset.blogLoaded = 'true';

            const grid = section.querySelector('.js-th-blog-grid');
            const emptyState = section.querySelector('.js-th-blog-empty');
            if (!grid) return;

            const limit = Math.max(parseInt(section.dataset.limit || '8', 10) || 8, 1);
            const selectedIds = this.parseBlogSelectedIds(section.dataset.selectedIds);

            try {
                let articles = [];

                if (selectedIds.length) {
                    articles = await this.fetchBlogsByIds(selectedIds, limit);
                }

                if (!articles.length) {
                    articles = await this.fetchLatestBlogs(limit);
                }

                const normalized = articles
                    .map((article) => this.normalizeBlogArticle(article))
                    .filter(Boolean)
                    .slice(0, limit);

                if (!normalized.length) {
                    if (emptyState) emptyState.hidden = false;
                    return;
                }

                grid.innerHTML = normalized
                    .map((article, index) => this.renderBlogFallbackCard(article, index))
                    .join('');

                if (emptyState) emptyState.hidden = true;
            } catch (error) {
                console.warn('th-blog fallback failed', error);
                if (emptyState) emptyState.hidden = false;
            }
        });
    }

    parseBlogSelectedIds(raw) {
        if (!raw) return [];

        let parsed = raw;
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = raw;
        }

        const ids = [];
        const collect = (value) => {
            if (value === null || value === undefined || value === '') return;

            if (Array.isArray(value)) {
                value.forEach(collect);
                return;
            }

            if (typeof value === 'object') {
                const directId = value.id || value.key || value.slug;
                if (directId !== undefined && directId !== null && directId !== '') {
                    collect(directId);
                }

                if (value.value !== undefined) collect(value.value);
                if (value.selected !== undefined) collect(value.selected);
                if (value.items !== undefined) collect(value.items);
                if (value.data !== undefined) collect(value.data);
                return;
            }

            const normalized = String(value).trim();
            if (!normalized || normalized === '[object Object]') return;

            if (normalized.includes(',')) {
                normalized
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .forEach((item) => ids.push(item));
                return;
            }

            ids.push(normalized);
        };

        collect(parsed);
        return [...new Set(ids)];
    }

    async requestBlogCandidates(endpoints) {
        for (const endpoint of endpoints) {
            try {
                const response = await salla.api.request(endpoint);
                const extracted = this.extractBlogsFromResponse(response);
                if (extracted.length) return extracted;
            } catch {
                // try next endpoint shape
            }
        }

        return [];
    }

    async fetchBlogsByIds(ids, limit) {
        const targetIds = ids.slice(0, limit);
        const responses = await Promise.all(targetIds.map((id) =>
            this.requestBlogCandidates([
                `blogs/${encodeURIComponent(id)}`,
                `blog/${encodeURIComponent(id)}`,
                `posts/${encodeURIComponent(id)}`,
            ])
        ));

        return responses.flat().filter(Boolean);
    }

    async fetchLatestBlogs(limit) {
        const apiResults = await this.requestBlogCandidates([
            `blogs?per_page=${limit}&page=1`,
            `blogs?limit=${limit}`,
            `blog/articles?per_page=${limit}&page=1`,
            `blog?per_page=${limit}&page=1`,
            `posts?per_page=${limit}&page=1`,
        ]);

        if (apiResults.length) {
            return apiResults;
        }

        return this.fetchLatestBlogsFromPage(limit);
    }

    async fetchLatestBlogsFromPage(limit) {
        if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return [];

        const paths = ['/blog', '/blogs'];
        for (const path of paths) {
            try {
                const response = await fetch(path, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });

                if (!response.ok) continue;
                const html = await response.text();
                if (!html) continue;

                const doc = new DOMParser().parseFromString(html, 'text/html');
                const cards = [...doc.querySelectorAll('.post-entry')].slice(0, limit);
                if (!cards.length) continue;

                const parsed = cards.map((card) => {
                    const link = card.querySelector('a[href]');
                    const titleLink = card.querySelector('.post-entry__title a') || link;
                    const image = card.querySelector('img');
                    const summary = card.querySelector('p');
                    const author = card.querySelector('a .sicon-user')?.closest('a');
                    const dateText = card.querySelector('.sicon-calendar-date')?.parentElement?.textContent?.trim() || '';

                    return {
                        title: titleLink?.textContent?.trim() || '',
                        url: titleLink?.getAttribute('href') || link?.getAttribute('href') || '#',
                        image: image?.getAttribute('src') || '',
                        summary: summary?.textContent?.trim() || '',
                        author_name: author?.textContent?.trim() || '',
                        created_at: dateText,
                    };
                }).filter((item) => item.title);

                if (parsed.length) {
                    return parsed;
                }
            } catch {
                // continue to next path
            }
        }

        return [];
    }

    extractBlogsFromResponse(response) {
        const candidates = [
            response?.data?.data,
            response?.data?.blogs,
            response?.data?.items,
            response?.data,
            response?.blogs,
            response?.items,
            response,
        ];

        for (const candidate of candidates) {
            if (Array.isArray(candidate)) {
                return candidate;
            }

            if (candidate && typeof candidate === 'object' && (candidate.id || candidate.key || candidate.title || candidate.name)) {
                return [candidate];
            }
        }

        return [];
    }

    normalizeBlogArticle(article) {
        if (!article || typeof article !== 'object') return null;

        const title = article.title || article.name || '';
        if (!title) return null;

        const rawUrl = article.url || article.link || article.href || (article.slug ? `/blog/${article.slug}` : '#');
        const url = this.sanitizeUrl(typeof rawUrl === 'object' ? (rawUrl.url || rawUrl.value || '#') : rawUrl);

        const imageObj = article.image || {};
        const thumbnailValue = typeof article.thumbnail === 'object'
            ? (article.thumbnail.url || article.thumbnail.original || article.thumbnail.path || '')
            : article.thumbnail;

        const placeholder = (typeof salla !== 'undefined'
            && salla.config
            && typeof salla.config.get === 'function')
            ? (salla.config.get('theme.settings.placeholder') || '')
            : '';

        const image = thumbnailValue
            || imageObj.url
            || imageObj.original
            || article.featured_image
            || article.cover
            || (typeof article.image === 'string' ? article.image : '')
            || placeholder
            || 'images/placeholder.png';

        const authorName = article.author?.name
            || (typeof article.author === 'string' ? article.author : '')
            || article.author_name
            || '';

        const authorUrl = this.sanitizeUrl(article.author?.url || article.author_url || '#');
        const categoryName = article.category?.name
            || (typeof article.category === 'string' ? article.category : '')
            || article.tags?.[0]?.name
            || '';

        const rawSummary = article.summary
            || article.excerpt
            || article.description
            || article.content
            || '';

        return {
            title,
            url,
            image,
            imageAlt: imageObj.alt || title,
            summary: String(rawSummary).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            createdAt: article.created_at || article.published_at || '',
            commentsCount: Number(article.comments_count || 0),
            likesCount: Number(article.likes_count || 0),
            authorName,
            authorUrl,
            categoryName,
        };
    }

    formatBlogDate(dateValue) {
        if (!dateValue) return null;

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return null;

        const locale = document.documentElement.lang || 'ar';
        return {
            iso: date.toISOString(),
            day: new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date),
            month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
        };
    }

    renderBlogFallbackCard(article, index) {
        const dateInfo = this.formatBlogDate(article.createdAt);
        const badgeClass = (index % 4) + 1;
        const safeTitle = this.escapeHtml(article.title);
        const safeUrl = this.escapeAttr(article.url);
        const safeImage = this.escapeAttr(article.image);
        const safeImageAlt = this.escapeHtml(article.imageAlt || article.title);
        const safeBadge = this.escapeHtml(article.categoryName || '');
        const safeAuthorName = this.escapeHtml(article.authorName || '');
        const safeAuthorUrl = this.escapeAttr(article.authorUrl || '#');
        const safeSummary = this.escapeHtml((article.summary || '').trim());
        const summaryText = safeSummary.length > 140 ? `${safeSummary.slice(0, 140)}...` : safeSummary;

        return `
            <article class="th-home-blog-card">
                <a href="${safeUrl}" class="th-home-blog-card__media-link" aria-label="${safeTitle}">
                    <div class="th-home-blog-card__media">
                        <img src="${safeImage}" alt="${safeImageAlt}" class="th-home-blog-card__image" loading="lazy">
                    </div>
                    ${dateInfo ? `
                        <time class="th-home-blog-card__date" datetime="${this.escapeAttr(dateInfo.iso)}">
                            <span>${this.escapeHtml(dateInfo.day)}</span>
                            <small>${this.escapeHtml(dateInfo.month)}</small>
                        </time>
                    ` : ''}
                    ${safeBadge ? `
                        <span class="th-home-blog-card__badge th-home-blog-card__badge--${badgeClass}">
                            ${safeBadge}
                        </span>
                    ` : ''}
                </a>
                <div class="th-home-blog-card__body">
                    <h3 class="th-home-blog-card__title">
                        <a href="${safeUrl}">${safeTitle}</a>
                    </h3>
                    ${summaryText ? `<p class="th-home-blog-card__summary">${summaryText}</p>` : ''}
                    <footer class="th-home-blog-card__meta">
                        <div class="th-home-blog-card__stats">
                            <span class="th-home-blog-card__stat">
                                <i class="sicon-chat"></i>
                                ${article.commentsCount ? `<span>${this.escapeHtml(String(article.commentsCount))}</span>` : ''}
                            </span>
                            <span class="th-home-blog-card__stat">
                                <i class="sicon-thumbs-up"></i>
                                ${article.likesCount ? `<span>${this.escapeHtml(String(article.likesCount))}</span>` : ''}
                            </span>
                        </div>
                        ${safeAuthorName ? `
                            <div class="th-home-blog-card__author">
                                <span class="th-home-blog-card__author-dot" aria-hidden="true"></span>
                                ${article.authorUrl && article.authorUrl !== '#'
                                    ? `<a href="${safeAuthorUrl}">${safeAuthorName}</a>`
                                    : `<span>${safeAuthorName}</span>`
                                }
                            </div>
                        ` : ''}
                    </footer>
                </div>
            </article>
        `;
    }

    sanitizeUrl(value) {
        const url = String(value || '').trim();
        if (!url) return '#';
        if (/^javascript:/i.test(url)) return '#';
        return url;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    escapeAttr(value) {
        return this.escapeHtml(value);
    }

    initBeforeAfterHero() {
        document.querySelectorAll('.js-before-after-hero').forEach(compare => {
            if (compare.dataset.beforeAfterInitialized === 'true') return;
            compare.dataset.beforeAfterInitialized = 'true';

            const handle = compare.querySelector('.th-before-after-hero__handle');
            if (!handle) return;

            const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
            const toPercent = clientX => {
                const rect = compare.getBoundingClientRect();
                if (!rect.width) return 50;
                return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
            };

            let rafId = 0;
            let nextPercent = 50;
            const queuePosition = value => {
                nextPercent = clamp(Number(value), 0, 100);
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    const percentText = `${nextPercent}%`;
                    compare.style.setProperty('--th-before-after-pos', percentText);
                    handle.setAttribute('aria-valuenow', String(Math.round(nextPercent)));
                    rafId = 0;
                });
            };

            const initialPosition = parseFloat(compare.dataset.initialPosition || '50');
            const startPosition = Number.isFinite(initialPosition) ? initialPosition : 50;
            compare.style.setProperty('--th-before-after-pos', `${clamp(startPosition, 0, 100)}%`);
            handle.setAttribute('aria-valuenow', String(Math.round(clamp(startPosition, 0, 100))));

            let isDragging = false;
            let activePointerId = null;
            let prevTouchAction = '';
            const startDragging = event => {
                if (event.button !== undefined && event.button !== 0) return;
                isDragging = true;
                activePointerId = event.pointerId;
                prevTouchAction = compare.style.touchAction;
                compare.style.touchAction = 'none';
                compare.classList.add('is-dragging');
                compare.setPointerCapture?.(event.pointerId);
                queuePosition(toPercent(event.clientX));
                event.preventDefault();
            };

            const stopDragging = pointerId => {
                if (!isDragging) return;
                if (pointerId !== null && activePointerId !== null && pointerId !== activePointerId) return;
                isDragging = false;
                activePointerId = null;
                compare.style.touchAction = prevTouchAction;
                compare.classList.remove('is-dragging');
            };

            compare.addEventListener('pointerdown', startDragging);

            compare.addEventListener('pointermove', event => {
                if (!isDragging || event.pointerId !== activePointerId) return;
                queuePosition(toPercent(event.clientX));
                event.preventDefault();
            });

            compare.addEventListener('pointerup', event => stopDragging(event.pointerId));
            compare.addEventListener('pointercancel', event => stopDragging(event.pointerId));
            compare.addEventListener('lostpointercapture', () => stopDragging(null));

            handle.addEventListener('keydown', event => {
                const current = Number(handle.getAttribute('aria-valuenow') || 50);
                let next = current;

                if (event.key === 'ArrowLeft') next = current - 5;
                else if (event.key === 'ArrowRight') next = current + 5;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = 100;
                else return;

                event.preventDefault();
                queuePosition(next);
            });
        });
    }
}

Home.initiateWhenReady(['index']);
