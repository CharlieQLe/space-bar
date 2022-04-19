const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, GObject, St } from 'imports/gi';
import type { Meta } from 'imports/gi';
import { Settings } from 'services/Settings';
import { Workspaces, WorkspaceState } from 'services/Workspaces';
import { WorkspacesBarMenu } from 'ui/WorkspacesBarMenu';
const PanelMenu = imports.ui.panelMenu;
const DND = imports.ui.dnd;

interface DragEvent {
    x: number;
    y: number;
    dragActor: Clutter.Actor;
    source?: any;
    targetActor: Clutter.Actor;
}

interface DropEvent {
    dropActor: Clutter.Actor;
    targetActor: Clutter.Actor;
    clutterEvent: Clutter.Event;
}

interface DropPosition {
    index: number;
    wsBox: St.Bin;
    position: 'before' | 'after';
    width: number;
}

interface WsBoxPosition {
    index: number;
    center: number;
    wsBox: St.Bin;
}

export class WorkspacesBar {
    private readonly _name = `${Me.metadata.name}`;
    private readonly _wsBoxName = `${Me.metadata.name} workspace box`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _button = new (WorkspacesButton as any)(0.0, this._name);
    private _wsBar!: St.BoxLayout;
    private _dragMonitor: any;
    private _wsBoxes: {
        workspace: WorkspaceState;
        wsBox: St.Bin;
    }[] = [];
    private _draggedWorkspace?: WorkspaceState | null;
    private _wsBoxPositions?: WsBoxPosition[] | null;

    constructor() {}

    init(): void {
        this._initButton();
        new WorkspacesBarMenu(this._button.menu).init();
    }

    destroy(): void {
        this._wsBar.destroy();
        this._button.destroy();
        this._setDragMonitor(false);
    }

