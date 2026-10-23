import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scene } from "@/lib/scenes";
import { FONT_SERIF } from "../Autobiography";
import { Fade } from "./common";

export const EndingScene: React.FC<{ scene: Extract<Scene, { kind: "ending" }> }> = ({ scene }) => (
  <Fade inFrames={25} outFrames={30}>
    <AbsoluteFill
      style={{
        background: "#0b0a09",
        color: "#f4efe6",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      {scene.text ? (
        <div style={{ fontFamily: FONT_SERIF, fontSize: 54, opacity: 0.9 }}>{scene.text}</div>
      ) : null}
      <div style={{ fontSize: 24, letterSpacing: 8, opacity: 0.45 }}>GIROGI STUDIO</div>
    </AbsoluteFill>
  </Fade>
);
