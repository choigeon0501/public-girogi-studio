"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { newId } from "@/lib/ids";
import { DEMO_MODE, fileToDataUrl } from "@/lib/demo";
import { splitSentences, storyText } from "@/lib/scenes";
import { MAX_PHOTOS_PER_BLOCK, PHOTO_CAPTION_MAX, type Block, type Photo } from "@/lib/types";
import type { StepProps } from "./Wizard";

/**
 * 2단계: 시기(블록)마다 **이야기 한 곳**에 적는다. 이것이 유일한 필수 입력.
 * 사진은 선택. 사진에 한 줄을 적으면 그 사진의 자막이 되고,
 * 비워 두면 시기 이야기의 문장이 순서대로 사진 위에 흐른다.
 */
export function Step2Content({ project, update }: StepProps) {
  const [openId, setOpenId] = useState<string | null>(project.blocks[0]?.id ?? null);

  function patchBlock(id: string, fn: (b: Block) => Block) {
    update((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? fn(b) : b)) }));
  }

  if (project.blocks.length === 0) {
    return <p className="text-ink-2">먼저 1단계에서 블록을 골라 주세요.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-2">
        시기마다 이야기를 적어 주세요. 질문을 누르면 그 질문에 답하듯 쓸 수 있습니다. 사진은 있으면 올리고, 없어도 괜찮습니다.
      </p>
      <MotionExample />
      {project.blocks.map((b, i) => {
        const open = openId === b.id;
        const hasText = storyText(b).trim().length > 0;
        const hasMotion = !!b.motionPhotoId && b.photos.some((p) => p.id === b.motionPhotoId);
        const status = [
          hasText ? "이야기 작성됨" : "이야기 비어 있음",
          b.photos.length ? `사진 ${b.photos.length}장` : null,
          hasMotion ? "✦ 움직이는 사진 1장" : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <section key={b.id} className={clsx("card", b.type === "moment" && "border-accent-2/60")}>
            <button className="flex w-full items-center gap-3 text-left" onClick={() => setOpenId(open ? null : b.id)}>
              <span className="w-6 text-xs text-ink-3">{i + 1}</span>
              <span className="font-medium">{b.title}</span>
              {b.approxYear && <span className="text-xs text-ink-3">{b.approxYear}</span>}
              <span className="text-xs text-ink-3">{b.type === "moment" ? "순간" : "시기"}</span>
              <span className={clsx("ml-auto text-xs", hasText ? "text-ink-3" : "text-amber-700")}>
                {status} {open ? "▴" : "▾"}
              </span>
            </button>

            {open && (
              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
                <StoryEditor block={b} onChange={(description) => patchBlock(b.id, (x) => ({ ...x, description }))} />
                <PhotoEditor
                  projectId={project.id}
                  block={b}
                  onChange={(photos) => patchBlock(b.id, (x) => ({ ...x, photos }))}
                  onMotionChange={(motionPhotoId) => patchBlock(b.id, (x) => ({ ...x, motionPhotoId }))}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** 이야기 입력. 질문을 누르면 입력칸에 "Q. 질문" 줄이 들어가 답하기 쉽게 한다 */
function StoryEditor({ block, onChange }: { block: Block; onChange: (v: string) => void }) {
  function insertPrompt(q: string) {
    const line = `${q}\n`;
    const next = block.description.trim() ? `${block.description.replace(/\s+$/, "")}\n\n${line}` : line;
    onChange(next);
  }
  const sentences = splitSentences(storyText(block));
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">이 시절의 이야기</label>
      <div className="flex flex-wrap gap-1.5">
        {block.prompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => insertPrompt(q)}
            className="rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink-2 hover:border-accent hover:text-accent"
          >
            {q}
          </button>
        ))}
      </div>
      <textarea
        className="input min-h-48"
        value={block.description}
        maxLength={2000}
        placeholder={"편하게, 말하듯이 적어 주세요.\n위 질문을 누르면 질문이 들어오고, 그 아래에 답을 쓰면 됩니다."}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-between text-xs text-ink-3">
        <span>{sentences.length > 0 ? `자막 ${sentences.length}줄로 나뉩니다` : "문장 단위로 나뉘어 자막이 됩니다"}</span>
        <span>{block.description.length}/2000</span>
      </div>
    </div>
  );
}

function PhotoEditor({
  projectId,
  block,
  onChange,
  onMotionChange,
}: {
  projectId: string;
  block: Block;
  onChange: (photos: Photo[]) => void;
  onMotionChange: (photoId: string | null) => void;
}) {
  const motionId = block.photos.some((p) => p.id === block.motionPhotoId) ? block.motionPhotoId : null;
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const photos = [...block.photos].sort((a, b) => a.order - b.order);
  const remaining = MAX_PHOTOS_PER_BLOCK - photos.length;

  // 한 줄을 비운 사진에는 이야기의 몇 번째 문장이 붙는지 미리 보여준다
  const sentences = splitSentences(storyText(block));
  let cursor = 0;
  const fallbackFor = photos.map((p) => (p.caption.trim() ? null : (sentences[cursor++] ?? null)));

  async function onFiles(files: FileList | null) {
    if (!files || remaining <= 0) return;
    setErr(null);
    setUploading(true);
    const next = [...photos];
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        if (DEMO_MODE) {
          // 데모: 서버 없이 브라우저에서 줄여 data URL로 보관
          next.push({ id: newId("ph"), src: await fileToDataUrl(file), caption: "", order: next.length });
          continue;
        }
        const fd = new FormData();
        fd.append("projectId", projectId);
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `업로드 실패 (${res.status})`);
        }
        const { src } = await res.json();
        next.push({ id: newId("ph"), src, caption: "", order: next.length });
      }
      onChange(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  function patch(id: string, fn: (p: Photo) => Photo) {
    onChange(photos.map((p) => (p.id === id ? fn(p) : p)));
  }
  function remove(id: string) {
    if (motionId === id) onMotionChange(null);
    onChange(photos.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  }
  function move(id: string, dir: -1 | 1) {
    const i = photos.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= photos.length) return;
    const arr = [...photos];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr.map((p, k) => ({ ...p, order: k })));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          사진 <span className="font-normal text-ink-3">(선택)</span>
        </label>
        <label className={clsx("btn-ghost cursor-pointer text-xs", remaining <= 0 && "pointer-events-none opacity-50")}>
          {uploading ? "올리는 중…" : remaining > 0 ? `사진 추가 (${remaining}장 더 가능)` : "최대 장수입니다"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={uploading || remaining <= 0}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {photos.length === 0 && (
        <p className="rounded-lg border border-dashed border-line p-4 text-center text-xs text-ink-3">
          사진이 없어도 됩니다. 이야기만으로 장면이 만들어집니다.
        </p>
      )}
      <ul className="space-y-2">
        {photos.map((p, i) => (
          <li
            key={p.id}
            className={clsx(
              "flex gap-2.5 rounded-lg border bg-white p-2",
              motionId === p.id ? "border-accent ring-1 ring-accent/40" : "border-line",
            )}
          >
            <div className="flex w-24 shrink-0 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="h-20 w-24 rounded object-cover" />
              <button
                type="button"
                onClick={() => onMotionChange(motionId === p.id ? null : p.id)}
                title="이 시기에서 살아 움직일 사진으로 지정 (블록당 1장)"
                className={clsx(
                  "rounded px-1 py-0.5 text-[11px] transition",
                  motionId === p.id
                    ? "bg-accent text-white"
                    : "border border-line text-ink-2 hover:border-accent hover:text-accent",
                )}
              >
                {motionId === p.id ? "✦ 움직이는 사진" : "✦ 움직이게"}
              </button>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="grid grid-cols-3 gap-1">
                <input className="input px-1.5 py-0.5 text-xs" placeholder="언제" value={p.year ?? ""} onChange={(e) => patch(p.id, (x) => ({ ...x, year: e.target.value }))} />
                <input className="input px-1.5 py-0.5 text-xs" placeholder="누구와" value={p.people ?? ""} onChange={(e) => patch(p.id, (x) => ({ ...x, people: e.target.value }))} />
                <input className="input px-1.5 py-0.5 text-xs" placeholder="어디서" value={p.place ?? ""} onChange={(e) => patch(p.id, (x) => ({ ...x, place: e.target.value }))} />
              </div>
              <input
                className="input py-1 text-xs"
                placeholder="한 줄 (비워 두셔도 됩니다)"
                value={p.caption}
                maxLength={PHOTO_CAPTION_MAX}
                onChange={(e) => patch(p.id, (x) => ({ ...x, caption: e.target.value }))}
              />
              {!p.caption.trim() && (
                <div className="truncate text-[11px] text-ink-3">
                  {fallbackFor[i] ? `자막: "${fallbackFor[i]}"` : "자막 없이 사진만 지나갑니다"}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-0.5 text-ink-3">
              <button onClick={() => move(p.id, -1)} disabled={i === 0} className="hover:text-ink disabled:opacity-30" title="앞으로">↑</button>
              <button onClick={() => move(p.id, 1)} disabled={i === photos.length - 1} className="hover:text-ink disabled:opacity-30" title="뒤로">↓</button>
              <button onClick={() => remove(p.id)} className="hover:text-red-600" title="삭제">×</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "살아 움직이는 사진" 예시 카드.
 * public/samples/motion-example.mp4 (+ .jpg 포스터)가 있으면 실제 클립을 보여주고,
 * 없으면 CSS로 흉내 낸 미세한 움직임으로 느낌만 전달한다.
 */
function MotionExample() {
  // 샘플 파일 존재 여부를 먼저 확인하고, 없으면 바로 CSS 예시를 보여준다
  const [hasClip, setHasClip] = useState(false);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch("/samples/motion-example.mp4", { method: "HEAD" })
      .then((r) => alive && setHasClip(r.ok && (r.headers.get("content-type") ?? "").startsWith("video")))
      .catch(() => alive && setHasClip(false));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section className="card border-accent-2/60 bg-[#fbf3ee]">
      <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(!open)}>
        <div>
          <span className="font-medium">✦ 살아 움직이는 사진</span>
          <span className="ml-2 text-xs text-ink-2">시기마다 사진 한 장을 고르면, 그 사진이 영상에서 살짝 움직입니다</span>
        </div>
        <span className="text-xs text-ink-3">{open ? "접기 ▴" : "예시 보기 ▾"}</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr_1.2fr]">
          <figure className="space-y-1">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#d9cdbd]">
              {hasClip ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/samples/motion-example.jpg" alt="" className="h-full w-full object-cover" onError={() => setHasClip(false)} />
              ) : (
                <SampleStill />
              )}
            </div>
            <figcaption className="text-center text-xs text-ink-3">원본 사진</figcaption>
          </figure>
          <figure className="space-y-1">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#d9cdbd]">
              {hasClip ? (
                <video
                  src="/samples/motion-example.mp4"
                  poster="/samples/motion-example.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  onError={() => setHasClip(false)}
                />
              ) : (
                <SampleStill animate />
              )}
            </div>
            <figcaption className="text-center text-xs text-ink-3">움직이는 사진 {hasClip ? "" : "(느낌 예시)"}</figcaption>
          </figure>
          <ul className="space-y-1.5 self-center text-xs text-ink-2">
            <li>· 바람에 머리카락이 날리고, 눈을 깜빡이고, 구름이 흐르듯 <b>아주 조금</b> 움직입니다</li>
            <li>· 시기(블록)마다 <b>한 장</b>만 고를 수 있습니다. 챕터가 시작될 때 그 사진이 살아납니다</li>
            <li>· 정면 얼굴이 또렷하고 흔들림 없는 사진이 가장 자연스럽습니다</li>
            <li>· 사진 카드의 <b>✦ 움직이게</b> 버튼으로 지정합니다</li>
          </ul>
        </div>
      )}
    </section>
  );
}

/** 샘플 이미지가 없을 때 쓰는 간단한 풍경 일러스트 (CSS 애니메이션으로 '살아 있는' 느낌만 전달) */
function SampleStill({ animate = false }: { animate?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <style>{`
        @keyframes gs-breathe { 0%,100% { transform: scale(1.04) translateY(0); } 50% { transform: scale(1.08) translateY(-3px); } }
        @keyframes gs-cloud { 0% { transform: translateX(0); } 100% { transform: translateX(14px); } }
        @keyframes gs-sway { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
      `}</style>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(#cfd9df 0%, #e8e1d4 55%, #a9b58c 56%, #8d9a6f 100%)",
          animation: animate ? "gs-breathe 6s ease-in-out infinite" : undefined,
        }}
      >
        <div
          className="absolute left-[12%] top-[18%] h-5 w-16 rounded-full bg-white/80"
          style={{ animation: animate ? "gs-cloud 7s ease-in-out infinite alternate" : undefined }}
        />
        <div
          className="absolute left-[55%] top-[28%] h-4 w-12 rounded-full bg-white/70"
          style={{ animation: animate ? "gs-cloud 9s ease-in-out infinite alternate-reverse" : undefined }}
        />
        <div
          className="absolute bottom-[38%] left-[30%] h-16 w-1.5 origin-bottom rounded bg-[#5a4634]"
          style={{ animation: animate ? "gs-sway 4s ease-in-out infinite" : undefined }}
        >
          <div className="absolute -left-5 -top-6 h-10 w-12 rounded-full bg-[#4f7a3a]" />
        </div>
        <div className="absolute bottom-[36%] left-[62%] h-9 w-5 rounded-t-full bg-[#7a5a48]" />
        <div className="absolute bottom-[42%] left-[63%] h-4 w-3 rounded-full bg-[#e2b89a]" />
      </div>
    </div>
  );
}
