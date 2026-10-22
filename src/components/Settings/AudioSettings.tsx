import { playSound } from "../../utils/audioUtils";
import { OptionRow, SectionTitle, VolumeRow } from "../ui";
import { SettingsSectionProps } from "./SettingsMenu";

export default function AudioSettings({ settings, updateSettings }: SettingsSectionProps) {
  return (
    <section>
      <SectionTitle>Audio Setup</SectionTitle>
      <OptionRow<boolean>
        label="Sound Effects"
        value={settings.soundEnabled}
        onChange={(soundEnabled) => updateSettings({ soundEnabled })}
        options={[
          { value: true, label: "On" },
          { value: false, label: "Off" },
        ]}
      />
      <VolumeRow
        label="SFX Volume"
        value={settings.volume}
        onChange={(volume) => {
          updateSettings({ volume });
          // Settings are saved synchronously, so the preview uses the new volume
          playSound("select", true);
        }}
      />
    </section>
  );
}
