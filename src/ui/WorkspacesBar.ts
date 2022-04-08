const { Clutter, Gio, GObject, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;

import { WorkspacesState } from 'services/WorkspacesState';

const WORKSPACES_SCHEMA = 'org.gnome.desktop.wm.preferences';
const WORKSPACES_KEY = 'workspace-names';

export class WorkspacesBarClass extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Workspaces bar');
        this.track_hover = false;

        this._ws = WorkspacesState.getInstance();
        this._ws.onUpdate(() => this._update_ws());

        // define gsettings schema for workspaces names, get workspaces names, signal for settings key changed
        this.workspaces_settings = new Gio.Settings({ schema: WORKSPACES_SCHEMA });
        this.workspaces_names_changed = this.workspaces_settings.connect(
            `changed::${WORKSPACES_KEY}`,
            this._update_workspaces_names.bind(this),
        );

        // get setting for dynamic workspaces
        this.mutter_settings = new Gio.Settings({ schema: 'org.gnome.mutter' });
        this.dynamic_workspaces_changed = this.mutter_settings.connect(
            `changed::dynamic-workspaces`,
            () => this._update_dynamic_workspaces(),
        );

        // bar creation
        this.ws_bar = new St.BoxLayout({});
        this._update_workspaces_names();
        this._update_dynamic_workspaces();
        this.add_child(this.ws_bar);
    }

    // remove signals, restore Activities button, destroy workspaces bar
    _destroy() {
        if (this.workspaces_names_changed) {
            this.workspaces_settings.disconnect(this.workspaces_names_changed);
        }
        if (this.dynamic_workspaces_changed) {
            this.mutter_settings.disconnect(this.dynamic_workspaces_changed);
        }
        this.ws_bar.destroy();
        super.destroy();
    }

    private _update_workspaces_names() {
        this.workspaces_names = this.workspaces_settings.get_strv(WORKSPACES_KEY);
        this._update_ws();
    }

    private _update_dynamic_workspaces() {
        this.dynamic_workspaces = this.mutter_settings.get_boolean('dynamic-workspaces');
        this._update_ws();
    }

    // update the workspaces bar
    private _update_ws() {
        // destroy old workspaces bar buttons
        this.ws_bar.destroy_all_children();

        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.count; ++ws_index) {
            const ws_box = new St.Bin({
                visible: true,
                reactive: true,
                can_focus: true,
                track_hover: true,
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

            if (
                this.dynamic_workspaces &&
                ws_index === this._ws.count - 1 &&
                ws_index !== this._ws.active_index
            ) {
                label.set_text('+');
            } else if (this.workspaces_names[ws_index]) {
                label.set_text(this.workspaces_names[ws_index]);
            } else {
                label.set_text((ws_index + 1).toString());
            }
            ws_box.set_child(label);
            ws_box.connect('button-press-event', (actor: any, event: any) =>
                this._ws.activate(ws_index),
            );
            this.ws_bar.add_actor(ws_box);
        }
    }
}

export const WorkspacesBar = GObject.registerClass(WorkspacesBarClass);
