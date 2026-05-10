import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { gpuTransform, progress, springIn, timeline } from "./helpers";
import { LAUNCH_TIMING } from "./timing";

export type LaunchTransitionName =
  | "hard-cut"
  | "fade"
  | "scale-in"
  | "scale-down"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "wipe-up"
  | "wipe-left";

function motionTransform(variant: LaunchTransitionName, amount: number, exit = false) {
  if (variant === "hard-cut" || variant === "fade") return undefined;

  const distance = exit ? amount : 1 - amount;
  const sign = exit ? 1 : -1;
  const { slidePx, scaleInFrom, scaleInExitTo, scaleDownFrom, scaleDownExitTo } =
    LAUNCH_TIMING.transition;

  if (variant === "scale-in") {
    return `scale(${exit ? 1 + (scaleInExitTo - 1) * amount : scaleInFrom + (1 - scaleInFrom) * amount})`;
  }
  if (variant === "scale-down") {
    return `scale(${exit ? 1 - (1 - scaleDownExitTo) * amount : scaleDownFrom - (scaleDownFrom - 1) * amount})`;
  }
  if (variant === "slide-up") return `translate3d(0, ${exit ? -slidePx * amount : slidePx * distance}px, 0)`;
  if (variant === "slide-down") return `translate3d(0, ${exit ? slidePx * amount : -slidePx * distance}px, 0)`;
  if (variant === "slide-left") return `translate3d(${exit ? -slidePx * amount : slidePx * distance}px, 0, 0)`;
  if (variant === "slide-right") return `translate3d(${exit ? slidePx * amount : -slidePx * distance}px, 0, 0)`;
  if (variant === "wipe-up") return `translate3d(0, ${sign * 16 * distance}px, 0)`;
  if (variant === "wipe-left") return `translate3d(${sign * 16 * distance}px, 0, 0)`;

  return undefined;
}

function motionClipPath(variant: LaunchTransitionName, amount: number, exit = false) {
  if (variant !== "wipe-up" && variant !== "wipe-left") return undefined;

  const hidden = exit ? amount * 100 : (1 - amount) * 100;
  if (variant === "wipe-up") return `inset(${hidden}% 0 0 0)`;
  return `inset(0 0 0 ${hidden}%)`;
}

export function SceneTransition({
  children,
  durationInFrames,
  entrance = "scale-in",
  exit = "slide-up",
  enterFrames = LAUNCH_TIMING.transition.enterFrames,
  exitFrames = LAUNCH_TIMING.transition.exitFrames,
  blur = LAUNCH_TIMING.transition.blurPx,
  style,
}: {
  children: ReactNode;
  durationInFrames: number;
  entrance?: LaunchTransitionName;
  exit?: LaunchTransitionName;
  enterFrames?: number;
  exitFrames?: number;
  blur?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const exitStart = Math.max(0, durationInFrames - exitFrames);
  const enterProgress =
    entrance === "hard-cut" ? 1 : progress(frame, 0, enterFrames, Easing.out(Easing.exp));
  const exitProgress =
    exit === "hard-cut" ? 0 : progress(frame, exitStart, exitFrames, Easing.in(Easing.exp));
  const isExiting = exitProgress > 0;
  const activeVariant = isExiting ? exit : entrance;
  const amount = isExiting ? exitProgress : enterProgress;
  const transform = motionTransform(activeVariant, amount, isExiting);
  const clipPath = motionClipPath(activeVariant, amount, isExiting);
  const opacity =
    (entrance === "hard-cut" ? 1 : enterProgress) *
    (exit === "hard-cut" ? 1 : 1 - exitProgress);
  const blurAmount = isExiting ? blur * exitProgress : blur * (1 - enterProgress);

  return (
    <AbsoluteFill
      style={{
        ...style,
        opacity,
        clipPath,
        filter: blurAmount > 0.05 ? `blur(${blurAmount}px)` : undefined,
        transform: gpuTransform([transform]),
        transformOrigin: "center",
        willChange: "transform, opacity, filter, clip-path",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

export function SceneLifecycle({
  background,
  children,
  durationInFrames,
  foregroundStart = LAUNCH_TIMING.lifecycle.foregroundStartFrame,
  foregroundEnterFrames = LAUNCH_TIMING.lifecycle.foregroundEnterFrames,
  foregroundExitFrames = LAUNCH_TIMING.lifecycle.foregroundExitFrames,
  foregroundStyle,
}: {
  background?: ReactNode;
  children: ReactNode;
  durationInFrames: number;
  foregroundStart?: number;
  foregroundEnterFrames?: number;
  foregroundExitFrames?: number;
  foregroundStyle?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const enter = progress(
    frame,
    foregroundStart,
    foregroundEnterFrames,
    Easing.out(Easing.exp),
  );
  const exit = progress(
    frame,
    Math.max(0, durationInFrames - foregroundExitFrames),
    foregroundExitFrames,
    Easing.in(Easing.cubic),
  );

  return (
    <AbsoluteFill>
      {background}
      <AbsoluteFill
        style={{
          ...foregroundStyle,
          opacity: enter * (1 - exit),
          transform: gpuTransform([
            `translate3d(0, ${timeline(enter, [0, 1], [22, 0]) - exit * 26}px, 0)`,
          ]),
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function CameraDrift({
  children,
  durationInFrames,
  fromScale = 1.04,
  toScale = 1,
  fromX = 0,
  toX = 0,
  fromY = 0,
  toY = 0,
  style,
}: {
  children: ReactNode;
  durationInFrames: number;
  fromScale?: number;
  toScale?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, 0, durationInFrames, Easing.inOut(Easing.cubic));
  const scale = timeline(p, [0, 1], [fromScale, toScale]);
  const x = timeline(p, [0, 1], [fromX, toX]);
  const y = timeline(p, [0, 1], [fromY, toY]);

  return (
    <AbsoluteFill
      style={{
        ...style,
        transform: gpuTransform([`translate3d(${x}px, ${y}px, 0) scale(${scale})`]),
        transformOrigin: "center",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

export function SpringLayer({
  children,
  delay = 0,
  y = 24,
  scaleFrom = 0.96,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  scaleFrom?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, delay);

  return (
    <div
      style={{
        ...style,
        opacity: p,
        transform: gpuTransform([
          `translate3d(0, ${timeline(p, [0, 1], [y, 0])}px, 0)`,
          `scale(${timeline(p, [0, 1], [scaleFrom, 1])})`,
        ]),
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}
