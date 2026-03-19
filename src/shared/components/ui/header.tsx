"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type Locale } from "@/shared/i18n";
import { Icon } from "./icon";

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();

  const desktopLinks = [
    { href: "/", label: t.nav.arena },
    { href: "/play", label: t.nav.training },
    // { href: "/multiplayer", label: t.nav.multiplayer },
  ];

  const mobileLinks = [
    { href: "/", label: t.nav.arena, icon: "bolt" },
    { href: "/play", label: t.nav.training, icon: "fitness_center" },
    // { href: "/multiplayer", label: t.nav.rooms, icon: "groups" },
  ];

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-surface-container-low flex justify-between items-center w-full px-6 py-4 z-50 shrink-0">
        <Link
          href="/"
          className="text-xl font-bold tracking-widest text-[#00FF41] uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t.nav.brand}
        </Link>

        <div className="flex items-center gap-6">
          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 mr-4">
            {desktopLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-bold tracking-tighter transition-colors active:scale-90 ${
                    isActive
                      ? "text-[#00FF41]"
                      : "text-on-surface-variant hover:text-[#00FF41]"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Language switcher */}
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold tracking-widest uppercase text-on-surface-variant hover:text-[#00FF41] transition-colors border border-outline-variant/20 rounded-md cursor-pointer"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Icon name="translate" className="text-base" />
            <span>{locale === "en" ? "ES" : "EN"}</span>
          </button>
        </div>
      </header>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-low/80 backdrop-blur-xl z-50 border-t border-outline-variant/15 shadow-[0_-8px_32px_rgba(0,255,65,0.05)]">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-colors duration-200 ease-out ${
                isActive
                  ? "text-[#00FF41] bg-[#00FF41]/10 rounded-xl"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
              }`}
            >
              <Icon name={link.icon} />
              <span
                className="text-[10px] uppercase tracking-widest font-bold mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
