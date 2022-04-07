const Main = imports.ui.main;

import { WorkspacesBar } from 'ui/WorkspacesBar';
import { WorkspacesState } from 'services/WorkspacesState';
import { ScrollHandler } from 'services/ScrollHandler';
import { KeyBindings } from 'services/KeyBindings';
import { showActivities } from 'services/showActivities';

class Extension {
    private workspacesState: WorkspacesState | null = null;
    private workspacesBar: typeof WorkspacesBar | null = null;
    private scrollHandler: ScrollHandler | null = null;
    private keyBindings: KeyBindings | null = null;

    constructor() {}

    enable() {
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        console.log('-------------------------------------------------------');
        showActivities(false);
        this.workspacesState = WorkspacesState.getInstance();
        this.workspacesState!.init();
        this.workspacesBar = new WorkspacesBar();
        Main.panel.addToStatusArea('workspaces-bar', this.workspacesBar, 0, 'left');
        this.scrollHandler = new ScrollHandler();
        this.scrollHandler.init();
        this.keyBindings = new KeyBindings();
        this.keyBindings.init();
    }

    disable() {
        this.keyBindings?.destroy();
        this.scrollHandler?.destroy();
        this.workspacesBar?._destroy();
        this.workspacesState?.destroy();
        showActivities(true);
    }
}

// @ts-ignore
function init() {
    return new Extension();
}
