---
title: 'Portafolio'
number: '#001'
category: 'DeveloperApplication'
description: 'My personal portfolio built with Astro.'
link: 'https://maidana.dev'
repoUrl: 'https://github.com/fedeMaidana/Portfolio'
tags: ['Astro', 'TypeScript', 'Bun']
---

Technical decisions:

### Astro

I chose Astro because it ships very little JavaScript to the browser. For a static portfolio where the content is what matters, that means near-instant loads without giving up interactivity where it's actually needed.

The `astro` component architecture let me split each section into independent pieces that are easy to maintain.

### Bun as the runtime

I used `bun` instead of Node.js. Dependency installs and builds are faster.

### Strict TypeScript

Everything is typed with `TypeScript` in its strictest mode. In practice this means errors show up while I'm writing and not once the site is already live. Each project's data is also validated with `Zod` before building, so nothing broken ever ships.

### Native CSS

I decided not to use `Tailwind` or any other CSS framework. Instead I used native CSS organized with `@layer` layers, which lets me control the styles in an orderly way. Minification is handled by `LightningCSS`, which is fast and keeps the final file small.

The fonts are served from the site itself and preloaded, so there are no jumps or flashes of text when the page opens.

### Animated background

The background is an Argentine flag drawn with `ASCII` characters. It runs on a separate thread so it doesn't block the rest of the page, adapts to the screen size, and respects the preference of those who'd rather have less motion.

![Argentine flag drawn with ASCII characters](../../../assets/pictures/flag.png)

### Built for mobile too

On the phone all the content is unified into a single full-screen block, with the sections separated by lines. Text and spacing adjust so everything reads comfortably on small screens.

### SEO and structured data

I added `JSON-LD` structured data on each page so that both search engines and AI assistants understand who I am and what I do. The sitemap and `robots.txt` are generated automatically on every deploy.

### Accessibility

You can navigate the whole thing with the keyboard, each section is properly labeled, and decorative icons are hidden from screen readers. An automated check runs on every change so problems don't slip through.

### Code quality

Before each commit, the code automatically goes through a formatter and an automated linter. It's ten minutes of setup that save a ton of silly mistakes and formatting arguments.

### In production

It's deployed on `Vercel`, with traffic metrics and real speed metrics across different devices. The security headers are configured to protect the site.
