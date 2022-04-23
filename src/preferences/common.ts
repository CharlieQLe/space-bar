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

// export function addKeyboardShortcut({
//     group,
//     key,
//     title,
//     subtitle = null,
//     settings = extensionSettings,    
// } : {
//     group: Adw.PreferencesGroup;
//     key: string;
//     title: string;
//     subtitle?: string | null;
//     settings?: any;
// }): void {
//         const row = new Adw.ActionRow({ title, subtitle });
//         group.add(row);

//         const 
    
//         row.add_suffix(toggle);
//         row.activatable_widget = toggle;
// }