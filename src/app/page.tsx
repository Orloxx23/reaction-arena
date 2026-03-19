"use client";

import Link from "next/link";
import { Header } from "@/shared/components/ui/header";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-dvh bg-mesh">
      <Header />

      {/* Main Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[800px] h-[800px] bg-primary-dim/5 blur-[120px] rounded-full" />
        </div>

        {/* Hero Section */}
        <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
          {/* System Online label */}
          <div className="mb-2">
            <span
              className="text-primary text-sm font-bold tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.home.systemOnline}
            </span>
          </div>

          {/* Main title */}
          <h1
            className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-bold tracking-tighter leading-none mb-4 text-glow italic"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.home.title}
          </h1>

          {/* Subtitle */}
          <p
            className="tracking-widest text-on-surface-variant font-light uppercase mb-16"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.home.subtitle}
          </p>

          {/* CTA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full max-w-2xl">
            <Link
              href="/play"
              className="w-full group relative flex items-center justify-between px-8 py-6 bg-primary-container text-on-primary font-bold text-xl tracking-tight transition-all duration-300 hover:bg-primary-fixed hover:shadow-[0_0_32px_rgba(0,236,59,0.2)] active:scale-95 rounded-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span>{t.home.playSolo}</span>
              <Icon
                name="bolt"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
