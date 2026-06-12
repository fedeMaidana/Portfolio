function openMenu(): HTMLDetailsElement | null {
    return document.querySelector<HTMLDetailsElement>('.lang-menu[open]');
}

document.addEventListener('click', (e: MouseEvent) => {
    const menu = openMenu();
    if (menu && e.target instanceof Node && !menu.contains(e.target)) {
        menu.open = false;
    }
});

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    const menu = openMenu();
    if (menu) menu.open = false;
});
