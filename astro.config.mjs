import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://maidana.dev',
    integrations: [sitemap()],
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
