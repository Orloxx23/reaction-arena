"use client";

import { useState } from "react";
import { Icon } from "@/shared/components/ui/icon";
import { useI18n } from "@/shared/i18n";

interface NicknameFormProps {
  onSubmit: (nickname: string) => void;
}

export function NicknameForm({ onSubmit }: NicknameFormProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length >= 2 && trimmed.length <= 16) {
      onSubmit(trimmed);
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 border border-outline-variant/15 rounded-lg shadow-2xl relative overflow-hidden">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent opacity-50" />

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold tracking-tighter uppercase text-on-surface mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.multiplayer.initializeProfile}
          </h2>
          <p className="text-xs tracking-widest text-on-surface-variant uppercase">
            {t.multiplayer.enterArena}
          </p>
        </div>

        <div className="space-y-8">
          {/* Nickname input */}
          <div className="relative group">
            <label
              className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3 font-bold"
              htmlFor="nickname"
            >
              {t.multiplayer.nickname}
            </label>
            <input
              id="nickname"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowError(false);
              }}
              placeholder={t.multiplayer.nicknamePlaceholder}
              maxLength={16}
              minLength={2}
              autoFocus
              className="w-full bg-surface-container-highest border border-outline-variant/30 px-5 py-4 text-lg tracking-wide focus:outline-none focus:ring-0 neon-focus transition-all placeholder:text-outline/40 text-on-surface rounded"
              style={{ fontFamily: "var(--font-heading)" }}
            />
            {showError && (
              <div className="mt-2 flex items-center gap-2 text-error text-[11px] font-medium uppercase tracking-wider opacity-80">
                <Icon name="error" className="text-sm" />
                <span>{t.multiplayer.nameRequired}</span>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-bold py-5 text-sm tracking-[0.25em] transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase rounded neon-glow flex items-center justify-center gap-2 group"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.multiplayer.joinGame}
            <Icon
              name="bolt"
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {/* Fine print */}
          <div className="text-center">
            <p className="text-[10px] text-outline tracking-widest uppercase">
              {t.multiplayer.arenaProtocols}
            </p>
          </div>
        </div>
      </form>

      {/* Decorative bolt icon */}
      <div className="absolute -bottom-12 -right-12 opacity-5 pointer-events-none">
        <Icon name="bolt" filled size="160px" />
      </div>
    </div>
  );
}
