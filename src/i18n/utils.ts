import { DEFAULT_LOCALE, LOCALES, ui, type Locale, type UIKey } from './ui';

const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export function getLangFromUrl(url: URL): Locale {
    const [, first] = url.pathname.split('/');
    if (first && (LOCALES as readonly string[]).includes(first)) return first as Locale;
    return DEFAULT_LOCALE;
}

export function useTranslations(lang: Locale) {
    return function t(key: UIKey): string {
        return ui[lang][key];
    };
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function stripLocale(pathname: string): string {
    for (const locale of PREFIXED_LOCALES) {
        if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
            return pathname.slice(locale.length + 1) || '/';
        }
    }
    return pathname;
}

export function pathForLocale(pathname: string, locale: Locale): string {
    const base = stripLocale(pathname);
    if (locale === DEFAULT_LOCALE) return base;
    return `/${locale}${base === '/' ? '' : base}`;
}
