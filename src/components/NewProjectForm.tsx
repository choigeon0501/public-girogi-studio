"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("나의 이야기");
  const [ownerName, setOwnerName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, ownerName }),
    });
    const p = await res.json();
    router.push(`/p/${p.id}/step/1`);
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
      <button className="btn-primary" disabled={busy}>
        {busy ? "만드는 중…" : "시작하기"}
      </button>
    </form>
  );
}
