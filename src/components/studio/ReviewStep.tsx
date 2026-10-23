"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useStudio } from "@/lib/studio";
import { buildOutline } from "@/lib/studioPlan";
import { StepFooter } from "./StudioShell";

const PHASES = [
  "컨셉과 분위기 파악",
  "사진 분석 — 인물·장소·시기",
  "설명글 읽고 이야기 흐름 잡기",
  "장(章) 나누기와 장면 배치",
  "음악·자막 타이밍 맞추기",
];

/**
 * 'AI 정리' 화면 (껍데기).
 * 분석 중 애니메이션을 보여준 뒤, buildOutline() 결과를 구성안으로 보여준다.
 */
export function ReviewStep() {
  const { project, concept, update, loaded } = useStudio();
  // 이미 확인한 적 있으면 애니메이션 생략
  const [phase, setPhase] = useState<number>(() => -1);
  const alreadyReviewed = !!project?.reviewed;

  useEffect(() => {
    if (!loaded || !project || !concept) return;
    if (project.reviewed) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setPhase(i);
      if (i >= PHASES.length) {
        clearInterval(id);
        // 마지막 단계 후 잠깐 쉬고 결과 표시
        setTimeout(() => update((p) => ({ ...p, reviewed: true })), 500);
      }
    }, 650);
    setTimeout(() => setPhase(0), 0);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, project?.reviewed]);

  const outline = useMemo(
    () => (project && concept && project.photos.length ? buildOutline(project, concept) : null),
    [project, concept],
  );

  if (!loaded) return <p className="text-sm text-ink-3">불러오는 중…</p>;
  if (!project || !concept || project.photos.length === 0) {
    return (
      <div className="card max-w-xl">
        먼저 컨셉을 고르고 사진을 올려 주세요.
        <StepFooter back="/" />
      </div>
    );
  }

  if (!alreadyReviewed) {
    return (
      <div className="mx-auto max-w-lg space-y-8 py-10 text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full" style={{ background: `linear-gradient(135deg, ${concept.palette.from}, ${concept.palette.to})` }} />
        <div>
          <h1 className="font-serif text-2xl font-semibold">AI가 이야기를 정리하고 있어요</h1>
          <p className="mt-1 text-sm text-ink-2">
            {concept.title} · 사진 {project.photos.length}장 · 설명 {project.photos.filter((p) => p.caption.trim()).length}장
          </p>
        </div>
        <ol className="space-y-2 text-left text-sm">
          {PHASES.map((label, i) => {
            const done = phase > i;
            const active = phase === i;
            return (
              <li
                key={label}
                className={clsx(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 transition",
                  done && "border-line bg-white text-ink",
                  active && "border-ink bg-white text-ink shadow-sm",
                  !done && !active && "border-transparent text-ink-3",
                )}
              >
                <span
                  className={clsx(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                    done ? "bg-ink text-white" : active ? "border border-ink" : "border border-line",
                  )}
                >
                  {done ? "✓" : active ? <span className="h-2 w-2 animate-ping rounded-full bg-ink" /> : i + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-ink-3">체험판에서는 실제 AI 대신 규칙으로 구성안을 만듭니다.</p>
      </div>
    );
  }

  if (!outline) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-ink-3">AI 정리 · 영상 구성안</div>
          <h1 className="mt-1 font-serif text-3xl font-semibold">{outline.title}</h1>
          <p className="mt-1 text-sm text-ink-2">
            다른 제목 후보: {outline.altTitles.map((t, i) => (
              <span key={t}>
                {i > 0 && " · "}
                <button
                  className="underline decoration-dotted underline-offset-2 hover:text-ink"
                  onClick={() => update((p) => ({ ...p, title: t }))}
                  title="이 제목으로 바꾸기"
                >
                  {t}
                </button>
              </span>
            ))}
          </p>
        </div>
        <div className="card min-w-48 text-sm">
          <div className="flex justify-between"><span className="text-ink-3">장</span><b>{outline.chapters.length}개</b></div>
          <div className="flex justify-between"><span className="text-ink-3">사진</span><b>{project.photos.length}장</b></div>
          <div className="flex justify-between"><span className="text-ink-3">움직이는 사진</span><b>{project.photos.filter((p) => p.motion).length}장</b></div>
          <div className="flex justify-between"><span className="text-ink-3">예상 길이</span><b>{Math.floor(outline.totalSeconds / 60)}분 {String(outline.totalSeconds % 60).padStart(2, "0")}초</b></div>
        </div>
      </header>

      <section className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${concept.palette.from}, ${concept.palette.to})`, color: concept.palette.ink }}>
        <div className="text-xs uppercase tracking-[0.2em] opacity-70">연출 메모</div>
        <ul className="mt-2 space-y-1 text-sm">
          {outline.notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        {outline.chapters.map((ch, i) => (
          <div key={i} className="card">
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-serif text-lg text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-xl font-semibold">{ch.title}</h2>
              {ch.summary && <span className="truncate text-sm text-ink-2">— {ch.summary}</span>}
            </div>
            <ul className="flex gap-2 overflow-x-auto pb-1">
              {ch.photos.map((p) => (
                <li key={p.id} className="relative w-32 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className={clsx("aspect-[4/3] w-full rounded-lg object-cover", p.motion && "ring-2 ring-accent")} />
                  {p.motion && (
                    <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[10px] text-white">✦ 움직임</span>
                  )}
                  <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-2">
                    {p.caption.trim() || <span className="text-ink-3">자막 없음</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="text-sm text-ink-2">
        구성이 마음에 들지 않으면 <Link href="/studio/photos" className="underline">사진·이야기</Link>에서 순서나 설명을 고치고 다시 오세요. 정리는 자동으로 다시 됩니다.
      </p>

      <StepFooter back="/studio/style" next="/studio/export" nextLabel="이대로 영상 만들기 →" />
    </div>
  );
}
