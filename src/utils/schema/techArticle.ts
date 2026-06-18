import { personId, websiteId } from './ids';

interface TechArticleParams {
    site: URL | string | undefined;
    url: string;
    headline: string;
    description: string;
    inLanguage: string;
    applicationCategory: string;
    operatingSystem: string;
    keywords?: string[] | undefined;
    repoUrl?: string | undefined;
    datePublished?: string | undefined;
    dateModified?: string | undefined;
}

export function getTechArticleSchema(params: TechArticleParams) {
    const author = personId(params.site);
    const authorRef = author ? { '@id': author } : undefined;
    const website = websiteId(params.site);

    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: params.headline,
        description: params.description,
        url: params.url,
        mainEntityOfPage: params.url,
        inLanguage: params.inLanguage,
        keywords: params.keywords,
        datePublished: params.datePublished,
        dateModified: params.dateModified ?? params.datePublished,
        author: authorRef,
        publisher: authorRef,
        isPartOf: website ? { '@id': website } : undefined,
        about: {
            '@type': 'SoftwareApplication',
            name: params.headline,
            applicationCategory: params.applicationCategory,
            operatingSystem: params.operatingSystem,
            url: params.url,
            codeRepository: params.repoUrl,
            author: authorRef,
        },
    });
}
