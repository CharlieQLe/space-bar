import { Adw } from 'imports/gi';
import { addToggle } from 'preferences/common';
const ExtensionUtils = imports.misc.extensionUtils;

const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.workspaces-bar.behavior');

export class BehaviorPage {
    window!: Adw.PreferencesWindow;
    page = new Adw.PreferencesPage();

    init() {
        this.page.set_title('Behavior');
        this.page.set_icon_name('settings');
        this._initGroup();
    }

    private _initGroup(): void {
        const group = new Adw.PreferencesGroup();
        // group.set_title('Workspaces Bar');
        addToggle({
            settings,
            group,
            key: 'show-empty-workspaces',
            title: 'Show empty workspaces',
            subtitle: "Includes workspaces that don't have any windows",
        });
        this.page.add(group);
    }
}
