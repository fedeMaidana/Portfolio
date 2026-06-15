---
title: 'ARC'
number: '#006'
category: 'DeveloperApplication'
description: 'Capa de seguridad en Rust para agentes de IA y scripts: revisa cada acción antes de ejecutarla y decide si permitirla, bloquearla o pedir aprobación.'
repoUrl: 'https://github.com/fedeMaidana/ARC'
tags: ['Rust', 'CLI', 'Security', 'AI Agents']
---

Decisiones técnicas:

### Qué es: una compuerta para las acciones

ARC —Action Review Controller— es una capa de seguridad por línea de comandos que se mete entre un agente de IA (o un script, o una herramienta) y el sistema. Antes de que una acción se ejecute, ARC la revisa y toma una de tres decisiones: permitir, bloquear o pedir aprobación humana. Aparte, le asigna un nivel de riesgo —bajo, medio, alto o crítico— que va por separado de la decisión: un comando puede necesitar aprobación sin ser peligroso, y al revés. El flujo completo es siempre el mismo: pedido → revisión → decisión → registro → ejecución segura.

### Arquitectura hexagonal

El proyecto está partido en cuatro capas bien separadas: el _dominio_ con la lógica pura de decisión (sin tocar disco ni red), la _aplicación_ que orquesta el flujo de revisión a través de un puerto, la _infraestructura_ con los adaptadores concretos (config, ejecutor, log de auditoría, motores de política, descubrimiento de agentes, shims) y la _interfaz_ (CLI, API JSON, TUI). El puerto es un trait `ReviewEnvironment`, y hay un único lugar en todo el código que conecta la infraestructura real con ese puerto. La ventaja concreta es que toda la lógica de seguridad se puede testear con funciones puras, sin levantar procesos ni tocar el sistema de archivos.

### Dos motores de políticas: nativo y Rego

ARC trae un motor de políticas nativo escrito en Rust, pero también puede delegar la decisión a `Rego`/`OPA` (el lenguaje de políticas de Open Policy Agent) si lo configurás. El motor se elige por configuración y ambos devuelven la misma estructura de decisión. La parte importante es que el motor Rego _falla cerrado_: si `OPA` no está instalado, tarda de más o devuelve algo que ARC no entiende, la decisión por defecto es bloquear con riesgo crítico. En seguridad eso es lo correcto —ante la duda, no se ejecuta— y está cubierto por tests.

### Políticas de consola a prueba de bypass

Para los comandos, las reglas son finas: cada comando tiene una política (permitir, preguntar o bloquear), cada subcomando también, y los argumentos pueden bloquearse o exigir aprobación. Lo interesante es cuánto trabajo hay en que no se la puedan saltar. Las rutas se normalizan antes de compararlas, así que un truco como `cat safe/../../.env` no esquiva la lista de recursos protegidos. Pasar el comando por ruta absoluta o relativa (`/usr/bin/git`, `./git`) no lo cuela como si fuera otro comando, y encadenar texto en el subcomando (`git status;push`) se detecta y se rechaza. Todo arranca con una postura de _denegar por defecto_: lo que no está explícitamente permitido, no pasa.

### Protección de red para evitar SSRF

Cuando una acción apunta a una URL, ARC la analiza para frenar pedidos a lugares que no debería tocar: localhost, redes privadas, direcciones link-local y —clave en la nube— el servicio de metadatos en `169.254.169.254`. Bloquea por esquema, por host y por rangos de IP (CIDR). Esto es defensa contra _SSRF_ (Server-Side Request Forgery: engañar a un proceso para que haga pedidos a direcciones internas), un agujero clásico cuando un agente puede pedir URLs arbitrarias.

### API JSON estricta para agentes

Más allá del uso humano, ARC expone `arc decide --json`: lee un pedido en JSON por la entrada estándar y devuelve una respuesta estructurada. Es _solo decisión_, nunca ejecuta nada, así que un agente puede consultarla antes de actuar sin riesgo. La entrada se valida de forma estricta —rechaza campos desconocidos, comandos vacíos o formas mal armadas— y el contrato es estable: versión de API fija, códigos de razón legibles por máquina y códigos de salida en los que un agente puede confiar (0 si permite o pregunta, 1 si bloquea, 2 si el pedido es inválido).

### Shims: interceptar al agente sin que se note

Esta es la parte más ingeniosa. Para meterse en el medio de verdad, ARC instala _launchers_ en un directorio que va primero en el `PATH`. Cuando el agente ejecuta un comando, primero pega en el launcher, que marca de dónde viene el pedido, antepone un segundo directorio de shims al `PATH` y recién ahí lanza el binario real. Ese segundo directorio tiene shims de `bash` y `sh` que enrutan los comandos de shell de vuelta por ARC. Y acá hay una decisión de diseño fuerte: en lugar de intentar parsear shell arbitrario, el shim _rechaza_ todo lo que tenga sintaxis compleja —pipes, `;`, `&`, `$`, backticks, redirecciones—; si no lo puede razonar con seguridad, no lo corre. Para encontrar qué interceptar, ARC escanea el `PATH` buscando agentes conocidos (Claude Code, OpenCode, Codex, Gemini y varios más) y candidatos por heurística, evitando sus propios directorios para no entrar en loop.

### Ejecución acotada y auditoría

Cuando una acción se aprueba y ARC la ejecuta, lo hace en una caja con límites: por defecto limpia el entorno, recorta la salida a un máximo de bytes y aplica un timeout que mata el proceso si se cuelga. Y pase lo que pase, cada decisión queda registrada en un log de auditoría en formato JSON Lines. Ese log redacta automáticamente lo que parezca sensible —claves de API, contraseñas, tokens, _bearer_— antes de escribir, recorta los campos enormes y, en sistemas Unix, queda con permisos restringidos a solo el dueño. La idea es poder reconstruir qué pasó sin filtrar secretos en el camino.

### Tests y CI exhaustivos

Siendo una herramienta de seguridad, la confianza importa, así que el testing es serio. Hay tests unitarios, de integración y end-to-end —incluida la matriz de políticas, los casos de bypass, el parser de URLs y la API JSON—, y los end-to-end levantan el binario real con directorios temporales aislados. El CI corre en cada push formateo, `Clippy` con los warnings tratados como errores, y toda la batería de tests con `cargo-nextest`. La misma tanda de chequeos se puede correr localmente antes de commitear.
