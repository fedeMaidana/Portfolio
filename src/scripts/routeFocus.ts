function focusMain(): void {
    const main = document.getElementById('main-content');
    main?.focus({ preventScroll: true });
}

document.addEventListener('astro:after-swap', focusMain);
