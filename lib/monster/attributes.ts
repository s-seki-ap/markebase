export type Attribute = "earth" | "arcana" | "oracle" | "tactics";

export type MonsterStage = "egg" | "baby" | "teen" | "adult";

export const LEVEL_THRESHOLDS: Record<MonsterStage, number> = {
  egg: 1,
  baby: 5,
  teen: 15,
  adult: 30,
};

export const ATTRIBUTE_META: Record<
  Attribute,
  { label: string; icon: string; color: string; colorName: string; description: string }
> = {
  earth: {
    label: "構造",
    icon: "🌿",
    color: "#5fd97e",
    colorName: "moss green",
    description: "Webの土台を築く。基礎・構造に長けた相棒。",
  },
  arcana: {
    label: "魔術",
    icon: "✨",
    color: "#a78bfa",
    colorName: "violet purple",
    description: "動きと彩りで世界を変える。変幻自在な相棒。",
  },
  oracle: {
    label: "探究",
    icon: "🔮",
    color: "#3b82f6",
    colorName: "deep blue",
    description: "データから真実を読み解く。見通しの鋭い相棒。",
  },
  tactics: {
    label: "戦略",
    icon: "⚔️",
    color: "#fbbf24",
    colorName: "amber gold",
    description: "盤面を見て最善手を打つ。頼れる参謀型の相棒。",
  },
};

// カテゴリID→属性マッピング
export const CATEGORY_TO_ATTRIBUTE: Record<string, Attribute> = {
  "web-fundamentals": "earth",
  html: "earth",
  css: "arcana",
  javascript: "arcana",
  "ai-automation": "arcana",
  seo: "oracle",
  ga4: "oracle",
  bigquery: "oracle",
  advertising: "tactics",
  "marketing-strategy": "tactics",
  "app-marketing": "tactics",
  "project-management": "tactics",
};

// 種族名テーブル
export const SPECIES_NAMES: Record<MonsterStage, Record<Attribute, string> | { default: string }> = {
  egg: { default: "ノウコ" } as { default: string },
  baby: {
    earth: "ツムリン",
    arcana: "マホポン",
    oracle: "メクリィ",
    tactics: "タクミン",
  },
  teen: {
    earth: "ツムゴン",
    arcana: "マホルナ",
    oracle: "メクラーレ",
    tactics: "タクシード",
  },
  adult: {
    earth: "ツムガルド",
    arcana: "マホグラム",
    oracle: "メクロイド",
    tactics: "タクティオン",
  },
};

export function getSpeciesName(
  stage: MonsterStage,
  primary: Attribute | null | undefined
): string {
  if (stage === "egg") {
    return (SPECIES_NAMES.egg as { default: string }).default;
  }
  if (!primary) return "なぞのモンスター";
  return (SPECIES_NAMES[stage] as Record<Attribute, string>)[primary];
}
