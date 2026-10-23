import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { UPLOAD_DIR } from "@/lib/store";

type Ctx = { params: Promise<{ path: string[] }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * 업로드 사진 서빙. 저장 위치는 public/uploads/<projectId>/<file>.
 * (Next 프로덕션은 빌드 후 추가된 public 파일을 서빙하지 않으므로 라우트로 내려준다.
 *  Remotion 서버 렌더는 같은 폴더를 staticFile로 직접 읽는다.)
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { path: parts } = await params;
  if (parts.length !== 2 || !parts.every((p) => /^[a-zA-Z0-9_.-]+$/.test(p) && !p.startsWith("."))) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  const [projectId, name] = parts;
  const file = path.join(UPLOAD_DIR, projectId, name);
  try {
    const buf = await fs.readFile(file);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
