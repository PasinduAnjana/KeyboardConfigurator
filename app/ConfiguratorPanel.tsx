"use client";

export interface KeyColors {
  lightBg: string;
  lightLabel: string;
  darkBg: string;
  darkLabel: string;
  base?: string;
}

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
}

export default function ConfiguratorPanel({ colors, onChange }: Props) {
  const active = activePreset(colors);

  return (
    <>
      {/* Desktop */}
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-zinc-800 bg-zinc-950/60 px-5 backdrop-blur-xl">
        <div className="flex h-full items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Keyboard Configurator
          </span>
        </div>
      </header>
      <aside className="fixed bottom-0 right-0 top-14 z-50 w-60 border-l border-zinc-800 bg-zinc-950/60 px-4 pb-4 pt-3 backdrop-blur-xl">
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
        </nav>
      </aside>

      {/* Mobile */}
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
      </div>
    </>
  );
}
