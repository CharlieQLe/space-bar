import { Adw } from 'imports/gi';
import { addToggle } from 'preferences/common';

export class BehaviorPage {
    page = new Adw.PreferencesPage();

    init() {
        this.page.set_title('Behavior');
        this._initGroup();
    }

    private _initGroup(): void {
        const group = new Adw.PreferencesGroup();
        addToggle({ group, key: 'show-new-workspace-button', title: 'Show New-Workspace Button' });
        addToggle({ group, key: 'show-empty-workspaces', title: 'Show Empty Workspaces' });
        this.page.add(group);
    }
}
