import { useRef, useState } from "preact/hooks";
import { DEFAULT_WEBSITES, getWebsites, normalizeLink, replaceWebsites } from "../../db";
import { DEFAULT_SETTINGS, Settings, loadSettings, saveSettings } from "../../settings";
import { ConfirmButton, Hint, MenuButton, SectionTitle } from "../ui";
import { SettingsSectionProps } from "./SettingsMenu";

const BACKUP_APP = "gta-sa-startpage";

export default function DataSettings({ reloadAll }: SettingsSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function exportBackup() {
    const websites = (await getWebsites()).map(({ name, link }) => ({ name, link }));
    const backup = { app: BACKUP_APP, version: 1, websites, settings: loadSettings() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `gta-sa-startpage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: "Backup saved." });
  }

  async function importBackup(file: File) {
    try {
      const backup = JSON.parse(await file.text());
      if (backup?.app !== BACKUP_APP || !Array.isArray(backup.websites)) throw new Error();
      const websites = backup.websites
        .map((site: { name?: unknown; link?: unknown }) => ({
          name: String(site.name ?? ""),
          link: normalizeLink(String(site.link ?? "")),
        }))
        .filter((site: { name: string; link: string | null }) => site.name && site.link);
      await replaceWebsites(websites);
      // Only take known keys; loadSettings() validates the values when they're read back
      const imported = Object.fromEntries(
        Object.keys(DEFAULT_SETTINGS)
          .filter((key) => backup.settings && key in backup.settings)
          .map((key) => [key, backup.settings[key]])
      ) as Partial<Settings>;
      saveSettings({ ...DEFAULT_SETTINGS, ...imported });
      await reloadAll();
      setMessage({ text: `Restored ${websites.length} websites and your settings.` });
    } catch {
      setMessage({ text: "That file isn't a GTA SA Startpage backup.", error: true });
    }
  }

  async function resetWebsites() {
    await replaceWebsites(DEFAULT_WEBSITES);
    await reloadAll();
    setMessage({ text: "Websites reset to the defaults." });
  }

  async function resetSettings() {
    saveSettings(DEFAULT_SETTINGS);
    await reloadAll();
    setMessage({ text: "Settings reset to the defaults." });
  }

  return (
    <div class="grid gap-10">
      <section>
        <SectionTitle>Backup</SectionTitle>
        <Hint>
          Save your websites and settings to a file, or restore them from one. Use this to move between the
          extension and the website, or to another computer.
        </Hint>
        <div class="flex flex-wrap gap-x-8 gap-y-2">
          <MenuButton class="text-xl md:text-2xl" onClick={exportBackup}>
            Export Backup
          </MenuButton>
          <MenuButton class="text-xl md:text-2xl" onClick={() => fileRef.current?.click()}>
            Import Backup
          </MenuButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            class="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) importBackup(file);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </section>

      <section>
        <SectionTitle>Reset</SectionTitle>
        <Hint>Press twice to confirm. This can't be undone, so export a backup first.</Hint>
        <div class="flex flex-wrap gap-x-8 gap-y-2">
          <ConfirmButton class="text-xl md:text-2xl" confirmText="Press again to reset" onConfirm={resetWebsites}>
            Reset Websites
          </ConfirmButton>
          <ConfirmButton class="text-xl md:text-2xl" confirmText="Press again to reset" onConfirm={resetSettings}>
            Reset Settings
          </ConfirmButton>
        </div>
      </section>

      {message && <p class={`font-bankGothic ${message.error ? "text-red-400" : "text-sa-blue"}`}>{message.text}</p>}
    </div>
  );
}
