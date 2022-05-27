# Space Bar

GNOME Shell extension that replaces the 'Activities' button with an i3-like workspaces bar.

Originally a fork of the extension [Workspaces
Bar](https://extensions.gnome.org/extension/3851/workspaces-bar/) by
[fthx](https://extensions.gnome.org/accounts/profile/fthx), this extension grew into a more
comprehensive set of features to support a workspace-based workflow.

## Features

-   First class support for static and dynamic workspaces as well as multi-monitor setups
-   Add, remove, and rename workspaces
-   Rearrange workspaces via drag and drop
-   Automatically updates workspace names to reflect changes of workspaces
-   Automatically assign workspace names based on started applications
-   Keyboard shortcuts extend and refine system shortcuts
-   Scroll through workspaces by mouse wheel over the panel

## Limitations

-   Adding workspaces by dragging a window in overview between existing workspaces is not recognized
    and will confuse workspace names

## Build

The source code of this extension is written in TypeScript. The following command will build the
extension and package it to a zip file.

```sh
./scripts/build.sh
```

## Install

The following command will build the extension and install it locally.

```sh
./scripts/build.sh -i
```

## Generate types

For development with TypeScript, you can get type support in IDEs like VSCode by building and
installing type information for used libraries. Generating types is optional and not required for
building the extension. (For that, we use a different configuration that stubs type information with
dummy types.)

In any directory, run:

```sh
git clone https://github.com/sammydre/ts-for-gjs
cd ts-for-gjs
npm install
npm run build
npm link
```

Back in the project, run:

```sh
ts-for-gir generate Gio-2.0 GObject-2.0 St-1.0 Shell-0.1 Meta-10 Adw-1 -g "/usr/share/gir-1.0" -g "/usr/share/gnome-shell" -g "/usr/lib/mutter-10/"
```

Choose "All" and "Yes" for everything.
