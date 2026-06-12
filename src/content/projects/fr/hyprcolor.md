---
title: 'Hyprcolor'
number: '#003'
category: 'DeveloperApplication'
description: 'Daemon en Rust qui extrait la palette du fond d’écran de Hyprland et régénère la config de tout l’environnement.'
repoUrl: 'https://github.com/fedeMaidana/hyprcolor'
tags: ['Rust', 'Wayland', 'Hyprland', 'CLI']
---

Décisions techniques :

### Un daemon, pas un script

Hyprcolor tourne comme un processus de longue durée au-dessus de la boucle d'événements de `Wayland`. Au lieu de s'exécuter une fois et de mourir, il se connecte au compositeur avec `smithay-client-toolkit` et utilise `calloop` avec un timer qui sonde le fond d'écran actuel chaque seconde. Quand il détecte un changement, il régénère tout ; le reste du temps, il ne consomme rien. Cela l'intègre nativement au cycle de vie de la session au lieu de dépendre d'un cron ou d'un hook manuel.

### Détection des changements par empreinte

Pour ne pas recalculer la palette à chaque tick, chaque fond d'écran est réduit à une empreinte —chemin canonique, taille et date de modification— et c'est seulement quand cette empreinte change que l'extraction se déclenche. La source du fond d'écran est résolue en cascade : d'abord le cache de `hyprwall`, puis `swww`, et enfin `hyprctl hyprpaper`, pour que ça marche quel que soit l'outil que vous utilisez pour fixer le fond.

### Extraction de la palette

L'algorithme ouvre l'image avec le crate `image`, la redimensionne en 180×180 et la quantifie dans un histogramme de couleurs pour trouver les teintes dominantes. À partir de là, il choisit les accents en notant chaque couleur sur la fréquence et la saturation, avec un filtre de distance pour ne pas obtenir trois variantes de la même teinte. Tout le travail de couleur —conversion RGB↔HSL, luminance relative, normalisation de saturation et de luminosité— est fait à la main pour avoir un contrôle fin sur le rendu de chaque rôle dans une UI, et pas seulement sur la couleur « la plus fréquente ».

### Neuf exportateurs

La vraie portée du projet, c'est la sortie : la même palette est traduite vers des formats pour CSS, variables d'environnement, JSON, Lua pour Hyprland, Zsh, et des configurations complètes pour Ghostty, Zed, Starship et Fastfetch. Chaque exportateur est un module indépendant derrière une interface commune, donc ajouter une nouvelle destination ne touche pas aux autres. Le thème de Zed, par exemple, n'est pas un simple déversement de couleurs : il dérive des rôles de syntaxe, des états d'UI et une palette ANSI complète à partir des accents.

### Écriture atomique et respect du manuel

Tous les fichiers sont d'abord écrits dans un temporaire puis renommés sur la destination, de sorte qu'une application en train de lire la config ne tombe jamais sur un fichier écrit à moitié. Quand un exportateur touche une config que l'utilisateur a pu éditer à la main, comme celle de Fastfetch, il fait d'abord une sauvegarde avant d'écraser.

### Système de hooks

Au-delà des exportateurs inclus, hyprcolor exécute n'importe quel script qu'il trouve dans son dossier de hooks, en lui passant la palette complète via des variables d'environnement. Cela laisse la porte ouverte à quiconque pour étendre le comportement —recharger une app, notifier, peu importe— sans toucher au binaire.

### État actuel

Il fonctionne de bout en bout : il détecte le fond d'écran, extrait la palette et garde tout l'environnement synchronisé à chaud à chaque changement de fond. C'est aussi la pièce qui alimente la couleur d'accent de `hyprbar`, bouclant le cercle d'un bureau qui se recolorise tout seul.
