---
title: 'Hyprlauncher'
number: '#005'
category: 'DeveloperApplication'
description: 'Launcher de aplicaciones para Wayland/Hyprland escrito en Rust, con renderizado por software e iconos cargados en segundo plano.'
repoUrl: 'https://github.com/fedeMaidana/hyprlauncher'
tags: ['Rust', 'Wayland', 'Hyprland', 'tiny-skia']
---

Decisiones técnicas:

### Una capa overlay, no una ventana

Hyprlauncher se dibuja como una superficie `layer-shell` de Wayland en la capa overlay, usando `smithay-client-toolkit`. En vez de ser una ventana más del compositor, es una capa que cubre toda la pantalla con interactividad de teclado exclusiva, así el launcher aparece por encima de todo y captura las teclas sin pelearse con el resto del entorno. Al cerrarse libera la pantalla y listo.

![Vista previa de HyperLauncher 1](../../assets/pictures/hyprlauncher_1.png)

![Vista previa de HyperLauncher 2](../../assets/pictures/hyprlauncher_2.png)

![Vista previa de HyperLauncher 3](../../assets/pictures/hyprlauncher_3.png)

### Arquitectura Elm

El estado vive bajo un patrón Model–Msg–Cmd: los eventos de Wayland (teclas, mouse, scroll, resize) se traducen a mensajes, una función `update` pura decide cómo cambia el estado y qué efectos disparar, y los comandos resultantes —redibujar, lanzar la app, ajustar la escala, salir— se ejecutan aparte. La ventaja concreta es que toda la lógica de búsqueda, selección y scroll queda libre de Wayland y se puede testear con funciones puras, sin levantar un compositor.

### Renderizado por software

No hay GPU: cada frame se rasteriza a mano sobre un buffer de memoria compartida con `tiny-skia`, y el texto se dibuja glifo por glifo con `fontdue`, incluido el recorte con puntos suspensivos cuando un nombre no entra. El dibujado se arma primero en coordenadas lógicas y recién al pintar se multiplica por el factor de escala de la pantalla, de modo que el soporte HiDPI queda concentrado en un solo lugar. Para no redibujar de más, los repintados se agendan a través del _frame callback_ de la superficie en vez de dispararse en cada evento.

### Escaneo y lanzamiento de aplicaciones

El launcher recorre los directorios de aplicaciones de XDG de forma recursiva, deduplica por id y parsea la sección `[Desktop Entry]` de cada archivo `.desktop`, salteando las entradas marcadas como ocultas o sin display y las que no son aplicaciones. Para ejecutar, primero limpia los _field codes_ del estándar (`%u`, `%F` y compañía) y después parte la línea `Exec` respetando comillas antes de lanzar el proceso, en lugar de pasarla cruda a un shell.

### Búsqueda con ranking y lista con ventana

Cada entrada se puntúa contra lo que escribís: nombre exacto, que empiece igual, que lo contenga, y después el nombre genérico y el comentario, con prioridad decreciente. Los resultados se ordenan por puntaje y alfabéticamente, y se recortan a un máximo configurable. La lista visible es una _ventana_ que se desplaza sobre el total de resultados con su propio offset de scroll, así anda fluido aunque tengas cientos de aplicaciones, porque nunca dibuja más filas de las que entran en pantalla.

### Pipeline de iconos asíncrono

Esta es la parte más jugosa. Los iconos nunca bloquean la interfaz: un hilo worker en segundo plano recibe nombres de icono por un canal, los resuelve contra un índice de los directorios del theme —puntuando candidatos para preferir SVG escalables e iconos de aplicación, penalizar los _symbolic_ y favorecer los tamaños más grandes—, decodifica los raster con el crate `image` (reescalando con Lanczos3) o renderiza los SVG con `resvg`, y publica el resultado en un mapa compartido. Una bandera atómica le avisa al loop de render que vuelva a pintar cuando llegan iconos nuevos. Mientras un icono carga, la fila muestra la inicial del nombre como placeholder, así nunca queda un hueco vacío.

### Cache de iconos en disco

Cada icono ya decodificado o renderizado se guarda una sola vez como PNG en `~/.cache/hyprlauncher/icons` y se reutiliza entre ejecuciones, de modo que la segunda apertura es instantánea. Además hay un modo `--warm-icon-cache` que precalienta esa cache de antemano —por ejemplo al iniciar sesión— sin abrir la interfaz, para que cuando realmente abras el launcher ya esté todo resuelto.

### Colores dinámicos y preview del wallpaper

El launcher carga la paleta desde `hyprcolor` (con un tema de respaldo si no está disponible), así se adapta solo al wallpaper, y muestra una vista previa del fondo actual en el panel lateral usando la ruta que el propio `hyprcolor` exporta. Sin GTK, sin Qt, sin Electron: solo Wayland y un binario liviano.
