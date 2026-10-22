import { RefObject } from "preact";
import { useEffect } from "preact/hooks";
import { playSound } from "../utils/audioUtils";

const DOWN = ["ArrowDown", "j", "s"];
const UP = ["ArrowUp", "k", "w"];
const LEFT = ["ArrowLeft", "h", "a"];
const RIGHT = ["ArrowRight", "l", "d"];

export function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

interface Options {
  columns?: number;
  onBack?: () => void;
}

// Moves focus between [data-nav] elements inside `container` with arrows, jk or ws,
// like scrolling through a GTA SA menu
export function useMenuNavigation(
  container: RefObject<HTMLElement>,
  { columns = 1, onBack }: Options = {}
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) {
        if (event.key === "Escape") (event.target as HTMLElement).blur();
        return;
      }
      if (event.key === "Escape" && onBack) {
        event.preventDefault();
        onBack();
        return;
      }

      const items = Array.from(
        container.current?.querySelectorAll<HTMLElement>("[data-nav]:not(:disabled)") ?? []
      );
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      const last = items.length - 1;

      let next: number | null = null;
      if (DOWN.includes(event.key)) {
        if (current === -1) next = 0;
        else if (current + columns <= last) next = current + columns;
        else next = current < last ? last : current % columns;
      } else if (UP.includes(event.key)) {
        if (current === -1) next = last;
        else if (current - columns >= 0) next = current - columns;
        else next = last - ((last - current) % columns);
      } else if (columns > 1 && LEFT.includes(event.key)) {
        next = current <= 0 ? last : current - 1;
      } else if (columns > 1 && RIGHT.includes(event.key)) {
        next = current === -1 || current === last ? 0 : current + 1;
      }

      if (next === null) return;
      event.preventDefault();
      items[next].focus();
      items[next].scrollIntoView({ block: "nearest" });
      playSound("select");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [container, columns, onBack]);
}
