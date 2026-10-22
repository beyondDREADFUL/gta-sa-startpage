import { useState } from "preact/hooks";
import { DEFAULT_WEBSITES, finishFirstRun } from "../db";
import { readBookmarksBar } from "../bookmarks";
import { MenuButton } from "./ui";

// Shown once on a fresh install so people choose their starting websites
export default function FirstRun({ onDone }: { onDone: () => Promise<void> }) {
  const [message, setMessage] = useState("");

  async function choose(sites: { name: string; link: string }[]) {
    await finishFirstRun(sites);
    await onDone();
  }

  async function importBookmarks() {
    const sites = await readBookmarksBar().catch(() => null);
    if (sites === null) return setMessage("Chrome didn't allow access to your bookmarks.");
    if (sites.length === 0) return setMessage("Your bookmarks bar is empty.");
    await choose(sites);
  }

  return (
    <section class="py-2">
      <h2 class="font-beckett text-sa-title text-3xl md:text-4xl mb-2">Start a New Game</h2>
      <p class="text-sm text-sa-muted mb-6 max-w-md">
        Pick the websites for your main menu. You can change them any time in Settings.
      </p>
      <div class="flex flex-col items-start gap-1">
        <MenuButton class="text-2xl md:text-3xl py-1" onClick={importBookmarks}>
          Import Chrome Bookmarks
        </MenuButton>
        <MenuButton class="text-2xl md:text-3xl py-1" onClick={() => choose(DEFAULT_WEBSITES)}>
          Use Default Websites
        </MenuButton>
        <MenuButton class="text-2xl md:text-3xl py-1" onClick={() => choose([])}>
          Start Empty
        </MenuButton>
      </div>
      {message && <p class="font-bankGothic text-red-400 mt-4">{message}</p>}
      <p class="text-xs text-sa-dim mt-6 max-w-md">
        Importing takes the sites on your bookmarks bar. Chrome will ask for permission to read your bookmarks;
        they stay on this computer.
      </p>
    </section>
  );
}
