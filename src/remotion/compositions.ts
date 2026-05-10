import { Main } from "./compositions/Main";

export type SceneMarker = {
  label: string;
  from: number;
  durationInFrames: number;
};

export type CompositionConfig = {
  id: "Main";
  component: typeof Main;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  scenes?: SceneMarker[];
};

// Single composition configuration. Add scenes here so the host app can render
// external player controls and scene navigation around the iframe preview.
export const composition: CompositionConfig = {
  id: "Main",
  component: Main,
  durationInFrames: 350,
  fps: 30,
  width: 1920,
  height: 1080,
};
