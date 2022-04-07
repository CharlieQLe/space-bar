'use strict';

const { Clutter } = imports.gi;

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { WorkspacesState } = Me.imports.services.WorkspacesState;

var ScrollHandler = class ScrollHandler {
  init() {
    this._ws = WorkspacesState.getInstance();
    this.scroll_binding = Main.panel.connect('scroll-event', (actor, event) =>
      this._handle_scroll(actor, event),
    );
  }

  destroy() {
    Main.panel.disconnect(this.scroll_binding);
    this.scroll_binding = null;
  }

  _handle_scroll(actor, event) {
    // Adapted from https://github.com/timbertson/gnome-shell-scroll-workspaces
    const source = event.get_source();
    if (source !== actor) {
      // Actors in the status area often have their own scroll events,
      if (Main.panel._rightBox?.contains?.(source)) {
        return Clutter.EVENT_PROPAGATE;
      }
    }
    let index = global.workspace_manager.get_active_workspace_index();
    switch (event.get_scroll_direction()) {
      case Clutter.ScrollDirection.UP:
        index = this._findNonEmptyWorkspace(index, -1);
        break;
      case Clutter.ScrollDirection.DOWN:
        index = this._findNonEmptyWorkspace(index, 1);
        break;
      default:
        return Clutter.EVENT_PROPAGATE;
    }
    if (index !== null) {
      global.workspace_manager.get_workspace_by_index(index).activate(global.get_current_time());
    }
    return Clutter.EVENT_STOP;
  }

  _findNonEmptyWorkspace(index, step) {
    while (true) {
      index += step;
      if (index < 0 || index >= this._ws.count) {
        break;
      }
      if (this._ws.workspaces[index].hasWindows) {
        return index;
      }
    }
    return null;
  }
}