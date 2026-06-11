---
title: 'Hyprcolor'
number: '#003'
category: 'DeveloperApplication'
description: 'Daemon en Rust que extrae la paleta del wallpaper de Hyprland y regenera la config de todo el entorno.'
repoUrl: 'https://github.com/fedeMaidana/hyprcolor'
tags: ['Rust', 'Wayland', 'Hyprland', 'CLI']
---

Decisiones técnicas:

### Un daemon, no un script

Hyprcolor corre como proceso de larga duración sobre el event loop de `Wayland`. En vez de ejecutarse una vez y morir, se conecta al compositor con `smithay-client-toolkit` y usa `calloop` con un timer que sondea el wallpaper actual cada segundo. Cuando detecta un cambio, regenera todo; mientras tanto, no consume nada. Esto lo integra de forma nativa al ciclo de vida de la sesión en lugar de depender de un cron o un hook manual.

### Detección de cambios por fingerprint

Para no recalcular la paleta en cada tick, cada wallpaper se reduce a una huella —ruta canónica, tamaño y fecha de modificación— y solo cuando esa huella cambia se dispara la extracción. La fuente del wallpaper se resuelve en cascada: primero la cache de `hyprwall`, luego `swww`, y por último `hyprctl hyprpaper`, así funciona sin importar qué herramienta uses para fijar el fondo.

### Extracción de la paleta

El algoritmo abre la imagen con el crate `image`, la reescala a 180×180 y la cuantiza en un histograma de color para hallar los tonos dominantes. A partir de ahí elige acentos puntuando cada color por frecuencia y saturación, con un filtro de distancia para que no salgan tres variantes del mismo tono. Todo el trabajo de color —conversión RGB↔HSL, luminancia relativa, normalización de saturación y brillo— está hecho a mano para tener control fino sobre cómo se ve cada rol en una UI, no solo cuál es el color "más común".

### Nueve exportadores

El verdadero alcance del proyecto es la salida: la misma paleta se traduce a formatos para CSS, variables de entorno, JSON, Lua para Hyprland, Zsh, y configuraciones completas para Ghostty, Zed, Starship y Fastfetch. Cada exportador es un módulo independiente detrás de una interfaz común, así sumar un destino nuevo no toca a los demás. El tema de Zed, por ejemplo, no es un volcado de colores: deriva roles de sintaxis, estados de UI y una paleta ANSI completa a partir de los acentos.

### Escritura atómica y respeto por lo manual

Todos los archivos se escriben primero a un temporal y luego se renombran sobre el destino, de modo que una app que esté leyendo la config nunca encuentra un archivo a medio escribir. Cuando un exportador toca una config que el usuario podría haber editado a mano, como la de Fastfetch, primero hace un backup antes de sobrescribir.

### Sistema de hooks

Más allá de los exportadores incluidos, hyprcolor ejecuta cualquier script que encuentre en su carpeta de hooks, pasándole la paleta completa por variables de entorno. Eso deja la puerta abierta a que cualquiera extienda el comportamiento —recargar una app, notificar, lo que sea— sin tocar el binario.

### Estado actual

Funciona de punta a punta: detecta el wallpaper, extrae la paleta y mantiene sincronizado todo el entorno en caliente cada vez que cambia el fondo. Es también la pieza que alimenta el color de acento de `hyprbar`, cerrando el círculo de un escritorio que se recolorea solo.
