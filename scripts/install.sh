#!/usr/bin/env bash

set -e

cd "$(dirname ${BASH_SOURCE[0]})/.."

dest="$HOME/.local/share/gnome-shell/extensions/workspaces-bar@fthx"

if [ -d "$dest" ]; then
    rm -r "$dest"
fi

cp -r target "$dest"