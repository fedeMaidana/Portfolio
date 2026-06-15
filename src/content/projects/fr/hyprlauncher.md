---
title: 'Hyprlauncher'
number: '#005'
category: 'DeveloperApplication'
description: 'Lanceur d’applications pour Wayland/Hyprland écrit en Rust, avec rendu logiciel et icônes chargées en arrière-plan.'
repoUrl: 'https://github.com/fedeMaidana/hyprlauncher'
tags: ['Rust', 'Wayland', 'Hyprland', 'tiny-skia']
---

Décisions techniques :

### Une couche overlay, pas une fenêtre

Hyprlauncher se dessine comme une surface `layer-shell` de Wayland sur la couche overlay, avec `smithay-client-toolkit`. Au lieu d’être une fenêtre de plus du compositeur, c’est une couche qui couvre tout l’écran avec une interactivité clavier exclusive, de sorte que le lanceur apparaît au-dessus de tout et capture les touches sans se battre avec le reste de l’environnement. Quand il se ferme, il libère l’écran et c’est tout.

![Aperçu d'Hyprlauncher 1](../../../assets/pictures/hyprlauncher_1.png)

![Aperçu d'Hyprlauncher 2](../../../assets/pictures/hyprlauncher_2.png)

![Aperçu d'Hyprlauncher 3](../../../assets/pictures/hyprlauncher_3.png)

### Architecture Elm

L’état vit sous un patron Model–Msg–Cmd : les événements de Wayland (touches, souris, scroll, redimensionnement) sont traduits en messages, une fonction `update` pure décide comment l’état change et quels effets déclencher, et les commandes résultantes —redessiner, lancer l’application, ajuster l’échelle, quitter— s’exécutent à part. L’avantage concret, c’est que toute la logique de recherche, de sélection et de scroll reste libre de Wayland et peut être testée avec des fonctions pures, sans démarrer un compositeur.

### Rendu logiciel

Pas de GPU ici : chaque frame est rastérisée à la main sur un buffer de mémoire partagée avec `tiny-skia`, et le texte est dessiné glyphe par glyphe avec `fontdue`, y compris le découpage avec des points de suspension quand un nom ne rentre pas. Le dessin est d’abord disposé en coordonnées logiques, et c’est seulement au moment de peindre qu’il est multiplié par le facteur d’échelle de l’écran, de sorte que le support HiDPI reste concentré à un seul endroit. Pour éviter les repaints inutiles, les redessins sont planifiés via le _frame callback_ de la surface plutôt que de se déclencher à chaque événement.

### Scan et lancement des applications

Le lanceur parcourt récursivement les répertoires d’applications de XDG, déduplique par id et parse la section `[Desktop Entry]` de chaque fichier `.desktop`, en sautant les entrées marquées comme cachées ou sans affichage ainsi que tout ce qui n’est pas une application. Pour en exécuter une, il nettoie d’abord les _field codes_ du standard (`%u`, `%F` et compagnie) puis découpe la ligne `Exec` en respectant les guillemets avant de lancer le processus, au lieu de la passer brute à un shell.

### Recherche avec classement et liste à fenêtre

Chaque entrée est notée par rapport à ce que vous tapez : nom exact, début identique, sous-chaîne, puis le nom générique et le commentaire, avec une priorité décroissante. Les résultats sont triés par score et par ordre alphabétique, et limités à un maximum configurable. La liste visible est une _fenêtre_ qui glisse sur l’ensemble des résultats avec son propre offset de scroll, donc ça reste fluide même avec des centaines d’applications, parce qu’elle ne dessine jamais plus de lignes qu’il n’en tient à l’écran.

### Pipeline d’icônes asynchrone

C’est la partie la plus intéressante. Les icônes ne bloquent jamais l’interface : un thread worker en arrière-plan reçoit des noms d’icône par un canal, les résout contre un index des répertoires du thème —en notant les candidats pour préférer les SVG scalables et les icônes d’application, pénaliser les _symbolic_ et favoriser les plus grandes tailles—, décode les images raster avec le crate `image` (en redimensionnant avec Lanczos3) ou rend les SVG avec `resvg`, et publie le résultat dans une map partagée. Un drapeau atomique signale à la boucle de rendu de repeindre quand de nouvelles icônes arrivent. Pendant qu’une icône charge, la ligne affiche l’initiale du nom comme placeholder, pour qu’il n’y ait jamais de trou vide.

### Cache d’icônes sur disque

Chaque icône déjà décodée ou rendue est enregistrée une seule fois en PNG dans `~/.cache/hyprlauncher/icons` et réutilisée entre les exécutions, de sorte que la deuxième ouverture est instantanée. Il y a aussi un mode `--warm-icon-cache` qui préchauffe ce cache à l’avance —à la connexion, par exemple— sans ouvrir l’interface, pour que tout soit déjà résolu au moment où vous ouvrez réellement le lanceur.

### Couleurs dynamiques et aperçu du fond d’écran

Le lanceur charge sa palette depuis `hyprcolor` (avec un thème de repli s’il n’est pas disponible), donc il s’adapte tout seul au fond d’écran, et il affiche un aperçu du fond actuel dans le panneau latéral en utilisant le chemin que `hyprcolor` exporte. Pas de GTK, pas de Qt, pas d’Electron : juste Wayland et un binaire léger.
