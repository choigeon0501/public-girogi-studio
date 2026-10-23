import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { OUT_DIR } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

/** out/ 폴더의 mp4 내려주기. id = "<projectId>_<renderId>" */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const file = path.join(OUT_DIR, `${id}.mp4`);
  try {
    const buf = await fs.readFile(file);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${id}.mp4"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
