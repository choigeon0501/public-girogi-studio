"use client";

import { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { Autobiography } from "@/remotion/Autobiography";
import { FPS, HEIGHT, WIDTH, formatDuration, planScenes, storyText } from "@/lib/scenes";
import type { Project, RenderRecord } from "@/lib/types";

const RENDER_DISABLED = process.env.NEXT_PUBLIC_RENDER_DISABLED === "1";

export function Step5Preview({ project }: { project: Project }) {
  const plan = useMemo(() => planScenes(project), [project]);
  const empty = project.blocks.filter((b) => !storyText(b).trim() && b.photos.length === 0);
  const motionCount = project.blocks.filter((b) => b.photos.some((p) => p.id === b.motionPhotoId)).length;
  const motionReady = project.blocks.filter((b) => b.photos.some((p) => p.id === b.motionPhotoId && p.motionSrc)).length;
  const [renders, setRenders] = useState<RenderRecord[]>(project.renders);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function render() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "렌더 실패");
      setRenders((r) => [j, ...r]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "렌더 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {empty.length > 0 && (
        <div className="card text-sm text-amber-800">
          이야기와 사진이 모두 비어 있어 영상에서 빠지는 블록: {empty.map((b) => b.title).join(", ")}
        </div>
      )}
      {motionCount > 0 && motionReady < motionCount && (
        <div className="card text-sm text-ink-2">
          ✦ 움직이는 사진 {motionCount}장이 지정되어 있습니다. AI 움직임 생성은 다음 버전에서 적용되며, 지금은 해당 사진이 숨 쉬듯 살짝 움직이는 임시 효과로 표시됩니다.
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-black">
        <Player
          component={Autobiography}
          inputProps={{ plan, disableAudio: true }}
          durationInFrames={Math.max(1, plan.totalFrames)}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          fps={FPS}
          controls
          style={{ width: "100%" }}
        />
      </div>
      <p className="text-xs text-ink-3">
        미리보기는 배경음악 없이 재생됩니다. 장면 {plan.scenes.length}개 · {formatDuration(plan.totalFrames)} · 1920×1080 · {FPS}fps
      </p>

      <div className="card space-y-3">
        {RENDER_DISABLED ? (
          <div className="text-sm text-ink-2">
            <div className="font-medium text-ink">체험판에서는 MP4 파일 만들기를 지원하지 않습니다</div>
            위 미리보기가 완성될 영상과 같은 화면입니다. 실제 서비스에서는 여기서 영상 파일을 받을 수 있습니다.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary" onClick={render} disabled={busy}>
              {busy ? "영상 만드는 중… (수 분 걸립니다)" : "영상 만들기 (MP4)"}
            </button>
            <span className="text-xs text-ink-3">
              또는 터미널에서 <code>npm run render -- {project.id}</code>
            </span>
          </div>
        )}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {renders.length > 0 && (
          <ul className="divide-y divide-line text-sm">
            {renders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2">
                <span className="text-xs text-ink-3">{new Date(r.createdAt).toLocaleString("ko-KR")}</span>
                {r.status === "done" && r.outputPath ? (
                  <a className="text-accent hover:underline" href={`/api/render/${project.id}_${r.id}/file`}>
                    다운로드 · {r.outputPath}
                  </a>
                ) : (
                  <span className="text-red-600">실패 · {r.error}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
