import path from "node:path";
import { getStorage } from "./storage";
import { buildNewProject } from "./newProject";
import type { Project } from "./types";

const ROOT = process.cwd();
export const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
export const OUT_DIR = path.join(ROOT, "out");

function assertId(id: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("invalid project id");
}

export async function listProjects(): Promise<Project[]> {
  const s = await getStorage();
  const projects = await s.listJson<Project>("projects/");
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  assertId(id);
  const s = await getStorage();
  return s.getJson<Project>(`projects/${id}.json`);
}

export async function saveProject(project: Project): Promise<Project> {
  assertId(project.id);
  const s = await getStorage();
  const next = { ...project, updatedAt: new Date().toISOString() };
  await s.putJson(`projects/${project.id}.json`, next);
  return next;
}

/** 기본 켜짐 블록으로 채운 새 프로젝트 */
export async function createProject(input: { title?: string; ownerName?: string }): Promise<Project> {
  return saveProject(buildNewProject(input));
}

/** 업로드 사진 저장. 반환값은 웹에서 쓰는 src (/api/files/...) */
export async function saveUpload(projectId: string, name: string, body: Buffer, contentType: string) {
  assertId(projectId);
  const s = await getStorage();
  await s.putFile(`uploads/${projectId}/${name}`, body, contentType);
  return `/api/files/${projectId}/${name}`;
}

export async function readUpload(projectId: string, name: string) {
  assertId(projectId);
  const s = await getStorage();
  return s.getFile(`uploads/${projectId}/${name}`);
}
