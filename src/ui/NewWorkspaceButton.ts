const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import type { WorkspaceState } from 'services/Workspaces';
import { Workspaces } from 'services/Workspaces';
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

export class NewWorkspaceButton {
    private readonly _name = `${Me.metadata.name} New-Menu-Button`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _button = new PanelMenu.Button(0.0, this._name);
    private readonly _menu = this._button.menu;

    constructor() {}

    init() {
        this._initButton();
        this._initMenu();
        this._ws.onUpdate(() => this._refreshMenu());
    }

    destroy() {
        this._button.destroy();
    }

    private _initButton(): void {
        this._button.style_class = 'panel-button new-workspace-button';

        const label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'new-workspace-button-label',
            text: '+',
        });
        this._button.add_child(label);

        this._settings.showNewWorkspaceButton.subscribe(() => this._updateVisibility());
        this._ws.onUpdate(() => this._updateVisibility());
        this._updateVisibility();

        // this._button.connect('button-press-event', (actor: any, event: any) => this._onClick());

        Main.panel.addToStatusArea(this._name, this._button, 1, 'left');
    }

    private _initMenu() {
        this._menu.box.add_style_class_name('new-workspace-menu');
        this._initNewWorkspaceMenuSection();
        // this._menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }

    private _refreshMenu() {
        this._menu.box.destroy_all_children();
        this._initMenu();
    }

    private _initNewWorkspaceMenuSection(): void {
        const section = new PopupMenu.PopupMenuSection();
    
        const separator = new PopupMenu.PopupSeparatorMenuItem('New Workspace');
        separator.label.add_style_class_name('new-workspace-menu-heading')
        section.addMenuItem(separator);

        let lastVisibleWorkspace = this._ws.numberOfEnabledWorkspaces - 1;
        if (this._settings.dynamicWorkspaces.value) {
            lastVisibleWorkspace--;
        }
        this._ws.workspaces
            .filter((_, index) => index > lastVisibleWorkspace)
            .forEach((workspace) => {
                const testButton = new PopupMenu.PopupMenuItem(workspace.name);
                testButton.connect('activate', () => {
                    this._onClick(workspace);
                });
                section.addMenuItem(testButton);
            });

        this._menu.addMenuItem(section);
    }

    private _onClick(workspace: WorkspaceState) {
        this._menu.close();
        const workspaceNames = [...this._settings.workspaceNames.value];
        if (this._settings.dynamicWorkspaces.value) {
            moveArrayElement(
                workspaceNames,
                workspace.index,
                this._ws.numberOfEnabledWorkspaces - 1,
            );
            this._settings.workspaceNames.value = workspaceNames;
            this._ws.activate(this._ws.numberOfEnabledWorkspaces - 1);
        } else {
            moveArrayElement(workspaceNames, workspace.index, this._ws.numberOfEnabledWorkspaces);
            this._settings.workspaceNames.value = workspaceNames;
            this._ws.addWorkspace();
        }
    }

    private _updateVisibility(): void {
        if (this._settings.showNewWorkspaceButton.value) {
            if (
                this._settings.dynamicWorkspaces.value &&
                this._ws.currentIndex === this._ws.numberOfEnabledWorkspaces - 1
            ) {
                this._button.visible = false;
            } else {
                this._button.visible = true;
            }
        } else {
            this._button.visible = false;
        }
    }
}

function moveArrayElement<T>(array: T[], oldIndex: number, newIndex: number): void {
    const [element] = array.splice(oldIndex, 1);
    array.splice(newIndex, 0, element);
}
