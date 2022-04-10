const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

function init() {}

function fillPreferencesWindow(window: any) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar');

    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    addToggle('show-new-workspace-button', 'Show New-Workspace Button', group, settings);
    addToggle('show-empty-workspaces', 'Show Empty Workspaces', group, settings);

    // Add our page to the window
    window.add(page);
}

function addToggle(key: string, title: string, group: any, settings: any) {
    // Create a new preferences row
    const row = new Adw.ActionRow({ title });
    group.add(row);

    // Create the switch and bind its value to the `show-indicator` key
    const toggle = new Gtk.Switch({
        active: settings.get_boolean(key),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(key, toggle, 'active', Gio.SettingsBindFlags.DEFAULT);

    // Add the switch to the row
    row.add_suffix(toggle);
    row.activatable_widget = toggle;
}
