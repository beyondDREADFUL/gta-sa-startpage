# GTA-SA Menu Startpage

A browser start page inspired by the iconic **GTA San Andreas** menu.

![Main Menu Preview](./assets/MainMenu.png)

## Settings Preview

![Settings Preview](./assets/Settings.png)

> **Live Demo:** [Visit the site here](https://beyondDREADFUL.github.io/gta-sa-startpage/).

## Setup Instructions

### As a Chrome extension (recommended)

The start page ships as its own Chrome extension that replaces your new tab page — no third-party new tab extension needed.

```bash
npm install
npm run build:extension
```

Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select the `dist-extension` folder. This works in any Chromium browser (Chrome, Brave, Edge, Vivaldi).

`npm run zip:extension` packages the build as `gta-sa-startpage.zip` for uploading to the Chrome Web Store.

> Browsers keep focus in the address bar on a new tab, so the search bar isn't focused automatically. Your saved websites and settings from the hosted version don't carry over, since the extension stores them separately.

### As a hosted page

You can also point a new tab extension at the [live demo](https://beyondDREADFUL.github.io/gta-sa-startpage/):

- **Firefox:** [Custom New Tab Page](https://addons.mozilla.org/en-US/firefox/addon/custom-new-tab-page/?src=search)
- **Chromium browsers:** [Custom New Tab URL](https://chrome.google.com/webstore/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)

## Features

- 🎵 Classic menu sound effects with an in-game style volume bar
- 🎨 Six backgrounds, one or two column layouts, 12/24-hour clock and date
- 🔍 One search bar for Google, DuckDuckGo, Bing, YouTube, Wikipedia, SearXNG or your own engines; type a URL to go straight there
- 🔄 Add, edit and reorder websites and search engines
- 💾 Export and import a backup of your websites and settings

### Keyboard

| Key | Main menu | Options |
| --- | --- | --- |
| `↑` `↓` / `j` `k` / `w` `s` | Move through the menu | Move through the options |
| `←` `→` | Move between columns | Change the selected option |
| `Enter` | Open the website | Select |
| `1`–`9` | Open that website | |
| `/` | Jump to the search bar | |
| `Tab` (in search) | Switch search engine | |
| `Q` / `E` | | Previous / next tab |
| `Esc` | Leave the search bar | Back to the main menu |

## Acknowledgments

All credit for the original design goes to **Rockstar**.  
Shoutout [wjkba](https://github.com/wjkba) for the original project and inspiration for this fork.
