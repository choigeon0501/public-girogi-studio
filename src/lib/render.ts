import path from "node:path";
import { promises as fs } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { planScenes } from "./scenes";
import { OUT_DIR, getProject, saveProject } from "./store";
import { newId } from "./ids";
import type { RenderRecord } from "./types";

const ENTRY = path.join(process.cwd(), "src", "remotion", "index.ts");
const COMPOSITION_ID = "Autobiography";

/**
 * 기본은 Remotion이 헤드리스 Chrome을 자동 다운로드.
 * 외부 다운로드가 막힌 서버에서는 설치된 Chrome 경로를 지정한다.
 *   REMOTION_BROWSER_EXECUTABLE=/usr/bin/google-chrome
 */
const browserOptions = process.env.REMOTION_BROWSER_EXECUTABLE
  ? { browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE, chromeMode: "chrome-for-testing" as const }
  : {};

let bundlePromise: Promise<string> | null = null;

/** 번들은 프로세스당 한 번만 */
function getBundle() {
  if (!bundlePromise) {
    bundlePromise = bundle({
      entryPoint: ENTRY,
      publicDir: path.join(process.cwd(), "public"),
      webpackOverride: (c) => ({
        ...c,
        resolve: {
          ...c.resolve,
          alias: { ...(c.resolve?.alias ?? {}), "@": path.join(process.cwd(), "src") },
        },
      }),
    });
  }
  return bundlePromise;
}

export async function renderProject(
  projectId: string,
  onProgress?: (p: number) => void,
): Promise<RenderRecord> {
  const project = await getProject(projectId);
  if (!project) throw new Error(`project not found: ${projectId}`);

  const plan = planScenes(project);
  // BGM 파일이 없으면 무음으로
  const bgmFile = plan.style.bgm === "none" ? null : path.join(process.cwd(), "public", "bgm", `${plan.style.bgm}.mp3`);
  if (bgmFile) {
    try {
      await fs.access(bgmFile);
    } catch {
      plan.style = { ...plan.style, bgm: "none" };
    }
  }

  const serveUrl = await getBundle();
  const inputProps = { plan };
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps, ...browserOptions });

  await fs.mkdir(OUT_DIR, { recursive: true });
  const renderId = newId("rnd");
  const outputLocation = path.join(OUT_DIR, `${projectId}_${renderId}.mp4`);

  const record: RenderRecord = { id: renderId, createdAt: new Date().toISOString(), status: "done" };
  try {
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
      inputProps,
      onProgress: ({ progress }) => onProgress?.(progress),
      ...browserOptions,
    });
    record.outputPath = path.relative(process.cwd(), outputLocation);
  } catch (e) {
    record.status = "failed";
    record.error = e instanceof Error ? e.message : String(e);
  }

  project.renders.unshift(record);
  await saveProject(project);
  if (record.status === "failed") throw new Error(record.error);
  return record;
}
