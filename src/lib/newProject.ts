import { CATALOG } from "./catalog";
import { newId } from "./ids";
import { DEFAULT_STYLE, type Block, type Project } from "./types";

/** 기본 켜짐 블록으로 채운 새 프로젝트 객체 (서버·브라우저 공용, 저장은 하지 않음) */
export function buildNewProject(input: { title?: string; ownerName?: string }): Project {
  const now = new Date().toISOString();
  const blocks: Block[] = CATALOG.filter((c) => c.defaultOn)
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      id: newId("blk"),
      catalogId: c.id,
      type: c.type,
      title: c.title,
      description: "",
      prompts: c.prompts,
      photos: [],
    }));

  return {
    id: newId("prj"),
    title: input.title?.trim() || "나의 이야기",
    ownerName: input.ownerName?.trim() || "",
    createdAt: now,
    updatedAt: now,
    blocks,
    style: { ...DEFAULT_STYLE },
    renders: [],
  };
}
