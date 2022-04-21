import { BehaviorPage } from 'preferences/BehaviorPage';
import { ShortcutsPage } from 'preferences/ShortcutsPage';

function init() {}

function fillPreferencesWindow(window: any) {
    [new BehaviorPage(), new ShortcutsPage()].forEach((pageObject) => {
        pageObject.init();
        window.add(pageObject.page);
    });
}
