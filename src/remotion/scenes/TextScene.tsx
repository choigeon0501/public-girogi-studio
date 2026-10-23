import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scene } from "@/lib/scenes";
import type { StyleOptions } from "@/lib/types";
import { FONT_SANS, FONT_SERIF } from "../Autobiography";
import { Fade } from "./common";

/** 사진 없이 글만 있는 장면 */
export const TextScene: React.FC<{ scene: Extract<Scene, { kind: "text" }>; style: StyleOptions }> = ({
  scene,
  style,
}) => {
  const isMoment = scene.blockType === "moment";
  return (
    <Fade>
      <AbsoluteFill
        style={{
          background: isMoment ? "#14100e" : "#f4efe6",
          color: isMoment ? "#f4efe6" : "#2b2520",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 220px",
          textAlign: "center",
          fontFamily: style.subtitle === "serif" || isMoment ? FONT_SERIF : FONT_SANS,
          fontSize: 56,
          lineHeight: 1.6,
          wordBreak: "keep-all",
        }}
      >
        {scene.text}
      </AbsoluteFill>
    </Fade>
  );
};
