function initSkipLink(): void {
    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-to-content');
    const mainContent = document.querySelector<HTMLElement>('#main-content');
    if (!skipLink || !mainContent) return;
    if (skipLink.dataset.bound === 'true') return;

    skipLink.dataset.bound = 'true';
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus();
    });
}

initSkipLink();
document.addEventListener('astro:page-load', initSkipLink);
