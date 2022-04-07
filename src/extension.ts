// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;

import { WorkspacesBar } from 'ui/WorkspacesBar';
import { WorkspacesState } from 'services/WorkspacesState';
import { ScrollHandler } from 'services/ScrollHandler';
import { KeyBindings } from 'services/KeyBindings';
import { showActivities } from 'services/showActivities';

class Extension {
  constructor() {}

  enable() {
    console.log('-------------------------------------------------------');
    console.log('-------------------------------------------------------');
    console.log('-------------------------------------------------------');
    console.log('-------------------------------------------------------');
    console.log('-------------------------------------------------------');
    console.log('-------------------------------------------------------');
    showActivities(false);
    this.workspaces_state = WorkspacesState.getInstance();
    this.workspaces_state.init();
    this.workspaces_bar = new WorkspacesBar();
    Main.panel.addToStatusArea('workspaces-bar', this.workspaces_bar, 0, 'left');
    this.scroll_handler = new ScrollHandler();
    this.scroll_handler.init();
    this.key_bindings = new KeyBindings();
    this.key_bindings.init();
  }

  disable() {
    this.key_bindings.destroy();
    this.scroll_handler.destroy();
    this.workspaces_bar._destroy();
    this.workspaces_state.destroy();
    showActivities(true);
  }
}

function init() {
  return new Extension();
}
