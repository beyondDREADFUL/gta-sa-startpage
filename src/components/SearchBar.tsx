import { RefObject } from "preact";
import { useState } from "preact/hooks";
import { SearchEngine, buildSearchUrl, toUrl } from "../searchEngines";
import { playSound } from "../utils/audioUtils";

interface SearchBarProps {
  engines: SearchEngine[];
  inputRef: RefObject<HTMLInputElement>;
}

// One search box; Tab / Shift+Tab or clicking the engine name switches engine
export default function SearchBar({ engines, inputRef }: SearchBarProps) {
  const [engineIndex, setEngineIndex] = useState(0);
  const [query, setQuery] = useState("");
  const engine = engines[engineIndex] ?? engines[0];
  const canSwitch = engines.length > 1;

  function switchEngine(direction: number) {
    playSound("select");
    setEngineIndex((i) => (i + direction + engines.length) % engines.length);
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    playSound("enter");
    window.location.href = toUrl(text) ?? buildSearchUrl(engine, text);
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="flex items-stretch max-w-[560px] bg-sa-field/90 border border-sa-line focus-within:border-sa-dim transition-colors"
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={!canSwitch}
        title={canSwitch ? "Switch search engine (Tab)" : undefined}
        onClick={() => {
          switchEngine(1);
          inputRef.current?.focus();
        }}
        class="menu-item !opacity-100 shrink-0 px-4 text-base md:text-lg border-r border-sa-line whitespace-nowrap"
      >
        {engine.name}
        {canSwitch && <span class="ml-2 text-xs align-middle">▶</span>}
      </button>
      <input
        ref={inputRef}
        value={query}
        onInput={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Tab" && canSwitch) {
            event.preventDefault();
            switchEngine(event.shiftKey ? -1 : 1);
          }
        }}
        placeholder={`search ${engine.name} or type a URL`}
        aria-label={`Search ${engine.name}`}
        autocomplete="off"
        spellcheck={false}
        class="min-w-0 flex-1 bg-transparent px-4 py-3 font-bankGothic text-lg md:text-xl text-white outline-none placeholder:text-sa-dim"
      />
    </form>
  );
}
