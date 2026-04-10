"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MonsterAvatar from "@/components/MonsterAvatar";
import {
  ATTRIBUTE_META,
  type Attribute,
  type MonsterStage,
} from "@/lib/monster/attributes";

interface MonsterInitial {
  name: string;
  stage: MonsterStage;
  primary: Attribute | null;
  secondary: Attribute | null;
  imageUrl: string | null;
  generating: boolean;
  level: number;
  xp: number;
}

interface MonsterClientProps {
  initial: MonsterInitial;
  speciesName: string;
  stageLabel: string;
  nextStage: string | null;
  nextStageLevel: number | null;
}

const MAX_NAME_LEN = 12;
const POLL_INTERVAL_MS = 3000;

interface MonsterApiResponse {
  name: string | null;
  stage: MonsterStage;
  primary: Attribute | null;
  secondary: Attribute | null;
  imageUrl: string | null;
  generating: boolean;
  level: number;
  xp: number;
}

export default function MonsterClient({
  initial,
  speciesName,
  stageLabel,
  nextStage,
  nextStageLevel,
}: MonsterClientProps) {
  const [state, setState] = useState<MonsterInitial>(initial);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(initial.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/monster", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as MonsterApiResponse;
      setState((prev) => ({
        ...prev,
        name: data.name ?? prev.name,
        stage: data.stage,
        primary: data.primary,
        secondary: data.secondary,
        imageUrl: data.imageUrl,
        generating: data.generating,
        level: data.level,
        xp: data.xp,
      }));
    } catch {
      // ignore transient errors
    }
  }, []);

  // 生成中ならポーリングで最新状態を取りに行く
  useEffect(() => {
    if (!state.generating) return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    const timer = setInterval(() => {
      void fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      pollingRef.current = false;
    };
  }, [state.generating, fetchStatus]);

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setError("名前を入力してください");
      return;
    }
    if (trimmed.length > MAX_NAME_LEN) {
      setError(`${MAX_NAME_LEN}文字以内で入力してください`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/monster/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "保存に失敗しました");
        return;
      }
      setState((prev) => ({ ...prev, name: trimmed }));
      setEditing(false);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameDraft(state.name);
    setEditing(false);
    setError(null);
  };

  const primaryMeta = state.primary ? ATTRIBUTE_META[state.primary] : null;
  const secondaryMeta = state.secondary ? ATTRIBUTE_META[state.secondary] : null;

  return (
    <section className="clay-card p-6 lg:p-8">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <MonsterAvatar
            imageUrl={state.imageUrl}
            stage={state.stage}
            primary={state.primary}
            secondary={state.secondary}
            name={state.name}
            size="xl"
            generating={state.generating}
          />
          {state.generating && (
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap"
              style={{
                backgroundColor: "var(--color-yellow)",
                color: "var(--color-text-heading)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--clay-raised)",
              }}
            >
              ✨ 育成中...
            </div>
          )}
        </div>

        {/* ニックネーム */}
        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          {editing ? (
            <div className="w-full flex flex-col items-center gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={MAX_NAME_LEN}
                disabled={saving}
                className="w-full px-4 py-2 rounded-xl text-center text-lg font-extrabold"
                style={{
                  backgroundColor: "var(--color-page)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text-heading)",
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={saving}
                  className="clay-button px-4 py-1.5 text-sm font-extrabold"
                  style={{
                    backgroundColor: "var(--color-green)",
                    color: "#ffffff",
                  }}
                >
                  {saving ? "保存中..." : "保存"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="clay-button px-4 py-1.5 text-sm font-extrabold"
                  style={{
                    backgroundColor: "var(--color-page)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--color-text-heading)" }}
                >
                  {state.name}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(state.name);
                    setEditing(true);
                  }}
                  className="text-xs px-2 py-1 rounded-lg font-bold hover:scale-105 transition-all"
                  style={{
                    backgroundColor: "var(--color-page)",
                    border: "1.5px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                  aria-label="名前を変更"
                >
                  ✏️
                </button>
              </div>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {speciesName} ／ {stageLabel}
              </p>
            </div>
          )}
        </div>

        {/* 属性バッジ */}
        {(primaryMeta || secondaryMeta) && (
          <div className="flex gap-2 flex-wrap justify-center">
            {primaryMeta && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-extrabold flex items-center gap-1.5"
                style={{
                  backgroundColor: `${primaryMeta.color}22`,
                  color: primaryMeta.color,
                  border: `1.5px solid ${primaryMeta.color}`,
                }}
              >
                <span>{primaryMeta.icon}</span>
                <span>主 ・ {primaryMeta.label}</span>
              </span>
            )}
            {secondaryMeta && (
              <span
                className="text-xs px-3 py-1.5 rounded-full font-extrabold flex items-center gap-1.5"
                style={{
                  backgroundColor: `${secondaryMeta.color}22`,
                  color: secondaryMeta.color,
                  border: `1.5px solid ${secondaryMeta.color}`,
                }}
              >
                <span>{secondaryMeta.icon}</span>
                <span>副 ・ {secondaryMeta.label}</span>
              </span>
            )}
          </div>
        )}

        {/* レベル・XP */}
        <div
          className="w-full max-w-sm flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            backgroundColor: "var(--color-page)",
            border: "1.5px solid var(--color-border)",
          }}
        >
          <div className="flex flex-col">
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              レベル
            </span>
            <span
              className="text-2xl font-extrabold"
              style={{ color: "var(--color-text-heading)" }}
            >
              Lv. {state.level}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              累計XP
            </span>
            <span
              className="text-2xl font-extrabold"
              style={{ color: "var(--color-yellow)" }}
            >
              {state.xp.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 次の進化プレビュー */}
        {nextStage && nextStageLevel !== null && (
          <div
            className="w-full max-w-sm px-5 py-3 rounded-2xl text-center"
            style={{
              backgroundColor: "var(--color-page)",
              border: "1.5px dashed var(--color-border)",
            }}
          >
            <p
              className="text-[10px] font-bold mb-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              つぎの進化
            </p>
            <p
              className="text-sm font-extrabold"
              style={{ color: "var(--color-text-heading)" }}
            >
              Lv. {nextStageLevel} で「{nextStage}」へ
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
