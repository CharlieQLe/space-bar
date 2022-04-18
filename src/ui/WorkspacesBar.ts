const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import { Workspaces } from 'services/Workspaces';
import { WorkspacesBarMenu } from 'ui/WorkspacesBarMenu';
const PanelMenu = imports.ui.panelMenu;

export class WorkspacesBar {
    private readonly _name = `${Me.metadata.name}`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _button = new PanelMenu.Button(0.0, this._name);
    private _wsBar!: St.BoxLayout;

    constructor() {}

    init(): void {
        this._initButton();
        new WorkspacesBarMenu(this._button.menu).init();
    }

    destroy(): void {
        this._wsBar.destroy();
        this._button.destroy();
    }

    private _initButton(): void {
        this._button.track_hover = false;
        this._button.style_class = 'panel-button workspaces-bar';

        this._ws.onUpdate(() => this._update_ws());
        this._settings.showEmptyWorkspaces.subscribe(() => this._update_ws());
        this._settings.showNewWorkspaceButton.subscribe(() => this._update_ws());
        this._settings.dynamicWorkspaces.subscribe(() => this._update_ws());

        // bar creation
        this._wsBar = new St.BoxLayout({});
        this._update_ws();
        this._button.add_child(this._wsBar);
        Main.panel.addToStatusArea(this._name, this._button, 0, 'left');
    }

    // update the workspaces bar
    private _update_ws() {
        // this._refreshMenu();
        // destroy old workspaces bar buttons
        this._wsBar.destroy_all_children();

        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.numberOfEnabledWorkspaces; ++ws_index) {
            const workspace = this._ws.workspaces[ws_index];
            // Skip empty workspaces when _showEmptyWorkspaces is false.
            if (
                !this._settings.showEmptyWorkspaces.value &&
                !workspace.hasWindows &&
                ws_index !== this._ws.currentIndex
            ) {
                continue;
            }
            // Don't show the last workspace when workspaces are dynamic and we already show the
            // add-workspace button.
            if (
                this._settings.showNewWorkspaceButton.value &&
                this._settings.dynamicWorkspaces.value &&
                ws_index === this._ws.numberOfEnabledWorkspaces - 1 &&
                ws_index !== this._ws.currentIndex
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
            if (ws_index == this._ws.currentIndex) {
                label.style_class += ' desktop-label-active';
            } else {
                label.style_class += ' desktop-label-inactive';
            }
            if (workspace.hasWindows) {
                label.style_class += ' desktop-label-nonempty';
            } else {
                label.style_class += ' desktop-label-empty';
            }
            label.set_text(this._ws.getDisplayName(workspace));
            ws_box.set_child(label);
            ws_box.connect('button-press-event', (actor, event: Clutter.Event) => {
                switch (event.get_button()) {
                    case 1:
                        this._ws.activate(ws_index);
                        return Clutter.EVENT_STOP;
                    case 2:
                        this._ws.removeWorkspace(ws_index);
                        return Clutter.EVENT_STOP;
                    case 3:
                        return Clutter.EVENT_PROPAGATE;
                }
            });
            this._wsBar.add_actor(ws_box);
        }
    }
}
