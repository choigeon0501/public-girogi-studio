import Link from "next/link";
import { listProjects } from "@/lib/store";
import { NewProjectForm } from "@/components/NewProjectForm";
import { formatDuration, planScenes } from "@/lib/scenes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await listProjects();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold">한 장의 사진이, 다시 이야기가 됩니다.</h1>
        <p className="max-w-2xl text-ink-2">
          인생의 블록을 고르고, 블록마다 사진과 이야기를 담으면 한 편의 영상 자서전이 됩니다.
          지금은 AI 없이 고정 템플릿으로 만드는 1차 버전입니다.
        </p>
      </section>

      <section className="card max-w-xl">
        <h2 className="mb-3 font-medium">새 자서전 시작하기</h2>
        <NewProjectForm />
      </section>

      {projects.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium">진행 중인 자서전</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => {
              const plan = planScenes(p);
              const filled = p.blocks.filter((b) => b.description.trim() || b.photos.length).length;
              return (
                <li key={p.id}>
                  <Link href={`/p/${p.id}/step/1`} className="card block hover:bg-white">
                    <div className="font-serif text-lg">{p.title}</div>
                    <div className="mt-1 text-sm text-ink-2">
                      {p.ownerName || "이름 없음"} · 블록 {filled}/{p.blocks.length} 작성 · 예상 {formatDuration(plan.totalFrames)}
                    </div>
                    <div className="mt-2 text-xs text-ink-3">
                      마지막 수정 {new Date(p.updatedAt).toLocaleString("ko-KR")}
                      {p.renders[0]?.status === "done" ? " · 영상 생성됨" : ""}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
