import { Clutter } from 'imports/gi';
import { Workspaces } from 'services/WorkspacesState';
const Main = imports.ui.main;

export class ScrollHandler {
    private _ws!: Workspaces;
    private scroll_binding: any;

    init() {
        this._ws = Workspaces.getInstance();
        this.scroll_binding = Main.panel.connect('scroll-event', (actor: any, event: any) =>
            this._handle_scroll(actor, event),
        );
    }

    destroy() {
        Main.panel.disconnect(this.scroll_binding);
        this.scroll_binding = null;
    }

    _handle_scroll(actor: any, event: any) {
        // Adapted from https://github.com/timbertson/gnome-shell-scroll-workspaces
        const source = event.get_source();
        if (source !== actor) {
            // Actors in the status area often have their own scroll events,
            if (Main.panel._rightBox?.contains?.(source)) {
                return Clutter.EVENT_PROPAGATE;
            }
        }
        const currentIndex = global.workspace_manager.get_active_workspace_index();
        let newIndex
        switch (event.get_scroll_direction()) {
            case Clutter.ScrollDirection.UP:
                newIndex = this._findNonEmptyWorkspace(currentIndex, -1);
                break;
            case Clutter.ScrollDirection.DOWN:
                newIndex = this._findNonEmptyWorkspace(currentIndex, 1);
                break;
            default:
                return Clutter.EVENT_PROPAGATE;
        }
        if (newIndex !== null) {
            global.workspace_manager
                .get_workspace_by_index(newIndex)
                ?.activate(global.get_current_time());
        }
        return Clutter.EVENT_STOP;
    }

    _findNonEmptyWorkspace(index: number, step: number) {
        while (true) {
            index += step;
            if (index < 0 || index >= this._ws.numberOfEnabledWorkspaces) {
                break;
            }
            if (this._ws.workspaces[index].hasWindows) {
                return index;
            }
        }
        return null;
    }
}
