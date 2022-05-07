import { Adw } from 'imports/gi';
import { addKeyboardShortcut, addToggle } from 'preferences/common';
const ExtensionUtils = imports.misc.extensionUtils;

const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar.shortcuts');

export class ShortcutsPage {
    window!: Adw.PreferencesWindow;
    page = new Adw.PreferencesPage();

    init() {
        this.page.set_title('Shortcuts');
        this.page.set_icon_name('keyboard');
        this._initGroup();
    }

    private _initGroup(): void {
        const group = new Adw.PreferencesGroup();
        // group.set_title('Workspaces Bar');
        group.set_description('Shortcuts might not work if they are already bound elsewhere.');
        this.page.add(group);

        addToggle({
            settings,
            group,
            key: 'enable-activate-workspace-shortcuts',
            title: 'Enable super+number shortcuts',
            subtitle: 'Switch workspaces by pressing super and a number on the keyboard',
        });

        addToggle({
            settings,
            group,
            key: 'enable-move-to-workspace-shortcuts',
            title: 'Enable super+shift+number shortcuts',
            subtitle:
                'Move the current window to a workspace by pressing super+shift and a number on the keyboard',
        });
        this.page.add(group);

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'activate-previous-key',
            title: 'Activate previous workspace',
        });

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'new-workspace-key',
            title: 'Add a new workspace',
        });

        addKeyboardShortcut({
            settings,
            window: this.window,
            group,
            key: 'open-menu',
            title: 'Open workspaces bar menu',
        });
    }
}
