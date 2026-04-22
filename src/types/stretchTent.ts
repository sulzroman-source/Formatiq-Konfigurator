export type TentCategory = "small" | "medium" | "big";

export type TentSize =
  | "7_5x10"
  | "6x9"
  | "8x12"
  | "10x10"
  | "10x15"
  | "20x10"
  | "20x15";

export type SeatingSetup = "party" | "dinner" | "kino";

export interface TentCategoryOption {
  label: string;
  description: string;
}

export interface TentVariant {
  label: string;
  category: TentCategory;
  width: number;
  depth: number;
  area: number;
}

export interface SeatingOption {
  label: string;
  atmosphereLabel: string;
  description: string;
}

export interface VariantSummaryData {
  size: TentSize;
  sizeLabel: string;
  area: number;
  seating: SeatingSetup;
  seatingLabel: string;
  guests: number;
  atmosphereLabel: string;
  description: string;
}
