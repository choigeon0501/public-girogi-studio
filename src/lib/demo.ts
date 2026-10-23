"use client";

/**
 * 데모 모드: 서버 저장소 없이 브라우저(localStorage)에만 저장한다.
 * - Vercel에 Blob 토큰 없이 올렸을 때 자동으로 켜진다 (next.config 참고)
 * - 사진은 브라우저에서 줄여(긴 변 1280px, JPEG) data URL로 저장한다
 * - 보는 사람의 브라우저에만 남고, 다른 기기/브라우저와 공유되지 않는다
 */
import type { Project } from "./types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

const KEY = (id: string) => `girogi:project:${id}`;
const INDEX = "girogi:projects";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * localStorage 변경을 React에 알리기 위한 구독.
 * useSyncExternalStore와 함께 쓴다 (서버 렌더 시에는 snapshot이 undefined → "불러오는 중").
 */
const listeners = new Set<() => void>();
export function demoSubscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function notify() {
  listeners.forEach((cb) => cb());
}
/** 스냅샷: 원본 문자열을 그대로 돌려줘 참조 비교가 안정적이도록 */
export function demoRawIndex(): string {
  return safeGet(INDEX) ?? "[]";
}
export function demoRawProject(id: string): string | null {
  return safeGet(KEY(id));
}

export function demoList(): Project[] {
  const ids: string[] = JSON.parse(safeGet(INDEX) ?? "[]");
  return ids
    .map((id) => demoGet(id))
    .filter((p): p is Project => !!p)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function demoGet(id: string): Project | null {
  const raw = safeGet(KEY(id));
  return raw ? (JSON.parse(raw) as Project) : null;
}

/** 저장. 용량 초과 시 에러를 던진다 (localStorage는 보통 5MB 내외) */
export function demoSave(project: Project): Project {
  const next = { ...project, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY(project.id), JSON.stringify(next));
    const ids: string[] = JSON.parse(safeGet(INDEX) ?? "[]");
    if (!ids.includes(project.id)) window.localStorage.setItem(INDEX, JSON.stringify([project.id, ...ids]));
    notify();
  } catch {
    throw new Error("브라우저 저장 공간이 가득 찼습니다. 데모에서는 사진 수를 줄이거나 이전 자서전을 지워 주세요.");
  }
  return next;
}

export function demoDelete(id: string) {
  try {
    window.localStorage.removeItem(KEY(id));
    const ids: string[] = JSON.parse(safeGet(INDEX) ?? "[]");
    window.localStorage.setItem(INDEX, JSON.stringify(ids.filter((x) => x !== id)));
    notify();
  } catch {
    /* noop */
  }
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
