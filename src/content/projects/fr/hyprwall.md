---
title: 'Hyprwall'
number: '#004'
category: 'DeveloperApplication'
description: 'Sélecteur de fonds d’écran pour Hyprland avec un carrousel rendu en logiciel, écrit en Rust.'
repoUrl: 'https://github.com/fedeMaidana/hyprwall'
tags: ['Rust', 'Wayland', 'Hyprland', 'tiny-skia']
---

Décisions techniques :

### Une couche overlay, pas une fenêtre

Hyprwall se dessine comme une surface `layer-shell` de Wayland sur la couche overlay, avec `smithay-client-toolkit`. Au lieu d'être une fenêtre de plus du compositeur, c'est une couche qui couvre l'écran avec une interactivité clavier exclusive, de sorte que le sélecteur apparaît au-dessus de tout et capture les flèches sans se battre avec le reste de l'environnement.

### Architecture Elm

L'état vit sous un patron Model–Msg–Cmd : les événements de Wayland sont traduits en messages, une fonction `update` pure décide comment l'état change et quels effets déclencher, et les commandes résultantes (redessiner, appliquer le fond d'écran, quitter) s'exécutent à part. L'avantage concret, c'est que toute la logique de navigation et de sélection reste libre de Wayland et peut être testée avec des fonctions pures, sans démarrer un compositeur.

### Rendu logiciel maison

Pas de GPU ici : chaque frame est rastérisée à la main sur un buffer de mémoire partagée avec `tiny-skia`, et le texte des étiquettes est dessiné glyphe par glyphe avec `fontdue`, y compris le découpage avec des points de suspension quand un nom ne rentre pas. Le pipeline est découpé en deux étapes : on construit d'abord une _scène_ —une liste de commandes de dessin indépendante de la résolution— puis un rastériseur la peint en appliquant le facteur d'échelle. Cela garde le support HiDPI à un seul endroit et laisse la construction de la scène facile à tester.

### Carrousel à focus central

Le layout place le fond d'écran sélectionné en grand et centré, et les autres se répartissent sur les côtés en rétrécissant avec la distance, en s'enroulant de façon circulaire. Seules les cartes qui tiennent à l'écran sont calculées. Le hit testing pour le clic sort du même layout, de sorte que ce que vous voyez et ce sur quoi vous pouvez cliquer ne se désynchronisent jamais.

![Sélection d'un fond d'écran dans hyprwall, photo 1](../../../assets/pictures/hyprwall_1.png)

![Sélection d'un fond d'écran dans hyprwall, photo 2](../../../assets/pictures/hyprwall_2.png)

![Sélection d'un fond d'écran dans hyprwall, photo 3](../../../assets/pictures/hyprwall_3.png)

### Chargement en parallèle

Au démarrage, les fonds d'écran du répertoire sont décodés et réduits en miniatures en parallèle avec `rayon`, en préservant l'ordre alphabétique original même s'ils finissent dans n'importe quel ordre. Les images sont décodées une seule fois à une taille bornée, pas à la résolution de chaque frame.

### Appliquer le fond d'écran

Pour fixer le fond, hyprwall essaie en cascade `awww`, `swww` et `hyprctl hyprpaper`, en démarrant le daemon correspondant si besoin et en attendant que son socket apparaisse. Il fonctionne avec l'outil que vous avez déjà installé au lieu d'en imposer un. Après application, il garde le fond d'écran actuel en cache et laisse un symlink — c'est justement là que `hyprcolor` et `hyprbar` lisent le fond actif pour recoloriser le reste du bureau.

### Tests

La logique pure —le reducer d'état, la navigation du picker, la construction de la scène— a une couverture de tests unitaires : que les flèches s'enroulent, qu'un clic change la sélection et déclenche l'application, que la scène émette d'abord le panneau puis les cartes. Ce qui touche Wayland reste une fine couche de traduction sans décisions propres, donc ça n'a pas besoin d'un compositeur pour être testé.

### État actuel

Il fonctionne de bout en bout : il scanne le répertoire, affiche le carrousel, navigue au clavier ou à la souris et applique le fond d'écran choisi. C'est la pièce qui ferme l'écosystème —elle choisit le fond que `hyprcolor` transforme en palette et que `hyprbar` reflète dans sa couleur d'accent.
