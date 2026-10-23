/**
 * 저장소 추상화.
 * - 로컬/서버: 파일시스템 (data/projects, public/uploads)
 * - Vercel: Vercel Blob (BLOB_READ_WRITE_TOKEN 이 있으면 자동 선택)
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
  /** fs: 파일 내용 / blob: 공개 URL (리다이렉트용) */
  getFile(key: string): Promise<{ buffer: Buffer; contentType: string } | { url: string } | null>;
}

const ROOT = process.cwd();
const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4" };

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
      const buffer = await fs.readFile(p);
      return { buffer, contentType: MIME[path.extname(p).toLowerCase()] ?? "application/octet-stream" };
    } catch {
      return null;
    }
  },
};

async function blobStorage(): Promise<Storage> {
  const { put, head, list } = await import("@vercel/blob");
  // 덮어쓴 blob은 CDN에 잠시 캐시될 수 있어 읽을 때 쿼리로 캐시를 우회한다
  const fresh = (url: string) => `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  async function urlOf(key: string): Promise<string | null> {
    try {
      return (await head(key)).url;
    } catch {
      return null;
    }
  }
  return {
    kind: "blob",
    async getJson(key) {
      const url = await urlOf(key);
      if (!url) return null;
      const r = await fetch(fresh(url), { cache: "no-store" });
      return r.ok ? r.json() : null;
    },
    async putJson(key, value) {
      await put(key, JSON.stringify(value), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
    },
    async listJson(prefix) {
      const { blobs } = await list({ prefix, limit: 500 });
      const out = await Promise.all(
        blobs
          .filter((b) => b.pathname.endsWith(".json"))
          .map(async (b) => {
            const r = await fetch(fresh(b.url), { cache: "no-store" });
            return r.ok ? r.json() : null;
          }),
      );
      return out.filter(Boolean);
    },
    async putFile(key, body, contentType) {
      await put(key, body, { access: "public", contentType, addRandomSuffix: false, allowOverwrite: true });
    },
    async getFile(key) {
      const url = await urlOf(key);
      return url ? { url } : null;
    },
  };
}

let instance: Promise<Storage> | null = null;
export function getStorage(): Promise<Storage> {
  if (!instance) {
    instance = process.env.BLOB_READ_WRITE_TOKEN ? blobStorage() : Promise.resolve(fsStorage);
  }
  return instance;
}

/** 서버 MP4 렌더 가능 여부 (Vercel 서버리스에서는 불가) */
export const RENDER_ENABLED = !process.env.VERCEL && process.env.RENDER_DISABLED !== "1";
