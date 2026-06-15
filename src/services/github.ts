import { GITHUB_API_BASE } from '@/config';
import { withFallback } from '@/utils/logger';
import { GITHUB_TOKEN } from 'astro:env/server';

interface GitHubRepo {
    stargazers_count: number;
}

const starsCache = new Map<string, Promise<number>>();

function isGitHubUrl(url: string): boolean {
    return url.startsWith('https://github.com/');
}

function fetchRepoStars(repoPath: string): Promise<number> {
    return withFallback(
        `getRepoStars:${repoPath}`,
        async () => {
            const res = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}`, {
                headers: GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {},
            });
            if (!res.ok) return 0;

            const data = (await res.json()) as Partial<GitHubRepo>;
            return data.stargazers_count ?? 0;
        },
        0
    );
}

export async function getRepoStars(repoUrl: string): Promise<number> {
    if (!isGitHubUrl(repoUrl)) return 0;

    const repoPath = new URL(repoUrl).pathname.slice(1);

    const cached = starsCache.get(repoPath);
    if (cached) return cached;

    const pending = fetchRepoStars(repoPath);
    starsCache.set(repoPath, pending);
    return pending;
}
