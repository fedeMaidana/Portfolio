---
title: 'Hyprwall'
number: '#004'
category: 'DeveloperApplication'
description: 'Wallpaper selector for Hyprland with a software-rendered carousel, written in Rust.'
repoUrl: 'https://github.com/fedeMaidana/hyprwall'
tags: ['Rust', 'Wayland', 'Hyprland', 'tiny-skia']
---

Technical decisions:

### An overlay layer, not a window

Hyprwall draws itself as a Wayland `layer-shell` surface on the overlay layer, using `smithay-client-toolkit`. Instead of being just another window of the compositor, it's a layer that covers the screen with exclusive keyboard interactivity, so the selector appears on top of everything and captures the arrow keys without fighting the rest of the environment.

### Elm architecture

The state lives under a Model–Msg–Cmd pattern: Wayland events are translated into messages, a pure `update` function decides how the state changes and which effects to fire, and the resulting commands (redraw, apply wallpaper, exit) run separately. The concrete advantage is that all the navigation and selection logic stays free of Wayland and can be tested with pure functions, without bringing up a compositor.

### Custom software rendering

There's no GPU here: each frame is rasterized by hand onto a shared-memory buffer with `tiny-skia`, and the label text is drawn glyph by glyph with `fontdue`, including ellipsis clipping when a name doesn't fit. The pipeline is split into two stages: first a _scene_ is built —a resolution-independent list of drawing commands— and then a rasterizer paints it applying the scale factor. That keeps HiDPI support in a single place and leaves the scene construction easy to test.

### Carousel with a central focus

The layout places the selected wallpaper large and centered, and the rest spread out to the sides, shrinking with distance and wrapping around circularly. Only the cards that fit on screen are computed. The hit testing for the click comes from the same layout, so what you see and what you can click never get out of sync.

![Wallpaper selection in hyprwall, photo 1](../../../assets/pictures/hyprwall_1.png)

![Wallpaper selection in hyprwall, photo 2](../../../assets/pictures/hyprwall_2.png)

![Wallpaper selection in hyprwall, photo 3](../../../assets/pictures/hyprwall_3.png)

### Parallel loading

On startup, the wallpapers in the directory are decoded and reduced to thumbnails in parallel with `rayon`, preserving the original alphabetical order even though they finish in any order. The images are decoded only once at a bounded size, not when resolving each frame.

### Applying the wallpaper

To set the background, hyprwall tries `awww`, `swww` and `hyprctl hyprpaper` in a cascade, starting the corresponding daemon if needed and waiting for its socket to appear. It works with whatever tool you already have installed instead of imposing one. After applying, it remembers the current wallpaper in a cache and leaves a symlink — which is exactly where `hyprcolor` and `hyprbar` read the active background from to recolor the rest of the desktop.

### Tests

The pure logic —the state reducer, the picker navigation, the scene construction— has unit test coverage: that the arrows wrap around, that a click changes the selection and fires the application, that the scene emits the panel first and then the cards. The part that touches Wayland is left as a thin translation layer with no decisions of its own, so it doesn't need a compositor to be tested.

### Current status

It works end to end: it scans the directory, shows the carousel, navigates with keyboard or mouse and applies the chosen wallpaper. It's the piece that closes the ecosystem —it picks the background that `hyprcolor` turns into a palette and that `hyprbar` reflects in its accent color.
