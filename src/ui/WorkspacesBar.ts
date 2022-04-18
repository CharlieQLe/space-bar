const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
import { Clutter, GObject, St } from 'imports/gi';
import { KeyBindings } from 'services/KeyBindings';
import { Settings } from 'services/Settings';
import { WorkspaceNames } from 'services/WorkspaceNames';
import { Workspaces } from 'services/Workspaces';
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

export class WorkspacesBar {
    private readonly _name = `${Me.metadata.name}`;
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _wsNames = WorkspaceNames.getInstance();
    private readonly _keyBindings = KeyBindings.getInstance();
    private readonly _button = new PanelMenu.Button(0.0, this._name);
    private readonly _menu = this._button.menu;
    private _wsBar!: St.BoxLayout;
    private _recentWorkspacesSection = new PopupMenu.PopupMenuSection();

    constructor() {}

    init(): void {
        this._initButton();
        this._initMenu();
        this._keyBindings.addKeyBinding('open-menu', () => this._menu.open());
    }

    destroy(): void {
        this._wsBar.destroy();
        this._button.destroy();
    }

    private _initButton(): void {
        this._button.track_hover = false;
        this._button.style_class = 'panel-button workspaces-bar';

        this._ws.onUpdate(() => this._update_ws());
        this._settings.showEmptyWorkspaces.subscribe(() => this._update_ws());
        this._settings.showNewWorkspaceButton.subscribe(() => this._update_ws());
        this._settings.dynamicWorkspaces.subscribe(() => this._update_ws());

        // bar creation
        this._wsBar = new St.BoxLayout({});
        this._update_ws();
        this._button.add_child(this._wsBar);
        Main.panel.addToStatusArea(this._name, this._button, 0, 'left');
    }

    private _initMenu(): void {
        this._menu.box.add_style_class_name('workspaces-bar-menu');
        this._addSectionHeading('Rename current workspace');
        this._initEntry();
        this._menu.addMenuItem(this._recentWorkspacesSection);
        this._initHiddenWorkspaces();
    }

    private _refreshMenu() {
        this._refreshRecentWorkspaces();
    }

    private _addSectionHeading(text: string, section?: any): void {
        const separator = new PopupMenu.PopupSeparatorMenuItem(text);
        separator.label.add_style_class_name('workspaces-bar-menu-heading');
        (section ?? this._menu).addMenuItem(separator);
    }

    private _initEntry(): void {
        const entryItem = new PopupMenuItemEntry();
        entryItem.entry.connect('key-focus-in', () =>
            entryItem.entry.get_clutter_text().set_selection(0, entryItem.entry.get_text().length),
        );
        entryItem.entry.get_clutter_text().connect('activate', () => this._menu.close());
        entryItem.connect('notify::active', () => {
            if (entryItem.active) {
                entryItem.entry.grab_key_focus();
            }
        });
        let oldName = '';
        this._menu.connect('open-state-changed', () => {
            if (this._menu.isOpen) {
                oldName = this._ws.workspaces[this._ws.currentIndex].name || '';
                entryItem.entry.set_text(oldName);
                entryItem.active = true;
            } else {
                const newName = entryItem.entry.get_text();
                if (newName !== oldName) {
                    this._wsNames.rename(this._ws.currentIndex, newName);
                }
            }
        });
        this._menu.addMenuItem(entryItem);
    }

    private _refreshRecentWorkspaces(): void {
        this._recentWorkspacesSection.box.destroy_all_children();

        const recentWorkspaces = this._ws.workspaces.filter(
            (workspace, index) => !!workspace.name && index > this._ws.lastVisibleWorkspace,
        );
        recentWorkspaces.forEach((workspace) => {
            const button = new PopupMenu.PopupMenuItem(workspace.name);
            button.connect('activate', () => {
                this._menu.close();
                this._wsNames.rename(this._ws.currentIndex, workspace.name as string);
            });
            this._recentWorkspacesSection.addMenuItem(button);
        });
    }

    private _initHiddenWorkspaces(): void {
        if (this._settings.showEmptyWorkspaces.value || this._settings.dynamicWorkspaces.value) {
            return;
        }
        const hiddenWorkspaces = this._ws.workspaces.filter(
            (workspace) =>
                workspace.isEnabled &&
                !workspace.hasWindows &&
                workspace.index !== this._ws.currentIndex,
        );
        if (hiddenWorkspaces.length > 0) {
            const section = new PopupMenu.PopupMenuSection();
            const separator = new PopupMenu.PopupSeparatorMenuItem('Hidden workspaces');
            separator.label.add_style_class_name('workspaces-bar-menu-heading');
            section.addMenuItem(separator);
            hiddenWorkspaces.forEach((workspace) => {
                const button = new PopupMenu.PopupMenuItem(this._ws.getDisplayName(workspace));
                button.connect('activate', () => {
                    this._menu.close();
                    this._ws.activate(workspace.index);
                });
                section.addMenuItem(button);
            });
            this._menu.addMenuItem(section);
        }
    }

    // update the workspaces bar
    private _update_ws() {
        this._refreshMenu();
        // destroy old workspaces bar buttons
        this._wsBar.destroy_all_children();

        // display all current workspaces buttons
        for (let ws_index = 0; ws_index < this._ws.numberOfEnabledWorkspaces; ++ws_index) {
            const workspace = this._ws.workspaces[ws_index];
            // Skip empty workspaces when _showEmptyWorkspaces is false.
            if (
                !this._settings.showEmptyWorkspaces.value &&
                !workspace.hasWindows &&
                ws_index !== this._ws.currentIndex
            ) {
                continue;
            }
            // Don't show the last workspace when workspaces are dynamic and we already show the
            // add-workspace button.
            if (
                this._settings.showNewWorkspaceButton.value &&
                this._settings.dynamicWorkspaces.value &&
                ws_index === this._ws.numberOfEnabledWorkspaces - 1 &&
                ws_index !== this._ws.currentIndex
            ) {
                continue;
            }
            const ws_box = new St.Bin({
                visible: true,
                reactive: true,
                can_focus: true,
                track_hover: true,
                style_class: 'workspace-box',
            });
            const label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'desktop-label',
            });
            if (ws_index == this._ws.currentIndex) {
                label.style_class += ' desktop-label-active';
            } else {
                label.style_class += ' desktop-label-inactive';
            }
            if (workspace.hasWindows) {
                label.style_class += ' desktop-label-nonempty';
            } else {
                label.style_class += ' desktop-label-empty';
            }
            label.set_text(this._ws.getDisplayName(workspace));
            ws_box.set_child(label);
            ws_box.connect('button-press-event', (actor, event: Clutter.Event) => {
                switch (event.get_button()) {
                    case 1:
                        this._ws.activate(ws_index);
                        return Clutter.EVENT_STOP;
                    case 2:
                        this._ws.removeWorkspace(ws_index);
                        return Clutter.EVENT_STOP;
                    case 3:
                        return Clutter.EVENT_PROPAGATE;
                }
            });
            this._wsBar.add_actor(ws_box);
        }
    }
}

const PopupMenuItemEntry = GObject.registerClass(
    class PopupMenuItem extends PopupMenu.PopupBaseMenuItem {
        _init(params: any) {
            super._init(params);
            this.entry = new St.Entry({
                x_expand: true,
            });
            this.entry.connect('button-press-event', () => {
                return Clutter.EVENT_STOP;
            });
            this.add_child(this.entry);
        }
    },
);
