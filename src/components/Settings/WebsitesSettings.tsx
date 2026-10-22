import { useState } from "preact/hooks";
import {
  Website,
  addWebsite,
  deleteWebsite,
  moveWebsite,
  nameFromLink,
  normalizeLink,
  updateWebsite,
} from "../../db";
import { ConfirmButton, Hint, MenuButton, SectionTitle } from "../ui";
import { SettingsSectionProps } from "./SettingsMenu";

interface WebsiteFormProps {
  initial?: { name: string; link: string };
  submitLabel: string;
  onSubmit: (name: string, link: string) => Promise<void>;
  onCancel?: () => void;
}

function WebsiteForm({ initial, submitLabel, onSubmit, onCancel }: WebsiteFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const url = normalizeLink(link);
    if (!url) return setError("Enter a valid URL, like youtube.com");
    await onSubmit(name.trim() || nameFromLink(url), url);
    if (!initial) {
      setName("");
      setLink("");
    }
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Escape" && onCancel?.()} class="grid gap-2">
      <div class="grid gap-2 sm:grid-cols-[2fr_3fr]">
        <input
          class="field font-bankGothic text-lg"
          placeholder="Name (optional)"
          value={name}
          onInput={(e) => setName(e.currentTarget.value)}
          aria-label="Website name"
        />
        <input
          class="field text-base"
          placeholder="URL, e.g. youtube.com"
          value={link}
          onInput={(e) => setLink(e.currentTarget.value)}
          aria-label="Website URL"
          autoFocus={!!initial}
        />
      </div>
      {error && <p class="text-sm text-red-400">{error}</p>}
      <div class="flex gap-6">
        <MenuButton type="submit" class="text-xl">
          {submitLabel}
        </MenuButton>
        {onCancel && (
          <MenuButton sound="back" class="text-xl" onClick={onCancel}>
            Cancel
          </MenuButton>
        )}
      </div>
    </form>
  );
}

function WebsiteRow({ site, index, count, refresh }: { site: Website; index: number; count: number; refresh: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);

  async function run(action: Promise<void>) {
    await action;
    await refresh();
  }

  if (editing) {
    return (
      <li class="border border-sa-line bg-sa-field/60 p-3">
        <WebsiteForm
          initial={site}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (name, link) => {
            await run(updateWebsite(site.id, name, link));
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li class="flex items-center gap-4 py-2.5 border-b border-sa-line/70">
      <div class="min-w-0 flex-1">
        <div class="font-bankGothic text-xl text-sa-blue truncate">{site.name}</div>
        <div class="text-xs text-sa-dim truncate">{site.link}</div>
      </div>
      <div class="flex items-center gap-3 font-bankGothic text-base shrink-0">
        <MenuButton aria-label={`Move ${site.name} up`} disabled={index === 0} onClick={() => run(moveWebsite(site.id, -1))}>
          ▲
        </MenuButton>
        <MenuButton aria-label={`Move ${site.name} down`} disabled={index === count - 1} onClick={() => run(moveWebsite(site.id, 1))}>
          ▼
        </MenuButton>
        <MenuButton onClick={() => setEditing(true)}>Edit</MenuButton>
        <ConfirmButton class="min-w-[4.5rem] text-right" onConfirm={() => run(deleteWebsite(site.id))}>
          Delete
        </ConfirmButton>
      </div>
    </li>
  );
}

export default function WebsitesSettings({ websites, refreshWebsites }: SettingsSectionProps) {
  return (
    <div class="grid gap-10">
      <section>
        <SectionTitle>Add a Website</SectionTitle>
        <WebsiteForm
          submitLabel="Add"
          onSubmit={async (name, link) => {
            await addWebsite(name, link);
            await refreshWebsites();
          }}
        />
      </section>

      <section>
        <SectionTitle>Your Websites</SectionTitle>
        <Hint>The first nine open with the number keys on the main menu.</Hint>
        {websites.length === 0 ? (
          <p class="text-sa-muted">No websites yet.</p>
        ) : (
          <ol class="border-t border-sa-line/70">
            {websites.map((site, index) => (
              <WebsiteRow key={site.id} site={site} index={index} count={websites.length} refresh={refreshWebsites} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
