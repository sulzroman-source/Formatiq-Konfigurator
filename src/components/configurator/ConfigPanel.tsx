"use client";

import {
  getSeatingOption,
  PRODUCT_NAME,
  SEATING_OPTIONS,
  TENT_CATEGORIES,
  TENT_VARIANTS,
  TENT_VARIANTS_BY_CATEGORY,
} from "@/config/stretchTentConfig";
import { SeatingSetup, TentCategory, TentSize } from "@/types/stretchTent";

interface ConfigPanelProps {
  selectedCategory: TentCategory;
  onCategoryChange: (category: TentCategory) => void;
  selectedSize: TentSize;
  lightsEnabled: boolean;
  selectedSeating: SeatingSetup;
  onSizeChange: (size: TentSize) => void;
  onLightsToggle: (enabled: boolean) => void;
  onSeatingChange: (seating: SeatingSetup) => void;
}

const baseButtonClasses =
  "w-full rounded-[1.25rem] border px-4 py-4 text-left transition duration-200";

export function ConfigPanel({
  selectedCategory,
  onCategoryChange,
  selectedSize,
  lightsEnabled,
  selectedSeating,
  onSizeChange,
  onLightsToggle,
  onSeatingChange,
}: ConfigPanelProps) {
  const visibleSizes = TENT_VARIANTS_BY_CATEGORY[selectedCategory];

  return (
    <aside className="rounded-[2rem] border border-white/10 bg-moss/95 p-6 text-white shadow-soft backdrop-blur xl:p-8">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-white/[0.12] px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.28em] text-orange">
          FORMATIQ Configurator
        </span>
        <h1 className="mt-5 font-display text-4xl font-black leading-none tracking-[-0.04em] text-white xl:text-5xl">
          {PRODUCT_NAME}
        </h1>
        <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-white/70">
          Alle Varianten sind nach Small, Medium und Big gruppiert. Beim Oeffnen
          startet der Konfigurator mit der Small-Kategorie.
        </p>
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
            Kategorie
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Object.entries(TENT_CATEGORIES).map(([key, category]) => {
              const isActive = selectedCategory === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCategoryChange(key as TentCategory)}
                  className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition duration-200 ${
                    isActive
                      ? "border-orange/70 bg-orange text-white shadow-card"
                      : "border-white/10 bg-white/[0.06] text-white/70 hover:border-orange/40 hover:bg-orange/10 hover:text-white"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
            Zeltgroesse
          </p>
          <div className="mt-3 space-y-3">
            {visibleSizes.map((sizeKey) => {
              const variant = TENT_VARIANTS[sizeKey];
              const isActive = selectedSize === sizeKey;

              return (
                <button
                  key={sizeKey}
                  type="button"
                  onClick={() => onSizeChange(sizeKey)}
                  className={`${baseButtonClasses} ${
                    isActive
                      ? "border-orange/40 bg-orange text-white shadow-card"
                      : "border-white/10 bg-white/[0.06] text-white hover:border-orange/40 hover:bg-orange/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{variant.label}</p>
                      <p
                        className={`mt-1 text-sm ${
                          isActive ? "text-white/80" : "text-white/50"
                        }`}
                      >
                        {variant.area} m2 nutzbare Flaeche
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive
                          ? "bg-white/[0.15] text-white"
                          : "bg-white/10 text-orange"
                      }`}
                    >
                      {TENT_CATEGORIES[variant.category].label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
            Lampen
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onLightsToggle(true)}
              className={`${baseButtonClasses} px-3 py-3 ${
                lightsEnabled
                  ? "border-orange/60 bg-orange text-white shadow-card"
                  : "border-white/10 bg-white/[0.06] text-white hover:border-orange/40 hover:bg-orange/10"
              }`}
            >
              <p className="text-base font-semibold">Lampen an</p>
            </button>
            <button
              type="button"
              onClick={() => onLightsToggle(false)}
              className={`${baseButtonClasses} px-3 py-3 ${
                !lightsEnabled
                  ? "border-white/30 bg-white/[0.18] text-white shadow-card"
                  : "border-white/10 bg-white/[0.06] text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
              }`}
            >
              <p className="text-base font-semibold">Lampen aus</p>
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
            Bestuhlung
          </p>
          <div className="mt-3 space-y-3">
            {Object.entries(SEATING_OPTIONS).map(([key]) => {
              const isActive = selectedSeating === key;
              const displaySeating = getSeatingOption(selectedSize, key as SeatingSetup);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSeatingChange(key as SeatingSetup)}
                  className={`${baseButtonClasses} ${
                    isActive
                      ? "border-orange/50 bg-white text-moss shadow-card"
                      : "border-white/10 bg-white/[0.06] text-white hover:border-orange/40 hover:bg-orange/10"
                  }`}
                >
                  <p className="text-lg font-semibold">{displaySeating.label}</p>
                  <p
                    className={`mt-2 text-sm leading-6 ${
                      isActive ? "text-moss/70" : "text-white/60"
                    }`}
                  >
                    {displaySeating.atmosphereLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </aside>
  );
}

