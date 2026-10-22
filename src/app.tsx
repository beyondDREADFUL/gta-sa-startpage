import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Website, getWebsites, initDb } from "./db";
import { Settings, loadSettings, saveSettings } from "./settings";
import { canImportBookmarks } from "./bookmarks";
import Background from "./components/Background";
import Home from "./components/Home";
import SettingsMenu from "./components/Settings/SettingsMenu";

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [websites, setWebsites] = useState<Website[] | null>(null);
  const [firstRun, setFirstRun] = useState(false);
  const [showSettings, setShowSettings] = useState(() => location.hash === "#settings");

  const refreshWebsites = useCallback(async () => {
    try {
      setWebsites(await getWebsites());
    } catch (error) {
      console.error("Failed to load websites", error);
      setWebsites([]);
    }
  }, []);

  const reloadAll = useCallback(async () => {
    setSettings(loadSettings());
    await refreshWebsites();
  }, [refreshWebsites]);

  useEffect(() => {
    initDb(canImportBookmarks)
      .then(setFirstRun)
      .catch((error) => console.error("Failed to set up the database", error))
      .then(refreshWebsites);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  // Settings live at #settings, so the browser's back button closes them
  useEffect(() => {
    const onHashChange = () => setShowSettings(location.hash === "#settings");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Whether we added the #settings history entry ourselves, so closing can step back over it
  const pushedSettings = useRef(false);

  const openSettings = useCallback(() => {
    pushedSettings.current = true;
    location.hash = "settings";
  }, []);

  const finishFirstRun = useCallback(async () => {
    setFirstRun(false);
    await refreshWebsites();
  }, [refreshWebsites]);

  const closeSettings = useCallback(() => {
    if (pushedSettings.current) history.back();
    else history.replaceState(null, "", location.pathname + location.search);
    pushedSettings.current = false;
    setShowSettings(false);
  }, []);

  return (
    <div class="relative h-screen w-full overflow-hidden bg-black select-none">
      <Background name={settings.background} />
      <main class="relative z-10 mx-auto h-full w-full max-w-[1680px] px-6 sm:px-10 lg:px-28">
        {websites === null ? null : showSettings ? (
          <SettingsMenu
            close={closeSettings}
            settings={settings}
            updateSettings={updateSettings}
            websites={websites}
            refreshWebsites={refreshWebsites}
            reloadAll={reloadAll}
          />
        ) : (
          <Home
            settings={settings}
            websites={websites}
            firstRun={firstRun}
            finishFirstRun={finishFirstRun}
            openSettings={openSettings}
          />
        )}
      </main>
    </div>
  );
}
