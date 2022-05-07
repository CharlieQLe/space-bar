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
        this._initGeneralGroup();
        this._initSmartWorkspaceNamesGroup();
    }

    private _initGeneralGroup(): void {
        const group = new Adw.PreferencesGroup();
        group.set_title('General');
        addToggle({
            settings,
            group,
            key: 'show-empty-workspaces',
            title: 'Show empty workspaces',
            subtitle: "Shows workspaces that don't have any windows in the workspaces bar",
        });
        this.page.add(group);
    }

    private _initSmartWorkspaceNamesGroup(): void {
        const group = new Adw.PreferencesGroup();
        group.set_title('Smart Workspace Names');
        group.set_description(
            'Remembers open applications when renaming a workspace and automatically assigns workspace names based on the first application started on a new workspace.',
        );
        addToggle({
            settings,
            group,
            key: 'smart-workspace-names',
            title: 'Enable smart workspace names',
            // subtitle: 'Automatically assign workspace names based on started applications',
        });
        this.page.add(group);
    }
}
