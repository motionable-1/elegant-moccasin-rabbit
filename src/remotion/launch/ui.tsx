import type { CSSProperties, ReactNode } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { gpuTransform, progress, timeline } from "./helpers";

export type TraceRow = {
  label: string;
  meta?: string;
  kind?: "llm" | "tool" | "data" | "event";
  status?: "ok" | "warn" | "error";
  indent?: number;
};

export function MotionPanel({
  children,
  delay = 0,
  width = 700,
  padding = 28,
  radius = 24,
  background = "#ffffff",
  border = "1px solid rgba(15, 23, 42, 0.08)",
  shadow = "0 28px 80px rgba(15, 23, 42, 0.14)",
  rotateX = 0,
  rotateY = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  width?: number;
  padding?: number;
  radius?: number;
  background?: string;
  border?: string;
  shadow?: string;
  rotateX?: number;
  rotateY?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, delay, 24, Easing.out(Easing.exp));

  return (
    <div
      style={{
        width,
        padding,
        borderRadius: radius,
        background,
        border,
        boxShadow: shadow,
        opacity: p,
        transform: gpuTransform([
          `translate3d(0, ${timeline(p, [0, 1], [34, 0])}px, 0)`,
          `scale(${timeline(p, [0, 1], [0.94, 1])})`,
          `rotateX(${timeline(p, [0, 1], [rotateX + 8, rotateX])}deg)`,
          `rotateY(${timeline(p, [0, 1], [rotateY - 10, rotateY])}deg)`,
        ]),
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TracePanel({
  title = "Trace",
  traceId = "req_9f82b4a",
  rows,
  delay = 0,
  accent = "#3b82f6",
  fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
}: {
  title?: string;
  traceId?: string;
  rows: TraceRow[];
  delay?: number;
  accent?: string;
  fontFamily?: string;
}) {
  const frame = useCurrentFrame();

  return (
    <MotionPanel delay={delay} width={720} padding={0} rotateX={8} rotateY={-13}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 24px",
          borderBottom: "1px solid #eef2f7",
          background: "#f8fafc",
          fontFamily,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 999, background: accent }} />
        <span
          style={{
            color: "#64748b",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span
          style={{
            marginLeft: "auto",
            padding: "5px 10px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#0f172a",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
          }}
        >
          {traceId}
        </span>
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row, index) => {
          const rowDelay = delay + 16 + index * 7;
          const p = progress(frame, rowDelay, 18, Easing.out(Easing.exp));
          const color =
            row.status === "error" ? "#ef4444" : row.status === "warn" ? "#f59e0b" : "#10b981";
          const kindBackground =
            row.kind === "llm" ? "#eff6ff" : row.kind === "tool" ? "#f8fafc" : "#f1f5f9";

          return (
            <div
              key={`${row.label}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 48,
                marginLeft: (row.indent ?? 0) * 28,
                padding: "10px 12px",
                borderRadius: 12,
                border:
                  row.status === "error"
                    ? "1px solid rgba(239, 68, 68, 0.35)"
                    : "1px solid transparent",
                background:
                  row.status === "error" ? "rgba(239, 68, 68, 0.06)" : "transparent",
                opacity: p,
                transform: gpuTransform([
                  `translate3d(0, ${timeline(p, [0, 1], [18, 0])}px, 0)`,
                ]),
                fontFamily,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: color,
                  boxShadow: `0 0 0 4px ${color}18`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 8,
                  background: kindBackground,
                  color: "#334155",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {row.kind ?? "event"}
              </span>
              <span
                style={{
                  color: "#0f172a",
                  fontSize: 15,
                  fontWeight: 650,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {row.label}
              </span>
              {row.meta && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#94a3b8",
                    fontSize: 13,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {row.meta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </MotionPanel>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  path = "M4 46 C 28 24, 45 58, 70 34 S 111 18, 132 30",
  delay = 0,
  accent = "#2563eb",
  style,
}: {
  label: string;
  value: string;
  detail?: string;
  path?: string;
  delay?: number;
  accent?: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, delay, 22, Easing.out(Easing.exp));
  const pathProgress = progress(frame, delay + 12, 34, Easing.out(Easing.cubic));

  return (
    <div
      style={{
        width: 280,
        minHeight: 174,
        padding: 22,
        borderRadius: 22,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "#ffffff",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.1)",
        opacity: p,
        transform: gpuTransform([
          `translate3d(0, ${timeline(p, [0, 1], [28, 0])}px, 0)`,
          `scale(${timeline(p, [0, 1], [0.95, 1])})`,
        ]),
        ...style,
      }}
    >
      <div style={{ color: "#64748b", fontSize: 14, fontWeight: 750 }}>{label}</div>
      <div style={{ marginTop: 10, color: "#0f172a", fontSize: 42, fontWeight: 800 }}>
        {value}
      </div>
      {detail && (
        <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 13, fontWeight: 650 }}>
          {detail}
        </div>
      )}
      <svg width="100%" height="62" viewBox="0 0 140 62" style={{ marginTop: 12 }}>
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={100}
          style={{
            strokeDasharray: 100,
            strokeDashoffset: 100 * (1 - pathProgress),
            filter: `drop-shadow(0 6px 10px ${accent}33)`,
          }}
        />
      </svg>
    </div>
  );
}

export function IsometricCardStack({
  cards,
  delay = 0,
  width = 420,
  height = 116,
  gap = 54,
  style,
}: {
  cards: Array<{ label: string; color?: string; textColor?: string }>;
  delay?: number;
  width?: number;
  height?: number;
  gap?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "relative",
        width,
        height: height + (cards.length - 1) * gap + 80,
        perspective: 1200,
        ...style,
      }}
    >
      {cards.map((card, index) => {
        const p = progress(frame, delay + index * 8, 24, Easing.out(Easing.exp));
        const lift = timeline(
          Math.sin((frame + index * 12) / 28),
          [-1, 1],
          [-5, 5],
        );

        return (
          <div
            key={`${card.label}-${index}`}
            style={{
              position: "absolute",
              left: 0,
              top: index * gap,
              width,
              height,
              borderRadius: 24,
              background: card.color ?? "#111827",
              color: card.textColor ?? "#ffffff",
              display: "flex",
              alignItems: "center",
              padding: "0 34px",
              fontSize: 24,
              fontWeight: 800,
              boxShadow: "0 24px 42px rgba(15, 23, 42, 0.22)",
              opacity: p,
              transform: gpuTransform([
                `translate3d(${timeline(p, [0, 1], [70, 0])}px, ${timeline(p, [0, 1], [50, lift])}px, 0)`,
                "rotateX(56deg)",
                "rotateZ(-18deg)",
                `scale(${timeline(p, [0, 1], [0.92, 1])})`,
              ]),
              transformStyle: "preserve-3d",
              transformOrigin: "center",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            {card.label}
          </div>
        );
      })}
    </div>
  );
}

export function CursorClick({
  from,
  to,
  start = 0,
  clickFrame = 38,
  color = "#111827",
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  start?: number;
  clickFrame?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const move = progress(frame, start, clickFrame - start, Easing.inOut(Easing.sin));
  const click = progress(frame, clickFrame, 8, Easing.out(Easing.quad));
  const x = timeline(move, [0, 1], [from.x, to.x]);
  const y = timeline(move, [0, 1], [from.y, to.y]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 40,
        height: 40,
        transform: gpuTransform([`scale(${timeline(click, [0, 1], [1, 0.92])})`]),
        transformOrigin: "4px 4px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -18,
          top: -18,
          width: 42,
          height: 42,
          borderRadius: 999,
          border: `2px solid ${color}`,
          opacity: timeline(click, [0, 1], [0, 0.25]),
          transform: `scale(${timeline(click, [0, 1], [0.2, 1.7])})`,
        }}
      />
      <svg width="34" height="34" viewBox="0 0 24 24" fill={color}>
        <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
      </svg>
    </div>
  );
}
