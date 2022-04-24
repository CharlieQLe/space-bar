import { Adw, Gio, Gtk } from 'imports/gi';

const ExtensionUtils = imports.misc.extensionUtils;

export const extensionSettings = ExtensionUtils.getSettings(
    'org.gnome.shell.extensions.workspaces-bar',
);

export function addToggle({
    group,
    key,
    title,
    subtitle = null,
    settings = extensionSettings,
}: {
    group: Adw.PreferencesGroup;
    key: string;
    title: string;
    subtitle?: string | null;
    settings?: any;
}): void {
    // Create a new preferences row
    const row = new Adw.ActionRow({ title, subtitle });
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

export function addKeyboardShortcut({
    window,
    group,
    key,
    title,
    subtitle = null,
    settings = extensionSettings,
}: {
    window: Adw.PreferencesWindow;
    group: Adw.PreferencesGroup;
    key: string;
    title: string;
    subtitle?: string | null;
    settings?: any;
}): void {
    const row = new Adw.ActionRow({
        title,
        subtitle,
        activatable: true,
    });
    group.add(row);

    const label = new Gtk.Label({ label: 'current shortcut' });
    row.add_suffix(label);

    const revealer = new Gtk.Revealer();
    const clearButton = new Gtk.Button({ icon_name: 'edit-clear-symbolic' });
    revealer.set_child(clearButton);
    row.add_suffix(revealer);

    function showDialog() {
        const dialog = new Gtk.Dialog({
            title: 'Set keybinding',
            modal: true,
            use_header_bar: 1,
            transient_for: window,
        });
        dialog.add_button('_Cancel', Gtk.ResponseType.CANCEL);
        dialog.show();
    }

    row.connect('activated', () => showDialog());
}
