const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, St } from 'imports/gi';
import { Settings } from 'services/Settings';
import { WorkspaceNames } from 'services/WorkspaceNames';
import type { WorkspaceState } from 'services/Workspaces';
import { Workspaces } from 'services/Workspaces';
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

export class NewWorkspaceButton {
    private readonly _name = `${Me.metadata.name} New-Menu-Button`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _wsNames = WorkspaceNames.getInstance();
    private readonly _button = new PanelMenu.Button(0.0, this._name);
    private readonly _menu = this._button.menu;
    private _recentWorkspacesSection = new PopupMenu.PopupMenuSection();

    constructor() {}

    init() {
        this._initButton();
        this._initMenu();
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

        this._button.connect('button-press-event', (actor: any, event: Clutter.Event) => {
            switch (event.get_button()) {
                case 1:
                    return Clutter.EVENT_PROPAGATE;
                case 2:
                    this._onClick();
                    return Clutter.EVENT_STOP;
                case 3:
                    return Clutter.EVENT_PROPAGATE;
            }
        });

        Main.panel.addToStatusArea(this._name, this._button, 1, 'left');
    }

    private _initMenu() {
        this._menu.box.add_style_class_name('workspaces-bar-menu');
        this._initNewWorkspaceMenuItem();
        this._menu.addMenuItem(this._recentWorkspacesSection);
        this._menu.connect('open-state-changed', () => {
            if (this._menu.isOpen) {
                this._refreshMenu();
            }
        });
    }

    private _refreshMenu() {
        this._refreshRecentWorkspacesMenuSection();
    }

    private _initNewWorkspaceMenuItem(): void {
        const button = new PopupMenu.PopupMenuItem('New workspace');
        button.connect('activate', () => {
            this._onClick();
        });
        this._menu.addMenuItem(button);
    }

    private _refreshRecentWorkspacesMenuSection(): void {
        this._recentWorkspacesSection.box.destroy_all_children();
        const recentWorkspaces = this._ws.workspaces.filter(
            (workspace, index) => !!workspace.name && index > this._ws.lastVisibleWorkspace,
        );
        if (recentWorkspaces.length === 0) {
            return;
        }
        this._addSectionHeading('Recent workspaces', this._recentWorkspacesSection);
        recentWorkspaces.forEach((workspace) => {
            const button = new PopupMenu.PopupMenuItem(workspace.name);
            button.connect('activate', () => {
                this._onClick(workspace);
            });
            this._recentWorkspacesSection.addMenuItem(button);
        });
    }

    private _addSectionHeading(text: string, section?: any): void {
        const separator = new PopupMenu.PopupSeparatorMenuItem(text);
        separator.label.add_style_class_name('workspaces-bar-menu-heading');
        (section ?? this._menu).addMenuItem(separator);
    }

    private _onClick(workspace?: WorkspaceState) {
        this._menu.close();
        if (workspace) {
            this._wsNames.moveByIndex(workspace.index, this._ws.lastVisibleWorkspace + 1);
        } else {
            this._wsNames.insert(this._ws.lastVisibleWorkspace + 1, '');
        }
        if (this._settings.dynamicWorkspaces.value) {
            this._ws.activate(this._ws.numberOfEnabledWorkspaces - 1);
        } else {
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
