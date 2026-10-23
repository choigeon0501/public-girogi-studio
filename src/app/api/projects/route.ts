import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/store";
import { errorMessage } from "@/lib/storage";

export async function GET() {
  try {
    return NextResponse.json(await listProjects());
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { title?: string; ownerName?: string };
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error("[projects:POST]", e);
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
