import { Adw } from 'imports/gi';
import { addToggle } from 'preferences/common';

export class BehaviorPage {
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
            group,
            key: 'show-new-workspace-button',
            title: 'Show new-workspace button',
            subtitle: 'A button next to the workspaces bar that will add a new workspace',
        });
        addToggle({
            group,
            key: 'show-empty-workspaces',
            title: 'Show empty workspaces',
            subtitle: "Includes workspaces that don't have any windows",
        });
        this.page.add(group);
    }
}
