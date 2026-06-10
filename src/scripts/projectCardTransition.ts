let isTransitioning = false;
let needsCoverOnLoad = false;

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleCardClick(e: Event) {
    e.preventDefault();
    if (isTransitioning) return;

    const link = e.currentTarget as HTMLAnchorElement;
    const card = link.closest('.work-card') as HTMLElement | null;
    if (!card) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.location.href = href;
        return;
    }

    isTransitioning = true;

    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = href;
    document.head.appendChild(prefetchLink);

    card.classList.add('is-exiting');
    card.style.viewTransitionName = 'none';
    await wait(350);

    const rect = card.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.id = 'card-expand-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: 'var(--radius-lg)',
        zIndex: '99999',
        pointerEvents: 'none',
        opacity: '0',
    });
    document.body.appendChild(overlay);

    card.classList.add('is-morphing');

    await wait(200);

    overlay.style.transition = 'opacity 0.35s ease';
    overlay.style.opacity = '1';
    await wait(350);

    await wait(150);

    const dur = '0.65s';
    const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    overlay.style.transition = [
        `top ${dur} ${ease}`,
        `left ${dur} ${ease}`,
        `width ${dur} ${ease}`,
        `height ${dur} ${ease}`,
        `border-radius ${dur} ${ease}`,
        `background-color ${dur} ${ease}`,
        `backdrop-filter ${dur} ${ease}`,
        `border-color ${dur} ${ease}`,
        `box-shadow ${dur} ${ease}`,
    ].join(', ');

    overlay.classList.add('is-expanding');
    Object.assign(overlay.style, {
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        borderRadius: '0px',
    });

    await wait(600);

    overlay.style.transition = 'none';
    overlay.style.backgroundColor = 'var(--bg)';
    overlay.style.backdropFilter = 'none';
    card.style.visibility = 'hidden';
    void overlay.offsetHeight;

    try {
        needsCoverOnLoad = true;
        const { navigate } = await import('astro:transitions/client');
        navigate(href, { info: { skipVT: true } });
    } catch {
        needsCoverOnLoad = false;
        window.location.href = href;
    }
}

function cleanup() {
    isTransitioning = false;

    const overlay = document.getElementById('card-expand-overlay');

    if (overlay && needsCoverOnLoad) {
        needsCoverOnLoad = false;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        overlay.style.transition = 'opacity 0.4s ease';
                        overlay.style.opacity = '0';
                        overlay.addEventListener('transitionend', () => overlay.remove(), {
                            once: true,
                        });
                    }, 30);
                });
            });
        });
    } else if (overlay) {
        overlay.remove();
    }

    needsCoverOnLoad = false;

    document.querySelectorAll('.work-card').forEach((card) => {
        card.classList.remove('is-exiting', 'is-morphing');
        (card as HTMLElement).style.viewTransitionName = '';
    });
}

function initProjectTransitions() {
    cleanup();
    document.querySelectorAll<HTMLAnchorElement>('.work-card .main-link').forEach((link) => {
        link.removeEventListener('click', handleCardClick);
        link.addEventListener('click', handleCardClick);
    });
}

document.addEventListener('astro:before-swap', (e) => {
    if (!needsCoverOnLoad) return;

    const overlay = e.newDocument.createElement('div');
    overlay.id = 'card-expand-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '99999',
        pointerEvents: 'none',
        backgroundColor: 'var(--bg)',
        opacity: '1',
    });
    e.newDocument.body.appendChild(overlay);
});

initProjectTransitions();
document.addEventListener('astro:page-load', initProjectTransitions);

document.addEventListener('astro:before-swap', (e) => {
    if (e.info?.skipVT) {
        e.viewTransition.skipTransition();
    }
});
