import { NextResponse } from "next/server";
import { RENDER_ENABLED } from "@/lib/storage";

// Vercel Hobby 상한이 300초. (Vercel에서는 렌더 자체가 비활성)
export const maxDuration = 300;

/** 1차: 동기 렌더. 수 분 걸릴 수 있다. 2차에서 큐로 이전. Vercel 서버리스에서는 비활성. */
export async function POST(req: Request) {
  if (!RENDER_ENABLED) {
    return NextResponse.json(
      { error: "이 서버에서는 MP4 렌더를 지원하지 않습니다. 로컬에서 `npm run render -- <projectId>` 를 실행하세요." },
      { status: 501 },
    );
  }
  const { projectId } = (await req.json().catch(() => ({}))) as { projectId?: string };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  try {
    const { renderProject } = await import("@/lib/render");
    const record = await renderProject(projectId);
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
