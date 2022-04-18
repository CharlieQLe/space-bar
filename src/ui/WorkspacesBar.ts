const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, GObject, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import { Workspaces, WorkspaceState } from 'services/Workspaces';
import { WorkspacesBarMenu } from 'ui/WorkspacesBarMenu';
const PanelMenu = imports.ui.panelMenu;
const DND = imports.ui.dnd;

export class WorkspacesBar {
    private readonly _name = `${Me.metadata.name}`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _button = new (WorkspacesButton as any)(0.0, this._name);
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
        this._ws.onUpdate(() => this._updateWorkspaces());
        this._settings.showEmptyWorkspaces.subscribe(() => this._updateWorkspaces());
        this._settings.showNewWorkspaceButton.subscribe(() => this._updateWorkspaces());
        this._settings.dynamicWorkspaces.subscribe(() => this._updateWorkspaces());

        // bar creation
        this._wsBar = new St.BoxLayout({});
        this._updateWorkspaces();
        this._button.add_child(this._wsBar);
        Main.panel.addToStatusArea(this._name, this._button, 0, 'left');
    }

    // update the workspaces bar
    private _updateWorkspaces() {
        // destroy old workspaces bar buttons
        this._wsBar.destroy_all_children();
        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.numberOfEnabledWorkspaces; ++ws_index) {
            const workspace = this._ws.workspaces[ws_index];
            if (workspace.isVisible) {
                const wsBox = this._createWsBox(workspace);
                this._wsBar.add_actor(wsBox);
            }
        }
    }

    private _createWsBox(workspace: WorkspaceState): St.Bin {
        const wsBox = new St.Bin({
            visible: true,
            reactive: true,
            can_focus: true,
            track_hover: true,
            style_class: 'workspace-box',
        });
        const label = this._createLabel(workspace);
        wsBox.set_child(label);
        wsBox.connect('button-release-event', (actor, event: Clutter.Event) => {
            switch (event.get_button()) {
                case 1:
                    this._ws.activate(workspace.index);
                    return Clutter.EVENT_PROPAGATE; // Allow drag and drop
                case 2:
                    this._ws.removeWorkspace(workspace.index);
                    return Clutter.EVENT_STOP;
                case 3:
                    this._button.menu.toggle();
                    return Clutter.EVENT_PROPAGATE;
            }
        });
        this._setupDnd(wsBox, workspace);
        return wsBox;
    }

    private _createLabel(workspace: WorkspaceState): St.Label {
        const label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'workspaces-bar-workspace-label',
        });
        if (workspace.index == this._ws.currentIndex) {
            label.style_class += ' workspaces-bar-workspace-label-active';
        } else {
            label.style_class += ' workspaces-bar-workspace-label-inactive';
        }
        if (workspace.hasWindows) {
            label.style_class += ' workspaces-bar-workspace-label-nonempty';
        } else {
            label.style_class += ' workspaces-bar-workspace-label-empty';
        }
        label.set_text(this._ws.getDisplayName(workspace));
        return label;
    }

    private _setupDnd(wsBox: St.Bin, workspace: WorkspaceState): void {
        const draggable = DND.makeDraggable(wsBox, {});
        draggable.connect('drag-begin', () => {
            console.log('drag begin');
        });
        draggable.connect('drag-end', () => {
            console.log('drag end');
        });
        draggable.connect('drag-cancelled', () => {
            console.log('drag cancelled');
        });
    }
}

var WorkspacesButton = GObject.registerClass(
    class WorkspacesButton extends PanelMenu.Button {
        vfunc_event() {
            return Clutter.EVENT_PROPAGATE;
        }
    },
);
