import { useEffect, useRef } from "preact/hooks";
import { Website } from "../db";
import { Settings } from "../settings";
import { SearchEngine, findEngine } from "../searchEngines";
import { isTyping, useMenuNavigation } from "../hooks/useMenuNavigation";
import { playSound } from "../utils/audioUtils";
import { KeyHints, MenuButton } from "./ui";
import Clock from "./Clock";
import SearchBar from "./SearchBar";
import FirstRun from "./FirstRun";

interface HomeProps {
  settings: Settings;
  websites: Website[];
  firstRun: boolean;
  finishFirstRun: () => Promise<void>;
  openSettings: () => void;
}

export default function Home({ settings, websites, firstRun, finishFirstRun, openSettings }: HomeProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const columns = settings.layout === "twoColumns" ? 2 : 1;
  const engines = settings.searchEngines
    .map((id) => findEngine(id, settings.customSearchEngines))
    .filter((engine): engine is SearchEngine => !!engine);

  useMenuNavigation(menuRef, { columns });

  // "/" jumps to the search bar, 1-9 open the matching website
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (/^[1-9]$/.test(event.key)) {
        const site = websites[Number(event.key) - 1];
        if (!site) return;
        playSound("enter");
        window.location.href = site.link;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [websites]);

  return (
    <div ref={menuRef} class="flex h-full flex-col">
      <header class="flex items-end justify-between gap-8 max-w-[560px] pt-12 md:pt-16 pb-8">
        <h1 class="font-beckett text-sa-title text-5xl md:text-6xl leading-none">Main Menu</h1>
        <Clock format={settings.clock} showDate={settings.showDate} />
      </header>

      {engines.length > 0 && <SearchBar engines={engines} inputRef={searchRef} />}

      <nav
        aria-label="Websites"
        class={`min-h-0 flex-1 overflow-y-auto py-6 -mx-2 px-2 content-start ${
          columns === 2 && !firstRun ? "grid grid-cols-2 max-w-[920px] gap-x-12" : "flex flex-col"
        }`}
      >
        {websites.map((site, index) => (
          <a
            key={site.id}
            href={site.link}
            data-nav
            onClick={() => playSound("enter")}
            class="menu-item group flex w-fit max-w-full items-baseline gap-4 py-1.5 text-2xl md:text-3xl"
          >
            <span aria-hidden class="w-4 shrink-0 text-right text-sm text-sa-dim/50 group-hover:text-sa-dim group-focus-visible:text-sa-dim">
              {index < 9 ? index + 1 : ""}
            </span>
            <span class="truncate">{site.name}</span>
          </a>
        ))}
        {firstRun && <FirstRun onDone={finishFirstRun} />}
        {websites.length === 0 && !firstRun && (
          <p class="font-bankGothic text-sa-muted text-lg">
            No websites yet. Add some in Settings.
          </p>
        )}
      </nav>

      <footer class="flex items-center justify-between gap-8 py-6 md:py-8">
        <MenuButton class="text-2xl md:text-3xl" onClick={openSettings}>
          Settings
        </MenuButton>
        <KeyHints
          hints={[
            ["↑↓", "Select"],
            ["Enter", "Open"],
            ["1-9", "Quick open"],
            ["/", "Search"],
            ...(engines.length > 1 ? ([["Tab", "Switch engine"]] as [string, string][]) : []),
          ]}
        />
      </footer>
    </div>
  );
}
