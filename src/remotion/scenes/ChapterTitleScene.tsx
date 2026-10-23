import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Scene } from "@/lib/scenes";
import { FONT_SERIF } from "../Autobiography";
import { Fade } from "./common";

export const ChapterTitleScene: React.FC<{ scene: Extract<Scene, { kind: "chapter-title" }> }> = ({
  scene,
}) => {
  const frame = useCurrentFrame();
  const isMoment = scene.blockType === "moment";
  const lineW = interpolate(frame, [10, 45], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Fade inFrames={15} outFrames={18}>
      <AbsoluteFill
        style={{
          background: isMoment ? "#14100e" : "#f4efe6",
          color: isMoment ? "#f4efe6" : "#2b2520",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {!isMoment ? (
          <div style={{ fontSize: 26, letterSpacing: 6, opacity: 0.55 }}>
            {String(scene.index + 1).padStart(2, "0")}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: isMoment ? 72 : 84,
            fontWeight: isMoment ? 400 : 600,
            fontStyle: isMoment ? "italic" : "normal",
          }}
        >
          {scene.title}
        </div>
        <div style={{ width: lineW, height: 2, background: "currentColor", opacity: 0.4 }} />
        {scene.approxYear ? <div style={{ fontSize: 34, opacity: 0.7 }}>{scene.approxYear}</div> : null}
      </AbsoluteFill>
    </Fade>
  );
};
