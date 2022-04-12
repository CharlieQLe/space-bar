import { Clutter, Gio, GObject, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import { WorkspacesState } from 'services/WorkspacesState';
const PanelMenu = imports.ui.panelMenu;

const WORKSPACES_SCHEMA = 'org.gnome.desktop.wm.preferences';
const WORKSPACES_KEY = 'workspace-names';

export class WorkspacesBarClass extends PanelMenu.Button {
    private readonly _settings = Settings.getInstance();
    private readonly _ws = WorkspacesState.getInstance();

    constructor() {
        super(0.0);
        this.track_hover = false;
        this.style_class = 'panel-button workspaces-bar';

        this._ws.onUpdate(() => this._update_ws());

        // define gsettings schema for workspaces names, get workspaces names, signal for settings key changed
        this.workspaces_settings = new Gio.Settings({ schema: WORKSPACES_SCHEMA });
        this.workspaces_names_changed = this.workspaces_settings.connect(
            `changed::${WORKSPACES_KEY}`,
            this._update_workspaces_names.bind(this),
        );
        this._settings.showEmptyWorkspaces.subscribe(() => this._update_ws());
        this._settings.showNewWorkspaceButton.subscribe(() => this._update_ws());

        this._settings.dynamicWorkspaces.subscribe(() => this._update_ws());

        // bar creation
        this.ws_bar = new St.BoxLayout({});
        this._update_workspaces_names();
        this.add_child(this.ws_bar);
    }

    destroy() {
        this.workspaces_settings.disconnect(this.workspaces_names_changed);

        this.ws_bar.destroy();
        super.destroy();
    }

    private _update_workspaces_names() {
        this.workspaces_names = this.workspaces_settings.get_strv(WORKSPACES_KEY);
        this._update_ws();
    }

    // update the workspaces bar
    private _update_ws() {
        // destroy old workspaces bar buttons
        this.ws_bar.destroy_all_children();

        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.count; ++ws_index) {
            // Skip empty workspaces when _showEmptyWorkspaces is false.
            if (
                !this._settings.showEmptyWorkspaces.value &&
                !this._ws.workspaces[ws_index].hasWindows &&
                ws_index !== this._ws.active_index
            ) {
                continue;
            }
            // Don't show the last workspace when workspaces are dynamic and we already show the
            // add-workspace button.
            if (
                this._settings.showNewWorkspaceButton.value &&
                this._settings.dynamicWorkspaces.value &&
                ws_index === this._ws.count - 1 &&
                ws_index !== this._ws.active_index
            ) {
                continue;
            }
            const ws_box = new St.Bin({
                visible: true,
                reactive: true,
                can_focus: true,
                track_hover: true,
                style_class: 'workspace-box',
            });
            const label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'desktop-label',
            });
            if (ws_index == this._ws.active_index) {
                label.style_class += ' desktop-label-active';
            } else {
                label.style_class += ' desktop-label-inactive';
            }
            if (this._ws.workspaces[ws_index].hasWindows) {
                label.style_class += ' desktop-label-nonempty';
            } else {
                label.style_class += ' desktop-label-empty';
            }
            if (this.workspaces_names[ws_index]) {
                label.set_text(this.workspaces_names[ws_index]);
            } else {
                label.set_text((ws_index + 1).toString());
            }
            ws_box.set_child(label);
            ws_box.connect('button-press-event', (actor, event: Clutter.Event) => {
                switch (event.get_button()) {
                    case 1:
                        return this._ws.activate(ws_index);
                    case 2:
                        return this._ws.removeWorkspace(ws_index);
                }
            });
            this.ws_bar.add_actor(ws_box);
        }
    }
}

export const WorkspacesBar = GObject.registerClass(WorkspacesBarClass);
