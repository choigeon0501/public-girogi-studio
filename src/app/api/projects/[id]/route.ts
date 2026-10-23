import { NextResponse } from "next/server";
import { z } from "zod";
import { getProject, saveProject } from "@/lib/store";
import { errorMessage } from "@/lib/storage";
import { MAX_PHOTOS_PER_BLOCK, PHOTO_CAPTION_MAX } from "@/lib/types";

const PhotoSchema = z.object({
  id: z.string(),
  src: z.string().startsWith("/api/files/"),
  year: z.string().optional(),
  people: z.string().optional(),
  place: z.string().optional(),
  caption: z.string().max(PHOTO_CAPTION_MAX),
  order: z.number().int(),
  motionSrc: z.string().startsWith("/api/files/").optional(),
});

const BlockSchema = z.object({
  id: z.string(),
  catalogId: z.string().nullable(),
  type: z.enum(["period", "moment"]),
  title: z.string().min(1).max(40),
  approxYear: z.string().max(20).optional(),
  description: z.string().max(2000),
  prompts: z.array(z.string()),
  photos: z.array(PhotoSchema).max(MAX_PHOTOS_PER_BLOCK),
  motionPhotoId: z.string().nullable().optional(),
});

const ProjectPatchSchema = z.object({
  title: z.string().min(1).max(60).optional(),
  ownerName: z.string().max(30).optional(),
  blocks: z.array(BlockSchema).optional(),
  style: z
    .object({
      subtitle: z.enum(["classic", "minimal", "serif"]),
      bgm: z.enum(["none", "piano", "acoustic", "strings"]),
      voice: z.enum(["none", "female-calm", "male-warm", "female-bright", "own"]).optional(),
      aspect: z.literal("16:9"),
    })
    .optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

    const parsed = ProjectPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
    }
    const saved = await saveProject({ ...project, ...parsed.data });
    return NextResponse.json(saved);
  } catch (e) {
    console.error("[projects:PUT]", e);
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
