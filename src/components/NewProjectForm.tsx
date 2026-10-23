"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("나의 이야기");
  const [ownerName, setOwnerName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ownerName }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok || !data.id) throw new Error(data.error ?? `서버 오류 (${res.status})`);
      router.push(`/p/${data.id}/step/1`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "알 수 없는 오류");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-ink-2">자서전 제목</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs text-ink-2">주인공 이름</label>
        <input
          className="input"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="예: 김영희"
        />
      </div>
      {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      <button className="btn-primary" disabled={busy}>
        {busy ? "만드는 중…" : "시작하기"}
      </button>
    </form>
  );
}
