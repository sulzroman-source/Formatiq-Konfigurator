import {
  GUEST_RECOMMENDATIONS,
  getSeatingOption,
  TENT_VARIANTS,
} from "@/config/stretchTentConfig";
import { SeatingSetup, TentSize, VariantSummaryData } from "@/types/stretchTent";

export const getVariantSummary = (
  size: TentSize,
  seating: SeatingSetup,
): VariantSummaryData => {
  const variant = TENT_VARIANTS[size];
  const seatingOption = getSeatingOption(size, seating);

  return {
    size,
    sizeLabel: variant.label,
    area: variant.area,
    seating,
    seatingLabel: seatingOption.label,
    guests: GUEST_RECOMMENDATIONS[size][seating],
    atmosphereLabel: seatingOption.atmosphereLabel,
    description: seatingOption.description,
  };
};
