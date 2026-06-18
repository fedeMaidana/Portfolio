import { personId, siteOrigin, websiteId } from './ids';

export function getWebSiteSchema(
    siteUrl: URL | string | undefined,
    name: string,
    description: string,
    inLanguage: string
) {
    const base = siteOrigin(siteUrl);
    const author = personId(siteUrl);
    const authorRef = author ? { '@id': author } : undefined;

    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteId(siteUrl),
        url: base ? `${base}/` : undefined,
        name,
        description,
        inLanguage,
        author: authorRef,
        publisher: authorRef,
    });
}

export function getProfilePageSchema(
    siteUrl: URL | string | undefined,
    pageUrl: URL | string,
    inLanguage: string
) {
    const website = websiteId(siteUrl);
    const person = personId(siteUrl);

    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: typeof pageUrl === 'string' ? pageUrl : pageUrl.href,
        inLanguage,
        isPartOf: website ? { '@id': website } : undefined,
        mainEntity: person ? { '@id': person } : undefined,
    });
}
