"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useStudio } from "@/lib/studio";

export const STUDIO_STEPS = [
  { href: "/", label: "컨셉" },
  { href: "/studio/photos", label: "사진·이야기" },
  { href: "/studio/style", label: "자막·음악" },
  { href: "/studio/review", label: "AI 정리" },
  { href: "/studio/export", label: "영상 추출" },
];

/** 상단 단계 표시 + 공통 여백. 각 단계 페이지가 감싼다 */
export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { project, concept } = useStudio();
  const current = Math.max(
    0,
    STUDIO_STEPS.findIndex((s) => (s.href === "/" ? pathname === "/" : pathname.startsWith(s.href))),
  );
  const photos = project?.photos.length ?? 0;

  // 단계별 진입 가능 조건 (껍데기이므로 느슨하게)
  const canEnter = (i: number) => {
    if (i <= 1) return true;
    if (!concept) return false;
    if (i >= 2) return photos > 0;
    return true;
  };

  return (
    <div className="space-y-8">
      <nav aria-label="진행 단계" className="flex flex-wrap items-center gap-1.5 text-sm">
        {STUDIO_STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const enabled = canEnter(i);
          const inner = (
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition",
                active && "bg-ink text-white",
                !active && done && "bg-white text-ink",
                !active && !done && "text-ink-3",
                !enabled && !active && "opacity-50",
              )}
            >
              <span
                className={clsx(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                  active ? "bg-white/20" : done ? "bg-ink text-white" : "border border-line",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              {s.label}
            </span>
          );
          return (
            <div key={s.href} className="flex items-center gap-1.5">
              {enabled ? <Link href={s.href}>{inner}</Link> : inner}
              {i < STUDIO_STEPS.length - 1 && <span className="h-px w-5 bg-line" />}
            </div>
          );
        })}
        {concept && (
          <span className="ml-auto hidden items-center gap-2 text-xs text-ink-3 sm:inline-flex">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: concept.palette.to }} />
            {concept.title}
            {project?.name ? ` · ${project.name}` : ""}
          </span>
        )}
      </nav>
      {children}
    </div>
  );
}

export function StepFooter({
  back,
  next,
  nextLabel = "다음 →",
  nextDisabled,
  hint,
}: {
  back?: string;
  next?: string | (() => void);
  nextLabel?: string;
  nextDisabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line pt-5">
      {back ? (
        <Link href={back} className="btn-ghost">
          ← 이전
        </Link>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-3">
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
        {typeof next === "string" ? (
          <Link
            href={nextDisabled ? "#" : next}
            aria-disabled={nextDisabled}
            className={clsx("btn-primary", nextDisabled && "pointer-events-none opacity-50")}
          >
            {nextLabel}
          </Link>
        ) : next ? (
          <button className="btn-primary" onClick={next} disabled={nextDisabled}>
            {nextLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
