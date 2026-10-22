import selectSFX from "../assets/audio/select.mp3";
import enterSFX from "../assets/audio/enter.mp3";
import backSFX from "../assets/audio/back.mp3";
import { loadSettings } from "../settings";

const SOUNDS = { select: selectSFX, enter: enterSFX, back: backSFX };

export type Sound = keyof typeof SOUNDS;

// Plays a menu sound, respecting the sound and volume settings
export function playSound(sound: Sound, force = false) {
  const { soundEnabled, volume } = loadSettings();
  if (!soundEnabled && !force) return;
  const audio = new Audio(SOUNDS[sound]);
  audio.volume = volume;
  audio.play().catch(() => {});
}
