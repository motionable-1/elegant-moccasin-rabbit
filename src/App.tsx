import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Player, PlayerRef } from "@remotion/player";
import { composition } from "./remotion/compositions";

const PLAYER_READY_TYPE = "motionabl:player-ready";
const PLAYER_STATE_TYPE = "motionabl:player-state";
const PLAYER_COMMAND_TYPE = "motionabl:player-command";

type PlayerCommandMessage = {
  type: typeof PLAYER_COMMAND_TYPE;
  command:
    | "play"
    | "pause"
    | "toggle-play"
    | "seek"
    | "mute"
    | "unmute"
    | "toggle-mute"
    | "request-fullscreen"
    | "request-state";
  frame?: number;
};

const getFrameFromHash = (): number | null => {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.slice(1));
  const frameParam = params.get("frame");
  if (frameParam) {
    const frame = parseInt(frameParam, 10);
    if (!isNaN(frame) && frame >= 0) return frame;
  }

  return null;
};

const clampFrame = (frame: number) =>
  Math.min(Math.max(Math.round(frame), 0), composition.durationInFrames - 1);

export const App = () => {
  const playerRef = useRef<PlayerRef>(null);
  const initialFrameRef = useRef(getFrameFromHash());
  const [requestedFrame, setRequestedFrame] = useState<number | null>(
    initialFrameRef.current,
  );
  const [playerSize, setPlayerSize] = useState<CSSProperties>({
    width: "100%",
    height: "100%",
  });

  const initialFrame = initialFrameRef.current;
  const shouldAutoPlay = requestedFrame === null;

  const calculatePlayerSize = () => {
    if (typeof window === "undefined") return { width: "100%", height: "100%" };

    const aspectRatio = composition.width / composition.height;
    const maxWidth = window.innerWidth * 0.96;
    const maxHeight = Math.max(220, window.innerHeight * 0.96);

    let playerWidth = maxWidth;
    let playerHeight = playerWidth / aspectRatio;

    if (playerHeight > maxHeight) {
      playerHeight = maxHeight;
      playerWidth = playerHeight * aspectRatio;
    }

    return {
      width: `${playerWidth}px`,
      height: `${playerHeight}px`,
      maxWidth: "100%",
      maxHeight: "100%",
    };
  };

  useEffect(() => {
    const updateSize = () => setPlayerSize(calculatePlayerSize());
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const updateRequestedFrame = () => setRequestedFrame(getFrameFromHash());
    window.addEventListener("hashchange", updateRequestedFrame);
    updateRequestedFrame();
    return () => window.removeEventListener("hashchange", updateRequestedFrame);
  }, []);

  useEffect(() => {
    if (requestedFrame !== null && playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(clampFrame(requestedFrame));
    }
  }, [requestedFrame]);

  const getPlayerState = useCallback(() => {
    const player = playerRef.current;
    const currentFrame = player
      ? clampFrame(player.getCurrentFrame())
      : clampFrame(requestedFrame ?? 0);

    return {
      compositionId: composition.id,
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      currentFrame,
      isPlaying: player?.isPlaying() ?? shouldAutoPlay,
      isMuted: player?.isMuted() ?? false,
      scenes: composition.scenes ?? [],
    };
  }, [requestedFrame, shouldAutoPlay]);

  const postPlayerState = useCallback(
    (type: typeof PLAYER_READY_TYPE | typeof PLAYER_STATE_TYPE) => {
      window.parent?.postMessage({ type, state: getPlayerState() }, "*");
    },
    [getPlayerState],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return undefined;

    const onPlayerStateChange = () => postPlayerState(PLAYER_STATE_TYPE);

    player.addEventListener("frameupdate", onPlayerStateChange);
    player.addEventListener("seeked", onPlayerStateChange);
    player.addEventListener("play", onPlayerStateChange);
    player.addEventListener("pause", onPlayerStateChange);
    player.addEventListener("ended", onPlayerStateChange);
    player.addEventListener("mutechange", onPlayerStateChange);

    postPlayerState(PLAYER_READY_TYPE);

    return () => {
      player.removeEventListener("frameupdate", onPlayerStateChange);
      player.removeEventListener("seeked", onPlayerStateChange);
      player.removeEventListener("play", onPlayerStateChange);
      player.removeEventListener("pause", onPlayerStateChange);
      player.removeEventListener("ended", onPlayerStateChange);
      player.removeEventListener("mutechange", onPlayerStateChange);
    };
  }, [postPlayerState]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as Partial<PlayerCommandMessage>;
      if (!message || message.type !== PLAYER_COMMAND_TYPE) return;

      const player = playerRef.current;
      if (!player) return;

      switch (message.command) {
        case "play":
          player.play();
          break;
        case "pause":
          player.pause();
          break;
        case "toggle-play":
          if (player.isPlaying()) player.pause();
          else player.play();
          break;
        case "seek":
          player.seekTo(clampFrame(message.frame ?? 0));
          break;
        case "mute":
          player.mute();
          break;
        case "unmute":
          player.unmute();
          break;
        case "toggle-mute":
          if (player.isMuted()) player.unmute();
          else player.mute();
          break;
        case "request-fullscreen":
          player.requestFullscreen();
          break;
        case "request-state":
          postPlayerState(PLAYER_STATE_TYPE);
          break;
      }

      postPlayerState(PLAYER_STATE_TYPE);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [postPlayerState]);

  return (
    <div
      className="app-shell"
      data-motionabl-composition-width={composition.width}
      data-motionabl-composition-height={composition.height}
    >
      <div className="app-backdrop" />
      <div className="app-stage">
        <div className="app-player-shell" data-motionabl-frame="true">
          <div className="app-player-gloss" />
          <Player
            ref={playerRef}
            component={composition.component}
            durationInFrames={composition.durationInFrames}
            fps={composition.fps}
            compositionHeight={composition.height}
            compositionWidth={composition.width}
            controls={false}
            autoPlay={shouldAutoPlay}
            style={playerSize}
            allowFullscreen
            clickToPlay
            acknowledgeRemotionLicense
            doubleClickToFullscreen
            initialFrame={clampFrame(initialFrame ?? 0)}
            numberOfSharedAudioTags={10}
          />
        </div>
      </div>
    </div>
  );
};
