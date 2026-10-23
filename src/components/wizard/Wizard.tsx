"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { useProject } from "./useProject";
import { Step1Blocks } from "./Step1Blocks";
import { Step2Content } from "./Step2Content";
import { Step4Style } from "./Step4Style";
import { Step5Preview } from "./Step5Preview";

const STEPS = [
  { n: 1, label: "블록 고르기" },
  { n: 2, label: "사진·이야기" },
  { n: 3, label: "스타일" },
  { n: 4, label: "영상 만들기" },
];
export const LAST_STEP = STEPS.length;

export function Wizard({ initial, step }: { initial: Project; step: number }) {
  const router = useRouter();
  const { project, update, flush, saveState } = useProject(initial);

  async function go(n: number) {
    await flush();
    router.push(`/p/${project.id}/step/${n}`);
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => go(s.n)}
              className={
                s.n === step
                  ? "rounded-full bg-ink px-3 py-1 text-white"
                  : "rounded-full border border-line px-3 py-1 text-ink-2 hover:bg-white"
              }
            >
              {s.n}. {s.label}
            </button>
            {i < STEPS.length - 1 && <span className="text-ink-3">›</span>}
          </div>
        ))}
        <span className="ml-auto text-xs text-ink-3">
          {saveState === "saving" && "저장 중…"}
          {saveState === "saved" && "저장됨"}
          {saveState === "dirty" && "변경됨"}
          {saveState === "error" && <span className="text-red-600">저장 실패</span>}
        </span>
      </nav>

      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl font-semibold">{project.title}</h1>
        <Link href="/" className="text-xs text-ink-3 hover:underline">
          목록으로
        </Link>
      </div>

      {step === 1 && <Step1Blocks project={project} update={update} />}
      {step === 2 && <Step2Content project={project} update={update} />}
      {step === 3 && <Step4Style project={project} update={update} />}
      {step === 4 && <Step5Preview project={project} />}

      <div className="flex justify-between border-t border-line pt-5">
        <button className="btn-ghost" onClick={() => go(step - 1)} disabled={step === 1}>
          ← 이전
        </button>
        {step < LAST_STEP ? (
          <button className="btn-primary" onClick={() => go(step + 1)}>
            다음 →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

export type StepProps = {
  project: Project;
  update: (fn: (p: Project) => Project) => void;
};
