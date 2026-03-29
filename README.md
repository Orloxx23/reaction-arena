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
- [Tech Stack](#tech-stack)
- [Arquitectura](#arquitectura)
- [Primeros Pasos](#primeros-pasos)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
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
