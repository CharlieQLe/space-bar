const ExtensionUtils = imports.misc.extensionUtils;

export function getSettings() {
    return ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar');
}
