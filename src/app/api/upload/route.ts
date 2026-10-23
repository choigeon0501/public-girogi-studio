import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/store";
import { newId } from "@/lib/ids";
import { errorMessage } from "@/lib/storage";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const projectId = String(form.get("projectId") ?? "");
  const file = form.get("file");

  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json({ error: "invalid projectId" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "jpg/png/webp만 가능합니다" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "20MB 이하만 가능합니다" }, { status: 413 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${newId("ph")}.${ext}`;
  try {
    const src = await saveUpload(projectId, name, Buffer.from(await file.arrayBuffer()), file.type);
    return NextResponse.json({ src }, { status: 201 });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
