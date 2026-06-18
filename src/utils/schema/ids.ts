type SiteUrl = URL | string | undefined;

export function siteOrigin(site: SiteUrl): string | undefined {
    if (!site) return undefined;
    return new URL(site).origin;
}

export function personId(site: SiteUrl): string | undefined {
    const base = siteOrigin(site);
    return base ? `${base}/#person` : undefined;
}

export function websiteId(site: SiteUrl): string | undefined {
    const base = siteOrigin(site);
    return base ? `${base}/#website` : undefined;
}
