"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { newId } from "@/lib/ids";
import {
  CAPTION_MAX,
  MAX_MOTION,
  MAX_PHOTOS,
  fileToDataUrl,
  useStudio,
  type StudioPhoto,
} from "@/lib/studio";
import { StepFooter } from "./StudioShell";
import { MotionIntroModal, hasSeenMotionIntro, markMotionIntroSeen } from "./MotionIntroModal";

export function PhotosStep() {
  const { project, concept, update, loaded } = useStudio();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** 첫 '움직이게' 클릭 시 안내 팝업. pendingId = 확인 후 적용할 사진 */
  const [intro, setIntro] = useState<{ pendingId: string | null } | null>(null);

  if (!loaded) return <p className="text-sm text-ink-3">불러오는 중…</p>;
  if (!concept) {
    return (
      <div className="card max-w-xl">
        먼저 컨셉을 골라 주세요.
        <StepFooter back="/" />
      </div>
    );
  }

  const photos = project?.photos ?? [];
  const remaining = MAX_PHOTOS - photos.length;
  const motionCount = photos.filter((p) => p.motion).length;

  async function onFiles(files: FileList | null) {
    if (!files || remaining <= 0) return;
    setErr(null);
    setUploading(true);
    try {
      const added: StudioPhoto[] = [];
      for (const f of Array.from(files).slice(0, remaining)) {
        if (!f.type.startsWith("image/")) continue;
        added.push({ id: newId("ph"), src: await fileToDataUrl(f), caption: "", motion: false });
      }
      update((p) => ({ ...p, photos: [...p.photos, ...added], reviewed: false }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "사진을 올리지 못했습니다");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function patch(id: string, fn: (p: StudioPhoto) => StudioPhoto) {
    update((p) => ({ ...p, photos: p.photos.map((x) => (x.id === id ? fn(x) : x)), reviewed: false }));
  }
  function remove(id: string) {
    update((p) => ({ ...p, photos: p.photos.filter((x) => x.id !== id), reviewed: false }));
  }
  function toggleMotion(id: string) {
    const target = photos.find((p) => p.id === id);
    if (!target) return;
    if (!target.motion && motionCount >= MAX_MOTION) {
      setErr(`움직이는 사진은 최대 ${MAX_MOTION}장까지 고를 수 있어요.`);
      return;
    }
    setErr(null);
    // 처음 켤 때 한 번만 설명 팝업 → 확인하면 적용
    if (!target.motion && !hasSeenMotionIntro()) {
      setIntro({ pendingId: id });
      return;
    }
    patch(id, (p) => ({ ...p, motion: !p.motion }));
  }
  function confirmIntro() {
    markMotionIntroSeen();
    const id = intro?.pendingId;
    setIntro(null);
    if (id) patch(id, (p) => ({ ...p, motion: true }));
  }
  function reorder(id: string, toIndex: number) {
    update((p) => {
      const from = p.photos.findIndex((x) => x.id === id);
      if (from < 0) return p;
      const arr = [...p.photos];
      const [item] = arr.splice(from, 1);
      arr.splice(toIndex > from ? toIndex - 1 : toIndex, 0, item);
      return { ...p, photos: arr, reviewed: false };
    });
  }
  function onDragOverItem(e: React.DragEvent<HTMLLIElement>, index: number) {
    if (!dragId) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropIndex(e.clientY < rect.top + rect.height / 2 ? index : index + 1);
  }
  function onDrop() {
    if (dragId && dropIndex !== null) reorder(dragId, dropIndex);
    setDragId(null);
    setDropIndex(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">사진을 올리고, 한 장씩 이야기를 적어 주세요</h1>
          <p className="mt-1 text-sm text-ink-2">
            올린 순서대로 영상이 흐릅니다. 카드를 잡아 끌면 순서를 바꿀 수 있어요.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-ink-3">
            사진 <b className="text-ink">{photos.length}</b>/{MAX_PHOTOS} · ✦ 움직이는 사진{" "}
            <b className="text-ink">{motionCount}</b>/{MAX_MOTION}
            <button
              type="button"
              onClick={() => setIntro({ pendingId: null })}
              className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] text-ink-3 hover:border-ink hover:text-ink"
              title="움직이는 사진이란?"
              aria-label="움직이는 사진 설명 보기"
            >
              ?
            </button>
          </span>
          <label className={clsx("btn-primary cursor-pointer", (uploading || remaining <= 0) && "pointer-events-none opacity-50")}>
            {uploading ? "올리는 중…" : remaining > 0 ? "사진 추가" : "최대 장수"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading || remaining <= 0}
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
        </div>
      </header>

      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

      {photos.length === 0 ? (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white/40 px-6 py-16 text-center hover:border-ink-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
        >
          <span className="font-serif text-xl">여기에 사진을 끌어다 놓거나 눌러서 고르세요</span>
          <span className="text-sm text-ink-3">최대 {MAX_PHOTOS}장 · jpg, png, heic 등 사진 파일</span>
          <span className="mt-2 text-xs text-ink-3">{concept.hint}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>
      ) : (
        <ol
          className="relative space-y-0"
          onDragOver={(e) => {
            if (!dragId) return;
            e.preventDefault();
            if (e.target === e.currentTarget) setDropIndex(photos.length);
          }}
          onDrop={onDrop}
        >
          {photos.map((p, i) => {
            const isLast = i === photos.length - 1;
            return (
              <li
                key={p.id}
                draggable
                onDragStart={(e) => {
                  setDragId(p.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", p.id);
                }}
                onDragOver={(e) => onDragOverItem(e, i)}
                onDragEnd={() => {
                  setDragId(null);
                  setDropIndex(null);
                }}
                className={clsx("relative grid grid-cols-[44px_1fr] gap-3", dragId === p.id && "opacity-40")}
              >
                {/* 연결선 + 번호 */}
                <div className="relative flex flex-col items-center">
                  <span
                    className={clsx(
                      "z-10 mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                      p.motion ? "border-accent bg-accent text-white" : "border-line bg-white text-ink-2",
                    )}
                    title={p.motion ? "움직이는 사진" : undefined}
                  >
                    {i + 1}
                  </span>
                  {!isLast && <span className="w-px flex-1 bg-line" />}
                </div>

                {/* 카드 */}
                <div className={clsx("relative mb-3", dragId && dragId !== p.id && "cursor-grabbing", !dragId && "cursor-grab")}>
                  {dragId && dropIndex === i && dragId !== p.id && (
                    <span className="pointer-events-none absolute -top-2 left-0 right-0 h-0.5 rounded bg-accent" />
                  )}
                  {dragId && dropIndex === i + 1 && isLast && dragId !== p.id && (
                    <span className="pointer-events-none absolute -bottom-2 left-0 right-0 h-0.5 rounded bg-accent" />
                  )}
                  <div
                    className={clsx(
                      "grid gap-3 rounded-xl border bg-white p-3 sm:grid-cols-[180px_1fr]",
                      p.motion ? "border-accent/60 ring-1 ring-accent/20" : "border-line",
                    )}
                  >
                    <div className="space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" draggable={false} />
                      <button
                        type="button"
                        onClick={() => toggleMotion(p.id)}
                        className={clsx(
                          "w-full rounded-lg px-2 py-1.5 text-xs transition",
                          p.motion
                            ? "bg-accent text-white"
                            : motionCount >= MAX_MOTION
                              ? "cursor-not-allowed border border-line text-ink-3"
                              : "border border-line text-ink-2 hover:border-accent hover:text-accent",
                        )}
                        title="이 사진을 살아 움직이게 (최대 5장)"
                      >
                        {p.motion ? "✦ 움직이는 사진" : "✦ 움직이게"}
                      </button>
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <textarea
                        className="input min-h-28 flex-1 resize-y text-sm leading-relaxed"
                        placeholder={concept.hint}
                        value={p.caption}
                        maxLength={CAPTION_MAX}
                        onChange={(e) => patch(p.id, (x) => ({ ...x, caption: e.target.value }))}
                        onMouseDown={(e) => e.stopPropagation()}
                        draggable={false}
                      />
                      <div className="flex items-center justify-between text-xs text-ink-3">
                        <span>
                          {p.caption.length}/{CAPTION_MAX}
                        </span>
                        <button onClick={() => remove(p.id)} className="hover:text-red-600">
                          사진 빼기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          {remaining > 0 && (
            <li className="grid grid-cols-[44px_1fr] gap-3">
              <div className="flex justify-center">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-line text-xs text-ink-3">
                  +
                </span>
              </div>
              <label className="mb-1 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-line bg-white/40 px-4 py-4 text-sm text-ink-2 hover:border-ink-3">
                사진 추가 ({remaining}장 더 가능)
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </label>
            </li>
          )}
        </ol>
      )}

      {intro && (
        <MotionIntroModal
          photoSrc={photos.find((p) => p.id === intro.pendingId)?.src ?? photos[0]?.src ?? null}
          onConfirm={intro.pendingId ? confirmIntro : undefined}
          onClose={() => {
            // 설명만 본 경우에도 '봤음'으로 기록
            markMotionIntroSeen();
            setIntro(null);
          }}
        />
      )}

      <StepFooter
        back="/"
        next="/studio/style"
        nextDisabled={photos.length === 0}
        hint={photos.length === 0 ? "사진을 1장 이상 올리면 다음으로 갈 수 있어요" : undefined}
      />
    </div>
  );
}
