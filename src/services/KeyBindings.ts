import { Meta, Shell } from 'imports/gi';
import { Settings } from 'services/Settings';
import { Workspaces } from 'services/Workspaces';
const Main = imports.ui.main;

export class KeyBindings {
    private static _instance: KeyBindings | null;

    static init() {
        KeyBindings._instance = new KeyBindings();
        KeyBindings._instance.init();
    }

    static destroy() {
        KeyBindings._instance?.destroy();
        KeyBindings._instance = null;
    }

    static getInstance(): KeyBindings {
        return KeyBindings._instance as KeyBindings;
    }

    private readonly _settings = Settings.getInstance().extensionSettings;
    private readonly _ws = Workspaces.getInstance();
    private _addedKeyBindings: string[] = [];

    init() {
        this._addActivateKeys();
        KeyBindings._instance = this;
    }

    destroy() {
        for (const name of this._addedKeyBindings) {
            this._removeKeybinding(name);
        }
        this._addedKeyBindings = [];
    }

    addKeyBinding(name: string, handler: () => void) {
        Shell.ActionMode;
        Main.wm.addKeybinding(
            name,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            handler,
        );
        this._addedKeyBindings.push(name);
    }

    private _removeKeybinding(name: string) {
        Main.wm.removeKeybinding(name);
    }

    private _addActivateKeys() {
        for (let i = 0; i < 10; i++) {
            this.addKeyBinding(`activate-${i + 1}-key`, () => {
                this._ws.activate(i, { focusWindowIfCurrentWorkspace: true });
            });
        }
        this.addKeyBinding('activate-previous-key', () => {
            this._ws.activatePrevious();
        });
    }
}
