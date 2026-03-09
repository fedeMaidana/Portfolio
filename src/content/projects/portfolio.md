---
title: 'Portafolio'
number: '#001'
category: 'DeveloperApplication'
description: 'Mi portafolio personal construido con Astro. Cero JavaScript innecesario, accesibilidad real y datos estructurados para que humanos e IAs interpreten mi perfil sin ambigüedad.'
link: 'https://maidana.dev'
repoUrl: 'https://github.com/fedeMaidana/Portfolio'
tags: ['Astro', 'TypeScript', 'Bun', 'LightningCSS', 'JSON-LD']
---

Para este portafolio no se usaron plantillas genéricas, ni tampoco fue un proyecto de fin de semana: a continuación les detallo cada decisión técnica.

### Astro

Lo que me convenció fue que envía cero JavaScript al cliente a menos que explícitamente se lo pidas. Para un portafolio estático donde el contenido es lo que importa, eso significa cargas casi instantáneas sin sacrificar interactividad donde realmente hace falta.

La arquitectura de componentes `.astro` me permitió separar cada sección en piezas independientes que son fáciles de mantener.

### Bun como runtime

Cambié **Node.js** por **Bun**. Las instalaciones de dependencias y los builds son notablemente más rápidos.

### TypeScript estricto

Todo el proyecto está tipado con **TypeScript** en su configuración más estricta: `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Suena excesivo, pero en la práctica significa que los errores aparecen mientras escribo, no cuando ya está en producción. Los **Content Collections** de Astro con schemas de **Zod** validan la estructura de cada proyecto y cada dato antes de que el sitio siquiera compile.

### CSS nativo

Tomé la decisión de no usar Tailwind ni ningún otro framework CSS.

Escribí **CSS nativo** organizado con **CSS Layers** (`@layer reset, theme, base, utilities`), lo que me permite gestionar la especificidad de forma predecible sin `!important` ni hacks. El procesamiento y minificación los maneja **LightningCSS**, integrado directamente en la configuración de **Vite** dentro de Astro. Es significativamente más rápido que PostCSS y genera un bundle final más compacto.

Las tipografías son **Instrument Serif** para los títulos y **Space Mono** para el cuerpo, ambas servidas localmente con **@fontsource** y precargadas con `<link rel="preload">`. Eso elimina los saltos de layout (CLS) y el flash de texto invisible que pasa cuando dependés de Google Fonts.

### La animación del fondo (art ASCII)

El canvas con olas que ves de fondo no es decorativo por capricho. Quería transmitir algo de Mar del Plata. Está implementado en un **Web Worker** con un **OffscreenCanvas** para que no bloquee el hilo principal. Respeta `prefers-reduced-motion` y se adapta al viewport. Es sutil, pero le da vida al sitio sin comprometer la performance.

El overlay de ruido usa una textura `.webp` repetida con `opacity: 0.04` y `contain: strict` para que el navegador lo optimice sin esfuerzo.

### SEO, AEO y datos estructurados

Los sistemas de respuesta basados en IA también consumen sitios web, y necesitan datos estructurados para entenderlo.

Implementé schemas **JSON-LD** en cada página. El schema `Person` describe quién soy, qué sé hacer y dónde encontrarme. Cada proyecto tiene su propio schema `SoftwareApplication`. Eso permite que tanto crawlers tradicionales como LLMs extraigan mi información sin problemas.

El **sitemap** se genera automáticamente con `@astrojs/sitemap` en cada deploy, y el `robots.txt` se genera dinámicamente como una API route de Astro.

### Accesibilidad

El **skip link** permite saltar al contenido principal con teclado. Cada sección tiene `aria-labelledby`. Los iconos decorativos llevan `aria-hidden="true"`. El linting con **eslint-plugin-jsx-a11y** corre en cada commit para atrapar problemas antes de que lleguen al repositorio.

Las **View Transitions** de Astro dan continuidad visual entre páginas sin depender de un framework SPA, y se degradan correctamente en navegadores que no las soportan.

### Calidad de código

Configuré **Husky** con **lint-staged** para que cada commit pase por **ESLint** y **Prettier** automáticamente. Es una inversión de diez minutos que ahorra horas de discusiones sobre formato y errores tontos. El parser de **astro-eslint-parser** permite que ESLint entienda archivos `.astro`, y **typescript-eslint** aplica las reglas más estrictas sobre el código TypeScript.

### Monitoreo en producción

El sitio está desplegado en **Vercel**. Integré **@vercel/analytics** para entender el tráfico real y **@vercel/speed-insights** para monitorear la performance en dispositivos y conexiones reales, no solo en mi máquina.

Los headers de seguridad están configurados en `vercel.json`: Content-Security-Policy, HSTS, X-Frame-Options, y Permissions-Policy.
