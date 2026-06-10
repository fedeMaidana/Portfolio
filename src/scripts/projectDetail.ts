function clearContainerAnimation() {
    const container = document.querySelector('.project-container') as HTMLElement | null;
    if (!container) return;

    container.addEventListener(
        'animationend',
        () => {
            container.style.animation = 'none';
            container.style.opacity = '1';
        },
        { once: true }
    );
}

clearContainerAnimation();
document.addEventListener('astro:page-load', clearContainerAnimation);
