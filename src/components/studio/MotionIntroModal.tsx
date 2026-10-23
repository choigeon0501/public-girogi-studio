"use client";

import { useEffect } from "react";
import { MAX_MOTION } from "@/lib/studio";

const SEEN_KEY = "girogi:motion-intro-seen";

export function hasSeenMotionIntro() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
export function markMotionIntroSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
}

/**
 * '움직이는 사진'이 무엇인지 처음 한 번 설명하는 팝업.
 * 누른 사진으로 원본 ↔ 움직임 비교를 바로 보여준다. (움직임은 CSS로 흉내)
 */
export function MotionIntroModal({
  photoSrc,
  onConfirm,
  onClose,
  confirmLabel = "알겠어요, 이 사진 움직이게",
}: {
  photoSrc: string | null;
  onConfirm?: () => void;
  onClose: () => void;
  confirmLabel?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="motion-intro-title"
    >
      <style>{`
        @keyframes gs-live { 0%,100% { transform: scale(1.04) translateY(0) rotate(-0.3deg); } 50% { transform: scale(1.09) translateY(-4px) rotate(0.3deg); } }
        .gs-live { animation: gs-live 5s ease-in-out infinite; transform-origin: center; }
      `}</style>
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid gap-0 sm:grid-cols-2">
          <figure className="relative bg-[#1b1613] p-4">
            <div className="overflow-hidden rounded-lg">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="aspect-[4/3] w-full bg-[#3a312b]" />
              )}
            </div>
            <figcaption className="mt-2 text-center text-xs text-white/60">지금 · 원본 사진</figcaption>
          </figure>
          <figure className="relative bg-[#1b1613] p-4">
            <div className="overflow-hidden rounded-lg ring-2 ring-accent">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="" className="gs-live aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="gs-live aspect-[4/3] w-full bg-[#3a312b]" />
              )}
            </div>
            <figcaption className="mt-2 text-center text-xs text-accent-2">✦ 움직이는 사진 (느낌 예시)</figcaption>
          </figure>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <h2 id="motion-intro-title" className="font-serif text-xl font-semibold">
              ✦ 움직이는 사진이란?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              고른 사진을 AI가 짧은 영상으로 만들어 줍니다. 사진 전체가 <b>아주 살짝</b> 살아 움직여요 —
              머리카락이 바람에 날리고, 눈을 깜빡이고, 구름이 흐르듯이. 영상에서 그 장면이 나올 때 멈춘 사진이 아니라
              숨 쉬는 순간처럼 보입니다.
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-ink-2 sm:grid-cols-3">
            <li className="rounded-lg bg-white/70 p-3">
              <div className="font-medium text-ink">최대 {MAX_MOTION}장</div>
              가장 중요한 순간에만 쓰면 효과가 커요
            </li>
            <li className="rounded-lg bg-white/70 p-3">
              <div className="font-medium text-ink">잘 어울리는 사진</div>
              정면 얼굴이 또렷하고 흔들리지 않은 사진
            </li>
            <li className="rounded-lg bg-white/70 p-3">
              <div className="font-medium text-ink">언제든 해제</div>
              버튼을 다시 누르면 보통 사진으로 돌아가요
            </li>
          </ul>
          <p className="text-xs text-ink-3">
            체험판에서는 실제 AI 움직임 대신 사진이 천천히 숨 쉬는 효과로 미리 보여 드립니다. 위 오른쪽 예시도 같은 효과예요.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="btn-ghost" onClick={onClose}>
              {onConfirm ? "나중에" : "닫기"}
            </button>
            {onConfirm && (
              <button className="btn-primary" onClick={onConfirm}>
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