    private _initButton(): void {
        this._button._delegate = { acceptDrop: this.acceptDrop.bind(this) };
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
        this._wsBoxes = [];
        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.numberOfEnabledWorkspaces; ++ws_index) {
            const workspace = this._ws.workspaces[ws_index];
            if (workspace.isVisible) {
                const wsBox = this._createWsBox(workspace);
                this._wsBar.add_child(wsBox);
                this._wsBoxes.push({ workspace, wsBox });
            }
        }
    }

    private _createWsBox(workspace: WorkspaceState): St.Bin {
        const wsBox = new St.Bin({
            name: this._wsBoxName,
            visible: true,
            reactive: true,
            can_focus: true,
            track_hover: true,
            style_class: 'workspace-box',
        });
        (wsBox as any)._delegate = {
            acceptDrop: (source: any) => {
                if (source?.constructor.name === 'WindowPreview') {
                    (source.metaWindow as Meta.Window).change_workspace_by_index(
                        workspace.index,
                        false,
                    );
                }
            },
            handleDragOver: (source: any) => {
                if (source?.constructor.name === 'WindowPreview') {
                    return DND.DragMotionResult.MOVE_DROP;
                } else {
                    return DND.DragMotionResult.CONTINUE;
                }
            },
        };
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
            label.style_class += ' active';
        } else {
            label.style_class += ' inactive';
        }
        if (workspace.hasWindows) {
            label.style_class += ' nonempty';
        } else {
            label.style_class += ' empty';
        }
        label.set_text(this._ws.getDisplayName(workspace));
        return label;
    }

    private _setupDnd(wsBox: St.Bin, workspace: WorkspaceState): void {
        const draggable = DND.makeDraggable(wsBox, {});
        draggable.connect('drag-begin', () => {
            this._onDragStart(wsBox, workspace);
        });
        draggable.connect('drag-cancelled', () => {
            console.log('drag cancelled');
            this._updateDragPlaceholder(this._getInitialDropPosition(wsBox, workspace));
            this._onDragFinished(wsBox);
        });
        draggable.connect('drag-end', () => {
            console.log('drag end');
            this._updateWorkspaces();
        });
    }
    private _onDragStart(wsBox: St.Bin, workspace: WorkspaceState): void {
        wsBox.add_style_class_name('dragging');
        this._draggedWorkspace = workspace;
        this._setDragMonitor(true);
        this._setUpBoxPositions(wsBox, workspace);
    }

    private _onDragFinished(wsBox: St.Bin): void {
        wsBox.remove_style_class_name('dragging');
        this._draggedWorkspace = null;
        this._wsBoxPositions = null;
        this._setDragMonitor(false);
    }

    private _setDragMonitor(add: boolean): void {
        if (add) {
            this._dragMonitor = {
                dragMotion: this._onDragMotion.bind(this),
            };
            DND.addDragMonitor(this._dragMonitor);
        } else if (this._dragMonitor) {
            DND.removeDragMonitor(this._dragMonitor);
        }
    }

    private _onDragMotion(dragEvent: DragEvent): void {
        const dropPosition = this._getDropPosition();
        this._updateDragPlaceholder(dropPosition);
        return DND.DragMotionResult.CONTINUE;
    }

    private _setUpBoxPositions(wsBox: St.Bin, workspace: WorkspaceState) {
        const boxIndex = this._wsBoxes.findIndex((box) => box.workspace === workspace);
        this._wsBoxPositions = this._getWsBoxPositions(boxIndex, wsBox.get_width());
        this._updateDragPlaceholder(this._getInitialDropPosition(wsBox, workspace));
    }

    private _getInitialDropPosition(
        wsBox: St.Bin,
        workspace: WorkspaceState,
    ): DropPosition | undefined {
        const boxIndex = this._wsBoxes.findIndex((box) => box.workspace === workspace);
        if (boxIndex < this._wsBoxes.length - 1) {
            return {
                index: workspace.index,
                wsBox: this._wsBoxes[boxIndex + 1].wsBox,
                position: 'before',
                width: wsBox.get_width(),
            };
        } else if (this._wsBoxes.length > 1) {
            return {
                index: workspace.index,
                wsBox: this._wsBoxes[boxIndex - 1].wsBox,
                position: 'after',
                width: wsBox.get_width(),
            };
        }
    }

    private _getDropPosition(): DropPosition {
        const draggedWsBox = this._wsBoxes.find(
            ({ workspace }) => workspace === this._draggedWorkspace,
        )?.wsBox as St.Bin;
        for (const { index, center, wsBox } of this._wsBoxPositions!) {
            if (draggedWsBox.get_x() < center) {
                return { index, wsBox, position: 'before', width: draggedWsBox.get_width() };
            }
        }
        const lastWsBox = this._wsBoxPositions![this._wsBoxPositions!.length - 1].wsBox;
        return {
            index: this._ws.lastVisibleWorkspace,
            wsBox: lastWsBox,
            position: 'after',
            width: draggedWsBox.get_width(),
        };
    }

    private _getWsBoxPositions(draggedBoxIndex: number, draggedBoxWidth: number): WsBoxPosition[] {
        const positions = this._wsBoxes
            .filter(({ workspace }) => workspace !== this._draggedWorkspace)
            .map(({ workspace, wsBox }) => ({
                index: getDropIndex(this._draggedWorkspace as WorkspaceState, workspace),
                center: getHorizontalCenter(wsBox),
                wsBox,
            }));
        positions.forEach((position, index) => {
            if (index >= draggedBoxIndex) {
                position.center -= draggedBoxWidth;
            }
        });
        return positions;
    }

    private _updateDragPlaceholder(dropPosition?: DropPosition): void {
        for (const { wsBox } of this._wsBoxes) {
            if (wsBox === dropPosition?.wsBox) {
                if (dropPosition!.position === 'before') {
                    wsBox?.set_style('margin-left: ' + dropPosition!.width + 'px');
                } else {
                    wsBox?.set_style('margin-right: ' + dropPosition!.width + 'px');
                }
            } else {
                wsBox.set_style(null);
            }
        }
    }

    acceptDrop(source: any, actor: Clutter.Actor, x: number, y: number): boolean {
        if (actor?.name === this._wsBoxName) {
            const { index } = this._getDropPosition();
            if (this._draggedWorkspace!.index === index) {
                this._updateWorkspaces();
            } else {
                this._ws.reorderWorkspace(this._draggedWorkspace!.index, index);
            }
            this._onDragFinished(actor as St.Bin);
            return true;
        } else {
            return false;
        }
    }
}

var WorkspacesButton = GObject.registerClass(
    class WorkspacesButton extends PanelMenu.Button {
        vfunc_event() {
            return Clutter.EVENT_PROPAGATE;
        }
    },
);

function getDropIndex(draggedWorkspace: WorkspaceState, workspace: WorkspaceState): number {
    if (draggedWorkspace.index < workspace.index) {
        return workspace.index - 1;
    } else {
        return workspace.index;
    }
}

function getHorizontalCenter(widget: St.Widget): number {
    return widget.get_x() + widget.get_width() / 2;
}
