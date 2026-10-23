import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { uploadDirFor } from "@/lib/store";
import { newId } from "@/lib/ids";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const projectId = String(form.get("projectId") ?? "");
  const file = form.get("file");

  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json({ error: "invalid projectId" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "unsupported type" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too large" }, { status: 413 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${newId("ph")}.${ext}`;
  const dir = await uploadDirFor(projectId);
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ src: `/api/files/${projectId}/${name}` }, { status: 201 });
}
