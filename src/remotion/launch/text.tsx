import type { CSSProperties } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { fitText, gpuTransform, measureText, progress, timeline } from "./helpers";
import { LAUNCH_TIMING } from "./timing";

type TextWeight = string | number;

export function WordReveal({
  text,
  start = 0,
  stagger = LAUNCH_TIMING.reveal.wordStaggerFrames,
  duration = LAUNCH_TIMING.reveal.expressiveFrames,
  y = 40,
  blur = 0,
  style,
  wordStyle,
}: {
  text: string;
  start?: number;
  stagger?: number;
  duration?: number;
  y?: number;
  blur?: number;
  style?: CSSProperties;
  wordStyle?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span style={{ ...style, display: "inline-block" }}>
      {words.map((word, index) => {
        const p = progress(frame, start + index * stagger, duration, Easing.out(Easing.quad));
        const transform = gpuTransform([
          `translate3d(0, ${timeline(p, [0, 1], [y, 0])}px, 0)`,
        ]);

        return (
          <span
            key={`${word}-${index}`}
            style={{
              ...wordStyle,
              display: "inline-block",
              opacity: p,
              filter: blur > 0 ? `blur(${timeline(p, [0, 1], [blur, 0])}px)` : undefined,
              transform,
              willChange: "transform, opacity, filter",
              backfaceVisibility: "hidden",
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </span>
  );
}

export function LineReveal({
  children,
  start = 0,
  duration = LAUNCH_TIMING.reveal.standardFrames,
  y = 40,
  blur = LAUNCH_TIMING.transition.blurPx,
  style,
}: {
  children: string;
  start?: number;
  duration?: number;
  y?: number;
  blur?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration, Easing.out(Easing.exp));

  return (
    <span
      style={{
        ...style,
        display: "inline-block",
        opacity: p,
        filter: blur > 0 ? `blur(${timeline(p, [0, 1], [blur, 0])}px)` : undefined,
        transform: gpuTransform([
          `translate3d(0, ${timeline(p, [0, 1], [y, 0])}px, 0)`,
        ]),
        willChange: "transform, opacity, filter",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </span>
  );
}

export function SplitHeadlineReveal({
  first,
  second,
  fullText = `${first} ${second}`,
  start = 0,
  secondStart = 18,
  exitStart,
  withinWidth = 1536,
  maxFontSize = 110,
  fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
  fontWeight = 700,
  color = "#111111",
  secondColor,
  highlightSecond = false,
  highlightBackground = "#111111",
  highlightColor = "#ffffff",
  borderRadius = 12,
  style,
}: {
  first: string;
  second: string;
  fullText?: string;
  start?: number;
  secondStart?: number;
  exitStart?: number;
  withinWidth?: number;
  maxFontSize?: number;
  fontFamily?: string;
  fontWeight?: TextWeight;
  color?: string;
  secondColor?: string;
  highlightSecond?: boolean;
  highlightBackground?: string;
  highlightColor?: string;
  borderRadius?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const fontSize = fitText({
    text: fullText,
    withinWidth,
    fontFamily,
    fontWeight,
    maxFontSize,
  });
  const baseTextStyle = {
    fontFamily,
    fontSize,
    fontWeight,
    color,
    lineHeight: 1.05,
    whiteSpace: "nowrap",
  } satisfies CSSProperties;
  const space = measureText({
    text: "\u00A0",
    fontFamily,
    fontSize,
    fontWeight,
  }).width;
  const secondWidth = measureText({
    text: second,
    fontFamily,
    fontSize,
    fontWeight,
  }).width;
  const enter = progress(frame, start, 16, Easing.out(Easing.quad));
  const reveal = timeline(
    frame,
    [secondStart, secondStart + 18],
    [0, secondWidth + space + (highlightSecond ? 32 : 0)],
    Easing.inOut(Easing.quad),
  );
  const exit =
    exitStart === undefined ? 0 : progress(frame, exitStart, 12, Easing.in(Easing.quad));
  const secondWords = second.split(/\s+/).filter(Boolean);

  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "baseline",
        opacity: 1 - exit,
        transform: gpuTransform([
          `translate3d(0, ${timeline(enter, [0, 1], [34, 0]) - exit * 42}px, 0)`,
        ]),
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      <span
        style={{
          ...baseTextStyle,
          display: "inline-block",
          opacity: enter,
          filter: `blur(${timeline(enter, [0, 1], [8, 0])}px)`,
        }}
      >
        {first}
      </span>
      <span
        style={{
          display: "inline-flex",
          flexShrink: 0,
          width: reveal,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            ...baseTextStyle,
            paddingLeft: space,
            color: highlightSecond ? highlightColor : secondColor ?? color,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              gap: 0,
              padding: highlightSecond ? "0 16px" : 0,
              borderRadius,
              background: highlightSecond ? highlightBackground : undefined,
              transformOrigin: "left center",
            }}
          >
            {secondWords.map((word, index) => {
              const p = progress(
                frame,
                secondStart + 4 + index * 4,
                14,
                Easing.out(Easing.quad),
              );

              return (
                <span
                  key={`${word}-${index}`}
                  style={{
                    display: "inline-block",
                    opacity: p,
                    filter: `blur(${timeline(p, [0, 1], [8, 0])}px)`,
                    transform: gpuTransform([
                      `translate3d(0, ${timeline(p, [0, 1], [18, 0])}px, 0)`,
                    ]),
                  }}
                >
                  {word}
                  {index < secondWords.length - 1 ? "\u00A0" : ""}
                </span>
              );
            })}
          </span>
        </span>
      </span>
    </span>
  );
}
