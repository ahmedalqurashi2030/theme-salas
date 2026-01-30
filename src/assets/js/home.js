import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initProductCategories();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    /**
     * Product Categories Component
     * Handles filtering and scroll progress for product_categories component
     */
    initProductCategories() {
        const section = document.querySelector('.lifestyle-section');
        if (!section) return;

        // Scroll Progress Logic
        const wrapper = section.querySelector('.cards-strip-wrapper');
        const prog = section.querySelector('.scroll-prog');

        if (wrapper && prog) {
            wrapper.addEventListener('scroll', () => {
                const max = wrapper.scrollWidth - wrapper.clientWidth;
                prog.style.width = max > 0 ? `${(Math.abs(wrapper.scrollLeft) / max) * 100}%` : '0%';
            });

            // Drag Functionality
            let isDown = false;
            let startX;
            let scrollLeft;

            wrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - wrapper.offsetLeft;
                scrollLeft = wrapper.scrollLeft;
                wrapper.style.cursor = 'grabbing';
            });

            wrapper.addEventListener('mouseleave', () => {
                isDown = false;
                wrapper.style.cursor = 'grab';
            });

            wrapper.addEventListener('mouseup', () => {
                isDown = false;
                wrapper.style.cursor = 'grab';
            });

            wrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - wrapper.offsetLeft;
                wrapper.scrollLeft = scrollLeft - (x - startX) * 2;
            });
        }

        // Filter Tabs Logic
        const filters = section.querySelectorAll('.filter-btn');
        const cards = section.querySelectorAll('.s-products-slider-card');

        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.target;
                
                cards.forEach(card => {
                    if (target === 'all' || card.dataset.category === target) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                if (wrapper) {
                    wrapper.scrollLeft = 0;
                }
            });
        });
    }
}

Home.initiateWhenReady(['index']);