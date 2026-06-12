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

export async function getProjectsForLocale(locale: Locale): Promise<Project[]> {
    const all = await getCollection('projects');
    const base = all.filter((project: Project) => idLocale(project.id) === DEFAULT_LOCALE);

    return base
        .map(
            (project: Project) =>
                all.find(
                    (candidate: Project) =>
                        idLocale(candidate.id) === locale &&
                        projectSlug(candidate) === projectSlug(project)
                ) ?? project
        )
        .sort((a: Project, b: Project) => b.data.number.localeCompare(a.data.number));
}

export async function getInterests(locale: Locale): Promise<string[]> {
    const entry = (await getEntry('interests', locale)) ?? (await getEntry('interests', 'es'));
    return entry?.data.items ?? [];
}
