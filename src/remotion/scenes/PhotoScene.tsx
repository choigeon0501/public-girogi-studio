import React from "react";
import {
  AbsoluteFill,
  Img,
  Loop,
  OffthreadVideo,
  getRemotionEnvironment,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Scene } from "@/lib/scenes";
import type { StyleOptions } from "@/lib/types";
import { Fade, Subtitle } from "./common";

const API_FILES = "/api/files/";

export function resolvePhotoSrc(src: string): string {
  if (getRemotionEnvironment().isRendering && src.startsWith(API_FILES)) {
    return staticFile(`uploads/${src.slice(API_FILES.length)}`);
  }
  return src;
}

/**
 * 사진 장면.
 * - 기본: 켄번스 (시기 블록은 완만한 줌인+팬, 순간 블록은 더 느린 줌인)
 * - motion 지정 + motionSrc(AI 클립) 있음: 클립을 재생 (2차)
 * - motion 지정 + 클립 없음: 사진이 숨 쉬듯 살짝 흔들리는 '살아 있는' 느낌의 임시 움직임
 */
export const PhotoScene: React.FC<{ scene: Extract<Scene, { kind: "photo" }>; style: StyleOptions }> = ({
  scene,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const isMoment = scene.blockType === "moment";
  const src = resolvePhotoSrc(scene.src);

  // 자막 여러 줄이면 장면 길이를 균등 분할해 순서대로 보여준다
  const n = scene.subtitles.length;
  const slot = n > 0 ? durationInFrames / n : durationInFrames;
  const idx = n > 0 ? Math.min(n - 1, Math.floor(frame / slot)) : -1;
  const subtitle = idx >= 0 ? scene.subtitles[idx] : "";
  const local = frame - idx * slot;
  const subOpacity =
    n > 1 ? interpolate(local, [0, 8, slot - 8, slot], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  // ── 움직임 ──
  let transform: string;
  if (scene.motion) {
    // 임시 '살아 있는' 움직임: 느린 줌 + 아주 작은 호흡(상하) + 미세한 기울기
    const t = frame / fps;
    const scale = interpolate(frame, [0, durationInFrames], [1.04, 1.12], { extrapolateRight: "clamp" });
    const breathe = Math.sin(t * 0.9) * 6;
    const sway = Math.sin(t * 0.5) * 0.35;
    transform = `scale(${scale}) translateY(${breathe}px) rotate(${sway}deg)`;
  } else {
    const scale = interpolate(frame, [0, durationInFrames], isMoment ? [1.02, 1.1] : [1.0, 1.14], {
      extrapolateRight: "clamp",
    });
    const panX = interpolate(frame, [0, durationInFrames], [0, isMoment ? 0 : -18], { extrapolateRight: "clamp" });
    transform = `scale(${scale}) translateX(${panX}px)`;
  }

  const frameStyle: React.CSSProperties = {
    maxWidth: "88%",
    maxHeight: "86%",
    objectFit: "contain",
    transform,
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    borderRadius: 6,
  };

  return (
    <Fade>
      <AbsoluteFill style={{ background: "#0b0a09", overflow: "hidden" }}>
        {/* 흐린 배경으로 레터박스 채우기 */}
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(40px) brightness(0.45)",
            transform: "scale(1.2)",
          }}
        />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          {scene.motion && scene.motionSrc ? (
            // AI 클립은 보통 5초. 장면 길이만큼 반복 재생
            <Loop durationInFrames={5 * fps}>
              <OffthreadVideo src={resolvePhotoSrc(scene.motionSrc)} muted style={frameStyle} />
            </Loop>
          ) : (
            <Img src={src} style={frameStyle} />
          )}
        </AbsoluteFill>
        <Subtitle text={subtitle} meta={scene.meta} style={style} textOpacity={subOpacity} />
      </AbsoluteFill>
    </Fade>
  );
};
