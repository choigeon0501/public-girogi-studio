/**
 * 저장소 추상화.
 * - 로컬/서버: 파일시스템 (data/projects, public/uploads)
 * - Vercel: Vercel Blob (BLOB_READ_WRITE_TOKEN 이 있으면 자동 선택)
 *   공개(public)·비공개(private) 스토어 모두 지원. 처음 쓰기에서 스토어 종류를 감지한다.
 *   파일은 항상 /api/files 라우트를 거쳐 내려주므로 비공개 스토어여도 화면에서 보인다.
 *
 * 키 규칙
 *   projects/<id>.json
 *   uploads/<projectId>/<file>
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export interface Storage {
  readonly kind: "fs" | "blob";
  getJson<T>(key: string): Promise<T | null>;
  putJson(key: string, value: unknown): Promise<void>;
  listJson<T>(prefix: string): Promise<T[]>;
  putFile(key: string, body: Buffer, contentType: string): Promise<void>;
  getFile(key: string): Promise<{ buffer: Buffer; contentType: string } | null>;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "저장소가 설정되지 않았습니다. Vercel 프로젝트 → Storage → Blob 스토어를 만들어 연결한 뒤 Redeploy 하세요. (BLOB_READ_WRITE_TOKEN 없음)",
    );
  }
}

const ROOT = process.cwd();
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".json": "application/json",
};
const mimeOf = (p: string) => MIME[path.extname(p).toLowerCase()] ?? "application/octet-stream";

function keyToFsPath(key: string) {
  if (key.startsWith("projects/")) return path.join(ROOT, "data", key);
  if (key.startsWith("uploads/")) return path.join(ROOT, "public", key);
  throw new Error(`unknown storage key: ${key}`);
}

const fsStorage: Storage = {
  kind: "fs",
  async getJson(key) {
    try {
      return JSON.parse(await fs.readFile(keyToFsPath(key), "utf8"));
    } catch {
      return null;
    }
  },
  async putJson(key, value) {
    const p = keyToFsPath(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(value, null, 2), "utf8");
  },
  async listJson(prefix) {
    const dir = keyToFsPath(prefix.endsWith("/") ? prefix : prefix + "/");
    try {
      const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
      return Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8"))));
    } catch {
      return [];
    }
  },
  async putFile(key, body) {
    const p = keyToFsPath(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, body);
  },
  async getFile(key) {
    try {
      const p = keyToFsPath(key);
      return { buffer: await fs.readFile(p), contentType: mimeOf(p) };
    } catch {
      return null;
    }
  },
};

type Access = "public" | "private";

async function blobStorage(): Promise<Storage> {
  const blob = await import("@vercel/blob");

  // 스토어 종류: 환경변수로 지정하거나, 첫 쓰기에서 감지
  let access: Access | null =
    process.env.BLOB_ACCESS === "public" || process.env.BLOB_ACCESS === "private" ? process.env.BLOB_ACCESS : null;

  async function put(key: string, body: string | Buffer, contentType: string) {
    const opts = { contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 };
    if (access) {
      await blob.put(key, body, { ...opts, access });
      return;
    }
    // 비공개 먼저 시도 → 공개 스토어면 공개로 재시도
    try {
      await blob.put(key, body, { ...opts, access: "private" });
      access = "private";
    } catch (e) {
      try {
        await blob.put(key, body, { ...opts, access: "public" });
        access = "public";
      } catch {
        throw e;
      }
    }
  }

  async function read(key: string): Promise<Buffer | null> {
    const tryAccess: Access[] = access ? [access] : ["private", "public"];
    for (const a of tryAccess) {
      try {
        const res = await blob.get(key, { access: a, useCache: false });
        if (!res || res.statusCode !== 200) return null;
        access = a;
        return Buffer.from(await new Response(res.stream).arrayBuffer());
      } catch {
        // 다른 access로 재시도
      }
    }
    return null;
  }

  async function getJson<T>(key: string): Promise<T | null> {
    const buf = await read(key);
    return buf ? (JSON.parse(buf.toString("utf8")) as T) : null;
  }

  return {
    kind: "blob",
    getJson,
    async putJson(key, value) {
      await put(key, JSON.stringify(value), "application/json");
    },
    async listJson(prefix) {
      const { blobs } = await blob.list({ prefix, limit: 500 });
      const out = await Promise.all(
        blobs.filter((b) => b.pathname.endsWith(".json")).map((b) => getJson<never>(b.pathname)),
      );
      return out.filter((x): x is never => x !== null);
    },
    async putFile(key, body, contentType) {
      await put(key, body, contentType);
    },
    async getFile(key) {
      const buf = await read(key);
      return buf ? { buffer: buf, contentType: mimeOf(key) } : null;
    },
  };
}

let instance: Promise<Storage> | null = null;
export function getStorage(): Promise<Storage> {
  if (!instance) {
    if (process.env.BLOB_READ_WRITE_TOKEN) instance = blobStorage();
    else if (process.env.VERCEL) return Promise.reject(new StorageNotConfiguredError());
    else instance = Promise.resolve(fsStorage);
  }
  return instance;
}

/** 서버 MP4 렌더 가능 여부 (Vercel 서버리스에서는 불가) */
export const RENDER_ENABLED = !process.env.VERCEL && process.env.RENDER_DISABLED !== "1";

/** API 라우트 공통 에러 응답 */
export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
