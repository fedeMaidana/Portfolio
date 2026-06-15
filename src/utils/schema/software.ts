export function getSoftwareSchema(params: {
    title: string;
    description: string;
    category: string;
    url: string | URL;
    repoUrl: string | undefined;
}) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: params.title,
        description: params.description,
        applicationCategory: params.category,
        operatingSystem: 'Web, Windows, Linux, macOS',
        url: params.url,
        codeRepository: params.repoUrl,
        author: {
            '@type': 'Person',
            name: 'Federico Maidana',
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    });
}
