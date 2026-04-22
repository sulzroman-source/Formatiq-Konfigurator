import { StretchTentConfigurator } from "@/components/configurator/StretchTentConfigurator";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-[1540px] px-4 py-4 md:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-olive/90 px-5 py-4 shadow-soft backdrop-blur md:px-8">
          <Image
            src="/brand/formatiq-logo.png"
            alt="Formatiq"
            width={320}
            height={56}
            className="h-8 w-auto md:h-10"
          />
          <nav className="hidden items-center gap-7 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/80 lg:flex">
            <span className="text-orange">Home</span>
            <span>Stretch Tents</span>
            <span>Strukturen</span>
            <span>Beleuchtung</span>
            <span>Services</span>
            <span>Kontakt</span>
          </nav>
        </header>

        <section className="mb-6 overflow-hidden rounded-[2.1rem] border border-white/10 bg-moss shadow-soft">
          <div className="relative px-6 py-10 md:px-10 lg:px-14">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_38%),radial-gradient(circle_at_78%_20%,rgba(247,147,0,0.18),transparent_26%)]" />
            <div className="relative max-w-5xl">
              <span className="inline-flex rounded-2xl bg-white/[0.18] px-5 py-2 text-xs font-black uppercase tracking-[0.44em] text-white shadow-card">
                Stretch Tents
              </span>
              <h1 className="mt-7 max-w-4xl font-display text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white md:text-6xl">
                Die exklusive Konfiguration fuer flexible Eventueberdachungen.
              </h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-white/80 md:text-lg">
                FORMATIQ steht fuer flexible, hochwertige Ueberdachungsloesungen.
                Dieser Konfigurator bringt Groesse, Bestuhlung und Beleuchtung in
                eine klare digitale Produktpraesentation.
              </p>
              <a
                href="#konfigurator"
                className="mt-8 inline-flex rounded-2xl bg-orange px-7 py-4 text-xs font-black uppercase tracking-[0.22em] text-white shadow-card transition hover:bg-[#ffab25]"
              >
                Konfigurieren
              </a>
            </div>
          </div>
        </section>

        <section id="konfigurator">
          <StretchTentConfigurator />
        </section>
      </div>
    </main>
  );
}

