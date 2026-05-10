# Remotion Starter Project

Minimal Vite + React + Remotion starter used by generated projects.

## What Stays In The Starter

- `src/App.tsx`: local Remotion Player preview
- `src/remotion/compositions.ts`: composition metadata
- `src/remotion/compositions/Main.tsx`: starter composition
- `src/remotion/launch`: small reusable launch-video motion primitives
- `src/remotion/index.tsx`: Remotion render entrypoint
- `src/styles/global.css`: native CSS only

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Rules

- Use native CSS, CSS variables, SVG, and Remotion primitives.
- Do not add utility CSS frameworks, demo tooling, component-library demos, or generated lab assets to the starter.
- Keep the starter small; project-specific helpers should be created only when a generated video needs them.

## Launch Primitives

Generated projects can import from `src/remotion/launch`:

- `SceneTransition`, `SceneLifecycle`, `CameraDrift`, `SpringLayer`
- `WordReveal`, `LineReveal`, `SplitHeadlineReveal`
- `MotionPanel`, `TracePanel`, `MetricCard`, `IsometricCardStack`, `CursorClick`

These are intentionally generic: use them as movement scaffolding, then customize layout, colors, typography, and content per scene.
