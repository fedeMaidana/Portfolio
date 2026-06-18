import { ui, type UIKey } from '@/i18n/ui';
import { getLangFromUrl, pathForLocale } from '@/i18n/utils';

function applyLocale(): void {
    const homeLink = document.querySelector<HTMLAnchorElement>('[data-home-link]');

    if (!homeLink) return;

    const locale = getLangFromUrl(new URL(window.location.href));
    const dict = ui[locale];

    document.documentElement.lang = locale;
    document.title = dict['notFound.title'];

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n as UIKey | undefined;
        if (key) el.textContent = dict[key];
    });

    homeLink.setAttribute('href', pathForLocale('/', locale));
}

applyLocale();
document.addEventListener('astro:page-load', applyLocale);
