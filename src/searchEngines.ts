export interface SearchEngine {
  id: string;
  name: string;
  // Search URL with {query} where the search terms go
  url: string;
}

export const BUILT_IN_ENGINES: SearchEngine[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q={query}" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q={query}" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q={query}" },
  { id: "youtube", name: "YouTube", url: "https://www.youtube.com/results?search_query={query}" },
  { id: "images", name: "Google Images", url: "https://www.google.com/search?tbm=isch&q={query}" },
  { id: "wikipedia", name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Special:Search?search={query}" },
  { id: "searxng", name: "SearXNG", url: "https://searx.tiekoetter.com/search?q={query}" },
];

export const DEFAULT_ENGINE_IDS = ["google"];

export function allEngines(custom: SearchEngine[]): SearchEngine[] {
  return [...BUILT_IN_ENGINES, ...custom];
}

export function findEngine(id: string, custom: SearchEngine[]) {
  return allEngines(custom).find((engine) => engine.id === id);
}

export function buildSearchUrl(engine: SearchEngine, query: string) {
  return engine.url.split("{query}").join(encodeURIComponent(query));
}

// "example.com", "localhost:3000/x" or anything with a scheme counts as a URL
export function toUrl(input: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  if (/^[a-z][\w+.-]*:\/\//i.test(text)) return text;
  if (/^(localhost|[\w-]+(\.[\w-]+)+)(:\d+)?([/?#]\S*)?$/i.test(text)) {
    return `https://${text}`;
  }
  return null;
}
