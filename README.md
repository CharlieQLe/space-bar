# workspaces-bar

GNOME Shell extension that shows workspaces buttons in top panel

https://extensions.gnome.org/extension/3851/workspaces-bar/

## Build

```sh
./scripts/build.sh
```

## Install

```sh
./scripts/build.sh -i
```

## Generate types

```sh
cd ..
git clone https://github.com/sammydre/ts-for-gjs
npm install
npm run build
npm link
cd -

ts-for-gir/lib generate Gio-2.0 GObject-2.0 St-1.0 Shell-0.1 Meta-10 Adw-1 -g "/usr/share/gir-1.0" -g "/usr/share/gnome-shell" -g "/usr/lib/mutter-10/"
```
Choose "All" and "Yes" for everything.