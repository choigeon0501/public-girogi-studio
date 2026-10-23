"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CONCEPTS, type Concept } from "@/lib/concepts";
import { emptyProject, resetStudio, useStudio } from "@/lib/studio";
import { StepFooter } from "./StudioShell";

export function ConceptStep() {
  const router = useRouter();
  const { project, concept, update, loaded } = useStudio();

  function choose(c: Concept) {
    update((p) => {
      const switching = p.conceptId && p.conceptId !== c.id;
      // 컨셉을 바꾸면 스타일 기본값을 컨셉에 맞춰 다시 잡는다 (사진은 유지)
      return {
        ...p,
        conceptId: c.id,
        style: switching || !p.conceptId ? { ...c.defaults } : p.style,
        reviewed: false,
      };
    });
  }

  function startOver() {
    if (!confirm("지금까지 올린 사진과 이야기를 지우고 처음부터 시작할까요?")) return;
    resetStudio();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold leading-tight">
          어떤 이야기를 영상으로 만들까요?
        </h1>
        <p className="max-w-2xl text-ink-2">
          컨셉을 하나 고르면 그에 맞는 흐름, 음악, 자막 스타일을 준비해 드립니다. 사진은 다음 단계에서 올립니다.
        </p>
        <p className="inline-block rounded-full bg-paper-2 px-3 py-1 text-xs text-ink-2">
          체험판 · 입력한 내용과 사진은 이 브라우저에만 저장됩니다
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONCEPTS.map((c) => {
          const on = concept?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => choose(c)}
              className={clsx(
                "group relative overflow-hidden rounded-2xl border p-5 text-left transition",
                on ? "border-ink shadow-md" : "border-transparent hover:border-ink-3",
              )}
              style={{ background: `linear-gradient(135deg, ${c.palette.from}, ${c.palette.to})`, color: c.palette.ink }}
            >
              <div className="font-serif text-2xl font-semibold">{c.title}</div>
              <div className="mt-1 text-sm opacity-80">{c.subtitle}</div>
              <div className="mt-6 flex items-center justify-between text-xs opacity-70">
                <span>{c.chapters.length}개 장 구성</span>
                <span
                  className={clsx(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full border transition",
                    on ? "border-current bg-current" : "border-current/50",
                  )}
                >
                  {on && <span className="text-[11px]" style={{ color: c.palette.from }}>✓</span>}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {concept && (
        <section className="card max-w-xl space-y-3">
          <label className="block text-sm font-medium">
            주인공 또는 행사 이름 <span className="font-normal text-ink-3">(선택 · 제목에 들어갑니다)</span>
          </label>
          <input
            className="input"
            placeholder={concept.id === "event" ? "예: 2026 송년회" : "예: 김영희"}
            value={project?.name ?? ""}
            maxLength={30}
            onChange={(e) => update((p) => ({ ...p, name: e.target.value }))}
          />
          <p className="text-xs text-ink-3">{concept.mood}</p>
        </section>
      )}

      <StepFooter
        next={() => {
          if (!concept) return;
          if (!project) update(() => ({ ...emptyProject(), conceptId: concept.id, style: { ...concept.defaults } }));
          router.push("/studio/photos");
        }}
        nextLabel="사진 올리러 가기 →"
        nextDisabled={!loaded || !concept}
        hint={project && project.photos.length > 0 ? `사진 ${project.photos.length}장 저장됨` : undefined}
      />
      {project && (project.photos.length > 0 || project.conceptId) && (
        <div className="text-right">
          <button onClick={startOver} className="text-xs text-ink-3 hover:text-red-600">
            처음부터 다시 시작
          </button>
        </div>
      )}
    </div>
  );
}
