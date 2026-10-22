import { useEffect, useRef, useState } from "preact/hooks";
import { Website } from "../../db";
import { Settings } from "../../settings";
import { isTyping, useMenuNavigation } from "../../hooks/useMenuNavigation";
import { playSound } from "../../utils/audioUtils";
import { KeyHints, MenuButton } from "../ui";
import WebsitesSettings from "./WebsitesSettings";
import SearchSettings from "./SearchSettings";
import DisplaySettings from "./DisplaySettings";
import AudioSettings from "./AudioSettings";
import DataSettings from "./DataSettings";

export interface SettingsSectionProps {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  websites: Website[];
  refreshWebsites: () => Promise<void>;
  reloadAll: () => Promise<void>;
}

const TABS = [
  { id: "websites", label: "Websites", Section: WebsitesSettings },
  { id: "search", label: "Search", Section: SearchSettings },
  { id: "display", label: "Display", Section: DisplaySettings },
  { id: "audio", label: "Audio", Section: AudioSettings },
  { id: "data", label: "Data", Section: DataSettings },
];

interface SettingsMenuProps extends SettingsSectionProps {
  close: () => void;
}

export default function SettingsMenu({ close, ...sectionProps }: SettingsMenuProps) {
  const [tab, setTab] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { Section } = TABS[tab];

  useMenuNavigation(contentRef, { onBack: close });

  // Q / E switch tabs, like the shoulder buttons in the game
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
      const direction = event.key === "q" ? -1 : event.key === "e" ? 1 : 0;
      if (!direction) return;
      playSound("select");
      setTab((t) => (t + direction + TABS.length) % TABS.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  return (
    <div class="flex h-full flex-col">
      <header class="pt-12 md:pt-16 pb-6 max-w-[640px]">
        <h1 class="font-beckett text-sa-title text-5xl md:text-6xl leading-none mb-6">Options</h1>
        <div role="tablist" class="flex flex-wrap gap-x-7 gap-y-2 border-b border-sa-line pb-3">
          {TABS.map(({ id, label }, index) => (
            <MenuButton
              key={id}
              role="tab"
              data-nav={undefined}
              aria-selected={tab === index}
              aria-pressed={tab === index}
              sound="select"
              class="text-lg md:text-xl"
              onClick={() => setTab(index)}
            >
              {label}
            </MenuButton>
          ))}
        </div>
      </header>

      <div ref={contentRef} role="tabpanel" class="min-h-0 flex-1 overflow-y-auto max-w-[640px] pr-3 pb-8">
        <Section {...sectionProps} />
      </div>

      <footer class="flex items-center justify-between gap-8 py-6 md:py-8">
        <MenuButton sound="back" class="text-2xl md:text-3xl" onClick={close}>
          Back
        </MenuButton>
        <KeyHints
          hints={[
            ["↑↓", "Select"],
            ["←→", "Change"],
            ["Q/E", "Tabs"],
            ["Esc", "Back"],
          ]}
        />
      </footer>
    </div>
  );
}
