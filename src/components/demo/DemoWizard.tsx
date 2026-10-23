"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { demoRawProject, demoSubscribe } from "@/lib/demo";
import type { Project } from "@/lib/types";
import { Wizard } from "@/components/wizard/Wizard";

/** 데모 모드: 브라우저 저장소에서 프로젝트를 읽어 위자드를 띄운다 */
export function DemoWizard({ id, step }: { id: string; step: number }) {
  // 위자드는 처음 받은 값으로만 초기화된다(useState). 이후 저장으로 raw가 바뀌어도 화면엔 영향 없음
  const raw = useSyncExternalStore(
    demoSubscribe,
    () => demoRawProject(id),
    () => undefined,
  );
  const initial = useMemo<Project | null | undefined>(
    () => (raw === undefined ? undefined : raw ? (JSON.parse(raw) as Project) : null),
    [raw],
  );

  if (initial === undefined) return <p className="text-sm text-ink-3">불러오는 중…</p>;
  if (!initial) {
    return (
      <div className="card max-w-xl space-y-2">
        <p>이 브라우저에서 찾을 수 없는 자서전입니다.</p>
        <p className="text-sm text-ink-2">체험판에서는 만든 브라우저에만 저장됩니다. 다른 기기나 브라우저에서는 보이지 않아요.</p>
        <Link href="/" className="btn-ghost inline-flex">
          처음으로
        </Link>
      </div>
    );
  }
  return <Wizard initial={initial} step={step} />;
}
