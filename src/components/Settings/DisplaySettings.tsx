import { BACKGROUNDS, ClockFormat, Layout } from "../../settings";
import { OptionRow, SectionTitle } from "../ui";
import { SettingsSectionProps } from "./SettingsMenu";

export default function DisplaySettings({ settings, updateSettings }: SettingsSectionProps) {
  return (
    <div class="grid gap-10">
      <section>
        <SectionTitle>Background</SectionTitle>
        <div class="grid grid-cols-3 gap-3">
          {BACKGROUNDS.map((bg, index) => {
            const selected = settings.background === bg;
            return (
              <button
                key={bg}
                type="button"
                data-nav
                aria-label={`Background ${index + 1}`}
                aria-pressed={selected}
                onClick={() => updateSettings({ background: bg })}
                class={`relative aspect-video bg-black outline-none border-2 transition-colors ${
                  selected ? "border-sa-blue" : "border-sa-line hover:border-sa-dim focus-visible:border-sa-dim"
                }`}
                // The artwork sits in the top half, mostly to the right, so zoom into it
                style={{
                  backgroundImage: `url(images/${bg}.webp)`,
                  backgroundSize: "150%",
                  backgroundPosition: "100% 0",
                }}
              >
                <span class={`absolute bottom-1 left-2 font-bankGothic text-sm ${selected ? "text-sa-blue" : "text-sa-dim"}`}>
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Main Menu</SectionTitle>
        <OptionRow<Layout>
          label="Layout"
          value={settings.layout}
          onChange={(layout) => updateSettings({ layout })}
          options={[
            { value: "oneColumn", label: "1 Column" },
            { value: "twoColumns", label: "2 Columns" },
          ]}
        />
        <OptionRow<ClockFormat>
          label="Clock"
          value={settings.clock}
          onChange={(clock) => updateSettings({ clock })}
          options={[
            { value: "24h", label: "24 Hour" },
            { value: "12h", label: "12 Hour" },
            { value: "off", label: "Off" },
          ]}
        />
        <OptionRow<boolean>
          label="Date"
          value={settings.showDate}
          onChange={(showDate) => updateSettings({ showDate })}
          options={[
            { value: true, label: "On" },
            { value: false, label: "Off" },
          ]}
        />
      </section>
    </div>
  );
}
