import { AbsoluteFill, Artifact, Easing, interpolate, useCurrentFrame } from "remotion";

const plusMarks = [
  { left: "13%", top: "18%" },
  { left: "30%", top: "78%" },
  { left: "72%", top: "20%" },
  { left: "86%", top: "68%" },
  { left: "18%", top: "58%" },
  { left: "62%", top: "82%" },
];

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const timedProgress = (
  frame: number,
  start: number,
  duration: number,
  easing = easeOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing,
  });

const lineStyle = (frame: number, start: number) => {
  const reveal = timedProgress(frame, start, 24, easeOut);
  const settle = Math.sin(Math.min(reveal, 1) * Math.PI) * -5;

  return {
    opacity: interpolate(reveal, [0, 0.55, 1], [0, 1, 1], clamp),
    transform: `translate3d(0, ${(1 - reveal) * 54 + settle}px, 0) scale(${0.985 + reveal * 0.015})`,
  };
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const titleMain = lineStyle(frame, 12);
  const titleAccent = lineStyle(frame, 18);
  const trackIn = timedProgress(frame, 24, 20, easeOut);
  const load = timedProgress(frame, 35, 90, easeInOut);
  const exit = timedProgress(frame, 160, 14, easeIn);
  const fadeToBlack = timedProgress(frame, 168, 12, easeInOut);
  const bgDrift = timedProgress(frame, 0, 179, easeInOut);
  const progressScale = 0.68 * load;

  return (
    <>
      {frame === 0 && (
        <Artifact content={Artifact.Thumbnail} filename="thumbnail.jpeg" />
      )}
      <AbsoluteFill className="smoke-scene">
        <div
          className="smoke-glow"
          style={{
            transform: `translate3d(${(bgDrift - 0.5) * 16}px, ${-18 + bgDrift * 8}px, 0) scale(${1 + bgDrift * 0.025})`,
            opacity: 0.38 + Math.sin(frame / 44) * 0.04,
          }}
        />
        <div
          className="smoke-grid"
          style={{
            transform: `translate3d(${-18 * bgDrift}px, ${10 * bgDrift}px, 0) scale(${1 + bgDrift * 0.025})`,
          }}
        />
        <div
          className="smoke-noise"
          style={{
            transform: `translate3d(${Math.sin(frame / 38) * 3}px, ${Math.cos(frame / 46) * 3}px, 0)`,
            opacity: 0.2 + Math.sin(frame / 51) * 0.035,
          }}
        />
        {plusMarks.map((mark, index) => {
          const float = Math.sin(frame / 34 + index * 0.9);
          return (
            <span
              key={index}
              className="smoke-plus"
              style={{
                left: mark.left,
                top: mark.top,
                opacity: 0.19 + float * 0.045,
                transform: `translate3d(-50%, -50%, 0) rotate(${float * 8}deg) scale(${1 + float * 0.05})`,
              }}
            />
          );
        })}
        <div
          className="smoke-content"
          style={{
            opacity: 1 - exit,
            transform: `translate3d(0, ${exit * -10}px, 0) scale(${1 + exit * 0.12})`,
          }}
        >
          <div className="smoke-title" aria-label="Hyperframes migration test">
            <span className="smoke-line-mask">
              <span
                className="smoke-title-line smoke-title-main"
                style={titleMain}
              >
                Hyperframes
              </span>
            </span>
            <span className="smoke-line-mask smoke-line-mask-accent">
              <span
                className="smoke-title-line smoke-title-accent"
                style={titleAccent}
              >
                migration test
              </span>
            </span>
          </div>
          <div
            className="smoke-progress"
            aria-hidden="true"
            style={{
              opacity: trackIn * (1 - exit),
              transform: `translate3d(0, ${(1 - trackIn) * 22}px, 0) scale(${0.992 + trackIn * 0.008})`,
            }}
          >
            <span
              className="smoke-progress-fill"
              style={{ transform: `scaleX(${progressScale})` }}
            />
            <span
              className="smoke-progress-sheen"
              style={{
                opacity: interpolate(load, [0.18, 0.95, 1], [0, 1, 0], clamp),
                transform: `translate3d(${interpolate(load, [0, 1], [-140, 650], clamp)}px, 0, 0)`,
              }}
            />
          </div>
        </div>
        <div className="smoke-fade" style={{ opacity: fadeToBlack }} />
      </AbsoluteFill>
    </>
  );
};
