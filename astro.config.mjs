import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
    site: 'https://maidana.dev',
    adapter: vercel(),
    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en', 'fr'],
        routing: {
            prefixDefaultLocale: false,
        },
    },
    integrations: [
        sitemap({
            i18n: {
                defaultLocale: 'es',
                locales: {
                    es: 'es',
                    en: 'en',
                    fr: 'fr',
                },
            },
        }),
    ],
    env: {
        schema: {
            RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
            CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret' }),
            CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret' }),
            GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
            UPSTASH_REDIS_REST_URL: envField.string({
                context: 'server',
                access: 'secret',
                optional: true,
            }),
            UPSTASH_REDIS_REST_TOKEN: envField.string({
                context: 'server',
                access: 'secret',
                optional: true,
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
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp',
        },
    },
});
