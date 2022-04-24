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
    settings?: Gio.Settings;
}): void {
    const row = new Adw.ActionRow({
        title,
        subtitle,
        activatable: true,
    });
    group.add(row);

    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: settings.get_strv(key)[0],
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(shortcutLabel);

    // const revealer = new Gtk.Revealer();
    // const clearButton = new Gtk.Button({ icon_name: 'edit-clear-symbolic' });
    // revealer.set_child(clearButton);
    // row.add_suffix(revealer);

    const dialog = new Gtk.Dialog({
        title: 'Set keybinding',
        modal: true,
        use_header_bar: 1,
        transient_for: window,
        hide_on_close: true,
    });
    // dialog.add_button('_Cancel', Gtk.ResponseType.CANCEL);
    const recorder = new Gtk.Box({ focusable: true, focus_on_click: true });
    recorder.connect('notify::has-focus', (box, spec) => {
        console.log('has focus', spec);
    });
    // TOOD: Description and styling
    // const label2 = new Gtk.Label({ label: 'Recorder' });
    // recorder.append(label2);
    const keyController = new Gtk.EventControllerKey({
        propagation_phase: Gtk.PropagationPhase.CAPTURE,
    });
    dialog.add_controller(keyController);
    keyController.connect('key-pressed', (keyController, keyval, keycode, modifier) => {
        const accelerator = getAccelerator(keyval, modifier);
        if (accelerator) {
            // TODO: handle escape and backspace
            shortcutLabel.accelerator = accelerator;
            settings.set_strv(key, [accelerator]);
            dialog.hide();
        }
    });
    dialog.set_child(recorder);

    row.connect('activated', () => dialog.show());
}

function getAccelerator(
    keyval: number,
    modifiers: number,
): string | null {
    const acceleratorName = Gtk.accelerator_name(keyval, modifiers);
    const isValid = Gtk.accelerator_valid(keyval, modifiers);
    if (isValid) {
        return acceleratorName;
    } else {
        return null;
    }
}
