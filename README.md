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

- 🎵 Classic menu sound effects
- 🎨 Multiple background options to choose from
- ⬆️ Move up and down in the menu using `jk`, `ws`, or the arrow keys
- 🔍 Integrated search engines
- 🔄 **New:** Reorder websites and search engines
- ✍️ **New:** Ability to add custom search engines
- ⏰ **New:** Added clock to the main menu

## Acknowledgments

All credit for the original design goes to **Rockstar**.  
Shoutout [wjkba](https://github.com/wjkba) for the original project and inspiration for this fork.
