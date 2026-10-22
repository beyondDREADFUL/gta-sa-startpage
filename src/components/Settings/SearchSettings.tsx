import { useState } from "preact/hooks";
import { SearchEngine, allEngines } from "../../searchEngines";
import { ConfirmButton, Hint, MenuButton, SectionTitle } from "../ui";
import { SettingsSectionProps } from "./SettingsMenu";

function CustomEngineForm({ initial, onSubmit, onCancel }: {
  initial?: SearchEngine;
  onSubmit: (name: string, url: string) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [error, setError] = useState("");

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (!name.trim()) return setError("Give the engine a name");
    if (!/^https?:\/\//.test(url.trim())) return setError("The URL must start with http:// or https://");
    if (!url.includes("{query}")) return setError("Put {query} where the search terms go");
    onSubmit(name.trim(), url.trim());
    setName("");
    setUrl("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} class="grid gap-2">
      <div class="grid gap-2 sm:grid-cols-[2fr_3fr]">
        <input class="field font-bankGothic text-lg" placeholder="Name, e.g. Reddit" value={name} onInput={(e) => setName(e.currentTarget.value)} aria-label="Engine name" />
        <input class="field text-base" placeholder="https://www.reddit.com/search/?q={query}" value={url} onInput={(e) => setUrl(e.currentTarget.value)} aria-label="Engine search URL" />
      </div>
      {error && <p class="text-sm text-red-400">{error}</p>}
      <div class="flex gap-6">
        <MenuButton type="submit" class="text-xl">{initial ? "Save" : "Add"}</MenuButton>
        {onCancel && <MenuButton sound="back" class="text-xl" onClick={onCancel}>Cancel</MenuButton>}
      </div>
    </form>
  );
}

export default function SearchSettings({ settings, updateSettings }: SettingsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { searchEngines: enabled, customSearchEngines: custom } = settings;
  const engines = allEngines(custom);
  const byId = (id: string) => engines.find((e) => e.id === id)!;
  const ordered = [...enabled.map(byId), ...engines.filter((e) => !enabled.includes(e.id))];

  function toggle(id: string) {
    updateSettings({
      searchEngines: enabled.includes(id) ? enabled.filter((e) => e !== id) : [...enabled, id],
    });
  }

  function move(id: string, direction: -1 | 1) {
    const list = [...enabled];
    const i = list.indexOf(id);
    [list[i], list[i + direction]] = [list[i + direction], list[i]];
    updateSettings({ searchEngines: list });
  }

  function saveCustom(name: string, url: string) {
    if (editingId) {
      updateSettings({ customSearchEngines: custom.map((e) => (e.id === editingId ? { ...e, name, url } : e)) });
      setEditingId(null);
    } else {
      const id = `custom-${Date.now().toString(36)}`;
      updateSettings({ customSearchEngines: [...custom, { id, name, url }], searchEngines: [...enabled, id] });
    }
  }

  function removeCustom(id: string) {
    updateSettings({
      customSearchEngines: custom.filter((e) => e.id !== id),
      searchEngines: enabled.filter((e) => e !== id),
    });
  }

  return (
    <div class="grid gap-10">
      <section>
        <SectionTitle>Search Engines</SectionTitle>
        <Hint>
          Turn on the engines you use. The top one is the default; press Tab in the search bar to switch between them.
        </Hint>
        <ul class="border-t border-sa-line/70">
          {ordered.map((engine) => {
            const position = enabled.indexOf(engine.id);
            const on = position !== -1;
            const isCustom = custom.some((e) => e.id === engine.id);
            if (editingId === engine.id) {
              return (
                <li key={engine.id} class="border border-sa-line bg-sa-field/60 p-3">
                  <CustomEngineForm initial={engine} onSubmit={saveCustom} onCancel={() => setEditingId(null)} />
                </li>
              );
            }
            return (
              <li key={engine.id} class="flex items-center gap-4 py-2.5 border-b border-sa-line/70">
                <div class="min-w-0 flex-1 flex items-baseline gap-3">
                  <span class={`font-bankGothic text-xl truncate ${on ? "text-sa-blue" : "text-sa-dim"}`}>{engine.name}</span>
                  {position === 0 && <span class="font-bankGothic text-[11px] text-black bg-sa-blue px-1.5 py-0.5">Default</span>}
                  {isCustom && <span class="font-bankGothic text-[11px] text-sa-muted border border-sa-line px-1.5 py-0.5">Custom</span>}
                </div>
                <div class="flex items-center gap-3 font-bankGothic text-base shrink-0">
                  {on && (
                    <>
                      <MenuButton aria-label={`Move ${engine.name} up`} disabled={position === 0} onClick={() => move(engine.id, -1)}>▲</MenuButton>
                      <MenuButton aria-label={`Move ${engine.name} down`} disabled={position === enabled.length - 1} onClick={() => move(engine.id, 1)}>▼</MenuButton>
                    </>
                  )}
                  {isCustom && <MenuButton onClick={() => setEditingId(engine.id)}>Edit</MenuButton>}
                  {isCustom && <ConfirmButton onConfirm={() => removeCustom(engine.id)}>Delete</ConfirmButton>}
                  <MenuButton aria-pressed={on} class="min-w-[2.5rem] text-right" onClick={() => toggle(engine.id)}>
                    {on ? "On" : "Off"}
                  </MenuButton>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>Add Custom Engine</SectionTitle>
        <Hint>Search the site once, copy the results URL and replace your search terms with {"{query}"}.</Hint>
        {editingId === null && <CustomEngineForm onSubmit={saveCustom} />}
      </section>
    </div>
  );
}
