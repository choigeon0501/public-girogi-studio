import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Scene } from "@/lib/scenes";
import { FONT_SERIF } from "../Autobiography";
import { Fade } from "./common";

export const IntroScene: React.FC<{ scene: Extract<Scene, { kind: "intro" }> }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 40], [20, 0], { extrapolateRight: "clamp" });
  return (
    <Fade inFrames={20} outFrames={20}>
      <AbsoluteFill
        style={{
          background: "#f4efe6",
          color: "#2b2520",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 28,
          transform: `translateY(${y}px)`,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, opacity: 0.6 }}>영상 자서전</div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 96, fontWeight: 600 }}>{scene.title}</div>
        {scene.ownerName ? (
          <div style={{ fontSize: 40, opacity: 0.8, marginTop: 10 }}>{scene.ownerName}</div>
        ) : null}
      </AbsoluteFill>
    </Fade>
  );
};
