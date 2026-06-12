---
title: 'Hyprcolor'
number: '#003'
category: 'DeveloperApplication'
description: 'Rust daemon that extracts the palette from the Hyprland wallpaper and regenerates the config of the whole environment.'
repoUrl: 'https://github.com/fedeMaidana/hyprcolor'
tags: ['Rust', 'Wayland', 'Hyprland', 'CLI']
---

Technical decisions:

### A daemon, not a script

Hyprcolor runs as a long-lived process on top of the `Wayland` event loop. Instead of running once and dying, it connects to the compositor with `smithay-client-toolkit` and uses `calloop` with a timer that polls the current wallpaper every second. When it detects a change, it regenerates everything; in the meantime, it consumes nothing. This integrates it natively into the session lifecycle instead of relying on a cron job or a manual hook.

### Change detection by fingerprint

To avoid recalculating the palette on every tick, each wallpaper is reduced to a fingerprint —canonical path, size and modification date— and only when that fingerprint changes does the extraction fire. The wallpaper source is resolved in a cascade: first `hyprwall`'s cache, then `swww`, and finally `hyprctl hyprpaper`, so it works no matter which tool you use to set the background.

### Palette extraction

The algorithm opens the image with the `image` crate, rescales it to 180×180 and quantizes it into a color histogram to find the dominant tones. From there it picks accents by scoring each color on frequency and saturation, with a distance filter so you don't end up with three variants of the same tone. All the color work —RGB↔HSL conversion, relative luminance, saturation and brightness normalization— is done by hand to have fine control over how each role looks in a UI, not just which color is the "most common".

### Nine exporters

The real scope of the project is the output: the same palette is translated into formats for CSS, environment variables, JSON, Lua for Hyprland, Zsh, and full configurations for Ghostty, Zed, Starship and Fastfetch. Each exporter is an independent module behind a common interface, so adding a new target doesn't touch the others. The Zed theme, for example, isn't a color dump: it derives syntax roles, UI states and a full ANSI palette from the accents.

### Atomic writes and respect for manual edits

Every file is written first to a temporary file and then renamed over the destination, so an app reading the config never finds a half-written file. When an exporter touches a config the user might have edited by hand, like Fastfetch's, it makes a backup first before overwriting.

### Hook system

Beyond the bundled exporters, hyprcolor runs any script it finds in its hooks folder, passing it the full palette through environment variables. That leaves the door open for anyone to extend the behavior —reload an app, send a notification, whatever— without touching the binary.

### Current status

It works end to end: it detects the wallpaper, extracts the palette and keeps the whole environment in sync live every time the background changes. It's also the piece that feeds `hyprbar`'s accent color, closing the loop of a desktop that recolors itself.
