# Shortener.js (Firefox Extension)

This extension for Firefox essentially hides shorts from your Youtube feed

Features :
- Hide Shorts/Dismissible content from your youtube feed/subscriptions !
- Let you change the number of items per row on your feed !
- Hide Shorts buttons from left navigation side-bar

All of these features can be disabled/enabled from the configuration UI

## Build

This command only works for Linux setups, you can also build it yourself by [zipping it](https://extensionworkshop.com/documentation/publish/package-your-extension/)
(In future releases, the ZIP file will be provided on the github release)

```
git clone https://github.com/yonis-savary/shortener.git
cd shortener
make zip
```

## Enable locally

1. Go to `about:debugging` > This Firefox
2. Load Temporary add-on then choose `manifest.json` in the project files

Warning: this is a temporary solution as this is reset on firefox reboot

