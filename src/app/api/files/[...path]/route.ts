import { NextResponse } from "next/server";
import { readUpload } from "@/lib/store";

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * 업로드 사진 서빙.
 * - 파일 저장소: 내용을 그대로 내려준다
 * - Vercel Blob: 공개 URL로 리다이렉트
 * (Next 프로덕션은 빌드 후 추가된 public 파일을 서빙하지 않으므로 라우트로 처리한다)
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { path: parts } = await params;
  if (parts.length !== 2 || !parts.every((p) => /^[a-zA-Z0-9_.-]+$/.test(p) && !p.startsWith("."))) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  const [projectId, name] = parts;
  const file = await readUpload(projectId, name);
  if (!file) return NextResponse.json({ error: "not found" }, { status: 404 });
  if ("url" in file) return NextResponse.redirect(file.url, 302);
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "private, max-age=3600" },
  });
}
