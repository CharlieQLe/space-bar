import { Shell } from 'imports/gi';
import { Settings } from 'services/Settings';
import { insertInArray, moveArrayElement } from 'utils';
const Main = imports.ui.main;
const AltTab = imports.ui.altTab;

export interface WorkspaceState {
    isEnabled: boolean;
    index: number;
    name?: string;
    hasWindows: boolean;
}

type Workspace = any;
type Window = any;

export class Workspaces {
    static _instance: Workspaces;

    static getInstance() {
        if (!Workspaces._instance) {
            Workspaces._instance = new Workspaces();
        }
        return Workspaces._instance;
    }

    numberOfEnabledWorkspaces = 0;
    lastVisibleWorkspace = 0;
    currentIndex = 0;
    workspaces: WorkspaceState[] = [];

    private _onUpdateCallbacks: Array<() => void> = [];
    private _previousWorkspace = 0;
    private _ws_removed?: number;
    private _ws_active_changed?: number;
    private _ws_number_changed?: number;
    private _restacked: any;
    private _windows_changed: any;
    private _settings = Settings.getInstance();

    init() {
        this._ws_removed = global.workspace_manager.connect('workspace-removed', (_, index) =>
            this._onWorkspaceRemoved(index),
        );
        this._ws_active_changed = global.workspace_manager.connect(
            'active-workspace-changed',
            () => {
                this._previousWorkspace = this.currentIndex;
                this._update();
            },
        );
        this._ws_number_changed = global.workspace_manager.connect('notify::n-workspaces', () =>
            this._update(),
        );
        this._restacked = global.display.connect('restacked', this._update.bind(this));
        this._windows_changed = Shell.WindowTracker.get_default().connect(
            'tracked-windows-changed',
            () => this._update(),
        );
        this._settings.workspaceNames.subscribe(() => this._update());
        this._update();
    }

    destroy() {
        if (this._ws_removed) {
            global.workspace_manager.disconnect(this._ws_removed);
        }
        if (this._ws_active_changed) {
            global.workspace_manager.disconnect(this._ws_active_changed);
        }
        if (this._ws_number_changed) {
            global.workspace_manager.disconnect(this._ws_number_changed);
        }
        if (this._restacked) {
            global.display.disconnect(this._restacked);
        }
        if (this._windows_changed) {
            Shell.WindowTracker.get_default().disconnect(this._windows_changed);
        }
        this._onUpdateCallbacks = [];
    }

    onUpdate(callback: () => void) {
        this._onUpdateCallbacks.push(callback);
    }

    activate(index: number, { focusWindowIfCurrentWorkspace = false } = {}) {
        const isCurrentWorkspace = global.workspace_manager.get_active_workspace_index() === index;
        const workspace = global.workspace_manager.get_workspace_by_index(index);
        if (isCurrentWorkspace) {
            if (
                focusWindowIfCurrentWorkspace &&
                global.display.get_focus_window().is_on_all_workspaces()
            ) {
                this._focusMostRecentWindowOnWorkspace(workspace);
            } else {
                Main.overview.toggle();
            }
        } else {
            if (workspace) {
                workspace.activate(global.get_current_time());
                this._focusMostRecentWindowOnWorkspace(workspace);
                if (!Main.overview.visible && !this.workspaces[index].hasWindows) {
                    Main.overview.show();
                }
            }
        }
    }

    activatePrevious() {
        this.activate(this._previousWorkspace);
    }

    addWorkspace() {
        global.workspace_manager.append_new_workspace(true, global.get_current_time());
        Main.overview.show();
    }

    removeWorkspace(index: number) {
        const workspace = global.workspace_manager.get_workspace_by_index(index);
        if (workspace) {
            global.workspace_manager.remove_workspace(workspace, global.get_current_time());
        }
    }

    private _onWorkspaceRemoved(index: number) {
        this._update();
        const workspaceNames = [...this._settings.workspaceNames.value];
        const [removedName] = workspaceNames.splice(index, 1);
        if (removedName) {
            if (!workspaceNames[this.lastVisibleWorkspace + 1]) {
                workspaceNames[this.lastVisibleWorkspace + 1] = workspaceNames[index];
            } else {
                insertInArray(workspaceNames, this.lastVisibleWorkspace + 1, removedName);
            }
        }
        this._settings.workspaceNames.value = workspaceNames;
    }

    private _update() {
        this.numberOfEnabledWorkspaces = global.workspace_manager.get_n_workspaces();
        this.currentIndex = global.workspace_manager.get_active_workspace_index();
        if (
            this._settings.dynamicWorkspaces.value &&
            this.currentIndex !== this.numberOfEnabledWorkspaces - 1
        ) {
            this.lastVisibleWorkspace = this.numberOfEnabledWorkspaces - 2;
        } else {
            this.lastVisibleWorkspace = this.numberOfEnabledWorkspaces - 1;
        }
        const numberOfTrackedWorkspaces = Math.max(
            this.numberOfEnabledWorkspaces,
            this._settings.workspaceNames.value.length,
        );
        this.workspaces = [...Array(numberOfTrackedWorkspaces)].map((_, index) =>
            this._getWorkspaceState(index),
        );
        this._onUpdateCallbacks.forEach((cb) => cb());
    }

    private _focusMostRecentWindowOnWorkspace(workspace: Workspace) {
        const mostRecentWindowOnWorkspace = AltTab.getWindows(workspace).find(
            (window: Window) => !window.is_on_all_workspaces(),
        );
        if (mostRecentWindowOnWorkspace) {
            workspace.activate_with_focus(mostRecentWindowOnWorkspace, global.get_current_time());
        }
    }

    private _getWorkspaceState(index: number): WorkspaceState {
        if (index < this.numberOfEnabledWorkspaces) {
            const workspace = global.workspace_manager.get_workspace_by_index(index);
            return {
                isEnabled: true,
                hasWindows: getNumberOfWindows(workspace) > 0,
                index,
                name: this._settings.workspaceNames.value[index],
            };
        } else {
            return {
                isEnabled: false,
                hasWindows: false,
                index,
                name: this._settings.workspaceNames.value[index],
            };
        }
    }
}

/**
 * Returns the number of windows on the given workspace, excluding windows on all workspaces, e.g.,
 * windows on a secondary screen when workspaces do not span all screens.
 */
function getNumberOfWindows(workspace: Workspace) {
    const windows: Window[] = workspace.list_windows();
    return windows.filter((window) => !window.is_on_all_workspaces()).length;
}
