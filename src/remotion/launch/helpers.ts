import { Easing, interpolate, spring } from "remotion";

export type EaseFn = (input: number) => number;

export const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const textMeasureCache = new Map<string, { width: number; height: number }>();

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function timeline(
  frame: number,
  input: number[],
  output: number[],
  easing?: EaseFn,
) {
  return interpolate(frame, input, output, { ...CLAMP, easing });
}

export function progress(
  frame: number,
  start: number,
  duration: number,
  easing: EaseFn = Easing.out(Easing.cubic),
) {
  return timeline(frame, [start, start + duration], [0, 1], easing);
}

export function springIn(
  frame: number,
  fps: number,
  delay = 0,
  config = { damping: 18, mass: 0.8, stiffness: 130 },
) {
  if (frame <= delay) return 0;

  return clamp01(
    spring({
      frame: frame - delay,
      fps,
      config,
    }),
  );
}

export function gpuTransform(parts: Array<string | false | null | undefined>) {
  return [...parts.filter(Boolean), "translateZ(0)"].join(" ");
}

export function measureText({
  text,
  fontFamily,
  fontSize,
  fontWeight = 400,
  letterSpacing = "0px",
}: {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: string | number;
  letterSpacing?: string;
}) {
  const key = JSON.stringify({
    text,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
  });
  const cached = textMeasureCache.get(key);
  if (cached) return cached;

  if (typeof document === "undefined") {
    const approx = {
      width: text.length * fontSize * 0.56,
      height: fontSize * 1.12,
    };
    textMeasureCache.set(key, approx);
    return approx;
  }

  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.top = "-10000px";
  span.style.left = "-10000px";
  span.style.display = "inline-block";
  span.style.whiteSpace = "pre";
  span.style.fontFamily = fontFamily;
  span.style.fontSize = `${fontSize}px`;
  span.style.fontWeight = String(fontWeight);
  span.style.letterSpacing = letterSpacing;
  span.textContent = text;
  document.body.appendChild(span);
  const rect = span.getBoundingClientRect();
  document.body.removeChild(span);

  const measured = { width: rect.width, height: rect.height };
  textMeasureCache.set(key, measured);
  return measured;
}

export function fitText({
  text,
  withinWidth,
  fontFamily,
  fontWeight = 700,
  maxFontSize,
}: {
  text: string;
  withinWidth: number;
  fontFamily: string;
  fontWeight?: string | number;
  maxFontSize: number;
}) {
  const measured = measureText({
    text,
    fontFamily,
    fontSize: 100,
    fontWeight,
  });

  return Math.min((withinWidth / Math.max(1, measured.width)) * 100, maxFontSize);
}
