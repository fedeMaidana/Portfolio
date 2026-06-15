const SCROLL_THRESHOLD = 400;

let button: HTMLButtonElement | null = null;
let scrollHandler: (() => void) | null = null;
let clickHandler: (() => void) | null = null;
let ticking = false;

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updateVisibility(): void {
    if (!button) return;
    button.classList.toggle('is-visible', window.scrollY > SCROLL_THRESHOLD);
}

function onScroll(): void {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        updateVisibility();
        ticking = false;
    });
}

function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function cleanup(): void {
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
    }
    if (button && clickHandler) {
        button.removeEventListener('click', clickHandler);
    }
    clickHandler = null;
    button = null;
    ticking = false;
}

function initBackToTop(): void {
    cleanup();

    button = document.querySelector<HTMLButtonElement>('.back-to-top');
    if (!button) return;

    clickHandler = scrollToTop;
    button.addEventListener('click', clickHandler);

    scrollHandler = onScroll;
    window.addEventListener('scroll', scrollHandler, { passive: true });

    updateVisibility();
}

initBackToTop();
document.addEventListener('astro:page-load', initBackToTop);
document.addEventListener('astro:before-swap', cleanup);
