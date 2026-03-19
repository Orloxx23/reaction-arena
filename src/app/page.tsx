"use client";

import Link from "next/link";
import { Header } from "@/shared/components/ui/header";
import { Icon } from "@/shared/components/ui/icon";

export default function Home() {
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
              System Online
            </span>
          </div>

          {/* Main title */}
          <h1
            className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-bold tracking-tighter leading-none mb-4 text-glow italic"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            REACTION TIME ARENA
          </h1>

          {/* Subtitle */}
          <p
            className="tracking-widest text-on-surface-variant font-light uppercase mb-16"
            style={{ fontFamily: "var(--font-body)" }}
          >
            TEST YOUR REFLEXES
          </p>

          {/* CTA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <Link
              href="/play"
              className="group relative flex items-center justify-between px-8 py-6 bg-primary-container text-on-primary font-bold text-xl tracking-tight transition-all duration-300 hover:bg-primary-fixed hover:shadow-[0_0_32px_rgba(0,236,59,0.2)] active:scale-95 rounded-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span>PLAY SOLO</span>
              <Icon
                name="bolt"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <Link
              href="/multiplayer"
              className="group relative flex items-center justify-between px-8 py-6 bg-surface-container-highest text-on-surface font-bold text-xl tracking-tight transition-all duration-300 hover:bg-surface-bright active:scale-95 rounded-lg outline outline-1 outline-outline-variant/15"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span>PLAY MULTIPLAYER</span>
              <Icon
                name="groups"
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Stats Bar */}
          {/* <div className="mt-24 grid grid-cols-3 gap-12 border-t border-outline-variant/15 pt-12">
            {[
              { label: "Players Active", value: "12.4K" },
              { label: "Avg. Reaction", value: "194", suffix: "MS" },
              { label: "Global Rank", value: "#1.2K" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-on-surface-variant text-sm uppercase tracking-widest mb-2">
                  {stat.label}
                </span>
                <span
                  className="text-3xl font-bold text-primary"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm ml-1 font-light">{stat.suffix}</span>
                  )}
                </span>
              </div>
            ))}
          </div> */}
        </div>
      </main>

      {/* Floating HUD - Live Feed (left) */}
      {/* <div className="hidden lg:block fixed left-8 bottom-32 w-64 p-6 bg-surface-variant/60 backdrop-blur-xl rounded-xl border border-outline-variant/15">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-bold tracking-widest uppercase text-on-surface">
            Live Feed
          </span>
        </div>
        <div className="space-y-4">
          {[
            { name: "Viper_RX", time: "142ms" },
            { name: "Ghost_Protocol", time: "155ms" },
            { name: "Neon_Drifter", time: "168ms" },
          ].map((entry) => (
            <div key={entry.name} className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">{entry.name}</span>
              <span className="text-primary font-bold">{entry.time}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Floating HUD - Performance (right) */}
      {/* <div className="hidden lg:block fixed right-8 bottom-32 w-64 p-6 bg-surface-variant/60 backdrop-blur-xl rounded-xl border border-outline-variant/15">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="trending_up" className="text-primary" />
          <span className="text-sm font-bold tracking-widest uppercase text-on-surface">
            Performance
          </span>
        </div>
        <div className="h-16 flex items-end gap-1 px-1">
          <div className="flex-grow bg-primary/20 h-8 rounded-sm" />
          <div className="flex-grow bg-primary/40 h-12 rounded-sm" />
          <div className="flex-grow bg-primary/10 h-6 rounded-sm" />
          <div className="flex-grow bg-primary/60 h-14 rounded-sm" />
          <div className="flex-grow bg-primary h-16 rounded-sm" />
          <div className="flex-grow bg-primary/30 h-10 rounded-sm" />
        </div>
        <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant mt-3 text-center">
          Consistency: 98.4%
        </p>
      </div> */}
    </div>
  );
}
