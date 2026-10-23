import React from "react";
import { Composition } from "remotion";
import { Autobiography } from "./Autobiography";
import { FPS, HEIGHT, WIDTH, planScenes } from "@/lib/scenes";
import { SAMPLE_PROJECT } from "./sample";

export const COMPOSITION_ID = "Autobiography";

export const RemotionRoot: React.FC = () => {
  const sample = planScenes(SAMPLE_PROJECT);
  return (
    <Composition
      id={COMPOSITION_ID}
      component={Autobiography}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={sample.totalFrames}
      defaultProps={{ plan: sample }}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(1, props.plan.totalFrames),
      })}
    />
  );
};
