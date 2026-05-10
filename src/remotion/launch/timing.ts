export const LAUNCH_FPS = 30;

export const LAUNCH_TIMING = {
  transition: {
    enterFrames: 12,
    exitFrames: 10,
    blurPx: 3,
    slidePx: 100,
    scaleInFrom: 0.85,
    scaleInExitTo: 1.15,
    scaleDownFrom: 1.15,
    scaleDownExitTo: 0.85,
  },
  reveal: {
    quickFrames: 15,
    standardFrames: 20,
    expressiveFrames: 25,
    longFrames: 30,
    wordStaggerFrames: 3,
    rowStaggerFrames: 6,
    panelStaggerFrames: 8,
  },
  lifecycle: {
    foregroundStartFrame: 10,
    foregroundEnterFrames: 20,
    foregroundExitFrames: 12,
  },
  sceneDurations: {
    openerFrames: 84,
    quickFrames: 90,
    standardFrames: 120,
    productFrames: 150,
    complexDemoFrames: 180,
    maxDemoFrames: 210,
    finalFrames: 105,
  },
} as const;

export type LaunchSceneKind =
  | "opener"
  | "quick"
  | "standard"
  | "product"
  | "complex-demo"
  | "max-demo"
  | "final";

const durationByKind: Record<LaunchSceneKind, number> = {
  opener: LAUNCH_TIMING.sceneDurations.openerFrames,
  quick: LAUNCH_TIMING.sceneDurations.quickFrames,
  standard: LAUNCH_TIMING.sceneDurations.standardFrames,
  product: LAUNCH_TIMING.sceneDurations.productFrames,
  "complex-demo": LAUNCH_TIMING.sceneDurations.complexDemoFrames,
  "max-demo": LAUNCH_TIMING.sceneDurations.maxDemoFrames,
  final: LAUNCH_TIMING.sceneDurations.finalFrames,
};

export function scaleFrames(frames: number, fps: number, baseFps = LAUNCH_FPS) {
  return Math.round((frames / baseFps) * fps);
}

export function launchSceneDuration(
  kind: LaunchSceneKind = "standard",
  fps = LAUNCH_FPS,
) {
  return scaleFrames(durationByKind[kind], fps);
}

export function launchTimeline(
  scenes: Array<{
    label: string;
    kind?: LaunchSceneKind;
    durationInFrames?: number;
  }>,
  fps = LAUNCH_FPS,
) {
  let cursor = 0;

  return scenes.map((scene) => {
    const durationInFrames =
      scene.durationInFrames ?? launchSceneDuration(scene.kind ?? "standard", fps);
    const marker = {
      label: scene.label,
      from: cursor,
      durationInFrames,
    };

    cursor += durationInFrames;
    return marker;
  });
}

export function launchTotalDuration(
  scenes: Array<{ durationInFrames: number }>,
) {
  return scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
}
