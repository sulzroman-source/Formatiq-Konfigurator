"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_TENT_CATEGORY,
  DEFAULT_TENT_SIZE,
  TENT_VARIANTS,
  TENT_VARIANTS_BY_CATEGORY,
} from "@/config/stretchTentConfig";
import { getVariantSummary } from "@/lib/variantMeta";
import { SeatingSetup, TentCategory, TentSize } from "@/types/stretchTent";

const DEFAULT_SEATING: SeatingSetup = "party";

export const useStretchTentConfigurator = () => {
  const [selectedCategory, setSelectedCategoryState] =
    useState<TentCategory>(DEFAULT_TENT_CATEGORY);
  const [selectedSize, setSelectedSizeState] =
    useState<TentSize>(DEFAULT_TENT_SIZE);
  const [lightsEnabled, setLightsEnabled] = useState(true);
  const [selectedSeating, setSelectedSeating] =
    useState<SeatingSetup>(DEFAULT_SEATING);

  const setSelectedCategory = (category: TentCategory) => {
    setSelectedCategoryState(category);
    setSelectedSizeState(TENT_VARIANTS_BY_CATEGORY[category][0]);
  };

  const setSelectedSize = (size: TentSize) => {
    setSelectedSizeState(size);
    setSelectedCategoryState(TENT_VARIANTS[size].category);
  };

  const summary = useMemo(
    () => getVariantSummary(selectedSize, selectedSeating),
    [selectedSeating, selectedSize],
  );

  return {
    selectedCategory,
    setSelectedCategory,
    selectedSize,
    setSelectedSize,
    lightsEnabled,
    setLightsEnabled,
    selectedSeating,
    setSelectedSeating,
    summary,
  };
};
