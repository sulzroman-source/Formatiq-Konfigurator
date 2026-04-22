"use client";

import { ConfigPanel } from "@/components/configurator/ConfigPanel";
import { ModelStage } from "@/components/configurator/ModelStage";
import { VariantSummary } from "@/components/configurator/VariantSummary";
import { useStretchTentConfigurator } from "@/hooks/useStretchTentConfigurator";

export function StretchTentConfigurator() {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSize,
    setSelectedSize,
    lightsEnabled,
    setLightsEnabled,
    selectedSeating,
    setSelectedSeating,
    summary,
  } =
    useStretchTentConfigurator();

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-8">
      <ConfigPanel
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSize={selectedSize}
        lightsEnabled={lightsEnabled}
        selectedSeating={selectedSeating}
        onSizeChange={setSelectedSize}
        onLightsToggle={setLightsEnabled}
        onSeatingChange={setSelectedSeating}
      />

      <div className="space-y-6 xl:space-y-8">
        <ModelStage
          lightsEnabled={lightsEnabled}
          selectedSize={selectedSize}
          selectedSeating={selectedSeating}
        />
        <VariantSummary summary={summary} />
      </div>
    </div>
  );
}
