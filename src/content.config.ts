import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const projectsCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        number: z.string(),
        link: z.string().optional(),
        repoUrl: z.string().optional(),
        description: z.string(),
        category: z
            .enum([
                'DeveloperApplication',
                'FinanceApplication',
                'BusinessApplication',
                'MultimediaApplication',
            ])
            .default('DeveloperApplication'),
        tags: z.array(z.string()).optional(),
    }),
});

const interestsCollection = defineCollection({
    loader: file('src/content/interests/list.json'),
    schema: z.object({
        items: z.array(z.string()),
    }),
});

export const collections = {
    projects: projectsCollection,
    interests: interestsCollection,
};
