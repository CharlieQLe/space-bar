const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;

import { KeyBindings } from 'services/KeyBindings';
import { ScrollHandler } from 'services/ScrollHandler';
import { showActivities } from 'services/showActivities';
import { WorkspacesState } from 'services/WorkspacesState';
import type { WorkspacesBarClass } from 'ui/WorkspacesBar';
import { WorkspacesBar } from 'ui/WorkspacesBar';
import { Settings } from 'services/Settings';
import { NewWorkspaceButton } from 'ui/NewWorkspaceButton';

class Extension {
    private workspacesState: WorkspacesState | null = null;
    private workspacesBar: WorkspacesBarClass | null = null;
    private newWorkspaceButton: NewWorkspaceButton | null = null;
    private scrollHandler: ScrollHandler | null = null;
    private keyBindings: KeyBindings | null = null;

    enable() {
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        Settings.init();
        showActivities(false);
        this.workspacesState = WorkspacesState.getInstance();
        this.workspacesState.init();
        this.workspacesBar = new WorkspacesBar();
        Main.panel.addToStatusArea('workspaces-bar', this.workspacesBar, 0, 'left');
        this.newWorkspaceButton = new NewWorkspaceButton();
        this.newWorkspaceButton.init();
        this.scrollHandler = new ScrollHandler();
        this.scrollHandler.init();
        this.keyBindings = new KeyBindings();
        this.keyBindings.init();
    }

    disable() {
        this.keyBindings?.destroy();
        this.keyBindings = null;
        this.scrollHandler?.destroy();
        this.scrollHandler = null;
        this.workspacesBar?.destroy();
        this.workspacesBar = null;
        this.newWorkspaceButton?.destroy();
        this.newWorkspaceButton = null;
        this.workspacesState?.destroy();
        this.workspacesState = null;
        showActivities(true);
        Settings.destroy();
    }
}

// @ts-ignore
function init() {
    return new Extension();
}
