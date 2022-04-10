const { Clutter, Gio, GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

import { Settings } from 'services/Settings';
import { WorkspacesState } from 'services/WorkspacesState';

export class NewWorkspaceButtonClass extends PanelMenu.Button {
    private readonly _settings = Settings.getInstance();
    private readonly _ws = WorkspacesState.getInstance();
    private _enabledInSettings: boolean = false;

    constructor() {
        super(0.0);
        this.style_class = 'panel-button new-workspace-button';

        const label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'new-workspace-button-label',
            text: '+',
        });
        this.add_child(label);

        this._enabledChanged = this._settings.extensionSettings.connect(
            'changed::show-new-workspace-button',
            () => this._updateEnabled(),
        );
        this._updateEnabled();
        this._ws.onUpdate(() => this._updateVisibility());

        this.connect('button-press-event', (actor: any, event: any) => this._onClick());
    }

    destroy() {
        this._settings.extensionSettings.disconnect(this._enabledChanged);
        super.destroy();
    }

    private _onClick() {
        if (this._settings.dynamicWorkspaces.value) {
            this._ws.activate(this._ws.count - 1);
        } else {
            this._ws.addWorkspace();
        }
    }

    private _updateEnabled() {
        this._enabledInSettings = this._settings.extensionSettings.get_boolean(
            'show-new-workspace-button',
        );
        this._updateVisibility();
    }

    private _updateVisibility(): void {
        if (this._enabledInSettings) {
            if (
                this._settings.dynamicWorkspaces.value &&
                this._ws.active_index === this._ws.count - 1
            ) {
                this.visible = false;
            } else {
                this.visible = true;
            }
        } else {
            this.visible = false;
        }
    }
}

export const NewWorkspaceButton = GObject.registerClass(NewWorkspaceButtonClass);
