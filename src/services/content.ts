import { DEFAULT_LOCALE, type Locale } from '@/i18n/ui';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

function idLocale(id: string): string {
    if (!id.includes('/')) return DEFAULT_LOCALE;
    return id.slice(0, id.indexOf('/'));
}

export function projectSlug(project: Project): string {
    return project.id.split('/').pop() ?? project.id;
}

function baseProjects(all: Project[]): Project[] {
    return all.filter((project: Project) => idLocale(project.id) === DEFAULT_LOCALE);
}

function findLocalized(all: Project[], base: Project, locale: Locale): Project {
    if (locale === DEFAULT_LOCALE) return base;
    return (
        all.find(
            (candidate: Project) =>
                idLocale(candidate.id) === locale && projectSlug(candidate) === projectSlug(base)
        ) ?? base
    );
}

export async function getProjectsForLocale(locale: Locale): Promise<Project[]> {
    const all = await getCollection('projects');

    return baseProjects(all)
        .map((project: Project) => findLocalized(all, project, locale))
        .sort((a: Project, b: Project) => b.data.number.localeCompare(a.data.number));
}

export async function getLocalizedProjectPaths(locale: Locale) {
    const all = await getCollection('projects');

    return baseProjects(all).map((project: Project) => ({
        params: { slug: projectSlug(project) },
        props: { project: findLocalized(all, project, locale) },
    }));
}

export async function getInterests(locale: Locale): Promise<string[]> {
    const entry = (await getEntry('interests', locale)) ?? (await getEntry('interests', 'es'));
    return entry?.data.items ?? [];
}
