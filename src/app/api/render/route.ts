import { NextResponse } from "next/server";
import { renderProject } from "@/lib/render";

export const maxDuration = 600;

/** 1차: 동기 렌더. 수 분 걸릴 수 있다. 2차에서 큐로 이전. */
export async function POST(req: Request) {
  const { projectId } = (await req.json().catch(() => ({}))) as { projectId?: string };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  try {
    const record = await renderProject(projectId);
    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
