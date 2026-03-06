import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: process.env.URL || 'http://localhost:4321',
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
