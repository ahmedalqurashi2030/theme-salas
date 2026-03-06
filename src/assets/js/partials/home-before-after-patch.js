(function () {
    const SELECTOR = '.js-before-after-hero';
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const getImageMetrics = (image) => {
        if (!image || !image.naturalWidth || !image.naturalHeight) return null;

        return {
            width: image.naturalWidth,
            height: image.naturalHeight,
            ratio: image.naturalWidth / image.naturalHeight,
        };
    };

    const syncSliderValueText = (handle) => {
        if (!handle) return;
        const currentValue = Number(handle.getAttribute('aria-valuenow') || 50);
        const safeValue = Math.round(clamp(currentValue, 0, 100));
        handle.setAttribute('aria-valuetext', `${safeValue}%`);
    };

    const syncCompareMetrics = (compare) => {
        const beforeImage = compare.querySelector('[data-before-after-image="before"]');
        const afterImage = compare.querySelector('[data-before-after-image="after"]');
        const beforeMetrics = getImageMetrics(beforeImage);
        const afterMetrics = getImageMetrics(afterImage);
        const referenceMetrics = beforeMetrics || afterMetrics;
        if (!referenceMetrics) return;

        const safeWidths = [beforeMetrics ? beforeMetrics.width : null, afterMetrics ? afterMetrics.width : null].filter(Boolean);
        const maxSafeWidth = safeWidths.length ? Math.min.apply(Math, safeWidths) : referenceMetrics.width;
        const hasRatioMismatch = beforeMetrics && afterMetrics && Math.abs(beforeMetrics.ratio - afterMetrics.ratio) > 0.02;

        compare.style.setProperty('--th-before-after-ratio', `${referenceMetrics.width} / ${referenceMetrics.height}`);
        compare.style.setProperty('--th-before-after-max-width', `${maxSafeWidth}px`);
        compare.classList.toggle('has-ratio-mismatch', Boolean(hasRatioMismatch));
        compare.classList.add('is-ready');
    };

    const initCompare = (compare) => {
        if (!compare || compare.dataset.beforeAfterPatchInitialized === 'true') return;
        compare.dataset.beforeAfterPatchInitialized = 'true';

        const handle = compare.querySelector('.th-before-after-hero__handle');
        const images = compare.querySelectorAll('[data-before-after-image]');
        if (!handle || !images.length) return;

        const syncCurrentCompare = () => syncCompareMetrics(compare);
        images.forEach((image) => {
            if (image.complete && image.naturalWidth) {
                syncCurrentCompare();
            }
            image.addEventListener('load', syncCurrentCompare, { passive: true });
            image.addEventListener('error', syncCurrentCompare, { passive: true });
        });

        syncCurrentCompare();
        syncSliderValueText(handle);

        const valueObserver = new MutationObserver(() => syncSliderValueText(handle));
        valueObserver.observe(handle, {
            attributes: true,
            attributeFilter: ['aria-valuenow'],
        });
    };

    const initAll = (root) => {
        const scope = root && (root instanceof Element || root instanceof Document) ? root : document;
        scope.querySelectorAll(SELECTOR).forEach(initCompare);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initAll(document), { once: true });
    } else {
        initAll(document);
    }

    document.addEventListener('theme::ready', () => initAll(document));
    document.addEventListener('salla::section::load', (event) => initAll(event.target || document));
})();