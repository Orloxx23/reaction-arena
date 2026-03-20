import { create } from "zustand";

const STORAGE_KEY = "rta-settings";

export interface SettingsState {
  pixelGrid: boolean;
  screenShake: boolean;
  glitchEffects: boolean;
  filmNoise: boolean;
  screenFlicker: boolean;
}

interface SettingsStore extends SettingsState {
  setOption: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetDefaults: () => void;
}

const defaults: SettingsState = {
  pixelGrid: true,
  screenShake: true,
  glitchEffects: true,
  filmNoise: true,
  screenFlicker: true,
};

function loadSettings(): SettingsState {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveSettings(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...loadSettings(),
  setOption: (key, value) =>
    set((s) => {
      const next = { ...s, [key]: value };
      saveSettings({
        pixelGrid: next.pixelGrid,
        screenShake: next.screenShake,
        glitchEffects: next.glitchEffects,
        filmNoise: next.filmNoise,
        screenFlicker: next.screenFlicker,
      });
      return next;
    }),
  resetDefaults: () =>
    set(() => {
      saveSettings(defaults);
      return { ...defaults };
    }),
}));
