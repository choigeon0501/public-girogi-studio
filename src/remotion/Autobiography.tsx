import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { ScenePlan } from "@/lib/scenes";
import { BGM_OPTIONS } from "@/lib/types";
import { IntroScene } from "./scenes/IntroScene";
import { ChapterTitleScene } from "./scenes/ChapterTitleScene";
import { PhotoScene } from "./scenes/PhotoScene";
import { TextScene } from "./scenes/TextScene";
import { EndingScene } from "./scenes/EndingScene";

export type AutobiographyProps = {
  plan: ScenePlan;
  /** 미리보기(Player)에서는 BGM 파일 유무를 알 수 없으므로 끌 수 있게 */
  disableAudio?: boolean;
};

export const Autobiography: React.FC<AutobiographyProps> = ({ plan, disableAudio }) => {
  const bgm = BGM_OPTIONS.find((b) => b.key === plan.style.bgm);
  // 각 장면의 시작 프레임 (누적합)
  const starts = plan.scenes.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + plan.scenes[i - 1].durationInFrames);
    return acc;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0a09", fontFamily: FONT_SANS }}>
      {!disableAudio && bgm?.file ? (
        <Audio src={staticFile(bgm.file)} volume={0.35} loop />
      ) : null}

      {plan.scenes.map((scene, i) => {
        const from = starts[i];
        const key = `${scene.kind}-${i}`;
        return (
          <Sequence key={key} from={from} durationInFrames={scene.durationInFrames} premountFor={30}>
            {scene.kind === "intro" && <IntroScene scene={scene} />}
            {scene.kind === "chapter-title" && <ChapterTitleScene scene={scene} />}
            {scene.kind === "photo" && <PhotoScene scene={scene} style={plan.style} />}
            {scene.kind === "text" && <TextScene scene={scene} style={plan.style} />}
            {scene.kind === "ending" && <EndingScene scene={scene} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const FONT_SANS =
  '"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif';
export const FONT_SERIF = '"Nanum Myeongjo", "Noto Serif KR", "Apple Myungjo", "Batang", serif';
