---
title: 'Hyprbar'
number: '#002'
category: 'DeveloperApplication'
description: 'Status bar minimalista para Wayland/Hyprland escrita en Rust, con rendering por GPU.'
repoUrl: 'https://github.com/fedeMaidana/hyprbar'
tags: ['Rust', 'Wayland', 'wgpu', 'SCTK']
---

Decisiones técnicas:

### Rust y Wayland nativo

Construí la barra directamente sobre el protocolo de `Wayland` usando `smithay-client-toolkit` y `wayland-client`, sin frameworks de UI por encima. Esto me da control total sobre la superficie layer-shell y mantiene el binario liviano. El event loop corre sobre `calloop`, que integra los eventos de Wayland con el resto de las fuentes de la aplicación.

### Rendering por GPU

El dibujado va por `wgpu` con `Vello` para las escenas 2D y `Parley` para el shaping y layout de texto. En vez de rasterizar por CPU, toda la barra se renderiza en la GPU, lo que mantiene el consumo bajo incluso con actualizaciones frecuentes como el reloj o los workspaces.

### Sistema de componentes

Cada widget de la barra es una _pill_ que implementa un trait `Component` con tres responsabilidades: medir su tamaño, renderizarse dentro de los límites que le asigna el layout, y reportar interacciones mediante hit testing. El layout distribuye los componentes en tres zonas (izquierda, centro y derecha) y los colores, espaciados y radios viven centralizados en un sistema de `tokens`, igual que en un design system.

![Hyprbar renderizando la pill izquierda](../../assets/pictures/hyprbar_left.png)

![Hyprbar renderizando la pill central](../../assets/pictures/hyprbar_center.png)

![Hyprbar renderizando la pill derecha](../../assets/pictures/hyprbar_right.png)

### IPC con Hyprland

La integración con los workspaces habla directamente con los sockets Unix de `Hyprland`: uno para consultas y dispatches, y otro para el stream de eventos. Implementé el cliente IPC a mano en lugar de usar una librería externa, con timeouts en las lecturas para que los workers en background puedan apagarse limpiamente. Los hilos de larga duración están siempre _owned_ mediante handles con token de shutdown, nunca detached.

### Colores dinámicos

La barra carga el color de acento desde `hyprcolor`, así se adapta automáticamente al wallpaper.

![Hyprbar renderizando la barra superior, foto 1](../../assets/pictures/hyprbar_1.png)

![Hyprbar renderizando la barra superior, foto 2](../../assets/pictures/hyprbar_2.png)

![Hyprbar renderizando la barra superior, foto 3](../../assets/pictures/hyprbar_3.png)

### Clima

La pill del clima consulta `Open-Meteo` detectando la ubicación aproximada por IP, y todo el JSON externo se deserializa en structs tipados con `serde` en vez de navegar valores ad-hoc.

### Calidad de código

Los parsers, el layout y el hit testing tienen tests de integración, y el CI corre formateo, tests y `Clippy` con warnings tratados como errores en cada push. La misma batería de chequeos se puede correr localmente antes de commitear.

### Estado actual

El proyecto está en una etapa temprana pero funcional: renderiza una barra superior con logo, fecha, reloj, clima, workspaces interactivos con hover y click, y avatar de perfil opcional. La arquitectura está pensada para que la barra crezca componente por componente sin volverse inmantenible.

Para mas información, podes leer el readme en [GitHub](https://github.com/fedeMaidana/hyprbar).
