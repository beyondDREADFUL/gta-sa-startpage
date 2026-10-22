import { nameFromLink, normalizeLink } from "./db";

// Just the parts of the Chrome extension API we use
interface BookmarkNode {
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

declare const chrome:
  | {
      permissions?: {
        contains(p: { permissions: string[] }): Promise<boolean>;
        request(p: { permissions: string[] }): Promise<boolean>;
      };
      bookmarks?: { getTree(): Promise<BookmarkNode[]> };
    }
  | undefined;

const MAX_IMPORTED = 30;

// Only the extension build can ask for the bookmarks permission
export const canImportBookmarks = typeof chrome !== "undefined" && !!chrome.permissions?.request;

function collect(nodes: BookmarkNode[], out: { name: string; link: string }[]) {
  for (const node of nodes) {
    if (out.length >= MAX_IMPORTED) return;
    if (node.children) collect(node.children, out);
    const link = node.url && /^https?:/.test(node.url) ? normalizeLink(node.url) : null;
    if (!link) continue;
    const name = node.title.trim().slice(0, 40) || nameFromLink(link);
    out.push({ name, link });
  }
}

// Asks Chrome for permission, then returns the sites on the bookmarks bar
// (folders included). Returns null if the person declines.
export async function readBookmarksBar() {
  if (!canImportBookmarks) return null;
  const permission = { permissions: ["bookmarks"] };
  const granted =
    (await chrome!.permissions!.contains(permission)) || (await chrome!.permissions!.request(permission));
  if (!granted || !chrome!.bookmarks) return null;
  const [root] = await chrome!.bookmarks.getTree();
  // The first child of the root is the bookmarks bar
  const bar = root.children?.[0]?.children ?? [];
  const sites: { name: string; link: string }[] = [];
  collect(bar, sites);
  return sites;
}
