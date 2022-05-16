const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
import { Adw } from 'imports/gi';
import { addCombo, addToggle } from 'preferences/common';

const settings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.behavior`);

export const scrollWheelOptions = {
    panel: 'Over top panel',
    'workspaces-bar': 'Over workspaces bar',
    disabled: 'Disabled',
};

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
            // subtitle: "Shows workspaces that don't have any windows in the workspaces bar",
        });
        addCombo({
            window: this.window,
            settings,
            group,
            key: 'scroll-wheel',
            title: 'Switch workspaces with scroll wheel',
            options: scrollWheelOptions,
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
