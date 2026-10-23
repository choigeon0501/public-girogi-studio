"use client";

import { useState } from "react";
import clsx from "clsx";
import { CATALOG, MOMENT_BLOCKS, PERIOD_BLOCKS, type CatalogBlock } from "@/lib/catalog";
import { newId } from "@/lib/ids";
import { RECOMMENDED_MAX_BLOCKS, type Block, type BlockType } from "@/lib/types";
import type { StepProps } from "./Wizard";

export function Step1Blocks({ project, update }: StepProps) {
  const selectedCatalog = new Set(project.blocks.map((b) => b.catalogId).filter(Boolean));

  // ── 드래그 정렬 상태 ──
  const [dragId, setDragId] = useState<string | null>(null);
  /** 드롭 위치: 이 인덱스 **앞**에 끼운다 (blocks.length면 맨 끝) */
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  function reorder(id: string, toIndex: number) {
    update((p) => {
      const from = p.blocks.findIndex((b) => b.id === id);
      if (from < 0) return p;
      const blocks = [...p.blocks];
      const [item] = blocks.splice(from, 1);
      const insertAt = toIndex > from ? toIndex - 1 : toIndex;
      blocks.splice(insertAt, 0, item);
      return { ...p, blocks };
    });
  }

  function onDragOverItem(e: React.DragEvent<HTMLLIElement>, index: number) {
    if (!dragId) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    setDropIndex(before ? index : index + 1);
  }

  function onDrop() {
    if (dragId && dropIndex !== null) reorder(dragId, dropIndex);
    setDragId(null);
    setDropIndex(null);
  }

  function onDragEnd() {
    setDragId(null);
    setDropIndex(null);
  }

  function toggleCatalog(c: CatalogBlock) {
    update((p) => {
      const existing = p.blocks.find((b) => b.catalogId === c.id);
      if (existing) {
        return { ...p, blocks: p.blocks.filter((b) => b.id !== existing.id) };
      }
      const block: Block = {
        id: newId("blk"),
        catalogId: c.id,
        type: c.type,
        title: c.title,
        description: "",
        prompts: c.prompts,
        photos: [],
      };
      return { ...p, blocks: insertByPosition(p.blocks, block, c.position) };
    });
  }

  function addCustom(type: BlockType, title: string) {
    update((p) => ({
      ...p,
      blocks: [
        ...p.blocks,
        {
          id: newId("blk"),
          catalogId: null,
          type,
          title,
          description: "",
          prompts: type === "moment" ? ["언제, 어디서였나요?", "왜 기억에 남나요?"] : ["그 시절은 어떤 시절이었나요?"],
          photos: [],
        },
      ],
    }));
  }

  function move(id: string, dir: -1 | 1) {
    update((p) => {
      const i = p.blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.blocks.length) return p;
      const blocks = [...p.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
  }

  function remove(id: string) {
    update((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
  }

  function rename(id: string, title: string) {
    update((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, title } : b)) }));
  }

  function setYear(id: string, approxYear: string) {
    update((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, approxYear } : b)) }));
  }

  const over = project.blocks.length > RECOMMENDED_MAX_BLOCKS;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <Section
          title="시기 블록"
          desc="기간이 있는 삶의 장(章)입니다. 사진이 여러 장 들어갑니다."
          items={PERIOD_BLOCKS}
          selected={selectedCatalog}
          onToggle={toggleCatalog}
        />
        <Section
          title="순간 블록"
          desc="하나의 장면입니다. 장 사이에 짧은 막간으로 들어갑니다."
          items={MOMENT_BLOCKS}
          selected={selectedCatalog}
          onToggle={toggleCatalog}
        />
        <CustomAdder onAdd={addCustom} />
      </div>

      <aside className="card h-fit space-y-3 lg:sticky lg:top-6">
        <div className="flex items-baseline justify-between">
          <h3 className="font-medium">나의 흐름</h3>
          <span className={clsx("text-xs", over ? "text-red-600" : "text-ink-3")}>
            {project.blocks.length}개{over && ` · ${RECOMMENDED_MAX_BLOCKS}개 이하 권장`}
          </span>
        </div>
        {project.blocks.length === 0 && <p className="text-sm text-ink-3">왼쪽에서 블록을 골라 주세요.</p>}
        <ol
          className="space-y-1.5"
          onDragOver={(e) => {
            // 목록 빈 영역(맨 아래)으로 끌면 끝에 추가
            if (!dragId) return;
            e.preventDefault();
            if (e.target === e.currentTarget) setDropIndex(project.blocks.length);
          }}
          onDrop={onDrop}
        >
          {project.blocks.map((b, i) => (
            <li
              key={b.id}
              draggable
              onDragStart={(e) => {
                setDragId(b.id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", b.id);
              }}
              onDragOver={(e) => onDragOverItem(e, i)}
              onDragEnd={onDragEnd}
              className={clsx(
                "relative rounded-lg border px-2.5 py-2 text-sm transition-opacity",
                b.type === "moment" ? "border-accent-2/60 bg-[#fbf3ee]" : "border-line bg-white",
                dragId === b.id && "opacity-40",
                dragId && dragId !== b.id && "cursor-grabbing",
                !dragId && "cursor-grab",
              )}
            >
              {/* 드롭 위치 표시선 */}
              {dragId && dropIndex === i && dragId !== b.id && (
                <span className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded bg-accent" />
              )}
              {dragId && dropIndex === i + 1 && i === project.blocks.length - 1 && dragId !== b.id && (
                <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded bg-accent" />
              )}
              <div className="flex items-center gap-1.5">
                <span className="select-none text-ink-3" title="끌어서 순서 바꾸기" aria-hidden>
                  ⠿
                </span>
                <span className="w-5 text-xs text-ink-3">{i + 1}</span>
                <input
                  className="min-w-0 flex-1 cursor-text bg-transparent font-medium outline-none"
                  value={b.title}
                  onChange={(e) => rename(b.id, e.target.value)}
                  draggable
                  onDragStart={(e) => {
                    // 입력칸 안에서는 텍스트 드래그 대신 블록 드래그로
                    e.preventDefault();
                  }}
                />
                <button className="px-1 text-ink-3 hover:text-ink" onClick={() => move(b.id, -1)} title="위로">
                  ↑
                </button>
                <button className="px-1 text-ink-3 hover:text-ink" onClick={() => move(b.id, 1)} title="아래로">
                  ↓
                </button>
                <button className="px-1 text-ink-3 hover:text-red-600" onClick={() => remove(b.id)} title="빼기">
                  ×
                </button>
              </div>
              <div className="ml-6 mt-1 flex items-center gap-2 text-xs text-ink-3">
                <span>{b.type === "moment" ? "순간" : "시기"}</span>
                <input
                  className="w-28 rounded border border-line bg-white/70 px-1.5 py-0.5 outline-none focus:border-accent"
                  placeholder="시기 (예: 1985)"
                  value={b.approxYear ?? ""}
                  onChange={(e) => setYear(b.id, e.target.value)}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-ink-3">
          ⠿ 를 잡고 끌어서 원하는 자리 사이에 놓으면 순서가 바뀝니다. 순간 블록은 시기 블록 사이 어디든 끼울 수 있어요.
        </p>
      </aside>
    </div>
  );
}

function Section({
  title,
  desc,
  items,
  selected,
  onToggle,
}: {
  title: string;
  desc: string;
  items: CatalogBlock[];
  selected: Set<string | null>;
  onToggle: (c: CatalogBlock) => void;
}) {
  return (
    <section>
      <h2 className="font-medium">{title}</h2>
      <p className="mb-3 text-sm text-ink-2">{desc}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c)}
              className={clsx(
                "rounded-xl border p-3 text-left transition",
                on ? "border-ink bg-white shadow-sm" : "border-line bg-white/40 hover:bg-white/80",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.title}</span>
                <span
                  className={clsx(
                    "h-4 w-4 rounded-full border",
                    on ? "border-ink bg-ink" : "border-ink-3",
                  )}
                />
              </div>
              <div className="mt-1 text-xs text-ink-2">{c.hint}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CustomAdder({ onAdd }: { onAdd: (type: BlockType, title: string) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<BlockType>("moment");
  return (
    <section className="card">
      <h2 className="font-medium">직접 만들기</h2>
      <p className="mb-3 text-sm text-ink-2">목록에 없는 시절이나 순간이 있다면 이름을 붙여 추가하세요.</p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onAdd(type, title.trim());
          setTitle("");
        }}
      >
        <select className="input w-28" value={type} onChange={(e) => setType(e.target.value as BlockType)}>
          <option value="period">시기</option>
          <option value="moment">순간</option>
        </select>
        <input
          className="input flex-1"
          placeholder="예: 반려견 복실이와 함께한 시간"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={40}
        />
        <button className="btn-ghost">추가</button>
      </form>
    </section>
  );
}

/** 카탈로그 position 기준으로 자연스러운 위치에 끼워 넣기 */
function insertByPosition(blocks: Block[], block: Block, position: number): Block[] {
  const posOf = (b: Block) => CATALOG.find((c) => c.id === b.catalogId)?.position ?? 50;
  const idx = blocks.findIndex((b) => posOf(b) > position);
  if (idx === -1) return [...blocks, block];
  return [...blocks.slice(0, idx), block, ...blocks.slice(idx)];
}
