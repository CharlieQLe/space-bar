import type { Adw } from 'imports/gi';
import { BehaviorPage } from 'preferences/BehaviorPage';
import { ShortcutsPage } from 'preferences/ShortcutsPage';

function init() {}

function fillPreferencesWindow(window: Adw.PreferencesWindow) {
    [new BehaviorPage(), new ShortcutsPage()].forEach((pageObject) => {
        pageObject.window = window;
        pageObject.init();
        window.add(pageObject.page);
    });
}
