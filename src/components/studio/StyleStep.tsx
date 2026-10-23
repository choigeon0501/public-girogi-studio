"use client";

import clsx from "clsx";
import { useStudio } from "@/lib/studio";
import { BGM_OPTIONS, SUBTITLE_STYLES, VOICE_OPTIONS, type BgmKey, type SubtitleStyle, type VoiceKey } from "@/lib/types";
import { StepFooter } from "./StudioShell";

export function StyleStep() {
  const { project, concept, update, loaded } = useStudio();
  if (!loaded) return <p className="text-sm text-ink-3">불러오는 중…</p>;
  if (!project || !concept) {
    return (
      <div className="card max-w-xl">
        먼저 컨셉과 사진을 준비해 주세요.
        <StepFooter back="/" />
      </div>
    );
  }
  const style = project.style;
  const setSubtitle = (subtitle: SubtitleStyle) => update((p) => ({ ...p, style: { ...p.style, subtitle }, reviewed: false }));
  const setBgm = (bgm: BgmKey) => update((p) => ({ ...p, style: { ...p.style, bgm }, reviewed: false }));
  const setVoice = (voice: VoiceKey) => update((p) => ({ ...p, style: { ...p.style, voice }, reviewed: false }));
  const sample = project.photos.find((p) => p.caption.trim())?.caption.split(/[.!?\n]/)[0] || concept.hint.replace(/^예: /, "");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold">자막과 음악을 골라 주세요</h1>
        <p className="mt-1 text-sm text-ink-2">
          {concept.title} 컨셉에 맞는 기본값이 미리 골라져 있습니다. 그대로 두셔도 좋아요.
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-medium">자막</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SUBTITLE_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSubtitle(s.key)}
              className={clsx(
                "overflow-hidden rounded-xl border text-left transition",
                style.subtitle === s.key ? "border-ink shadow-sm" : "border-line hover:border-ink-3",
              )}
            >
              <div className="relative aspect-video overflow-hidden bg-[#2b2520]">
                {project.photos[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.photos[0].src} alt="" className="h-full w-full object-cover opacity-80" />
                )}
                <div
                  className={clsx(
                    "absolute bottom-3 text-white",
                    s.key === "minimal" ? "left-3 max-w-[85%] text-left" : "left-1/2 w-[85%] -translate-x-1/2 text-center",
                  )}
                >
                  <div
                    className={clsx(
                      "inline-block text-[11px] leading-snug",
                      s.key !== "minimal" && "rounded bg-black/45 px-2 py-1",
                      s.key === "minimal" && "drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]",
                      s.key === "serif" && "font-serif",
                    )}
                  >
                    {sample}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-ink-2">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-medium">배경음악</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {BGM_OPTIONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBgm(b.key)}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                style.bgm === b.key ? "border-ink bg-white shadow-sm" : "border-line bg-white/40 hover:bg-white/80",
              )}
            >
              <Radio on={style.bgm === b.key} />
              <div>
                <div className="font-medium">{b.label}</div>
                <div className="text-xs text-ink-2">{b.desc}</div>
              </div>
              {b.file && (
                <audio controls preload="none" src={`/${b.file}`} className="ml-auto h-8 w-36" onClick={(e) => e.stopPropagation()} />
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-medium">음성 내레이션</h2>
        <p className="mb-3 text-xs text-ink-3">사진 설명을 읽어 줄 목소리입니다. 체험판에서는 선택만 저장됩니다.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOICE_OPTIONS.map((v) => (
            <button
              key={v.key}
              onClick={() => setVoice(v.key)}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                style.voice === v.key ? "border-ink bg-white shadow-sm" : "border-line bg-white/40 hover:bg-white/80",
              )}
            >
              <Radio on={style.voice === v.key} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  {v.label}
                  {!v.available && (
                    <span className="rounded-full bg-paper-2 px-1.5 py-0.5 text-[10px] font-normal text-ink-3">준비 중</span>
                  )}
                </div>
                <div className="text-xs text-ink-2">{v.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <StepFooter back="/studio/photos" next="/studio/review" nextLabel="AI 정리 보기 →" />
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return <span className={clsx("h-4 w-4 shrink-0 rounded-full border", on ? "border-ink bg-ink" : "border-ink-3")} />;
}
