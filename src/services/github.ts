import { GITHUB_API_BASE } from '@/config';
import { withFallback } from '@/utils/logger';

interface GitHubRepo {
    stargazers_count: number;
}

function isGitHubUrl(url: string): boolean {
    return url.startsWith('https://github.com/');
}

export async function getRepoStars(repoUrl: string): Promise<number> {
    if (!isGitHubUrl(repoUrl)) return 0;

    const repoPath = new URL(repoUrl).pathname.slice(1);

    return withFallback(
        `getRepoStars:${repoPath}`,
        async () => {
            const res = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}`);
            if (!res.ok) return 0;

            const data = (await res.json()) as Partial<GitHubRepo>;
            return data.stargazers_count ?? 0;
        },
        0
    );
}
