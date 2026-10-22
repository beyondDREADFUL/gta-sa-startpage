import { DEFAULT_ENGINE_IDS, SearchEngine, BUILT_IN_ENGINES } from "./searchEngines";

export type Layout = "oneColumn" | "twoColumns";
export type ClockFormat = "24h" | "12h" | "off";

export interface Settings {
  background: string;
  layout: Layout;
  clock: ClockFormat;
  showDate: boolean;
  soundEnabled: boolean;
  volume: number;
  searchEngines: string[];
  customSearchEngines: SearchEngine[];
}

export const BACKGROUNDS = ["bg1", "bg2", "bg3", "bg4", "bg5", "bg6"];

export const DEFAULT_SETTINGS: Settings = {
  background: "bg1",
  layout: "oneColumn",
  clock: "24h",
  showDate: true,
  soundEnabled: true,
  volume: 1,
  searchEngines: DEFAULT_ENGINE_IDS,
  customSearchEngines: [],
};

// Keys match what earlier versions stored, so existing settings carry over
function read<T>(key: string, parse: (raw: string) => T | undefined, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = parse(raw);
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

function parseCustomEngines(raw: string): SearchEngine[] | undefined {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return undefined;
  return parsed
    .filter((e) => e && typeof e.id === "string" && typeof e.url === "string")
    .map((e) => ({ id: e.id, name: String(e.name ?? e.id), url: e.url }));
}

export function loadSettings(): Settings {
  const d = DEFAULT_SETTINGS;
  const customSearchEngines = read("customSearchEngines", parseCustomEngines, d.customSearchEngines);
  const knownIds = [...BUILT_IN_ENGINES, ...customSearchEngines].map((e) => e.id);

  return {
    background: read("background", (r) => (BACKGROUNDS.includes(r) ? r : undefined), d.background),
    layout: read("layout", (r) => (r === "twoColumns" ? "twoColumns" : "oneColumn"), d.layout),
    clock: read("clock", (r) => (["24h", "12h", "off"].includes(r) ? (r as ClockFormat) : undefined), d.clock),
    showDate: read("showDate", (r) => r !== "false", d.showDate),
    soundEnabled: read("soundEnabled", (r) => r !== "false", d.soundEnabled),
    volume: read("volume", (r) => {
      const v = parseFloat(r);
      return v >= 0 && v <= 1 ? v : undefined;
    }, d.volume),
    searchEngines: read("searchEngines", (r) => {
      const parsed = JSON.parse(r);
      if (!Array.isArray(parsed)) return undefined;
      const valid = parsed.filter((id) => knownIds.includes(id));
      // Fall back to the default when only removed engines (e.g. "lucky") were saved
      return parsed.length > 0 && valid.length === 0 ? undefined : valid;
    }, d.searchEngines),
    customSearchEngines,
  };
}

export function saveSettings(settings: Settings) {
  for (const [key, value] of Object.entries(settings)) {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }
}
