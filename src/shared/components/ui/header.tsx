"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const desktopLinks = [
  { href: "/", label: "Arena" },
  { href: "/play", label: "Training" },
  { href: "/multiplayer", label: "Multiplayer" },
];

const mobileLinks = [
  { href: "/", label: "Arena", icon: "bolt" },
  { href: "/play", label: "Training", icon: "fitness_center" },
  { href: "/multiplayer", label: "Rooms", icon: "groups" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Bar */}
      <header className="bg-surface-container-low flex justify-between items-center w-full px-6 py-4 z-50 shrink-0">
        <Link
          href="/"
          className="text-xl font-bold tracking-widest text-[#00FF41] uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Reaction Time Arena
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

          {/* Icon buttons */}
          {/* <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-[#00FF41] transition-colors active:scale-90">
              <Icon name="military_tech" />
            </button>
            <button className="text-on-surface-variant hover:text-[#00FF41] transition-colors active:scale-90">
              <Icon name="account_circle" />
            </button>
          </div> */}
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
