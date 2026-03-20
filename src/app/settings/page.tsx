"use client";

import { useEffect } from "react";
import { Header } from "@/shared/components/ui/header";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";
import { useSettingsStore, type SettingsState } from "@/shared/store/settings-store";

interface ToggleOption {
  key: keyof SettingsState;
  label: string;
  description: string;
  icon: string;
}

function SettingsToggle({
  option,
  checked,
  onChange,
}: {
  option: ToggleOption;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg border transition-all duration-200 cursor-pointer select-none ${
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-outline-variant/15 bg-surface-container-low/50 opacity-60"
      }`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          checked
            ? "bg-primary/15 text-primary"
            : "bg-surface-container-highest text-on-surface-variant"
        }`}
      >
        <Icon name={option.icon} className="text-xl" />
      </div>

      <div className="flex-grow text-left">
        <p
          className="text-sm font-bold tracking-wider uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {option.label}
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {option.description}
        </p>
      </div>

      {/* Toggle switch */}
      <div
        className={`shrink-0 w-11 h-6 rounded-full relative transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-outline-variant/40"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const settings = useSettingsStore();

  useEffect(() => {
    settings.hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const options: ToggleOption[] = [
    {
      key: "pixelGrid",
      label: t.settings.pixelGrid,
      description: t.settings.pixelGridDesc,
      icon: "grid_on",
    },
    {
      key: "screenShake",
      label: t.settings.screenShake,
      description: t.settings.screenShakeDesc,
      icon: "vibration",
    },
    {
      key: "glitchEffects",
      label: t.settings.glitchEffects,
      description: t.settings.glitchEffectsDesc,
      icon: "broken_image",
    },
    {
      key: "filmNoise",
      label: t.settings.filmNoise,
      description: t.settings.filmNoiseDesc,
      icon: "grain",
    },
    {
      key: "screenFlicker",
      label: t.settings.screenFlicker,
      description: t.settings.screenFlickerDesc,
      icon: "flashlight_on",
    },
  ];

  const allOff = options.every((o) => !settings[o.key]);

  return (
    <div className="flex flex-col min-h-dvh bg-mesh">
      <Header />

      <main className="flex-grow flex flex-col items-center px-6 pt-12 pb-28 relative">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[600px] h-[600px] bg-primary-dim/5 blur-[120px] rounded-full" />
        </div>

        <div className="z-10 w-full max-w-lg">
          {/* Title */}
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">
              <Icon name="settings" className="text-base align-middle mr-1" />
              {t.settings.subtitle}
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tighter text-glow italic"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.settings.title}
            </h1>
          </div>

          {!settings.hydrated ? (
            <div className="flex flex-col gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-18 rounded-lg border border-outline-variant/15 bg-surface-container-low/50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Visual Effects section */}
              <div className="mb-6">
                <h2
                  className="text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant mb-4 px-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {t.settings.visualEffects}
                </h2>

                <div className="flex flex-col gap-2">
                  {options.map((option) => (
                    <SettingsToggle
                      key={option.key}
                      option={option}
                      checked={settings[option.key]}
                      onChange={(val) => settings.setOption(option.key, val)}
                    />
                  ))}
                </div>
              </div>

              {/* Warning when all off */}
              {allOff && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-error/30 bg-error/5 mb-6">
                  <Icon name="visibility_off" className="text-error text-xl" />
                  <p className="text-xs text-error font-bold uppercase tracking-wider">
                    {t.settings.allEffectsOff}
                  </p>
                </div>
              )}

              {/* Reset button */}
              <button
                type="button"
                onClick={settings.resetDefaults}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-outline-variant/20 rounded-lg text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40 transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Icon name="restart_alt" className="text-lg" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  {t.settings.resetDefaults}
                </span>
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
