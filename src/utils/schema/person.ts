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
