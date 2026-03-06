export function getPersonSchema(siteUrl: URL | string | undefined) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Federico Maidana',
        url: siteUrl,
        image: siteUrl ? `${siteUrl}og-image.png` : undefined,
        jobTitle: 'Backend Developer',
        description: 'Backend Developer enfocado en rendimiento y código seguro.',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Mar del Plata',
            addressRegion: 'Buenos Aires',
            addressCountry: 'AR',
        },
        knowsAbout: [
            'Rust (Programming Language)',
            'Iced (Rust library)',
            'Backend Development',
            'Frontend Development',
            'Software Architecture',
        ],
        sameAs: ['https://www.github.com/fedeMaidana', 'https://www.linkedin.com/in/fede-maidana'],
        knowsLanguage: [
            { '@type': 'Language', name: 'Spanish' },
            { '@type': 'Language', name: 'English' },
        ],
    });
}

export function getSoftwareSchema(params: {
    title: string;
    description: string;
    category: string;
    url: string | URL;
    repoUrl?: string;
}) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: params.title,
        description: params.description,
        applicationCategory: params.category,
        operatingSystem: 'Web, Windows, Linux, macOS',
        url: params.url,
        codeRepository: params.repoUrl !== '#' ? params.repoUrl : undefined,
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
