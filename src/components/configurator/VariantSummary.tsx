import { VariantSummaryData } from "@/types/stretchTent";

interface VariantSummaryProps {
  summary: VariantSummaryData;
}

export function VariantSummary({ summary }: VariantSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 text-white shadow-card backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
          Gewaehlte Groesse
        </p>
        <p className="mt-4 text-2xl font-black text-white">{summary.sizeLabel}</p>
      </article>

      <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 text-white shadow-card backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
          Flaeche
        </p>
        <p className="mt-4 text-2xl font-black text-white">{summary.area} m2</p>
      </article>

      <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 text-white shadow-card backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
          Bestuhlung
        </p>
        <p className="mt-4 text-2xl font-black text-white">{summary.seatingLabel}</p>
      </article>

      <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 text-white shadow-card backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
          Gaestezahl
        </p>
        <p className="mt-4 text-2xl font-black text-white">{summary.guests}</p>
      </article>

      <article className="rounded-[1.5rem] border border-orange/35 bg-orange/[0.15] p-6 text-white shadow-card backdrop-blur md:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange">
          Atmosphaere
        </p>
        <p className="mt-4 text-lg font-black text-white">{summary.atmosphereLabel}</p>
      </article>

      <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-6 text-white shadow-card backdrop-blur md:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange">
          Setup-Beschreibung
        </p>
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/70">
          {summary.description}
        </p>
      </article>
    </section>
  );
}

