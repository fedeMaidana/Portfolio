---
title: 'Portafolio'
number: '#001'
category: 'DeveloperApplication'
description: 'Mi portafolio personal desarrollado con Astro, enfocado en performance extrema, accesibilidad (A11y) y optimización para motores de respuesta (SEO/GEO/AEO).'
link: 'https://maidana.dev'
repoUrl: 'https://github.com/fedeMaidana/Portfolio'
tags: ['Astro', 'TypeScript', 'Bun', 'LightningCSS', 'JSON-LD']
---

Este proyecto es mi carta de presentación técnica. Implementé una arquitectura de componentes modulares, **Content Collections** para la gestión de datos y una estrategia de metadatos avanzada utilizando **JSON-LD** para asegurar que tanto humanos como IAs comprendan mi perfil profesional.

A continuación, detallo las decisiones arquitectónicas y el stack tecnológico que respaldan este enfoque.

### ⚡ Arquitectura y Core

El objetivo principal fue lograr una **performance extrema** y una excelente experiencia de desarrollador (DX).

- **Astro:** Elegido por su arquitectura de _Islands_ y su capacidad de enviar cero JavaScript al cliente por defecto. Ideal para sitios estáticos enfocados en contenido.
- **Bun:** Reemplacé Node.js/npm por Bun como _package manager_ y _runtime_ principal para reducir radicalmente los tiempos de instalación y _build_.
- **TypeScript:** Tipado estricto en todo el proyecto para prevenir errores en tiempo de compilación y mejorar el autocompletado.

### 🎨 Estilos y Optimización

Evité frameworks CSS pesados para mantener el control absoluto sobre el _bundle_ final.

- **CSS Nativo + LightningCSS:** Utilizo LightningCSS integrado directamente en la configuración de Astro para procesar y minificar el CSS. Es significativamente más rápido que PostCSS o Sass y genera código extremadamente optimizado.
- **Tipografía:** Integración de fuentes optimizadas (`@fontsource/instrument-serif`, `@fontsource/space-mono`) de forma local para evitar llamadas a redes externas y saltos de diseño (CLS).

### 🤖 SEO, AEO y Accesibilidad

Un portafolio moderno no solo debe verse bien, debe ser indexable por motores de búsqueda tradicionales (SEO) y motores de respuesta basados en IA (AEO/GEO).

- **JSON-LD:** Estructuración de datos semánticos para que los LLMs y crawlers extraigan mi información profesional sin ambigüedades.
- **Generación de Sitemap:** Integración automatizada con `@astrojs/sitemap` para mantener a los motores de búsqueda actualizados con cada _deploy_.
- **A11y:** Fuerte enfoque en accesibilidad, validado continuamente mediante integraciones como `eslint-plugin-jsx-a11y`.

### 🛠️ Tooling y Calidad de Código

Para garantizar que el código se mantenga limpio a largo plazo, configuré un pipeline estricto de desarrollo.

- **Husky & Lint-Staged:** Hooks de Git en el `pre-commit` para asegurar que ningún código mal formateado o con errores de linting llegue al repositorio.
- **ESLint + Prettier:** Estandarización del formato, incluyendo parsers específicos para archivos `.astro`.
- **Vercel Analytics & Speed Insights:** Monitoreo en tiempo real de la performance en producción y del tráfico de usuarios directamente desde el entorno de _deploy_.
