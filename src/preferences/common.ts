import { Adw, Gio, Gtk, Gdk } from 'imports/gi';

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
    settings?: Gio.Settings;
}): void {
    const row = new Adw.ActionRow({
        title,
        subtitle,
        activatable: true,
    });
    group.add(row);

    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: settings.get_strv(key)[0] ?? null,
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(shortcutLabel);
    const disabledLabel = new Gtk.Label({
        label: 'Disabled',
        css_classes: ['dim-label'],
    });
    row.add_suffix(disabledLabel);
    if (settings.get_strv(key).length > 0) {
        disabledLabel.hide();
    } else {
        shortcutLabel.hide();
    }

    // const revealer = new Gtk.Revealer();
    // const clearButton = new Gtk.Button({ icon_name: 'edit-clear-symbolic' });
    // revealer.set_child(clearButton);
    // row.add_suffix(revealer);

    const dialog = new Gtk.Dialog({
        title: 'Set Shortcut',
        modal: true,
        use_header_bar: 1,
        transient_for: window,
        hide_on_close: true,
        width_request: 400,
        height_request: 200,
    });
    // dialog.add_button('_Cancel', Gtk.ResponseType.CANCEL);
    const dialogBox = new Gtk.Box({
        margin_bottom: 12,
        margin_end: 12,
        margin_start: 12,
        margin_top: 12,
        orientation: Gtk.Orientation.VERTICAL,
        valign: Gtk.Align.CENTER,
    });
    const dialogLabel = new Gtk.Label({
        label: 'Enter new shortcut to change <b>' + title + '</b>.',
        use_markup: true,
        margin_bottom: 12,
    });
    dialogBox.append(dialogLabel);
    const dialogDimLabel = new Gtk.Label({
        label: 'Press Esc to cancel or Backspace to disable the keyboard shortcut.',
        css_classes: ['dim-label'],
    });
    dialogBox.append(dialogDimLabel);
    const keyController = new Gtk.EventControllerKey({
        propagation_phase: Gtk.PropagationPhase.CAPTURE,
    });
    dialog.add_controller(keyController);
    keyController.connect('key-pressed', (keyController, keyval, keycode, modifier) => {
        const accelerator = getAccelerator(keyval, modifier);
        if (accelerator) {
            if (keyval === Gdk.KEY_Escape && !modifier) {
                // Just hide the dialog
            } else if (keyval === Gdk.KEY_BackSpace && !modifier) {
                shortcutLabel.hide();
                disabledLabel.show();
                settings.set_strv(key, []);
            } else {
                shortcutLabel.accelerator = accelerator;
                shortcutLabel.show();
                disabledLabel.hide();
                settings.set_strv(key, [accelerator]);
            }
            dialog.hide();
        }
    });
    dialog.set_child(dialogBox);

    row.connect('activated', () => {
        dialog.show();
    });
}

function getAccelerator(keyval: number, modifiers: number): string | null {
    const acceleratorName = Gtk.accelerator_name(keyval, modifiers);
    const isValid = Gtk.accelerator_valid(keyval, modifiers);
    if (isValid) {
        return acceleratorName;
    } else {
        return null;
    }
}
