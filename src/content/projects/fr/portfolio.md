---
title: 'Portfolio'
number: '#001'
category: 'DeveloperApplication'
description: 'Mon portfolio personnel construit avec Astro.'
link: 'https://maidana.dev'
repoUrl: 'https://github.com/fedeMaidana/Portfolio'
tags: ['Astro', 'TypeScript', 'Bun']
current: true
---

Décisions techniques :

### Astro

J'ai choisi Astro parce qu'il envoie très peu de JavaScript au navigateur. Pour un portfolio statique où le contenu est ce qui compte, cela se traduit par des chargements quasi instantanés sans renoncer à l'interactivité là où elle est vraiment nécessaire.

L'architecture en composants d'`astro` m'a permis de séparer chaque section en pièces indépendantes, faciles à maintenir.

### Bun comme runtime

J'ai utilisé `bun` au lieu de Node.js. Les installations de dépendances et les builds sont plus rapides.

### TypeScript strict

Tout est typé avec `TypeScript` dans son mode le plus strict. En pratique, cela veut dire que les erreurs apparaissent pendant que j'écris et non quand le site est déjà en ligne. Les données de chaque projet sont aussi validées avec `Zod` avant la compilation, donc rien de cassé ne part en production.

### CSS natif

J'ai décidé de ne pas utiliser `Tailwind` ni aucun autre framework CSS. À la place, j'utilise du CSS natif organisé avec des couches `@layer`, ce qui me permet de contrôler les styles de façon ordonnée. La minification est gérée par `LightningCSS`, qui est rapide et garde le fichier final petit.

Les polices sont servies depuis le site lui-même et préchargées, pour qu'il n'y ait ni saut ni clignotement de texte à l'ouverture de la page.

### Fond animé

Le fond est un drapeau argentin dessiné avec des caractères `ASCII`. Il tourne sur un thread séparé pour ne pas bloquer le reste de la page, s'adapte à la taille de l'écran et respecte la préférence de ceux qui préfèrent moins de mouvement.

![Drapeau argentin dessiné avec des caractères ASCII](../../../assets/pictures/flag.png)

### Pensé aussi pour le mobile

Sur le téléphone, tout le contenu est réuni en un seul bloc en plein écran, avec les sections séparées par des lignes. Les textes et les espacements s'ajustent pour rester confortables à lire sur les petits écrans.

### Référencement et données structurées

J'ai ajouté des données structurées `JSON-LD` sur chaque page pour que les moteurs de recherche comme les assistants IA comprennent qui je suis et ce que je fais. Le plan du site et le `robots.txt` sont générés automatiquement à chaque publication.

### Accessibilité

On peut naviguer entièrement au clavier, chaque section est bien étiquetée et les icônes décoratives sont masquées aux lecteurs d'écran. Une vérification automatique s'exécute à chaque changement pour ne rien laisser passer.

### Qualité du code

Avant chaque commit, le code passe automatiquement par un formateur et un linter automatique. Ce sont dix minutes de configuration qui évitent une foule d'erreurs bêtes et de débats de formatage.

### En production

Il est publié sur `Vercel`, avec des métriques de trafic et de vitesse réelle sur différents appareils. Les en-têtes de sécurité sont configurés pour protéger le site.
