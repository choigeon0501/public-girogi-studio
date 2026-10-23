"use client";

/**
 * 스튜디오 상태 (껍데기 버전).
 * DB·서버 없이 브라우저 localStorage에 프로젝트 하나를 둔다.
 */
import { useMemo, useSyncExternalStore } from "react";
import { findConcept } from "./concepts";
import { newId } from "./ids";
import type { BgmKey, SubtitleStyle, VoiceKey } from "./types";

export const MAX_PHOTOS = 30;
export const MAX_MOTION = 5;
export const CAPTION_MAX = 300;

export interface StudioPhoto {
  id: string;
  src: string; // data URL (브라우저에서 줄인 JPEG)
  caption: string;
  motion: boolean;
}

export interface StudioProject {
  id: string;
  conceptId: string | null;
  /** 주인공·행사 이름. 제목 후보에 들어간다 */
  name: string;
  /** 사용자가 고른 제목 (없으면 AI 정리의 첫 후보) */
  title?: string;
  photos: StudioPhoto[];
  style: { subtitle: SubtitleStyle; bgm: BgmKey; voice: VoiceKey };
  /** 'AI 정리' 결과를 사용자가 확인했는지 */
  reviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

const KEY = "girogi:studio";

export function emptyProject(): StudioProject {
  const now = new Date().toISOString();
  return {
    id: newId("st"),
    conceptId: null,
    name: "",
    photos: [],
    style: { subtitle: "classic", bgm: "piano", voice: "none" },
    reviewed: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ── 저장소 ──
const listeners = new Set<() => void>();
function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function saveStudio(next: StudioProject) {
  const value = { ...next, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    throw new Error("브라우저 저장 공간이 가득 찼습니다. 사진 수를 줄여 주세요. (체험판은 브라우저에만 저장됩니다)");
  }
  listeners.forEach((cb) => cb());
  return value;
}

export function resetStudio() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
  listeners.forEach((cb) => cb());
}

/**
 * 스튜디오 프로젝트 훅.
 * project === undefined : 아직 브라우저에서 읽기 전 (SSR/하이드레이션)
 */
export function useStudio() {
  const raw = useSyncExternalStore(subscribe, read, () => undefined);
  const project = useMemo<StudioProject | null | undefined>(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StudioProject;
    } catch {
      return null;
    }
  }, [raw]);

  const concept = findConcept(project?.conceptId);

  function update(fn: (p: StudioProject) => StudioProject) {
    const base = project ?? emptyProject();
    return saveStudio(fn(base));
  }

  return { project, concept, update, loaded: raw !== undefined };
}

/** 이미지 파일을 긴 변 maxSide px JPEG data URL로 줄인다 */
export async function fileToDataUrl(file: File, maxSide = 1280, quality = 0.8): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("이미지를 읽을 수 없습니다"));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
