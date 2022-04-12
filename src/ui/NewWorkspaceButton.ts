const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import { WorkspacesState } from 'services/WorkspacesState';
const PanelMenu = imports.ui.panelMenu;

export class NewWorkspaceButton {
    private readonly _name = `${Me.metadata.name} New-Menu-Button`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = WorkspacesState.getInstance();
    private readonly _button = new PanelMenu.Button(0.0, this._name);

    constructor() {}

    init() {
        this._button.style_class = 'panel-button new-workspace-button';

        const label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'new-workspace-button-label',
            text: '+',
        });
        this._button.add_child(label);

        this._settings.showNewWorkspaceButton.subscribe(() => this._updateVisibility());
        this._ws.onUpdate(() => this._updateVisibility());
        this._updateVisibility();

        this._button.connect('button-press-event', (actor: any, event: any) => this._onClick());

        Main.panel.addToStatusArea(this._name, this._button, 1, 'left');
    }

    destroy() {
        this._button.destroy();
    }

    private _onClick() {
        if (this._settings.dynamicWorkspaces.value) {
            this._ws.activate(this._ws.count - 1);
        } else {
            this._ws.addWorkspace();
        }
    }

    private _updateVisibility(): void {
        if (this._settings.showNewWorkspaceButton.value) {
            if (
                this._settings.dynamicWorkspaces.value &&
                this._ws.active_index === this._ws.count - 1
            ) {
                this._button.visible = false;
            } else {
                this._button.visible = true;
            }
        } else {
            this._button.visible = false;
        }
    }
}
