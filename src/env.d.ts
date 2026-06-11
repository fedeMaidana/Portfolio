/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_GITHUB_API_BASE?: string;
    readonly GITHUB_TOKEN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
