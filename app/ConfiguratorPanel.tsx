"use client";

export interface KeyColors {
  lightBg: string;
  lightLabel: string;
  darkBg: string;
  darkLabel: string;
  base?: string;
}

export type DarkKeyMode = "idle" | "add" | "remove";

export const PRESETS: { name: string; colors: KeyColors }[] = [
  {
    name: "Default",
    colors: {
      lightBg: "#E7A779",
      lightLabel: "#663919",
      darkBg: "#663919",
      darkLabel: "#E7A779",
      base: "#57372A",
    },
  },
  {
    name: "Dolch",
    colors: {
      lightBg: "#888888",
      lightLabel: "#222222",
      darkBg: "#222222",
      darkLabel: "#888888",
      base: "#141414",
    },
  },
  {
    name: "Retro",
    colors: {
      lightBg: "#D4B48C",
      lightLabel: "#4A3520",
      darkBg: "#4A3520",
      darkLabel: "#D4B48C",
      base: "#2C2416",
    },
  },
  {
    name: "Sakura",
    colors: {
      lightBg: "#F5C6C6",
      lightLabel: "#B34D4D",
      darkBg: "#B34D4D",
      darkLabel: "#F5C6C6",
      base: "#4A2A2A",
    },
  },
  {
    name: "Ocean",
    colors: {
      lightBg: "#7EC8E3",
      lightLabel: "#1A4A6E",
      darkBg: "#1A4A6E",
      darkLabel: "#7EC8E3",
      base: "#0F1A2E",
    },
  },
];

function activePreset(colors: KeyColors): string | null {
  for (const p of PRESETS) {
    if (
      p.colors.lightBg === colors.lightBg &&
      p.colors.lightLabel === colors.lightLabel &&
      p.colors.darkBg === colors.darkBg &&
      p.colors.darkLabel === colors.darkLabel &&
      p.colors.base === colors.base
    )
      return p.name;
  }
  return null;
}

function Strip({ colors: c }: { colors: KeyColors }) {
  return (
    <span className="flex -space-x-0.5 overflow-hidden rounded-sm">
      <span
        className="inline-block size-4"
        style={{ backgroundColor: c.lightBg }}
      />
      <span
        className="inline-block size-4"
        style={{ backgroundColor: c.darkBg }}
      />
      {c.base && (
        <span
          className="inline-block size-4"
          style={{ backgroundColor: c.base }}
        />
      )}
    </span>
  );
}

interface Props {
  colors: KeyColors;
  onChange: (colors: KeyColors) => void;
  darkKeysEnabled: boolean;
  onDarkKeysEnabledChange: (enabled: boolean) => void;
  darkKeyMode: DarkKeyMode;
  onDarkKeyModeChange: (mode: DarkKeyMode) => void;
}

export default function ConfiguratorPanel({
  colors, onChange,
  darkKeysEnabled, onDarkKeysEnabledChange,
  darkKeyMode, onDarkKeyModeChange,
}: Props) {
  const active = activePreset(colors);
  return (
    <nav className="flex flex-col gap-1">
      {PRESETS.map((preset) => {
        const isActive = preset.name === active;
        return (
          <button
            key={preset.name}
            onClick={() => onChange(preset.colors)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              isActive
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
            }`}
          >
            <Strip colors={preset.colors} />
            {preset.name}
          </button>
        );
      })}

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-2">
        <span className="text-xs font-medium text-zinc-400">DARK KEYS</span>
        <button
          onClick={() => onDarkKeysEnabledChange(!darkKeysEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            darkKeysEnabled ? "bg-zinc-300" : "bg-zinc-800"
          }`}
          aria-label="Toggle dark keys"
        >
          <span
            className={`inline-block size-4 rounded-full bg-white transition-transform ${
              darkKeysEnabled ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {darkKeysEnabled && (
        <div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onDarkKeyModeChange(darkKeyMode === "add" ? "idle" : "add")}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
                darkKeyMode === "add"
                  ? "bg-white text-black shadow-sm"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              + Add
            </button>
            <button
              onClick={() => onDarkKeyModeChange(darkKeyMode === "remove" ? "idle" : "remove")}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
                darkKeyMode === "remove"
                  ? "bg-white text-black shadow-sm"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              - Remove
            </button>
          </div>
          {darkKeyMode !== "idle" && (
            <p className="mt-1.5 text-[10px] text-zinc-500 text-center">
              {darkKeyMode === "add"
                ? "Click a key to add it"
                : "Click a key to remove it"}
            </p>
          )}
        </div>
      )}
    </nav>
  );
}

export function MobileWidget({
  colors, onChange,
  darkKeysEnabled, onDarkKeysEnabledChange,
  darkKeyMode, onDarkKeyModeChange,
}: Props) {
  const active = activePreset(colors);
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur-xl lg:hidden">
      <nav className="flex justify-center gap-1">
        {PRESETS.map((preset) => {
          const isActive = preset.name === active;
          return (
            <button
              key={preset.name}
              onClick={() => onChange(preset.colors)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all ${
                isActive
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
            >
              <Strip colors={preset.colors} />
              {preset.name}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-800">
        <span className="text-[10px] font-medium text-zinc-400">DARK KEYS</span>
        <button
          onClick={() => onDarkKeysEnabledChange(!darkKeysEnabled)}
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            darkKeysEnabled ? "bg-zinc-300" : "bg-zinc-800"
          }`}
          aria-label="Toggle dark keys"
        >
          <span
            className={`inline-block size-3 rounded-full bg-white transition-transform ${
              darkKeysEnabled ? "translate-x-[14px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {darkKeysEnabled && (
        <div className="flex gap-1 mt-1.5">
          <button
            onClick={() => onDarkKeyModeChange(darkKeyMode === "add" ? "idle" : "add")}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
              darkKeyMode === "add"
                ? "bg-white text-black shadow-sm"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            +Add
          </button>
          <button
            onClick={() => onDarkKeyModeChange(darkKeyMode === "remove" ? "idle" : "remove")}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
              darkKeyMode === "remove"
                ? "bg-white text-black shadow-sm"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            -Remove
          </button>
        </div>
      )}
    </div>
  );
}
