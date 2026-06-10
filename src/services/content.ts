import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export async function getSortedProjects(): Promise<Project[]> {
    const projects = await getCollection('projects');
    return projects.sort((a, b) => b.data.number.localeCompare(a.data.number));
}

/**
 * Devuelve la lista de intereses. Si la entrada no existe, devuelve un arreglo
 * vacío en lugar de romper el render (la Content Layer API puede devolver
 * `undefined`).
 */
export async function getInterests(): Promise<string[]> {
    const entry = await getEntry('interests', 'list');
    return entry?.data.items ?? [];
}
