import { Adw } from 'imports/gi';
import { addKeyboardShortcut, addToggle } from 'preferences/common';

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
        addToggle({
            group,
            key: 'enable-activate-workspace-shortcuts',
            title: 'Enable super + number shortcuts',
            subtitle: 'Switch workspaces by pressing super and a number on the keyboard',
        });
        this.page.add(group);

        addKeyboardShortcut({
            window: this.window,
            group,
            key: 'activate-previous-key',
            title: 'Activate the previously active workspace'
        })

        addKeyboardShortcut({
            window: this.window,
            group,
            key: 'open-menu',
            title: 'Open the workspaces bar menu'
        })
    }
}
