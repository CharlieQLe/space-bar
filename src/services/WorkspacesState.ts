'use strict';

const { Shell } = imports.gi;
const Main = imports.ui.main;
const AltTab = imports.ui.altTab;

class WorkspaceState {
  /** @type boolean */
  hasWindows;
}

var WorkspacesState = class WorkspacesState {
  static _instance;

  static getInstance() {
    if (!WorkspacesState._instance) {
      WorkspacesState._instance = new WorkspacesState();
    }
    return WorkspacesState._instance;
  }

  /** Number of workspaces. */
  count;
  /** Index of active workspace. */
  active_index;
  /** @type Workspace[] */
  workspaces;

  _onUpdateCallbacks = [];
  _previousWorkspace;

  init() {
    this._ws_active_changed = global.workspace_manager.connect('active-workspace-changed', () => {
      this._previousWorkspace = this.active_index;
      this._update();
    });
    this._ws_number_changed = global.workspace_manager.connect(
      'notify::n-workspaces',
      this._update.bind(this),
    );
    this._restacked = global.display.connect('restacked', this._update.bind(this));
    this._windows_changed = Shell.WindowTracker.get_default().connect(
      'tracked-windows-changed',
      this._update.bind(this),
    );
    this._update();
  }

  destroy() {
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
  }

  onUpdate(callback) {
    this._onUpdateCallbacks.push(callback);
  }

  activate(index) {
    if (global.workspace_manager.get_active_workspace_index() === index) {
      Main.overview.toggle();
    } else {
      const workspace = global.workspace_manager.get_workspace_by_index(index);
      workspace.activate(global.get_current_time());
      this._focusMostRecentWindowOnWorkspace(workspace);
      if (!Main.overview.visible && !this.workspaces[index].hasWindows) {
        Main.overview.show();
      }
    }
  }

  activatePrevious() {
    this.activate(this._previousWorkspace);
  }

  _update() {
    this.count = global.workspace_manager.get_n_workspaces();
    this.active_index = global.workspace_manager.get_active_workspace_index();
    this.workspaces = [...Array(this.count)].map((_, index) => getWorkspaceState(index));
    this._onUpdateCallbacks.forEach((cb) => cb());
  }

  _focusMostRecentWindowOnWorkspace(workspace) {
    const mostRecentWindowOnWorkspace = AltTab.getWindows(workspace).find(
      (window) => !window.is_on_all_workspaces(),
    );
    if (mostRecentWindowOnWorkspace) {
      workspace.activate_with_focus(mostRecentWindowOnWorkspace, global.get_current_time());
    }
  }
};

function getWorkspaceState(index) {
  const workspace = global.workspace_manager.get_workspace_by_index(index);
  return {
    hasWindows: getNumberOfWindows(workspace) > 0,
  };
}

/**
 * Returns the number of windows on the given workspace, excluding windows on all workspaces, e.g.,
 * windows on a secondary screen when workspaces do not span all screens.
 */
function getNumberOfWindows(workspace) {
  const windows = workspace.list_windows();
  return windows.filter((window) => !window.is_on_all_workspaces()).length;
}
