import { getProjectsForLocale } from '@/services/content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
    const base = site ? new URL(site).origin : 'https://maidana.dev';
    const projects = await getProjectsForLocale('en');

    const projectLines = projects.map((project) => {
        const slug = project.id.split('/').pop() ?? project.id;
        return `- [${project.data.title}](${base}/en/projects/${slug}): ${project.data.description}`;
    });

    const body = `# Federico Maidana

> Backend developer focused on performance and safe code, based in Mar del Plata, Argentina. Works mainly in Rust on systems-level tools for the Wayland/Hyprland desktop, plus web with Astro and TypeScript.

## About

- Role: Backend Developer
- Core stack: Rust, TypeScript, Astro
- Domains: systems programming, GPU/software rendering, CLI design, Wayland/Hyprland tooling, web performance
- Languages: Spanish, English, French
- Location: Mar del Plata, Buenos Aires, Argentina

## Projects

${projectLines.join('\n')}

## Links

- Website: ${base}/en
- GitHub: https://github.com/fedeMaidana
- LinkedIn: https://www.linkedin.com/in/fede-maidana
`;

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
