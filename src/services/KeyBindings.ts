'use strict';

const { Shell, Meta} = imports.gi;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { getSettings } = Me.imports.services.Settings;
const { WorkspacesState } = Me.imports.services.WorkspacesState;

var KeyBindings = class KeyBindings {
  _settings = getSettings();
  _ws = WorkspacesState.getInstance();
  _addedKeyBindings = [];

  init() {
    this._addActivateKeys();
  }

  destroy() {
    for (const name in this._addedKeyBindings) {
      this._removeKeybinding(name);
    }
    this._addedKeyBindings = [];
  }

  _addKeyBinding(name, handler) {
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

  _removeKeybinding(name) {
    Main.wm.removeKeybinding(name);
  }

  _addActivateKeys() {
    for (let i = 0; i < 10; i++) {
      this._addKeyBinding(`activate-${i + 1}-key`, () => {
        this._ws.activate(i);
      });
    }
    this._addKeyBinding('activate-previous-key', () => {
      this._ws.activatePrevious();
    });
  }
};
