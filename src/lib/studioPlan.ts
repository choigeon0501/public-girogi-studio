/**
 * 'AI 정리' (껍데기 버전).
 * 실제 LLM 없이, 컨셉·사진·설명으로 결정론적인 구성안을 만든다.
 * 나중에 LLM을 붙일 때 이 함수의 출력 형태(Outline)를 그대로 유지하면 화면은 손댈 게 없다.
 */
import type { Concept } from "./concepts";
import { FPS, planScenes, splitSentences, type ScenePlan } from "./scenes";
import type { StudioPhoto, StudioProject } from "./studio";
import { BGM_OPTIONS, SUBTITLE_STYLES, VOICE_OPTIONS, type Block, type Project } from "./types";

export interface OutlineChapter {
  title: string;
  photos: StudioPhoto[];
  /** 챕터 요약 한 줄 (설명에서 뽑음) */
  summary: string;
}

export interface Outline {
  title: string;
  altTitles: string[];
  mood: string;
  chapters: OutlineChapter[];
  totalSeconds: number;
  notes: string[]; // AI가 '알려주는' 메모
}

function firstSentence(text: string) {
  return splitSentences(text)[0] ?? "";
}

export function buildOutline(project: StudioProject, concept: Concept): Outline {
  const photos = project.photos;
  const n = photos.length;
  const name = project.name.trim() || concept.title;

  // 챕터 수: 사진 4장당 1개, 컨셉 틀 개수 이내, 최소 1
  const chapterCount = Math.max(1, Math.min(concept.chapters.length, Math.ceil(n / 4)));
  const per = Math.ceil(n / chapterCount);
  const chapters: OutlineChapter[] = [];
  for (let i = 0; i < chapterCount; i++) {
    const slice = photos.slice(i * per, (i + 1) * per);
    if (slice.length === 0) break;
    // 틀의 첫 챕터와 마지막 챕터는 유지하고 가운데를 비율로 매핑
    const tplIdx =
      chapterCount === 1 ? 0 : Math.round((i / (chapterCount - 1)) * (concept.chapters.length - 1));
    const withText = slice.find((p) => p.caption.trim());
    chapters.push({
      title: concept.chapters[tplIdx],
      photos: slice,
      summary: withText ? firstSentence(withText.caption) : "",
    });
  }

  const candidates = concept.titles.map((t) => t.replace("{name}", name));
  // 사용자가 고른 제목을 맨 앞으로
  const titles = project.title && candidates.includes(project.title)
    ? [project.title, ...candidates.filter((t) => t !== project.title)]
    : candidates;
  const motion = photos.filter((p) => p.motion).length;
  const empty = photos.filter((p) => !p.caption.trim()).length;

  const notes: string[] = [];
  notes.push(`${concept.title} 컨셉에 맞춰 ${chapters.length}개 장으로 나눴습니다.`);
  if (motion > 0) notes.push(`움직이는 사진 ${motion}장은 각 장의 시작이나 감정이 고조되는 자리에 배치했습니다.`);
  if (empty > 0) notes.push(`설명이 없는 사진 ${empty}장은 앞뒤 사진의 설명 흐름에 맞춰 자막 없이 짧게 지나갑니다.`);
  const bgm = BGM_OPTIONS.find((b) => b.key === project.style.bgm);
  const sub = SUBTITLE_STYLES.find((s) => s.key === project.style.subtitle);
  const voice = VOICE_OPTIONS.find((v) => v.key === project.style.voice);
  notes.push(
    `음악은 "${bgm?.label}", 자막은 "${sub?.label}"${voice && voice.key !== "none" ? `, 내레이션은 "${voice.label}"` : ""}로 ${concept.mood}.`,
  );

  const plan = toScenePlan(project, concept, chapters, titles[0]);
  return {
    title: titles[0],
    altTitles: titles.slice(1),
    mood: concept.mood,
    chapters,
    totalSeconds: Math.round(plan.totalFrames / FPS),
    notes,
  };
}

/**
 * 구성안 → 기존 Remotion 템플릿이 먹는 Project/ScenePlan.
 * (챕터 = period 블록, 사진 설명 = caption, 움직이는 사진 = motionPhotoId)
 */
export function toScenePlan(
  project: StudioProject,
  concept: Concept,
  chapters: OutlineChapter[],
  title: string,
): ScenePlan {
  const blocks: Block[] = chapters.map((ch, i) => {
    const motionPhoto = ch.photos.find((p) => p.motion);
    return {
      id: `ch_${i}`,
      catalogId: null,
      type: "period",
      title: ch.title,
      description: "",
      prompts: [],
      photos: ch.photos.map((p, order) => ({ id: p.id, src: p.src, caption: p.caption, order })),
      motionPhotoId: motionPhoto?.id ?? null,
    };
  });
  const fake: Project = {
    id: project.id,
    title,
    ownerName: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    blocks,
    style: { ...project.style, aspect: "16:9" },
    renders: [],
  };
  const plan = planScenes(fake);
  // 컨셉 팔레트는 Remotion 템플릿이 아직 모르므로 제목 카드 색은 템플릿 기본값. (추후 확장)
  void concept;
  return plan;
}
