/**
 * Project → Scene[] 변환.
 * 구성안 화면(3단계)과 Remotion 템플릿이 **같은 함수**를 쓴다.
 * 화면에서 본 순서·문구가 영상과 어긋나지 않게 하기 위한 단일 소스.
 */
import type { BlockType, Project, StyleOptions } from "./types";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Scene =
  | { kind: "intro"; title: string; ownerName: string; durationInFrames: number }
  | {
      kind: "chapter-title";
      blockId: string;
      blockType: BlockType;
      title: string;
      approxYear?: string;
      index: number;
      durationInFrames: number;
    }
  | {
      kind: "photo";
      blockId: string;
      blockType: BlockType;
      src: string;
      /** 사진 위에 순서대로 바뀌며 보여줄 자막. 각 항목이 같은 길이로 나뉘어 표시된다 */
      subtitles: string[];
      meta: string; // "1988 · 어머니와 · 부산" 같은 한 줄
      /** 블록에서 "살아 움직이는 사진"으로 지정됨 */
      motion: boolean;
      /** AI로 만든 짧은 클립 (있으면 사진 대신 재생) */
      motionSrc?: string;
      durationInFrames: number;
    }
  | {
      kind: "text";
      blockId: string;
      blockType: BlockType;
      text: string;
      durationInFrames: number;
    }
  | { kind: "ending"; text: string; durationInFrames: number };

export interface ScenePlan {
  scenes: Scene[];
  totalFrames: number;
  style: StyleOptions;
}

const sec = (s: number) => Math.round(s * FPS);

/** 글자 수에 따라 4~8초 */
function readingDuration(text: string, type: BlockType) {
  const len = text.replace(/\s/g, "").length;
  const base = type === "moment" ? 5 : 4;
  const extra = Math.min(4, Math.ceil(len / 30));
  return sec(base + extra);
}

/**
 * 글을 자막 단위로 쪼갠다.
 * - 빈 줄(문단)은 항상 경계 — 서로 다른 질문의 답이 한 자막으로 합쳐지지 않게
 * - 문단 안에서는 문장 단위로 나누되 60자 내외로 묶는다
 */
export function splitSentences(text: string, maxLen = 60): string[] {
  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const para of paragraphs) {
    const parts = para
      .split(/(?<=[.!?。！？])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    let buf = "";
    for (const p of parts) {
      if ((buf + " " + p).trim().length > maxLen && buf) {
        out.push(buf);
        buf = p;
      } else {
        buf = (buf + " " + p).trim();
      }
    }
    if (buf) out.push(buf);
  }
  return out;
}

/**
 * 이야기 입력칸에 들어간 가이드 질문 줄은 자막에서 뺀다.
 * (2단계에서 질문을 누르면 "질문\n" 형태로 삽입된다)
 */
export function storyText(block: { description: string; prompts: string[] }): string {
  const prompts = new Set(block.prompts.map((q) => q.trim()));
  return block.description
    .split("\n")
    .filter((line) => !prompts.has(line.trim().replace(/^Q\.\s*/, "")))
    .join("\n");
}

export function buildMeta(p: { year?: string; people?: string; place?: string }) {
  return [p.year, p.people, p.place].filter((v) => v && v.trim()).join(" · ");
}

export function planScenes(project: Project): ScenePlan {
  const scenes: Scene[] = [];

  scenes.push({
    kind: "intro",
    title: project.title,
    ownerName: project.ownerName,
    durationInFrames: sec(3.5),
  });

  project.blocks.forEach((block, index) => {
    const story = storyText(block);
    const hasContent = story.trim() || block.photos.length > 0;
    if (!hasContent) return;

    scenes.push({
      kind: "chapter-title",
      blockId: block.id,
      blockType: block.type,
      title: block.title,
      approxYear: block.approxYear,
      index,
      durationInFrames: sec(block.type === "moment" ? 3 : 2.5),
    });

    const photos = [...block.photos].sort((a, b) => a.order - b.order);
    const descSentences = splitSentences(story);

    if (photos.length === 0) {
      // 사진이 없으면 설명만 텍스트 장면으로
      for (const t of descSentences) {
        scenes.push({
          kind: "text",
          blockId: block.id,
          blockType: block.type,
          text: t,
          durationInFrames: readingDuration(t, block.type),
        });
      }
      return;
    }

    // 사진이 있으면: 사진마다 적은 설명을 문장 단위로 나눠 그 사진 위에 순서대로 보여준다.
    // 설명이 없는 사진은 블록 설명(있다면)의 문장을 하나 가져다 쓴다.
    let descCursor = 0;
    photos.forEach((photo) => {
      let subtitles = splitSentences(photo.caption);
      if (subtitles.length === 0 && descCursor < descSentences.length) {
        subtitles = [descSentences[descCursor++]];
      }
      const motion = block.motionPhotoId === photo.id;
      let durationInFrames =
        subtitles.length === 0
          ? sec(block.type === "moment" ? 5 : 4)
          : subtitles.reduce((a, t) => a + readingDuration(t, block.type), 0);
      // 움직이는 사진은 최소 6초는 머물러야 움직임이 보인다
      if (motion) durationInFrames = Math.max(durationInFrames, sec(6));
      scenes.push({
        kind: "photo",
        blockId: block.id,
        blockType: block.type,
        src: photo.src,
        subtitles,
        meta: buildMeta(photo),
        motion,
        motionSrc: motion ? photo.motionSrc : undefined,
        durationInFrames,
      });
    });

    // 블록 설명이 남았으면 텍스트 장면으로
    for (; descCursor < descSentences.length; descCursor++) {
      const t = descSentences[descCursor];
      scenes.push({
        kind: "text",
        blockId: block.id,
        blockType: block.type,
        text: t,
        durationInFrames: readingDuration(t, block.type),
      });
    }
  });

  const legacy = project.blocks.find((b) => b.catalogId === "legacy" && storyText(b).trim());
  scenes.push({
    kind: "ending",
    text: legacy ? "" : `${project.ownerName || "나"}의 이야기는 계속됩니다.`,
    durationInFrames: sec(4),
  });

  const totalFrames = scenes.reduce((a, s) => a + s.durationInFrames, 0);
  return { scenes, totalFrames, style: project.style };
}

export function formatDuration(frames: number) {
  const s = Math.round(frames / FPS);
  const m = Math.floor(s / 60);
  return `${m}분 ${String(s % 60).padStart(2, "0")}초`;
}
