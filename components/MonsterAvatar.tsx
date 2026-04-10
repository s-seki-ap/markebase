import Image from "next/image";
import { ATTRIBUTE_META, type Attribute, type MonsterStage } from "@/lib/monster/attributes";

export interface MonsterAvatarProps {
  imageUrl?: string | null;
  stage?: MonsterStage | null;
  primary?: Attribute | null;
  secondary?: Attribute | null;
  name?: string | null;
  fallbackLabel?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  generating?: boolean;
}

const SIZE_PX: Record<NonNullable<MonsterAvatarProps["size"]>, number> = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 160,
};

function gradientForAttribute(primary?: Attribute | null, secondary?: Attribute | null): string {
  const primaryColor = primary ? ATTRIBUTE_META[primary].color : "#e5e7eb";
  const secondaryColor = secondary
    ? ATTRIBUTE_META[secondary].color
    : primary
      ? ATTRIBUTE_META[primary].color
      : "#d1d5db";
  return `linear-gradient(145deg, ${primaryColor}, ${secondaryColor})`;
}

export default function MonsterAvatar({
  imageUrl,
  stage,
  primary,
  secondary,
  name,
  fallbackLabel,
  size = "md",
  generating = false,
}: MonsterAvatarProps) {
  const px = SIZE_PX[size];
  const fontSize = Math.max(12, Math.floor(px / 3));

  if (imageUrl) {
    return (
      <div
        className="relative rounded-full overflow-hidden shrink-0"
        style={{
          width: px,
          height: px,
          border: "2px solid var(--color-green)",
          boxShadow: "var(--clay-raised)",
          backgroundColor: "#ffffff",
        }}
      >
        <Image
          src={imageUrl}
          alt={name ?? "monster avatar"}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
        {generating && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
          >
            <span className="text-xs">✨</span>
          </div>
        )}
      </div>
    );
  }

  // フォールバック：属性グラデーション + ラベル
  const label = fallbackLabel ?? (stage === "egg" ? "🥚" : name?.[0] ?? "？");

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-extrabold"
      style={{
        width: px,
        height: px,
        background: gradientForAttribute(primary, secondary),
        color: "#ffffff",
        fontSize,
        border: "2px solid var(--color-border)",
        boxShadow: "var(--clay-raised)",
      }}
      title={generating ? "相棒を育成中..." : name ?? "モンスター"}
    >
      {generating ? "✨" : label}
    </div>
  );
}
