import { ComponentChildren, ComponentProps } from "preact";
import { useState } from "preact/hooks";
import { playSound, Sound } from "../utils/audioUtils";

interface MenuButtonProps extends Omit<ComponentProps<"button">, "class" | "className"> {
  sound?: Sound | null;
  class?: string;
}

// A GTA SA style menu entry; plays the menu sound when pressed
export function MenuButton({ sound = "enter", class: className = "", onClick, ...rest }: MenuButtonProps) {
  return (
    <button
      type="button"
      data-nav
      {...rest}
      class={`menu-item ${className}`}
      onClick={(event) => {
        if (sound) playSound(sound);
        onClick?.(event);
      }}
    />
  );
}

interface ConfirmButtonProps extends Omit<MenuButtonProps, "onClick"> {
  onConfirm: () => void;
  confirmText?: string;
}

// Needs a second press before it acts, for destructive actions
export function ConfirmButton({ onConfirm, confirmText = "Sure?", children, class: className = "", ...rest }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  return (
    <MenuButton
      {...rest}
      sound={armed ? "back" : "enter"}
      class={`${className} ${armed ? "!text-red-400" : ""}`}
      onBlur={() => setArmed(false)}
      onClick={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    >
      {armed ? confirmText : children}
    </MenuButton>
  );
}

export function SectionTitle({ children }: { children: ComponentChildren }) {
  return <h2 class="font-beckett text-sa-title text-3xl md:text-4xl mb-3">{children}</h2>;
}

export function Hint({ children }: { children: ComponentChildren }) {
  return <p class="text-sm text-sa-muted mb-4 max-w-prose">{children}</p>;
}

interface OptionRowProps<T> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

// A label/value row like the in-game Options screen; click or ←/→ to change
export function OptionRow<T>({ label, options, value, onChange }: OptionRowProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  function step(direction: number) {
    playSound("select");
    onChange(options[(index + direction + options.length) % options.length].value);
  }

  return (
    <button
      type="button"
      data-nav
      class="menu-item w-full flex items-center justify-between gap-6 py-2 text-xl md:text-2xl"
      onClick={() => step(1)}
      onKeyDown={(event) => {
        if (["ArrowLeft", "h", "a"].includes(event.key)) step(-1);
        else if (["ArrowRight", "l", "d"].includes(event.key)) step(1);
        else return;
        event.preventDefault();
      }}
    >
      <span>{label}</span>
      <span class="flex items-center gap-3 text-white/90">
        <span aria-hidden class="text-sa-dim text-base">◀</span>
        <span class="min-w-[7ch] text-center">{options[index].label}</span>
        <span aria-hidden class="text-sa-dim text-base">▶</span>
      </span>
    </button>
  );
}

interface VolumeRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const VOLUME_STEPS = 10;

// The segmented volume bar from the game's Audio Setup screen
export function VolumeRow({ label, value, onChange }: VolumeRowProps) {
  const level = Math.round(value * VOLUME_STEPS);

  function set(next: number) {
    const clamped = Math.min(VOLUME_STEPS, Math.max(0, next));
    if (clamped === level) return;
    onChange(clamped / VOLUME_STEPS);
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      data-nav
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={VOLUME_STEPS}
      aria-valuenow={level}
      class="menu-item group w-full flex items-center justify-between gap-6 py-2 text-xl md:text-2xl cursor-pointer"
      onKeyDown={(event) => {
        if (["ArrowLeft", "h", "a"].includes(event.key)) set(level - 1);
        else if (["ArrowRight", "l", "d"].includes(event.key)) set(level + 1);
        else return;
        event.preventDefault();
      }}
    >
      <span>{label}</span>
      <span class="flex items-end gap-1 h-6">
        {Array.from({ length: VOLUME_STEPS }, (_, i) => (
          <span
            key={i}
            onClick={() => set(i + 1 === level ? i : i + 1)}
            class={`w-3 transition-colors ${
              i < level ? "bg-sa-blue" : "bg-sa-line group-hover:bg-sa-dim/60"
            }`}
            style={{ height: `${30 + i * 7.5}%` }}
          />
        ))}
      </span>
    </div>
  );
}

export function KeyHints({ hints }: { hints: [string, string][] }) {
  return (
    <div class="hidden md:flex flex-wrap items-center justify-end gap-x-5 gap-y-2 font-bankGothic text-xs text-sa-dim">
      {hints.map(([key, label]) => (
        <span key={key} class="flex items-center gap-2">
          <kbd class="border border-sa-line px-1.5 py-0.5 text-sa-muted font-bankGothic">{key}</kbd>
          {label}
        </span>
      ))}
    </div>
  );
}
