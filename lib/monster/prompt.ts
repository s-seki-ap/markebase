import { type Attribute, type MonsterStage, ATTRIBUTE_META, getSpeciesName } from "./attributes";

const STAGE_DESCRIPTION: Record<MonsterStage, string> = {
  egg: "a small glowing egg with faint rune markings, tiny cracks of warm light, nestled on a soft cushion, no creature visible yet",
  baby: "a small round baby creature, tiny limbs, oversized head, innocent big eyes, chubby and adorable, just hatched from an egg",
  teen: "a more defined juvenile creature, slightly elongated body, growing features, confident curious pose, slightly taller than the baby form",
  adult: "a fully grown noble creature, refined elegant silhouette, majestic posture, subtle radiant aura, powerful but friendly expression",
};

const ATTRIBUTE_VISUAL: Record<Attribute, string> = {
  earth:
    "earthen rocky plating on shoulders and back, small green leaves sprouting from the body, wooden bark-like accents, sturdy grounded stance",
  arcana:
    "swirling magical wisps floating around the body, tiny glowing runes in the air, small crystal fragments embedded in the skin, flowing cloak-like tail",
  oracle:
    "a bright starry gem on the forehead, large observing eyes with constellation patterns, tiny celestial markings on the body, cosmic shimmer",
  tactics:
    "lightweight ornamental armor plates on the chest and shoulders, a small ceremonial cape or banner, tactical markings, a noble fox-like silhouette",
};

export interface PromptParams {
  stage: MonsterStage;
  primary: Attribute | null;
  secondary: Attribute | null;
  nickname?: string;
}

export function buildImagenPrompt(params: PromptParams): string {
  const { stage, primary, secondary } = params;
  const speciesName = getSpeciesName(stage, primary);

  const stageDesc = STAGE_DESCRIPTION[stage];

  // 卵段階は属性関係なし
  if (stage === "egg") {
    return [
      "A cute mascot in Pokémon-inspired chibi style.",
      `Subject: "${speciesName}", a mysterious glowing egg about to hatch.`,
      `Form: ${stageDesc}.`,
      "Color palette: soft pastel tones with warm cream and gentle golden light.",
      "Art style: claymorphism, rounded puffy shapes, smooth gradient shading, friendly warm atmosphere, official Pokémon artwork style.",
      "Composition: single object, centered, front-facing, fully visible, plain white background, no text, no border, no signature.",
      "Rendering: high quality digital illustration, clean lines, 3D-like soft lighting, matte finish.",
    ].join(" ");
  }

  const primaryVisual = primary ? ATTRIBUTE_VISUAL[primary] : "";
  const primaryColor = primary ? ATTRIBUTE_META[primary].colorName : "soft pastel";

  let secondaryLine = "";
  let secondaryAccent = "";
  if (secondary && secondary !== primary) {
    const secVisual = ATTRIBUTE_VISUAL[secondary];
    secondaryLine = `Secondary trait: subtle ${secVisual}, blended gracefully into the overall design without overwhelming the primary look.`;
    secondaryAccent = ` and ${ATTRIBUTE_META[secondary].colorName} highlights on small accents`;
  }

  return [
    "A cute mascot creature in Pokémon-inspired chibi style.",
    `Subject: a creature species named "${speciesName}", friendly and approachable.`,
    `Evolution stage: ${stageDesc}.`,
    `Primary trait: ${primaryVisual}.`,
    secondaryLine,
    `Color palette: soft pastel tones with ${primaryColor} as the main accent color${secondaryAccent}.`,
    "Art style: claymorphism, rounded puffy shapes, smooth gradient shading, large friendly eyes with highlights, cheerful expression, official Pokémon artwork style.",
    "Composition: single character, centered, front-facing, full body visible, standing or floating pose, plain white background, no text, no border, no signature, no additional characters.",
    "Rendering: high quality digital illustration, clean lines, 3D-like soft lighting, matte finish.",
  ]
    .filter(Boolean)
    .join(" ");
}
