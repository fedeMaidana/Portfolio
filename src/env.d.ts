/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_GITHUB_API_BASE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
