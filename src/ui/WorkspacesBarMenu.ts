import { Clutter, GObject, St } from 'imports/gi';
import { KeyBindings } from 'services/KeyBindings';
import { Settings } from 'services/Settings';
import { WorkspaceNames } from 'services/WorkspaceNames';
import { Workspaces } from 'services/Workspaces';
const PopupMenu = imports.ui.popupMenu;

export class WorkspacesBarMenu {
    private readonly _keyBindings = KeyBindings.getInstance();
    private readonly _settings = Settings.getInstance();
    private readonly _ws = Workspaces.getInstance();
    private readonly _wsNames = WorkspaceNames.getInstance();

    private _recentWorkspacesSection = new PopupMenu.PopupMenuSection();
    private _hiddenWorkspacesSection = new PopupMenu.PopupMenuSection();

    constructor(private readonly _menu: any) {}

    init(): void {
        this._menu.box.add_style_class_name('workspaces-bar-menu');
        this._addSectionHeading('Rename current workspace');
        this._initEntry();
        this._menu.addMenuItem(this._recentWorkspacesSection);
        this._menu.addMenuItem(this._hiddenWorkspacesSection);
        this._menu.connect('open-state-changed', () => {
            if (this._menu.isOpen) {
                this._refreshMenu();
            }
        });
        this._keyBindings.addKeyBinding('open-menu', () => this._menu.open());
    }

    private _refreshMenu() {
        this._refreshRecentWorkspaces();
        this._refreshHiddenWorkspaces();
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

    private _refreshHiddenWorkspaces(): void {
        this._hiddenWorkspacesSection.box.destroy_all_children();

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
            this._addSectionHeading('Hidden workspaces', this._hiddenWorkspacesSection);
            hiddenWorkspaces.forEach((workspace) => {
                const button = new PopupMenu.PopupMenuItem(this._ws.getDisplayName(workspace));
                button.connect('activate', () => {
                    this._menu.close();
                    this._ws.activate(workspace.index);
                });
                this._hiddenWorkspacesSection.addMenuItem(button);
            });
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
