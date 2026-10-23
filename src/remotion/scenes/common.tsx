import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { StyleOptions } from "@/lib/types";
import { FONT_SANS, FONT_SERIF } from "../Autobiography";

/** 장면 시작·끝 페이드 (프레임 단위) */
export function useFade(inFrames = 15, outFrames = 15) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(
    frame,
    [0, inFrames, durationInFrames - outFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

export const Fade: React.FC<{ children: React.ReactNode; inFrames?: number; outFrames?: number }> = ({
  children,
  inFrames,
  outFrames,
}) => {
  const opacity = useFade(inFrames, outFrames);
  return <div style={{ position: "absolute", inset: 0, opacity }}>{children}</div>;
};

/** 자막. 스타일 3종 고정값 */
export const Subtitle: React.FC<{ text: string; meta?: string; style: StyleOptions; textOpacity?: number }> = ({
  text,
  meta,
  style,
  textOpacity = 1,
}) => {
  if (!text && !meta) return null;
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "0 120px 80px",
    display: "flex",
    flexDirection: "column",
    alignItems: style.subtitle === "minimal" ? "flex-start" : "center",
    textAlign: style.subtitle === "minimal" ? "left" : "center",
    gap: 14,
    color: "#fff",
  };

  const textStyle: React.CSSProperties =
    style.subtitle === "serif"
      ? { fontFamily: FONT_SERIF, fontSize: 50, lineHeight: 1.45, fontWeight: 500 }
      : { fontFamily: FONT_SANS, fontSize: 46, lineHeight: 1.45, fontWeight: 500 };

  const band: React.CSSProperties =
    style.subtitle === "classic" || style.subtitle === "serif"
      ? {
          background: "rgba(0,0,0,0.45)",
          padding: "22px 40px",
          borderRadius: 12,
          maxWidth: 1500,
        }
      : { textShadow: "0 2px 18px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)", maxWidth: 1400 };

  return (
    <div style={base}>
      {meta ? (
        <div
          style={{
            fontSize: 26,
            letterSpacing: 2,
            opacity: 0.9,
            fontFamily: FONT_SANS,
            textShadow: "0 1px 10px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
          }}
        >
          {meta}
        </div>
      ) : null}
      {text ? <div style={{ ...textStyle, ...band, opacity: textOpacity }}>{text}</div> : null}
    </div>
  );
};
