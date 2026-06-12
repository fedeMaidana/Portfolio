export function getPersonSchema(siteUrl: URL | string | undefined, description: string) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Federico Maidana',
        url: siteUrl,
        image: siteUrl ? new URL('/pictures/seo-1.jpeg', siteUrl).href : undefined,
        jobTitle: 'Backend Developer',
        description,
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
