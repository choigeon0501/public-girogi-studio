import { promises as fs } from "node:fs";
import path from "node:path";
import { CATALOG } from "./catalog";
import { newId } from "./ids";
import { DEFAULT_STYLE, type Block, type Project } from "./types";

const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data", "projects");
export const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
export const OUT_DIR = path.join(ROOT, "out");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function filePath(id: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("invalid project id");
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listProjects(): Promise<Project[]> {
  await ensureDir(DATA_DIR);
  const files = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith(".json"));
  const projects = await Promise.all(
    files.map(async (f) => JSON.parse(await fs.readFile(path.join(DATA_DIR, f), "utf8")) as Project),
  );
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    return JSON.parse(await fs.readFile(filePath(id), "utf8")) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<Project> {
  await ensureDir(DATA_DIR);
  const next = { ...project, updatedAt: new Date().toISOString() };
  await fs.writeFile(filePath(project.id), JSON.stringify(next, null, 2), "utf8");
  return next;
}

/** 기본 켜짐 블록으로 채운 새 프로젝트 */
export async function createProject(input: { title?: string; ownerName?: string }): Promise<Project> {
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

  const project: Project = {
    id: newId("prj"),
    title: input.title?.trim() || "나의 이야기",
    ownerName: input.ownerName?.trim() || "",
    createdAt: now,
    updatedAt: now,
    blocks,
    style: { ...DEFAULT_STYLE },
    renders: [],
  };
  return saveProject(project);
}

export async function uploadDirFor(projectId: string) {
  const dir = path.join(UPLOAD_DIR, projectId);
  await ensureDir(dir);
  return dir;
}
