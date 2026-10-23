"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { DEMO_MODE, demoSave } from "@/lib/demo";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * 서버 JSON이 단일 진실. 로컬에서 수정 → 800ms 디바운스로 PUT.
 * 페이지 이동 전에는 flush()로 즉시 저장.
 */
export function useProject(initial: Project) {
  const [project, setProject] = useState<Project>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(project);
  useEffect(() => {
    latest.current = project;
  }, [project]);

  const persist = useCallback(async (p: Project) => {
    setSaveState("saving");
    try {
      if (DEMO_MODE) {
        demoSave(p);
        setSaveState("saved");
        return;
      }
      const res = await fetch(`/api/projects/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: p.title, ownerName: p.ownerName, blocks: p.blocks, style: p.style }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveState("saved");
    } catch (e) {
      console.error(e);
      setSaveState("error");
    }
  }, []);

  const update = useCallback(
    (fn: (p: Project) => Project) => {
      setProject((prev) => {
        const next = fn(prev);
        latest.current = next;
        setSaveState("dirty");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => persist(next), 800);
        return next;
      });
    },
    [persist],
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (saveState === "dirty" || saveState === "saving") await persist(latest.current);
  }, [persist, saveState]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { project, update, flush, saveState };
}
