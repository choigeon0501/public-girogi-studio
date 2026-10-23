"use client";

import clsx from "clsx";
import { BGM_OPTIONS, SUBTITLE_STYLES, VOICE_OPTIONS, type BgmKey, type SubtitleStyle, type VoiceKey } from "@/lib/types";
import type { StepProps } from "./Wizard";

export function Step4Style({ project, update }: StepProps) {
  const setSubtitle = (subtitle: SubtitleStyle) => update((p) => ({ ...p, style: { ...p.style, subtitle } }));
  const setBgm = (bgm: BgmKey) => update((p) => ({ ...p, style: { ...p.style, bgm } }));
  const setVoice = (voice: VoiceKey) => update((p) => ({ ...p, style: { ...p.style, voice } }));
  const voice = project.style.voice ?? "none";

  return (
    <div className="space-y-8">
      <p className="text-sm text-ink-2">아무것도 바꾸지 않아도 괜찮습니다. 기본값으로도 충분히 보기 좋게 나옵니다.</p>

      <section>
        <h2 className="mb-3 font-medium">자막 스타일</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SUBTITLE_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSubtitle(s.key)}
              className={clsx(
                "overflow-hidden rounded-xl border text-left transition",
                project.style.subtitle === s.key ? "border-ink shadow-sm" : "border-line hover:border-ink-3",
              )}
            >
              <SubtitlePreview style={s.key} />
              <div className="p-3">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-ink-2">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-medium">배경음악</h2>
        <p className="mb-3 text-xs text-ink-3">
          음원 파일은 <code>public/bgm/</code>에 넣습니다. 파일이 없으면 자동으로 무음 처리됩니다.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {BGM_OPTIONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBgm(b.key)}
              className={clsx(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                project.style.bgm === b.key ? "border-ink bg-white shadow-sm" : "border-line bg-white/40 hover:bg-white/80",
              )}
            >
              <span className={clsx("h-4 w-4 rounded-full border", project.style.bgm === b.key ? "border-ink bg-ink" : "border-ink-3")} />
              <div>
                <div className="font-medium">{b.label}</div>
                <div className="text-xs text-ink-2">{b.desc}</div>
              </div>
              {b.file && (
                <audio controls preload="none" src={`/${b.file}`} className="ml-auto h-8 w-40" onClick={(e) => e.stopPropagation()} />
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-medium">음성 내레이션</h2>
        <p className="mb-3 text-xs text-ink-3">
          이야기를 읽어 줄 목소리를 고릅니다. 지금은 선택만 저장되고 영상에는 자막만 들어갑니다. 음성은 다음 버전에서 적용됩니다.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOICE_OPTIONS.map((v) => {
            const on = voice === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setVoice(v.key)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                  on ? "border-ink bg-white shadow-sm" : "border-line bg-white/40 hover:bg-white/80",
                )}
              >
                <span className={clsx("h-4 w-4 shrink-0 rounded-full border", on ? "border-ink bg-ink" : "border-ink-3")} />
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
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SubtitlePreview({ style }: { style: SubtitleStyle }) {
  return (
    <div className="relative aspect-video bg-[linear-gradient(135deg,#6b5a4e,#2b2520)]">
      <div
        className={clsx(
          "absolute bottom-3 text-white",
          style === "minimal" ? "left-3 text-left" : "left-1/2 -translate-x-1/2 text-center",
        )}
      >
        <div
          className={clsx(
            "text-[11px] leading-snug",
            style !== "minimal" && "rounded bg-black/45 px-2 py-1",
            style === "minimal" && "drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]",
            style === "serif" && "font-serif",
          )}
        >
          바다가 보이는 언덕이 우리 놀이터였습니다
        </div>
      </div>
    </div>
  );
}
