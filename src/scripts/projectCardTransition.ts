import { navigate, type TransitionBeforeSwapEvent } from 'astro:transitions/client';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

let isTransitioning = false;
let pendingCover: 'detail' | 'index' | null = null;
let returnSlug: string | null = null;

// ── Helpers ────────────────────────────────────────────────

const prefersReducedMotion = (): boolean =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const nextFrames = (): Promise<void> =>
    new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Convierte el rect de la card en un clip-path inset con esquinas redondeadas. */
function rectToInset(rect: DOMRect, radius = 16): string {
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, window.innerWidth - rect.right);
    const bottom = Math.max(0, window.innerHeight - rect.bottom);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

function createOverlay(doc: Document = document): HTMLDivElement {
    const overlay = doc.createElement('div');
    overlay.id = 'card-expand-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '99999',
        pointerEvents: 'none',
    });
    return overlay;
}

// ── Ida: card → detalle ────────────────────────────────────

async function handleCardClick(e: Event): Promise<void> {
    const link = e.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href');
    if (!href) return;

    // Con reduced motion dejamos que el router navegue normalmente.
    if (prefersReducedMotion()) return;

    e.preventDefault();
    if (isTransitioning) return;

    const card = link.closest<HTMLElement>('.work-card');
    if (!card) {
        window.location.href = href;
        return;
    }

    isTransitioning = true;

    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = href;
    document.head.appendChild(prefetch);

    const rect = card.getBoundingClientRect();
    card.classList.add('is-exiting');

    // Panel de vidrio fullscreen, recortado al tamaño de la card.
    const overlay = createOverlay();
    overlay.style.clipPath = rectToInset(rect);
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);

    // 1. El panel aparece sobre la card mientras su contenido se disuelve.
    await overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: 'ease-out',
        fill: 'forwards',
    }).finished;

    // 2. El panel se expande hasta cubrir la pantalla.
    overlay.classList.add('is-expanding');
    await overlay.animate([{ clipPath: rectToInset(rect) }, { clipPath: 'inset(0px round 0px)' }], {
        duration: 600,
        easing: EASE,
        fill: 'forwards',
    }).finished;

    overlay.style.backgroundColor = 'var(--bg)';
    overlay.style.backdropFilter = 'none';

    // 3. Navegamos con la pantalla ya cubierta.
    pendingCover = 'detail';
    navigate(href, { info: { skipVT: true } });
}

// ── Swap: inyectar el cover en el documento entrante ───────

document.addEventListener('astro:before-swap', (event) => {
    const e = event as TransitionBeforeSwapEvent;
    const info = e.info as { skipVT?: boolean } | undefined;

    if (info?.skipVT) e.viewTransition.skipTransition();

    // Ida: el detalle llega cubierto para que no haya flash.
    if (pendingCover === 'detail') {
        const cover = createOverlay(e.newDocument);
        cover.style.backgroundColor = 'var(--bg)';
        e.newDocument.body.appendChild(cover);
        return;
    }

    // Vuelta: detalle → index.
    const fromPath = e.from.pathname;
    const toPath = e.to.pathname;

    if (fromPath.startsWith('/projects/') && toPath === '/' && !prefersReducedMotion()) {
        returnSlug = fromPath.split('/').filter(Boolean).pop() ?? null;
        pendingCover = 'index';

        const cover = createOverlay(e.newDocument);
        cover.style.backgroundColor = 'var(--bg)';
        e.newDocument.body.appendChild(cover);
    }
});

// ── Llegada: revelar la página nueva ───────────────────────

async function revealDetail(overlay: HTMLElement): Promise<void> {
    await nextFrames();
    await overlay
        .animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 400,
            easing: 'ease',
            fill: 'forwards',
        })
        .finished.catch(() => {});
    overlay.remove();
}

async function revealIndex(overlay: HTMLElement): Promise<void> {
    const slug = returnSlug;
    returnSlug = null;

    // Dejamos terminar el fade de la VT por defecto antes de contraer.
    await wait(180);
    await nextFrames();

    const card = slug
        ? document.querySelector<HTMLElement>(
              `.work-card:has(.main-link[href="/projects/${slug}"])`
          )
        : null;

    const rect = card?.getBoundingClientRect();
    const isVisible = rect !== undefined && rect.top < window.innerHeight - 40 && rect.bottom > 40;

    if (card && rect && isVisible) {
        card.classList.add('is-exiting');

        await overlay
            .animate(
                [
                    { clipPath: 'inset(0px round 0px)', opacity: 1 },
                    { clipPath: rectToInset(rect), opacity: 1, offset: 0.78 },
                    { clipPath: rectToInset(rect), opacity: 0 },
                ],
                { duration: 700, easing: EASE, fill: 'forwards' }
            )
            .finished.catch(() => {});

        card.classList.remove('is-exiting');
    } else {
        await overlay
            .animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 400,
                easing: 'ease',
                fill: 'forwards',
            })
            .finished.catch(() => {});
    }

    overlay.remove();
}

// ── Bind + ciclo de vida ───────────────────────────────────

function bindCards(): void {
    document.querySelectorAll<HTMLAnchorElement>('.work-card .main-link').forEach((link) => {
        link.removeEventListener('click', handleCardClick);
        link.addEventListener('click', handleCardClick);
    });
}

async function onPageLoad(): Promise<void> {
    isTransitioning = false;
    bindCards();

    const overlay = document.getElementById('card-expand-overlay');
    if (!overlay) {
        pendingCover = null;
        return;
    }

    const mode = pendingCover;
    pendingCover = null;

    if (mode === 'detail') await revealDetail(overlay);
    else if (mode === 'index') await revealIndex(overlay);
    else overlay.remove();
}

bindCards();
document.addEventListener('astro:page-load', () => void onPageLoad());
