const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { WorkspacesBar } = Me.imports.ui.WorkspacesBar;
const { WorkspacesState } = Me.imports.services.WorkspacesState;
const { ScrollHandler } = Me.imports.services.ScrollHandler;
const { KeyBindings } = Me.imports.services.KeyBindings;
const { showActivities } = Me.imports.services.showActivities;

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
