import { KeyBindings } from 'services/KeyBindings';
import { ScrollHandler } from 'services/ScrollHandler';
import { Settings } from 'services/Settings';
import { showActivities } from 'services/showActivities';
import { Workspaces } from 'services/Workspaces';
import { NewWorkspaceButton } from 'ui/NewWorkspaceButton';
import { WorkspacesBar } from 'ui/WorkspacesBar';

class Extension {
    private workspacesState: Workspaces | null = null;
    private workspacesBar: WorkspacesBar | null = null;
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
        this.workspacesState = Workspaces.getInstance();
        this.workspacesState.init();
        this.keyBindings = new KeyBindings();
        this.keyBindings.init();
        this.workspacesBar = new WorkspacesBar();
        this.workspacesBar.init();
        this.newWorkspaceButton = new NewWorkspaceButton();
        this.newWorkspaceButton.init();
        this.scrollHandler = new ScrollHandler();
        this.scrollHandler.init();
    }

    disable() {
        Settings.destroy();
        this.workspacesState?.destroy();
        this.workspacesState = null;
        this.keyBindings?.destroy();
        this.keyBindings = null;
        this.scrollHandler?.destroy();
        this.scrollHandler = null;
        this.workspacesBar?.destroy();
        this.workspacesBar = null;
        this.newWorkspaceButton?.destroy();
        this.newWorkspaceButton = null;
        showActivities(true);
    }
}

// @ts-ignore
function init() {
    return new Extension();
}
