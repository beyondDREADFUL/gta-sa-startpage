import { useEffect, useState } from "preact/hooks";
import { ClockFormat } from "../settings";

function formatTime(date: Date, format: ClockFormat) {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (format === "12h") {
    const hours = date.getHours() % 12 || 12;
    return { time: `${hours}:${minutes}`, suffix: date.getHours() < 12 ? "AM" : "PM" };
  }
  return { time: `${String(date.getHours()).padStart(2, "0")}:${minutes}`, suffix: "" };
}

interface ClockProps {
  format: ClockFormat;
  showDate: boolean;
}

export default function Clock({ format, showDate }: ClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Tick on the minute rather than every second
    let timeout: number;
    function schedule() {
      timeout = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60_000 - (Date.now() % 60_000));
    }
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  if (format === "off" && !showDate) return null;
  const { time, suffix } = formatTime(now, format);

  return (
    <div class="text-right leading-none shrink-0">
      {format !== "off" && (
        <div class="font-beckett text-sa-title text-4xl md:text-5xl">
          {time}
          {suffix && <span class="text-2xl md:text-3xl ml-1.5">{suffix}</span>}
        </div>
      )}
      {showDate && (
        <div class="font-bankGothic text-sa-muted text-sm mt-2 tracking-wide">
          {now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
        </div>
      )}
    </div>
  );
}
