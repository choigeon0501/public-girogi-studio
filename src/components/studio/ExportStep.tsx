"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { Autobiography } from "@/remotion/Autobiography";
import { FPS, HEIGHT, WIDTH, formatDuration } from "@/lib/scenes";
import { useStudio } from "@/lib/studio";
import { buildOutline, toScenePlan } from "@/lib/studioPlan";
import { StepFooter } from "./StudioShell";

const LOG_LINES = [
  "장면 타임라인 구성",
  "사진 보정값 적용 (밝기·크롭)",
  "움직이는 사진 클립 준비",
  "자막 타이밍 계산",
  "배경음악 믹싱",
  "1920×1080 · 30fps 인코딩",
  "최종 파일 검사",
];

/** 영상 추출 화면 (껍데기): 진행 애니메이션 → 미리보기 플레이어 + 완료 카드 */
export function ExportStep() {
  const { project, concept, loaded } = useStudio();
  const [progress, setProgress] = useState(0); // 0~100
  const [done, setDone] = useState(false);

  const plan = useMemo(() => {
    if (!project || !concept || project.photos.length === 0) return null;
    const outline = buildOutline(project, concept);
    return { outline, scene: toScenePlan(project, concept, outline.chapters, outline.title) };
  }, [project, concept]);

  useEffect(() => {
    if (!plan) return;
    const start = Date.now();
    const total = 5200; // ms
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / total);
      // 끝으로 갈수록 느려지는 곡선
      const eased = Math.round((1 - Math.pow(1 - t, 2)) * 100);
      setProgress(eased);
      if (t >= 1) {
        clearInterval(id);
        setDone(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, [plan]);

  if (!loaded) return <p className="text-sm text-ink-3">불러오는 중…</p>;
  if (!project || !concept || !plan) {
    return (
      <div className="card max-w-xl">
        먼저 컨셉을 고르고 사진을 올려 주세요.
        <StepFooter back="/" />
      </div>
    );
  }

  const lineIdx = Math.min(LOG_LINES.length - 1, Math.floor((progress / 100) * LOG_LINES.length));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold">{plan.outline.title}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {concept.title} · 장면 {plan.scene.scenes.length}개 · {formatDuration(plan.scene.totalFrames)} · 1920×1080
        </p>
      </header>

      {!done ? (
        <section className="card space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">영상을 만들고 있어요</span>
            <span className="tabular-nums text-ink-2">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${concept.palette.to}, ${concept.palette.ink})` }}
            />
          </div>
          <ul className="space-y-1 font-mono text-xs text-ink-3">
            {LOG_LINES.slice(0, lineIdx + 1).map((l, i) => (
              <li key={l} className={i === lineIdx ? "text-ink" : ""}>
                {i < lineIdx ? "✓" : "…"} {l}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-3">체험판에서는 실제 인코딩 대신 진행 화면만 보여줍니다. 아래 미리보기가 완성될 영상과 같은 화면입니다.</p>
        </section>
      ) : (
        <section className="card flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50/60">
          <div>
            <div className="font-medium">영상이 완성되었습니다</div>
            <div className="text-xs text-ink-2">
              {plan.outline.title}.mp4 · {formatDuration(plan.scene.totalFrames)} · 약 {Math.max(8, Math.round((plan.scene.totalFrames / FPS) * 0.9))}MB
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-primary" disabled title="체험판에서는 파일 다운로드가 제공되지 않습니다">
              MP4 다운로드
            </button>
            <button className="btn-ghost" disabled>
              링크 공유
            </button>
          </div>
          <p className="basis-full text-xs text-ink-3">체험판에서는 다운로드가 비활성화되어 있습니다. 실제 서비스에서는 여기서 파일을 받고 가족에게 링크로 공유할 수 있습니다.</p>
        </section>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-black">
        <Player
          component={Autobiography}
          inputProps={{ plan: plan.scene, disableAudio: true }}
          durationInFrames={Math.max(1, plan.scene.totalFrames)}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          fps={FPS}
          controls
          initialFrame={40}
          style={{ width: "100%" }}
        />
      </div>
      <p className="text-xs text-ink-3">미리보기는 배경음악 없이 재생됩니다. ✦ 움직이는 사진은 체험판에서 숨 쉬듯 살짝 움직이는 임시 효과로 표시됩니다.</p>

      <div className="flex items-center justify-between border-t border-line pt-5">
        <Link href="/studio/review" className="btn-ghost">
          ← 구성안으로
        </Link>
        <Link href="/" className="text-sm text-ink-2 hover:text-ink">
          새 영상 만들기
        </Link>
      </div>
    </div>
  );
}
