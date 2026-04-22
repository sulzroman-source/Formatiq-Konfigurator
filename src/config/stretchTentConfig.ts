import {
  SeatingOption,
  SeatingSetup,
  TentCategory,
  TentCategoryOption,
  TentSize,
  TentVariant,
} from "@/types/stretchTent";

export const PRODUCT_NAME = "Stretch Tent - Fliegender Aufbau";

export const DEFAULT_TENT_CATEGORY: TentCategory = "small";
export const DEFAULT_TENT_SIZE: TentSize = "7_5x10";

export const TENT_CATEGORIES: Record<TentCategory, TentCategoryOption> = {
  small: {
    label: "Small",
    description: "Kompakte Formate fuer kleinere Setups.",
  },
  medium: {
    label: "Medium",
    description: "Mittlere Formate fuer vielseitige Eventflaechen.",
  },
  big: {
    label: "Big",
    description: "Grosse Formate fuer weitlaeufige Aufbauten.",
  },
};

export const TENT_VARIANTS: Record<TentSize, TentVariant> = {
  "7_5x10": {
    label: "7,5 m x 10 m",
    category: "small",
    width: 7.5,
    depth: 10,
    area: 75,
  },
  "6x9": {
    label: "6 m x 9 m",
    category: "small",
    width: 6,
    depth: 9,
    area: 54,
  },
  "8x12": {
    label: "8 m x 12 m",
    category: "medium",
    width: 8,
    depth: 12,
    area: 96,
  },
  "10x10": {
    label: "10 m x 10 m",
    category: "medium",
    width: 10,
    depth: 10,
    area: 100,
  },
  "10x15": {
    label: "10 m x 15 m",
    category: "medium",
    width: 10,
    depth: 15,
    area: 150,
  },
  "20x10": {
    label: "20 m x 10 m",
    category: "big",
    width: 20,
    depth: 10,
    area: 200,
  },
  "20x15": {
    label: "20 m x 15 m",
    category: "big",
    width: 20,
    depth: 15,
    area: 300,
  },
};

export const TENT_VARIANTS_BY_CATEGORY: Record<TentCategory, TentSize[]> = {
  small: ["7_5x10", "6x9"],
  medium: ["8x12", "10x10", "10x15"],
  big: ["20x10", "20x15"],
};

export const SEATING_OPTIONS: Record<SeatingSetup, SeatingOption> = {
  party: {
    label: "Standing Cocktail+",
    atmosphereLabel: "Offen · stehend · kommunikativ",
    description:
      "Stehendes Cocktail-Setup fuer Empfang, Networking und flexible Eventflaechen mit mehr Bewegung.",
  },
  dinner: {
    label: "Dinner",
    atmosphereLabel: "Strukturiert · hochwertig · ruhig",
    description:
      "Klassisches Setup mit Tischen und klarer Struktur fuer gesetzte Dinner-Events und elegante Anlaesse.",
  },
  kino: {
    label: "Kino",
    atmosphereLabel: "Fokussiert · szenisch · immersiv",
    description:
      "Gerichtete Bestuhlung fuer Praesentationen, Filmabende oder Screenings mit klarem Fokus nach vorne.",
  },
};

export const getSeatingOption = (
  _size: TentSize,
  seating: SeatingSetup,
): SeatingOption => {
  return SEATING_OPTIONS[seating];
};

export const GUEST_RECOMMENDATIONS: Record<
  TentSize,
  Record<SeatingSetup, number>
> = {
  "7_5x10": { party: 60, dinner: 40, kino: 50 },
  "6x9": { party: 45, dinner: 30, kino: 40 },
  "8x12": { party: 80, dinner: 56, kino: 68 },
  "10x10": { party: 90, dinner: 60, kino: 80 },
  "10x15": { party: 130, dinner: 90, kino: 115 },
  "20x10": { party: 180, dinner: 120, kino: 160 },
  "20x15": { party: 270, dinner: 180, kino: 240 },
};
