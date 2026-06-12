function initThemeToggle(): void {
    const button = document.querySelector<HTMLButtonElement>('.theme-toggle');
    if (!button || button.dataset.bound === 'true') return;

    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('theme-toggle'));
    });
}

initThemeToggle();
document.addEventListener('astro:page-load', initThemeToggle);
