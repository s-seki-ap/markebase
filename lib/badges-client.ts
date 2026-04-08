import badgeDefs from "@/data/badges.json";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  condition:
    | { type: "category_complete"; categoryId: string }
    | { type: "modules_completed"; count: number }
    | { type: "streak"; days: number }
    | { type: "xp_threshold"; xp: number };
}

export function getAllBadges(): BadgeDefinition[] {
  return badgeDefs as BadgeDefinition[];
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return getAllBadges().find((b) => b.id === id);
}
