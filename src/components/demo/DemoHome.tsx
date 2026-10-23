"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { demoDelete, demoList, demoRawIndex, demoSubscribe } from "@/lib/demo";
import { formatDuration, planScenes } from "@/lib/scenes";
import type { Project } from "@/lib/types";
import { NewProjectForm } from "@/components/NewProjectForm";

/** 데모 모드 홈: 서버 대신 브라우저에 저장된 자서전 목록 */
export function DemoHome() {
  const index = useSyncExternalStore(demoSubscribe, demoRawIndex, () => "[]");
  const projects = useMemo<Project[]>(() => (index === "[]" ? [] : demoList()), [index]);

  function remove(id: string) {
    demoDelete(id);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold">한 장의 사진이, 다시 이야기가 됩니다.</h1>
        <p className="max-w-2xl text-ink-2">
          인생의 블록을 고르고, 블록마다 사진과 이야기를 담으면 한 편의 영상 자서전이 됩니다.
        </p>
        <p className="inline-block rounded-full bg-paper-2 px-3 py-1 text-xs text-ink-2">
          체험판 · 입력한 내용과 사진은 이 브라우저에만 저장되고 서버로 전송되지 않습니다
        </p>
      </section>

      <section className="card max-w-xl">
        <h2 className="mb-3 font-medium">새 자서전 시작하기</h2>
        <NewProjectForm />
      </section>

      {projects.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium">이 브라우저에서 만든 자서전</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => {
              const plan = planScenes(p);
              const filled = p.blocks.filter((b) => b.description.trim() || b.photos.length).length;
              return (
                <li key={p.id} className="card relative hover:bg-white">
                  <Link href={`/p/${p.id}/step/1`} className="block">
                    <div className="font-serif text-lg">{p.title}</div>
                    <div className="mt-1 text-sm text-ink-2">
                      {p.ownerName || "이름 없음"} · 블록 {filled}/{p.blocks.length} 작성 · 예상 {formatDuration(plan.totalFrames)}
                    </div>
                    <div className="mt-2 text-xs text-ink-3">
                      마지막 수정 {new Date(p.updatedAt).toLocaleString("ko-KR")}
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute right-3 top-3 text-xs text-ink-3 hover:text-red-600"
                    title="삭제"
                  >
                    삭제
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
