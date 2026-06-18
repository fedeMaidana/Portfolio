import { personId, siteOrigin } from './ids';

export function getPersonSchema(siteUrl: URL | string | undefined, description: string) {
    const base = siteOrigin(siteUrl);

    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': personId(siteUrl),
        name: 'Federico Maidana',
        url: base,
        image: base ? new URL('/pictures/seo-1.jpeg', base).href : undefined,
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
            'Systems Programming',
            'Backend Development',
            'Frontend Development',
            'Software Architecture',
            'Wayland',
            'Hyprland',
            'GPU Rendering',
            'Command-Line Interface Design',
        ],
        sameAs: ['https://github.com/fedeMaidana', 'https://www.linkedin.com/in/fede-maidana'],
        knowsLanguage: [
            { '@type': 'Language', name: 'Spanish' },
            { '@type': 'Language', name: 'English' },
            { '@type': 'Language', name: 'French' },
        ],
    });
}
