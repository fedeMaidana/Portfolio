import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
    site: 'https://maidana.dev',
    adapter: vercel(),
    integrations: [sitemap()],
    env: {
        schema: {
            RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
            CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret' }),
            CONTACT_FROM_EMAIL: envField.string({
                context: 'server',
                access: 'secret',
                default: 'Portfolio <onboarding@resend.dev>',
            }),
        },
    },
    vite: {
        css: {
            transformer: 'lightningcss',
            lightningcss: {},
        },
        build: {
            cssMinify: 'lightningcss',
        },
    },
});
