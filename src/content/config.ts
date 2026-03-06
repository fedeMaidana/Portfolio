import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
    type: 'content',
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
    type: 'data',
    schema: z.object({
        items: z.array(z.string()),
    }),
});

export const collections = {
    projects: projectsCollection,
    interests: interestsCollection,
};
