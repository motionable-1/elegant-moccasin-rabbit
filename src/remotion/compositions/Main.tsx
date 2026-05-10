import { AbsoluteFill, Artifact, interpolate, useCurrentFrame } from "remotion";

const PreviewPending = () => {
  const frame = useCurrentFrame();
  const cycle = frame % 90;
  const progress = interpolate(cycle, [0, 54, 90], [0.08, 0.82, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dotOpacity = interpolate(cycle, [0, 45, 90], [0.35, 1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="preview-pending-content">
      <div className="preview-pending-status">
        <span className="preview-pending-dot" style={{ opacity: dotOpacity }} />
        <span>Preview</span>
      </div>
      <div className="preview-pending-title">Preparing preview</div>
      <div className="preview-pending-subtitle">
        Generated scenes will appear here when ready.
      </div>
      <div className="preview-pending-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      {frame === 0 && (
        <Artifact content={Artifact.Thumbnail} filename="thumbnail.jpeg" />
      )}
      <AbsoluteFill className="preview-pending-scene">
        <div className="preview-pending-grid" />
        <PreviewPending />
      </AbsoluteFill>
    </>
  );
};
