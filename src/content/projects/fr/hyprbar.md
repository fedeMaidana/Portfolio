---
title: 'Hyprbar'
number: '#002'
category: 'DeveloperApplication'
description: 'Barre de statut minimaliste pour Wayland/Hyprland écrite en Rust, avec rendu GPU.'
repoUrl: 'https://github.com/fedeMaidana/hyprbar'
tags: ['Rust', 'Wayland', 'wgpu', 'SCTK']
---

Décisions techniques :

### Rust et Wayland natif

J'ai construit la barre directement sur le protocole `Wayland` avec `smithay-client-toolkit` et `wayland-client`, sans framework d'UI par-dessus. Cela me donne un contrôle total sur la surface layer-shell et garde le binaire léger. La boucle d'événements tourne sur `calloop`, qui intègre les événements de Wayland avec le reste des sources de l'application.

### Rendu par GPU

Le dessin passe par `wgpu` avec `Vello` pour les scènes 2D et `Parley` pour le shaping et la mise en page du texte. Au lieu de rastériser sur le CPU, toute la barre est rendue sur le GPU, ce qui maintient la consommation basse même avec des mises à jour fréquentes comme l'horloge ou les workspaces.

### Système de composants

Chaque widget de la barre est une _pill_ qui implémente un trait `Component` avec trois responsabilités : mesurer sa propre taille, se rendre dans les limites que le layout lui assigne, et signaler les interactions via le hit testing. Le layout répartit les composants dans trois zones (gauche, centre et droite), et les couleurs, espacements et rayons vivent de façon centralisée dans un système de `tokens`, comme dans un design system.

![Hyprbar rendant la pill de gauche](../../../assets/pictures/hyprbar_left.png)

![Hyprbar rendant la pill centrale](../../../assets/pictures/hyprbar_center.png)

![Hyprbar rendant la pill de droite](../../../assets/pictures/hyprbar_right.png)

### IPC avec Hyprland

L'intégration avec les workspaces parle directement aux sockets Unix de `Hyprland` : un pour les requêtes et les dispatches, un autre pour le flux d'événements. J'ai implémenté le client IPC à la main au lieu d'utiliser une bibliothèque externe, avec des timeouts sur les lectures pour que les workers en arrière-plan puissent s'arrêter proprement. Les threads de longue durée sont toujours _owned_ via des handles avec un token d'arrêt, jamais détachés.

### Couleurs dynamiques

La barre charge sa couleur d'accent depuis `hyprcolors`, de sorte qu'elle s'adapte automatiquement au fond d'écran.

![Hyprbar rendant la barre supérieure, photo 1](../../../assets/pictures/hyprbar_1.png)

![Hyprbar rendant la barre supérieure, photo 2](../../../assets/pictures/hyprbar_2.png)

![Hyprbar rendant la barre supérieure, photo 3](../../../assets/pictures/hyprbar_3.png)

### Météo

La pill météo interroge `Open-Meteo` en détectant la localisation approximative par IP, et tout le JSON externe est désérialisé en structs typés avec `serde` plutôt que de naviguer dans les valeurs au cas par cas.

### Qualité du code

Les parsers, le layout et le hit testing ont des tests d'intégration, et la CI lance le formatage, les tests et `Clippy` avec les warnings traités comme des erreurs à chaque push. La même batterie de vérifications peut être lancée localement avant de committer.

### État actuel

Le projet est à un stade précoce mais fonctionnel : il rend une barre supérieure avec logo, date, horloge, météo, workspaces interactifs avec hover et clic, et un avatar de profil optionnel. L'architecture est pensée pour que la barre grandisse composant par composant sans devenir impossible à maintenir.

Pour plus d'informations, vous pouvez lire le readme sur [GitHub](https://github.com/fedeMaidana/hyprbar).
