interface Crumb {
    name: string;
    url: string;
}

export function getBreadcrumbSchema(items: Crumb[]) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    });
}
