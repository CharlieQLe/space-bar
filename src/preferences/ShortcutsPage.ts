const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
import { Adw } from 'imports/gi';
import { addKeyboardShortcut, addToggle } from 'preferences/common';

const settings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.shortcuts`);

export class ShortcutsPage {
    window!: Adw.PreferencesWindow;
    page = new Adw.PreferencesPage();

    init() {
        this.page.set_title('Shortcuts');
        this.page.set_icon_name('preferences-desktop-keyboard-shortcuts-symbolic');
        this._initGroup();
    }

    private _initGroup(): void {
        const group = new Adw.PreferencesGroup();
        group.set_description('Shortcuts might not work if they are already bound elsewhere.');
        this.page.add(group);

        addToggle({
            settings,
            group,
            key: 'enable-activate-workspace-shortcuts',
            title: 'Switch to workspace',
            shortcutLabel: '<Super>1...0',
        });

        addToggle({
            settings,
            group,
            key: 'enable-move-to-workspace-shortcuts',
            title: 'Move to workspace',
            shortcutLabel: '<Super><Shift>1...0',
            subtitle: 'With the current window',
        });

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'activate-previous-key',
            title: 'Switch to previous workspace',
        });

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'new-workspace-key',
            title: 'Add new workspace',
        });

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'open-menu',
            title: 'Open menu',
        });
    }
}
