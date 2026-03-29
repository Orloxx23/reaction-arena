# ⚡ Reaction Time Arena

> Hecho con amor por **[Orloxx23](https://github.com/Orloxx23)** (Orlando Mina), con la ayuda de **[Claude Code](https://claude.ai/code)** de Anthropic y **[Stitch](https://stitch.withgoogle.com)** de Google.

Un juego multijugador de tiempo de reacción en tiempo real. Compite contra otros jugadores para ver quién tiene los reflejos más rápidos — ¡presiona en el momento justo y sube al podio!

---

## ¿Qué es Reaction Time Arena?

Reaction Royale es un juego web competitivo donde los jugadores ponen a prueba sus reflejos en tiempo real. La mecánica es simple: espera la señal verde y haz clic lo más rápido posible. Pero la gracia está en hacerlo contra otros jugadores en simultáneo.

### ¿Qué problema resuelve?

Los juegos de tiempo de reacción existen desde hace años, pero la mayoría son experiencias solitarias sin contexto competitivo real. Reaction Royale transforma esa mecánica en una experiencia **multijugador en tiempo real**: salas de hasta 8 personas, sistema de puntuación por rondas, ranking acumulado y un ganador final. Es ideal para:

- **Retos entre amigos** — Crea una sala, comparte el código y compitan.
- **Medir tu progreso** — El modo individual guarda tu mejor tiempo y un historial de intentos.
- **Diversión rápida** — Las partidas son cortas e intensas, perfectas para pausas o streams.

Todo funciona desde el navegador, sin necesidad de instalar nada ni crear cuenta.

---

## Tabla de Contenidos

- [Demo](#demo)
- [Características](#características)
- [Highlights Técnicos](#highlights-técnicos)
- [Tech Stack](#tech-stack)
- [Arquitectura](#arquitectura)
- [Primeros Pasos](#primeros-pasos)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue con CubePath](#despliegue-con-cubepath)
- [Retos y Decisiones de Diseño](#retos-y-decisiones-de-diseño)
- [Posibles Mejoras Futuras](#posibles-mejoras-futuras)
- [Créditos](#créditos)

---

## Demo

[Click aqui (CubePath)](http://reaction-arena.45.90.237.180.sslip.io/)

---

## Características

- **Modo Single Player** — Practica y mide tu tiempo de reacción en solitario.
- **Modo Multijugador en Tiempo Real** — Salas de hasta 8 jugadores, competencia por rondas.
- **Sistema de Puntuación** — Los puestos se traducen en puntos (100, 80, 60, 40...).
- **Efectos Glitch** — Overlay visual con detección de GPU para efectos de píxeles.
- **Internacionalización** — Soporte para Inglés y Español desde el día uno.
- **Diseño responsivo** — Funciona en desktop y móvil.
- **Zero Login** — Sin cuentas, sin formularios. Entra y juega al instante.
- **Estética retro-futurista** — Tipografía pixel art (Press Start 2P), fondo mesh con orbes luminosos y paleta neón verde/rojo.

---

## Highlights Técnicos

Cosas que hacen a este proyecto interesante bajo el capó:

| Aspecto | Detalle |
|---|---|
| **Precisión de timing** | El servidor registra los timestamps de cada clic con precisión de milisegundos — no confiamos en el reloj del cliente para el ranking. |
| **Anti-trampas** | Si haces clic antes de la señal "GO", el servidor te descalifica de la ronda automáticamente. |
| **Transferencia de host** | Si el host se desconecta, el servidor transfiere el control al siguiente jugador — la partida no muere. |
| **Detección de GPU** | El overlay glitch detecta las capacidades de la GPU del usuario para ajustar los efectos visuales sin sacrificar rendimiento. |
| **Eventos tipados end-to-end** | Los eventos de Socket.IO están tipados con TypeScript tanto en cliente como en servidor — cero `any`. |
| **Estado predecible** | Zustand como máquina de estados: `idle → waiting → ready → clicked → tooSoon`. Cada transición está controlada. |
| **Config por sala** | El host puede ajustar rondas, delay y tiempo límite antes de iniciar — cada sala es una experiencia diferente. |

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Estado | Zustand 5 |
| Tiempo Real | Socket.IO 4 |
| Lenguaje | TypeScript 5 |
| Iconos | Phosphor Icons |
| Backend | Node.js + HTTP Server custom |
| Linting | ESLint 9 |

---

## Arquitectura

El proyecto sigue una arquitectura **feature-based** (orientada a funcionalidades) en el frontend, con un servidor Node.js dedicado para la lógica en tiempo real.

```
reaction-royale/
│
├── server/                    # Backend — lógica de juego y WebSockets
│   └── index.ts              # Socket.IO server: salas, rondas, puntuación
│
└── src/
    ├── app/                   # Rutas de Next.js (App Router)
    │   ├── page.tsx          # Home / Landing
    │   ├── play/page.tsx     # Arena single player
    │   └── multiplayer/page.tsx  # Salas multijugador
    │
    ├── features/              # Módulos por funcionalidad
    │   ├── game/             # Lógica del modo individual
    │   │   ├── components/   # GameArena, ReactionHistory
    │   │   ├── hooks/        # use-game.ts — máquina de estados del juego
    │   │   └── store/        # Zustand store (idle → waiting → ready → clicked)
    │   │
    │   └── multiplayer/      # Lógica del modo multijugador
    │       ├── components/   # Arena, Lobby, PlayerList, WaitingRoom...
    │       ├── hooks/        # use-multiplayer.ts
    │       └── store/        # Estado de sala y jugadores
    │
    ├── shared/               # Reutilizables entre features
    │   ├── components/
    │   │   ├── ui/           # Button, Header, Icon
    │   │   └── glitch/       # GlitchOverlay + GPUDetection
    │   └── i18n/             # Provider + diccionarios (en.json, es.json)
    │
    ├── lib/
    │   ├── realtime/         # Inicialización y gestión de Socket.IO
    │   └── utils.ts          # Helpers (cn, etc.)
    │
    └── types/                # Contratos de tipo compartidos
        ├── game.ts           # GameState, Room, RoundResult, Player...
        └── socket-events.ts  # Eventos tipados cliente ↔ servidor
```

### Flujo de una partida multijugador

```
Host crea sala → Jugadores se unen → Host inicia ronda
  → Servidor envía señal "waiting" (delay aleatorio)
  → Señal "GO" → Jugadores hacen clic → Servidor registra timestamps
  → Ranking por velocidad → Puntos acumulados → Siguiente ronda
```

---

## Primeros Pasos

### Prerrequisitos

- **Node.js** >= 18
- **pnpm** (recomendado) — `npm install -g pnpm`

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/Orloxx23/reaction-royale.git
cd reaction-royale

# 2. Instala las dependencias
pnpm install

# 3. Levanta el entorno de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> El servidor de Socket.IO se levanta automáticamente junto con Next.js en modo desarrollo.

---

## Scripts Disponibles

```bash
pnpm dev        # Inicia Next.js + Socket.IO server en modo desarrollo
pnpm build      # Compila la aplicación para producción
pnpm start      # Inicia la app compilada
pnpm lint       # Ejecuta ESLint sobre el proyecto
```

---

## Despliegue con CubePath

Este proyecto fue creado en el contexto de una **hackathon de CubePath**. Para el despliegue en producción utilizamos la infraestructura de CubePath de la siguiente manera:

1. **Servidor en CubePath** — Se aprovisionó un servidor a través de la plataforma de CubePath.
2. **Coolify como PaaS** — Sobre ese servidor se desplegó [Coolify](https://coolify.io/), una plataforma open-source de self-hosting.
3. **Deploy del proyecto** — Desde Coolify se conectó el repositorio y se desplegó Reaction Time Arena con su servidor de Socket.IO incluido.

Esta combinación permite tener un entorno de producción completo, autogestionado y sin depender de servicios cloud tradicionales. CubePath brindó la infraestructura bare-metal y Coolify se encargó del CI/CD y la gestión de contenedores.

---

## Retos y Decisiones de Diseño

Construir un juego multijugador en tiempo real presenta desafíos que no aparecen en una app CRUD típica:

- **Sincronización de tiempo** — En un juego de milisegundos, la latencia importa. Decidimos que el servidor sea la fuente de verdad: él envía la señal "GO" y registra cuándo llega el clic de cada jugador. No se puede hacer trampa manipulando el cliente.

- **Reconexión y resiliencia** — Los jugadores pueden perder conexión brevemente. El servidor detecta desconexiones, auto-falla al jugador en la ronda activa, y si el host se va, transfiere el control automáticamente.

- **UX sin fricción** — Queríamos que cualquier persona pudiera jugar en 5 segundos. Sin login, sin descargas. Abres el link, pones un nickname, y ya estás compitiendo. Esto fue clave para que funcione bien en streams y eventos en vivo.

- **Rendimiento visual vs. accesibilidad** — El efecto glitch es llamativo pero costoso. Implementamos detección de GPU para desactivarlo en dispositivos que no lo soporten bien, evitando que la experiencia visual arruine la experiencia de juego.

---

## Posibles Mejoras Futuras

- Matchmaking automático (cola pública sin necesidad de código de sala)
- Tabla de líderes global con mejores tiempos históricos
- Modos de juego alternativos (secuencias, patrones de colores, memoria)
- Replay de la partida con timeline visual
- Integración con Twitch para que los viewers jueguen contra el streamer

---

## Créditos

Este proyecto fue construido con mucho amor y las herramientas adecuadas:

- **Orloxx23 (Orlando Mina)** — Director, diseñador y desarrollador principal.
- **[Claude Code](https://claude.ai/code)** — Asistente de IA de Anthropic que ayudó a escribir, estructurar y refactorizar gran parte del código.
- **[Stitch by Google](https://stitch.withgoogle.com)** — Herramienta de diseño generativo que contribuyó al sistema visual del proyecto.
- **[CubePath](https://cubepath.io/)** — Infraestructura de servidor donde se desplegó el proyecto mediante Coolify.

---

<p align="center">
  Hecho con ❤️ · <a href="https://github.com/Orloxx23">@Orloxx23</a>
</p>
