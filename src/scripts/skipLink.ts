function initSkipLink() {
    const skipLink = document.querySelector('.skip-to-content');
    const mainContent = document.querySelector('#main-content') as HTMLElement | null;

    if (skipLink && mainContent) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.focus();
        });
    }
}

initSkipLink();
document.addEventListener('astro:page-load', initSkipLink);
