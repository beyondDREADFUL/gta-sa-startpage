import Dexie, { EntityTable } from "dexie";

export const DEFAULT_WEBSITES = [
  { name: "YouTube", link: "https://www.youtube.com/" },
  { name: "Gmail", link: "https://mail.google.com/" },
  { name: "Reddit", link: "https://www.reddit.com/" },
  { name: "Wikipedia", link: "https://www.wikipedia.org/" },
];

export interface Website {
  id: number;
  name: string;
  link: string;
  order: number;
}

const db = new Dexie("WebsitesDatabase") as Dexie & {
  websites: EntityTable<Website, "id">;
};

db.version(1).stores({ websites: "++id, name, link" });
// v2 adds an explicit order, so reordering no longer rewrites the whole table
db.version(2)
  .stores({ websites: "++id, order" })
  .upgrade(async (tx) => {
    let order = 0;
    await tx
      .table("websites")
      .toCollection()
      .modify((site) => {
        site.order = order++;
      });
  });

export async function initDb() {
  // Only seed on first run, so deleting every website doesn't bring them back
  if (localStorage.getItem("websitesSeeded")) return;
  if ((await db.websites.count()) === 0) {
    await replaceWebsites(DEFAULT_WEBSITES);
  }
  localStorage.setItem("websitesSeeded", "true");
}

export function getWebsites() {
  return db.websites.orderBy("order").toArray();
}

export async function addWebsite(name: string, link: string) {
  const last = await db.websites.orderBy("order").last();
  await db.websites.add({ name, link, order: (last?.order ?? -1) + 1 });
}

export async function updateWebsite(id: number, name: string, link: string) {
  await db.websites.update(id, { name, link });
}

export async function deleteWebsite(id: number) {
  await db.websites.delete(id);
}

// Swaps a website with its neighbour; direction is -1 (up) or 1 (down)
export async function moveWebsite(id: number, direction: -1 | 1) {
  await db.transaction("rw", db.websites, async () => {
    const sites = await getWebsites();
    const index = sites.findIndex((site) => site.id === id);
    const other = sites[index + direction];
    if (index === -1 || !other) return;
    await db.websites.update(id, { order: other.order });
    await db.websites.update(other.id, { order: sites[index].order });
  });
}

export async function replaceWebsites(sites: { name: string; link: string }[]) {
  await db.transaction("rw", db.websites, async () => {
    await db.websites.clear();
    await db.websites.bulkAdd(
      sites.map((site, order) => ({ name: site.name, link: site.link, order })) as Website[]
    );
  });
}

// Accepts "example.com" as well as full URLs; returns null when it can't be a URL
export function normalizeLink(input: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  const hasScheme = /^[a-z][\w+.-]*:/i.test(text);
  try {
    const url = new URL(hasScheme ? text : `https://${text}`);
    // Without a scheme, insist on something that looks like a domain
    if (!hasScheme && !/\./.test(url.hostname) && url.hostname !== "localhost") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function nameFromLink(link: string) {
  const host = new URL(link).hostname.replace(/^www\./, "");
  const name = host.split(".")[0] || host;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
